import Link from "next/link";
import { defaultPublicContactConfig, formatBusinessDays, formatBusinessHours, formatMailtoHref, formatPhoneHref } from "@/lib/contact-config";
import { productDivisions, serviceLines } from "@/lib/divisions";

const policyLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Disclaimer", href: "/disclaimer" },
  { label: "Return Policy", href: "/return-policy" },
  { label: "Shipping Policy", href: "/shipping-policy" },
];

export function SiteFooter() {
  const contactConfig = defaultPublicContactConfig;
  const uniqueEmails = contactConfig.emails.filter(
    (email, index, emails) => emails.findIndex((candidate) => candidate.value === email.value) === index,
  );

  return (
    <footer className="mt-auto w-full border-t-2 border-border bg-muted/40">
      <div className="mx-auto grid max-w-350 gap-12 px-4 py-14 md:grid-cols-[1.2fr_1fr_1fr_1.2fr] md:px-8">
        <div className="space-y-4">
          <p className="font-(family-name:--font-display) text-xl text-foreground">{contactConfig.companyName}</p>
          <p className="text-sm leading-relaxed text-foreground/78">
            {contactConfig.businessType}. Wholesale and specialty medicines with careful handling and responsive support.
          </p>
          <div className="space-y-2 text-sm text-foreground/72">
            {contactConfig.officeAddress ? <p suppressHydrationWarning>{contactConfig.officeAddress}</p> : null}
            <p suppressHydrationWarning>{[contactConfig.officeCity, contactConfig.officeState, contactConfig.officeZipCode].filter(Boolean).join(", ")}</p>
            <p suppressHydrationWarning>
              {formatBusinessDays(contactConfig)} · {formatBusinessHours(contactConfig)}
            </p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-medium text-foreground">Divisions</p>
          <ul className="space-y-2 text-foreground/72">
            {productDivisions.map((d) => (
              <li key={d.slug}>
                <Link className="transition-colors duration-200 hover:text-foreground" href={`/divisions/${d.slug}`}>
                  {d.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-medium text-foreground">Services</p>
          <ul className="space-y-2 text-foreground/72">
            {serviceLines.map((s) => (
              <li key={s.slug}>
                <Link className="transition-colors duration-200 hover:text-foreground" href={s.href}>
                  {s.title}
                </Link>
              </li>
            ))}
            <li>
              <Link className="transition-colors duration-200 hover:text-foreground" href="/contact-us">
                Contact
              </Link>
            </li>
            <li>
              <Link className="transition-colors duration-200 hover:text-foreground" href="/get-a-quote">
                Request a quote
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-medium text-foreground">Contact</p>
          <ul className="space-y-2 text-foreground/72">
            {contactConfig.phones.map((phone) => (
              <li key={phone.id}>
                <a suppressHydrationWarning className="transition-colors duration-200 hover:text-foreground" href={formatPhoneHref(phone.value)}>
                  {phone.description ? `${phone.description}: ` : ""}
                  {phone.value}
                </a>
              </li>
            ))}
            {uniqueEmails.map((email) => (
              <li key={email.id}>
                <a suppressHydrationWarning className="transition-colors duration-200 hover:text-foreground" href={formatMailtoHref(email.value)}>
                  {email.value}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60 py-6">
        <div className="mx-auto flex max-w-350 flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 text-xs text-foreground/72 md:px-8">
          {policyLinks.map((link) => (
            <Link key={link.href} className="transition-colors duration-200 hover:text-foreground" href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-border/60 py-6">
        <div className="mx-auto flex max-w-350 flex-col items-center justify-between gap-3 px-4 text-center text-xs text-foreground/72 md:flex-row md:px-8 md:text-left">
          <p>© 2026 {contactConfig.companyName}. All rights reserved.</p>
          <p className="inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-[11px] tracking-[0.18em] text-foreground/88 shadow-sm ring-1 ring-primary/10 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-px hover:border-primary/40 hover:shadow-md">
            <span className="inline-flex size-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(13,115,119,0.08)]" aria-hidden />
            <span className="font-medium text-primary">Made with love</span>
            <span className="text-foreground/50">by</span>
            <span className="rounded-full bg-foreground/8 px-2 py-0.5 font-semibold text-foreground">ByteTwo Studios</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
