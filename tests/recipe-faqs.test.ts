import assert from "node:assert/strict";
import test from "node:test";
import {
  buildFaqPageJsonLd,
  communityRecipeFaqs,
  type RecipeFaq,
} from "../lib/recipe-faqs.ts";
import { featuredRecipes } from "../lib/recipes.ts";

function assertValidFaqs(faqs: RecipeFaq[]) {
  assert.ok(faqs.length >= 4, "each recipe should answer at least four useful questions");
  assert.equal(new Set(faqs.map((faq) => faq.question)).size, faqs.length);

  for (const faq of faqs) {
    assert.ok(faq.question.trim().endsWith("?"));
    assert.ok(faq.answer.trim().length >= 40);
  }

  const jsonLd = buildFaqPageJsonLd(faqs);
  assert.equal(jsonLd["@type"], "FAQPage");
  assert.equal(jsonLd.mainEntity.length, faqs.length);
}

test("every featured Living Cookbook recipe has helpful answers", () => {
  for (const recipe of featuredRecipes) {
    assertValidFaqs(recipe.faqs);
  }
});

test("Grandad's Steak & Ale Pie has helpful answers", () => {
  assertValidFaqs(communityRecipeFaqs[41]);
});
