"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const MESSAGE_MAX = 2000;

const inquiryTypes = [
  { value: "general", label: "General Inquiry" },
  { value: "product", label: "Product Information" },
  { value: "partnership", label: "Partnership Opportunity" },
  { value: "wholesale", label: "Wholesale Inquiry" },
  { value: "complaint", label: "Complaint/Feedback" },
  { value: "other", label: "Other" },
];

type Status = "idle" | "submitting" | "success" | "error";

function Field({ id, label, required, children }: { id: string; label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="block font-semibold">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </Label>
      {children}
    </div>
  );
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [messageLength, setMessageLength] = useState(0);

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
        body: JSON.stringify({ ...data, phone: data.phone || undefined, company: data.company || undefined }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Something went wrong. Please try again.");

      form.reset();
      setMessageLength(0);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-6 py-14 text-center" role="status">
        <CheckCircle2 className="size-10 text-primary" />
        <h3 className="font-[family-name:var(--font-display)] text-2xl text-foreground">Message sent</h3>
        <p className="max-w-md text-sm text-muted-foreground">
          Thank you for reaching out. Our team will get back to you as soon as possible.
        </p>
        <button type="button" onClick={() => setStatus("idle")} className="mt-2 text-sm font-medium text-primary hover:underline">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" id="contact-form">
      {/* Honeypot: hidden from users, filled by bots */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field id="name" label="Full Name" required>
          <Input id="name" name="name" required minLength={2} maxLength={100} autoComplete="name" placeholder="Enter your full name" />
        </Field>
        <Field id="email" label="Email Address" required>
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="Enter your email address" />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field id="phone" label="Phone Number">
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            pattern="[+]?[0-9\s\-()]{10,20}"
            title="Please enter a valid phone number (10-15 digits)"
            placeholder="Enter your phone number (e.g., +91 9876543210)"
          />
        </Field>
        <Field id="company" label="Company/Organization">
          <Input id="company" name="company" maxLength={200} autoComplete="organization" placeholder="Enter your company name" />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field id="inquiryType" label="Inquiry Type">
          <select
            id="inquiryType"
            name="inquiryType"
            defaultValue="general"
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] md:text-sm dark:bg-input/30",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            )}
          >
            {inquiryTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field id="subject" label="Subject" required>
          <Input id="subject" name="subject" required minLength={5} maxLength={200} placeholder="Brief subject of your inquiry" />
        </Field>
      </div>

      <Field id="message" label="Message" required>
        <Textarea
          id="message"
          name="message"
          rows={5}
          required
          minLength={20}
          maxLength={MESSAGE_MAX}
          className="resize-none"
          placeholder="Please provide detailed information about your inquiry, including any specific requirements or questions you may have..."
          onChange={(e) => setMessageLength(e.target.value.length)}
        />
        <p className="text-xs text-muted-foreground">
          {messageLength}/{MESSAGE_MAX} characters
        </p>
      </Field>

      {status === "error" ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}

      <div className="pt-2">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl disabled:pointer-events-none disabled:opacity-60"
        >
          <Send className="size-4 group-hover:animate-pulse" />
          {status === "submitting" ? "Sending..." : "Send Message"}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>

      <p className="pt-1 text-center text-xs text-muted-foreground">We typically respond within 24 hours during business days.</p>
    </form>
  );
}
