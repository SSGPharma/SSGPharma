import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DivisionProductsList } from "@/components/marketing/division-products-list";
import { FadeIn } from "@/components/motion/fade-in";
import { PageLoading } from "@/components/web/page-loading";
import { getCachedDivisionProducts, resolveDivisionMeta } from "@/lib/catalog-data";
import { getSiteUrl } from "@/lib/site-url";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> };

export const revalidate = 3600;

function parsePage(value: string | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const d = await resolveDivisionMeta(slug);
  if (!d) return {};
  const base = getSiteUrl();
  const url = `${base}/divisions/${slug}`;
  return {
    title: `${d.title} medicines — wholesale & hospital supply`,
    description: `${d.blurb} Browse ${d.title.toLowerCase()} lines from SSG Pharma — authentic medicines for hospitals and pharmacies in India.`,
    alternates: { canonical: url },
    openGraph: {
      title: `${d.title} division · SSG Pharma`,
      description: d.blurb,
      url,
      images: [{ url: d.imageSrc, alt: d.imageAlt }],
    },
  };
}

export default async function DivisionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const division = await resolveDivisionMeta(slug);
  if (!division) notFound();
  const page = parsePage(pageParam);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${division.title} medicines`,
    description: division.blurb,
    url: `${getSiteUrl()}/divisions/${slug}`,
    isPartOf: { "@type": "WebSite", name: "SSG Pharma", url: getSiteUrl() },
  };

  return (
    <>
      <script
        id={`division-json-ld-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <section className="relative w-full">
        <div className="relative mx-auto grid max-w-[1400px] gap-0 md:grid-cols-2">
          <div className="relative min-h-[280px] md:min-h-[380px]">
            <Image
              src={division.imageSrc}
              alt={division.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent md:bg-gradient-to-r" />
          </div>
          <div className="flex flex-col justify-center px-4 py-12 md:px-12 lg:px-16">
            <FadeIn>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Division</p>
              <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight md:text-5xl">
                {division.title}
              </h1>
              <p className="mt-4 max-w-xl text-lg text-muted-foreground leading-relaxed">{division.blurb}</p>
              <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
                Tag medicines in admin with category <strong className="text-foreground">{division.catalogCategory}</strong>{" "}
                so they appear in this list. That keeps your public SEO pages aligned with your catalog.
              </p>
              <Link href="/products" className="mt-8 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline">
                View full catalog →
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-4 py-14 md:px-6">
        <Suspense key={`${slug}-${page}`} fallback={<PageLoading title={`${division.title} products`} />}>
          <DivisionProductsSection slug={slug} page={page} />
        </Suspense>
      </div>
    </>
  );
}

async function DivisionProductsSection({ slug, page }: { slug: string; page: number }) {
  const data = await getCachedDivisionProducts({ slug, page });
  if (!data) notFound();

  return (
    <>
      <FadeIn>
        <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl">Listed in this division</h2>
        <p className="mt-2 text-muted-foreground">
          {data.totalCount} medicine{data.totalCount === 1 ? "" : "s"} currently tagged &ldquo;{data.division.catalogCategory}&rdquo;.
        </p>
      </FadeIn>

      <DivisionProductsList
        items={data.items}
        division={data.division}
        page={data.page}
        totalCount={data.totalCount}
        totalPages={data.totalPages}
      />
    </>
  );
}
