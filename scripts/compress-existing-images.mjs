#!/usr/bin/env node
/**
 * compress-existing-images.mjs
 *
 * One-off maintenance script: downscales/re-encodes product and molecule images
 * that were uploaded before the client-side compression fix and are still
 * stored as oversized base64 data URLs. These blow past Next.js's 2MB
 * unstable_cache entry limit (silently disabling caching on every product/
 * molecule page) and bloat every page response, which is what causes
 * intermittent "temporarily unavailable" failures under load.
 *
 * Safe to re-run: it skips rows whose images are already under the target size.
 *
 * Run: node scripts/compress-existing-images.mjs
 * (requires `sharp` — installed as a devDependency; `pnpm add -D sharp` first
 * if running against a deploy that skipped devDependencies)
 */
import { PrismaClient } from "@prisma/client"
import sharp from "sharp"

const prisma = new PrismaClient()

const MAX_DIMENSION = 1600
const JPEG_QUALITY = 82
// Only bother re-encoding if we can save at least this many bytes.
const MIN_SAVINGS_BYTES = 50_000

async function compressDataUrl(dataUrl) {
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) return null

  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) return null
  const [, mimeType, base64] = match

  // Re-encoding a GIF or SVG through sharp would strip animation/vector fidelity.
  if (mimeType === "image/gif" || mimeType === "image/svg+xml") return null

  const inputBuffer = Buffer.from(base64, "base64")
  if (inputBuffer.length <= MIN_SAVINGS_BYTES) return null

  const image = sharp(inputBuffer, { failOn: "none" })
  const metadata = await image.metadata()
  const hasAlpha = Boolean(metadata.hasAlpha)

  const resized = image.resize({
    width: MAX_DIMENSION,
    height: MAX_DIMENSION,
    fit: "inside",
    withoutEnlargement: true,
  })

  const outputBuffer = hasAlpha
    ? await resized.png({ compressionLevel: 9 }).toBuffer()
    : await resized.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer()

  if (outputBuffer.length >= inputBuffer.length - MIN_SAVINGS_BYTES) return null

  const outputMimeType = hasAlpha ? "image/png" : "image/jpeg"
  return {
    dataUrl: `data:${outputMimeType};base64,${outputBuffer.toString("base64")}`,
    beforeBytes: inputBuffer.length,
    afterBytes: outputBuffer.length,
  }
}

async function compressProducts() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, imageUrl1: true, imageUrl2: true, imageUrl3: true },
  })

  let totalSaved = 0
  let touched = 0

  for (const product of products) {
    const update = {}
    let saved = 0

    for (const field of ["imageUrl1", "imageUrl2", "imageUrl3"]) {
      const result = await compressDataUrl(product[field]).catch((error) => {
        console.error(`  ! ${product.name} (${product.id}) ${field}: ${error.message}`)
        return null
      })
      if (result) {
        update[field] = result.dataUrl
        saved += result.beforeBytes - result.afterBytes
        console.log(
          `  ${product.name} ${field}: ${(result.beforeBytes / 1024 / 1024).toFixed(2)}MB -> ${(result.afterBytes / 1024 / 1024).toFixed(2)}MB`,
        )
      }
    }

    if (Object.keys(update).length > 0) {
      await prisma.product.update({ where: { id: product.id }, data: update })
      touched += 1
      totalSaved += saved
    }
  }

  console.log(`Products: compressed ${touched}/${products.length}, saved ${(totalSaved / 1024 / 1024).toFixed(2)}MB`)
}

async function compressMolecules() {
  const molecules = await prisma.molecule.findMany({
    select: { id: true, name: true, imageUrl: true },
  })

  let totalSaved = 0
  let touched = 0

  for (const molecule of molecules) {
    const result = await compressDataUrl(molecule.imageUrl).catch((error) => {
      console.error(`  ! ${molecule.name} (${molecule.id}): ${error.message}`)
      return null
    })
    if (result) {
      await prisma.molecule.update({ where: { id: molecule.id }, data: { imageUrl: result.dataUrl } })
      touched += 1
      totalSaved += result.beforeBytes - result.afterBytes
      console.log(
        `  ${molecule.name}: ${(result.beforeBytes / 1024 / 1024).toFixed(2)}MB -> ${(result.afterBytes / 1024 / 1024).toFixed(2)}MB`,
      )
    }
  }

  console.log(`Molecules: compressed ${touched}/${molecules.length}, saved ${(totalSaved / 1024 / 1024).toFixed(2)}MB`)
}

async function main() {
  console.log("Compressing product images...")
  await compressProducts()
  console.log("Compressing molecule images...")
  await compressMolecules()
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
