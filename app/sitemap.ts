import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { featuredRecipes } from "../lib/recipes";
import { recipeCollections } from "../lib/recipe-collections";
import { filmSlug, films, filmsLastUpdated } from "../lib/films";
import { SITE_URL } from "../lib/site";
import { cookalongEvent } from "../lib/cookalong-event";
import { featuredRecipePublishedAt, recipeLastModified, recipeSeoUpdatedAt } from "../lib/recipe-publication";

const staticRoutes: Array<{ path: string; lastModified: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
  { path: "/", lastModified: "2026-10-05", changeFrequency: "monthly", priority: 1 },
  { path: "/family-cookbook", lastModified: recipeSeoUpdatedAt, changeFrequency: "weekly", priority: 0.9 },
  { path: "/founder", lastModified: "2026-08-01", changeFrequency: "yearly", priority: 0.5 },
  { path: "/films", lastModified: filmsLastUpdated, changeFrequency: "weekly", priority: 0.6 },
  { path: "/dave-and-rubble", lastModified: filmsLastUpdated, changeFrequency: "weekly", priority: 0.8 },
  ...(cookalongEvent.evergreenPage
    ? [{ path: "/live-with-dave", lastModified: cookalongEvent.lastMeaningfulUpdate, changeFrequency: "monthly" as const, priority: 0.6 }]
    : []),
  { path: "/join-our-table", lastModified: "2026-10-05", changeFrequency: "monthly", priority: 0.7 },
  { path: "/share", lastModified: "2026-08-01", changeFrequency: "monthly", priority: 0.8 },
  { path: "/preserve-family-recipes", lastModified: "2026-10-21", changeFrequency: "monthly", priority: 0.8 },
  { path: "/press", lastModified: "2026-10-21", changeFrequency: "monthly", priority: 0.5 },
  { path: "/accessibility", lastModified: "2026-08-01", changeFrequency: "yearly", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(route.lastModified),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  for (const recipe of featuredRecipes) {
    entries.push({
      url: `${SITE_URL}/family-cookbook/${recipe.slug}`,
      lastModified: new Date(recipeLastModified(featuredRecipePublishedAt(recipe))),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  for (const collection of recipeCollections) {
    entries.push({
      url: `${SITE_URL}/family-cookbook/collections/${collection.slug}`,
      lastModified: new Date(recipeSeoUpdatedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  for (const film of films) {
    entries.push({
      url: `${SITE_URL}/films/${filmSlug(film)}`,
      lastModified: new Date(filmsLastUpdated),
      changeFrequency: "yearly",
      priority: 0.7,
    });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Keep the public sitemap available even while a preview build has no
  // database settings. Production adds community recipes when they are set.
  if (!supabaseUrl || !supabaseKey) {
    return entries;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: communityRecipes } = await supabase
    .from("recipe_submissions")
    .select("id, published_at")
    .eq("is_published", true);

  for (const recipe of communityRecipes ?? []) {
    if (recipe.id === 1) continue;
    entries.push({
      url: `${SITE_URL}/family-cookbook/community/${recipe.id}`,
      lastModified: new Date(recipeLastModified(recipe.published_at)),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}
