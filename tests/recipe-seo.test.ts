import assert from "node:assert/strict";
import test from "node:test";
import { featuredRecipes } from "../lib/recipes.ts";
import {
  getCommunityRecipeSeo,
  getFeaturedRecipeSeo,
} from "../lib/recipe-seo.ts";

test("every featured recipe has concise search-focused metadata", () => {
  for (const recipe of featuredRecipes) {
    const seo = getFeaturedRecipeSeo(recipe);
    assert.match(seo.title, /Recipe|Recipes/);
    assert.ok(seo.title.length <= 70, `${recipe.slug} title is too long`);
    assert.ok(seo.description.length >= 100, `${recipe.slug} description is too short`);
    assert.ok(seo.description.length <= 160, `${recipe.slug} description is too long`);
  }
});

test("published community recipes have editorial SEO titles", () => {
  const recipes = [
    { id: 41, title: "Grandad's Steak & Ale Pie", location: "Bermondsey", story: "A family pie." },
    { id: 45, title: "Pat’s Haddock and Tomato Bake", location: "New Malden", story: "A family fish bake." },
    { id: 47, title: "Mum's Apple/Pear Chutney", location: "Oxford", story: "A family chutney." },
  ];

  for (const recipe of recipes) {
    const seo = getCommunityRecipeSeo(recipe);
    assert.match(seo.title, /Recipe/);
    assert.ok(seo.title.length <= 70);
    assert.ok(seo.description.length <= 160);
  }
});

