import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { featuredRecipes } from "../lib/recipes";
import { recipeCollections } from "../lib/recipe-collections";
import { filmSlug, films } from "../lib/films";
import { SITE_URL } from "../lib/site";
import { cookalongEvent } from "../lib/cookalong-event";

const staticRoutes: Array<{ path: string; lastModified: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
  { path: "/", lastModified: "2026-10-05", changeFrequency: "monthly", priority: 1 },
  { path: "/family-cookbook", lastModified: "2026-10-05", changeFrequency: "weekly", priority: 0.9 },
  { path: "/founder", lastModified: "2026-08-01", changeFrequency: "yearly", priority: 0.5 },
  { path: "/films", lastModified: "2026-10-05", changeFrequency: "monthly", priority: 0.6 },
  { path: "/dave-and-rubble", lastModified: "2026-10-06", changeFrequency: "weekly", priority: 0.8 },
  ...(cookalongEvent.evergreenPage
    ? [{ path: "/live-with-dave", lastModified: cookalongEvent.lastMeaningfulUpdate, changeFrequency: "monthly" as const, priority: 0.6 }]
    : []),
  { path: "/join-our-table", lastModified: "2026-10-05", changeFrequency: "monthly", priority: 0.7 },
  { path: "/share", lastModified: "2026-10-05", changeFrequency: "monthly", priority: 0.8 },
  { path: "/accessibility", lastModified: "2026-08-01", changeFrequency: "yearly", priority: 0.4 },
];

const siteLaunchDate = new Date("2026-08-01");
const collectionLastModified: Record<string, string> = {
  "british-family-recipes": "2026-10-05",
};

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
      lastModified: recipe.datePublished ? new Date(recipe.datePublished) : siteLaunchDate,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  for (const collection of recipeCollections) {
    entries.push({
      url: `${SITE_URL}/family-cookbook/collections/${collection.slug}`,
      lastModified: new Date(collectionLastModified[collection.slug] ?? "2026-09-04"),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  for (const film of films) {
    entries.push({
      url: `${SITE_URL}/films/${filmSlug(film)}`,
      lastModified: film.uploadDate ? new Date(film.uploadDate) : siteLaunchDate,
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
      lastModified: recipe.published_at ? new Date(recipe.published_at) : siteLaunchDate,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}
