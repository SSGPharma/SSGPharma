import type { Metadata } from "next";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/web/breadcrumbs";
import { ManagedImage } from "@/components/web/managed-image";
import { parseFaqText, parseReferenceText, summarizeText, toParagraphs } from "@/lib/content-parsers";
import { marketingImages } from "@/lib/marketing-images";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";

type Props = { params: Promise<{ slug: string }> };

const getMoleculePageData = unstable_cache(async (slug: string) => {
  const molecule = await prisma.molecule.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      synonyms: true,
      imageUrl: true,
      isPublished: true,
      overview: true,
      backgroundAndApproval: true,
      uses: true,
      administration: true,
      sideEffects: true,
      warnings: true,
      precautions: true,
      expertTips: true,
      faqs: true,
      references: true,
      products: {
        where: {
          product: {
            isActive: true,
          },
        },
        take: 6,
        select: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              manufacturer: true,
              dosage: true,
              packSize: true,
              description: true,
              isActive: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!molecule) return null;

  const relatedPublishedMolecules = await prisma.molecule.findMany({
    where: {
      id: { not: molecule.id },
      isPublished: true,
    },
    orderBy: [{ updatedAt: "desc" }],
    take: 3,
    select: {
      id: true,
      name: true,
      slug: true,
      synonyms: true,
      overview: true,
    },
  });

  return { molecule, relatedPublishedMolecules };
}, ["molecule-page-data"], { revalidate: 3600, tags: ["molecules"] });

