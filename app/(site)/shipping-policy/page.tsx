import type { Metadata } from "next";
import { connection } from "next/server";
import { ContentPage } from "@/components/web/content-page";
import { PolicyContactBlock, PolicyHero, PolicyList, PolicySection } from "@/components/web/policy-content";
import { defaultPublicContactConfig, getContactConfig } from "@/lib/contact-config";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy",
  description:
    "How SSG Pharma delivers pharmaceutical products across India — estimated timelines, prescription checks, packaging, cold-chain handling, and delivery-related concerns.",
  alternates: {
    canonical: `${siteUrl}/shipping-policy`,
  },
};

export default async function ShippingPolicyPage() {
  await connection();
  const contactConfig = await getContactConfig().catch(() => defaultPublicContactConfig);

  return (
    <ContentPage width="comfortable" variant="frame">
      <PolicyHero
        eyebrow="Legal"
        title="Shipping & Delivery Policy"
        intro="Information about the delivery of pharmaceutical products within India, including estimated timelines, prescription checks, packaging, cold-chain handling, and delivery-related concerns."
      />

      <PolicySection title="How we operate">
        <p>
          {contactConfig.companyName} does not currently operate an online cart or checkout system. Orders are arranged directly
          with our team through phone, WhatsApp, or email.
        </p>
        <p>
          After an order is confirmed and payment has been received, we prepare and dispatch the pharmaceutical products through
          our delivery network. This policy explains our general shipping and delivery procedures.
        </p>
      </PolicySection>

      <PolicySection title="Delivery zones & timelines">
        <p>We deliver pharmaceutical products across India. The following are estimated delivery periods:</p>
        <PolicyList
          items={[
            <span key="delhi"><strong className="text-foreground">Delhi NCR:</strong> Same day to next day.</span>,
            <span key="metro"><strong className="text-foreground">Metro cities:</strong> Approximately 2–3 days, including cities such as Mumbai, Bangalore, Chennai, and others.</span>,
            <span key="rest"><strong className="text-foreground">Rest of India:</strong> Approximately 3–5 days, including Tier 2, Tier 3, and other locations.</span>,
          ]}
        />
        <p>
          Delivery estimates are calculated from dispatch and are not guaranteed. Weather, public holidays, courier delays, and
          accessibility of remote locations may affect delivery times. Some restricted or remote areas may require additional time.
        </p>
      </PolicySection>

      <PolicySection title="Order processing">
        <p>Once the order has been confirmed and payment received, the general process is:</p>
        <h3>1. Order confirmation</h3>
        <p>You will receive confirmation through WhatsApp, phone, or email. The confirmation will include the products, quantities, and total amount.</p>
        <h3>2. Prescription verification, where applicable</h3>
        <p>Prescription medicines require a valid prescription from a licensed medical practitioner before dispatch.</p>
        <h3>3. Packaging & quality check</h3>
        <p>Products are inspected, securely packaged, and labelled. Temperature-sensitive items are handled using appropriate cold-chain packaging.</p>
        <h3>4. Dispatch & tracking</h3>
        <p>Orders are generally dispatched within 1–2 business days. Tracking information will be provided when available.</p>
      </PolicySection>

      <PolicySection title="Packaging & handling">
        <p>We follow appropriate pharmaceutical packaging practices to help protect products during transportation.</p>
        <h3>Cold chain management</h3>
        <p>
          Temperature-sensitive medicines, such as biologics, insulin, and certain injections, are transported using insulated
          packaging and gel packs designed to maintain the required temperature during transit.
        </p>
        <h3>Tamper-proof packaging</h3>
        <p>Shipments are sealed using tamper-evident packaging to help protect product integrity. Customers should inspect packages on delivery and report signs of tampering promptly.</p>
        <h3>Secure packaging</h3>
        <p>Products are placed in sturdy corrugated boxes with bubble wrap or other cushioning where appropriate to reduce the risk of damage.</p>
        <h3>Proper labelling</h3>
        <p>Shipments include clear product information, batch details, expiry dates, and applicable handling instructions as required by pharmaceutical regulations.</p>
      </PolicySection>

      <PolicySection title="Shipping charges">
        <p>If shipping fees apply, they will be communicated when the order is confirmed. Charges may depend on:</p>
        <PolicyList
          items={[
            "Delivery destination and distance.",
            "Order weight and volume.",
            "Special handling requirements, including cold-chain or fragile shipments.",
            "Urgent or expedited delivery requests.",
          ]}
        />
        <p>Free delivery may be available above a specified order value. Customers should confirm current offers and delivery charges with our team for their location.</p>
      </PolicySection>

      <PolicySection title="Damaged or incorrect shipments">
        <p>If you receive a damaged, defective, or incorrect product:</p>
        <PolicyList
          items={[
            "Contact us within 24 hours of receiving the shipment.",
            "Send clear photographs of the product and packaging.",
            "Provide the relevant order information.",
          ]}
        />
        <p>We will review the issue and work to resolve it as quickly as reasonably possible. Depending on the circumstances, this may include sending a replacement shipment at no additional cost.</p>
      </PolicySection>

      <PolicySection title="Undelivered orders">
        <p>Delivery may fail because of:</p>
        <PolicyList
          items={[
            "An incorrect or incomplete delivery address.",
            "The recipient being unavailable after repeated delivery attempts.",
            "A restricted or inaccessible delivery area.",
            "Force majeure circumstances, including natural disasters or strikes.",
          ]}
        />
        <p>In such circumstances, please contact our team to arrange another delivery attempt. Additional charges may apply.</p>
      </PolicySection>

      <PolicySection title="Important information">
        <PolicyList
          items={[
            "At present, deliveries are limited to locations within India; international shipping is not available.",
            "All stated delivery periods are estimates and are not guaranteed.",
            "We are not responsible for delays caused by courier partners, customs, weather, or unforeseen circumstances.",
            "Please ensure an appropriate person is available at the delivery address to receive the shipment.",
            "Prescription documentation may be requested at delivery where applicable.",
          ]}
        />
      </PolicySection>

      <PolicyContactBlock contactConfig={contactConfig} />
    </ContentPage>
  );
}
