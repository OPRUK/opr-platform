import assert from "node:assert/strict";
import test from "node:test";
import { fallbackImageForCommunityRecipe } from "../lib/community-recipe-image.ts";

test("Grandad's Steak & Ale Pie uses its local cookbook image when no upload exists", () => {
  assert.equal(
    fallbackImageForCommunityRecipe("Grandad's Steak & Ale Pie"),
    "/images/recipes/grandads-steak-ale-pie.png",
  );
});

test("unknown community recipes keep the standard text fallback", () => {
  assert.equal(fallbackImageForCommunityRecipe("A new family recipe"), null);
});
