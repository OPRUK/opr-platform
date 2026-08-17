"use client";

import Link from "next/link";
import type { AdminAnalyticsResponse } from "../../lib/admin-analytics-types";

type AdminAnalyticsPanelProps = {
  analytics: AdminAnalyticsResponse | null;
  loading: boolean;
  message: string;
  exporting: boolean;
  onDownload: () => void;
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

function formatPercent(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
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

export default function AdminAnalyticsPanel({
  analytics,
  loading,
  message,
  exporting,
  onDownload,
  onOpenSecurity,
  onSignOut,
}: AdminAnalyticsPanelProps) {
  const snapshot = analytics?.snapshot ?? null;
  const sourceMaximum = Math.max(
    1,
    ...(analytics?.sources.map(
      (source) => source.linkClicks + source.ctaClicks + source.conversions,
    ) ?? []),
  );
  const socialExposures = snapshot?.social.reduce(
    (total, platform) => total + platform.exposures,
    0,
  ) ?? 0;

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#EED8B2] px-5 py-8 text-[#123C39] md:px-10 md:py-10">
      <header className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Private OPR area</p>
          <h1 className="mt-4 text-4xl font-bold md:text-5xl">Analytics dashboard</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-700">
            A private view of website discovery, social reach and the actions people take around the OPR table.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-start md:justify-end md:self-auto">
          <Link href="/admin" className="text-sm font-medium underline underline-offset-4">
            Recipe inbox
          </Link>
          <button type="button" onClick={onOpenSecurity} className="text-sm font-medium underline underline-offset-4">
            Security
          </button>
          <button
            type="button"
            onClick={onDownload}
            disabled={exporting || !analytics}
            className="rounded-full bg-[#123C39] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#08231F] disabled:cursor-wait disabled:opacity-60"
          >
            {exporting ? "Preparing spreadsheet…" : "Download analytics (.xlsx)"}
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="rounded-full border border-[#123C39] px-5 py-2.5 text-sm font-medium transition hover:bg-[#123C39] hover:text-white"
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
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <MetricCard label="Link-page clicks" value={formatNumber(analytics.linkClicks)} note="Clicks from the OPR links page to a chosen destination." />
              <MetricCard label="Site actions" value={formatNumber(analytics.ctaClicks)} note="Tracked cookbook, film, founder and sharing actions." />
              <MetricCard label="Conversions" value={formatNumber(analytics.conversions)} note="Completed table sign-ups and recipe submissions." />
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-[#DDB765]/70 bg-[#FFF3DF] shadow-lg shadow-[#1C5A50]/10">
              <div className="border-b border-[#DDB765]/60 px-6 py-5">
                <h3 className="text-xl font-bold">Source comparison</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">The separate source links now show which social channels produce measurable visits and actions.</p>
              </div>
              <div className="overflow-x-auto">
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

          {snapshot ? (
            <>
              <section aria-labelledby="baseline-heading" className="mx-auto mt-12 max-w-7xl rounded-[2rem] bg-[#FFF3DF] p-6 shadow-xl shadow-[#1C5A50]/10 md:p-9">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#9A622A]">Management baseline</p>
                    <h2 id="baseline-heading" className="mt-3 text-3xl font-bold">Website and Google visibility</h2>
                  </div>
                  <p className="text-sm text-stone-600">Captured {new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date(`${snapshot.capturedAt}T12:00:00Z`))}</p>
                </div>
                <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard label="Website visitors" value={formatNumber(snapshot.website.visitors)} note={snapshot.website.period} />
                  <MetricCard label="Page views" value={formatNumber(snapshot.website.pageViews)} note={`${formatNumber(snapshot.website.pagesPerVisitor, 2)} pages per visitor`} />
                  <MetricCard label="Google clicks" value={formatNumber(snapshot.google.clicks)} note={`${formatNumber(snapshot.google.impressions)} search impressions`} />
                  <MetricCard label="Google CTR" value={formatPercent(snapshot.google.ctr)} note={`Average position ${formatNumber(snapshot.google.averagePosition, 1)}`} />
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
                <div className="mt-6 overflow-x-auto rounded-3xl border border-[#DDB765]/70 bg-[#FFF3DF] shadow-lg shadow-[#1C5A50]/10">
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
                          <th scope="row" className="px-6 py-4 font-semibold">{platform.platform}</th>
                          <td className="px-4 py-4 text-stone-600">{platform.period}</td>
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
              </section>

              <section aria-labelledby="recommendations-heading" className="mx-auto mt-12 max-w-7xl">
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#9A622A]">Recommended next moves</p>
                <h2 id="recommendations-heading" className="mt-3 text-3xl font-bold">Turn discovery into a seat at the table</h2>
                <div className="mt-6 grid gap-5 lg:grid-cols-3">
                  {snapshot.recommendations.map((recommendation, index) => (
                    <article key={recommendation.title} className="rounded-3xl border border-[#DDB765]/70 bg-[#FFF3DF] p-6 shadow-lg shadow-[#1C5A50]/10">
                      <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#9A622A]">Priority {index + 1}</p>
                      <h3 className="mt-3 text-2xl font-bold">{recommendation.title}</h3>
                      <p className="mt-4 leading-7 text-stone-700">{recommendation.evidence}</p>
                      <p className="mt-5 border-t border-[#DDB765]/60 pt-5 font-medium leading-7 text-[#123C39]">{recommendation.action}</p>
                    </article>
                  ))}
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
            Dashboard generated {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(analytics.generatedAt))}. Native social figures are snapshots and should be refreshed at month-end; live first-party figures update whenever this page is opened.
          </p>
        </>
      ) : null}
    </main>
  );
}
