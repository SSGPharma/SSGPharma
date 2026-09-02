import type { Metadata } from "next";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { FadeIn } from "@/components/motion/fade-in";
import { ManagedImage } from "@/components/web/managed-image";
import { ContentPage } from "@/components/web/content-page";
import { ContentSection } from "@/components/web/content-section";
import { buttonVariants } from "@/components/ui/button";
import { marketingImages } from "@/lib/marketing-images";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";
import { MoleculesSearch } from "@/components/molecules/molecules-search";

const siteUrl = getSiteUrl();
const pageUrl = `${siteUrl}/molecules`;

export const metadata: Metadata = {
  title: "Molecules",
  description:
    "Browse published molecule profiles with overview, approvals, uses, administration, safety guidance, and linked product context from SSG Pharma.",
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: "Molecules | SSG Pharma",
    description:
      "Browse molecule profiles and send targeted enquiries with realistic procurement support from SSG Pharma.",
    url: pageUrl,
    type: "website",
    images: [
      {
        url: marketingImages.microscope,
        width: 1200,
        height: 800,
        alt: "Laboratory research and molecule sourcing support",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Molecules | SSG Pharma",
    description: "Published molecule profiles and molecule enquiry support for hospitals, pharmacies, and procurement teams.",
    images: [marketingImages.microscope],
  },
};

const faqs = [
  {
    q: "Do you maintain public molecule pages?",
    a: "Yes. We publish structured molecule pages so teams can review the overview, uses, safety notes, and linked products before reaching out.",
  },
  {
    q: "Can you help with alternates or biosimilar options?",
    a: "Yes, when substitution is commercially and clinically appropriate. We use molecule-level mapping to keep those suggestions clearer on product pages.",
  },
  {
    q: "Can I request a hard-to-find molecule?",
    a: "Yes. Send the molecule name, strength, route, quantity, and destination so our team can respond with realistic availability and sourcing guidance.",
  },
];

export const revalidate = 3600;

const getMoleculesPageData = unstable_cache(
  async () =>
    prisma.molecule.findMany({
      where: { isPublished: true },
      orderBy: [{ updatedAt: "desc" }],
      take: 24,
      select: {
        id: true,
        name: true,
        slug: true,
        synonyms: true,
        imageUrl: true,
        overview: true,
      },
    }),
  ["molecules-page-data"],
  { revalidate: 3600, tags: ["molecules"] },
);

export default async function MoleculesPage() {
  const molecules = await getMoleculesPageData().catch(() => null);
  if (!molecules) {
    return (
      <ContentPage width="full" variant="frame">
        <ContentSection>
          <h1 className="font-(family-name:--font-display) text-4xl tracking-tight text-foreground md:text-5xl">Molecules</h1>
          <p className="mt-4 text-muted-foreground">Molecule profiles are temporarily unavailable. Please try again shortly.</p>
        </ContentSection>
      </ContentPage>
    );
  }

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Molecules",
    url: pageUrl,
    description:
      "Published molecule profiles with overview, uses, administration, safety guidance, and linked product context.",
    isPartOf: {
      "@type": "WebSite",
      name: "SSG Pharma",
      url: siteUrl,
    },
  };

  return (
    <>
      <script
        id="molecules-page-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        id="molecules-faq-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />

      <ContentPage width="full" variant="frame">
        <ContentSection padding="none" className="grid gap-0 lg:grid-cols-[1fr_1fr]">
          <div className="relative min-h-65 lg:min-h-80">
            <ManagedImage
              src={marketingImages.microscope}
              alt="Laboratory research and molecule sourcing support"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/95 via-background/35 to-transparent lg:bg-linear-to-r" />
          </div>
          <div className="flex flex-col justify-center p-8 md:p-10 lg:p-12">
            <FadeIn>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Published Reference Pages</p>
              <h1 className="mt-3 font-(family-name:--font-display) text-4xl tracking-tight text-foreground md:text-5xl">
                Molecules
              </h1>
              <p className="mt-5 text-muted-foreground leading-relaxed md:text-lg">
                Browse structured molecule pages covering overview, approvals, use cases, administration, side effects, warnings, precautions, and expert guidance.
              </p>
              <Link href="/get-a-quote" className={cn(buttonVariants({ size: "lg" }), "mt-8 w-fit")}>
                Start a molecule enquiry
              </Link>
            </FadeIn>
          </div>
        </ContentSection>

        <ContentSection>
          <FadeIn>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-(family-name:--font-display) text-2xl text-foreground md:text-3xl">Published Molecule Profiles</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">
                  Each page is built from admin-managed sections so you can publish clean, indexable molecule content.
                </p>
              </div>
              <p className="text-sm font-medium text-muted-foreground">{molecules.length} published pages</p>
            </div>
          </FadeIn>

          <div className="mt-8">
            <MoleculesSearch molecules={molecules} moleculeCount={molecules.length} />
          </div>
        </ContentSection>

        <ContentSection>
          <FadeIn>
            <h2 className="font-(family-name:--font-display) text-2xl text-foreground md:text-3xl">Common questions</h2>
          </FadeIn>
          <div className="mt-8 space-y-6">
            {faqs.map((f, i) => (
              <FadeIn key={f.q} delay={i * 0.05}>
                <div className="rounded-xl border-2 border-border/70 bg-muted/15 p-5 md:p-6">
                  <h3 className="font-medium text-foreground">{f.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">{f.a}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </ContentSection>
      </ContentPage>
    </>
  );
}
