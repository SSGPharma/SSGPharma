import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/marketing/hero";
import { HomepageSearchSection } from "@/components/marketing/homepage-search";
import { StatsSection } from "@/components/marketing/stats-section";
import { TestimonialsSection } from "@/components/marketing/testimonials";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerItem, StaggerList } from "@/components/motion/stagger-list";
import { buttonVariants } from "@/components/ui/button";
import { productDivisions } from "@/lib/divisions";
import { getCachedHomepageProducts } from "@/lib/catalog-data";
import { cn } from "@/lib/utils";

const pillars = [
  {
    title: "Nationwide reach",
    body: "Reliable dispatch across India so your ward does not stall on a single SKU.",
  },
  {
    title: "Quality first",
    body: "Cold-chain aware handling where it matters, paperwork you can file with confidence.",
  },
  {
    title: "Specialty focus",
    body: "Hard-to-find molecules and chronic-care lines, not just fast-moving boxes.",
  },
  {
    title: "Human support",
    body: "You reach a person who understands formularies, not a ticket black hole.",
  },
];

export const revalidate = 3600;

export default async function HomePage() {
  const { products, productCount } = await getCachedHomepageProducts().catch(() => ({
    products: [],
    productCount: 0,
  }));

  return (
    <>
      <Hero />

      <StatsSection productCount={productCount} />

      <HomepageSearchSection products={products} />

      <section className="w-full border-b border-border/40 bg-background py-16 md:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-4 md:grid-cols-2 md:items-center md:gap-16 md:px-8">
          <FadeIn>
            <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight md:text-4xl lg:text-5xl">
              Built for hospitals, distributors, and serious pharmacies
            </h2>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              We are not trying to be the loudest name online — we are trying to be the supplier you message when the patient
              is already on the bed and the clock is ticking.
            </p>
          </FadeIn>
          <div className="relative aspect-[1691/930] w-full overflow-hidden rounded-2xl border border-border shadow-lg">
            <Image
              src="/homepage-mid.png"
              alt="Healthcare procurement and pharmacy coordination"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className="w-full bg-muted/25 py-16 md:py-24">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <StaggerList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p) => (
              <StaggerItem key={p.title}>
                <div className="h-full rounded-2xl border border-border/80 bg-card/80 p-5 shadow-xs backdrop-blur-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-md">
                  <h3 className="font-medium text-foreground">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      </section>

      <section className="w-full py-16 md:py-24">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <FadeIn>
            <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight md:text-4xl">Medicine Categories</h2>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              All <strong className="font-medium text-foreground">medicines</strong> are sourced from certified suppliers to ensure quality and safety.
             Choose from a variety of healthcare essentials backed by trusted pharmaceutical standards.
            </p>
          </FadeIn>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {productDivisions.map((d, i) => (
              <FadeIn key={d.slug} delay={i * 0.05}>
                <Link
                  href={`/divisions/${d.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-[16/10] w-full">
                    <Image
                      src={d.imageSrc}
                      alt={d.imageAlt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                    <span className="absolute bottom-3 left-4 font-[family-name:var(--font-display)] text-xl text-foreground">
                      {d.title}
                    </span>
                  </div>
                  <p className="p-4 text-sm leading-relaxed text-muted-foreground">{d.blurb}</p>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection />

      <section className="w-full border-t border-border/60 bg-primary/5 py-16 md:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 md:grid-cols-2 md:items-center md:gap-16 md:px-8">
          <div className="relative aspect-[1565/1005] overflow-hidden rounded-2xl border border-primary/20 shadow-md">
            <Image
              src="/homepage-bottom.png"
              alt="Medicine warehousing and nationwide distribution"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <FadeIn>
            <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight md:text-4xl">
              Need a line item quote today?
            </h2>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              Send your indent — we will confirm availability, suggest alternatives if needed, and keep the thread in one
              place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact-us" className={cn(buttonVariants({ size: "lg" }))}>
                Contact the desk
              </Link>
              <Link href="/get-a-quote" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                Upload requirement
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
