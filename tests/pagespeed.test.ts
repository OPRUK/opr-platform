import assert from "node:assert/strict";
import test from "node:test";
import { parsePageSpeedResponse } from "../lib/pagespeed-data.ts";

const completeResponse = {
  analysisUTCTimestamp: "2026-08-20T10:15:00Z",
  lighthouseResult: {
    finalUrl: "https://otherpeoplesrecipes.co.uk/",
    lighthouseVersion: "13.0.1",
    categories: {
      performance: { score: 0.91 },
      accessibility: { score: 0.98 },
      "best-practices": { score: 1 },
      seo: { score: 1 },
    },
    audits: {
      "first-contentful-paint": { numericValue: 923.4 },
      "largest-contentful-paint": { numericValue: 1834.8 },
      "total-blocking-time": { numericValue: 18.6 },
      "cumulative-layout-shift": { numericValue: 0.0044 },
      "speed-index": { numericValue: 1422.7 },
    },
  },
};

test("converts a PageSpeed Lighthouse response into dashboard lab metrics", () => {
  const summary = parsePageSpeedResponse(completeResponse, "https://example.com/");

  assert.ok(summary);
  assert.equal(summary.fetchedAt, "2026-08-20T10:15:00Z");
  assert.equal(summary.testedUrl, "https://otherpeoplesrecipes.co.uk/");
  assert.equal(summary.lighthouseVersion, "13.0.1");
  assert.deepEqual(
    summary.metrics.map(({ metric, value, unit }) => ({ metric, value, unit })),
    [
      { metric: "Performance", value: 91, unit: "score" },
      { metric: "Accessibility", value: 98, unit: "score" },
      { metric: "Best Practices", value: 100, unit: "score" },
      { metric: "SEO", value: 100, unit: "score" },
      { metric: "First Contentful Paint", value: 0.92, unit: "seconds" },
      { metric: "Largest Contentful Paint", value: 1.83, unit: "seconds" },
      { metric: "Total Blocking Time", value: 19, unit: "milliseconds" },
      { metric: "Cumulative Layout Shift", value: 0.004, unit: "score" },
      { metric: "Speed Index", value: 1.42, unit: "seconds" },
    ],
  );
});

test("rejects incomplete PageSpeed responses instead of presenting partial data as current", () => {
  assert.equal(
    parsePageSpeedResponse({ lighthouseResult: { categories: completeResponse.lighthouseResult.categories } }, "https://example.com/"),
    null,
  );
});
