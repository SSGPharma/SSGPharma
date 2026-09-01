"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Phone, Mail } from "lucide-react";
import { formatMailtoHref, formatPhoneHref, formatWhatsAppHref } from "@/lib/contact-info";

type FloatingInquiryProps = {
  primaryPhone: string;
  primaryEmail: string;
};

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#25D366" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function FloatingInquiry({ primaryPhone, primaryEmail }: FloatingInquiryProps) {
  const [open, setOpen] = useState(false);

  const actions = [
    {
      label: "Get a Quote",
      href: "/get-a-quote",
      icon: MessageCircle,
    },
    {
      label: "Call",
      href: formatPhoneHref(primaryPhone),
      icon: Phone,
      enabled: Boolean(primaryPhone),
    },
    {
      label: "WhatsApp Us",
      href: formatWhatsAppHref(primaryPhone),
      icon: WhatsAppIcon,
      enabled: Boolean(primaryPhone),
      target: "_blank" as const,
      rel: "noreferrer",
    },
    {
      label: "Email",
      href: formatMailtoHref(primaryEmail),
      icon: Mail,
      enabled: Boolean(primaryEmail),
    },
  ].filter((action) => action.enabled);

  return (
    <>
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:shadow-xl active:scale-95 md:size-14"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-expanded={open}
        aria-label={open ? "Close contact menu" : "Open contact menu"}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-20 right-6 z-40 w-56 rounded-xl border border-border bg-card/95 p-2 shadow-2xl backdrop-blur md:bottom-24 md:right-8"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-1">
              {actions.map((action) => {
                const Icon = action.icon;

                if (action.href.startsWith("/")) {
                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:bg-muted"
                    >
                      <Icon className="size-5 text-primary" />
                      <span>{action.label}</span>
                    </Link>
                  );
                }

                return (
                  <a
                    key={action.label}
                    href={action.href}
                    onClick={() => setOpen(false)}
                    target={action.target}
                    rel={action.rel}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:bg-muted"
                >
                  <Icon className="size-5 text-primary" />
                  <span>{action.label}</span>
                </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
