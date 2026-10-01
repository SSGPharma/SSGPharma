#!/usr/bin/env node
/**
 * standalone-setup.mjs
 * Copies static assets into the standalone output directory after `next build`.
 * Run: node scripts/standalone-setup.mjs
 */
import { cpSync, existsSync, mkdirSync } from "fs"
import { join, resolve } from "path"

const root = resolve(process.cwd())
const standalone = join(root, ".next", "standalone")
const staticSrc = join(root, ".next", "static")
const staticDst = join(standalone, ".next", "static")
const publicSrc = join(root, "public")
const publicDst = join(standalone, "public")

if (!existsSync(standalone)) {
  console.error("ERROR: .next/standalone not found. Run `next build` first.")
  process.exit(1)
}

console.log("Copying .next/static → standalone/.next/static")
mkdirSync(staticDst, { recursive: true })
cpSync(staticSrc, staticDst, { recursive: true })

console.log("Copying public/ → standalone/public")
mkdirSync(publicDst, { recursive: true })
cpSync(publicSrc, publicDst, { recursive: true })

// Copy Prisma query engine binary so standalone server can connect to SQLite
const prismaSrc = join(root, "node_modules", ".prisma", "client")
const prismaDst = join(standalone, "node_modules", ".prisma", "client")
if (existsSync(prismaSrc)) {
  console.log("Copying .prisma/client → standalone/node_modules/.prisma/client")
  mkdirSync(prismaDst, { recursive: true })
  cpSync(prismaSrc, prismaDst, { recursive: true })
}

console.log("Standalone setup complete.")
