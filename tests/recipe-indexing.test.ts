import assert from "node:assert/strict";
import test from "node:test";
import { featuredRecipes } from "../lib/recipes.ts";
import { cookbookRecipeEntries } from "../lib/cookbook-index.ts";
import { getRecipeImageDimensions } from "../lib/recipe-images.ts";
import { featuredRecipePublishedAt, recipeLastModified, recipeSeoUpdatedAt } from "../lib/recipe-publication.ts";
import { buildRecipeAuthor } from "../lib/recipe-schema.ts";

test("the cookbook index includes community recipes and excludes redirected duplicates", () => {
  const community = [
    { id: 1, title: "Sudesh's homemade bhindi", category: "Main" },
    { id: 41, title: "Grandad's Steak & Ale Pie", category: "Main course" },
    { id: 45, title: "Pat’s Haddock and Tomato Bake", category: "Main course" },
    { id: 47, title: "Mum's Apple/Pear Chutney", category: "Condiment" },
    { id: 999, title: featuredRecipes[0].title, category: featuredRecipes[0].category },
  ];
  const entries = cookbookRecipeEntries(featuredRecipes, community);
  assert.equal(entries.length, featuredRecipes.length + 3);
  assert.equal(new Set(entries.map((entry) => entry.href)).size, entries.length);
  for (const id of [41, 45, 47]) assert.ok(entries.some((entry) => entry.href === `/family-cookbook/community/${id}`));
  assert.ok(!entries.some((entry) => entry.href.endsWith("/community/1") || entry.href.endsWith("/community/999")));
  assert.equal(entries[0].title, "Gautam & Shobha's Tandoori Aloo Nazakat");
  assert.equal(entries.at(-1)?.title, "Mum's Apple/Pear Chutney");
});

test("every featured recipe has a sourced publication date and a large measured dish image", () => {
  for (const recipe of featuredRecipes) {
    const published = featuredRecipePublishedAt(recipe);
    assert.ok(published, recipe.slug);
    assert.ok(Date.parse(published) <= Date.parse(recipeSeoUpdatedAt), recipe.slug);
    const image = getRecipeImageDimensions(recipe.image);
    assert.ok(image && image.width * image.height >= 50_000, recipe.slug);
  }
  assert.equal(featuredRecipePublishedAt({ slug: "not-yet-published" }), undefined);
  assert.equal(featuredRecipePublishedAt({ slug: "daves-butter-chicken", datePublished: "2026-07-30" }), "2026-07-30");
  assert.equal(recipeLastModified("2026-08-01"), recipeSeoUpdatedAt);
  assert.equal(recipeLastModified("2026-11-01"), "2026-11-01");
  assert.equal(getRecipeImageDimensions("https://example.com/unknown-upload.jpg"), undefined);
});

test("recipe authors distinguish people from the publisher and preserve coauthors", () => {
  assert.deepEqual(buildRecipeAuthor([], "OPR", "https://otherpeoplesrecipes.co.uk"), {
    "@type": "Organization", name: "OPR", url: "https://otherpeoplesrecipes.co.uk",
  });
  assert.deepEqual(buildRecipeAuthor([" Phil ", "Serb", "Phil", ""], "OPR", "https://otherpeoplesrecipes.co.uk"), [
    { "@type": "Person", name: "Phil" }, { "@type": "Person", name: "Serb" },
  ]);
  assert.deepEqual(featuredRecipes.find((recipe) => recipe.slug === "krishna-anands-baingan-ka-bharta")?.authorNames, ["Krishna Anand"]);
});
