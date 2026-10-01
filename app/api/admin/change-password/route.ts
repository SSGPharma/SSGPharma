import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { adminPasswordMatches } from "@/lib/auth-password";
import { prisma } from "@/lib/prisma";
import { requireAdminMutation } from "@/lib/require-admin";

type ChangePasswordBody = {
  currentPassword?: string;
  newPassword?: string;
};

export async function POST(request: Request) {
  const denied = await requireAdminMutation(request);
  if (denied) return denied;

  let body: ChangePasswordBody;
  try {
    body = (await request.json()) as ChangePasswordBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const currentPassword = body.currentPassword?.trim() ?? "";
  const newPassword = body.newPassword?.trim() ?? "";

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  try {
    const admin = await prisma.adminUser.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });

    if (!admin) {
      const envPassword = (process.env.ADMIN_PASSWORD ?? "").trim();
      if (!envPassword || !(await adminPasswordMatches(currentPassword, envPassword))) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);
      await prisma.adminUser.create({
        data: {
          email: "admin@medipro.local",
          name: "Admin",
          passwordHash,
          role: "admin",
        },
      });

      return NextResponse.json({ success: true });
    }

    const passwordOk = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!passwordOk) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}
