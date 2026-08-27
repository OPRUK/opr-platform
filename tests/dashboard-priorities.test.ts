import assert from "node:assert/strict";
import test from "node:test";
import { buildDashboardPriorities } from "../lib/dashboard-priorities.ts";
import type { AnalyticsSnapshot } from "../lib/admin-analytics-types.ts";
import type { AnalyticsReport } from "../lib/analytics-report-types.ts";

const now = "2026-08-27T12:00:00.000Z";

function report(scores = { performance: 100, accessibility: 100 }, updatedAt = now) {
  return {
    staticDataUpdatedAt: updatedAt,
    seoTechnical: {
      pageSpeed: [
        { metric: "Performance", value: scores.performance, unit: "score", context: "test" },
        { metric: "Accessibility", value: scores.accessibility, unit: "score", context: "test" },
      ],
    },
  } as AnalyticsReport;
}

function snapshot(): AnalyticsSnapshot {
  return {
    capturedAt: "2026-08-27",
    title: "Test",
    website: { period: "30 days", visitors: 1, pageViews: 1, bounceRate: 0, pagesPerVisitor: 1, fetchedAt: now },
    google: { period: "28 days", clicks: 1, impressions: 1, ctr: 1, averagePosition: 1, indexedPages: 1, provisionalFrom: null, fetchedAt: now },
    social: [{ platform: "Instagram", period: "30 days", exposureLabel: "Views", exposures: 1, interactions: 1, followers: 1, profileVisits: 1, outboundClicks: 1, websiteVisitors: 1, fetchedAt: now }],
    pageSpeed: null,
    recommendations: [],
  };
}

function build(overrides: Partial<Parameters<typeof buildDashboardPriorities>[0]> = {}) {
  return buildDashboardPriorities({
    now,
    linkClicks: 0,
    ctaClicks: 0,
    conversions: 0,
    campaigns: 0,
    snapshot: snapshot(),
    report: report(),
    films: [],
    recipes: [{ title: "Complete recipe", faqCount: 4, visualCount: 3 }],
    ...overrides,
  });
}

test("returns no priorities when live and audited inputs are healthy", () => {
  assert.deepEqual(build(), []);
});

test("raises P1 for stale core analytics and failed conversion journeys", () => {
  const stale = snapshot();
  stale.website.fetchedAt = "2026-08-24T10:00:00.000Z";
  const priorities = build({ snapshot: stale, ctaClicks: 25 });

  assert.equal(priorities.find((item) => item.id === "core-data-stale")?.priority, "P1");
  assert.equal(priorities.find((item) => item.id === "conversion-zero")?.priority, "P1");
});

test("turns site completeness and Lighthouse findings into P2 work", () => {
  const priorities = build({
    report: report({ performance: 100, accessibility: 97 }),
    recipes: [{ title: "New recipe", faqCount: 3, visualCount: 0 }],
  });

  assert.equal(priorities.find((item) => item.id === "accessibility-score")?.priority, "P2");
  assert.match(priorities.find((item) => item.id === "recipe-faq-coverage")?.evidence ?? "", /New recipe/);
  assert.match(priorities.find((item) => item.id === "recipe-visual-coverage")?.evidence ?? "", /New recipe/);
});
