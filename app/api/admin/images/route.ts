import { NextResponse } from "next/server";
import { requireAdminMutation } from "@/lib/require-admin";
import { MAX_IMAGE_BYTES, putImage, sniffImage } from "@/lib/image-storage";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function POST(request: Request) {
  const denied = await requireAdminMutation(request);
  if (denied) return denied;
  const type = request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
  if (!type || !["image/png", "image/jpeg", "image/webp"].includes(type)) return NextResponse.json({ error: "Upload a PNG, JPEG, or WebP image." }, { status: 415 });
  const declaredSize = Number(request.headers.get("content-length") ?? 0);
  if (declaredSize > MAX_IMAGE_BYTES) return NextResponse.json({ error: "Image must be 2 MB or smaller." }, { status: 413 });
  const reader = request.body?.getReader();
  if (!reader) return NextResponse.json({ error: "Image body is required." }, { status: 400 });
  const chunks: Buffer[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > MAX_IMAGE_BYTES) {
      await reader.cancel();
      return NextResponse.json({ error: "Image must be 2 MB or smaller." }, { status: 413 });
    }
    chunks.push(Buffer.from(value));
  }
  const bytes = Buffer.concat(chunks, length);
  if (bytes.length > MAX_IMAGE_BYTES) return NextResponse.json({ error: "Image must be 2 MB or smaller." }, { status: 413 });
  const mime = sniffImage(bytes);
  if (!mime || mime !== type) return NextResponse.json({ error: "Image content does not match an allowed image type." }, { status: 415 });
  try { return NextResponse.json({ key: await putImage(bytes, mime) }); }
  catch (error) { console.error("Image upload failed", error); return NextResponse.json({ error: "Image upload failed." }, { status: 500 }); }
}
