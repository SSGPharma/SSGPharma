import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden border-b border-border/50 bg-muted/15">
      <div className="mx-auto grid max-w-[1400px] items-center gap-0 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative z-10 px-4 py-12 md:px-8 lg:px-12 lg:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full bg-[radial-gradient(circle_at_center,oklch(0.72_0.14_195/0.35),transparent_65%)] blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 top-40 size-[380px] rounded-full bg-[radial-gradient(circle_at_center,oklch(0.78_0.08_145/0.28),transparent_65%)] blur-2xl"
          />

          <p className="relative mb-4 inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" />
            Specialty wholesale · India
          </p>

          <h1 className="relative font-[family-name:var(--font-display)] text-4xl leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-6xl lg:leading-[1.05]">
            Medicines your patients need, <span className="text-primary">without the runaround.</span>
          </h1>

          <p className="relative mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Oncology, diabetes, nephrology, and more — sourced carefully, stocked thoughtfully, and shipped with the urgency
            healthcare deserves.
          </p>

          <div className="relative mt-10 flex flex-wrap items-center gap-3">
            <Link href="/products" className={cn(buttonVariants({ size: "lg" }), "group gap-2 pr-3")}>
              Browse catalog
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/get-a-quote" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              Request quote
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-primary" />
              <span>Authentic sourcing</span>
            </div>
            <div className="h-1 w-1 rounded-full bg-border" />
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-primary" />
              <span>24/7 Support</span>
            </div>
            <div className="h-1 w-1 rounded-full bg-border" />
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-primary" />
              <span>Worldwide delivery</span>
            </div>
          </div>
        </div>

        <div className="relative aspect-[3/2] w-full">
          <Image
            src="/homepage-top.png"
            alt="Licensed pharmaceutical wholesale — quality medicines and supply chain"
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 48vw"
            priority
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent lg:bg-gradient-to-l" />
        </div>
      </div>
    </section>
  );
}
