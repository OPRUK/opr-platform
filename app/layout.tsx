import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Other People's Recipes",
  description: "Every recipe has a story.",
  metadataBase: new URL("https://otherpeoplesrecipes.co.uk"),
  openGraph: {
    title: "Other People's Recipes",
    description: "Every recipe has a story.",
    url: "/",
    siteName: "Other People's Recipes",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
