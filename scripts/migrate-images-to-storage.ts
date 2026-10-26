import "server-only";
import { PrismaClient } from "@prisma/client";
import { MAX_IMAGE_BYTES, putImage, sniffImage } from "../lib/image-storage";

const apply = process.argv.includes("--apply");
const prisma = new PrismaClient();

function decodeDataUrl(value: string) {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([a-zA-Z0-9+/=]+)$/.exec(value);
  if (!match) return null;
  const declaredMime = match[1];
  const encoded = match[2];
  if (!declaredMime || !encoded) return null;
  const buffer = Buffer.from(encoded, "base64");
  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) throw new Error("Data URL is empty or exceeds the 2 MB limit");
  const mime = sniffImage(buffer);
  if (mime !== declaredMime) throw new Error("Data URL content does not match its declared image type");
  return { buffer, mime };
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const products = await prisma.product.findMany({ select: { id: true, imageUrl1: true, imageUrl2: true, imageUrl3: true } });
  const molecules = await prisma.molecule.findMany({ select: { id: true, imageUrl: true } });
  let count = 0;
  for (const product of products) for (const field of ["imageUrl1", "imageUrl2", "imageUrl3"] as const) if (product[field]?.startsWith("data:")) count++;
  for (const molecule of molecules) if (molecule.imageUrl?.startsWith("data:")) count++;
  console.log(`${apply ? "Applying" : "Dry run:"} ${count} inline image migration(s) for ${products.length} products and ${molecules.length} molecules.`);
  if (!apply) { console.log("No changes made. Run with --apply to upload images and update image references."); return; }
  for (const product of products) {
    const data: Record<string, string> = {};
    for (const field of ["imageUrl1", "imageUrl2", "imageUrl3"] as const) {
      const value = product[field]; if (!value?.startsWith("data:")) continue;
      const decoded = decodeDataUrl(value); if (!decoded) throw new Error(`Unsupported inline image on product ${product.id}`);
      data[field] = await putImage(decoded.buffer, decoded.mime);
    }
    if (Object.keys(data).length) await prisma.product.update({ where: { id: product.id }, data });
  }
  for (const molecule of molecules) {
    const value = molecule.imageUrl; if (!value?.startsWith("data:")) continue;
    const decoded = decodeDataUrl(value); if (!decoded) throw new Error(`Unsupported inline image on molecule ${molecule.id}`);
    await prisma.molecule.update({ where: { id: molecule.id }, data: { imageUrl: await putImage(decoded.buffer, decoded.mime) } });
  }
  console.log("Image paths updated.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
