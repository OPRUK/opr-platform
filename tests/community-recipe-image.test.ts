import assert from "node:assert/strict";
import test from "node:test";
import {
  fallbackImageForCommunityRecipe,
  fallbackOriginalImageForCommunityRecipe,
} from "../lib/community-recipe-image.ts";

test("Georgina's chutney uses its approved finished-dish photograph", () => {
  assert.equal(
    fallbackImageForCommunityRecipe("Mum's Apple/Pear Chutney"),
    "/images/recipes/georginas-mums-apple-pear-chutney.webp",
  );
});

test("Georgina's chutney includes the original handwritten recipe", () => {
  assert.deepEqual(fallbackOriginalImageForCommunityRecipe(47), {
    src: "/images/recipes/georginas-mums-apple-pear-chutney-original.webp",
    width: 1600,
    height: 1200,
  });
});

test("Grandad's Steak & Ale Pie uses its local cookbook image when no upload exists", () => {
  assert.equal(
    fallbackImageForCommunityRecipe("Grandad's Steak & Ale Pie"),
    "/images/recipes/grandads-steak-ale-pie.png",
  );
});

test("unknown community recipes keep the standard text fallback", () => {
  assert.equal(fallbackImageForCommunityRecipe("A new family recipe"), null);
});
