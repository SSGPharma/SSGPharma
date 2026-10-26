import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdminApi, requireAdminMutation } from "@/lib/require-admin";
import { mutationErrorResponse, parseJsonBody } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { updateMoleculeSchema } from "@/lib/validators/molecule";
import { mirrorExternalImage } from "@/lib/mirror-image";

type RouteContext = { params: Promise<{ id: string }> };

function revalidateMoleculePaths(slug?: string) {
  revalidateTag("molecules", "max");
  revalidatePath("/molecules");
  if (slug) {
    revalidatePath(`/molecules/${slug}`);
  }
}

export async function GET(
  req: NextRequest,
  { params }: RouteContext
) {
  const adminCheck = await requireAdminApi();
  if (adminCheck instanceof NextResponse) return adminCheck;
  const { id } = await params;
  try {
    const molecule = await prisma.molecule.findUnique({
      where: { id },
    });

    if (!molecule) {
      return NextResponse.json(
        { error: "Molecule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(molecule);
  } catch (error) {
    console.error("Error fetching molecule:", error);
    return NextResponse.json(
      { error: "Failed to fetch molecule" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteContext
) {
  const adminCheck = await requireAdminMutation(req);
  if (adminCheck instanceof NextResponse) return adminCheck;
  const { id } = await params;

  try {
    const parsed = await parseJsonBody(req, updateMoleculeSchema);
    if (!parsed.success) return parsed.response;
    const validated = parsed.data;

    const existing = await prisma.molecule.findUnique({
      where: { id },
      select: { slug: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Molecule not found" },
        { status: 404 }
      );
    }

    const imageUrl = validated.imageUrl && /^https?:\/\//i.test(validated.imageUrl)
      ? await mirrorExternalImage(validated.imageUrl)
      : validated.imageUrl ?? null;
    const molecule = await prisma.molecule.update({
      where: { id },
      data: {
        ...validated,
        imageUrl,
      },
    });

    revalidateMoleculePaths(existing.slug);
    revalidateMoleculePaths(molecule.slug);

    return NextResponse.json(molecule);
  } catch (error) {
    console.error("Error updating molecule:", error);
    return mutationErrorResponse(error, "Failed to update molecule");
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: RouteContext
) {
  const adminCheck = await requireAdminMutation(req);
  if (adminCheck instanceof NextResponse) return adminCheck;
  const { id } = await params;

  try {
    const existing = await prisma.molecule.findUnique({
      where: { id },
      select: { slug: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Molecule not found" },
        { status: 404 }
      );
    }

    await prisma.molecule.delete({
      where: { id },
    });

    revalidateMoleculePaths(existing.slug);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting molecule:", error);
    return mutationErrorResponse(error, "Failed to delete molecule");
  }
}
