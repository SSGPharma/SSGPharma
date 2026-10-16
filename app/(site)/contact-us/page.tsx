import type { Metadata } from "next";
import { connection } from "next/server";
import { Clock, ExternalLink, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { ContactFaq } from "@/components/marketing/contact-faq";
import { ContactForm } from "@/components/marketing/contact-form";
import { FadeIn } from "@/components/motion/fade-in";
import { ManagedImage } from "@/components/web/managed-image";
import {
  defaultPublicContactConfig,
  formatBusinessHours,
  formatMailtoHref,
  formatPhoneHref,
  getContactConfig,
} from "@/lib/contact-config";
import type { ContactConfigRecord } from "@/lib/contact-config";
import { marketingImages } from "@/lib/marketing-images";
import { getSiteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Contact SSG Pharma for hospital indents, wholesale quotes, and specialty medicine enquiries — phone, email, hours, office location, and an enquiry form.",
  alternates: {
    canonical: `${siteUrl}/contact-us`,
  },
};

function getBusinessHourRows(config: ContactConfigRecord) {
  const hours = formatBusinessHours(config);
  return [
    { label: "Monday - Friday:", open: config.businessDaysMonFri, hours },
    { label: "Saturday:", open: config.businessDaysSat, hours },
    { label: "Sunday:", open: config.businessDaysSun, hours },
  ];
}

function SectionHeading({ title, description, className }: { title: string; description: string; className?: string }) {
  return (
    <div className={cn("mb-8 text-center md:mb-12", className)}>
      <div className="mb-4 inline-block">
        <h2 className="mb-2 font-[family-name:var(--font-display)] text-3xl text-foreground md:text-4xl">{title}</h2>
        <div className="mx-auto h-1 w-24 rounded bg-gradient-to-r from-primary to-primary/30" />
      </div>
      <p className="mx-auto max-w-3xl text-lg text-muted-foreground">{description}</p>
    </div>
  );
}

function InfoCard({ icon: Icon, title, children }: { icon: typeof MapPin; title: string; children: React.ReactNode }) {
  return (
    <div className="group rounded-lg border border-border border-l-4 border-l-primary bg-card p-4 shadow-md transition-all duration-300 hover:shadow-lg md:p-5">
      <div className="flex items-start">
        <div className="mr-3 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="mb-2 text-lg font-bold text-foreground transition-colors duration-300 group-hover:text-primary">{title}</h3>
          {children}
        </div>
      </div>
    </div>
  );
}

export default async function ContactPage() {
  await connection();
  const config = await getContactConfig().catch(() => defaultPublicContactConfig);

  const primaryPhone =
    config.phones.find((phone) => phone.purpose === "procurement") ?? config.phones[0];
  const primaryEmail =
    config.emails.find((email) => email.type === "general") ?? config.emails[0];

  const addressLines = [config.officeAddress, [config.officeCity, config.officeState].filter(Boolean).join(", "), config.officeZipCode].filter(
    (line): line is string => Boolean(line),
  );
  const fullAddress = addressLines.join(", ");
  const mapQuery = encodeURIComponent(`${config.companyName}, ${fullAddress}`);
  const mapsLink = `https://maps.google.com/?q=${mapQuery}`;
  const directionsLink = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;
  const hourRows = getBusinessHourRows(config);
  const firstOpenRow = hourRows.find((row) => row.open);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[oklch(0.2_0.04_195)] to-[oklch(0.42_0.11_195)] text-white">
        <div className="relative z-10 mx-auto max-w-[1400px] px-4 py-12 pb-24 sm:px-6 md:px-8 lg:py-16 lg:pb-28">
          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
            <FadeIn className="space-y-6 md:space-y-8">
              <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight md:text-5xl xl:text-6xl">
                Get in <span className="text-primary-foreground/70">Touch</span> With Us
              </h1>
              <p className="text-base text-white/80 md:text-lg xl:text-xl">
                We&apos;re here to help with all your pharmaceutical needs. Reach out to us with any questions or inquiries and we&apos;ll respond promptly.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                {primaryPhone ? (
                  <a
                    href={formatPhoneHref(primaryPhone.value)}
                    suppressHydrationWarning
                    className="rounded-md bg-white px-6 py-3 text-center font-semibold text-[oklch(0.2_0.04_195)] transition duration-300 hover:bg-white/90"
                  >
                    Call Now
                  </a>
                ) : null}
                {primaryEmail ? (
                  <a
                    href={formatMailtoHref(primaryEmail.value)}
                    suppressHydrationWarning
                    className="rounded-md border border-white/60 px-6 py-3 text-center font-semibold text-white transition duration-300 hover:bg-white/10"
                  >
                    Email Us
                  </a>
                ) : null}
              </div>
            </FadeIn>
            <div className="relative h-64 overflow-hidden rounded-lg shadow-2xl md:h-96">
              <ManagedImage
                src={marketingImages.reception}
                alt={`Contact ${config.companyName}`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" preserveAspectRatio="none" className="block h-12 w-full md:h-20" aria-hidden="true">
            <path fill="var(--background)" d="M0,64 C240,112 480,112 720,80 C960,48 1200,16 1440,48 L1440,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      {/* Contact information + form */}
      <section className="bg-muted/30 py-12 lg:py-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8">
          <SectionHeading
            title="How Can We Help You?"
            description="Whether you need product information, wholesale pricing, or have specific pharmaceutical requirements, we're here to assist you."
          />
          <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
            <div className="space-y-4 lg:col-span-1">
              <div className="mb-6">
                <h3 className="mb-3 text-xl font-bold text-foreground">Get in Touch</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">We&apos;re committed to providing exceptional customer service and support.</p>
              </div>

              <InfoCard icon={MapPin} title="Our Location">
                <div suppressHydrationWarning className="space-y-1 text-sm text-muted-foreground">
                  {addressLines.length > 0 ? (
                    addressLines.map((line, i) => (
                      <p key={line} className={i === 0 ? "font-medium text-foreground" : undefined}>
                        {line}
                      </p>
                    ))
                  ) : (
                    <p>Address not set</p>
                  )}
                </div>
              </InfoCard>

              <InfoCard icon={Phone} title="Call Us">
                {config.phones.map((phone) => (
                  <a
                    key={phone.id}
                    suppressHydrationWarning
                    href={formatPhoneHref(phone.value)}
                    className="block text-base font-semibold text-foreground/80 transition-colors duration-300 hover:text-primary"
                  >
                    {phone.value}
                    {phone.description ? <span className="ml-2 text-xs font-normal text-muted-foreground">{phone.description}</span> : null}
                  </a>
                ))}
                <p className="mt-1 text-xs text-muted-foreground">Available during business hours</p>
              </InfoCard>

              <InfoCard icon={Mail} title="Email Us">
                {Array.from(new Set(config.emails.map((email) => email.value))).map((email) => (
                  <a
                    key={email}
                    suppressHydrationWarning
                    href={formatMailtoHref(email)}
                    className="block break-all text-base font-semibold text-foreground/80 transition-colors duration-300 hover:text-primary"
                  >
                    {email}
                  </a>
                ))}
                <p className="mt-1 text-xs text-muted-foreground">We respond within 24 hours</p>
              </InfoCard>

              <InfoCard icon={Clock} title="Business Hours">
                <div className="space-y-1 text-sm text-muted-foreground">
                  {hourRows.map((row) => (
                    <p key={row.label} className="flex justify-between gap-3">
                      <span>{row.label}</span>
                      <span className={cn("font-medium", row.open ? "text-foreground" : "text-destructive")}>
                        {row.open ? row.hours : "Closed"}
                      </span>
                    </p>
                  ))}
                </div>
              </InfoCard>
            </div>

            <div className="lg:col-span-2">
              <div className="h-fit rounded-lg border border-border bg-card p-6 shadow-lg transition-all duration-300 hover:shadow-xl md:p-8">
                <div className="mb-6">
                  <div className="mb-3 inline-block">
                    <h2 className="mb-2 font-[family-name:var(--font-display)] text-2xl text-foreground md:text-3xl">Send Us a Message</h2>
                    <div className="h-1 w-20 rounded bg-gradient-to-r from-primary to-primary/30" />
                  </div>
                  <p className="text-muted-foreground">Fill out the form below and we&apos;ll get back to you as soon as possible.</p>
                </div>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8">
          <SectionHeading
            title="Find Us"
            description={`Located in ${[config.officeCity, config.officeState].filter(Boolean).join(", ") || "our city"}, we're easily accessible and ready to serve your pharmaceutical needs.`}
            className="mb-12"
          />
          <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="bg-gradient-to-r from-[oklch(0.2_0.04_195)] to-[oklch(0.42_0.11_195)] p-6 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="mb-2 text-xl font-bold">{config.companyName} Office Location</h3>
                  <p suppressHydrationWarning className="text-white/80">{fullAddress}</p>
                </div>
                <a
                  href={directionsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden shrink-0 items-center gap-2 rounded-lg bg-white/20 px-4 py-2 transition duration-300 hover:bg-white/30 md:flex"
                >
                  <Navigation className="size-4" />
                  Get Directions
                </a>
              </div>
            </div>

            <div className="relative">
              <iframe
                title={`${config.companyName} office location map`}
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                width="100%"
                height="500"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-96 w-full md:h-[500px]"
              />
              <div className="absolute right-6 top-6 hidden max-w-sm rounded-xl border border-border bg-card/95 p-6 shadow-2xl backdrop-blur-sm md:block">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 rounded-full bg-primary p-3 text-primary-foreground">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <h4 className="mb-2 text-lg font-bold text-foreground">{config.companyName}</h4>
                    <div suppressHydrationWarning className="space-y-1 text-sm text-muted-foreground">
                      {addressLines.map((line, i) => (
                        <p key={line} className={i === 0 ? "font-semibold text-foreground" : undefined}>
                          {line}
                        </p>
                      ))}
                    </div>
                    <div className="mt-3 space-y-2 border-t border-border pt-3 text-sm text-muted-foreground">
                      {primaryPhone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="size-4 text-primary" />
                          <span suppressHydrationWarning>{primaryPhone.value}</span>
                        </div>
                      ) : null}
                      {firstOpenRow ? (
                        <div className="flex items-center gap-2">
                          <Clock className="size-4 text-primary" />
                          <span>
                            {firstOpenRow.label.replace(":", "")}: {firstOpenRow.hours}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute inset-x-6 bottom-6 flex gap-3 md:hidden">
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-center text-primary-foreground shadow-lg"
                >
                  <ExternalLink className="size-4" />
                  Open Map
                </a>
                <a
                  href={directionsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-center text-primary-foreground shadow-lg"
                >
                  <Navigation className="size-4" />
                  Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 md:px-8">
          <SectionHeading
            title="Frequently Asked Questions"
            description="Find quick answers to common questions about our pharmaceutical services and processes."
            className="md:mb-16"
          />
          <ContactFaq />

          <div className="mt-12 text-center">
            <h3 className="mb-3 font-[family-name:var(--font-display)] text-2xl text-foreground">Still Have Questions?</h3>
            <p className="mb-6 text-muted-foreground">Can&apos;t find the answer you&apos;re looking for? Our customer support team is here to help.</p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              {primaryPhone ? (
                <a
                  href={formatPhoneHref(primaryPhone.value)}
                  suppressHydrationWarning
                  className="rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground transition duration-300 hover:bg-primary/90"
                >
                  Call Us
                </a>
              ) : null}
              {primaryEmail ? (
                <a
                  href={formatMailtoHref(primaryEmail.value)}
                  suppressHydrationWarning
                  className="rounded-md border border-border bg-background px-6 py-3 font-semibold text-foreground transition duration-300 hover:bg-muted"
                >
                  Email Us
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
