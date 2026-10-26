import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function main() {
  const tables = ["Product", "Molecule", "ProductMolecule", "Category", "AdminUser", "ContactConfig", "ContactPhone", "ContactEmail", "Inquiry"] as const;
  for (const table of tables) {
    const result = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(`SELECT COUNT(*) AS count FROM "${table}"`);
    console.log(`${table}: ${result[0]?.count?.toString() ?? "0"}`);
  }
  const products = await prisma.product.findMany({ select: { name: true, slug: true }, orderBy: { slug: "asc" }, take: 5 });
  const molecules = await prisma.molecule.findMany({ select: { name: true, slug: true }, orderBy: { slug: "asc" }, take: 5 });
  console.log("Product spot checks:", JSON.stringify(products));
  console.log("Molecule spot checks:", JSON.stringify(molecules));
}
main().catch((error) => { console.error("Data verification failed:", error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
