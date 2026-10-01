import type { Metadata } from "next";
import { connection } from "next/server";
import { ContentPage } from "@/components/web/content-page";
import { PolicyContactBlock, PolicyHero, PolicyList, PolicySection } from "@/components/web/policy-content";
import { defaultPublicContactConfig, getContactConfig } from "@/lib/contact-config";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How SSG Pharma collects, uses, retains, and safeguards personal information while maintaining appropriate standards of privacy, security, and compliance.",
  alternates: {
    canonical: `${siteUrl}/privacy-policy`,
  },
};

export default async function PrivacyPolicyPage() {
  await connection();
  const contactConfig = await getContactConfig().catch(() => defaultPublicContactConfig);

  return (
    <ContentPage width="comfortable" variant="frame">
      <PolicyHero
        eyebrow="Legal"
        title="Privacy Policy"
        intro="How SSG Pharma collects, uses, retains, and safeguards personal information while maintaining appropriate standards of privacy, security, and compliance."
      />

      <PolicySection title="Introduction">
        <p>
          This Privacy Policy describes how {contactConfig.companyName} collects, uses, shares, and protects information when you
          visit our website or use the services made available through it.
        </p>
        <p>Please review this policy carefully before using the website. If you do not accept these terms, you should not access or use the site.</p>
      </PolicySection>

      <PolicySection title="Information we collect">
        <p>We may obtain information about you through several methods. The categories of information collected through the website may include:</p>
        <h3>Personal data</h3>
        <p>
          This may include information that can identify you, such as your name, shipping address, email address, telephone number,
          and certain demographic details such as age, gender, hometown, and interests. You provide this information voluntarily when
          registering or taking part in activities connected with the website. Providing personal information is generally optional;
          however, choosing not to provide required information may limit access to some website features.
        </p>
        <h3>Derivative data</h3>
        <p>
          Our systems may automatically record technical information when you visit the website. This can include your IP address,
          browser type, operating system, access times, and the pages you viewed immediately before and after visiting the site.
        </p>
        <p>{contactConfig.companyName} (referred to as &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting the privacy of people who use our website.</p>
      </PolicySection>

      <PolicySection title="Use of your information">
        <p>Having appropriate and accurate information helps us provide an efficient, relevant, and convenient experience. Information collected through the website may be used to:</p>
        <PolicyList
          items={[
            "Set up and administer your account.",
            "Handle orders and maintain account-related records.",
            "Send communications concerning your orders.",
            "Provide relevant advertising, updates, or newsletters.",
            "Provide products and services suited to your requirements.",
            "Process and administer purchases and related transactions.",
            "Create a user profile that can support future visits.",
            "Improve the website's performance and overall operation.",
            "Review and evaluate website usage patterns and trends.",
            "Inform you about website changes, improvements, or updates.",
            "Carry out other legitimate business activities when required.",
          ]}
        />
      </PolicySection>

      <PolicySection title="Cookies">
        <p>
          The website may use cookies and comparable technologies to improve browsing and functionality. Cookies are small files
          saved on your device. Essential cookies support core website functions, while analytics cookies help us understand how
          visitors use the site. You can manage or disable cookies through your browser settings, although doing so may reduce the
          availability of certain features.
        </p>
      </PolicySection>

      <PolicySection title="Data retention">
        <p>
          We keep personal information only for the period reasonably necessary for the purposes for which it was collected,
          including periods required for legal, regulatory, accounting, or reporting obligations. Once information is no longer
          needed, we will take reasonable steps to securely delete or anonymise it.
        </p>
      </PolicySection>

      <PolicySection title="Your rights">
        <p>Subject to applicable Indian data-protection requirements, you may have the right to:</p>
        <PolicyList
          items={[
            "Obtain access to personal information held by us.",
            "Ask us to correct information that is inaccurate.",
            "Request deletion of your personal information.",
            "Withdraw consent where processing is based on consent.",
          ]}
        />
        <p>To exercise applicable rights, please contact us through the contact details provided in this policy.</p>
      </PolicySection>

      <PolicySection title="Legal compliance">
        <p>This Privacy Policy is intended to be published in accordance with applicable requirements, including:</p>
        <PolicyList
          items={[
            "Section 43A of the Information Technology Act, 2000.",
            "Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.",
            "Digital Personal Data Protection Act, 2023, to the extent applicable.",
          ]}
        />
      </PolicySection>

      <PolicySection title="Contact us for privacy concerns">
        <p>
          For questions, comments, privacy concerns, or requests concerning your data rights, you may contact our Grievance Officer
          using the details below. We aim to respond to grievances within 30 days of receiving them, subject to applicable legal
          requirements.
        </p>
      </PolicySection>

      <PolicyContactBlock contactConfig={contactConfig} />
    </ContentPage>
  );
}
