import type { ReactNode } from "react";
import { FadeIn } from "@/components/motion/fade-in";
import { ContentSection } from "@/components/web/content-section";
import {
  formatBusinessDays,
  formatBusinessHours,
  formatMailtoHref,
  formatPhoneHref,
  type ContactConfigRecord,
} from "@/lib/contact-config";
import { getSiteUrl } from "@/lib/site-url";

export function PolicyHero({ eyebrow, title, intro }: { eyebrow: string; title: string; intro: string }) {
  return (
    <ContentSection>
      <FadeIn>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-foreground md:text-5xl">
          {title}
        </h1>
        <p className="mt-5 text-muted-foreground leading-relaxed md:text-lg">{intro}</p>
      </FadeIn>
    </ContentSection>
  );
}

export function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <ContentSection>
      <FadeIn>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground md:text-3xl">{title}</h2>
        <div className="mt-5 space-y-4 text-muted-foreground leading-relaxed [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:leading-normal">
          {children}
        </div>
      </FadeIn>
    </ContentSection>
  );
}

export function PolicyList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-primary">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export function PolicyContactBlock({ contactConfig }: { contactConfig: ContactConfigRecord }) {
  const address = [contactConfig.officeAddress, contactConfig.officeCity, contactConfig.officeState, contactConfig.officeZipCode]
    .filter(Boolean)
    .join(", ");
  const primaryPhone = contactConfig.phones[0];
  const primaryEmail = contactConfig.emails.find((email) => email.type === "general") ?? contactConfig.emails[0];
  const siteUrl = getSiteUrl();

  return (
    <PolicySection title="Contact us">
      <p>
        <strong className="text-foreground">{contactConfig.companyName}</strong>
        <br />
        {address}
      </p>
      <p suppressHydrationWarning>
        {formatBusinessDays(contactConfig)} · {formatBusinessHours(contactConfig)} IST
      </p>
      <ul className="space-y-1">
        {primaryEmail ? (
          <li>
            Email:{" "}
            <a suppressHydrationWarning className="text-primary transition-colors hover:text-primary/80" href={formatMailtoHref(primaryEmail.value)}>
              {primaryEmail.value}
            </a>
          </li>
        ) : null}
        {primaryPhone ? (
          <li>
            Phone:{" "}
            <a suppressHydrationWarning className="text-primary transition-colors hover:text-primary/80" href={formatPhoneHref(primaryPhone.value)}>
              {primaryPhone.value}
            </a>
          </li>
        ) : null}
        <li>
          Website:{" "}
          <a className="text-primary transition-colors hover:text-primary/80" href={siteUrl}>
            {siteUrl.replace(/^https?:\/\//, "")}
          </a>
        </li>
      </ul>
    </PolicySection>
  );
}
