export const attributionSources = [
  "instagram",
  "tiktok",
  "facebook",
  "youtube",
  "pinterest",
  "linkedin",
  "email",
] as const;

export type AttributionSource = (typeof attributionSources)[number];

export type Attribution = {
  source: AttributionSource | null;
  utmSource: AttributionSource | null;
  utmMedium: "social" | "email" | null;
  utmCampaign: string | null;
};

export type AnalyticsEventKey =
  | "home_cookbook"
  | "cookbook_share"
  | "film_recipe"
  | "founder_join"
  | "join_table_success"
  | "recipe_submission_success"
  | "community_cook_success"
  | "film_play"
  | "film_watched"
  | "cookalong_signup_success";

const sourceSet = new Set<string>(attributionSources);
const campaignPattern = /^[a-z0-9][a-z0-9_-]{0,63}$/;

function firstString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return null;
}

function readField(input: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = firstString(input[key]);
    if (value !== null) return value;
  }
  return null;
}

function normaliseSource(value: string | null): AttributionSource | null {
  const source = value?.trim().toLowerCase() ?? "";
  return sourceSet.has(source) ? (source as AttributionSource) : null;
}

function normaliseCampaign(value: string | null): string | null {
  const campaign = value?.trim().toLowerCase() ?? "";
  return campaignPattern.test(campaign) ? campaign : null;
}

function normaliseMedium(value: string | null, source: AttributionSource | null): "social" | "email" | null {
  if (!source) return null;
  const medium = value?.trim().toLowerCase() ?? "";
  if (medium === "social" || medium === "email") return medium;
  // No explicit medium given — infer a sensible default from the source
  // itself, rather than always assuming "social".
  return source === "email" ? "email" : "social";
}

export function normaliseAttribution(input: unknown): Attribution {
  const values = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const source = normaliseSource(readField(values, "source", "src"));
  const utmSource = normaliseSource(readField(values, "utmSource", "utm_source")) ?? source;
  const utmMedium = normaliseMedium(readField(values, "utmMedium", "utm_medium"), source);
  const utmCampaign = source
    ? normaliseCampaign(readField(values, "utmCampaign", "utm_campaign")) ?? "bio"
    : null;

  return { source, utmSource, utmMedium, utmCampaign };
}

export function hasAttribution(
  attribution: Attribution,
): attribution is Attribution & { source: AttributionSource } {
  return attribution.source !== null;
}

export function appendAttributionToHref(href: string, attribution: Attribution): string {
  if (!hasAttribution(attribution) || !href.startsWith("/")) return href;

  const url = new URL(href, "https://opr.invalid");
  url.searchParams.set("src", attribution.source);
  url.searchParams.set("utm_source", attribution.utmSource ?? attribution.source);
  url.searchParams.set("utm_medium", attribution.utmMedium ?? "social");
  url.searchParams.set("utm_campaign", attribution.utmCampaign ?? "bio");

  return `${url.pathname}${url.search}${url.hash}`;
}