function MoleculeSection({ title, content }: { title: string; content?: string | null }) {
  if (!content?.trim()) return null;

  return (
    <section className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm md:p-8">
      <h2 className="font-[family-name:var(--font-display)] text-3xl text-foreground">{title}</h2>
      <div className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
        {toParagraphs(content).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

export const revalidate = 3600;

export const dynamicParams = true;

async function loadMoleculePageData(paramsPromise: Props["params"]) {
  try {
    const { slug } = await paramsPromise;
    const data = await getMoleculePageData(slug);
    if (!data) {
      return null;
    }
    return { slug, ...data };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const data = await getMoleculePageData(slug);

    if (!data) {
      return { title: "Molecule not found" };
    }

    const { molecule } = data;
    const siteUrl = getSiteUrl();
    const pageUrl = `${siteUrl}/molecules/${molecule.slug}`;
    const imageSrc = molecule.imageUrl || marketingImages.microscope;
    const description =
      summarizeText(molecule.overview, 158) ||
      summarizeText(
        `${molecule.name} molecule profile covering overview, approval background, uses, administration, side effects, and precautions from SSG Pharma.`,
        158,
      );

    return {
      title: `${molecule.name} molecule profile`,
      description,
      alternates: { canonical: pageUrl },
      robots: molecule.isPublished ? undefined : { index: false, follow: false },
      keywords: [
        molecule.name,
        molecule.synonyms,
        "molecule profile",
        "drug information",
        "pharmaceutical wholesaler India",
      ].filter(Boolean) as string[],
      openGraph: {
        title: `${molecule.name} | Molecule Profile | SSG Pharma`,
        description,
        url: pageUrl,
        type: "article",
        images: [
          {
            url: imageSrc,
            alt: `${molecule.name} molecule page image`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${molecule.name} | Molecule Profile | SSG Pharma`,
        description,
        images: [imageSrc],
      },
    };
  } catch {
    return {
      title: "Molecule",
      description: "Molecule profile from SSG Pharma.",
    };
  }
}

export default async function MoleculeDetailPage({ params }: Props) {
  const data = await loadMoleculePageData(params);
  if (!data) {
    notFound();
  }

  const { molecule, relatedPublishedMolecules } = data;
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/molecules/${molecule.slug}`;
  const imageSrc = molecule.imageUrl || marketingImages.microscope;
  const faqs = parseFaqText(molecule.faqs);
  const faqSchemaItems = faqs.filter((faq) => faq.answer);
  const references = parseReferenceText(molecule.references);
  const linkedProducts = molecule.products.map((entry) => entry.product);

  const moleculeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Drug",
    name: molecule.name,
    url: pageUrl,
    image: imageSrc,
    description:
      molecule.overview ||
      `${molecule.name} molecule profile covering mechanism, use cases, administration, safety information, and references.`,
    alternateName: molecule.synonyms || undefined,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Molecules", item: `${siteUrl}/molecules` },
      { "@type": "ListItem", position: 3, name: molecule.name, item: pageUrl },
    ],
  };

  const faqJsonLd =
    faqSchemaItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqSchemaItems.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        id={`molecule-json-ld-${molecule.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(moleculeJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        id={`molecule-breadcrumb-json-ld-${molecule.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />
      {faqJsonLd ? (
        <script
          id={`molecule-faq-json-ld-${molecule.slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
        />
      ) : null}

      <article className="bg-background">
        <section className="border-b border-border/60 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--primary)_22%,transparent),transparent_40%),linear-gradient(180deg,color-mix(in_oklch,var(--background)_86%,white),var(--background))] dark:bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--primary)_28%,transparent),transparent_42%),linear-gradient(180deg,color-mix(in_oklch,var(--background)_92%,black),var(--background))]">
          <div className="mx-auto grid max-w-350 gap-8 px-4 py-8 md:px-6 lg:grid-cols-[1.06fr_0.94fr] lg:px-8 lg:py-12">
            <div className="space-y-6">
              <Breadcrumbs
                crumbs={[
                  { label: "Home", href: "/" },
                  { label: "Molecules", href: "/molecules" },
                  { label: molecule.name },
                ]}
              />

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">Molecule Profile</span>
                  <span className="rounded-full bg-muted px-3 py-1 font-medium text-muted-foreground">
                    {molecule.isPublished ? "Published" : "Draft preview"}
                  </span>
                </div>
                <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-foreground md:text-5xl lg:text-6xl">
                  {molecule.name}
                </h1>
                {molecule.synonyms ? <p className="text-sm leading-6 text-muted-foreground md:text-base">Synonyms: {molecule.synonyms}</p> : null}

                <div className="relative flex min-h-80 w-full items-center justify-center overflow-hidden rounded-[2rem] border border-border/70 bg-accent/10 shadow-sm md:hidden">
                  <ManagedImage
                    src={imageSrc}
                    alt={`${molecule.name} molecule page image`}
                    fill
                    priority
                    sizes="100vw"
                    className="object-contain"
                  />
                </div>

                <p className="max-w-3xl text-base leading-relaxed text-foreground/90 md:text-lg">
                  {molecule.overview ||
                    `${molecule.name} is presented here with its overview, approval history, uses, administration, side effects, precautions, and reference material.`}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Linked Products", value: String(linkedProducts.length) },
                  { label: "FAQs", value: String(faqs.length) },
                  { label: "References", value: String(references.length) },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-border/70 bg-card px-4 py-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/get-a-quote"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Request Quote
                </Link>
                <Link
                  href="/contact-us"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background px-6 text-sm font-medium hover:bg-muted"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            <div className="relative hidden min-h-96 w-full items-center justify-center overflow-hidden rounded-[2rem] border border-border/70 bg-accent/10 shadow-sm lg:min-h-[420px] md:flex">
              <ManagedImage
                src={imageSrc}
                alt={`${molecule.name} molecule page image`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 46vw"
                className="object-contain"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-350 space-y-8 px-4 py-10 md:px-6 lg:px-8 lg:py-14">
          <MoleculeSection title="Overview" content={molecule.overview} />
          <MoleculeSection title="Background and Date of Approval" content={molecule.backgroundAndApproval} />
          <MoleculeSection title="Uses" content={molecule.uses} />
          <MoleculeSection title="Administration" content={molecule.administration} />
          <MoleculeSection title="Side Effects" content={molecule.sideEffects} />
          <MoleculeSection title="Warnings" content={molecule.warnings} />
          <MoleculeSection title="Precautions" content={molecule.precautions} />
          <MoleculeSection title="Expert Tips" content={molecule.expertTips} />

          {faqs.length > 0 ? (
            <section className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm md:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-3xl text-foreground">FAQs</h2>
              <div className="mt-6 space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.question} className="rounded-2xl border border-border/70 bg-background/70 p-5">
                    <h3 className="font-medium text-foreground">{faq.question}</h3>
                    {faq.answer ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</p> : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {references.length > 0 ? (
            <section className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm md:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-3xl text-foreground">References</h2>
              <ol className="mt-6 space-y-3 text-sm leading-6 text-muted-foreground">
                {references.map((reference, index) => (
                  <li key={`${reference.label}-${index}`} className="rounded-2xl border border-border/70 bg-background/70 px-4 py-4">
                    {reference.url ? (
                      <a href={reference.url} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
                        {reference.label}
                      </a>
                    ) : (
                      <span className="font-medium text-foreground">{reference.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {linkedProducts.length > 0 ? (
            <section className="space-y-4">
              <div className="space-y-2">
                <h2 className="font-[family-name:var(--font-display)] text-3xl text-foreground">Products Linked to {molecule.name}</h2>
                <p className="text-sm text-muted-foreground">Explore products in the catalog that are mapped to this molecule.</p>
              </div>
              <div className="grid gap-6 lg:grid-cols-3">
                {linkedProducts.map((product) => (
                  <article key={product.id} className="rounded-[2rem] border border-border/70 bg-card p-5 shadow-sm">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{product.category?.name || "Product"}</p>
                      <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-foreground">{product.name}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{[product.manufacturer, product.dosage].filter(Boolean).join(" · ")}</p>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                      {summarizeText(product.description, 130) || `${product.name} is available for quote requests and procurement support.`}
                    </p>
                    <div className="mt-5 flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-foreground">{product.packSize || "Pack size on request"}</span>
                      <Link href={`/products/${product.slug}`} className="text-sm font-medium text-primary hover:underline">
                        View product
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {relatedPublishedMolecules.length > 0 ? (
            <section className="space-y-4">
              <div className="space-y-2">
                <h2 className="font-[family-name:var(--font-display)] text-3xl text-foreground">More Molecule Profiles</h2>
                <p className="text-sm text-muted-foreground">Browse other published molecule pages in the catalog.</p>
              </div>
              <div className="grid gap-6 lg:grid-cols-3">
                {relatedPublishedMolecules.map((related) => (
                  <article key={related.id} className="rounded-[2rem] border border-border/70 bg-card p-5 shadow-sm">
                    <h3 className="font-[family-name:var(--font-display)] text-2xl text-foreground">{related.name}</h3>
                    {related.synonyms ? <p className="mt-2 text-sm text-muted-foreground">{related.synonyms}</p> : null}
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                      {summarizeText(related.overview, 130) || `${related.name} molecule profile and reference page.`}
                    </p>
                    <Link href={`/molecules/${related.slug}`} className="mt-5 inline-flex text-sm font-medium text-primary hover:underline">
                      View molecule page
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </section>
      </article>
    </>
  );
}
