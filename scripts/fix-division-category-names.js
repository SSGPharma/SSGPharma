// One-off fix for categories that were created as "X Division" / "x-division"
// instead of the canonical names/slugs the division pages match against
// (see lib/divisions.ts and docs/category-divisions.md).
//
// Run on the Render shell, from the project root (/opt/render/project/src or
// wherever the app lives), with the real production DATABASE_URL already set
// in the environment:
//
//   node scripts/fix-division-category-names.js
//
// Safe to re-run: it only touches categories whose current slug matches one
// of the "-division" entries below, and skips anything already renamed.

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Maps the mistaken slug -> the canonical { name, slug } the curated
// division pages (lib/divisions.ts) actually match against.
const RENAMES = {
  "oncology-division": { name: "Oncology", slug: "oncology" },
  "rheumatology-division": { name: "Rheumatology", slug: "rheumatology" },
  "diabetes-division": { name: "Diabetes", slug: "diabetes" },
  "nephrology-division": { name: "Nephrology", slug: "nephrology" },
  "antibiotics-division": { name: "Antibiotics", slug: "antibiotics" },
  "vaccines-division": { name: "Vaccines", slug: "vaccines" },
};

async function main() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true },
  });

  const results = [];

  for (const category of categories) {
    const target = RENAMES[category.slug];
    if (!target) continue;

    if (category.name === target.name && category.slug === target.slug) {
      results.push({ id: category.id, status: "already-correct", ...target });
      continue;
    }

    const collision = await prisma.category.findFirst({
      where: {
        id: { not: category.id },
        OR: [{ name: target.name }, { slug: target.slug }],
      },
    });

    if (collision) {
      results.push({
        id: category.id,
        status: "skipped-collision",
        from: `${category.name} / ${category.slug}`,
        collidesWith: `${collision.name} / ${collision.slug}`,
      });
      continue;
    }

    await prisma.category.update({
      where: { id: category.id },
      data: { name: target.name, slug: target.slug },
    });

    results.push({
      id: category.id,
      status: "renamed",
      from: `${category.name} / ${category.slug}`,
      to: `${target.name} / ${target.slug}`,
    });
  }

  console.log(JSON.stringify(results, null, 2));

  const renamed = results.filter((r) => r.status === "renamed").length;
  console.log(`\n${renamed} category(ies) renamed.`);
  if (renamed > 0) {
    console.log(
      "Data cache is tag-based (revalidate: 3600, tag 'products'), so a raw DB write like this won't bust it immediately.",
    );
    console.log(
      "Restart the Render service (or wait up to 1 hour) so division pages pick up the change right away.",
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
