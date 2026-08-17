import { attributionSources } from "../../../../lib/attribution";
import { requireAdmin } from "../../../../lib/admin-auth";

type SourceSummary = {
  source: string;
  linkClicks: number;
  ctaClicks: number;
  conversions: number;
};

const conversionEvents = new Set([
  "join_table_success",
  "recipe_submission_success",
]);

export async function GET(request: Request) {
  const { client, error: accessError } = await requireAdmin(request);
  if (!client) return Response.json({ error: accessError }, { status: 401 });

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 90);

  const [clickResult, eventResult] = await Promise.all([
    client
      .from("link_clicks")
      .select("source, link_key")
      .gte("created_at", since.toISOString())
      .limit(10_000),
    client
      .from("site_events")
      .select("source, event_key")
      .gte("created_at", since.toISOString())
      .limit(10_000),
  ]);

  if (clickResult.error || eventResult.error) {
    console.error("OPR attribution summary could not load", clickResult.error ?? eventResult.error);
    return Response.json({ error: "Traffic-source reporting could not be loaded." }, { status: 400 });
  }

  const summaries = new Map<string, SourceSummary>();
  const ensureSource = (source: string | null) => {
    const label = source ?? "unattributed";
    const existing = summaries.get(label);
    if (existing) return existing;

    const summary = { source: label, linkClicks: 0, ctaClicks: 0, conversions: 0 };
    summaries.set(label, summary);
    return summary;
  };

  for (const source of attributionSources) ensureSource(source);

  for (const click of clickResult.data ?? []) {
    ensureSource(click.source).linkClicks += 1;
  }

  for (const event of eventResult.data ?? []) {
    const summary = ensureSource(event.source);
    if (conversionEvents.has(event.event_key)) summary.conversions += 1;
    else summary.ctaClicks += 1;
  }

  const sources = Array.from(summaries.values())
    .filter((summary) => summary.source !== "unattributed" || summary.linkClicks + summary.ctaClicks + summary.conversions > 0)
    .sort((a, b) => {
      const bTotal = b.linkClicks + b.ctaClicks + b.conversions;
      const aTotal = a.linkClicks + a.ctaClicks + a.conversions;
      return bTotal - aTotal || a.source.localeCompare(b.source);
    });

  return Response.json({
    windowDays: 90,
    linkClicks: clickResult.data?.length ?? 0,
    ctaClicks: (eventResult.data ?? []).filter((event) => !conversionEvents.has(event.event_key)).length,
    conversions: (eventResult.data ?? []).filter((event) => conversionEvents.has(event.event_key)).length,
    sources,
  });
}
