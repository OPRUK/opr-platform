import type { Metadata } from "next";
import { normaliseAttribution } from "../../lib/attribution";
import { buildMetadata } from "../../lib/metadata";
import LinksLanding from "./LinksLanding";

export const metadata: Metadata = buildMetadata({
  title: "Links",
  description: "Every way to explore Other People's Recipes — share a recipe, browse the Living Cookbook, join our table and more.",
  path: "/links",
  index: false,
});

export default async function LinksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const attribution = normaliseAttribution(await searchParams);

  return <LinksLanding attribution={attribution} />;
}
