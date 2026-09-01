import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { communityRecipeMethodPhotos } from "../lib/community-recipe-visuals.ts";
import { featuredRecipes, type RecipeMethodPhoto } from "../lib/recipes.ts";

function assertValidPhotos(photos: RecipeMethodPhoto[], methodLength: number) {
  assert.equal(photos.length, 3);

  for (const photo of photos) {
    assert.ok(photo.step >= 1 && photo.step <= methodLength);
    assert.ok(photo.alt.trim().length > 0);
    assert.ok(photo.title.trim().length > 0);
    assert.ok(photo.caption.trim().length > 0);
    assert.ok(existsSync(`public${photo.src}`), `${photo.src} should exist`);
  }
}

test("every featured Living Cookbook recipe has three valid visual stages", () => {
  for (const recipe of featuredRecipes) {
    assert.ok(recipe.methodPhotos, `${recipe.slug} should have a visual guide`);
    assertValidPhotos(recipe.methodPhotos, recipe.method.length);
  }
});

test("Grandad's Steak & Ale Pie has three valid visual stages", () => {
  assertValidPhotos(communityRecipeMethodPhotos[41], 18);
});

test("Pat's Haddock and Tomato Bake has all nine valid visual stages", () => {
  const photos = communityRecipeMethodPhotos[45];

  assert.equal(photos.length, 9);
  assert.deepEqual(
    photos.map((photo) => photo.step),
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
  );
  for (const photo of photos) {
    assert.ok(photo.alt.trim().length > 0);
    assert.ok(photo.title.trim().length > 0);
    assert.ok(photo.caption.trim().length > 0);
    assert.ok(existsSync(`public${photo.src}`), `${photo.src} should exist`);
  }
});

test("Georgina's chutney has four valid visual stages", () => {
  const photos = communityRecipeMethodPhotos[47];

  assert.equal(photos.length, 4);
  for (const photo of photos) {
    assert.ok(photo.step >= 1 && photo.step <= 6);
    assert.ok(photo.alt.trim().length > 0);
    assert.ok(photo.title.trim().length > 0);
    assert.ok(photo.caption.trim().length > 0);
    assert.ok(existsSync(`public${photo.src}`), `${photo.src} should exist`);
  }
});
