import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How do I request a quote?",
    answer:
      "Use the form above or call our procurement line. Share the generic or brand name, strength and pack size, approximate quantity, and delivery city so we can respond with accurate availability and pricing.",
  },
  {
    question: "How quickly will you respond?",
    answer:
      "We acknowledge most enquiries the same day during business hours. Priced quotes on stocked lines typically follow within 1–2 working days; specialty imports can take longer and we tell you upfront.",
  },
  {
    question: "Do you deliver across India?",
    answer:
      "Yes. Orders are generally dispatched within 1–2 business days. Delivery to metro cities typically takes about 2–3 days and the rest of India about 3–5 days. Temperature-sensitive items are shipped with cold-chain packaging.",
  },
  {
    question: "Can you source specialty or hard-to-find medicines?",
    answer:
      "Sourcing specialty medicines is a core part of what we do. If a product is not listed in our catalog, send us the details and our team will check availability through our supplier network.",
  },
  {
    question: "Who can I contact for urgent stock-outs?",
    answer:
      "Use the emergency or procurement phone lines listed on this page. They are monitored for urgent requirements outside regular business hours.",
  },
];

export function ContactFaq() {
  return (
    <div className="space-y-4 md:space-y-6">
      {faqs.map((faq) => (
        <details
          key={faq.question}
          className="group overflow-hidden rounded-xl border border-border bg-card shadow-md transition-all duration-300 hover:shadow-xl"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between p-6 text-left font-semibold text-foreground transition-colors duration-300 hover:bg-muted/50 md:p-8 [&::-webkit-details-marker]:hidden">
            <span className="pr-4 text-lg md:text-xl">{faq.question}</span>
            <ChevronDown className="size-5 shrink-0 text-primary transition-transform duration-300 group-open:rotate-180" />
          </summary>
          <div className="border-t border-border bg-muted/30 p-6 md:p-8">
            <p className="leading-relaxed text-muted-foreground">{faq.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
