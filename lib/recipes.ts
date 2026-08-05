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
    image: "/images/recipes/nana-serbs-rice-pudding-wide.webp",
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
    image: "/images/recipes/daves-butter-chicken-wide.webp",
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
    image: "/images/recipes/barbaras-beef-casserole-wide.webp",
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
    slug: "krishna-anands-baingan-ka-bharta",
    title: "Krishna Anand's Baingan ka Bharta",
    place: "From the family kitchen",
    story:
      "Once kept in a kitchen drawer, Krishna Anand's baingan ka bharta has been carefully translated so everyone can make it their own. Krishna was the late grandmother of OPR founder Chaten, and this smoky aubergine dish — with softly pink onions, tomatoes and fresh green chillies — carries her family story to every new table.",
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
    image: "/images/recipes/krishna-vantis-baingan-ka-bharta-wide.webp",
    category: "Main",
    number: "04",
    notes: [
      {
        title: "Degi mirch",
        text: "Degi mirch is a mild Kashmiri red chilli powder, used for its rich red colour as much as its gentle warmth. If you cannot find it, use mild paprika with a small pinch of cayenne to bring back a little heat.",
      },
      {
        title: "Keep the onions pink",
        text: "This is the key instruction from Krishna Anand's recipe. Let the onions soften, but do not allow them to brown — it keeps the finished bharta sweet, fresh and light.",
      },
    ],
  },
  {
    slug: "sudeshs-bhindi",
    title: "Sudesh's Bhindi",
    place: "From the OPR collection",
    story:
      "A simple bhindi masala built from the everyday flavours of onion, tomatoes, ginger and warming Indian spices. The okra is cooked first, gently and patiently, until its sliminess almost disappears, then folded through the masala. Sudesh loves it with warm roti and dal, though it is just as good with paratha or rice.",
    ingredients: [
      "Bhindi (okra), washed, dried and sliced into rounds",
      "2½ tablespoons oil, divided",
      "Cumin seeds",
      "1 onion, chopped",
      "Fresh ginger, chopped, plus ginger juliennes to garnish (optional)",
      "1 green chilli, chopped",
      "Tomatoes, chopped",
      "Coriander powder",
      "Turmeric",
      "Amchur (dried mango powder)",
      "Red chilli powder",
      "Salt",
      "Garam masala",
    ],
    method: [
      "Wash and thoroughly pat dry each bhindi with kitchen paper. Remove the head and a little from the tail, then chop into rounds.",
      "Heat 1 tablespoon of oil in a pan over a medium heat. Add the bhindi and cook for 10 minutes, stirring often. Lower the heat and cook for another 5 minutes, until it is mostly cooked and very little sliminess remains. Transfer it to a bowl.",
      "In another pan — or the same pan once emptied — heat the remaining 1½ tablespoons of oil over a medium heat. Add the cumin seeds and let them sizzle for a few seconds.",
      "Add the chopped onion and sauté for 2–3 minutes until soft. Add the ginger and green chilli, then cook for one more minute.",
      "Add the chopped tomatoes and cook for around 4 minutes, until soft and mushy.",
      "Stir in the coriander powder, turmeric, amchur, red chilli powder and salt. Add a tablespoon of water so the spices do not burn, then stir well.",
      "Add the cooked bhindi, mix well and cook uncovered over a low-medium heat for 5 minutes.",
      "Finish with garam masala and, if you like, ginger juliennes. Serve with warm roti and dal, paratha or rice.",
    ],
    image: "/images/recipes/sudeshs-bhindi-wide.webp",
    category: "Main",
    number: "05",
    contributorName: "Sudesh",
    notes: [
      {
        title: "How to make bhindi less slimy",
        text: "Bhindi releases mucilage, which is what makes it sticky. Wash it first, then dry it completely before chopping. Spread the okra in a single layer on kitchen paper, let it dry for a while, and pat each piece dry. If you can plan ahead, wash it and leave it to air-dry overnight — it will be ready to use in the morning.",
      },
      {
        title: "Cook it gently",
        text: "Frying the okra in a little oil before it joins the masala helps the sliminess disappear. Give it around 15 minutes over a medium-low heat and avoid a high flame: bhindi can brown before the stickiness has had time to cook away.",
      },
    ],
  },
  {
    slug: "adas-jollof-rice",
    title: "Ada's Jollof Rice",
    place: "Nigeria",
    story:
      "Ada's Jollof Rice celebrates the unmistakable smoky flavour of Nigerian party Jollof: a deeply reduced pepper base, rich stock and a final moment of heat that creates that treasured, lightly scorched bottom layer. It is the kind of dish made for a full table, shared plates and second helpings.",
    ingredients: [
      "3 red bell peppers (tatashe)",
      "1 can plum tomatoes, or 4 fresh Roma tomatoes",
      "2 Scotch bonnet peppers (ata rodo), adjusted to taste",
      "1 medium red onion",
      "3 garlic cloves",
      "1 thumb-sized piece fresh ginger",
      "3 cups long-grain parboiled rice or Golden Sella basmati, thoroughly washed",
      "⅓ cup vegetable oil",
      "1 large onion, sliced",
      "3 tablespoons tomato paste",
      "2 cups rich chicken or beef stock",
      "1 tablespoon curry powder",
      "1 tablespoon dried thyme",
      "2 bay leaves",
      "1 teaspoon ground turmeric",
      "White pepper, to taste",
      "2 seasoning cubes (Knorr or Maggi)",
      "1 tablespoon butter",
      "Salt, to taste",
    ],
    method: [
      "Blend the red peppers, tomatoes, Scotch bonnets, medium red onion, garlic and ginger with as little water as possible until smooth. Pour into a saucepan and boil over a medium-high heat for 10–12 minutes, until reduced by about half and the excess water has evaporated.",
      "Heat the vegetable oil in a heavy-bottomed pot over a medium heat. Fry the sliced onion for 3–4 minutes. Add the tomato paste and fry for 5–7 minutes, stirring constantly, until it is dark red and no longer tastes sour.",
      "Pour in the reduced pepper blend with the curry powder, thyme, turmeric, crushed seasoning cubes and bay leaves. Cook for 10–15 minutes, until the oil separates to the top.",
      "Pour in the rich stock and season with salt and white pepper. The liquid should taste slightly over-seasoned, because the rice will absorb a great deal of flavour. Bring it to a gentle simmer.",
      "Rinse the rice repeatedly in warm water until the water runs clear. Stir it into the sauce, making sure the liquid only just covers the rice; add only a small splash of hot water if needed.",
      "Cover the pot tightly with aluminium foil, then secure the lid to trap the steam. Cook on low for 25 minutes.",
      "Uncover, add the butter and extra sliced fresh onion, then cover tightly again. Steam on low for another 10 minutes, until the rice is fluffy.",
      "For the final 3 minutes, turn the heat to medium-high, allowing the bottom layer to scorch very slightly. This creates the signature smoky party Jollof aroma. Fluff gently and serve.",
    ],
    image: "/images/recipes/adas-jollof-rice-wide.webp",
    category: "Main",
    number: "06",
    cuisine: "Nigerian",
    contributorName: "Ada",
    notes: [
      {
        title: "The party Jollof finish",
        text: "The gentle scorched layer at the bottom is where the signature smoky aroma comes from. Keep a close eye on the final three minutes: you want a little char, never a burnt pot.",
      },
      {
        title: "Heat and flavour",
        text: "Scotch bonnet peppers bring the characteristic heat and fruitiness. Use fewer peppers for a milder rice, but keep the rich stock and thoroughly reduced pepper base for the fullest flavour.",
      },
    ],
  },
  {
    slug: "sams-shepherds-pie",
    title: "Sam's Shepherd's Pie",
    place: "From the OPR collection",
    story:
      "Sam's Shepherd's Pie is built slowly from lamb, vegetables and a quietly brilliant savoury trick: white anchovies and Marmite melt into the gravy, leaving only deep, rounded flavour. Beneath its crisp potato topping is the kind of comforting dish made for a table full of people.",
    ingredients: [
      "1 tablespoon olive oil or butter",
      "1 large yellow onion, finely diced",
      "2 large carrots, finely diced",
      "2 celery stalks, finely diced",
      "3 garlic cloves, minced",
      "500g lamb mince",
      "4 white anchovies (boquerones), finely minced or mashed into a paste",
      "1 tablespoon Marmite or Vegemite",
      "2 tablespoons tomato purée",
      "2 tablespoons plain flour",
      "350ml rich beef or lamb stock",
      "1 tablespoon Worcestershire sauce",
      "1 teaspoon dried thyme, or 2 sprigs fresh thyme",
      "1 bay leaf",
      "¾ cup frozen peas",
      "Salt and freshly ground black pepper",
      "1kg Maris Piper or King Edward potatoes, peeled and cubed",
      "4 tablespoons (50g) unsalted butter",
      "60ml whole milk or double cream",
      "½ cup sharp Cheddar, grated (optional)",
    ],
    method: [
      "Place the potatoes in a large pot of cold, salted water. Bring to a boil and cook for 12–15 minutes, until fork-tender. Drain thoroughly, then let them steam in the colander for 2 minutes to remove excess moisture. Return to the pot and mash with the butter, milk or cream, salt and pepper until smooth. Set aside.",
      "Heat the olive oil in a large frying pan or Dutch oven over a medium heat. Add the onion, carrots and celery and cook for 6–8 minutes, until soft and translucent. Add the garlic and cook for 1 minute.",
      "Push the vegetables to the edge of the pan. Add the lamb mince, break it up with a wooden spoon and cook for 5–7 minutes, until browned. Drain excess fat if needed, but keep a little for flavour.",
      "Stir in the white anchovies and Marmite for 1–2 minutes, allowing both to melt into the lamb. Add the tomato purée and flour, then cook for another 2 minutes to remove the raw flour taste.",
      "Gradually pour in the stock, stirring as you go. Add the Worcestershire sauce, thyme and bay leaf. Bring to a simmer, then cook uncovered over a low heat for 15–20 minutes, until glossy and thickened. Remove the bay leaf, stir in the peas and season carefully with salt and pepper.",
      "Heat the oven to 200°C. Transfer the lamb filling to a deep baking dish, then spoon the mashed potato across the top and spread it to the edges. Drag a fork over the surface to make crisp ridges and sprinkle with Cheddar, if using.",
      "Bake for 25–30 minutes, until the filling bubbles at the edges and the potato peaks are golden and crisp. Rest for 10 minutes before serving.",
    ],
    image: "/images/recipes/sams-shepherds-pie-wide.webp",
    category: "Main",
    number: "07",
    cuisine: "British",
    contributorName: "Sam",
    notes: [
      {
        title: "The secret savoury layer",
        text: "The anchovies and Marmite dissolve into the lamb rather than tasting fishy. Together they give the gravy its deep, rounded savouriness. Taste before adding extra salt, as both are naturally salty.",
      },
      {
        title: "Why white anchovies?",
        text: "White anchovies, or boquerones, are milder and fruitier than standard dark, salt-cured anchovies. Finely mince them so they melt seamlessly into the filling.",
      },
    ],
  },
];

export function getFeaturedRecipe(slug: string): FeaturedRecipe | undefined {
  return featuredRecipes.find((recipe) => recipe.slug === slug);
}
