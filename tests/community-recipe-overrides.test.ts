import assert from "node:assert/strict";
import test from "node:test";
import { applyCommunityRecipeEditorialOverride } from "../lib/community-recipe-overrides.ts";

test("Georgina's published recipe corrects the handwritten quantities", () => {
  const recipe = applyCommunityRecipeEditorialOverride({
    id: 47,
    name: "georgina hovanessian",
    ingredients: "41lbs Windfall Apples or Pears\n1 tsp black pepper",
    method: "Cooks fruit",
  });

  assert.equal(recipe.name, "Georgina Hovanessian");
  assert.match(recipe.ingredients, /^4 lb windfall apples or pears/m);
  assert.match(recipe.ingredients, /^½ tsp black pepper/m);
  assert.doesNotMatch(recipe.ingredients, /41lbs/);
  assert.match(recipe.method, /^Cook the fruit/m);
});

test("editorial overrides leave unrelated community recipes unchanged", () => {
  const recipe = { id: 41, story: "Grandad's original story" };
  assert.equal(applyCommunityRecipeEditorialOverride(recipe), recipe);
});
