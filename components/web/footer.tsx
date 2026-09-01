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
        <div className="mx-auto flex max-w-350 flex-col items-center gap-4 px-4 text-center text-xs text-foreground/72 md:flex-row md:justify-between md:px-8 md:text-left">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <p>© 2026 {contactConfig.companyName}. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 md:justify-start">
              {policyLinks.map((link) => (
                <Link key={link.href} className="transition-colors duration-200 hover:text-foreground" href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <a
            href="https://bhajamaach.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/60 transition-colors duration-200 hover:text-foreground"
          >
            Made with care by <span className="text-foreground/80">ByteTwo Studios</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
