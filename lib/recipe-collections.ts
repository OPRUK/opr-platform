import { featuredRecipes, type FeaturedRecipe } from "./recipes.ts";

type RecipeCollectionDefinition = {
  slug: string;
  title: string;
  eyebrow: string;
  metaTitle: string;
  description: string;
  introduction: string[];
  recipeSlugs: string[];
};

export type RecipeCollection = Omit<RecipeCollectionDefinition, "recipeSlugs"> & {
  recipes: FeaturedRecipe[];
};

const collectionDefinitions: RecipeCollectionDefinition[] = [
  {
    slug: "indian-family-recipes",
    title: "Indian family recipes",
    eyebrow: "Recipes shared across generations",
    metaTitle: "Indian Family Recipes | Real Home Cooking Stories",
    description:
      "Explore real Indian family recipes for butter chicken, bhindi, baingan ka bharta, tandoori aloo nazakat and Pindi chole, each with its family story.",
    introduction: [
      "These Indian family recipes come from the people who cooked them, remembered them and carried them into new kitchens. They are practical home recipes rather than a single fixed idea of Indian food.",
      "From Sudesh’s patient way with okra to Krishna Anand’s smoky aubergine and Badepapa’s Tuesday Pindi chole, every dish keeps the cook and the memory beside the method.",
    ],
    recipeSlugs: [
      "daves-butter-chicken",
      "krishna-anands-baingan-ka-bharta",
      "sudeshs-bhindi",
      "gautam-and-shobhas-tandoori-aloo-nazakat",
      "badepapas-pindi-cholley",
    ],
  },
  {
    slug: "british-family-recipes",
    title: "British family recipes",
    eyebrow: "Comforting recipes from family kitchens",
    metaTitle: "British Family Recipes | Traditional Home Cooking",
    description:
      "Discover traditional British family recipes for baked rice pudding, slow-cooked beef casserole and lamb shepherd’s pie, with the memories behind them.",
    introduction: [
      "The recipes in this collection are the kind that settle into family life: a pudding put into the oven before Sunday lunch, a casserole made a day early and a shepherd’s pie built for a full table.",
      "Each page includes the ingredients, method and practical details, but it also records why the dish mattered and who kept cooking it.",
    ],
    recipeSlugs: [
      "nana-serbs-sunday-rice-pudding",
      "barbaras-beef-casserole",
      "sams-shepherds-pie",
    ],
  },
  {
    slug: "vegetarian-family-recipes",
    title: "Vegetarian family recipes",
    eyebrow: "Generous food without meat or fish",
    metaTitle: "Vegetarian Family Recipes | Real Recipes and Stories",
    description:
      "Browse vegetarian family recipes including bhindi masala, smoky baingan ka bharta, tandoori potatoes, Pindi chole, soufflé and baked rice pudding.",
    introduction: [
      "These vegetarian family recipes put vegetables, pulses, cheese and rice at the centre of the table. Some are everyday favourites and others are dishes for a gathering, but all were shared because somebody wanted them remembered.",
      "Use the individual recipe pages for measurements, step-by-step methods, helpful answers and the story behind each dish.",
    ],
    recipeSlugs: [
      "nana-serbs-sunday-rice-pudding",
      "krishna-anands-baingan-ka-bharta",
      "sudeshs-bhindi",
      "phils-and-serbs-three-cheese-souffle",
      "gautam-and-shobhas-tandoori-aloo-nazakat",
      "badepapas-pindi-cholley",
    ],
  },
  {
    slug: "comfort-food-recipes",
    title: "Family comfort food recipes",
    eyebrow: "The dishes families return to",
    metaTitle: "Family Comfort Food Recipes | The Living Cookbook",
    description:
      "Find comforting family recipes for Jollof rice, butter chicken, beef casserole, shepherd’s pie, cheese soufflé and baked rice pudding, with their stories.",
    introduction: [
      "Comfort food is personal. It can be a spoonful of rice pudding, a rich casserole made the day before, a crisp-topped shepherd’s pie or the butter chicken that won over a family in India.",
      "This collection brings together recipes that people return to for warmth, familiarity, celebration and the pleasure of feeding others.",
    ],
    recipeSlugs: [
      "nana-serbs-sunday-rice-pudding",
      "daves-butter-chicken",
      "barbaras-beef-casserole",
      "adas-jollof-rice",
      "sams-shepherds-pie",
      "phils-and-serbs-three-cheese-souffle",
    ],
  },
  {
    slug: "family-chicken-recipes",
    title: "Family chicken recipes",
    eyebrow: "Two family favourites, two very different kitchens",
    metaTitle: "Family Chicken Recipes | Butter Chicken and Jerk Chicken",
    description:
      "Cook two distinctive family chicken recipes: Dave’s creamy Indian butter chicken and Auntie Marcia’s pineapple-infused Jamaican jerk chicken.",
    introduction: [
      "Dave’s butter chicken and Auntie Marcia’s jerk chicken show how one ingredient can carry completely different family traditions. One is finished with butter and cream; the other is marinated with Scotch bonnet, allspice, lime and pineapple juice.",
      "Both pages give you the complete method, practical cooking notes and the family memory that brought the recipe to OPR.",
    ],
    recipeSlugs: [
      "daves-butter-chicken",
      "auntie-marcias-pineapple-jerk-chicken",
    ],
  },
  {
    slug: "recipes-passed-down-through-generations",
    title: "Recipes passed down through generations",
    eyebrow: "Food remembered, written down and shared",
    metaTitle: "Recipes Passed Down Through Generations | Family Cooking",
    description:
      "Read and cook real family recipes passed between parents, grandparents and children, preserved with the memories and people behind each dish.",
    introduction: [
      "A passed-down recipe is more than a list of ingredients. Sometimes it is written in a flour-dusted book; sometimes it is taught by watching; sometimes it survives because one person finally decides to write it down.",
      "These are recipes with a clear family thread. OPR preserves the method alongside the voice, place and memory that make each one worth carrying forward.",
    ],
    recipeSlugs: [
      "nana-serbs-sunday-rice-pudding",
      "daves-butter-chicken",
      "barbaras-beef-casserole",
      "krishna-anands-baingan-ka-bharta",
      "gautam-and-shobhas-tandoori-aloo-nazakat",
      "badepapas-pindi-cholley",
    ],
  },
];

const recipesBySlug = new Map(
  featuredRecipes.map((recipe) => [recipe.slug, recipe] as const),
);

function resolveCollection(definition: RecipeCollectionDefinition): RecipeCollection {
  const recipes = definition.recipeSlugs.map((slug) => {
    const recipe = recipesBySlug.get(slug);
    if (!recipe) throw new Error(`Unknown recipe slug in collection ${definition.slug}: ${slug}`);
    return recipe;
  });

  return {
    slug: definition.slug,
    title: definition.title,
    eyebrow: definition.eyebrow,
    metaTitle: definition.metaTitle,
    description: definition.description,
    introduction: definition.introduction,
    recipes,
  };
}

export const recipeCollections = collectionDefinitions.map(resolveCollection);

export function getRecipeCollection(slug: string): RecipeCollection | undefined {
  return recipeCollections.find((collection) => collection.slug === slug);
}

export function getRecipeCollectionsForRecipe(recipeSlug: string): RecipeCollection[] {
  return recipeCollections.filter((collection) =>
    collection.recipes.some((recipe) => recipe.slug === recipeSlug),
  );
}
