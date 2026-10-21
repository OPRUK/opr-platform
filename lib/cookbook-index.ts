type FeaturedEntry = { title: string; slug: string; category: string };
type CommunityEntry = { id: number; title: string; category: string };

function titleKey(title: string) {
  return title.toLocaleLowerCase("en-GB").replace(/[^a-z0-9]+/g, " ").trim();
}

// Match the public cards: retain original submissions in the inbox but only
// list the finished canonical version of a recipe once.
export function cookbookRecipeEntries(featured: FeaturedEntry[], community: CommunityEntry[]) {
  const titles = new Set(featured.map((recipe) => titleKey(recipe.title)));
  const hasBhindi = featured.some((recipe) => recipe.slug === "sudeshs-bhindi");
  const course: Record<string, number> = {
    Starter: 1, "Starter or side": 1, Main: 2, "Main course": 2,
    Dessert: 3, "Dessert or baking": 3,
  };
  return [
    ...featured.map((recipe) => ({ ...recipe, href: `/family-cookbook/${recipe.slug}` })),
    ...community.filter((recipe) => {
      const key = titleKey(recipe.title);
      return !titles.has(key) && !(hasBhindi && key.includes("sudesh") && key.includes("bhindi"));
    }).map((recipe) => ({ ...recipe, href: `/family-cookbook/community/${recipe.id}` })),
  ].sort((a, b) => (course[a.category] ?? 4) - (course[b.category] ?? 4) || a.title.localeCompare(b.title, "en"));
}
