import type { Metadata } from "next";
import { connection } from "next/server";
import { ContentPage } from "@/components/web/content-page";
import { ContentSection } from "@/components/web/content-section";
import { marketingImages } from "@/lib/marketing-images";
import { getSiteUrl } from "@/lib/site-url";
import { prisma } from "@/lib/prisma";
import { QuoteForm } from "@/components/marketing/quote-form";

const siteUrl = getSiteUrl();
const pageUrl = `${siteUrl}/quote`;

export const metadata: Metadata = {
  title: "Request a Quote | SSG Pharma",
  description:
    "Send a structured quote request for products, molecules, and institutional procurement. Specify urgency, quantity, and delivery requirements.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Request a Quote | SSG Pharma",
    description: "Structured quote requests for hospitals, pharmacies, and procurement teams.",
    url: pageUrl,
    type: "website",
    images: [{ url: marketingImages.microscope, width: 1200, height: 800, alt: "SSG Pharma quote service" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Request a Quote | SSG Pharma",
    description: "Quote request support for pharmaceutical sourcing and institutional procurement.",
    images: [marketingImages.microscope],
  },
};

type Props = { searchParams: Promise<{ product?: string }> };

export default async function QuotePage({ searchParams }: Props) {
  await connection();
  const { product: productSlug } = await searchParams;
  let productName: string | null = null;
  if (productSlug) {
    try {
      const product = await prisma.product.findUnique({
        where: { slug: productSlug },
        select: { name: true },
      });
      if (product) productName = product.name;
    } catch {
      // Ignore invalid slug; form still works
    }
  }

  return (
    <ContentPage width="full" variant="frame">
      <ContentSection padding="none" className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-65 lg:min-h-80 bg-gradient-to-br from-primary/[0.08] via-background to-card/40">
          <div className="flex h-full items-center justify-center p-8 lg:p-10">
            <div className="max-w-md space-y-6 lg:text-left">
              <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-foreground md:text-5xl">Request a Quote</h1>
              <p className="text-muted-foreground leading-relaxed md:text-lg">
                Send your indent with product, quantity, urgency, and delivery details. Our procurement team responds within one business day.
              </p>
              <div className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm">
                <h3 className="font-medium text-foreground">Next steps</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><span className="inline-block size-1.5 rounded-full bg-primary" />Quote reviewed within 1 business day</li>
                  <li className="flex items-center gap-2"><span className="inline-block size-1.5 rounded-full bg-primary" />Pricing confirmed with product context</li>
                  <li className="flex items-center gap-2"><span className="inline-block size-1.5 rounded-full bg-primary" />Procurement support available for hospitals & pharmacies</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center p-8 md:p-10 lg:p-12">
          <QuoteForm productName={productName} />
        </div>
      </ContentSection>
    </ContentPage>
  );
}
