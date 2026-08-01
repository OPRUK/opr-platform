// Featured recipes from the original OPR collection.
//
// prepTime / cookTime / serves / cuisine / datePublished / contributorName are
// intentionally left undefined where the real value is not known. Per the OPR
// build brief, these must never be guessed to satisfy schema validation —
// wrong structured data is worse than none. See the P0 phase summary for the
// list of values still needed from Chaten.

export type FeaturedRecipe = {
  slug: string;
  title: string;
  place: string;
  story: string;
  ingredients: string[];
  method: string[];
  image: string;
  category: string;
  number: string;
  /** ISO 8601 duration, e.g. "PT20M". Omit if unknown — do not guess. */
  prepTime?: string;
  /** ISO 8601 duration, e.g. "PT2H". Omit if unknown — do not guess. */
  cookTime?: string;
  /** Free-text serving size, e.g. "4 people". Omit if unknown. */
  serves?: string;
  cuisine?: string;
  /** ISO 8601 date, e.g. "2026-01-15". Omit if unknown. */
  datePublished?: string;
  contributorName?: string;
};

export const featuredRecipes: FeaturedRecipe[] = [
  {
    slug: "nans-sunday-rice-pudding",
    title: "Nana Serb's Sunday Rice Pudding",
    place: "Birmingham, England",
    story:
      "Every Sunday after church, Nana Serb put this pudding in the oven before we sat down for lunch. By the time we reached dessert, the house smelled of vanilla and nutmeg. She never measured a thing — she simply knew. One spoonful still takes us straight back to her kitchen.",
    ingredients: [
      "100g pudding rice",
      "850ml whole milk",
      "50g caster sugar",
      "1 vanilla pod, or 1 teaspoon vanilla extract",
      "Freshly grated nutmeg",
      "A small knob of butter",
    ],
    method: [
      "Heat the oven to 150°C fan. Butter a medium ovenproof dish.",
      "Add the rice, sugar and vanilla to the dish. Pour in the milk and stir gently.",
      "Dust generously with nutmeg and dot the surface with butter.",
      "Bake for 1 hour 45 minutes to 2 hours, stirring once after the first 45 minutes, until the rice is tender and the top is golden.",
      "Let it stand for ten minutes before serving. Nana Serb always insisted it was best with a little extra nutmeg on top.",
    ],
    image: "/images/recipes/nana-serbs-rice-pudding.png",
    category: "Dessert",
    number: "01",
  },
  {
    slug: "dads-friday-night-butter-chicken",
    title: "Dave's Butter Chicken",
    place: "New Malden, England",
    story:
      "I learned this from my Indian mother-in-law and tweaked it a little by replacing the tinned tomatoes with passata for a smoother, richer taste. I have cooked it in India for family and received their seal of approval — as well as my mother-in-law declaring that mine is better than hers now!",
    ingredients: [
      "600g chicken breasts, trimmed and diced",
      "3 tablespoons tandoori masala",
      "400g passata",
      "3 finger or rocket chillies",
      "50g butter",
      "1 tablespoon white sugar",
      "1 teaspoon salt",
      "150ml double cream",
      "Olive oil",
      "Chopped fresh coriander, to garnish",
    ],
    method: [
      "Pour the passata into a large, heavy-bottomed pan — ideally cast iron. Add half the butter, diced into cubes, along with the sugar and salt.",
      "Keep the chillies whole, but prick each one several times with the point of a knife so the flavour can escape.",
      "Bring the sauce to the boil, then simmer briskly over a medium heat for 20–25 minutes, using a splash guard rather than a lid. You want the steam to escape and the sauce to reduce, without bubbling or spitting out.",
      "Meanwhile, place the chicken in a bowl with a good glug of olive oil and the tandoori masala, then coat it well.",
      "Shallow-fry the chicken with the remaining butter and a dash of oil over a medium-high heat for about 10 minutes, until it is starting to cook evenly.",
      "Transfer the chicken into the sauce, stir well and leave on a low simmer for 20 minutes. Add a little water if the sauce becomes too thick.",
      "Just before serving, stir in the double cream. Add it to taste: the more cream you use, the milder the spice and the paler the colour.",
      "Garnish with chopped coriander and serve with naan or rice.",
    ],
    image: "/images/recipes/daves-butter-chicken.png",
    category: "Main",
    number: "02",
  },
  {
    slug: "barbaras-beef-casserole",
    title: "Barbara's Beef Casserole",
    place: "Swansea, Wales",
    story:
      "Barbara learnt this recipe from her mother, Pat, and made it her own by adding a tablespoon of Bovril. She always prepared it the day before because, as she put it, good things are worth waiting for. We still make it from her flour-dusted recipe book, and nobody is allowed to skip the extra gravy.",
    ingredients: [
      "750g braising steak, diced",
      "2 onions, sliced",
      "2 carrots, diced",
      "500ml dark ale",
      "300ml beef stock",
      "2 tablespoons plain flour",
      "1 tablespoon Bovril",
    ],
    method: [
      "Brown the beef in batches, then soften the onions and carrots in the same pan.",
      "Stir in the flour, then add the ale, stock and Bovril. Return the beef to the pan.",
      "Simmer gently for two hours until tender. Barbara always prepared it the day before — overnight is even better.",
      "Reheat slowly until the sauce is rich and glossy, then season to taste.",
      "Serve in warmed bowls with creamy mash or crusty bread, and plenty of extra gravy.",
    ],
    image: "/images/recipes/barbaras-beef-casserole.png",
    category: "Main",
    number: "03",
  },
];

export function getFeaturedRecipe(slug: string): FeaturedRecipe | undefined {
  return featuredRecipes.find((recipe) => recipe.slug === slug);
}
