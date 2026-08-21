import assert from "node:assert/strict";
import test from "node:test";
import { countryName } from "../lib/country-names.ts";

test("converts Search Console ISO country codes into readable names", () => {
  assert.equal(countryName("gbr"), "United Kingdom");
  assert.equal(countryName("GRC"), "Greece");
  assert.equal(countryName("deu"), "Germany");
  assert.equal(countryName("irl"), "Ireland");
  assert.equal(countryName("prt"), "Portugal");
  assert.equal(countryName("can"), "Canada");
  assert.equal(countryName("ind"), "India");
  assert.equal(countryName("ita"), "Italy");
  assert.equal(countryName("mys"), "Malaysia");
  assert.equal(countryName("nga"), "Nigeria");
});

test("preserves existing names and unknown values", () => {
  assert.equal(countryName("United Kingdom"), "United Kingdom");
  assert.equal(countryName("Unknown"), "Unknown");
});
