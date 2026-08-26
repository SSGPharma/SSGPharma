import type { Metadata } from "next";
import { Suspense } from "react";
import { DM_Sans, Fraunces, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteJsonLd } from "@/components/seo/site-json-ld";
import { RouteCurtain } from "@/components/web/route-curtain";
import { marketingImages } from "@/lib/marketing-images";
import { getSiteUrl } from "@/lib/site-url";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans-body",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SSG Pharma — Specialty pharmaceutical wholesale India",
    template: "%s · SSG Pharma",
  },
  description:
    "Specialty medicines and wholesale pharmaceutical supply for hospitals, clinics, and pharmacies across India. Oncology, diabetes, nephrology, vaccines, and cold-chain aware logistics.",
  keywords: [
    "pharmaceutical wholesaler India",
    "medicine supplier Delhi",
    "specialty medicines",
    "hospital medicine supply",
    "oncology drugs wholesale",
    "pharmacy distributor",
  ],
  authors: [{ name: "SSG Pharma" }],
  creator: "SSG Pharma",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "SSG Pharma",
    title: "SSG Pharma — Specialty pharmaceutical wholesale",
    description:
      "Authentic specialty medicines, hospital supply, and wholesale distribution across India with pharmacist-grade support.",
    images: [
      {
        url: marketingImages.heroLab,
        width: 1200,
        height: 800,
        alt: "Pharmaceutical supply and quality medicines",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SSG Pharma — Specialty pharmaceutical wholesale",
    description: "Specialty medicines for hospitals, clinics, and pharmacies across India.",
    images: [marketingImages.heroLab],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/tlogo-white.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full antialiased", dmSans.variable, fraunces.variable, geistMono.variable)}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col overflow-x-hidden bg-background font-sans text-foreground">
        {/* Google Analytics 4 */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
        <SiteJsonLd />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Suspense fallback={null}>
            <RouteCurtain />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
