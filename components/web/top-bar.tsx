import { Mail, Phone } from "lucide-react";
import { formatMailtoHref, formatPhoneHref } from "@/lib/contact-info";
import type { ContactConfigRecord } from "@/lib/contact-info";

type TopBarProps = Pick<ContactConfigRecord, "phones" | "emails">;

function Divider() {
  return <span aria-hidden className="hidden h-1 w-1 rounded-full bg-current opacity-30 sm:block" />;
}

/** Slim contact strip above the navbar, driven by the admin contact config. */
export function TopBar({ phones, emails }: TopBarProps) {
  const uniqueEmails = Array.from(new Set(emails.map((email) => email.value)));
  if (phones.length === 0 && uniqueEmails.length === 0) return null;

  const items = [
    ...phones.map((phone) => ({ key: phone.id, href: formatPhoneHref(phone.value), label: phone.value, Icon: Phone })),
    ...uniqueEmails.map((email) => ({ key: email, href: formatMailtoHref(email), label: email, Icon: Mail })),
  ];

  return (
    <div className="w-full border-b border-white/10 bg-black text-white dark:border-black/10 dark:bg-white dark:text-neutral-900">
      <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-2 text-[13px] font-medium tracking-wide md:justify-start md:px-6 lg:px-8">
        {items.map(({ key, href, label, Icon }, i) => (
          <div key={key} className="flex items-center gap-4">
            {i > 0 ? <Divider /> : null}
            <a
              suppressHydrationWarning
              href={href}
              className="group flex items-center gap-2 transition-colors duration-200 hover:text-[oklch(0.72_0.12_195)] dark:hover:text-[oklch(0.42_0.11_195)]"
            >
              <Icon className="size-3.5 text-[oklch(0.72_0.12_195)] dark:text-[oklch(0.42_0.11_195)]" aria-hidden />
              {label}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
