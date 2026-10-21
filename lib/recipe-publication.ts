// First documented website publication, recovered from the recipe's release
// history. Existing contributor/editorial dates take precedence. These are not
// the dates the family first cooked the dish.
export const recipeSeoUpdatedAt = "2026-10-21";

const firstPublished: Record<string, string> = {
  // Original cookbook release: 1d0ba82968812db9b56afeddecc06d169ab7ed1e.
  "nana-serbs-sunday-rice-pudding": "2026-08-01",
  "daves-butter-chicken": "2026-08-01",
  "barbaras-beef-casserole": "2026-08-01",
  "krishna-anands-baingan-ka-bharta": "2026-08-03",
  "sudeshs-bhindi": "2026-08-04",
  "adas-jollof-rice": "2026-08-04",
  "sams-shepherds-pie": "2026-08-05",
  "phils-and-serbs-three-cheese-souffle": "2026-08-05",
  "auntie-marcias-pineapple-jerk-chicken": "2026-08-25",
  "badepapas-pindi-cholley": "2026-08-25",
};

export function featuredRecipePublishedAt(recipe: { slug: string; datePublished?: string }): string | undefined {
  return recipe.datePublished ?? firstPublished[recipe.slug];
}

export function recipeLastModified(publishedAt?: string | null): string {
  return publishedAt && Date.parse(publishedAt) > Date.parse(recipeSeoUpdatedAt)
    ? publishedAt
    : recipeSeoUpdatedAt;
}

export function formatRecipeDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London",
  }).format(new Date(value));
}
