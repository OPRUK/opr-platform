import type { Metadata } from "next";
import { SITE_NAME } from "./site";

// Next's title *template* (set on the root layout) only ever applies to the
// plain `title` field — it does not reach into `openGraph.title`/`twitter.title`,
// which is why pages that only set `title`/`description` end up inheriting the
// root layout's whole `openGraph` block verbatim (wrong og:url on every page).
// Every field below is spelled out explicitly so each route's card is its own.
export function buildMetadata({
  title,
  description,
  path,
  image,
  index = true,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  index?: boolean;
}): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const img = image ?? "/opengraph-image";

  return {
    title,
    description,
    alternates: { canonical: path },
    ...(index ? {} : { robots: { index: false, follow: false } }),
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "en_GB",
      type: "website",
      images: [{ url: img, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [img],
    },
  };
}
