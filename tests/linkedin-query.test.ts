import assert from "node:assert/strict";
import test from "node:test";
import { buildLinkedInPageStatisticsUrl } from "../lib/linkedin-query.ts";

test("preserves LinkedIn's documented Rest.li 2.0 time interval syntax", () => {
  const url = buildLinkedInPageStatisticsUrl({
    organizationUrn: "urn:li:organization:141313963",
    start: 1785801600000,
    end: 1788220799999,
  });

  assert.equal(url.searchParams.get("q"), "organization");
  assert.equal(url.searchParams.get("organization"), "urn:li:organization:141313963");
  assert.equal(
    url.searchParams.get("timeIntervals"),
    "(timeRange:(start:1785801600000,end:1788220799999),timeGranularityType:DAY)",
  );
  assert.match(
    url.toString(),
    /timeIntervals=\(timeRange:\(start:1785801600000,end:1788220799999\),timeGranularityType:DAY\)$/,
  );
});
