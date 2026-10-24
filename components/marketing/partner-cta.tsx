import Image from "next/image";
import { Truck, ShieldCheck, Headphones } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PartnerCta() {
  return (
    <section className="w-full border-t border-border/60 bg-gradient-to-b from-primary/10 via-primary/[0.07] to-background py-16 md:py-24">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="relative mx-auto mb-10 aspect-[1565/1005] w-full max-w-xl overflow-hidden rounded-2xl border border-border/70 shadow-md">
            <Image
              src="/homepage-bottom.png"
              alt="Medicine warehousing and nationwide distribution"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Ready to Partner with SSG Pharma?
          </h2>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed md:text-xl">
            Connect with our team for pharmaceutical product enquiries, sourcing requirements, and institutional quotations.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/contact-us" className={cn(buttonVariants({ size: "lg" }), "gap-2")}>Contact Us Today</Link>
            <Link href="/quote" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>Request a Quote</Link>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3 lg:gap-10">
            <div className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur-sm text-center transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
                <Truck className="size-6" aria-hidden />
              </div>
              <h3 className="font-medium text-foreground">Product Enquiries</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Share the products you need and ask our team about availability.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur-sm text-center transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
                <ShieldCheck className="size-6" aria-hidden />
              </div>
              <h3 className="font-medium text-foreground">Quote Assistance</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Send your indent to request pricing and discuss suitable alternatives.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur-sm text-center transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
                <Headphones className="size-6" aria-hidden />
              </div>
              <h3 className="font-medium text-foreground">Direct Contact</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Reach out to our team to discuss your pharmaceutical supply requirements.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
