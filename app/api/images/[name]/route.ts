import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { sniffImage } from "@/lib/image-storage";

export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!/^[a-f0-9-]+\.(png|jpg|webp)$/.test(name)) return new NextResponse(null, { status: 404 });
  try {
    const body = await readFile(path.join(path.resolve(process.env.UPLOADS_DIR ?? "data/uploads"), name));
    const type = sniffImage(body);
    if (!type) return new NextResponse(null, { status: 404 });
    return new NextResponse(body, { headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
  } catch { return new NextResponse(null, { status: 404 }); }
}
