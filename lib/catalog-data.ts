import { unstable_cache } from "next/cache";
import type { Prisma } from "@prisma/client";
import { getProductDivision, type ProductDivision } from "@/lib/divisions";
import { marketingImages } from "@/lib/marketing-images";
import { prisma } from "@/lib/prisma";

export const PRODUCT_PAGE_SIZE = 20;

export const productListSelect = {
  id: true,
  slug: true,
  name: true,
  salts: true,
  manufacturer: true,
  description: true,
  imageUrl1: true,
  imageUrl2: true,
  imageUrl3: true,
  isActive: true,
  pricePaise: true,
  priceSuffix: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.ProductSelect;

export const compactProductSelect = {
  id: true,
  slug: true,
  name: true,
  manufacturer: true,
  dosage: true,
  description: true,
  pricePaise: true,
  priceSuffix: true,
  category: {
    select: {
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.ProductSelect;

function clampPage(page: number | null | undefined) {
  return Math.max(1, Math.floor(page || 1));
}

export type DivisionMeta = ProductDivision & { isCurated: boolean; categoryIds: string[] };

/**
 * Loosely compares a category's name/slug against a curated division's
 * identifiers: case, whitespace, punctuation, and a trailing "division"
 * word are all ignored. This exists because admins have created categories
 * like "Oncology Division" / "oncology-division" that were meant to power
 * the Oncology division page but didn't exactly match "Oncology" / "oncology"
 * — an exact-string match silently showed those products on /products but
 * never on /divisions/oncology. See docs/category-divisions.md.
 */
function normalizeDivisionKey(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function matchesCuratedDivision(division: ProductDivision, candidate: { name: string; slug: string }) {
  const targets = [division.slug, division.catalogCategory, division.title].map(normalizeDivisionKey);
  const candidates = [candidate.slug, candidate.name].map(normalizeDivisionKey);

  return candidates.some(
    (value) => targets.includes(value) || targets.some((target) => value === `${target}division`),
  );
}

/**
 * Resolves a division/category page identifier against the curated marketing
 * divisions first, then falls back to whatever category actually exists in
 * the database. Without this fallback, any admin-created category that isn't
 * one of the six hardcoded divisions can never appear on a category page.
 */
export async function resolveDivisionMeta(identifier: string | null | undefined): Promise<DivisionMeta | null> {
  if (!identifier) return null;

  const curated = getProductDivision(identifier);
  if (curated) {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
    });
    const categoryIds = categories.filter((category) => matchesCuratedDivision(curated, category)).map((category) => category.id);

    return { ...curated, isCurated: true, categoryIds };
  }

  const normalized = identifier.trim().toLowerCase();
  if (!normalized) return null;

  const category = await prisma.category.findFirst({ where: { slug: normalized, isActive: true } });
  if (!category) return null;

  return {
    slug: category.slug,
    title: category.name,
    catalogCategory: category.name,
    blurb: `Browse ${category.name.toLowerCase()} medicines from SSG Pharma — authentic products for hospitals and pharmacies.`,
    imageSrc: marketingImages.warehouse,
    imageAlt: `${category.name} medicines from SSG Pharma`,
    isCurated: false,
    categoryIds: [category.id],
  };
}

function buildProductWhere(division: DivisionMeta | null, query?: string): Prisma.ProductWhereInput {
  const normalizedQuery = query?.trim() ?? "";

  return {
    ...(division ? { categoryId: { in: division.categoryIds } } : {}),
    ...(normalizedQuery
      ? {
          OR: [
            { name: { contains: normalizedQuery } },
            { salts: { contains: normalizedQuery } },
            { manufacturer: { contains: normalizedQuery } },
            { category: { is: { name: { contains: normalizedQuery } } } },
          ],
        }
      : {}),
  };
}

export const getCachedHomepageProducts = unstable_cache(
  async () => {
    const [products, productCount] = await Promise.all([
      prisma.product.findMany({
        orderBy: [{ isActive: "desc" }, { name: "asc" }],
        take: 80,
        select: compactProductSelect,
      }),
      prisma.product.count(),
    ]);

    return { products, productCount };
  },
  ["homepage-products"],
  { revalidate: 3600, tags: ["products"] },
);

export const getCachedProductsPageData = unstable_cache(
  async ({ divisionSlug, query, page }: { divisionSlug?: string; query?: string; page?: number }) => {
    const normalizedQuery = query?.trim() ?? "";
    const currentPage = clampPage(page);
    const division = await resolveDivisionMeta(divisionSlug);
    const where = buildProductWhere(division, normalizedQuery);

    const [items, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: [{ isActive: "desc" }, { name: "asc" }],
        skip: (currentPage - 1) * PRODUCT_PAGE_SIZE,
        take: PRODUCT_PAGE_SIZE,
        select: productListSelect,
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalCount / PRODUCT_PAGE_SIZE));

    return {
      division,
      items,
      query: normalizedQuery,
      page: Math.min(currentPage, totalPages),
      totalCount,
      totalPages,
    };
  },
  ["products-page-data"],
  { revalidate: 3600, tags: ["products"] },
);

export const getCachedDivisionProducts = unstable_cache(
  async ({ slug, page }: { slug: string; page?: number }) => {
    const division = await resolveDivisionMeta(slug);
    if (!division) return null;

    const currentPage = clampPage(page);
    const where = buildProductWhere(division);

    const [items, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: [{ isActive: "desc" }, { name: "asc" }],
        skip: (currentPage - 1) * PRODUCT_PAGE_SIZE,
        take: PRODUCT_PAGE_SIZE,
        select: productListSelect,
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalCount / PRODUCT_PAGE_SIZE));

    return {
      division,
      items,
      page: Math.min(currentPage, totalPages),
      totalCount,
      totalPages,
    };
  },
  ["division-products"],
  { revalidate: 3600, tags: ["products"] },
);
