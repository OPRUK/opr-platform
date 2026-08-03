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
  /** Optional practical tips and ingredient alternatives from the contributor. */
  notes?: { title: string; text: string }[];
};

export const featuredRecipes: FeaturedRecipe[] = [
  {
    slug: "nana-serbs-sunday-rice-pudding",
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
    image: "/images/recipes/nana-serbs-rice-pudding-wide.png",
    category: "Dessert",
    number: "01",
    notes: [
      {
        title: "Vanilla",
        text: "A vanilla pod gives the fullest flavour, but vanilla extract works beautifully too. Use one teaspoon of extract in its place.",
      },
      {
        title: "The best bit",
        text: "Do not rush the resting time. Ten minutes lets the pudding settle and gives it that soft, comforting texture Nana Serb loved.",
      },
    ],
  },
  {
    slug: "daves-butter-chicken",
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
      "Keep the chillies whole, but prick each one several times with the point of a knife so the flavour can escape, then add them to the passata.",
      "Bring the sauce to the boil, then simmer briskly over a medium heat for 20–25 minutes, using a splash guard rather than a lid. You want the steam to escape and the sauce to reduce, without bubbling or spitting out.",
      "Meanwhile, place the chicken in a bowl with a good glug of olive oil and the tandoori masala, then coat it well.",
      "Shallow-fry the chicken with the remaining butter and a dash of oil over a medium-high heat for about 10 minutes, until it is starting to cook evenly.",
      "Transfer the chicken into the sauce, stir well and leave on a low simmer for 20 minutes. Add a little water if the sauce becomes too thick.",
      "Just before serving, stir in the double cream. Add it to taste: the more cream you use, the milder the spice and the paler the colour.",
      "Garnish with chopped coriander and serve with naan or rice.",
    ],
    image: "/images/recipes/daves-butter-chicken-wide.png",
    category: "Main",
    number: "02",
    notes: [
      {
        title: "Tandoori masala",
        text: "This is a ready-made Indian spice blend. If you cannot find it, use garam masala with a little mild paprika for warmth and colour — the flavour will be different, but still delicious.",
      },
      {
        title: "About Degi Mirch",
        text: "Degi mirch is a mild Indian red chilli powder, used mainly for its deep red colour. It is not part of Dave’s current recipe, but mild paprika plus a small pinch of cayenne is a good alternative whenever a recipe calls for it.",
      },
      {
        title: "Choose your chilli",
        text: "Finger or rocket chillies bring freshness and heat. For a gentler dish, use fewer chillies or remove them before serving.",
      },
    ],
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
    image: "/images/recipes/barbaras-beef-casserole-wide.png",
    category: "Main",
    number: "03",
    notes: [
      {
        title: "Make it ahead",
        text: "Barbara’s advice was to prepare it the day before. The flavour deepens overnight, then it only needs warming gently before serving.",
      },
      {
        title: "No ale?",
        text: "Use extra beef stock instead. You will lose some of the malty depth, but the Bovril will still give the casserole a rich savoury finish.",
      },
    ],
  },
  {
    slug: "krishna-vantis-baingan-ka-bharta",
    title: "Krishna Vanti's Baingan Ka Bharta",
    place: "From the family kitchen",
    story:
      "Once kept in a kitchen drawer, Krishna Vanti's baingan ka bharta has been carefully translated so everyone can make it their own. Smoky roasted aubergine, softly pink onions, tomatoes and fresh green chillies make a dish that carries a family story to every new table.",
    ingredients: [
      "1 large aubergine (eggplant)",
      "Oil or ghee",
      "Chopped onions",
      "4–5 tomatoes, chopped",
      "Salt",
      "Degi mirch (Kashmiri red chilli powder)",
      "2 green chillies, slit lengthways",
    ],
    method: [
      "Roast the whole aubergine directly over an open gas flame, or in the oven, until the skin is completely charred and blackened and the inside is soft and collapsed.",
      "Let it cool slightly, then peel away the charred skin and coarsely mash the soft flesh with a fork.",
      "Heat oil or ghee in a pan over a medium heat. Add the chopped onions and cook only until soft and pink — do not let them turn brown.",
      "Stir in the tomatoes, salt and degi mirch. Cook until the tomatoes break down completely and become part of the onions.",
      "Add the two slit green chillies to the bubbling tomato-onion base so their fresh heat can infuse the masala.",
      "Fold in the mashed roasted aubergine and stir thoroughly to coat it in the masala.",
      "Lower the heat and simmer gently for 5–7 minutes, allowing the smoky aubergine to absorb the spices. Serve warm and make it your own.",
    ],
    image: "/images/recipes/krishna-vantis-baingan-ka-bharta-wide.png",
    category: "Main",
    number: "04",
    notes: [
      {
        title: "Degi mirch",
        text: "Degi mirch is a mild Kashmiri red chilli powder, used for its rich red colour as much as its gentle warmth. If you cannot find it, use mild paprika with a small pinch of cayenne to bring back a little heat.",
      },
      {
        title: "Keep the onions pink",
        text: "This is the key instruction from Krishna Vanti's recipe. Let the onions soften, but do not allow them to brown — it keeps the finished bharta sweet, fresh and light.",
      },
    ],
  },
];

export function getFeaturedRecipe(slug: string): FeaturedRecipe | undefined {
  return featuredRecipes.find((recipe) => recipe.slug === slug);
}
