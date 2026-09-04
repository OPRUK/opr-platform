import assert from "node:assert/strict";
import test from "node:test";
import {
  getRecipeCollection,
  getRecipeCollectionsForRecipe,
  recipeCollections,
} from "../lib/recipe-collections.ts";
import { featuredRecipes } from "../lib/recipes.ts";

test("recipe collections are unique, useful and resolve to real recipes", () => {
  assert.equal(new Set(recipeCollections.map((collection) => collection.slug)).size, recipeCollections.length);

  for (const collection of recipeCollections) {
    assert.ok(collection.recipes.length >= 2, `${collection.slug} is too thin`);
    assert.ok(collection.metaTitle.length <= 60, `${collection.slug} title is too long`);
    assert.ok(collection.description.length >= 100);
    assert.ok(collection.description.length <= 160, `${collection.slug} description is too long`);
    assert.ok(collection.introduction.length >= 2);
    assert.equal(getRecipeCollection(collection.slug), collection);
    assert.equal(
      new Set(collection.recipes.map((recipe) => recipe.slug)).size,
      collection.recipes.length,
      `${collection.slug} repeats a recipe`,
    );
  }
});

test("every featured recipe links back to at least one collection", () => {
  for (const recipe of featuredRecipes) {
    assert.ok(
      getRecipeCollectionsForRecipe(recipe.slug).length > 0,
      `${recipe.slug} is missing a collection`,
    );
  }
});

test("unknown collection slugs do not resolve", () => {
  assert.equal(getRecipeCollection("not-a-real-collection"), undefined);
});
