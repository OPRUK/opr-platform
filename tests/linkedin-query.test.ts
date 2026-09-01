import assert from "node:assert/strict";
import test from "node:test";
import { buildLinkedInPageStatisticsUrl } from "../lib/linkedin-query.ts";

test("builds LinkedIn's documented flattened time interval query", () => {
  const url = buildLinkedInPageStatisticsUrl({
    organizationUrn: "urn:li:organization:141313963",
    start: 1785801600000,
    end: 1788220799999,
  });

  assert.equal(url.searchParams.get("q"), "organization");
  assert.equal(url.searchParams.get("organization"), "urn:li:organization:141313963");
  assert.equal(url.searchParams.get("timeIntervals.timeGranularityType"), "DAY");
  assert.equal(url.searchParams.get("timeIntervals.timeRange.start"), "1785801600000");
  assert.equal(url.searchParams.get("timeIntervals.timeRange.end"), "1788220799999");
  assert.equal(url.searchParams.has("timeIntervals"), false);
});
