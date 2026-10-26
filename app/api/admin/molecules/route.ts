import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdminApi, requireAdminMutation } from "@/lib/require-admin";
import { mutationErrorResponse, parseJsonBody } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { createMoleculeSchema } from "@/lib/validators/molecule";
import { mirrorExternalImage } from "@/lib/mirror-image";

function revalidateMoleculePaths(slug?: string) {
  revalidateTag("molecules", "max");
  revalidatePath("/molecules");
  if (slug) {
    revalidatePath(`/molecules/${slug}`);
  }
}

export async function GET() {
  const adminCheck = await requireAdminApi();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const molecules = await prisma.molecule.findMany({
      orderBy: { name: "asc" },
      take: 200,
      select: {
        id: true,
        name: true,
        slug: true,
        synonyms: true,
        imageUrl: true,
        isPublished: true,
        overview: true,
        backgroundAndApproval: true,
        uses: true,
        administration: true,
        sideEffects: true,
        warnings: true,
        precautions: true,
        expertTips: true,
        faqs: true,
        references: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(molecules);
  } catch (error) {
    console.error("Error fetching molecules:", error);
    return NextResponse.json(
      { error: "Failed to fetch molecules" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdminMutation(req);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const parsed = await parseJsonBody(req, createMoleculeSchema);
    if (!parsed.success) return parsed.response;
    const validated = parsed.data;

    const imageUrl = validated.imageUrl && /^https?:\/\//i.test(validated.imageUrl)
      ? await mirrorExternalImage(validated.imageUrl)
      : validated.imageUrl ?? null;
    const molecule = await prisma.molecule.create({
      data: {
        name: validated.name,
        slug: validated.slug,
        synonyms: validated.synonyms,
        imageUrl,
        isPublished: validated.isPublished,
        overview: validated.overview,
        backgroundAndApproval: validated.backgroundAndApproval,
        uses: validated.uses,
        administration: validated.administration,
        sideEffects: validated.sideEffects,
        warnings: validated.warnings,
        precautions: validated.precautions,
        expertTips: validated.expertTips,
        faqs: validated.faqs,
        references: validated.references,
      },
    });

    revalidateMoleculePaths(molecule.slug);

    return NextResponse.json(molecule, { status: 201 });
  } catch (error) {
    console.error("Error creating molecule:", error);
    return mutationErrorResponse(error, "Failed to create molecule");
  }
}
