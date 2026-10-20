import assert from "node:assert/strict";
import test from "node:test";
import { pinterestLifetimeImpressions } from "../lib/pinterest-metrics.ts";

test("uses lifetime impressions and preserves real zeroes", () => {
  assert.equal(pinterestLifetimeImpressions({ pin_metrics: { lifetime_metrics: { impression: 12 } } }), 12);
  assert.equal(pinterestLifetimeImpressions({ pin_metrics: { lifetime_metrics: { impression: 0 } } }), 0);
});
test("does not fabricate a zero when pin analytics are absent or invalid", () => {
  assert.equal(pinterestLifetimeImpressions({}), null);
  assert.equal(pinterestLifetimeImpressions({ pin_metrics: { lifetime_metrics: { impression: -1 } } }), null);
});
