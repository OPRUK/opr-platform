import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_URL, absoluteUrl } from "../lib/site";
import SiteFooter from "./components/SiteFooter";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-brand",
});

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: "Every recipe has a story.",
  metadataBase: new URL(SITE_URL),
  verification: {
    other: {
      "msvalidate.01": "009D35C64947BC371E16705EC522B712",
    },
  },
  openGraph: {
    title: SITE_NAME,
    description: "Every recipe has a story.",
    url: "/",
    siteName: SITE_NAME,
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Other People's Recipes — Every recipe has a story.",
      },
    ],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: absoluteUrl("/icon.svg"),
  sameAs: [
    "https://www.instagram.com/opr_uk/",
    "https://www.facebook.com/61592736388045",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${cormorantGaramond.variable}`}>
      <body className="min-h-full flex flex-col">
        {children}
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Analytics />
      </body>
    </html>
  );
}
