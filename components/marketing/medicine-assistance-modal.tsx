"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { X, MessageCircle } from "lucide-react";
import { formatWhatsAppHref } from "@/lib/contact-info";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ssg-medicine-modal-dismissed";

type MedicineAssistanceModalProps = {
  /** Primary business phone from the existing contact configuration. */
  primaryPhone: string;
};

export function MedicineAssistanceModal({ primaryPhone }: MedicineAssistanceModalProps) {
  // Client-only guard — mirrors the FadeIn/StaggerList pattern so the initial
  // SSR render is deterministic (no hydration mismatch, no layout shift).
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const [open, setOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const prevActiveRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!mounted) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    try {
      const dismissed = sessionStorage.getItem(STORAGE_KEY);
      if (!dismissed) {
        // Slight delay so the page paints before the modal interrupts.
        t = setTimeout(() => setOpen(true), 400);
      }
    } catch {
      // sessionStorage unavailable — still show once
      t = setTimeout(() => setOpen(true), 400);
    }
    return () => {
      if (t) clearTimeout(t);
    };
  }, [mounted]);

  const handleOpenChange = useCallback((next: boolean): void => {
    setOpen(next);
    if (!next) {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // ignore
      }
      // Let Radix Dialog handle focus restoration to the trigger; do not
      // fight it by forcing focus to an unrelated element.
      prevActiveRef.current = null;
    } else {
      // Remember the trigger for context; actual restoration handled by Radix.
      prevActiveRef.current = document.activeElement;
    }
  }, []);

  // Prevent background scroll when open; restore on close
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Auto-focus close button on open for keyboard accessibility
  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);
    return () => clearTimeout(t);
  }, [open]);

  const reduce = useReducedMotion();

  if (!mounted) return null;

  const whatsappUrl = formatWhatsAppHref(primaryPhone);

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange} modal={true}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[55] bg-black/25 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:duration-200" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-[60] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/60 bg-card/95 p-6 shadow-2xl shadow-black/10 backdrop-blur-md sm:p-8",
            "focus:outline-none focus:ring-0",
            reduce ? "" : "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-200"
          )}
          aria-describedby="medicine-modal-desc"
        >
        <Dialog.Title className="sr-only">Need help with a medicine?</Dialog.Title>

        {/* Close button */}
        <Dialog.Close asChild>
          <button
            ref={closeBtnRef}
            type="button"
            aria-label="Close medicine assistance popup"
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/50 bg-muted/60 text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </Dialog.Close>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner">
            <MessageCircle className="h-7 w-7" aria-hidden="true" />
          </div>

          <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            Need help with a medicine?
          </h2>

          <p id="medicine-modal-desc" className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
            We&#39;re here to assist with availability, alternatives, and best prices. Reach out and we&#39;ll get back to you quickly.
          </p>

          <div className="mt-7 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/contact-us"
              onClick={() => handleOpenChange(false)}
              className={cn(
                "inline-flex h-10 items-center justify-center rounded-md px-6 text-sm font-medium shadow-md transition-all hover:shadow-lg active:translate-y-px",
                "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
            >
              Contact Now
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleOpenChange(false)}
              className={cn(
                "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-card px-6 text-sm font-medium shadow-sm transition-all hover:bg-muted hover:shadow active:translate-y-px",
                "text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-[#25D366]" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
