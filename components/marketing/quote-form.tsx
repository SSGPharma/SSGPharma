"use client";

import { useState } from "react";
import { CheckCircle2, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const urgencyOptions = [
  { value: "low", label: "Low — standard lead time" },
  { value: "medium", label: "Medium — preferred within 2 weeks" },
  { value: "high", label: "High — needed within 1 week" },
  { value: "urgent", label: "Urgent — same-day / emergency" },
];

type Status = "idle" | "submitting" | "success" | "error";

export function QuoteForm({ productName }: { productName?: string | null }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  // Derived prefilled product (server passes validated name; form just displays)
  const prefilledProduct = productName ?? "";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

    setStatus("submitting");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          phone: data.phone || undefined,
          company: data.company || undefined,
          dosage: data.dosage || undefined,
          inquiryType: "quote",
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Something went wrong. Please try again.");

      form.reset();
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-6 py-14 text-center" role="status">
        <CheckCircle2 className="size-10 text-primary" />
        <h3 className="font-[family-name:var(--font-display)] text-2xl text-foreground">Quote request received</h3>
        <p className="max-w-md text-sm text-muted-foreground">Our procurement team will review your requirements and respond within one business day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" aria-label="Quote request form">
      <section aria-label="Contact and institution">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-foreground">Contact & Institution</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="quote-name" className="block font-semibold">Full name <span className="text-destructive">*</span></Label>
          <Input id="quote-name" name="name" required minLength={2} maxLength={100} placeholder="Dr. A. Sharma" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quote-company" className="block font-semibold">Organization / Hospital <span className="text-destructive">*</span></Label>
          <Input id="quote-company" name="company" required minLength={2} maxLength={200} placeholder="City Hospital" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="quote-email" className="block font-semibold">Email <span className="text-destructive">*</span></Label>
          <Input id="quote-email" name="email" type="email" required maxLength={254} placeholder="procurement@hospital.org" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quote-phone" className="block font-semibold">Phone</Label>
          <Input id="quote-phone" name="phone" maxLength={40} placeholder="+91 98765 43210" />
        </div>
      </div>

      </section>
      <section aria-label="Product requirements">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-foreground">Product & Requirements</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="quote-product" className="block font-semibold">Product / Molecule <span className="text-destructive">*</span></Label>
          <Input id="quote-product" name="product" required minLength={2} maxLength={200} placeholder="Paracetamol 500mg" defaultValue={prefilledProduct} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quote-dosage" className="block font-semibold">Dosage / Strength (optional)</Label>
          <Input id="quote-dosage" name="dosage" maxLength={100} placeholder="500mg / 100mg / 10ml" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quote-quantity" className="block font-semibold">Quantity / Unit</Label>
          <Input id="quote-quantity" name="quantity" maxLength={100} placeholder="100 strips / 500 vials" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="quote-urgency" className="block font-semibold">Urgency <span className="text-destructive">*</span></Label>
          <select id="quote-urgency" name="urgency" required className="w-full rounded-xl border border-border/70 bg-muted/30 px-4 py-3 text-sm text-foreground outline-none focus:border-primary/60">
            <option value="">Select urgency</option>
            {urgencyOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quote-delivery" className="block font-semibold">Delivery location</Label>
          <Input id="quote-delivery" name="delivery" maxLength={200} placeholder="Mumbai / Delhi / Export" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="quote-subject" className="block font-semibold">Subject <span className="text-destructive">*</span></Label>
        <Input id="quote-subject" name="subject" required minLength={5} maxLength={200} placeholder="Quote request — hospital indent" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="quote-message" className="block font-semibold">Notes / Requirements <span className="text-destructive">*</span></Label>
        <Textarea id="quote-message" name="message" required minLength={20} maxLength={2000} rows={4} placeholder="Package size, dosage, preferred brands, substitution notes." />
      </div>

      </section>

      <div className="relative">
        <input type="text" name="website" aria-label="Leave blank" tabIndex={-1} autoComplete="off" className="absolute -left-9999 -top-9999 h-0 w-0 opacity-0" />
      </div>

      {status === "error" && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className={cn(buttonVariants({ size: "lg" }), "w-full md:w-auto gap-2")}
      >
        {status === "submitting" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        {status === "submitting" ? "Submitting…" : "Submit quote request"}
      </button>
    </form>
  );
}
