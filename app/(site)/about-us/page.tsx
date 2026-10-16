import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/motion/fade-in";
import { ContentPage } from "@/components/web/content-page";
import { ContentSection } from "@/components/web/content-section";
import { buttonVariants } from "@/components/ui/button";
import { marketingImages } from "@/lib/marketing-images";
import { getSiteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "About us",
  description:
    "SSG Pharma — specialty pharmaceutical wholesaler in India: our story, how we work with hospitals, quality mindset, and nationwide fulfilment.",
  alternates: {
    canonical: `${siteUrl}/about-us`,
  },
};

const milestones = [
  { year: "Roots", text: "Started as a sourcing desk for oncology wards chasing molecules that were never in the same place twice." },
  { year: "Today", text: "We serve hospitals, clinic chains, distributors, and serious retail pharmacies across multiple therapy areas." },
  { year: "Tomorrow", text: "Deeper cold-chain telemetry, tighter formulary mirroring, and the same human thread on the other end of the line." },
];

export default function AboutPage() {
  return (
    <ContentPage width="full" variant="frame">
      <ContentSection padding="none" className="grid gap-0 md:grid-cols-[1.05fr_0.95fr]">
        <div className="relative min-h-[240px] md:min-h-[320px]">
          <Image
            src={marketingImages.hospitalInterior}
            alt="Hospital corridor — where reliable medicine supply matters every day"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 55vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/25 to-transparent md:bg-gradient-to-r" />
        </div>
        <div className="flex flex-col justify-center p-8 md:p-10 lg:p-12">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Our story</p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-foreground md:text-5xl">
              About SSG Pharma
            </h1>
            <p className="mt-5 text-muted-foreground leading-relaxed md:text-lg">
              SSGPharma is a premier pharmaceutical sourcing and distribution company headquartered in Gurugram, Haryana, India. We have built an unmatched network of manufacturers, hospitals, and healthcare institutions across the country and internationally.
              Our commitment to quality, reliability, and patient-centric supply chains has made us the preferred partner for hospitals, clinics, and healthcare organisations seeking critical medicines across speciality therapy areas.
            </p>
          </FadeIn>
        </div>
      </ContentSection>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
        <ContentSection>
          <FadeIn>
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground md:text-3xl">What we believe</h2>
            <ul className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <li>
                <strong className="text-foreground">Authenticity over volume.</strong> We would rather say no to a sketchy
                parallel line than put your licence and your patients at risk.
              </li>
              <li>
                <strong className="text-foreground">Documentation that survives audits.</strong> Batch trails, cold-chain
                notes, and invoices your pharmacy can file without a scramble.
              </li>
              <li>
                <strong className="text-foreground">Specialty is not a buzzword.</strong> Oncology, nephrology, rheumatology,
                diabetes — these need different lead times and different tempers. We plan for both.
              </li>
            </ul>
          </FadeIn>
        </ContentSection>
        <div className="relative min-h-[280px] overflow-hidden rounded-2xl border-2 border-border shadow-sm lg:min-h-0">
          <Image
            src={marketingImages.teamMeeting}
            alt="Team coordinating pharmaceutical supply and customer support"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>

      <ContentSection>
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border/80">
            <Image
              src={marketingImages.warehouse}
              alt="Warehouse and wholesale medicine storage"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </div>
          <FadeIn>
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground md:text-3xl">How fulfilment works</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Indents hit a single operations lane per account where possible. We confirm stock against live inventory, quote
              realistic dispatch dates, and escalate early when a manufacturer run slips. For temperature-sensitive lines we
              align on packing, carrier cutoffs, and who signs off at delivery — before the truck leaves.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Whether you are a 900-bed hospital or a regional distributor building hub-and-spoke, we adapt the paperwork and
              the rhythm — not the other way around.
            </p>
          </FadeIn>
        </div>
      </ContentSection>

      <ContentSection>
        <FadeIn>
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground md:text-3xl">Where we are headed</h2>
        </FadeIn>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {milestones.map((m, i) => (
            <FadeIn key={m.year} delay={i * 0.06}>
              <div className="rounded-xl border-2 border-border/80 bg-muted/20 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">{m.year}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </ContentSection>

      <ContentSection className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">Work with us</h2>
          <p className="mt-2 max-w-xl text-muted-foreground leading-relaxed">
            Send an indent, ask for a division specialist, or just introduce your hospital — we will take it from there.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/contact-us" className={cn(buttonVariants({ size: "lg" }))}>
            Contact us
          </Link>
        </div>
      </ContentSection>
    </ContentPage>
  );
}
