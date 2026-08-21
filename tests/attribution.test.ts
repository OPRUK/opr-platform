import assert from "node:assert/strict";
import test from "node:test";
import {
  appendAttributionToHref,
  normaliseAttribution,
} from "../lib/attribution.ts";

test("normaliseAttribution recognises approved social sources and supplies safe defaults", () => {
  assert.deepEqual(normaliseAttribution({ src: "Instagram" }), {
    source: "instagram",
    utmSource: "instagram",
    utmMedium: "social",
    utmCampaign: "bio",
  });
});

test("normaliseAttribution preserves approved UTM values", () => {
  assert.deepEqual(
    normaliseAttribution({
      source: "pinterest",
      utm_source: "pinterest",
      utm_medium: "social",
      utm_campaign: "summer_recipes",
    }),
    {
      source: "pinterest",
      utmSource: "pinterest",
      utmMedium: "social",
      utmCampaign: "summer_recipes",
    },
  );
});

test("normaliseAttribution recognises LinkedIn", () => {
  assert.deepEqual(normaliseAttribution({ src: "LinkedIn", utm_campaign: "dish_of_week" }), {
    source: "linkedin",
    utmSource: "linkedin",
    utmMedium: "social",
    utmCampaign: "dish_of_week",
  });
});

test("normaliseAttribution rejects unknown sources and unsafe campaign values", () => {
  assert.deepEqual(normaliseAttribution({ src: "newsletter" }), {
    source: null,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
  });
  assert.equal(
    normaliseAttribution({ src: "youtube", utm_campaign: "not safe!" }).utmCampaign,
    "bio",
  );
});

test("appendAttributionToHref retains query parameters and hashes", () => {
  const attribution = normaliseAttribution({ src: "tiktok" });
  assert.equal(
    appendAttributionToHref("/family-cookbook?view=all#recipes", attribution),
    "/family-cookbook?view=all&src=tiktok&utm_source=tiktok&utm_medium=social&utm_campaign=bio#recipes",
  );
});

test("appendAttributionToHref leaves links unchanged without approved attribution", () => {
  assert.equal(
    appendAttributionToHref("/share", normaliseAttribution({ src: "unknown" })),
    "/share",
  );
});
