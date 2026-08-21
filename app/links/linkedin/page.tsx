import type { Metadata } from "next";
import { normaliseAttribution } from "../../../lib/attribution";
import { buildMetadata } from "../../../lib/metadata";
import LinksLanding from "../LinksLanding";

export const metadata: Metadata = buildMetadata({
  title: "Links",
  description: "Every way to explore Other People's Recipes — share a recipe, browse the Living Cookbook, join our table and more.",
  path: "/links/linkedin",
  index: false,
});

const linkedInAttribution = normaliseAttribution({ src: "linkedin" });

export default function LinkedInLinksPage() {
  return <LinksLanding attribution={linkedInAttribution} />;
}
