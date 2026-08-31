type CommunityRecipeEditorialFields = {
  name: string;
  story: string;
  ingredients: string | null;
  method: string | null;
  cook_notes: string | null;
};

// The database keeps the contributor's original submission intact. These
// published editorial corrections are keyed to the approved community recipe
// so transcription fixes remain reviewable in Git alongside the page assets.
const communityRecipeEditorialOverrides: Record<
  number,
  Partial<CommunityRecipeEditorialFields>
> = {
  47: {
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
