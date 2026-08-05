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
  themeColor: "#123C39",
};

export default function MobileAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${cormorant.variable} min-h-screen bg-[#EED8B2]`}>
      <div
        className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-[#EED8B2] text-[#123C39]"
        style={{ fontFamily: "var(--font-opr-app), Georgia, serif" }}
      >
        {children}
      </div>
    </div>
  );
}
