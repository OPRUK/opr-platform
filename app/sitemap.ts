import type { MetadataRoute } from "next";
import { featuredRecipes } from "../lib/recipes";
import { supabase } from "../lib/supabase/client";
import { SITE_URL } from "../lib/site";

const staticRoutes: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/family-cookbook", changeFrequency: "weekly", priority: 0.9 },
  { path: "/our-story", changeFrequency: "yearly", priority: 0.5 },
  { path: "/founder", changeFrequency: "yearly", priority: 0.5 },
  { path: "/films", changeFrequency: "monthly", priority: 0.6 },
  { path: "/founding-table", changeFrequency: "monthly", priority: 0.7 },
  { path: "/share", changeFrequency: "monthly", priority: 0.8 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  for (const recipe of featuredRecipes) {
    entries.push({
      url: `${SITE_URL}/family-cookbook/${recipe.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  const { data: communityRecipes } = await supabase
    .from("recipe_submissions")
    .select("id, published_at")
    .eq("is_published", true);

  for (const recipe of communityRecipes ?? []) {
    entries.push({
      url: `${SITE_URL}/family-cookbook/community/${recipe.id}`,
      lastModified: recipe.published_at ? new Date(recipe.published_at) : new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}
