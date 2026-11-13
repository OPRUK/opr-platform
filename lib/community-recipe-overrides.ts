type CommunityRecipeEditorialFields = {
  title: string;
  name: string;
  category: string;
  story: string;
  ingredients: string | null;
  method: string | null;
  cook_notes: string | null;
  servings: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
};

// The database keeps the contributor's original submission intact. These
// published editorial corrections are keyed to the approved community recipe
// so transcription fixes remain reviewable in Git alongside the page assets.
const communityRecipeEditorialOverrides: Record<
  number,
  Partial<CommunityRecipeEditorialFields>
> = {
  48: {
    title: "Baked Falafel with Parsley, Cumin and Tahini Sauce",
    story: "This falafel became our Friday-night dinner at home. We set the tray in the middle of the table with warm pita, the tahini sauce and a chopped salad, and everyone builds their own plate. Baking instead of frying means I can make it on a busy weeknight without the mess, and it’s the recipe friends ask me for most.",
    // Definitive correction supplied by Vagner Carvalho on 13 November 2026.
    ingredients: [
      "200 g dried chickpeas (1 cup), not canned",
      "1/2 small onion, roughly chopped",
      "3 garlic cloves",
      "1 cup loosely packed parsley leaves",
      "1/2 cup loosely packed coriander (cilantro) leaves",
      "1 tsp ground cumin",
      "1 tsp ground coriander",
      "1/2 tsp kosher salt",
      "1/4 tsp black pepper",
      "2 tbsp plain (all-purpose) flour",
      "1/2 tsp baking powder",
      "3 tbsp olive oil, divided",
      "60 g tahini (1/4 cup)",
      "2 tbsp lemon juice",
      "3–5 tbsp cold water"
].join("\n"),
    method: [
      "Cover the dried chickpeas with several inches of cold water and refrigerate for 12–18 hours. Drain and dry thoroughly (about 420–440 g). Do not cook them before grinding.",
      "Pulse the chickpeas, onion, garlic, herbs, spices and salt in a food processor until finely minced and able to clump, scraping the bowl. Don’t turn it into smooth hummus. Stir in the flour, baking powder and 1 tbsp oil, then refrigerate for 30 minutes.",
      "Heat the oven to 200°C (400°F). Brush a rimmed pan with 1 tbsp oil. Shape 16 compact patties, about 35 g each, 5 cm across and 1 cm thick, and brush the tops with the remaining oil. Bake for 25–30 minutes, turning carefully halfway, until browned and cooked through.",
      "Whisk the tahini and lemon juice, then add cold water gradually until smooth and pourable. Serve the falafel with the sauce."
].join("\n"),
    servings: "4 people (16 patties)",
    prep_time_minutes: null,
    cook_time_minutes: null,
    cook_notes: "Use dried chickpeas, not canned: canned chickpeas make this mixture too soft. Allow 12–18 hours for refrigerated soaking and 30 minutes for chilling the mixture, then bake for 25–30 minutes. The soaked, drained chickpeas weigh about 420–440 g. Makes 16 patties, each about 35 g, 5 cm across and 1 cm thick. Serve with warm pita, tahini sauce and chopped salad.",
  },
  45: {
    title: "Pat’s Haddock and Tomato Bake",
    story:
      "This was a regular favourite in our house when I was growing up. My mum, Pat, hated cooking, but everything she made was delicious and made with love.",
    ingredients: [
      "4 undyed smoked haddock fillets",
      "1 small pack tiger prawns",
      "2–3 large beef tomatoes",
      "1 large white onion",
      "1–2 cloves garlic",
      "Butter, for cooking",
      "100 ml milk",
      "100 ml double cream",
      "Salt and freshly ground black pepper",
      "Cooked rice and green vegetables, to serve",
    ].join("\n"),
    method: [
      "Thinly slice the onion.",
      "Skin the tomatoes, then roughly chop them.",
      "Remove the skin from the haddock and break the fillets into pieces.",
      "Melt a little butter in a frying pan, then gently sweat the onion and garlic until softened.",
      "Add the tomatoes, season well and cook for 10 minutes.",
      "Arrange the raw haddock in a shallow baking dish and scatter the prawns over it, then spoon the tomato and onion sauce on top.",
      "Mix the cream and milk in a jug and pour over the dish. Finish with plenty of freshly ground black pepper and a little salt.",
      "Bake at 190°C for 20–25 minutes, until bubbling and the fish is cooked through.",
      "Serve with rice and green vegetables.",
    ].join("\n"),
    cook_notes:
      "You can use a mix of cod and haddock, or smoked and unsmoked haddock, but smoked haddock gives the dish the most flavour.",
  },
  47: {
    category: "Condiment",
    name: "Georgina Hovanessian",
    story:
      "I scribbled this recipe down from a falling-apart book of recipes belonging to my mum. She had scribbled it down from her mum. It's quite an imprecise recipe, which suits our style of cooking just fine. It always turns out differently, and it is always delicious. You can be certain that in the kitchen cupboard of every family member there is an open jar of Mum's chutney and at least one in reserve. It is a staple for us. Of course, we all eat it with cheesy snacks, sides and meals, but also with sausage suppers. I've been cooking my own batches since moving to a place with two loaded apple and pear trees in the back garden. We can't possibly eat all the sour apples, and the pears fall off and smash before they are ripe, so chutney-making in autumn is a satisfying activity that keeps on giving for the rest of the year as we crack open jars months later.",
    ingredients: [
      "4 lb windfall apples or pears",
      "1 lb onions",
      "1 lb sultanas",
      "1 lb soft brown sugar",
      "1 pint vinegar",
      "1 tsp salt",
      "1 tsp ground ginger",
      "½ tsp black pepper",
      "1 clove garlic",
    ].join("\n"),
    method: [
      "Peel and core the fruit, then chop it roughly.",
      "Peel and chop the onions and garlic.",
      "Cook the fruit, onions, garlic and sultanas in the vinegar until the fruit and onions are tender.",
      "Add the sugar, ginger, salt and black pepper.",
      "Bring gently to the boil and cook until the chutney is thick and brown.",
      "Spoon into prepared jars while still hot, leaving the headspace recommended by the jar manufacturer, then seal as directed.",
    ].join("\n"),
    cook_notes:
      "Save suitable jars throughout the year and discard any that are chipped or cracked. Wash and sterilise the jars, then follow the jar manufacturer's instructions for filling, headspace and sealing. Pot the chutney while it and the jars are still hot, taking care to protect your hands. Label the cooled jars for later in the year. The flavour will settle and mellow after a few months.",
  },
};

export function applyCommunityRecipeEditorialOverride<T extends { id: number }>(
  recipe: T,
): T {
  const override = communityRecipeEditorialOverrides[recipe.id];
  if (!override) return recipe;

  const edited: Record<string, unknown> = { ...recipe };
  for (const [key, value] of Object.entries(override)) {
    if (key in edited) edited[key] = value;
  }

  return edited as T;
}

export const communityRecipeSourceLinks: Record<number, { label: string; url: string }> = {
  48: { label: "Vagner Carvalho (SkilletGlow)", url: "https://skilletglow.com/baked-falafel/" },
};
