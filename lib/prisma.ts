import { PrismaClient } from "@prisma/client"
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const rawDatabaseUrl = process.env.DATABASE_URL ?? "file:./dev.db"
const isSqlite = rawDatabaseUrl.startsWith("file:")
// SQLite defaults to a 0ms busy_timeout, so any read that overlaps an admin
// write throws "database is locked" instead of waiting — pin the connection
// pool to 1 and set a real timeout so overlapping requests queue instead of failing.
const datasourceUrl =
  isSqlite && !rawDatabaseUrl.includes("connection_limit") ? `${rawDatabaseUrl}?connection_limit=1` : rawDatabaseUrl

const isFreshClient = !globalForPrisma.prisma
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ datasourceUrl, log: process.env.NODE_ENV === "development" ? ["error"] : ["error"] })
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

if (isSqlite && isFreshClient) {
  // PRAGMA statements return a row in SQLite, so $queryRawUnsafe (not $executeRawUnsafe) is required.
  void prisma.$queryRawUnsafe("PRAGMA journal_mode = WAL;").catch((error) => {
    console.error("Failed to set SQLite journal_mode=WAL", error)
  })
  void prisma.$queryRawUnsafe("PRAGMA busy_timeout = 5000;").catch((error) => {
    console.error("Failed to set SQLite busy_timeout", error)
  })
}
