"use client";

import Link from "next/link";
import { useState } from "react";
import type { AdminAnalyticsResponse } from "../../lib/admin-analytics-types";
import type { AnalyticsReport } from "../../lib/analytics-report-types";

type AdminAnalyticsPanelProps = {
  analytics: AdminAnalyticsResponse | null;
  loading: boolean;
  message: string;
  exporting: boolean;
  refreshing: boolean;
  onDownload: () => void;
  onRefresh: () => void;
  onMapSocialPost: (platform: string, postId: string, filmVideo: string | null) => Promise<boolean>;
  onOpenSecurity: () => void;
  onSignOut: () => void;
};

function formatNumber(value: number | null, digits = 0) {
  if (value === null) return "Not reported";
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

type FilmChannel = "Facebook" | "Instagram" | "TikTok" | "YouTube";

function socialTotal(film: AdminAnalyticsResponse["socialFilmViews"][number]) {
  return [film.facebookViews, film.instagramViews, film.tiktokViews, film.youtubeViews]
    .reduce<number>((total, value) => total + (value ?? 0), 0);
}

function bestFilmChannel(film: AdminAnalyticsResponse["socialFilmViews"][number]): FilmChannel | null {
  const channels: Array<[FilmChannel, number | null]> = [
    ["Facebook", film.facebookViews],
    ["Instagram", film.instagramViews],
    ["TikTok", film.tiktokViews],
    ["YouTube", film.youtubeViews],
  ];
  const reported = channels.filter((entry): entry is [FilmChannel, number] => entry[1] !== null && entry[1] > 0);
  if (!reported.length) return null;
  return reported.reduce((best, current) => current[1] > best[1] ? current : best)[0];
}

function filmMetricLabel(value: number | null, unavailableLabel = "Post not matched") {
  return value === null ? unavailableLabel : formatNumber(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(value));
}

function releaseDateLabel(uploadDate: string | null, daysOnline: number | null) {
  if (!uploadDate || daysOnline === null) return { date: "Unknown", age: "No verified release date" };
  return { date: formatShortDate(uploadDate), age: `${daysOnline}d ago` };
}

function readableSource(source: string) {
  if (source === "unattributed") return "No source recorded";
  return source.charAt(0).toUpperCase() + source.slice(1);
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="rounded-3xl border border-[#DDB765]/70 bg-[#FFF3DF] p-6 shadow-lg shadow-[#1C5A50]/10">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#9A622A]">{label}</p>
      <p className="mt-3 text-4xl font-bold text-[#123C39]">{value}</p>
      <p className="mt-3 text-sm leading-6 text-stone-600">{note}</p>
    </article>
  );
}

function formatCell(value: number | string | null) {
  if (value === null) return "Not reported";
  if (typeof value === "string") return value;
  return formatNumber(value);
}

type Column<T> = { header: string; render: (row: T) => React.ReactNode; className?: string };

