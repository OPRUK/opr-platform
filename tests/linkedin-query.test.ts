import assert from "node:assert/strict";
import test from "node:test";
import { buildLinkedInPageStatisticsUrl, buildLinkedInShareStatisticsUrl, buildLinkedInVideoStatisticsUrl, linkedInVideoViewCount } from "../lib/linkedin-query.ts";

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

test("preserves LinkedIn's documented share-statistics query syntax", () => {
  const url = buildLinkedInShareStatisticsUrl({
    organizationUrn: "urn:li:organization:141313963",
    start: 1785801600000,
    end: 1788220799999,
  });

  assert.equal(url.searchParams.get("q"), "organizationalEntity");
  assert.equal(url.searchParams.get("organizationalEntity"), "urn:li:organization:141313963");
  assert.equal(
    url.searchParams.get("timeIntervals"),
    "(timeRange:(start:1785801600000,end:1788220799999),timeGranularityType:DAY)",
  );
  assert.match(
    url.toString(),
    /timeIntervals=\(timeRange:\(start:1785801600000,end:1788220799999\),timeGranularityType:DAY\)$/,
  );
});


test("requests lifetime organization video views without substituting impressions", () => {
  const url = buildLinkedInVideoStatisticsUrl("urn:li:ugcPost:7518292422653775872");
  assert.equal(url.searchParams.get("entity"), "urn:li:ugcPost:7518292422653775872");
  assert.equal(url.searchParams.get("type"), "VIDEO_VIEW");
  assert.equal(url.searchParams.get("aggregation"), "ALL");
  assert.equal(url.searchParams.has("timeRange"), false);
  assert.throws(() => buildLinkedInVideoStatisticsUrl("urn:li:person:123"));
});

test("retains unavailable LinkedIn metrics as missing and accepts a genuine zero", () => {
  assert.equal(linkedInVideoViewCount({ elements: [{ value: 11 }] }), 11);
  assert.equal(linkedInVideoViewCount({ elements: [{ value: 0 }] }), 0);
  assert.equal(linkedInVideoViewCount({ elements: [] }), null);
  assert.equal(linkedInVideoViewCount({ elements: [{}] }), null);
  assert.equal(linkedInVideoViewCount({ elements: [{ value: -1 }] }), null);
});
