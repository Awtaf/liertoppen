import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { companyInfo } from "@/config/company";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${companyInfo.name}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: companyInfo.name,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: companyInfo.name,
  legalName: companyInfo.name,
  url: siteConfig.url,
  telephone: companyInfo.phone,
  email: companyInfo.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: companyInfo.address,
    addressRegion: companyInfo.postalArea,
    addressCountry: "NO",
  },
  areaServed: companyInfo.serviceAreas,
  contactPoint: {
    "@type": "ContactPoint",
    telephone: companyInfo.phone,
    email: companyInfo.email,
    contactType: "customer service",
    areaServed: "NO",
    availableLanguage: ["Norwegian"],
  },
};

/**
 * Minimal root layout — html/body shell, fonts, global metadata and
 * structured data only. Page chrome (header/footer) is intentionally NOT
 * here: it lives in app/(marketing)/layout.tsx for the public site, so
 * that app/admin/layout.tsx (a separate internal tool, not a marketing
 * page) doesn't inherit it. Having both layouts render a header caused a
 * real bug where the marketing header rendered on top of the admin one.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no" className={`${plusJakarta.variable} antialiased`}>
      <body className="bg-white text-navy">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-navy focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Hopp til hovedinnhold
        </a>
        {children}
      </body>
    </html>
  );
}
