import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { FadeIn } from "@/components/motion/fade-in";
import { ProductsContent } from "@/components/marketing/products-content";
import { getProductDivision, productDivisions } from "@/lib/divisions";
import { marketingImages } from "@/lib/marketing-images";
import { PageLoading } from "@/components/web/page-loading";
import { getCachedProductsPageData } from "@/lib/catalog-data";
import { getSiteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

type Props = {
  searchParams: Promise<{ division?: string; q?: string; page?: string }>;
};

function parsePage(value: string | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  try {
    const { division } = await searchParams;
    const d = division ? getProductDivision(division) : undefined;
    const base = getSiteUrl();
    if (d) {
      const url = `${base}/products?division=${d.slug}`;
      return {
        title: `${d.title} products — catalog`,
        description: `Browse ${d.title.toLowerCase()} medicines from SSG Pharma. ${d.blurb}`,
        alternates: { canonical: url },
      };
    }
    return {
      title: "Medicine catalog — wholesale pharmaceutical supply",
      description:
        "Browse specialty medicines, salts, prices, and stock status. Wholesale supply for hospitals, clinics, and pharmacies across India.",
      alternates: { canonical: `${base}/products` },
    };
  } catch {
    return {
      title: "Medicine catalog",
      description: "Browse specialty medicines from SSG Pharma.",
    };
  }
}

export default async function ProductsPage({ searchParams }: Props) {
  const { division: divisionSlug, q, page: pageParam } = await searchParams;
  const division = divisionSlug ? getProductDivision(divisionSlug) : undefined;
  const query = q?.trim() ?? "";
  const page = parsePage(pageParam);

  return (
    <>
      <section className="relative w-full border-b border-border/60 bg-muted/20">
        <div className="mx-auto grid max-w-[1400px] md:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center px-4 py-12 md:px-8 lg:px-12 lg:py-16">
            <FadeIn>
              <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight md:text-5xl lg:text-6xl">
                {division ? `${division.title} catalog` : "Product catalog"}
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground leading-relaxed">
                {division
                  ? division.blurb
                  : "Explore our specialized pharmaceutical portfolio across six critical healthcare domains. Each category features rigorously sourced, high quality medicines from leading manufacturers."}
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                <Link
                  href="/products"
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                    !division ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80",
                  )}
                >
                  All
                </Link>
                {productDivisions.map((d) => (
                  <Link
                    key={d.slug}
                    href={`/products?division=${d.slug}`}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                      division?.slug === d.slug
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80",
                    )}
                  >
                    {d.title}
                  </Link>
                ))}
              </div>
            </FadeIn>
          </div>
          <div className="relative hidden min-h-[280px] md:block">
            <Image
              src={division?.imageSrc ?? marketingImages.warehouse}
              alt={division?.imageAlt ?? "Pharmaceutical warehouse and wholesale medicine storage"}
              fill
              className="object-cover"
              sizes="45vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <Suspense key={`${divisionSlug ?? "all"}-${query}-${page}`} fallback={<PageLoading title="Loading products" />}>
        <ProductsResults divisionSlug={divisionSlug} query={query} page={page} />
      </Suspense>
    </>
  );
}

async function ProductsResults({ divisionSlug, query, page }: { divisionSlug?: string; query: string; page: number }) {
  const data = await getCachedProductsPageData({ divisionSlug, query, page }).catch((error) => {
    console.error("Failed to load products page data", error);
    return null;
  });
  if (!data) {
    return (
      <section className="mx-auto max-w-[1400px] px-4 py-16 md:px-6">
        <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">Product catalog</h2>
        <p className="mt-4 text-muted-foreground">The catalog is temporarily unavailable. Please try again shortly.</p>
      </section>
    );
  }

  return (
    <ProductsContent
      items={data.items}
      division={data.division ?? undefined}
      initialQuery={data.query}
      page={data.page}
      totalCount={data.totalCount}
      totalPages={data.totalPages}
    />
  );
}
