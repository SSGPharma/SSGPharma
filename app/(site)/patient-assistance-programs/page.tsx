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
  title: "Patient assistance",
  description:
    "Navigate manufacturer patient assistance programs with SSG Pharma — eligibility, paperwork, and realistic timelines for hospitals and counselling teams.",
  alternates: {
    canonical: `${siteUrl}/patient-assistance-programs`,
  },
};

const programTypes = [
  {
    title: "Financial support & copay",
    body: "Manufacturer-funded schemes that reduce out-of-pocket cost for eligible patients. Rules change by brand, city, and income documentation — we help your desk know which folder to open first.",
  },
  {
    title: "Compassionate / named access",
    body: "When a molecule is not yet stocked or is import-only, paperwork and hospital ethics committee alignment matter as much as the PO. We stay parallel on supply and documentation.",
  },
  {
    title: "Continuity after protocol change",
    body: "When a ward switches lines mid-quarter, patients mid-course need bridging. We map what the old program allowed vs what the new one requires so counselling does not improvise under pressure.",
  },
];

const boundaries = [
  "We do not guarantee approval — manufacturers and insurers make final eligibility calls.",
  "We are not a substitute for your hospital’s medical or ethics committee decisions.",
  "We do not collect patient health data beyond what you choose to share for sourcing; handle PHI per your policy.",
];

export default function PatientAssistancePage() {
  return (
    <ContentPage width="full" variant="frame">
      <ContentSection padding="none" className="grid gap-0 md:grid-cols-2">
        <div className="flex flex-col justify-center p-8 md:p-10 lg:p-12 md:order-2">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Access programs</p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-foreground md:text-5xl">
              Patient assistance
            </h1>
            <p className="mt-5 text-muted-foreground leading-relaxed md:text-lg">
              Manufacturer programs shift rules, budgets, and enrolment windows often. We help your counselling desk understand
              what is open, what paperwork is mandatory, and what timelines actually look like — without promising outcomes we
              cannot control.
            </p>
            <Link href="/contact-us" className={cn(buttonVariants({ size: "lg" }), "mt-8 w-fit")}>
              Talk to support
            </Link>
          </FadeIn>
        </div>
        <div className="relative min-h-[260px] md:order-1 md:min-h-[320px]">
          <Image
            src={marketingImages.consultation}
            alt="Patient counselling and care coordination — assistance program support"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent md:bg-gradient-to-l" />
        </div>
      </ContentSection>

      <ContentSection>
        <FadeIn>
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground md:text-3xl">How we support your team</h2>
          <p className="mt-4 max-w-3xl text-muted-foreground leading-relaxed">
            Think of us as the procurement + access liaison: we chase manufacturer desks, align documents with your pharmacy
            format, and keep a single thread so families are not bounced between three WhatsApp groups.
          </p>
        </FadeIn>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {programTypes.map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.06}>
              <div className="h-full rounded-xl border-2 border-border/80 bg-muted/20 p-5">
                <h3 className="font-medium text-foreground">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </ContentSection>

      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="relative min-h-[260px] overflow-hidden rounded-2xl border-2 border-border shadow-sm">
          <Image
            src={marketingImages.hospitalInterior}
            alt="Hospital setting — patient assistance in clinical context"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        <ContentSection className="h-full">
          <FadeIn>
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground md:text-3xl">What speeds things up</h2>
            <ul className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <li>
                <strong className="text-foreground">Therapy line and molecule</strong> — exact brand or INN if the program is
                brand-tied.
              </li>
              <li>
                <strong className="text-foreground">City and treating centre</strong> — some programs are geography-bound.
              </li>
              <li>
                <strong className="text-foreground">Where the patient is in treatment</strong> — new start vs continuation
                changes document sets.
              </li>
              <li>
                <strong className="text-foreground">Your internal SPOC</strong> — one email thread beats seventeen forwards.
              </li>
            </ul>
          </FadeIn>
        </ContentSection>
      </div>

      <ContentSection>
        <FadeIn>
          <h2 className="font-[family-name:var(--font-display)] text-xl text-foreground md:text-2xl">What we will not do</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Clear boundaries keep everyone safe — clinical, legal, and reputational.
          </p>
        </FadeIn>
        <ul className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          {boundaries.map((b) => (
            <li key={b} className="flex gap-3 rounded-lg border border-border/60 bg-muted/10 p-3">
              <span className="text-primary" aria-hidden>
                —
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </ContentSection>

      <ContentSection className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="relative h-40 w-full overflow-hidden rounded-xl border border-border/80 md:h-32 md:w-52 md:shrink-0">
          <Image
            src={marketingImages.research}
            alt="Research and access — specialty therapy support"
            fill
            className="object-cover"
            sizes="200px"
          />
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl text-foreground">Start a conversation</h2>
          <p className="mt-2 max-w-xl text-muted-foreground leading-relaxed">
            If you already have a patient on file, mention the therapy line and city in your first message — it helps us route
            you to the right manufacturer lane faster.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/contact-us" className={cn(buttonVariants())}>
              Contact the desk
            </Link>
          </div>
        </div>
      </ContentSection>
    </ContentPage>
  );
}
