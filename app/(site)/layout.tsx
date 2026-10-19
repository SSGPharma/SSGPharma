import { TopBar } from "@/components/web/top-bar";
import { Navbar } from "@/components/web/navbar";
import { SiteFooter } from "@/components/web/footer";
import { FloatingInquiry } from "@/components/marketing/floating-inquiry";
import { MedicineAssistanceModal } from "@/components/marketing/medicine-assistance-modal";
import { defaultPublicContactConfig, getContactConfig } from "@/lib/contact-config";

export const revalidate = 3600;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const contactConfig = await getContactConfig().catch(() => defaultPublicContactConfig);
  const primaryPhone = contactConfig.phones[0]?.value ?? defaultPublicContactConfig.phones[0]?.value ?? "";
  const primaryEmail = contactConfig.emails[0]?.value ?? defaultPublicContactConfig.emails[0]?.value ?? "";

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-md"
      >
        Skip to main content
      </a>
      <TopBar phones={contactConfig.phones} emails={contactConfig.emails} />
      <Navbar />
      <main id="main-content" className="w-full flex-1">
        {children}
      </main>
      <SiteFooter />
      <FloatingInquiry primaryPhone={primaryPhone} primaryEmail={primaryEmail} />
      <MedicineAssistanceModal primaryPhone={primaryPhone} />
    </div>
  );
}
