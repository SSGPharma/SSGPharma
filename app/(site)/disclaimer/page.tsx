import type { Metadata } from "next";
import { connection } from "next/server";
import { ContentPage } from "@/components/web/content-page";
import { PolicyContactBlock, PolicyHero, PolicySection } from "@/components/web/policy-content";
import { defaultPublicContactConfig, getContactConfig } from "@/lib/contact-config";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Legal Disclaimer",
  description:
    "Important information about the SSG Pharma website, its content, products, and services — including our medical information disclaimer and limitation of liability.",
  alternates: {
    canonical: `${siteUrl}/disclaimer`,
  },
};

export default async function DisclaimerPage() {
  await connection();
  const contactConfig = await getContactConfig().catch(() => defaultPublicContactConfig);

  return (
    <ContentPage width="comfortable" variant="frame">
      <PolicyHero
        eyebrow="Legal"
        title="Legal Disclaimer"
        intro="Important information concerning the website, its content, products, and services. Please read this section carefully."
      />

      <PolicySection title="Medical information disclaimer">
        <p>
          Information published on this website is provided for general educational and informational purposes. It is not intended
          to replace professional medical advice, diagnosis, or treatment. If you have questions about a medical condition, consult a
          physician or another qualified healthcare professional. Do not ignore professional medical advice or postpone seeking
          medical care because of information found on this website.
        </p>
      </PolicySection>

      <PolicySection title="No medical advice">
        <p>
          {contactConfig.companyName} does not provide medical advice, diagnose health conditions, or prescribe or recommend
          treatments through this website. Website content should not be treated as a substitute for advice from a qualified
          healthcare professional.
        </p>
      </PolicySection>

      <PolicySection title="Accuracy of information">
        <p>
          We make reasonable efforts to keep website information accurate, complete, and current. Nevertheless, medical information
          can change over time, and we cannot guarantee that every item of information will always be complete, accurate, or up to
          date. {contactConfig.companyName} is not responsible for errors or omissions in website content.
        </p>
      </PolicySection>

      <PolicySection title="Product information">
        <p>
          Product information displayed on the website is provided for general informational purposes. Descriptions, including
          information about ingredients, uses, side effects, and contraindications, may be based on material supplied by
          manufacturers or other third parties. Such information does not replace the manufacturer&rsquo;s official information, product
          packaging, or package inserts.
        </p>
      </PolicySection>

      <PolicySection title="No warranty">
        <p>
          The website, its information, products, and services are provided on an &ldquo;AS IS&rdquo; basis without warranties of any kind,
          whether express or implied, including implied warranties of merchantability or fitness for a particular purpose.
          {" "}
          {contactConfig.companyName} does not guarantee that all information is accurate, complete, or suitable for every individual.
        </p>
        <p>
          {contactConfig.companyName} functions as a pharmaceutical distributor and retailer and does not provide medical treatment or
          medical services.
        </p>
      </PolicySection>

      <PolicySection title="Limitation of liability">
        <p>
          To the fullest extent permitted by applicable law, {contactConfig.companyName} will not be liable for direct, indirect,
          incidental, special, consequential, or similar damages arising from or related to use of the website, or from any delay or
          inability to access or use it, whether based on contract, tort, strict liability, or another legal theory.
        </p>
      </PolicySection>

      <PolicySection title="Emergency medical treatment">
        <p>
          If you believe you are experiencing a medical emergency, contact your doctor or emergency medical services immediately. In
          India, emergency medical assistance can be reached through 102 where applicable. {contactConfig.companyName} does not
          recommend or endorse any particular test, physician, product, procedure, opinion, or other information that may be
          referenced on the website.
        </p>
      </PolicySection>

      <PolicyContactBlock contactConfig={contactConfig} />
    </ContentPage>
  );
}
