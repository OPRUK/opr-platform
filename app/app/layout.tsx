import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-opr-app",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "OPR",
    template: "%s — OPR",
  },
  description: "Every recipe has a story.",
  // These screens largely mirror content already indexed under
  // /family-cookbook — keep them out of search results to avoid competing
  // with (and diluting) the canonical pages for the same recipes.
  robots: {
    index: false,
    follow: true,
  },
  manifest: "/app-manifest.webmanifest",
  appleWebApp: {
    title: "OPR",
    statusBarStyle: "black-translucent",
  },
  other: {
    // appleWebApp only emits the modern "mobile-web-app-capable" tag; this
    // covers iOS versions before 16.4, which only recognise the prefixed name.
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#4A2E45",
};

export default function MobileAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${cormorant.variable} min-h-screen bg-[#EED8B2]`}>
      <div
        className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-[#EED8B2] text-[#4A2E45]"
        style={{ fontFamily: "var(--font-opr-app), Georgia, serif" }}
      >
        {children}
      </div>
    </div>
  );
}
