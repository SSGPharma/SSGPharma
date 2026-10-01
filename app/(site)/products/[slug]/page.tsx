import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/web/breadcrumbs";
import { ImageCarousel } from "@/components/web/image-carousel";
import { ManagedImage } from "@/components/web/managed-image";
import {
  normalizeMatchToken,
  parseFaqText,
  parseListText,
  summarizeText,
  toParagraphs,
} from "@/lib/content-parsers";
import { formatInrFromPaise } from "@/lib/money";
import { marketingImages } from "@/lib/marketing-images";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";
import { getProductDivisionForCategory } from "@/lib/divisions";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

const productShelfSelect = {
  id: true,
  slug: true,
  name: true,
  categoryId: true,
  manufacturer: true,
  dosage: true,
  salts: true,
  description: true,
  pricePaise: true,
  priceSuffix: true,
  imageUrl1: true,
  imageUrl2: true,
  imageUrl3: true,
  category: {
    select: {
      name: true,
      slug: true,
    },
  },
  molecules: {
    select: {
      molecule: {
        select: {
          name: true,
        },
      },
    },
  },
} as const;

const getProductPageData = unstable_cache(async (slug: string) => {
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      categoryId: true,
      manufacturer: true,
      isActive: true,
      pricePaise: true,
      mrpPaise: true,
      priceSuffix: true,
      mrpSuffix: true,
      dosage: true,
      packSize: true,
      salts: true,
      description: true,
      keyBenefits: true,
      goodToKnow: true,
      allergiesInformation: true,
      directionForUse: true,
      safetyInformation: true,
      specialBenefitSchemes: true,
      faqs: true,
      imageUrl1: true,
      imageUrl2: true,
      imageUrl3: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      molecules: {
        select: {
          molecule: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!product) return null;

  const productTokens = getProductMatchTokens(product);
  const tokenFilters = Array.from(productTokens).slice(0, 8).flatMap((token) => [
    { salts: { contains: token } },
    {
      molecules: {
        some: {
          molecule: {
            name: { contains: token },
          },
        },
      },
    },
  ]);

  const [alternatives, relatedCategoryProducts, moreFromManufacturer] = await Promise.all([
    tokenFilters.length > 0
      ? prisma.product.findMany({
          where: {
            id: { not: product.id },
            isActive: true,
            OR: tokenFilters,
          },
          orderBy: [{ name: "asc" }],
          take: 3,
          select: productShelfSelect,
        })
      : Promise.resolve([]),
    product.categoryId
      ? prisma.product.findMany({
          where: {
            id: { not: product.id },
            isActive: true,
            categoryId: product.categoryId,
          },
          orderBy: [{ name: "asc" }],
          take: 3,
          select: productShelfSelect,
        })
      : Promise.resolve([]),
    product.manufacturer
      ? prisma.product.findMany({
          where: {
            id: { not: product.id },
            isActive: true,
            manufacturer: product.manufacturer,
          },
          orderBy: [{ name: "asc" }],
          take: 3,
          select: productShelfSelect,
        })
      : Promise.resolve([]),
  ]);

  return { product, alternatives, relatedCategoryProducts, moreFromManufacturer };
}, ["product-page-data"], { revalidate: 3600, tags: ["products"] });

type ProductPageData = NonNullable<Awaited<ReturnType<typeof getProductPageData>>>;
type ProductWithImages = Pick<ProductPageData["product"], "imageUrl1" | "imageUrl2" | "imageUrl3">;

function getProductImageUrls(product: ProductWithImages) {
  return [product.imageUrl1, product.imageUrl2, product.imageUrl3].filter(Boolean) as string[];
}

function getProductMatchTokens(product: { salts: string | null; molecules: { molecule: { name: string } }[] }) {
  const tokens = new Set<string>();

  for (const salt of parseListText(product.salts)) {
    const normalized = normalizeMatchToken(salt);
    if (normalized) tokens.add(normalized);
  }

  for (const relation of product.molecules) {
    const normalized = normalizeMatchToken(relation.molecule.name);
    if (normalized) tokens.add(normalized);
  }

  return tokens;
}

function MoleculeLinks({
  molecules,
  fallback,
}: {
  molecules: { molecule: { name: string; slug: string } }[];
  fallback: string;
}) {
  if (molecules.length === 0) {
    return <>{fallback}</>;
  }

  return (
    <>
      {molecules.map(({ molecule }, index) => (
        <span key={molecule.slug}>
          {index > 0 ? ", " : ""}
          <Link href={`/molecules/${molecule.slug}`} className="text-primary hover:underline">
            {molecule.name}
          </Link>
        </span>
      ))}
    </>
  );
}

function ProductShelfCard({
  product,
  eyebrow,
}: {
  product: ProductPageData["alternatives"][number];
  eyebrow?: string;
}) {
  const imageSrc = getProductImageUrls(product)[0] ?? marketingImages.catalog;

  return (
    <article className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
      <div className="relative h-48 overflow-hidden bg-muted">
        <ManagedImage
          src={imageSrc}
          alt={`${product.name} product image`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-contain p-3"
        />
      </div>
      <div className="space-y-3 p-5">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p> : null}
        <div>
          <h3 className="font-(family-name:--font-display) text-xl text-foreground">{product.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {[product.manufacturer, product.dosage].filter(Boolean).join(" · ") || product.category?.name || "Pharmaceutical product"}
          </p>
        </div>
        {product.description ? <p className="text-sm leading-relaxed text-muted-foreground">{summarizeText(product.description, 120)}</p> : null}
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-foreground">{formatInrFromPaise(product.pricePaise)}{product.priceSuffix ? ` ${product.priceSuffix}` : ""}</p>
          <Link href={`/products/${product.slug}`} className="text-sm font-medium text-primary hover:underline">
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}

export const revalidate = 3600;

async function loadProductPageData(paramsPromise: Props["params"]) {
  try {
    const { slug } = await paramsPromise;
    const data = await getProductPageData(slug);
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
    const data = await getProductPageData(slug);

    if (!data) {
      return { title: "Product not found" };
    }

    const { product } = data;
    const siteUrl = getSiteUrl();
    const pageUrl = `${siteUrl}/products/${product.slug}`;
    const primaryImage = getProductImageUrls(product)[0] ?? marketingImages.catalog;
    const saltKeywords = parseListText(product.salts);
    const titleParts = [product.name, product.dosage, product.category?.name].filter(Boolean);
    const description =
      summarizeText(product.description, 158) ||
      summarizeText(
        `${product.name} by ${product.manufacturer ?? "SSG Pharma"} with ${product.salts ?? "active ingredient details"}${
          product.packSize ? ` in ${product.packSize}` : ""
        }. Request authentic supply and pricing support from SSG Pharma.`,
        158,
      );

    return {
      title: titleParts.join(" | "),
      description,
      alternates: { canonical: pageUrl },
      keywords: Array.from(
        new Set(
          [
            product.name,
            product.manufacturer,
            product.category?.name,
            product.dosage,
            ...saltKeywords,
            "pharmaceutical wholesaler India",
            "medicine supplier India",
          ].filter(Boolean) as string[],
        ),
      ),
      openGraph: {
        title: `${product.name} | SSG Pharma`,
        description,
        url: pageUrl,
        type: "website",
        images: [
          {
            url: primaryImage,
            alt: `${product.name} product image`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} | SSG Pharma`,
        description,
        images: [primaryImage],
      },
    };
  } catch {
    return {
      title: "Product",
      description: "Product details from SSG Pharma.",
    };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const data = await loadProductPageData(params);
  if (!data) {
    notFound();
  }

  const { product, alternatives, relatedCategoryProducts, moreFromManufacturer } = data;
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/products/${product.slug}`;
  const imageUrls = getProductImageUrls(product);
  const primaryImage = imageUrls[0] ?? marketingImages.catalog;
  const keyBenefits = parseListText(product.keyBenefits);
  const specialSchemes = parseListText(product.specialBenefitSchemes);
  const faqs = parseFaqText(product.faqs);
  const faqSchemaItems = faqs.filter((faq) => faq.answer);
  const productDivision = getProductDivisionForCategory(product.category);

  const savingsPercent =
    product.mrpPaise && product.mrpPaise > product.pricePaise
      ? Math.round(((product.mrpPaise - product.pricePaise) / product.mrpPaise) * 100)
      : null;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: imageUrls.length > 0 ? imageUrls : [primaryImage],
    description:
      product.description ||
      `${product.name}${product.salts ? ` contains ${product.salts}` : ""}${product.manufacturer ? ` by ${product.manufacturer}` : ""}.`,
    sku: product.id,
    category: product.category?.name || "Pharmaceutical product",
    ...(product.manufacturer
      ? {
          brand: {
            "@type": "Brand",
            name: product.manufacturer,
          },
          manufacturer: {
            "@type": "Organization",
            name: product.manufacturer,
          },
        }
      : {}),
    additionalProperty: [
      product.dosage ? { "@type": "PropertyValue", name: "Dosage", value: product.dosage } : null,
      product.packSize ? { "@type": "PropertyValue", name: "Pack Size", value: product.packSize } : null,
      product.salts ? { "@type": "PropertyValue", name: "Active Ingredient", value: product.salts } : null,
    ].filter(Boolean),
    offers: {
      "@type": "Offer",
      url: pageUrl,
      priceCurrency: "INR",
      price: (product.pricePaise / 100).toFixed(2),
      availability: product.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "SSG Pharma",
        url: siteUrl,
      },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Products", item: `${siteUrl}/products` },
      product.category
        ? {
            "@type": "ListItem",
            position: 3,
            name: product.category.name,
            item: `${siteUrl}/products?division=${productDivision?.slug ?? product.category.slug}`,
          }
        : null,
      {
        "@type": "ListItem",
        position: product.category ? 4 : 3,
        name: product.name,
        item: pageUrl,
      },
    ].filter(Boolean),
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
        id={`product-json-ld-${product.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        id={`product-breadcrumb-json-ld-${product.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />
      {faqJsonLd ? (
        <script
          id={`product-faq-json-ld-${product.slug}`}
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
                  { label: "Products", href: "/products" },
                  ...(product.category && productDivision
                    ? [{ label: product.category.name, href: `/products?division=${productDivision.slug}` }]
                    : []),
                  { label: product.name },
                ]}
              />

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 font-medium",
                      product.isActive
                        ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {product.isActive ? "Available" : "Currently unavailable"}
                  </span>
                  {product.category?.name ? <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">{product.category.name}</span> : null}
                </div>
                <h1 className="font-(family-name:--font-display) text-4xl tracking-tight text-foreground md:text-5xl lg:text-6xl">
                  {product.name}
                </h1>
                <div className="space-y-1 text-sm text-foreground/80 md:text-base">
                  {product.manufacturer ? <p>By {product.manufacturer}</p> : null}
                  {product.dosage ? <p>{product.dosage}</p> : null}
                </div>
              </div>

              {/* IMAGE CAROUSEL - MOBILE ONLY (below manufacturer info, above description) */}
              <div className="lg:hidden">
                <ImageCarousel
                  images={imageUrls.length > 0 ? imageUrls : [marketingImages.catalog]}
                  alt={product.name}
                  sizes="(max-width: 1024px) 100vw, 42vw"
                />
              </div>

              <p className="max-w-3xl text-base leading-relaxed text-foreground/90 md:text-lg">
                {product.description ||
                  `${product.name}${product.salts ? ` contains ${product.salts}` : ""}${
                    product.manufacturer ? ` by ${product.manufacturer}` : ""
                  } and is available for institutional procurement and quote requests through SSG Pharma.`}
              </p>

              <div className="flex flex-wrap items-end gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Price</p>
                  <p className="mt-2 text-4xl font-semibold tracking-tight text-foreground">{formatInrFromPaise(product.pricePaise)}{product.priceSuffix ? ` ${product.priceSuffix}` : ""}</p>
                </div>
                {product.mrpPaise ? (
                  <div className="pb-1">
                    <p className="text-sm text-muted-foreground line-through">{formatInrFromPaise(product.mrpPaise)}{product.mrpSuffix ? ` ${product.mrpSuffix}` : ""}</p>
                    {savingsPercent ? (
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Save {savingsPercent}% off MRP</p>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <p className="text-sm text-muted-foreground">All prices are inclusive of taxes. Final commercial terms are confirmed on quote.</p>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Dosage", value: product.dosage || "On request" },
                  { label: "Pack Size", value: product.packSize || "On request" },
                  {
                    label: "Active Ingredient / Salt",
                    value: <MoleculeLinks molecules={product.molecules} fallback={product.salts || "On request"} />,
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-border/70 bg-card px-4 py-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">{item.value}</p>
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

            {/* IMAGE CAROUSEL - DESKTOP ONLY (right column) */}
            <div className="hidden lg:block">
              <ImageCarousel
                images={imageUrls.length > 0 ? imageUrls : [marketingImages.catalog]}
                alt={product.name}
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-350 space-y-8 px-4 py-10 md:px-6 lg:px-8 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm md:p-8">
              <h2 className="font-(family-name:--font-display) text-3xl text-foreground">Product Description</h2>
              <div className="mt-5 space-y-4 text-sm leading-7 text-foreground/85 md:text-base">
                {toParagraphs(product.description).length > 0 ? (
                  toParagraphs(product.description).map((paragraph) => <p key={paragraph}>{paragraph}</p>)
                ) : (
                  <p>
                    {product.name}
                    {product.salts ? ` contains ${product.salts}` : ""} and is supplied through SSG Pharma for formal enquiry, pricing, and
                    procurement support.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm md:p-8">
              <h2 className="font-(family-name:--font-display) text-3xl text-foreground">Product Info</h2>
              <dl className="mt-5 space-y-4 text-sm">
                {(
                  [
                    ["Price", `${formatInrFromPaise(product.pricePaise)}${product.priceSuffix ? ` ${product.priceSuffix}` : ""}`],
                    ["MRP", product.mrpPaise ? `${formatInrFromPaise(product.mrpPaise)}${product.mrpSuffix ? ` ${product.mrpSuffix}` : ""}` : "Not listed"],
                    ["Dosage", product.dosage || "Not listed"],
                    ["Pack Size", product.packSize || "Not listed"],
                    ["Manufacturer", product.manufacturer || "Not listed"],
                    [
                      "Active Ingredient",
                      <MoleculeLinks key="molecules" molecules={product.molecules} fallback={product.salts || "Not listed"} />,
                    ],
                    ["Category", product.category?.name || "Not listed"],
                  ] as [string, ReactNode][]
                ).map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4 border-b border-border/60 pb-3 last:border-b-0 last:pb-0">
                    <dt className="font-medium text-foreground">{label}</dt>
                    <dd className="max-w-[60%] text-right leading-6 text-muted-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <section className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
              <h2 className="font-(family-name:--font-display) text-2xl text-foreground">Key Benefits</h2>
              {keyBenefits.length > 0 ? (
                <ul className="mt-5 space-y-3 text-sm leading-6 text-foreground/85">
                  {keyBenefits.map((benefit) => (
                    <li key={benefit} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 text-sm leading-6 text-foreground/80">Add key benefits in admin to surface the strongest selling points here.</p>
              )}
            </section>

            <section className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
              <h2 className="font-(family-name:--font-display) text-2xl text-foreground">Usage & Safety</h2>
              <div className="mt-5 space-y-5 text-sm leading-6 text-foreground/85">
                {product.directionForUse ? (
                  <div>
                    <h3 className="font-medium text-foreground">Direction for Use</h3>
                    <div className="mt-2 space-y-2">
                      {toParagraphs(product.directionForUse).map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                ) : null}
                {product.safetyInformation ? (
                  <div>
                    <h3 className="font-medium text-foreground">Safety Information</h3>
                    <div className="mt-2 space-y-2">
                      {toParagraphs(product.safetyInformation).map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                ) : null}
                {product.allergiesInformation ? (
                  <div>
                    <h3 className="font-medium text-foreground">Allergy Information</h3>
                    <div className="mt-2 space-y-2">
                      {toParagraphs(product.allergiesInformation).map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                ) : null}
                {product.goodToKnow ? (
                  <div>
                    <h3 className="font-medium text-foreground">Good to Know</h3>
                    <div className="mt-2 space-y-2">
                      {toParagraphs(product.goodToKnow).map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                ) : null}
                {!product.directionForUse && !product.safetyInformation && !product.allergiesInformation && !product.goodToKnow ? (
                  <p>Usage and safety notes will appear here once they are added in admin.</p>
                ) : null}
              </div>
            </section>

            <section className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
              <h2 className="font-(family-name:--font-display) text-2xl text-foreground">Why Choose {product.name}?</h2>
              <div className="mt-5 grid gap-4 text-sm">
                {[
                  {
                    title: "Authentic Product",
                    text: `We source ${product.name} through trusted pharmaceutical channels with an emphasis on authenticity and batch traceability.`,
                  },
                  {
                    title: "Quality Control",
                    text: "Rigorous handling, compliant storage, and careful dispatch planning help protect product integrity.",
                  },
                  {
                    title: "Fast Delivery",
                    text: "Institutional quote handling and lane planning keep urgent requirements moving without avoidable delays.",
                  },
                  {
                    title: "Expert Support",
                    text: "Our team helps align pack, category, and procurement details before you finalize a commercial decision.",
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl bg-muted/40 p-4">
                    <h3 className="font-medium text-foreground">{item.title}</h3>
                    <p className="mt-2 leading-6 text-foreground/80">{item.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {specialSchemes.length > 0 ? (
            <section className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm md:p-8">
              <h2 className="font-(family-name:--font-display) text-2xl text-foreground">Special Benefit Schemes</h2>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-foreground/85">
                {specialSchemes.map((scheme) => (
                  <li key={scheme} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                    <span>{scheme}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {faqs.length > 0 ? (
            <section className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm md:p-8">
              <h2 className="font-(family-name:--font-display) text-3xl text-foreground">Frequently Asked Questions</h2>
              <div className="mt-6 space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.question} className="rounded-2xl border border-border/70 bg-background/70 p-5">
                    <h3 className="font-medium text-foreground">{faq.question}</h3>
                    {faq.answer ? <p className="mt-2 text-sm leading-6 text-foreground/80">{faq.answer}</p> : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {alternatives.length > 0 ? (
            <section className="space-y-4">
              <div className="space-y-2">
                <h2 className="font-(family-name:--font-display) text-3xl text-foreground">Alternative Medicines with Same Salt</h2>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                  These alternatives share the same active ingredient or linked molecule record. Please consult your healthcare provider before making any substitutions.
                </p>
              </div>
              <div className="grid gap-6 lg:grid-cols-3">
                {alternatives.map((alternative) => (
                  <ProductShelfCard key={alternative.id} product={alternative} eyebrow="Same salt alternative" />
                ))}
              </div>
            </section>
          ) : null}

          {relatedCategoryProducts.length > 0 ? (
            <section className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-(family-name:--font-display) text-3xl text-foreground">
                    Related {product.category?.name || "Category"} Products
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">Explore other products from the same category.</p>
                </div>
                {product.category && productDivision ? (
                  <Link href={`/products?division=${productDivision.slug}`} className="text-sm font-medium text-primary hover:underline">
                    View all {product.category.name}
                  </Link>
                ) : null}
              </div>
              <div className="grid gap-6 lg:grid-cols-3">
                {relatedCategoryProducts.map((related) => (
                  <ProductShelfCard key={related.id} product={related} eyebrow={product.category?.name} />
                ))}
              </div>
            </section>
          ) : null}

          {moreFromManufacturer.length > 0 ? (
            <section className="space-y-4">
              <div className="space-y-2">
                <h2 className="font-(family-name:--font-display) text-3xl text-foreground">More from {product.manufacturer}</h2>
                <p className="text-sm text-muted-foreground">Explore other products from the same trusted manufacturer.</p>
              </div>
              <div className="grid gap-6 lg:grid-cols-3">
                {moreFromManufacturer.map((related) => (
                  <ProductShelfCard key={related.id} product={related} eyebrow={product.manufacturer ?? undefined} />
                ))}
              </div>
            </section>
          ) : null}

          <section className="rounded-[2rem] border border-border/70 bg-[linear-gradient(135deg,color-mix(in_oklch,var(--primary)_20%,transparent),color-mix(in_oklch,var(--background)_88%,white))] p-6 shadow-sm dark:bg-[linear-gradient(135deg,color-mix(in_oklch,var(--primary)_30%,transparent),color-mix(in_oklch,var(--background)_90%,black))] md:p-8">
            <div className="max-w-3xl">
              <h2 className="font-(family-name:--font-display) text-3xl text-foreground">Ready to Order {product.name}?</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
                Get competitive pricing, institutional support, and confirmed availability for {product.name}. Share quantity, location, and timeline and our team will respond with the right next step.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/get-a-quote"
                className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Get Quote for {product.name}
              </Link>
              <Link
                href="/contact-us"
                className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background px-6 text-sm font-medium hover:bg-muted"
              >
                Call Our Experts
              </Link>
            </div>
          </section>
        </section>
      </article>
    </>
  );
}
