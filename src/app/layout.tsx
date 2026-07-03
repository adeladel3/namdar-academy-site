import type { Metadata } from "next";
import { SITE, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import PwaRegister from "@/components/PwaRegister";
import "./globals.css";

// همه‌ی فونت‌ها از طریق @font-face در globals.css از /public/fonts بارگذاری می‌شوند
// تا هیچ درخواستی به سرورهای گوگل (fonts.googleapis.com / fonts.gstatic.com) نرود.
// متغیرهای font-family همچنان از طریق globals.css برای Tailwind فعال‌اند.

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: "استاد امیرحسین نام‌آور" }],
  creator: SITE.name,
  publisher: SITE.name,
  keywords: [
    "نامدار آکادمی",
    "آموزش ترید",
    "سرمایه‌گذاری",
    "امیرحسین نام‌آور",
    "فارکس",
    "ارز دیجیتال",
    "بورس",
    "تحلیل تکنیکال",
    "روان‌شناسی ترید",
    "سیگنال",
    "کوچینگ ترید",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} | ${SITE.tagline}`,
    description: SITE.description,
    images: [
      {
        url: SITE.ogImage,
        width: 1200,
        height: 630,
        alt: SITE.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} | ${SITE.tagline}`,
    description: SITE.description,
    images: [SITE.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  // iOS PWA (Safari ignores the web manifest, reads these legacy meta tags)
  appleWebApp: {
    capable: true,
    title: SITE.name,
    statusBarStyle: "default",
  },
  manifest: "/manifest.json",
  formatDetection: {
    telephone: true,
  },
};

// Mobile viewport: opt-in to device-width + user scaling so the site lays out
// correctly on phones and tablets, and users can pinch-zoom accessible text.
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#1b3c8a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className="namdar-fonts">
      <body className="antialiased bg-white">
        <script
          type="application/ld+json"
          // Site-wide Organization + WebSite schema for rich results
          // (sitelinks search box, knowledge panel).
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationJsonLd(), websiteJsonLd()]),
          }}
        />
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
