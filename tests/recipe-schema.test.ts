import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRecipeKeywords,
  buildRecipeVideoJsonLd,
  recipeInstructionUrl,
} from "../lib/recipe-schema.ts";

test("recipe keywords keep verified values and remove case-insensitive duplicates", () => {
  assert.equal(
    buildRecipeKeywords(["Sudesh's Bhindi", "Indian, Main", "indian", null, "family recipe"]),
    "Sudesh's Bhindi, Indian, Main, family recipe",
  );
});

test("recipe instruction URLs point to visible method anchors", () => {
  assert.equal(
    recipeInstructionUrl("https://otherpeoplesrecipes.co.uk/family-cookbook/sudeshs-bhindi", 2),
    "https://otherpeoplesrecipes.co.uk/family-cookbook/sudeshs-bhindi#method-step-2",
  );
});

test("recipe video metadata only includes a thumbnail when one exists", () => {
  assert.deepEqual(
    buildRecipeVideoJsonLd({
      name: "How to make a family pie",
      description: "A submitted cooking video.",
      contentUrl: "https://cdn.example.com/pie.mp4",
      thumbnailUrl: null,
    }),
    {
      "@type": "VideoObject",
      name: "How to make a family pie",
      description: "A submitted cooking video.",
      contentUrl: "https://cdn.example.com/pie.mp4",
    },
  );
});
