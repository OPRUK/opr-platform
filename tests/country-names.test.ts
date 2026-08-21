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

test("converts Vercel ISO country codes into readable names", () => {
  assert.equal(countryName("GB"), "United Kingdom");
  assert.equal(countryName("US"), "United States");
  assert.equal(countryName("GR"), "Greece");
  assert.equal(countryName("IN"), "India");
  assert.equal(countryName("BR"), "Brazil");
  assert.equal(countryName("FR"), "France");
  assert.equal(countryName("IE"), "Ireland");
  assert.equal(countryName("DE"), "Germany");
  assert.equal(countryName("AE"), "United Arab Emirates");
  assert.equal(countryName("PK"), "Pakistan");
});

test("preserves existing names and unknown values", () => {
  assert.equal(countryName("United Kingdom"), "United Kingdom");
  assert.equal(countryName("Unknown"), "Unknown");
});