function DataTable<T>({ columns, rows, keyFn }: { columns: Column<T>[]; rows: T[]; keyFn: (row: T, index: number) => string }) {
  return (
    <div className="mt-4 overflow-hidden rounded-3xl border border-[#DDB765]/70 bg-[#FFF3DF] shadow-lg shadow-[#1C5A50]/10">
      <div className="divide-y divide-[#DDB765]/50 md:hidden">
        {rows.map((row, index) => (
          <article key={keyFn(row, index)} className="px-5 py-5">
            {columns.map((column, columnIndex) => (
              <div key={column.header} className={columnIndex === 0 ? "mb-4" : "grid grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-3 border-t border-[#DDB765]/30 py-2.5 first:border-0"}>
                {columnIndex === 0 ? (
                  <p className="break-words text-base font-bold leading-6 text-[#123C39]">{column.render(row)}</p>
                ) : (
                  <>
                    <p className="text-xs font-semibold leading-5 text-[#6B431E]">{column.header}</p>
                    <div className="break-words text-right text-sm leading-5 text-[#123C39]">{column.render(row)}</div>
                  </>
                )}
              </div>
            ))}
          </article>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[#DDB765] text-[#6B431E]">
            {columns.map((column) => (
              <th key={column.header} className={`px-4 py-3 font-semibold first:px-6 last:px-6 ${column.className ?? ""}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={keyFn(row, index)} className="border-b border-[#DDB765]/40 last:border-0">
              {columns.map((column) => (
                <td key={column.header} className={`px-4 py-3 align-top first:px-6 first:font-semibold last:px-6 ${column.className ?? ""}`}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function SubHeading({ eyebrow, title, note }: { eyebrow: string; title: string; note?: string }) {
  return (
    <div className="mt-10 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#9A622A]">{eyebrow}</p>
        <h3 className="mt-2 text-2xl font-bold">{title}</h3>
      </div>
      {note ? <p className="max-w-xl text-sm leading-6 text-stone-700">{note}</p> : null}
    </div>
  );
}

const platformEntries: Array<{ key: keyof AnalyticsReport["platforms"]; label: string }> = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "pinterest", label: "Pinterest" },
  { key: "youtube", label: "YouTube" },
  { key: "tiktok", label: "TikTok" },
];

export default function AdminAnalyticsPanel({
  analytics,
  loading,
  message,
  exporting,
  refreshing,
  onDownload,
  onRefresh,
  onMapSocialPost,
  onOpenSecurity,
  onSignOut,
}: AdminAnalyticsPanelProps) {
  const [filmFilter, setFilmFilter] = useState<"all" | "published" | "missing" | "highest">("all");
  const [postMatches, setPostMatches] = useState<Record<string, string>>({});
  const [savingPost, setSavingPost] = useState("");
  const snapshot = analytics?.snapshot ?? null;
  const report = analytics?.report ?? null;
  const staticUpdateNote = report
    ? `Static data · Last updated ${formatDateTime(report.staticDataUpdatedAt)}`
    : null;
  const sourceMaximum = Math.max(
    1,
    ...(analytics?.sources.map(
      (source) => source.linkClicks + source.ctaClicks + source.conversions,
    ) ?? []),
  );
  const campaignMaximum = Math.max(
    1,
    ...(analytics?.campaigns.map(
      (campaign) => campaign.linkClicks + campaign.ctaClicks + campaign.conversions,
    ) ?? []),
  );
  const socialExposures = snapshot?.social.reduce(
    (total, platform) => total + platform.exposures,
    0,
  ) ?? 0;
  const filmRows = [...(analytics?.socialFilmViews ?? [])]
    .filter((film) => {
      const allChannelsReported = [film.facebookViews, film.instagramViews, film.tiktokViews, film.youtubeViews, film.pinterestImpressions]
        .every((value) => value !== null);
      if (filmFilter === "published") return allChannelsReported;
      if (filmFilter === "missing") return !allChannelsReported;
      return true;
    })
    .sort((a, b) => filmFilter === "highest" ? socialTotal(b) - socialTotal(a) : 0);

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen overflow-x-hidden bg-[#EED8B2] px-4 py-6 text-[#123C39] sm:px-5 sm:py-8 md:px-10 md:py-10">
      <header className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Private OPR area</p>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl md:text-5xl">Analytics dashboard</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-stone-700 sm:text-lg sm:leading-8">
            A private view of website discovery, social reach and the actions people take around the OPR table.
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 self-start md:w-auto md:justify-end md:self-auto">
          <Link href="/admin" className="text-sm font-medium underline underline-offset-4">
            Recipe inbox
          </Link>
          <button type="button" onClick={onOpenSecurity} className="text-sm font-medium underline underline-offset-4">
            Security
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing || loading}
            className="w-full rounded-full border border-[#123C39] px-5 py-2.5 text-sm font-medium transition hover:bg-[#123C39] hover:text-white disabled:cursor-wait disabled:opacity-60 sm:w-auto"
          >
            {refreshing ? "Refreshing…" : "Refresh dashboard"}
          </button>
          <button
            type="button"
            onClick={onDownload}
            disabled={exporting || !analytics}
            className="w-full rounded-full bg-[#123C39] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#08231F] disabled:cursor-wait disabled:opacity-60 sm:w-auto"
          >
            {exporting ? "Preparing spreadsheet…" : "Download analytics (.xlsx)"}
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="w-full rounded-full border border-[#123C39] px-5 py-2.5 text-sm font-medium transition hover:bg-[#123C39] hover:text-white sm:w-auto"
          >
            Sign out
          </button>
        </div>
      </header>

      {message ? (
        <p role="status" aria-live="polite" className="mx-auto mt-8 max-w-7xl rounded-2xl border border-red-900/20 bg-white/60 px-5 py-4 text-sm text-red-900">
          {message}
        </p>
      ) : null}

      {loading && !analytics ? (
        <p role="status" className="mx-auto mt-10 max-w-7xl rounded-3xl bg-[#FFF3DF] p-8 text-stone-700 shadow-lg">
          Loading the private analytics dashboard…
        </p>
      ) : null}

      {analytics ? (
        <>
          <section aria-labelledby="live-analytics-heading" className="mx-auto mt-10 max-w-7xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#9A622A]">Live first-party signals</p>
                <h2 id="live-analytics-heading" className="mt-3 text-3xl font-bold">What people do after they arrive</h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-stone-700">
                Last {analytics.windowDays} days. Privacy-safe event counts only—no names, email addresses, IP addresses or visitor identifiers.
                <span className="mt-1 block font-medium text-[#123C39]">
                  Last refreshed {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(analytics.generatedAt))}
                </span>
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <MetricCard label="Link-page clicks" value={formatNumber(analytics.linkClicks)} note="Clicks from the OPR links page to a chosen destination." />
              <MetricCard label="Site actions" value={formatNumber(analytics.ctaClicks)} note="Tracked cookbook, film, founder and sharing actions." />
              <MetricCard label="Conversions" value={formatNumber(analytics.conversions)} note="Completed table sign-ups and recipe submissions." />
            </div>

            <div className="mt-6 rounded-3xl border border-[#DDB765]/70 bg-[#FFF3DF] p-6 shadow-lg shadow-[#1C5A50]/10">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#9A622A]">Recipe submission funnel</p>
                  <h3 className="mt-2 text-2xl font-bold">From first field to shared recipe</h3>
                </div>
                <p className="text-sm text-stone-600">Once-per-session event counts for the last {analytics.windowDays} days.</p>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="Started" value={formatNumber(analytics.submissionFunnel.started)} note="Entered at least one core form field." />
                <MetricCard label="Recipe ready" value={formatNumber(analytics.submissionFunnel.recipeReady)} note="Added a title, story, ingredients and method." />
                <MetricCard label="Submit attempts" value={formatNumber(analytics.submissionFunnel.attempted)} note="Pressed the final share button." />
                <MetricCard label="Completed" value={formatNumber(analytics.submissionFunnel.completed)} note={`${analytics.submissionFunnel.startToCompletionRate === null ? "No starts measured yet" : `${formatPercent(analytics.submissionFunnel.startToCompletionRate)} of starts`} completed successfully.`} />
              </div>
              <p className="mt-5 text-sm leading-6 text-stone-600">
                Estimated drop-off: {formatNumber(analytics.submissionFunnel.abandonedBeforeAttempt)} starts did not reach submit and {formatNumber(analytics.submissionFunnel.unsuccessfulAttempts)} attempts did not complete. These are aggregate event differences, not identified visitors.
              </p>
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-[#DDB765]/70 bg-[#FFF3DF] shadow-lg shadow-[#1C5A50]/10">
              <div className="border-b border-[#DDB765]/60 px-6 py-5">
                <h3 className="text-xl font-bold">Source comparison</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">The separate source links now show which social channels produce measurable visits and actions.</p>
              </div>
              <div className="divide-y divide-[#DDB765]/50 md:hidden">
                {analytics.sources.map((source) => {
                  const total = source.linkClicks + source.ctaClicks + source.conversions;
                  return (
                    <article key={source.source} className="px-5 py-5">
                      <h4 className="text-base font-bold text-[#123C39]">{readableSource(source.source)}</h4>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <div><p className="text-[10px] uppercase text-[#6B431E]">Clicks</p><p className="mt-1 text-lg font-bold">{source.linkClicks}</p></div>
                        <div><p className="text-[10px] uppercase text-[#6B431E]">Actions</p><p className="mt-1 text-lg font-bold">{source.ctaClicks}</p></div>
                        <div><p className="text-[10px] uppercase text-[#6B431E]">Conversions</p><p className="mt-1 text-lg font-bold">{source.conversions}</p></div>
                      </div>
                      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[#EED8B2]" aria-label={`${total} total recorded actions`}>
                        <div className="h-full rounded-full bg-[#1C5A50]" style={{ width: `${Math.max(total ? 7 : 0, (total / sourceMaximum) * 100)}%` }} />
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#DDB765] text-[#6B431E]">
                      <th className="px-6 py-4 font-semibold">Source</th>
                      <th className="px-4 py-4 font-semibold">Link clicks</th>
                      <th className="px-4 py-4 font-semibold">Site actions</th>
                      <th className="px-4 py-4 font-semibold">Conversions</th>
                      <th className="px-6 py-4 font-semibold">Relative activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.sources.map((source) => {
                      const total = source.linkClicks + source.ctaClicks + source.conversions;
                      return (
                        <tr key={source.source} className="border-b border-[#DDB765]/40 last:border-0">
                          <th scope="row" className="px-6 py-4 font-semibold">{readableSource(source.source)}</th>
                          <td className="px-4 py-4">{source.linkClicks}</td>
                          <td className="px-4 py-4">{source.ctaClicks}</td>
                          <td className="px-4 py-4">{source.conversions}</td>
                          <td className="px-6 py-4">
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#EED8B2]" aria-label={`${total} total recorded actions`}>
                              <div className="h-full rounded-full bg-[#1C5A50]" style={{ width: `${Math.max(total ? 7 : 0, (total / sourceMaximum) * 100)}%` }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-[#DDB765]/70 bg-[#FFF3DF] p-6 shadow-lg shadow-[#1C5A50]/10">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#9A622A]">Permanent post matching</p>
                  <h3 className="mt-2 text-2xl font-bold">Social data connections</h3>
                </div>
                <p className="max-w-xl text-sm leading-6 text-stone-600">Post IDs and latest actual metrics are saved after every refresh. Caption changes and temporary API outages no longer break an established match.</p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {analytics.socialConnectionStatus.map((connection) => (
                  <article key={connection.platform} className={`rounded-2xl border p-4 ${connection.connected ? "border-[#8CB9A8] bg-[#E6F1EB]" : "border-[#C98F80] bg-[#F8E5DF]"}`}>
                    <p className="font-bold capitalize">{connection.platform}</p>
                    <p className="mt-2 text-sm">{connection.connected ? `${connection.matchedPosts} posts matched` : "Connection needs attention"}</p>
                    <p className="mt-1 text-xs text-stone-600">{connection.unresolvedPosts} unresolved</p>
                  </article>
                ))}
              </div>
              {analytics.unmatchedSocialPosts.length ? (
                <div className="mt-6 space-y-3">
                  <p className="text-sm font-semibold text-[#6B431E]">Match each unresolved live post once. The post ID keeps the choice permanent.</p>
                  {analytics.unmatchedSocialPosts.map((post) => {
                    const key = `${post.platform}:${post.postId}`;
                    return (
                      <div key={key} className="grid gap-3 rounded-2xl border border-[#DDB765]/60 bg-white/55 p-4 lg:grid-cols-[8rem_minmax(0,1fr)_minmax(16rem,1fr)_auto_auto] lg:items-center">
                        <p className="font-bold capitalize">{post.platform}</p>
                        <p className="line-clamp-3 text-sm leading-5 text-stone-700">{post.title || "Untitled post"} · {formatNumber(post.metricValue)}</p>
                        <select
                          aria-label={`Match ${post.platform} post to film`}
                          value={postMatches[key] ?? ""}
                          onChange={(event) => setPostMatches((current) => ({ ...current, [key]: event.target.value }))}
                          className="w-full rounded-full border border-[#DDB765] bg-white px-4 py-2 text-sm text-[#123C39]"
                        >
                          <option value="">Choose the matching OPR film</option>
                          {analytics.socialFilmViews.map((film) => <option key={film.video} value={film.video}>{film.title}</option>)}
                        </select>
                        <button
                          type="button"
                          disabled={!postMatches[key] || savingPost === key}
                          onClick={async () => {
                            setSavingPost(key);
                            await onMapSocialPost(post.platform, post.postId, postMatches[key]);
                            setSavingPost("");
                          }}
                          className="rounded-full bg-[#123C39] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                        >
                          {savingPost === key ? "Saving…" : "Save match"}
                        </button>
                        <button
                          type="button"
                          disabled={savingPost === key}
                          onClick={async () => {
                            setSavingPost(key);
                            await onMapSocialPost(post.platform, post.postId, null);
                            setSavingPost("");
                          }}
                          className="rounded-full border border-[#9A622A] px-4 py-2 text-sm font-bold text-[#6B431E] disabled:opacity-50"
                        >
                          Not an OPR film
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-5 rounded-2xl bg-[#E6F1EB] px-4 py-3 text-sm font-medium">Every live post returned by the connected platforms has a permanent film match.</p>
              )}
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-[#DDB765]/70 bg-[#FFF3DF] shadow-lg shadow-[#1C5A50]/10">
              <div className="border-b border-[#DDB765]/60 px-6 py-5">
                <h3 className="text-xl font-bold">Campaign comparison</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">First-party UTM campaign totals, grouped with their source and containing no personal data.</p>
              </div>
              <div className="divide-y divide-[#DDB765]/50 md:hidden">
                {analytics.campaigns.length ? analytics.campaigns.map((campaign) => {
                  const total = campaign.linkClicks + campaign.ctaClicks + campaign.conversions;
                  return (
                    <article key={`${campaign.source}:${campaign.campaign}`} className="px-5 py-5">
                      <h4 className="break-words text-base font-bold text-[#123C39]">{campaign.campaign}</h4>
                      <p className="mt-1 text-xs text-stone-600">{readableSource(campaign.source)}</p>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <div><p className="text-[10px] uppercase text-[#6B431E]">Clicks</p><p className="mt-1 text-lg font-bold">{campaign.linkClicks}</p></div>
                        <div><p className="text-[10px] uppercase text-[#6B431E]">Actions</p><p className="mt-1 text-lg font-bold">{campaign.ctaClicks}</p></div>
                        <div><p className="text-[10px] uppercase text-[#6B431E]">Conversions</p><p className="mt-1 text-lg font-bold">{campaign.conversions}</p></div>
                      </div>
                      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[#EED8B2]" aria-label={`${total} total recorded actions`}>
                        <div className="h-full rounded-full bg-[#9A622A]" style={{ width: `${Math.max(total ? 7 : 0, (total / campaignMaximum) * 100)}%` }} />
                      </div>
                    </article>
                  );
                }) : <p className="px-5 py-6 text-sm text-stone-600">No campaign-coded activity has been recorded yet.</p>}
              </div>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#DDB765] text-[#6B431E]">
                      <th className="px-6 py-4 font-semibold">Campaign</th>
                      <th className="px-4 py-4 font-semibold">Source</th>
                      <th className="px-4 py-4 font-semibold">Link clicks</th>
                      <th className="px-4 py-4 font-semibold">Site actions</th>
                      <th className="px-4 py-4 font-semibold">Conversions</th>
                      <th className="px-6 py-4 font-semibold">Relative activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.campaigns.length ? analytics.campaigns.map((campaign) => {
                      const total = campaign.linkClicks + campaign.ctaClicks + campaign.conversions;
                      return (
                        <tr key={`${campaign.source}:${campaign.campaign}`} className="border-b border-[#DDB765]/40 last:border-0">
                          <th scope="row" className="px-6 py-4 font-semibold">{campaign.campaign}</th>
                          <td className="px-4 py-4">{readableSource(campaign.source)}</td>
                          <td className="px-4 py-4">{campaign.linkClicks}</td>
                          <td className="px-4 py-4">{campaign.ctaClicks}</td>
                          <td className="px-4 py-4">{campaign.conversions}</td>
                          <td className="px-6 py-4">
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#EED8B2]" aria-label={`${total} total recorded actions`}>
                              <div className="h-full rounded-full bg-[#9A622A]" style={{ width: `${Math.max(total ? 7 : 0, (total / campaignMaximum) * 100)}%` }} />
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr><td colSpan={6} className="px-6 py-6 text-stone-600">No campaign-coded activity has been recorded yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-[#DDB765]/70 bg-[#FFF3DF] shadow-lg shadow-[#1C5A50]/10">
              <div className="border-b border-[#DDB765]/60 px-6 py-5">
                <h3 className="text-xl font-bold">Film performance by channel</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">Every website film under one consistent name. Social columns show views; Pinterest shows impressions. LinkedIn is omitted because OPR has no LinkedIn videos.</p>
                <p className="mt-1 text-xs text-stone-500">Dynamic channels refreshed {formatDateTime(analytics.generatedAt)}, with the {formatDateTime(analytics.pinterestAuditCapturedAt)} audit as a fallback for any pin the live API can&apos;t match.</p>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                  <label className="w-full text-sm font-semibold text-[#6B431E] sm:w-auto">
                    <span className="block sm:inline">Show films</span>
                    <select value={filmFilter} onChange={(event) => setFilmFilter(event.target.value as typeof filmFilter)} className="mt-2 w-full rounded-full border border-[#DDB765] bg-white px-4 py-2 text-[#123C39] sm:ml-3 sm:mt-0 sm:w-auto">
                      <option value="all">All films</option>
                      <option value="published">Data on every channel</option>
                      <option value="missing">Missing channel data</option>
                      <option value="highest">Highest performing</option>
                    </select>
                  </label>
                  <p className="max-w-xl text-xs leading-5 text-stone-500">Pinterest figures are impressions, not video views, and are excluded from total social views and strongest-channel comparisons. Platform view definitions also differ.</p>
                </div>
              </div>
              <div className="divide-y divide-[#DDB765]/50 md:hidden">
                {filmRows.length ? filmRows.map((film) => {
                  const bestChannel = bestFilmChannel(film);
                  const release = releaseDateLabel(film.uploadDate, film.daysOnline);
                  const mobileMetrics = [
                    { label: "Released", value: `${release.date} · ${release.age}`, status: "Dynamic" },
                    { label: "Website plays", value: formatNumber(film.plays), status: "Dynamic" },
                    { label: "Facebook", value: filmMetricLabel(film.facebookViews), status: "Dynamic" },
                    { label: "Instagram", value: filmMetricLabel(film.instagramViews), status: "Dynamic" },
                    { label: "TikTok", value: filmMetricLabel(film.tiktokViews), status: "Dynamic" },
                    { label: "YouTube", value: filmMetricLabel(film.youtubeViews, "No data yet"), status: "Dynamic" },
                    { label: "Pinterest", value: filmMetricLabel(film.pinterestImpressions, "No data yet"), status: "Dynamic · impressions" },
                  ];
                  return (
                    <article key={film.video} className="px-5 py-6">
                      <h4 className="text-base font-bold leading-6 text-[#123C39]">{film.title}</h4>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        {mobileMetrics.map((metric) => (
                          <div key={metric.label} className="min-w-0 rounded-2xl border border-[#DDB765]/60 bg-white/55 p-3">
                            <p className="break-words text-[10px] font-semibold uppercase tracking-[0.06em] text-[#6B431E]">{metric.label}</p>
                            <p className="mt-1 break-words text-base font-bold text-[#123C39]">{metric.value}</p>
                            <p className={`mt-1 text-[10px] ${metric.status.startsWith("Static") ? "text-[#9A622A]" : "text-[#1C5A50]"}`}>{metric.status}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl bg-[#123C39] p-4 text-[#FFF3DF]">
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-[0.06em] text-[#DDB765]">Total social views</p>
                          <p className="mt-1 text-xl font-bold text-white">{formatNumber(socialTotal(film))}</p>
                          <p className="text-[10px] text-[#EED8B2]">Excludes Pinterest</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-[0.06em] text-[#DDB765]">Strongest channel</p>
                          <p className="mt-1 break-words text-sm font-bold text-white">{bestChannel ?? "—"}</p>
                        </div>
                      </div>
                    </article>
                  );
                }) : <p className="px-5 py-6 text-sm text-stone-600">No films match this filter.</p>}
              </div>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[1120px] table-fixed border-collapse text-left text-xs xl:text-sm">
                  <colgroup>
                    <col className="w-[21%]" />
                    <col className="w-[7%]" />
                    <col className="w-[8%]" />
                    <col className="w-[8%]" />
                    <col className="w-[8%]" />
                    <col className="w-[8%]" />
                    <col className="w-[8%]" />
                    <col className="w-[10%]" />
                    <col className="w-[11%]" />
                    <col className="w-[11%]" />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-[#DDB765] text-[#6B431E]">
                      <th className="px-5 py-4 font-semibold">Film</th>
                      <th className="px-2 py-4 font-semibold leading-5">Released<br />date</th>
                      <th className="px-2 py-4 font-semibold leading-5">Website<br />plays <span className="block font-normal text-[#1C5A50]">Dynamic</span></th>
                      <th className="px-2 py-4 font-semibold leading-5">Facebook<br />views <span className="block font-normal text-[#1C5A50]">Dynamic</span></th>
                      <th className="px-2 py-4 font-semibold leading-5">Instagram<br />views <span className="block font-normal text-[#1C5A50]">Dynamic</span></th>
                      <th className="px-2 py-4 font-semibold leading-5">TikTok<br />views <span className="block font-normal text-[#1C5A50]">Dynamic</span></th>
                      <th className="px-2 py-4 font-semibold leading-5">YouTube<br />views <span className="block font-normal text-[#1C5A50]">Dynamic</span></th>
                      <th className="px-2 py-4 font-semibold leading-5">Total social<br />views <span className="block font-normal text-stone-500">No Pinterest</span></th>
                      <th className="px-2 py-4 font-semibold leading-5">Strongest<br />channel</th>
                      <th className="px-3 py-4 font-semibold leading-5">Pinterest<br />impressions <span className="block font-normal text-[#1C5A50]">Dynamic</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filmRows.length ? filmRows.map((film) => {
                      const bestChannel = bestFilmChannel(film);
                      const release = releaseDateLabel(film.uploadDate, film.daysOnline);
                      return (
                      <tr key={film.video} className="border-b border-[#DDB765]/40 last:border-0">
                        <th scope="row" className="px-5 py-4 font-semibold leading-5">{film.title}</th>
                        <td className="px-2 py-4 leading-5">{release.date}<span className="block text-[10px] text-stone-500">{release.age}</span></td>
                        <td className="px-2 py-4">{formatNumber(film.plays)}</td>
                        <td className={`px-2 py-4 ${bestChannel === "Facebook" ? "bg-[#DDEBE4] font-bold" : ""}`}>{filmMetricLabel(film.facebookViews)}</td>
                        <td className={`px-2 py-4 ${bestChannel === "Instagram" ? "bg-[#DDEBE4] font-bold" : ""}`}>{filmMetricLabel(film.instagramViews)}</td>
                        <td className={`px-2 py-4 ${bestChannel === "TikTok" ? "bg-[#DDEBE4] font-bold" : ""}`}>{filmMetricLabel(film.tiktokViews)}</td>
                        <td className={`px-2 py-4 ${bestChannel === "YouTube" ? "bg-[#DDEBE4] font-bold" : ""}`}>{filmMetricLabel(film.youtubeViews, "No data yet")}</td>
                        <td className="px-2 py-4 font-bold">{formatNumber(socialTotal(film))}</td>
                        <td className="px-2 py-4 break-words">{bestChannel ?? "—"}</td>
                        <td className="px-3 py-4">{filmMetricLabel(film.pinterestImpressions, "No data yet")}</td>
                      </tr>
                    );}) : (
                      <tr><td colSpan={10} className="px-6 py-6 text-stone-600">No films match this filter.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section aria-labelledby="participation-heading" className="mx-auto mt-12 max-w-7xl">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#9A622A]">Participation</p>
            <h2 id="participation-heading" className="mt-3 text-3xl font-bold">The growing OPR community</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {analytics.participation.map((metric) => (
                <article key={metric.key} className="rounded-3xl bg-[#123C39] p-6 text-[#FFF3DF] shadow-lg shadow-[#1C5A50]/15">
                  <p className="text-sm uppercase tracking-[0.18em] text-[#DDB765]">{metric.label}</p>
                  <p className="mt-3 text-4xl font-bold text-white">{formatNumber(metric.last30Days)}</p>
                  <p className="mt-2 text-sm text-[#EED8B2]">Last 30 days</p>
                  <p className="mt-4 border-t border-white/20 pt-4 text-sm text-[#EED8B2]">{formatNumber(metric.allTime)} all time</p>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="priorities-heading" className="mx-auto mt-12 max-w-7xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#9A622A]">Dynamic action queue</p>
                <h2 id="priorities-heading" className="mt-3 text-3xl font-bold">What needs attention next</h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-stone-700">
                Recalculated whenever the dashboard loads from current measurement coverage, performance, conversions and a structural audit of the published site.
              </p>
            </div>
            {analytics.priorities.length ? (
              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                {analytics.priorities.map((priority) => (
                  <article key={priority.id} className="overflow-hidden rounded-3xl border border-[#DDB765]/70 bg-[#FFF3DF] shadow-lg shadow-[#1C5A50]/10">
                    <div className={`flex items-center justify-between gap-4 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] ${priority.priority === "P1" ? "bg-[#7A2E2E] text-white" : "bg-[#DDB765] text-[#123C39]"}`}>
                      <span>{priority.priority} · {priority.area}</span>
                      <span className="text-xs font-medium normal-case tracking-normal">{priority.source}</span>
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold">{priority.title}</h3>
                      <p className="mt-4 leading-7 text-stone-700">{priority.evidence}</p>
                      <p className="mt-5 border-t border-[#DDB765]/60 pt-5 font-medium leading-7 text-[#123C39]">{priority.action}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-[#8CB9A8] bg-[#E6F1EB] p-6 text-[#123C39]">
                <h3 className="text-xl font-bold">No current P1 or P2 findings</h3>
                <p className="mt-2 leading-7">The automated checks found no urgent measurement, conversion, performance or content-completeness gaps.</p>
              </div>
            )}
          </section>

          {snapshot ? (
            <>
              <section aria-labelledby="baseline-heading" className="mx-auto mt-12 max-w-7xl rounded-[2rem] bg-[#FFF3DF] p-6 shadow-xl shadow-[#1C5A50]/10 md:p-9">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#9A622A]">Management baseline</p>
                    <h2 id="baseline-heading" className="mt-3 text-3xl font-bold">Website and Google visibility</h2>
                  </div>
                  <p className="text-sm text-stone-600">
                    {snapshot.website.fetchedAt
                      ? `Website visitors: live from Vercel Web Analytics, refreshed ${formatDateTime(snapshot.website.fetchedAt)}`
                      : `Website visitors: manual snapshot · ${staticUpdateNote ?? `Captured ${new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date(`${snapshot.capturedAt}T12:00:00Z`))}`}`}
                  </p>
                </div>
                <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard
                    label="Website visitors"
                    value={formatNumber(snapshot.website.visitors)}
                    note={snapshot.website.fetchedAt ? `${snapshot.website.period} · Live` : snapshot.website.period}
                  />
                  <MetricCard
                    label="Page views"
                    value={formatNumber(snapshot.website.pageViews)}
                    note={`${formatNumber(snapshot.website.pagesPerVisitor, 2)} pages per visitor${snapshot.website.fetchedAt ? " · Live" : ""}`}
                  />
                  <MetricCard
                    label="Google clicks"
                    value={formatNumber(snapshot.google.clicks)}
                    note={
                      snapshot.google.fetchedAt
                        ? `${formatNumber(snapshot.google.impressions)} impressions · Live, refreshed ${formatDateTime(snapshot.google.fetchedAt)}`
                        : `${formatNumber(snapshot.google.impressions)} search impressions · Manual snapshot`
                    }
                  />
                  <MetricCard
                    label="Google CTR"
                    value={formatPercent(snapshot.google.ctr)}
                    note={`Average position ${formatNumber(snapshot.google.averagePosition, 1)} · ${snapshot.google.fetchedAt ? "Live from Search Console" : "Manual snapshot"}`}
                  />
                </div>
              </section>

              <section aria-labelledby="social-heading" className="mx-auto mt-12 max-w-7xl">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#9A622A]">Social baseline</p>
                    <h2 id="social-heading" className="mt-3 text-3xl font-bold">Discovery across each channel</h2>
                  </div>
                  <p className="max-w-xl text-sm leading-6 text-stone-700">
                    {formatNumber(socialExposures)} combined platform-reported exposures. Periods and platform definitions differ, so this is an activity indicator—not deduplicated reach.
                  </p>
                </div>
                <div className="mt-6 overflow-hidden rounded-3xl border border-[#DDB765]/70 bg-[#FFF3DF] shadow-lg shadow-[#1C5A50]/10">
                  <div className="divide-y divide-[#DDB765]/50 md:hidden">
                    {snapshot.social.map((platform) => (
                      <article key={platform.platform} className="px-5 py-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold">{platform.platform}</h3>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white ${platform.fetchedAt ? "bg-[#1C5A50]" : "bg-[#9A622A]"}`}>
                            {platform.fetchedAt ? "Automatic" : "Static"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-stone-600">{platform.period}</p>
                        <div className="mt-4 rounded-2xl bg-[#123C39] p-4 text-[#FFF3DF]">
                          <p className="text-[10px] uppercase tracking-[0.08em] text-[#DDB765]">{platform.exposureLabel}</p>
                          <p className="mt-1 text-3xl font-bold text-white">{formatNumber(platform.exposures)}</p>
                        </div>
                        <dl className="mt-3 grid grid-cols-2 gap-3">
                          {[
                            ["Interactions", platform.interactions],
                            ["Followers", platform.followers],
                            ["Profile visits", platform.profileVisits],
                            ["Outbound clicks", platform.outboundClicks],
                          ].map(([label, value]) => (
                            <div key={String(label)} className="rounded-2xl border border-[#DDB765]/50 bg-white/50 p-3">
                              <dt className="text-[10px] uppercase tracking-[0.06em] text-[#6B431E]">{label}</dt>
                              <dd className="mt-1 text-lg font-bold">{formatNumber(value as number | null)}</dd>
                            </div>
                          ))}
                        </dl>
                        <p className="mt-3 text-[11px] text-stone-500">
                          {platform.fetchedAt
                            ? `Refreshed ${formatDateTime(platform.fetchedAt)}`
                            : staticUpdateNote}
                        </p>
                      </article>
                    ))}
                  </div>
                  <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[880px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#DDB765] text-[#6B431E]">
                        <th className="px-6 py-4 font-semibold">Platform</th>
                        <th className="px-4 py-4 font-semibold">Period</th>
                        <th className="px-4 py-4 font-semibold">Exposure</th>
                        <th className="px-4 py-4 font-semibold">Interactions</th>
                        <th className="px-4 py-4 font-semibold">Followers</th>
                        <th className="px-4 py-4 font-semibold">Profile visits</th>
                        <th className="px-6 py-4 font-semibold">Outbound clicks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snapshot.social.map((platform) => (
                        <tr key={platform.platform} className="border-b border-[#DDB765]/40 last:border-0">
                          <th scope="row" className="px-6 py-4 font-semibold">
                            {platform.platform}
                            {platform.fetchedAt ? (
                              <span className="ml-2 rounded-full bg-[#1C5A50] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">Automatic</span>
                            ) : null}
                          </th>
                          <td className="px-4 py-4 text-stone-600">
                            {platform.period}
                            {platform.fetchedAt ? (
                              <span className="block text-xs text-stone-500">Refreshed {formatDateTime(platform.fetchedAt)}</span>
                            ) : staticUpdateNote ? (
                              <span className="block text-xs text-stone-500">{staticUpdateNote}</span>
                            ) : null}
                          </td>
                          <td className="px-4 py-4"><span className="font-semibold">{formatNumber(platform.exposures)}</span><span className="block text-xs text-stone-500">{platform.exposureLabel}</span></td>
                          <td className="px-4 py-4">{formatNumber(platform.interactions)}</td>
                          <td className="px-4 py-4">{formatNumber(platform.followers)}</td>
                          <td className="px-4 py-4">{formatNumber(platform.profileVisits)}</td>
                          <td className="px-6 py-4">{formatNumber(platform.outboundClicks)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              </section>

            </>
          ) : (
            <section className="mx-auto mt-12 max-w-7xl rounded-3xl border border-[#DDB765] bg-[#FFF3DF] p-7">
              <h2 className="text-2xl font-bold">Historical baseline unavailable</h2>
              <p className="mt-3 leading-7 text-stone-700">The live privacy-safe OPR figures above are available, but the protected website, Google and social baseline has not been configured in this environment.</p>
            </section>
          )}

          <p className="mx-auto mt-10 max-w-7xl text-sm leading-6 text-stone-600">
            Dashboard generated {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(analytics.generatedAt))}. Connected sources update whenever this page opens and are saved automatically each morning. If a service is temporarily unavailable, the dashboard keeps its latest saved figures; unconnected fields remain manual.
          </p>

          {report ? (
          <section aria-labelledby="full-report-heading" className="mx-auto mt-16 max-w-7xl rounded-[2rem] bg-[#123C39] p-6 text-[#EED8B2] shadow-xl shadow-[#1C5A50]/20 md:p-9">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#DDB765]">Full report</p>
            <h2 id="full-report-heading" className="mt-3 text-3xl font-bold text-white">SEO &amp; social traffic report</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#EED8B2]">
              Baseline prepared {new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date(`${report.preparedDate}T12:00:00Z`))}. Website, Google, connected social-platform and PageSpeed fields now refresh automatically; unavailable platform details retain their latest verified snapshot.
              <span className="mt-1 block font-medium text-white">Static data last updated {formatDateTime(report.staticDataUpdatedAt)}.</span>
            </p>

            <div className="mt-8 rounded-[1.5rem] bg-[#EED8B2] p-5 text-[#123C39] shadow-inner md:p-7">
              <SubHeading eyebrow="Executive summary" title="Headline KPIs" note={staticUpdateNote ?? undefined} />
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {report.executiveSummary.kpis.map((kpi) => (
                  <div key={kpi.label} className="rounded-2xl border border-[#DDB765]/60 bg-[#FFF3DF] px-4 py-3 shadow shadow-[#1C5A50]/10">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#9A622A]">{kpi.label}</p>
                    <p className="mt-1 text-2xl font-bold text-[#123C39]">{kpi.value}</p>
                  </div>
                ))}
              </div>

              <SubHeading eyebrow="Executive summary" title="What the numbers say" />
              <DataTable<(typeof report.executiveSummary.whatTheNumbersSay)[number]>
                keyFn={(row) => row.area}
                rows={report.executiveSummary.whatTheNumbersSay}
                columns={[
                  { header: "Area", render: (row) => row.area },
                  { header: "Evidence", render: (row) => row.evidence },
                  { header: "Meaning", render: (row) => row.meaning },
                  { header: "Decision", render: (row) => row.decision },
                ]}
              />

              <SubHeading eyebrow="Executive summary" title="Top priorities" />
              <div className="mt-4 grid gap-5 lg:grid-cols-2">
                {report.executiveSummary.topPriorities.map((priority, index) => (
                  <article key={`${priority.priority}-${index}`} className="rounded-3xl border border-[#DDB765]/70 bg-[#FFF3DF] p-6 shadow-lg shadow-[#1C5A50]/10">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#9A622A]">{priority.priority} · {priority.owner}</p>
                    <h4 className="mt-3 text-lg font-bold leading-6">{priority.action}</h4>
                    <p className="mt-3 text-sm leading-6 text-stone-700">{priority.whyNow}</p>
                    <p className="mt-3 border-t border-[#DDB765]/60 pt-3 text-sm font-medium leading-6 text-[#123C39]">{priority.successMeasure}</p>
                  </article>
                ))}
              </div>
              <p className="mt-4 text-xs leading-5 text-stone-600">{report.executiveSummary.footnote}</p>
            </div>

            <div className="mt-8 rounded-[1.5rem] bg-[#EED8B2] p-5 text-[#123C39] shadow-inner md:p-7">
              <SubHeading
                eyebrow="Website"
                title="Traffic detail"
                note={
                  report.website.fetchedAt
                    ? `${report.website.period} · Live, refreshed ${formatDateTime(report.website.fetchedAt)}`
                    : `${report.website.period} · ${staticUpdateNote}`
                }
              />
              <DataTable<(typeof report.website.core)[number]>
                keyFn={(row) => row.metric}
                rows={report.website.core}
                columns={[
                  { header: "Metric", render: (row) => row.metric },
                  { header: "Last 30 days", render: (row) => (row.metric === "Bounce rate" ? formatPercent(row.last30Days) : formatNumber(row.last30Days, row.metric === "Pages per visitor" ? 2 : 0)) },
                  { header: "Last 7 days", render: (row) => (row.metric === "Bounce rate" ? formatPercent(row.last7Days) : formatNumber(row.last7Days, row.metric === "Pages per visitor" ? 2 : 0)) },
                  { header: "Change (7d)", render: (row) => (row.change7d === null ? "—" : formatPercent(row.change7d)) },
                ]}
              />

              <SubHeading eyebrow="Website" title="Top pages" />
              <DataTable<(typeof report.website.topPages)[number]>
                keyFn={(row) => row.path}
                rows={report.website.topPages}
                columns={[
                  { header: "Page", render: (row) => row.path },
                  { header: "Visitors", render: (row) => formatNumber(row.visitors) },
                  { header: "Role", render: (row) => row.role },
                  { header: "SEO note", render: (row) => row.seoNote },
                ]}
              />

              <SubHeading eyebrow="Website" title="Top referrers" />
              <DataTable<(typeof report.website.topReferrers)[number]>
                keyFn={(row) => row.host}
                rows={report.website.topReferrers}
                columns={[
                  { header: "Host", render: (row) => row.host },
                  { header: "Visitors", render: (row) => formatNumber(row.visitors) },
                  { header: "Channel", render: (row) => row.channel },
                  { header: "Observation", render: (row) => row.observation },
                  { header: "Action", render: (row) => row.action },
                ]}
              />

              <SubHeading eyebrow="Website" title="Audience" note={report.website.fetchedAt ? "Live" : undefined} />
              <div className="mt-4 grid gap-5">
                <DataTable<(typeof report.website.audienceCountry)[number]>
                  keyFn={(row) => row.country}
                  rows={report.website.audienceCountry}
                  columns={[
                    { header: "Country", render: (row) => row.country },
                    { header: "Share", render: (row) => formatPercent(row.share) },
                    { header: "Visitors", render: (row) => formatNumber(row.visitors) },
                  ]}
                />
                <DataTable<(typeof report.website.audienceDevice)[number]>
                  keyFn={(row) => row.device}
                  rows={report.website.audienceDevice}
                  columns={[
                    { header: "Device", render: (row) => row.device },
                    { header: "Share", render: (row) => formatPercent(row.share) },
                  ]}
                />
                <DataTable<(typeof report.website.audienceOS)[number]>
                  keyFn={(row) => row.os}
                  rows={report.website.audienceOS}
                  columns={[
                    { header: "OS", render: (row) => row.os },
                    { header: "Share", render: (row) => formatPercent(row.share) },
                    { header: "Visitors", render: (row) => formatNumber(row.visitors) },
                  ]}
                />
              </div>
              <p className="mt-4 text-xs leading-5 text-stone-600">{report.website.note}</p>
            </div>

            <div className="mt-8 rounded-[1.5rem] bg-[#EED8B2] p-5 text-[#123C39] shadow-inner md:p-7">
              <SubHeading
                eyebrow="Google Search"
                title="Search Console detail"
                note={
                  report.googleSearch.fetchedAt
                    ? `${report.googleSearch.period} · Live, refreshed ${formatDateTime(report.googleSearch.fetchedAt)}`
                    : `${report.googleSearch.period} · ${staticUpdateNote}`
                }
              />
              <p className="mt-2 text-xs leading-5 text-stone-600">
                {report.googleSearch.fetchedAt
                  ? "The query, page, country and device breakdowns below now refresh directly from Search Console alongside the live tiles higher up this page."
                  : "The live Google Search tiles higher up this page are the current source of truth. These tables add the query, page, country and device breakdown behind that headline data as of the report date."}
              </p>
              <DataTable<(typeof report.googleSearch.kpis)[number]>
                keyFn={(row) => row.metric}
                rows={report.googleSearch.kpis}
                columns={[
                  { header: "Metric", render: (row) => row.metric },
                  { header: "Value", render: (row) => (row.metric === "CTR" ? formatPercent(row.value) : formatNumber(row.value, row.metric === "Average position" ? 1 : 0)) },
                  { header: "Definition", render: (row) => row.definition },
                  { header: "Read", render: (row) => row.read },
                ]}
              />

              <SubHeading eyebrow="Google Search" title="Daily clicks and impressions" />
              <DataTable<(typeof report.googleSearch.daily)[number]>
                keyFn={(row) => row.date}
                rows={report.googleSearch.daily}
                columns={[
                  { header: "Date", render: (row) => row.date },
                  { header: "Clicks", render: (row) => formatNumber(row.clicks) },
                  { header: "Impressions", render: (row) => formatNumber(row.impressions) },
                  { header: "CTR", render: (row) => formatPercent(row.ctr) },
                ]}
              />

              <div className="mt-4 grid gap-5">
                <div>
                  <SubHeading eyebrow="Google Search" title="Queries" />
                  <DataTable<(typeof report.googleSearch.queries)[number]>
                    keyFn={(row) => row.query}
                    rows={report.googleSearch.queries}
                    columns={[
                      { header: "Query", render: (row) => row.query },
                      { header: "Clicks", render: (row) => formatNumber(row.clicks) },
                      { header: "Impressions", render: (row) => formatNumber(row.impressions) },
                    ]}
                  />
                </div>
                <div>
                  <SubHeading eyebrow="Google Search" title="Pages" />
                  <DataTable<(typeof report.googleSearch.pages)[number]>
                    keyFn={(row) => row.page}
                    rows={report.googleSearch.pages}
                    columns={[
                      { header: "Page", render: (row) => row.page },
                      { header: "Clicks", render: (row) => formatNumber(row.clicks) },
                      { header: "Impressions", render: (row) => formatNumber(row.impressions) },
                    ]}
                  />
                </div>
                <div>
                  <SubHeading eyebrow="Google Search" title="Countries" />
                  <DataTable<(typeof report.googleSearch.countries)[number]>
                    keyFn={(row) => row.country}
                    rows={report.googleSearch.countries}
                    columns={[
                      { header: "Country", render: (row) => row.country },
                      { header: "Clicks", render: (row) => formatNumber(row.clicks) },
                      { header: "Impressions", render: (row) => formatNumber(row.impressions) },
                    ]}
                  />
                </div>
                <div>
                  <SubHeading eyebrow="Google Search" title="Devices" />
                  <DataTable<(typeof report.googleSearch.devices)[number]>
                    keyFn={(row) => row.device}
                    rows={report.googleSearch.devices}
                    columns={[
                      { header: "Device", render: (row) => row.device },
                      { header: "Clicks", render: (row) => formatNumber(row.clicks) },
                      { header: "Impressions", render: (row) => formatNumber(row.impressions) },
                    ]}
                  />
                </div>
              </div>
              <p className="mt-4 text-xs leading-5 text-stone-600">{report.googleSearch.note}</p>
            </div>

            <div className="mt-8 rounded-[1.5rem] bg-[#EED8B2] p-5 text-[#123C39] shadow-inner md:p-7">
              <SubHeading eyebrow="Technical SEO" title="Site health" note={`As of ${new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date(`${report.seoTechnical.asOf}T12:00:00Z`))} · ${staticUpdateNote}`} />
              <DataTable<(typeof report.seoTechnical.indexing)[number]>
                keyFn={(row) => row.measure}
                rows={report.seoTechnical.indexing}
                columns={[
                  { header: "Measure", render: (row) => row.measure },
                  { header: "Value", render: (row) => formatNumber(row.value) },
                  { header: "Status", render: (row) => row.status },
                  { header: "Interpretation", render: (row) => row.interpretation },
                  { header: "Action", render: (row) => row.action },
                ]}
              />

              <SubHeading eyebrow="Technical SEO" title="Not indexed" />
              <DataTable<(typeof report.seoTechnical.notIndexed)[number]>
                keyFn={(row) => row.url}
                rows={report.seoTechnical.notIndexed}
                columns={[
                  { header: "URL", render: (row) => row.url },
                  { header: "Reason", render: (row) => row.reason },
                  { header: "Assessment", render: (row) => row.assessment },
                  { header: "Treatment", render: (row) => row.treatment },
                  { header: "Priority", render: (row) => row.priority },
                ]}
              />

              <SubHeading eyebrow="Technical SEO" title="PageSpeed (lab data)" />
              <p className="mt-3 text-sm leading-6 text-stone-600">
                {report.seoTechnical.pageSpeedMeta.fetchedAt
                  ? `Live mobile Lighthouse run: ${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(report.seoTechnical.pageSpeedMeta.fetchedAt))}${report.seoTechnical.pageSpeedMeta.lighthouseVersion ? ` · Lighthouse ${report.seoTechnical.pageSpeedMeta.lighthouseVersion}` : ""}`
                  : `Latest verified PageSpeed snapshot; live refresh is temporarily unavailable. ${staticUpdateNote}`}
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {report.seoTechnical.pageSpeed.map((metric) => (
                  <div key={metric.metric} className="rounded-2xl border border-[#DDB765]/60 bg-[#FFF3DF] px-4 py-3 shadow shadow-[#1C5A50]/10">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#9A622A]">{metric.metric}</p>
                    <p className="mt-1 text-2xl font-bold text-[#123C39]">{metric.value}{metric.unit === "score" ? "" : ` ${metric.unit === "seconds" ? "s" : metric.unit === "milliseconds" ? "ms" : metric.unit}`}</p>
                    <p className="mt-2 text-xs leading-5 text-stone-600">{metric.context}</p>
                  </div>
                ))}
              </div>

              <SubHeading eyebrow="Technical SEO" title="Structured data" />
              <DataTable<(typeof report.seoTechnical.structuredData)[number]>
                keyFn={(row) => row.area}
                rows={report.seoTechnical.structuredData}
                columns={[
                  { header: "Area", render: (row) => row.area },
                  { header: "Valid", render: (row) => formatNumber(row.valid) },
                  { header: "Invalid/excluded", render: (row) => formatNumber(row.invalidOrExcluded) },
                  { header: "Finding", render: (row) => row.finding },
                  { header: "Action", render: (row) => row.action },
                ]}
              />

              <SubHeading eyebrow="Technical SEO" title="Authority" />
              <DataTable<(typeof report.seoTechnical.authority)[number]>
                keyFn={(row) => row.measure}
                rows={report.seoTechnical.authority}
                columns={[
                  { header: "Measure", render: (row) => row.measure },
                  { header: "Count", render: (row) => formatNumber(row.count) },
                  { header: "Breakdown", render: (row) => row.breakdown },
                  { header: "Implication", render: (row) => row.implication },
                  { header: "Action", render: (row) => row.action },
                ]}
              />
              <p className="mt-4 text-xs leading-5 text-stone-600">{report.seoTechnical.note}</p>
            </div>

            <div className="mt-8 rounded-[1.5rem] bg-[#EED8B2] p-5 text-[#123C39] shadow-inner md:p-7">
              <SubHeading eyebrow="Social" title="Platform overview" note={staticUpdateNote ?? undefined} />
              <DataTable<(typeof report.socialOverview.platforms)[number]>
                keyFn={(row) => row.platform}
                rows={report.socialOverview.platforms}
                columns={[
                  { header: "Platform", render: (row) => row.platform },
                  { header: "Period", render: (row) => row.period },
                  { header: "Views", render: (row) => formatNumber(row.views) },
                  { header: "Viewers", render: (row) => formatCell(row.viewers) },
                  { header: "Interactions", render: (row) => formatCell(row.interactions) },
                  { header: "Followers", render: (row) => formatCell(row.followers) },
                  { header: "Profile visits", render: (row) => formatCell(row.profileVisits) },
                  { header: "Outbound clicks", render: (row) => formatCell(row.outboundClicks) },
                  { header: "Website visitors", render: (row) => formatCell(row.websiteVisitors) },
                ]}
              />

              <SubHeading eyebrow="Social" title="Channel diagnosis" />
              <DataTable<(typeof report.socialOverview.diagnosis)[number]>
                keyFn={(row) => row.channel}
                rows={report.socialOverview.diagnosis}
                columns={[
                  { header: "Channel", render: (row) => row.channel },
                  { header: "Strength", render: (row) => row.strength },
                  { header: "Constraint", render: (row) => row.constraint },
                  { header: "Next move", render: (row) => row.nextMove },
                  { header: "Working KPI", render: (row) => row.workingKpi },
                ]}
              />
              <p className="mt-4 text-xs leading-5 text-stone-600">{report.socialOverview.note}</p>
            </div>

            {platformEntries.map(({ key, label }) => {
              const platform = report.platforms[key];
              return (
                <div key={key} className="mt-8 rounded-[1.5rem] bg-[#EED8B2] p-5 text-[#123C39] shadow-inner md:p-7">
                  <SubHeading eyebrow="Social platform" title={`${label} · ${platform.handle}`} note={`${platform.period} · ${staticUpdateNote}`} />
                  <DataTable<(typeof platform.metrics)[number]>
                    keyFn={(row) => row.metric}
                    rows={platform.metrics}
                    columns={[
                      { header: "Metric", render: (row) => row.metric },
                      { header: "Value", render: (row) => row.value },
                      { header: "Interpretation", render: (row) => row.interpretation },
                      { header: "Action", render: (row) => row.action },
                    ]}
                  />

                  {platform.topContent.length ? (
                    <>
                      <SubHeading eyebrow="Social platform" title="Top content" />
                      <DataTable<(typeof platform.topContent)[number]>
                        keyFn={(row) => `${row.rank}-${row.title}`}
                        rows={platform.topContent}
                        columns={[
                          { header: "#", render: (row) => String(row.rank) },
                          { header: "Title", render: (row) => row.title },
                          { header: "Value", render: (row) => row.value },
                          { header: "Extra", render: (row) => row.extra },
                          { header: "Note", render: (row) => row.note },
                        ]}
                      />
                    </>
                  ) : null}

                  {platform.discoverySources.length ? (
                    <>
                      <SubHeading eyebrow="Social platform" title="Discovery sources" />
                      <DataTable<(typeof platform.discoverySources)[number]>
                        keyFn={(row) => row.source}
                        rows={platform.discoverySources}
                        columns={[
                          { header: "Source", render: (row) => row.source },
                          { header: "Share", render: (row) => formatPercent(row.share) },
                          { header: "Approx. views", render: (row) => formatNumber(row.approxViews) },
                          { header: "Meaning", render: (row) => row.meaning },
                          { header: "Action", render: (row) => row.action },
                        ]}
                      />
                    </>
                  ) : null}
                  <p className="mt-4 text-xs leading-5 text-stone-600">{platform.note}</p>
                </div>
              );
            })}

            <div className="mt-8 rounded-[1.5rem] bg-[#EED8B2] p-5 text-[#123C39] shadow-inner md:p-7">
              <SubHeading eyebrow="Measurement" title="Link clicks" note={staticUpdateNote ?? undefined} />
              <DataTable<(typeof report.measurementActions.linkClicks)[number]>
                keyFn={(row) => row.linkKey}
                rows={report.measurementActions.linkClicks}
                columns={[
                  { header: "Link key", render: (row) => row.linkKey },
                  { header: "Clicks", render: (row) => formatNumber(row.clicks) },
                  { header: "First click", render: (row) => row.firstClick },
                  { header: "Last click", render: (row) => row.lastClick },
                  { header: "Status", render: (row) => row.status },
                  { header: "Interpretation", render: (row) => row.interpretation },
                ]}
              />

              <SubHeading eyebrow="Measurement" title="Gaps to close" />
              <DataTable<(typeof report.measurementActions.gaps)[number]>
                keyFn={(row) => row.gap}
                rows={report.measurementActions.gaps}
                columns={[
                  { header: "Gap", render: (row) => row.gap },
                  { header: "Current state", render: (row) => row.currentState },
                  { header: "Risk", render: (row) => row.risk },
                  { header: "Fix", render: (row) => row.fix },
                  { header: "Priority", render: (row) => row.priority },
                  { header: "Owner", render: (row) => row.owner },
                  { header: "Due", render: (row) => row.due },
                ]}
              />

              <SubHeading eyebrow="Measurement" title="90-day delivery plan" />
              <DataTable<(typeof report.measurementActions.deliveryPlan)[number]>
                keyFn={(row) => `${row.priority}-${row.workstream}`}
                rows={report.measurementActions.deliveryPlan}
                columns={[
                  { header: "Priority", render: (row) => row.priority },
                  { header: "Workstream", render: (row) => row.workstream },
                  { header: "Action", render: (row) => row.action },
                  { header: "Baseline", render: (row) => row.baseline },
                  { header: "30-day goal", render: (row) => row.goal30d },
                  { header: "90-day goal", render: (row) => row.goal90d },
                  { header: "Owner", render: (row) => row.owner },
                  { header: "Timing", render: (row) => row.timing },
                  { header: "Status", render: (row) => row.status },
                ]}
              />
              <p className="mt-4 text-xs leading-5 text-stone-600">{report.measurementActions.note}</p>
            </div>
          </section>
          ) : null}
        </>
      ) : null}
    </main>
  );
}
