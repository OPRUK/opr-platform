import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Allura, Cabin, Caveat, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_URL, absoluteUrl } from "../lib/site";
import SiteFooter from "./components/SiteFooter";

const cabin = Cabin({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cabin",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant-garamond",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-caveat",
});

const allura = Allura({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-allura",
});

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: "Every Recipe has a Story.",
  metadataBase: new URL(SITE_URL),
  verification: {
    other: {
      "msvalidate.01": "009D35C64947BC371E16705EC522B712",
      "p:domain_verify": "37c33f8ed4264a33475c9f670e20565c",
    },
  },
  openGraph: {
    siteName: SITE_NAME,
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Other People's Recipes — Every Recipe has a Story.",
      },
    ],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: absoluteUrl("/icon"),
  sameAs: [
    "https://www.instagram.com/opr_uk/",
    "https://www.facebook.com/otherpeoplesrecipesuk/",
    "https://www.pinterest.com/otherpeoplesrecipes/",
    "https://www.youtube.com/channel/UCdRQdldwQPFPoMr5N-FwIkQ",
    "https://www.tiktok.com/@opr_uk",
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
    <html
      lang="en"
      data-text-size="default"
      data-readable-font="false"
      suppressHydrationWarning
      className={`${cabin.variable} ${cormorantGaramond.variable} ${caveat.variable} ${allura.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("opr-text-size");if(["small","default","large","largest"].indexOf(s)>-1)document.documentElement.dataset.textSize=s;document.documentElement.dataset.readableFont=localStorage.getItem("opr-readable-font")==="true"?"true":"false"}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
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
