import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export type ImageMime = "image/png" | "image/jpeg" | "image/webp";
const extensions: Record<ImageMime, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

export function sniffImage(buffer: Buffer): ImageMime | null {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return "image/png";
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return null;
}

function s3Client() {
  const region = process.env.AWS_REGION;
  if (!region || !process.env.S3_BUCKET) throw new Error("S3 storage requires AWS_REGION and S3_BUCKET");
  if (!process.env.NEXT_PUBLIC_CDN_URL) throw new Error("S3 storage requires NEXT_PUBLIC_CDN_URL for public image delivery");
  return new S3Client({ region, ...(process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT, forcePathStyle: true } : {}) });
}

export async function putImage(buffer: Buffer, mime: ImageMime): Promise<string> {
  const key = `images/${randomUUID()}.${extensions[mime]}`;
  if ((process.env.STORAGE_DRIVER ?? "local") === "s3") {
    await s3Client().send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, Body: buffer, ContentType: mime }));
    return key;
  }
  if ((process.env.STORAGE_DRIVER ?? "local") !== "local") throw new Error("STORAGE_DRIVER must be local or s3");
  const root = path.resolve(process.env.UPLOADS_DIR ?? "data/uploads");
  await mkdir(root, { recursive: true });
  await writeFile(path.join(root, path.basename(key)), buffer, { flag: "wx", mode: 0o640 });
  return `/api/images/${path.basename(key)}`;
}

export async function deleteImage(key: string): Promise<void> {
  if (key.startsWith("data:image/")) return;
  if (key.startsWith("/api/images/")) {
    const name = path.basename(key);
    await unlink(path.join(path.resolve(process.env.UPLOADS_DIR ?? "data/uploads"), name)).catch((error: NodeJS.ErrnoException) => { if (error.code !== "ENOENT") throw error; });
  } else if ((process.env.STORAGE_DRIVER ?? "local") === "s3" && key.startsWith("images/")) {
    await s3Client().send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
  }
}

export function publicUrl(key: string): string {
  if (/^(https?:|data:|\/)/i.test(key)) return key;
  const cdn = process.env.NEXT_PUBLIC_CDN_URL?.replace(/\/$/, "");
  if (cdn) return `${cdn}/${key.split("/").map(encodeURIComponent).join("/")}`;
  if ((process.env.STORAGE_DRIVER ?? "local") === "s3") throw new Error("S3 image delivery requires NEXT_PUBLIC_CDN_URL");
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  return `${base}/api/images/${encodeURIComponent(path.basename(key))}`;
}
