import type { Metadata } from "next";
import { normaliseAttribution } from "../../../lib/attribution";
import { buildMetadata } from "../../../lib/metadata";
import LinksLanding from "../LinksLanding";

export const metadata: Metadata = buildMetadata({
  title: "Links",
  description: "Every way to explore Other People's Recipes — share a recipe, browse the Living Cookbook, join our table and more.",
  path: "/links/youtube",
  index: false,
});

const youtubeAttribution = normaliseAttribution({ src: "youtube" });

export default function YouTubeLinksPage() {
  return <LinksLanding attribution={youtubeAttribution} />;
}
