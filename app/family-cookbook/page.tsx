import type { Metadata } from "next";
import Link from "next/link";
import Navigation from "../components/Navigation";
import VideoBrandMark from "../components/VideoBrandMark";
import PublishedRecipes from "./PublishedRecipes";
import { featuredRecipes } from "../../lib/recipes";
import { absoluteUrl } from "../../lib/site";


export const metadata: Metadata = {
  title: "The Family Cookbook",
  description:
    "Real recipes from real family kitchens, each one saved with the memory that made it matter.",
  alternates: { canonical: "/family-cookbook" },
  openGraph: {
    title: "The Family Cookbook | Other People's Recipes",
    description:
      "Real recipes from real family kitchens, each one saved with the memory that made it matter.",
    url: "/family-cookbook",
    siteName: "Other People's Recipes",
    locale: "en_GB",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Other People's Recipes — Every Recipe has a Story." }],
  },
};


const categoryOrder: Record<string, number> = {
  Starter: 1,
  "Starter or side": 1,
  Main: 2,
  "Main course": 2,
  Dessert: 3,
  "Dessert or baking": 3,
};


// Keep this list in the same order visitors see on the cookbook page. Google
// can use an ItemList on a recipe collection page to understand the recipes
// that belong together and their canonical destinations.
const recipes = [...featuredRecipes].sort((firstRecipe, secondRecipe) => {
  const courseDifference =
    (categoryOrder[firstRecipe.category] ?? 4) - (categoryOrder[secondRecipe.category] ?? 4);


  return courseDifference || firstRecipe.title.localeCompare(secondRecipe.title, "en");
});


const cookbookJsonLd = {
  "@context": "https://schema.org",
