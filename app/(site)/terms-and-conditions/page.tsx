import type { Metadata } from "next";
import { connection } from "next/server";
import { ContentPage } from "@/components/web/content-page";
import { PolicyContactBlock, PolicyHero, PolicyList, PolicySection } from "@/components/web/policy-content";
import { defaultPublicContactConfig, getContactConfig } from "@/lib/contact-config";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms governing your access to and use of the SSG Pharma website, including how orders, payments, and prescription requirements work.",
  alternates: {
    canonical: `${siteUrl}/terms-and-conditions`,
  },
};

export default async function TermsAndConditionsPage() {
  await connection();
  const contactConfig = await getContactConfig().catch(() => defaultPublicContactConfig);

  return (
    <ContentPage width="comfortable" variant="frame">
      <PolicyHero
        eyebrow="Legal"
        title="Terms & Conditions"
        intro="Please review these terms before using the website or its services. Your continued use of the website indicates acceptance of these terms."
      />

      <PolicySection title="Agreement to terms">
        <p>
          These Terms of Use form a legally binding agreement between you and {contactConfig.companyName} concerning your access to
          and use of this website, together with any related media, channels, mobile websites, mobile applications, or connected
          services (collectively, the &ldquo;Site&rdquo;). By accessing or using the Site, you confirm that you have read, understood, and
          agreed to follow these Terms.
        </p>
      </PolicySection>

      <PolicySection title="Intellectual property rights">
        <p>
          Unless stated otherwise, the Site and its source code, databases, functionality, software, designs, audio, video, written
          material, photographs, graphics, trademarks, service marks, and logos are owned or controlled by {contactConfig.companyName} or
          used under an appropriate licence. These materials are protected by copyright, trademark, and other intellectual-property
          laws.
        </p>
        <p>
          The Site and its content are supplied on an &ldquo;AS IS&rdquo; basis for information and personal use. Unless these Terms expressly
          permit otherwise, no part of the Site or its content may be copied, reproduced, collected, republished, uploaded, posted,
          publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or commercially exploited without prior
          written permission.
        </p>
      </PolicySection>

      <PolicySection title="User representations">
        <p>By using the Site, you confirm and represent that:</p>
        <PolicyList
          items={[
            "Information submitted during registration will be truthful, accurate, current, and complete.",
            "You will keep your registration information accurate and update it when necessary.",
            "You have the legal capacity to enter into these Terms and will comply with them.",
            "You are at least 18 years old and are not considered a minor under the laws applicable to you.",
            "You will not access the Site using automated or non-human means.",
            "You will not use the Site for unlawful or unauthorised purposes.",
            "Your use of the Site will comply with applicable laws and regulations.",
          ]}
        />
      </PolicySection>

      <PolicySection title="Orders and payment">
        <h3>How to place orders</h3>
        <p>
          {contactConfig.companyName} operates as an offline pharmaceutical distributor and retailer. The website does not provide a
          direct online shopping or checkout facility. Customers may submit enquiries or place orders through:
        </p>
        <PolicyList items={["Phone call", "WhatsApp", "Email"]} />
        <p>
          Our team will communicate pricing, availability, and payment terms directly during the enquiry process. Accepted payment
          methods may include bank transfer, UPI, and other methods mutually agreed upon when the order is confirmed.
        </p>
        <p>
          Every order is dependent on product availability and confirmation by our team. {contactConfig.companyName} may decline or
          cancel an order at its discretion. Any prices displayed on the website are indicative and may change depending on quantity,
          availability, and current market conditions.
        </p>
      </PolicySection>

      <PolicySection title="Prescription requirement">
        <p>
          Some pharmaceutical products displayed on the website may be prescription medicines regulated under the Drugs and
          Cosmetics Act, 1940, and applicable rules. Such products will be supplied only against a valid prescription issued by a
          licensed medical practitioner. Orders for schedule drugs that do not include a valid prescription will not be processed.
          {" "}
          {contactConfig.companyName} may request, review, and verify prescriptions before an order is processed.
        </p>
      </PolicySection>

      <PolicyContactBlock contactConfig={contactConfig} />
    </ContentPage>
  );
}
