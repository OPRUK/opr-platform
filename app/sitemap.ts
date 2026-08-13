import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { featuredRecipes } from "../lib/recipes";
import { SITE_URL } from "../lib/site";


const staticRoutes: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/family-cookbook", changeFrequency: "weekly", priority: 0.9 },
  { path: "/our-story", changeFrequency: "yearly", priority: 0.5 },
  { path: "/founder", changeFrequency: "yearly", priority: 0.5 },
  { path: "/films", changeFrequency: "monthly", priority: 0.6 },
  { path: "/founding-table", changeFrequency: "monthly", priority: 0.7 },
  { path: "/share", changeFrequency: "monthly", priority: 0.8 },
];


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: siteLaunchDate,
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


  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
