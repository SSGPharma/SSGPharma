import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/motion/fade-in";
import { marketingImages } from "@/lib/marketing-images";
import { getSiteUrl } from "@/lib/site-url";

const base = getSiteUrl();
const path = "/services/hospital-supply";

export const metadata: Metadata = {
  title: "Hospital & ward medicine supply",
  description:
    "Indent-based hospital supply, consignment options, and escalation for urgent ward add-ons. SSG Pharma supports IPD, OT, and pharmacy replenishment across India.",
  alternates: { canonical: `${base}${path}` },
  openGraph: {
    url: `${base}${path}`,
    title: "Hospital medicine supply · SSG Pharma",
    images: [{ url: marketingImages.consultation, alt: "Hospital supply and clinical logistics" }],
  },
};

export default function HospitalSupplyPage() {
  return (
    <div className="w-full">
      <section className="relative mx-auto grid max-w-[1400px] md:grid-cols-2">
        <div className="relative min-h-[260px] md:min-h-[400px]">
          <Image
            src={marketingImages.consultation}
            alt="Clinical team coordinating hospital medicine supply"
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 50vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent md:bg-gradient-to-r" />
        </div>
        <div className="flex flex-col justify-center px-4 py-12 md:px-10 lg:px-14">
          <FadeIn>
            <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight md:text-5xl">Hospital supply</h1>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              Indents should not disappear into a portal. We assign a single operations thread to your account so repeat
              cycles, consignment agreements, and emergency top-ups stay traceable.
            </p>
          </FadeIn>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-2xl space-y-10 rounded-2xl border-2 border-border bg-card/60 p-8 shadow-sm md:p-12">
          <FadeIn>
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">How we work with IPD teams</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              We mirror your formulary where possible, flag molecules that habitually run long on lead time, and keep batch
              documentation ready for your pharmacy audit. When a protocol changes mid-quarter, you message the same desk —
              not a new ticket queue.
            </p>
          </FadeIn>
          <FadeIn delay={0.06}>
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">Cold chain and controlled lines</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Lines that need refrigeration or controlled handling get explicit checkpoints: packing photos when you want them,
              carrier SLAs we can explain, and honest ETAs when monsoon or airport delays stack up.
            </p>
          </FadeIn>
          <Link href="/contact-us" className="inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline">
            Send a hospital indent →
          </Link>
        </div>
      </div>
    </div>
  );
}
