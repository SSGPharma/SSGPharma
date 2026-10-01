import type { Metadata } from "next";
import { connection } from "next/server";
import { ContentPage } from "@/components/web/content-page";
import { PolicyContactBlock, PolicyHero, PolicyList, PolicySection } from "@/components/web/policy-content";
import { defaultPublicContactConfig, getContactConfig } from "@/lib/contact-config";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Return & Exchange Policy",
  description:
    "SSG Pharma's no-return, no-exchange approach for pharmaceutical products, and the quality measures we follow to protect product integrity and customer safety.",
  alternates: {
    canonical: `${siteUrl}/return-policy`,
  },
};

export default async function ReturnPolicyPage() {
  await connection();
  const contactConfig = await getContactConfig().catch(() => defaultPublicContactConfig);

  return (
    <ContentPage width="comfortable" variant="frame">
      <PolicyHero
        eyebrow="Legal"
        title="Return & Exchange Policy"
        intro="Information regarding our no-return/no-exchange approach for pharmaceutical products and the quality measures followed to protect product integrity and customer safety."
      />

      <PolicySection title="Important notice">
        <p>For safety, regulatory, and hygiene reasons, pharmaceutical products are generally not eligible for return or exchange.</p>
      </PolicySection>

      <PolicySection title="No returns policy">
        <p>Pharmaceutical products cannot be returned for the following reasons:</p>
        <h3>Safety & hygiene</h3>
        <p>After a medicine leaves our facility, we cannot independently confirm that it was stored, transported, or handled under the required conditions.</p>
        <h3>Regulatory compliance</h3>
        <p>Applicable pharmaceutical regulations restrict the resale of returned medicines in order to safeguard public health.</p>
        <h3>Product integrity</h3>
        <p>Once a product has left our controlled environment, we cannot fully verify its condition, integrity, or authenticity.</p>
        <h3>Patient safety</h3>
        <p>This policy is intended to maintain strong safety standards and reduce the possibility of contamination or compromised products.</p>
      </PolicySection>

      <PolicySection title="No exchanges policy">
        <p>We do not provide exchanges for pharmaceutical products, including situations involving:</p>
        <PolicyList
          items={[
            "A change of mind.",
            "An incorrect product selected by the customer.",
            "A change in size or quantity.",
            "Price differences or later discounts.",
            "Preference for an alternative product.",
            "A change in manufacturer or brand.",
          ]}
        />
        <p>
          All sales are final. {contactConfig.companyName} does not accept returns or exchanges for pharmaceutical products. Before
          confirming an order with our team, please carefully check the product, quantity, pack size, and other order details.
        </p>
      </PolicySection>

      <PolicySection title="Quality assurance">
        <p>Although returns and exchanges are not offered, we are committed to maintaining product quality through:</p>
        <PolicyList
          items={[
            "Sourcing products from licensed manufacturers.",
            "Following appropriate storage and handling procedures.",
            "Conducting routine quality checks and inspections.",
            "Following applicable pharmaceutical standards.",
          ]}
        />
      </PolicySection>

      <PolicySection title="Quality concerns">
        <p>If a product arrives damaged, defective, or expired, contact us promptly.</p>
        <h3>What to do</h3>
        <PolicyList
          items={[
            "Do not use the affected product.",
            "Photograph the product and its packaging clearly.",
            "Contact us within 24 hours of delivery.",
            "Share your order number and relevant details.",
          ]}
        />
        <p>We will review concerns relating to:</p>
        <PolicyList items={["Product quality.", "Manufacturing defects.", "Damage during shipping.", "Expiry-date issues."]} />
        <p>This process is a quality and customer-safety measure and should not be interpreted as a general return or exchange facility.</p>
      </PolicySection>

      <PolicySection title="Before you order">
        <p>For a smoother ordering experience, customers should:</p>
        <PolicyList
          items={[
            "Read product descriptions carefully.",
            "Check dosage and pack size.",
            "Verify the manufacturer.",
            "Confirm the required quantity.",
            "Consult an appropriate healthcare professional when necessary.",
          ]}
        />
      </PolicySection>

      <PolicySection title="Legal compliance">
        <p>This policy is intended to operate in accordance with applicable requirements, including:</p>
        <PolicyList
          items={[
            "Indian pharmaceutical regulations.",
            "Drugs and Cosmetics Act, 1940.",
            "Pharmacy Practice Regulations.",
            "Applicable consumer-protection laws.",
          ]}
        />
      </PolicySection>

      <PolicyContactBlock contactConfig={contactConfig} />
    </ContentPage>
  );
}
