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

test("Pat's published recipe includes its proofread copy and complete method", () => {
  const recipe = applyCommunityRecipeEditorialOverride({
    id: 45,
    title: "Pat’s Haddock And Tomato Bake",
    name: "Amy Wislocki",
    story: "This was a regular favourite",
    ingredients: "4 undyed smoked haddock fillets",
    method: "Slice the onion",
    cook_notes: "You could use a mix",
  });

  assert.equal(recipe.title, "Pat’s Haddock and Tomato Bake");
  assert.match(recipe.story, /My mum, Pat, hated cooking/);
  assert.match(recipe.ingredients, /^Butter, for cooking$/m);
  assert.match(recipe.ingredients, /^Cooked rice and green vegetables, to serve$/m);
  assert.equal(recipe.method.split("\n").length, 9);
  assert.match(recipe.method, /^Bake at 190°C for 20–25 minutes/m);
  assert.match(recipe.cook_notes, /smoked haddock gives the dish the most flavour/);
});

test("editorial overrides leave unrelated community recipes unchanged", () => {
  const recipe = { id: 41, story: "Grandad's original story" };
  assert.equal(applyCommunityRecipeEditorialOverride(recipe), recipe);
});
