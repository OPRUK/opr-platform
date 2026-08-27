import type { RecipeFaq } from "./recipe-faqs";

// Featured recipes from the original OPR collection.
//
// serves / datePublished are intentionally left undefined where the real
// value is not known. Per the OPR build brief, these must never be guessed
// to satisfy schema validation — wrong structured data is worse than none.
// cookTime values were computed by summing each recipe's own stated step
// durations (not sourced from unrelated recipes online); cuisine was set
// from the dish's unambiguous origin. Krishna's bharta cookTime (30 min)
// and every recipe's prepTime were confirmed directly by Chaten.

export type RecipeMethodPhoto = {
  src: string;
  alt: string;
  title: string;
  caption: string;
  step: number;
};

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
  /** Optional consented portrait of the contributor or family behind the recipe. */
  contributorImage?: string;
  contributorImageAlt?: string;
  /** Optional practical tips and ingredient alternatives from the contributor. */
  notes?: { title: string; text: string }[];
  /** Answers derived only from the recipe's own method and contributor notes. */
  faqs: RecipeFaq[];
  /** Illustrative photography used to explain key method stages. */
  methodPhotos?: RecipeMethodPhoto[];
  /** Canonical recipe slugs used for contextual internal links. */
  relatedRecipeSlugs?: string[];
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
    prepTime: "PT15M",
    cookTime: "PT1H50M",
    cuisine: "British",
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
    faqs: [
      {
        question: "Which rice should you use for baked rice pudding?",
        answer:
          "Nana Serb's recipe uses pudding rice. Its short grains soften during the long, gentle bake and give the pudding its comforting texture.",
      },
      {
        question: "How do you know when the rice pudding is ready?",
        answer:
          "After 1 hour 45 minutes to 2 hours, the rice should be tender beneath a golden nutmeg skin. Stir it once after the first 45 minutes so it cooks evenly.",
      },
      {
        question: "Can you use vanilla extract instead of a vanilla pod?",
        answer:
          "Yes. Replace the vanilla pod with one teaspoon of vanilla extract, as listed in Nana Serb's recipe.",
      },
      {
        question: "Why should rice pudding rest before serving?",
        answer:
          "Let it stand for ten minutes after baking. The resting time allows the pudding to settle and develop the soft texture Nana Serb loved.",
      },
    ],
    methodPhotos: [
      {
        src: "/images/recipes/nana-serbs-rice-pudding-step-2-ai.webp",
        alt: "Pudding rice, milk, sugar and vanilla stirred together in a buttered cream baking dish",
        title: "Stir the pudding together",
        caption: "The rice, sugar and vanilla should sit in a loose pool of milk before the dish goes anywhere near the oven.",
        step: 2,
      },
      {
        src: "/images/recipes/nana-serbs-rice-pudding-step-3-ai.webp",
        alt: "The uncooked rice pudding mixture dusted with nutmeg and dotted with small pieces of butter",
        title: "Add nutmeg and butter",
        caption: "Dust the whole surface with freshly grated nutmeg, then dot over small pieces of butter for a richly flavoured top.",
        step: 3,
      },
      {
        src: "/images/recipes/nana-serbs-rice-pudding-step-4-ai.webp",
        alt: "Baked rice pudding with a golden wrinkled nutmeg skin in a cream ceramic dish",
        title: "Look for the golden skin",
        caption: "The rice is ready when it is tender beneath a golden nutmeg skin. Let it stand before serving so the pudding can settle.",
        step: 4,
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
    contributorName: "Dave & Rubble",
    contributorImage: "/images/recipes/dave-and-rubble-portrait.webp",
    contributorImageAlt: "Dave holding Rubble, his small curly-haired dog",
    category: "Main",
    number: "02",
    prepTime: "PT40M",
    cookTime: "PT43M",
    cuisine: "Indian",
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
    faqs: [
      {
        question: "Why does Dave use passata in Butter Chicken?",
        answer:
          "Dave replaces tinned tomatoes with passata because it gives the sauce a smoother, richer texture.",
      },
      {
        question: "How do you make the Butter Chicken sauce thicker?",
        answer:
          "Simmer the passata briskly for 20–25 minutes without a lid so the steam can escape. Use a splash guard to control the splashes without trapping moisture.",
      },
      {
        question: "How can you make this Butter Chicken milder?",
        answer:
          "Use fewer whole chillies or remove them before serving, then add the cream to taste. More cream makes the sauce milder and paler.",
      },
      {
        question: "What can replace tandoori masala?",
        answer:
          "The cook's notes suggest garam masala with a little mild paprika. It will taste different, but it keeps the warmth and colour of the dish.",
      },
    ],
    methodPhotos: [
      {
        src: "/images/recipes/daves-butter-chicken-step-3-ai.webp",
        alt: "Smooth passata reducing in a dark pan with whole green chillies and melting butter",
        title: "Reduce the sauce uncovered",
        caption: "Let the passata simmer briskly without a lid so steam can escape. It should become noticeably thicker and deeper in colour.",
        step: 3,
      },
      {
        src: "/images/recipes/daves-butter-chicken-step-5-ai.webp",
        alt: "Tandoori-coated chicken pieces shallow-frying in a single layer",
        title: "Cook the chicken separately",
        caption: "Give the coated chicken space in the pan. Shallow-fry it until the pieces are cooking evenly before adding them to the sauce.",
        step: 5,
      },
      {
        src: "/images/recipes/daves-butter-chicken-step-7-ai.webp",
        alt: "Double cream swirling through a deep red Butter Chicken sauce",
        title: "Finish with cream",
        caption: "Stir the cream through just before serving. Pale ribbons show the moment the sauce turns silkier and the chilli heat begins to soften.",
        step: 7,
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
    prepTime: "PT33M",
    cookTime: "PT2H",
    cuisine: "British",
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
    faqs: [
      {
        question: "Can you make beef casserole the day before?",
        answer:
          "Yes. Barbara always prepared it the day before because the flavour deepens overnight. Reheat it slowly the next day until the sauce is rich and glossy.",
      },
      {
        question: "What can you use instead of dark ale?",
        answer:
          "Use extra beef stock in place of the ale. The casserole will lose some malty depth, but the Bovril will still give the gravy a rich savoury finish.",
      },
      {
        question: "Why should the beef be browned in batches?",
        answer:
          "Leaving space around the diced braising steak helps it develop a brown crust instead of steaming, creating the first layer of flavour in the casserole.",
      },
      {
        question: "How do you know when the casserole is ready?",
        answer:
          "After about two hours at a gentle simmer, the beef should be tender. When reheated, the finished gravy should look glossy and cling to the meat.",
      },
    ],
    methodPhotos: [
      {
        src: "/images/recipes/barbaras-beef-casserole-step-1-ai.webp",
        alt: "Diced braising steak browning in an uncrowded heavy casserole pan",
        title: "Brown in batches",
        caption: "Keep space around the beef so it sears instead of steaming. The browned crust is the first layer of flavour in the casserole.",
        step: 1,
      },
      {
        src: "/images/recipes/barbaras-beef-casserole-step-3-ai.webp",
        alt: "Beef, carrots and onions simmering gently in a dark ale gravy",
        title: "Keep the simmer gentle",
        caption: "Small, steady bubbles are enough. Two hours at a gentle simmer tenderises the beef without reducing the gravy too quickly.",
        step: 3,
      },
      {
        src: "/images/recipes/barbaras-beef-casserole-step-4-ai.webp",
        alt: "Tender beef in a thick glossy dark gravy with a wooden spoon drawn through it",
        title: "Reheat until glossy",
        caption: "After its overnight rest, warm the casserole slowly. The finished gravy should cling to the beef and briefly hold a trail from the spoon.",
        step: 4,
      },
    ],
  },
  {
    slug: "krishna-anands-baingan-ka-bharta",
    title: "Krishna Anand's Baingan ka Bharta",
    place: "New Delhi, India",
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
    prepTime: "PT45M",
    cookTime: "PT30M",
    cuisine: "Indian",
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
    faqs: [
      {
        question: "How do you give baingan ka bharta its smoky flavour?",
        answer:
          "Roast the whole aubergine until its skin is completely blackened and the inside is soft and collapsed. The charred skin creates the smoke that flavours the mashed flesh.",
      },
      {
        question: "Can you roast the aubergine in the oven?",
        answer:
          "Yes. Krishna Anand's method allows the aubergine to be roasted over an open gas flame or in the oven. In either case, cook it until the skin is charred and the centre has collapsed.",
      },
      {
        question: "Why should the onions stay pink?",
        answer:
          "Cook the onions only until they are soft and pink, without browning them. This keeps the finished bharta sweet, fresh and light.",
      },
      {
        question: "What can replace degi mirch?",
        answer:
          "Use mild paprika with a small pinch of cayenne. The paprika brings colour and the cayenne replaces a little of degi mirch's gentle heat.",
      },
    ],
    methodPhotos: [
      {
        src: "/images/recipes/krishna-anands-baingan-ka-bharta-step-1-ai.webp",
        alt: "A whole aubergine with blackened blistered skin roasting over a gas flame",
        title: "Char the aubergine fully",
        caption: "Roast until the skin is blackened all over and the aubergine has softened and collapsed. That deep char gives the bharta its smoke.",
        step: 1,
      },
      {
        src: "/images/recipes/krishna-anands-baingan-ka-bharta-step-5-ai.webp",
        alt: "Soft pale onions and broken-down tomatoes bubbling with two slit green chillies",
        title: "Build the tomato base",
        caption: "The onions should stay soft and pale while the tomatoes break down around them. Add the slit chillies once the masala is bubbling.",
        step: 5,
      },
      {
        src: "/images/recipes/krishna-anands-baingan-ka-bharta-step-6-ai.webp",
        alt: "Soft fibrous roasted aubergine folded through onion and tomato masala with green chillies",
        title: "Fold in the smoky aubergine",
        caption: "Keep the aubergine coarsely mashed and stir until its soft, fibrous flesh is coated throughout with the tomato-onion masala.",
        step: 6,
      },
    ],
  },
  {
    slug: "sudeshs-bhindi",
    title: "Sudesh's Bhindi",
    place: "Maidenhead, England",
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
      "Wash each bhindi and pat it thoroughly dry with kitchen paper. Remove the head and a little from the tail, then chop into rounds.",
      "Heat 1 tablespoon of oil in a pan over a medium heat. Add the bhindi and cook for 10 minutes, stirring often. Lower the heat and cook for another 5 minutes, until it is mostly cooked and very little sliminess remains. Transfer it to a bowl.",
      "In another pan — or the same pan once emptied — heat the remaining 1½ tablespoons of oil over a medium heat. Add the cumin seeds and let them sizzle for a few seconds.",
      "Add the chopped onion and sauté for 2–3 minutes until soft. Add the ginger and green chilli, then cook for one more minute.",
      "Add the chopped tomatoes and cook for around 4 minutes, until soft and mushy.",
      "Stir in the coriander powder, turmeric, amchur, red chilli powder and salt. Add a tablespoon of water so the spices do not burn, then stir well.",
      "Add the cooked bhindi, mix well and cook uncovered over a medium-low heat for 5 minutes.",
      "Finish with garam masala and, if you like, ginger juliennes. Serve with warm roti and dal, paratha or rice.",
    ],
    image: "/images/recipes/sudeshs-bhindi-wide.webp",
    category: "Main",
    number: "05",
    prepTime: "PT28M",
    cookTime: "PT28M",
    cuisine: "Indian",
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
    faqs: [
      {
        question: "How do you stop bhindi becoming slimy?",
        answer: "Wash the whole okra before cutting it, dry it completely, then cook it uncovered in a little oil before adding it to the masala. Sudesh's method gives it about 15 minutes over a medium to medium-low heat so the stickiness has time to cook away.",
      },
      {
        question: "Should bhindi be washed before cutting?",
        answer: "Yes. Wash each whole bhindi first, pat it thoroughly dry and only then remove the ends and slice it. Cutting wet okra encourages more stickiness.",
      },
      {
        question: "How long does bhindi take to cook?",
        answer: "In this recipe, the okra cooks on its own for about 15 minutes, then for another 5 minutes with the masala. Keep the heat moderate so it softens without browning too quickly.",
      },
      {
        question: "What can you serve with bhindi?",
        answer: "Sudesh serves this bhindi with warm roti and dal. It also works well with paratha or rice.",
      },
    ],
    methodPhotos: [
      {
        src: "/images/recipes/sudeshs-bhindi-step-1-ai.webp",
        alt: "Whole dry okra and sliced okra rounds resting on a clean linen cloth",
        title: "Dry before slicing",
        caption: "Wash the okra whole, then dry it completely before cutting. This is the most important preparation step for limiting stickiness.",
        step: 1,
      },
      {
        src: "/images/recipes/sudeshs-bhindi-step-2-ai.webp",
        alt: "Sliced okra rounds gently frying uncovered in a dark pan",
        title: "Cook the okra on its own",
        caption: "Give the sliced okra room to cook uncovered in a little oil. Moderate heat lets the stickiness disappear without burning it.",
        step: 2,
      },
      {
        src: "/images/recipes/sudeshs-bhindi-step-3-ai.webp",
        alt: "Green okra being folded through a cooked onion and tomato masala",
        title: "Fold through the masala",
        caption: "Add the pre-cooked okra only after the onions, tomatoes and spices have softened into a rich masala.",
        step: 7,
      },
    ],
    relatedRecipeSlugs: ["krishna-anands-baingan-ka-bharta", "daves-butter-chicken"],
  },
  {
    slug: "adas-jollof-rice",
    title: "Ada's Jollof Rice",
    place: "Lagos, Nigeria",
    story:
      "Ada's Jollof Rice celebrates the unmistakable smoky flavour of Nigerian party Jollof: a deeply reduced pepper base, rich stock and a final moment of heat that creates that treasured, lightly scorched bottom layer. It is the kind of dish made for a full table, shared plates and second helpings.",
    ingredients: [
      "3 red bell peppers (tatashe)",
      "1 can of plum tomatoes, or 4 fresh Roma tomatoes",
      "2 Scotch bonnet peppers (ata rodo), adjusted to taste",
      "1 medium red onion",
      "3 garlic cloves",
      "1 thumb-sized piece of fresh ginger",
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
    prepTime: "PT35M",
    cookTime: "PT1H11M",
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
    faqs: [
      {
        question: "How do you give Jollof rice a smoky party flavour?",
        answer: "Reduce the pepper blend well, steam the rice in a tightly covered heavy pot and raise the heat briefly for the final three minutes. This creates a lightly scorched bottom layer and the characteristic smoky aroma without burning the rice.",
      },
      {
        question: "Which rice does Ada use for Jollof rice?",
        answer: "Ada's recipe uses long-grain parboiled rice or Golden Sella basmati. Wash it thoroughly until the water runs clear before stirring it into the sauce.",
      },
      {
        question: "How spicy is this Jollof rice?",
        answer: "The recipe uses two Scotch bonnet peppers, but the amount can be adjusted to taste. Using fewer peppers makes it milder while keeping the rich stock and reduced pepper base for flavour.",
      },
      {
        question: "Why should the pepper mixture be reduced first?",
        answer: "Boiling the blended peppers, tomatoes, onion, garlic and ginger removes excess water and concentrates their flavour before the rice and stock are added.",
      },
      {
        question: "How do you create the scorched bottom without burning the rice?",
        answer: "Keep the pot tightly covered while the rice steams, then use medium-high heat only for the final three minutes and watch it closely. The bottom should be lightly scorched, not burnt.",
      },
    ],
    methodPhotos: [
      {
        src: "/images/recipes/adas-jollof-step-1-ai.webp",
        alt: "A smooth red pepper and tomato blend reducing in a saucepan",
        title: "Reduce the pepper blend",
        caption: "Boil the blended peppers, tomatoes, onion, garlic and ginger until the mixture is thicker and its excess water has evaporated.",
        step: 1,
      },
      {
        src: "/images/recipes/adas-jollof-step-2-ai.webp",
        alt: "Thick red Jollof sauce with bay leaves and a light sheen of oil around the edge",
        title: "Wait for the oil to separate",
        caption: "Fry the tomato paste and reduced pepper base patiently. A light red-orange sheen at the edge shows that the sauce is concentrated and ready.",
        step: 3,
      },
      {
        src: "/images/recipes/adas-jollof-step-3-ai.webp",
        alt: "Orange-red Jollof rice steaming in a foil-sealed heavy pot with a lightly scorched edge",
        title: "Trap the steam, then finish",
        caption: "The foil and lid keep the steam inside. A brief final burst of heat creates the treasured lightly scorched party-Jollof finish without burning the rice.",
        step: 8,
      },
    ],
    relatedRecipeSlugs: ["daves-butter-chicken", "sams-shepherds-pie"],
  },
  {
    slug: "sams-shepherds-pie",
    title: "Sam's Shepherd's Pie",
    place: "Guildford, England",
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
    prepTime: "PT20M",
    cookTime: "PT1H16M",
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
    faqs: [
      {
        question: "Do the anchovies make shepherd's pie taste fishy?",
        answer:
          "No. The finely minced white anchovies melt into the lamb with the Marmite, leaving a deeper, rounded savoury flavour rather than a fishy taste.",
      },
      {
        question: "Which anchovies does Sam use?",
        answer:
          "Sam uses white anchovies, also called boquerones. They are milder and fruitier than dark salt-cured anchovies and should be finely minced so they disappear into the filling.",
      },
      {
        question: "How do you keep the mashed potato from becoming watery?",
        answer:
          "Drain the cooked potatoes thoroughly and leave them to steam in the colander for two minutes before mashing. This removes excess moisture.",
      },
      {
        question: "How do you make the potato topping crisp?",
        answer:
          "Spread the mash to the edges of the dish, drag a fork across it to create raised ridges and bake until those peaks are golden. Cheddar can be added before baking if you like.",
      },
    ],
    methodPhotos: [
      {
        src: "/images/recipes/sams-shepherds-pie-step-4-ai.webp",
        alt: "Browned lamb and finely diced vegetables forming a thick savoury base in a pan",
        title: "Melt in the savoury layer",
        caption: "The finely minced anchovies and Marmite disappear into the browned lamb. Cook the tomato purée and flour through before adding stock.",
        step: 4,
      },
      {
        src: "/images/recipes/sams-shepherds-pie-step-6-ai.webp",
        alt: "A shepherd's pie covered edge-to-edge with mashed potato marked with fork ridges",
        title: "Rake deep potato ridges",
        caption: "Spread the mash right to the edges, then drag a fork across the surface. Those raised ridges are what turn crisp in the oven.",
        step: 6,
      },
      {
        src: "/images/recipes/sams-shepherds-pie-step-7-ai.webp",
        alt: "Baked shepherd's pie with golden crisp potato peaks and bubbling filling at the edges",
        title: "Bake until the peaks are golden",
        caption: "Look for bubbling filling around the edge and deeply golden potato peaks. Rest the pie for ten minutes before serving.",
        step: 7,
      },
    ],
  },
  {
    slug: "phils-and-serbs-three-cheese-souffle",
    title: "Phil & Serb's Three-Cheese Soufflé",
    place: "New Malden, England",
    story:
      "Phil & Serb’s three-cheese soufflé is all about balance: Gruyère for melt, aged Cheddar for a sharp edge and Parmigiano-Reggiano for nutty depth. The béchamel is made patiently, the egg whites folded gently, and the finished soufflé goes straight from oven to table at its highest, lightest moment.",
    ingredients: [
      "1 tbsp unsalted butter, softened (for the dish)",
      "2 tbsp Parmigiano-Reggiano, finely grated (for coating)",
      "3 tbsp (45g) unsalted butter",
      "3 tbsp (30g) all-purpose flour",
      "1 cup (240ml) whole milk, warmed",
      "½ tsp Dijon mustard",
      "⅛ tsp freshly grated nutmeg",
      "⅛ tsp cayenne pepper",
      "Salt and freshly ground black pepper, to taste",
      "½ cup (50g) Gruyère, finely grated",
      "½ cup (50g) sharp aged Cheddar, finely grated",
      "¼ cup (25g) Parmigiano-Reggiano, finely grated",
      "4 large egg yolks, at room temperature",
      "5 large egg whites, at room temperature",
      "⅛ tsp cream of tartar",
    ],
    method: [
      "Heat the oven to 190°C (375°F), with a rack in the lower third. Brush a 4-cup soufflé dish, or four 6 oz ramekins, with the softened butter using upward strokes. Dust with the grated Parmigiano-Reggiano, turning to coat and tapping out the excess.",
      "Melt 3 tbsp butter in a saucepan over a medium heat. Whisk in the flour and cook for 1–2 minutes. Gradually whisk in the warm milk until smooth, then cook for 2–3 minutes until the sauce thickens. Remove from the heat and stir in Dijon, nutmeg, cayenne, salt and pepper. Let it cool for 2 minutes, then whisk in the egg yolks one at a time.",
      "Fold the Gruyère, Cheddar and Parmigiano-Reggiano into the warm sauce until melted and silky. Transfer to a large bowl and let the mixture cool until just lukewarm.",
      "In a clean bowl, beat the egg whites with the cream of tartar until stiff peaks form but the whites still look glossy. Stir one-third into the cheese base to loosen it, then gently fold in the rest in two batches using a cut-and-roll motion until no streaks remain.",
      "Pour the mixture into the prepared dish until about three-quarters full. Run your thumb around the inside rim through the batter to create a channel for a neat rise. Put it in the oven, immediately reduce the heat to 180°C (350°F), and bake for 30–35 minutes, or 20–22 minutes for ramekins, until puffed, golden and gently jiggly. Keep the oven door closed for the first 25 minutes.",
    ],
    image: "/images/recipes/phils-and-serbs-three-cheese-souffle-wide.png",
    category: "Starter",
    number: "08",
    prepTime: "PT30M",
    cookTime: "PT39M",
    cuisine: "French",
    contributorName: "Phil & Serb",
    notes: [
      {
        title: "The upward brush strokes",
        text: "Brush the butter vertically from base to rim. It gives the soufflé a straight, clean path to rise.",
      },
      {
        title: "Keep the door closed",
        text: "Do not open the oven during the first 25 minutes. A rush of cold air can deflate the airy structure.",
      },
    ],
    faqs: [
      {
        question: "Why do you brush a soufflé dish with upward strokes?",
        answer:
          "Brushing the butter vertically from the base to the rim gives the soufflé mixture a straight path to rise up the sides of the dish.",
      },
      {
        question: "How stiff should the egg whites be for a soufflé?",
        answer:
          "Beat them until they hold stiff peaks but still look glossy. Fold them into the cheese base gently, stopping when the last white streaks disappear.",
      },
      {
        question: "Why should you keep the oven door closed?",
        answer:
          "Do not open the oven during the first 25 minutes. A rush of cold air can deflate the light structure before it has finished setting.",
      },
      {
        question: "How long do individual soufflés take to bake?",
        answer:
          "Four 6 oz ramekins take about 20–22 minutes, while one 4-cup soufflé dish takes 30–35 minutes. They should be puffed, golden and still gently jiggly.",
      },
    ],
    methodPhotos: [
      {
        src: "/images/recipes/phils-and-serbs-three-cheese-souffle-step-1-ai.webp",
        alt: "An empty soufflé dish brushed upwards with butter and coated with finely grated cheese",
        title: "Prepare a path to rise",
        caption: "Brush the butter from base to rim in straight upward strokes, then coat the dish evenly with Parmigiano-Reggiano.",
        step: 1,
      },
      {
        src: "/images/recipes/phils-and-serbs-three-cheese-souffle-step-4-ai.webp",
        alt: "Glossy stiff egg whites being folded gently into a pale cheese base",
        title: "Fold without losing the air",
        caption: "The whites should hold glossy stiff peaks. Loosen the cheese base with one-third, then fold in the rest until the streaks just disappear.",
        step: 4,
      },
      {
        src: "/images/recipes/phils-and-serbs-three-cheese-souffle-step-5-ai.webp",
        alt: "A tall golden three-cheese soufflé risen above the rim of a white ceramic dish",
        title: "Serve at its highest",
        caption: "The soufflé is ready when it is tall, deeply golden and still gently jiggly. Take it straight from oven to table.",
        step: 5,
      },
    ],
  },
  {
    slug: "gautam-and-shobhas-tandoori-aloo-nazakat",
    title: "Gautam & Shobha's Tandoori Aloo Nazakat",
    place: "New Delhi, India",
    story:
      "When Gautam Arora was preparing to open his first restaurant, Martabaan Tales, he turned to his mum, Shobha. She taught him how to make Tandoori Aloo Nazakat: potato barrels filled with spiced paneer, coated in tandoori marinade and roasted until smoky and golden. The recipe became part of the moment a family lesson turned into the first step of his professional story.",
    ingredients: [
      "600g medium potatoes, evenly sized",
      "150g fresh paneer, crumbled",
      "50g red onion, finely minced",
      "5g green chilli, finely chopped",
      "5g fresh ginger, grated",
      "6g fresh coriander leaves, chopped, plus extra to garnish",
      "1g garam masala",
      "1g roasted cumin powder",
      "15ml fresh lemon juice",
      "4g table salt, or to taste",
      "1 tablespoon reserved potato pulp",
      "80g tandoori marinade",
      "5g chaat masala, for dusting",
      "Thinly sliced onions, to garnish",
    ],
    method: [
      "Wash and peel the potatoes, then cut each one in half lengthways. Using a melon baller or spoon, carefully scoop out the centres to form sturdy potato cups with walls about 5mm thick. Reserve the scooped potato pulp.",
      "Parboil or blanch the potato cups in salted water for 3–4 minutes, then drain well. This helps the potatoes cook through without scorching the paneer filling.",
      "In a medium bowl, combine the crumbled paneer, minced red onion, green chilli, ginger and chopped coriander.",
      "Add the garam masala, roasted cumin powder, lemon juice, salt and one tablespoon of reserved mashed potato pulp. Mix thoroughly.",
      "Firmly pack the paneer mixture into the potato cavities. Coat the stuffed potatoes generously on all sides with tandoori marinade, then marinate for 30–60 minutes. Refrigerate them if marinating for longer.",
      "Carefully slide the marinated potatoes onto skewers. Roast in a clay tandoor, on a hot grill, or in an oven preheated to 220°C (425°F) for 8–10 minutes, until charred at the edges.",
      "Serve the stuffed potatoes whole or sliced into rounds. Dust with chaat masala, garnish with coriander and sliced onion, and serve hot with mint-coriander chutney and lemon wedges.",
    ],
    image: "/images/recipes/gautam-shobha-tandoori-aloo-nazakat-wide.webp",
    category: "Starter",
    number: "09",
    prepTime: "PT50M",
    cookTime: "PT10M",
    serves: "3–4 portions",
    cuisine: "Indian",
    datePublished: "2026-08-20",
    contributorName: "Gautam Arora & Shobha",
    contributorImage: "/images/recipes/gautam-shobha-portrait.webp",
    contributorImageAlt: "Shobha and her son Gautam Arora together in New Delhi",
    notes: [
      {
        title: "A head start for the potatoes",
        text: "Parboil or blanch the hollowed potato cups in salted water for 3–4 minutes before stuffing. This helps them cook through while keeping the paneer filling from scorching.",
      },
      {
        title: "Give the marinade time",
        text: "Leave the stuffed potatoes in the tandoori marinade for at least 30 minutes. Refrigerate them if you choose the longer 60-minute marination.",
      },
      {
        title: "To serve",
        text: "Serve piping hot with mint-coriander chutney, thinly sliced pickled onion rings and a wedge of lemon.",
      },
    ],
    faqs: [
      {
        question: "How do you stop the potatoes scorching before they are cooked?",
        answer:
          "Parboil or blanch the hollowed potato cups in salted water for 3–4 minutes before filling them. This gives the potatoes a head start while protecting the paneer filling from excessive heat.",
      },
      {
        question: "How long should Tandoori Aloo Nazakat marinate?",
        answer:
          "Marinate the stuffed, coated potatoes for 30–60 minutes. Keep them refrigerated if you leave them for the longer time.",
      },
      {
        question: "Can you make Tandoori Aloo Nazakat without a clay tandoor?",
        answer:
          "Yes. Gautam and Shobha's recipe can be cooked on a hot grill or in an oven preheated to 220°C (425°F), as well as in a clay tandoor.",
      },
      {
        question: "What should you serve with Tandoori Aloo Nazakat?",
        answer:
          "Dust the cooked potatoes with chaat masala and serve them hot with fresh coriander, sliced or pickled onions, mint-coriander chutney and lemon wedges.",
      },
    ],
    methodPhotos: [
      {
        src: "/images/recipes/gautam-shobha-tandoori-aloo-nazakat-step-1.webp",
        alt: "A halved potato shell holding paneer filling, showing the sturdy wall around the hollowed centre",
        title: "Keep the potato walls sturdy",
        caption: "Leave about 5mm of potato around each hollowed centre so the cups stay intact while they are filled, skewered and roasted.",
        step: 1,
      },
      {
        src: "/images/recipes/gautam-shobha-tandoori-aloo-nazakat-step-5.webp",
        alt: "Tandoori potato shells generously filled with a textured spiced paneer mixture",
        title: "Pack in the paneer filling",
        caption: "Fill every potato cavity firmly, then coat the outside generously with tandoori marinade before giving it time to rest.",
        step: 5,
      },
      {
        src: "/images/recipes/gautam-shobha-tandoori-aloo-nazakat-step-6.webp",
        alt: "Roasted Tandoori Aloo Nazakat with smoky golden edges arranged on a blue plate",
        title: "Look for smoky, charred edges",
        caption: "The potatoes are ready when the edges are deeply golden and lightly charred while the paneer filling remains tender.",
        step: 6,
      },
    ],
  },
  {
    slug: "auntie-marcias-pineapple-jerk-chicken",
    title: "Auntie Marcia's Pineapple-Infused Jamaican Jerk Chicken",
    place: "Birmingham, England",
    story:
      "Auntie Marcia made her Jamaican Jerk Chicken with that sweet and sour sauce that was finger lickin' good.",
    ingredients: [
      "1.4–1.8kg chicken, bone-in and skin-on (thighs and drumsticks recommended)",
      "60ml canned pineapple juice (canned holds up better than fresh for a long marinade — see notes)",
      "2–3 Scotch bonnet peppers, stemmed (seeds in for real heat, seeds out for milder)",
      "1 tablespoon ground allspice (pimento)",
      "4 scallions (spring onions), roughly chopped",
      "1 medium yellow onion, roughly chopped",
      "4 garlic cloves, peeled",
      "1 thumb-sized piece of ginger, peeled",
      "2 tablespoons fresh thyme leaves",
      "1 teaspoon ground nutmeg",
      "1 teaspoon ground cinnamon",
      "60ml soy sauce",
      "2 tablespoons dark brown sugar",
      "2 tablespoons vegetable oil",
      "Juice of 2 limes",
      "1 tablespoon salt and 1 teaspoon black pepper",
    ],
    method: [
      "Blend the pineapple juice, Scotch bonnet peppers, allspice, scallions, onion, garlic, ginger, thyme, nutmeg, cinnamon, soy sauce, brown sugar, oil, lime juice, salt and pepper into a coarse marinade paste.",
      "Pat the chicken pieces dry, then use a fork or small knife to poke a few holes or shallow slashes into the meat so the marinade can penetrate deeply.",
      "Pour the marinade over the chicken. Wearing gloves, rub it generously all over the pieces and underneath the skin. Cover tightly and refrigerate for at least 4 hours, ideally overnight (12–24 hours) for the best flavour.",
      "To grill: set up a two-zone barbecue with one hot side and one cooler side. Place the chicken over indirect heat on the cooler side and cook for 40–50 minutes, turning occasionally, then move to the hot side for the final 5–10 minutes to caramelise the sugars and get a proper char.",
      "To oven-bake instead: heat the oven to 200°C. Place the chicken on a wire rack over a foil-lined tray and bake for 45–50 minutes, until the internal temperature reaches 74°C, then finish under the grill for 3–5 minutes to blacken and crisp the skin.",
      "Rest the chicken for 5–10 minutes before serving.",
    ],
    image: "/images/recipes/auntie-marcias-pineapple-jerk-chicken-wide.webp",
    category: "Main",
    number: "10",
    prepTime: "PT15M",
    cookTime: "PT45M",
    serves: "4 to 6 people",
    cuisine: "Jamaican",
    contributorName: "Sonia Brown",
    notes: [
      {
        title: "Why canned pineapple juice",
        text: "Fresh pineapple contains bromelain, an enzyme that will turn the chicken to mush if it marinates for more than a few hours. Canned juice is pasteurised, so it's safe for an overnight marinade.",
      },
      {
        title: "Protect your hands",
        text: "Scotch bonnet oils linger on skin and burn painfully if they reach your eyes. Wear disposable gloves when rubbing the marinade onto the chicken.",
      },
      {
        title: "Save some marinade for a glaze",
        text: "Set aside a few tablespoons of marinade before it touches the raw chicken. Boil it briefly, mix with a little extra pineapple juice or ketchup, and brush it on during the final few minutes of cooking, or serve it as a dipping sauce.",
      },
      {
        title: "Get that authentic smoke",
        text: "Traditional jerk is smoked over pimento wood. If grilling, soak pimento wood chips, or substitute hickory or applewood, and add them to the coals.",
      },
      {
        title: "Balance the heat",
        text: "Serve alongside cooling sides like Jamaican rice and peas, sweet fried plantain, or a fresh mango and pineapple salsa if the chicken is too spicy for some guests.",
      },
    ],
    faqs: [
      {
        question: "Why does this recipe use canned pineapple juice instead of fresh?",
        answer: "Fresh pineapple contains an enzyme called bromelain that breaks meat down too aggressively over a long marinade, turning the texture mushy. Canned juice is pasteurised, so it's safe for an overnight soak.",
      },
      {
        question: "How spicy is Auntie Marcia's jerk chicken?",
        answer: "It's built around 2–3 Scotch bonnet peppers, which are genuinely hot. Leave the seeds in for maximum fire, or remove them for a milder result.",
      },
      {
        question: "Can I make this in the oven instead of on a grill?",
        answer: "Yes. Bake at 200°C on a wire rack over a foil-lined tray for 45–50 minutes, then finish under the grill for 3–5 minutes to crisp and blacken the skin.",
      },
      {
        question: "How long should the chicken marinate?",
        answer: "At least 4 hours, but overnight (12–24 hours) gives the best flavour.",
      },
    ],
    methodPhotos: [
      {
        src: "/images/recipes/auntie-marcias-pineapple-jerk-chicken-step-1-ai.webp",
        alt: "Raw bone-in chicken thighs and drumsticks coated in a coarse jerk marinade with visible scallion, thyme and chilli",
        title: "Blend and coat with the jerk marinade",
        caption: "Blend the aromatics, spices, pineapple juice, soy, lime, sugar and oil into a coarse paste, then work it over and beneath the chicken skin.",
        step: 1,
      },
      {
        src: "/images/recipes/auntie-marcias-pineapple-jerk-chicken-step-4-ai.webp",
        alt: "Marinated jerk chicken cooking on the cooler side of a charcoal barbecue with the glowing coals banked to the other side",
        title: "Cook gently over indirect heat",
        caption: "Keep the chicken on the cooler side of a two-zone barbecue for most of the cooking time so it cooks through before the sugary marinade is charred.",
        step: 4,
      },
      {
        src: "/images/recipes/auntie-marcias-pineapple-jerk-chicken-step-6-ai.webp",
        alt: "Finished Jamaican jerk chicken with glossy caramelised skin, blackened edges, lime wedges and fresh thyme",
        title: "Rest after the final char",
        caption: "Once the chicken reaches 74°C and the skin has crisp, blackened edges, rest it for 5–10 minutes before serving.",
        step: 6,
      },
    ],
  },
  {
    slug: "badepapas-pindi-cholley",
    title: "Badepapa's Pindi Cholley",
    place: "Noida, India",
    story:
      "This was Mickey's Badepapa's — his grandfather's — favourite dish, made in the house every Tuesday without fail. Badepapa's secret was a spoonful of chunky chaat masala folded into the garam masala, giving the chickpeas their extra tang.",
    ingredients: [
      "200g kabuli chana (white chickpeas), soaked overnight",
      "Water, as needed for soaking and boiling",
      "2 teaspoons black tea (2 tea bags)",
      "¼ teaspoon baking soda (optional)",
      "1 whole bay leaf (tej patta)",
      "8–10g salt",
      "30ml pure ghee or mustard oil",
      "1 teaspoon cumin seeds (jeera)",
      "¼ teaspoon carom seeds (ajwain)",
      "1 teaspoon anardana (crushed pomegranate seed), crushed",
      "1 teaspoon amchur (dry mango powder)",
      "1 teaspoon roasted cumin powder",
      "1 teaspoon coriander powder (dhania)",
      "¾ teaspoon Kashmiri red chilli powder",
      "½ teaspoon turmeric powder (haldi)",
      "2 teaspoons Punjabi chole masala",
      "½ teaspoon black salt (kala namak)",
      "1 teaspoon chunky chaat masala (Badepapa's addition)",
      "200g paneer, cut into cubes",
      "10g fresh ginger, julienned",
      "2–3 green chillies, slit or chopped",
      "Fresh coriander and lemon, to finish",
    ],
    method: [
      "Rinse the chickpeas and soak in plenty of water for at least 8 hours or overnight.",
      "Drain and rinse the chickpeas. Add to a pressure cooker with fresh water, the black tea bags, baking soda, salt and bay leaf.",
      "Pressure cook for 5–6 whistles (25–30 minutes), until tender. Discard the tea bags and bay leaf, then drain, reserving about 100ml of the cooking liquid.",
      "While the chickpeas cook, pan-fry the paneer cubes in a little ghee over medium heat until golden on a couple of sides. Set aside.",
      "In a heavy-bottomed kadai, heat the ghee or oil over medium heat. Add the cumin seeds and ajwain and let them crackle.",
      "Reduce the heat to low. Add the crushed anardana, amchur, roasted cumin, coriander powder, Kashmiri chilli, turmeric, chole masala, black salt and chaat masala. Sauté for 15–20 seconds.",
      "Add the boiled chickpeas and toss thoroughly to coat every piece in the spice blend.",
      "Pour in the reserved chickpea broth. Fold in the ginger and green chillies, cover, and cook on low for 10–15 minutes, stirring occasionally, until the liquid reduces and the masala clings to the chickpeas. Fold in the seared paneer for the final 5–8 minutes, just long enough to warm through and take on flavour without turning tough.",
      "Finish with chopped fresh coriander and a squeeze of lemon. Serve hot with bhature or kulcha.",
    ],
    image: "/images/recipes/badepapas-pindi-cholley-wide.webp",
    category: "Main",
    number: "11",
    prepTime: "PT10M",
    cookTime: "PT45M",
    serves: "3–4 portions",
    cuisine: "Punjabi",
    contributorName: "Mickey Arora",
    notes: [
      {
        title: "Why black tea?",
        text: "Boiling the chickpeas with black tea bags is what gives Pindi Cholley its signature dark colour — it's a traditional Rawalpindi technique, not a mistake if your chana comes out looking deep brown-black.",
      },
      {
        title: "The 8-hour soak isn't optional",
        text: "Soaking the dried chickpeas overnight is essential for even cooking. Don't skip it, even if you're short on time elsewhere.",
      },
      {
        title: "For a glossier masala",
        text: "Lightly mash a spoonful of the boiled chickpeas into the pan while tossing them in the spice blend. It helps the masala thicken and cling to every piece.",
      },
    ],
    faqs: [
      {
        question: "Why do the chickpeas look almost black?",
        answer: "They're boiled with black tea bags, a traditional Rawalpindi technique that gives Pindi Cholley its signature dark colour.",
      },
      {
        question: "Can I skip the overnight soak?",
        answer: "It isn't recommended. Soaking the dried chickpeas for at least 8 hours is what allows them to cook evenly and become properly tender.",
      },
      {
        question: "When should the paneer go in?",
        answer: "Pan-fry it separately until golden, then fold it into the curry for only the final 5–8 minutes of the slow cook. Adding it earlier risks the paneer turning rubbery.",
      },
      {
        question: "How do you know when Pindi Cholley is ready?",
        answer: "Cook it uncovered until the reserved broth has reduced and the dark masala clings closely to the chickpeas, leaving almost no loose gravy in the kadai.",
      },
    ],
    methodPhotos: [
      {
        src: "/images/recipes/badepapas-pindi-cholley-step-3-ai.webp",
        alt: "Tender deep-brown chickpeas in an open pressure cooker beside removed black tea bags and a bay leaf",
        title: "Cook until tender and tea-darkened",
        caption: "Pressure-cook the soaked chickpeas with black tea, salt and bay until tender, then remove the tea and reserve about 100ml of the cooking liquid.",
        step: 3,
      },
      {
        src: "/images/recipes/badepapas-pindi-cholley-step-6-ai.webp",
        alt: "Cumin, ajwain and ground Pindi Cholley spices blooming briefly in hot ghee in a dark iron kadai",
        title: "Bloom the dry spices briefly",
        caption: "Lower the heat before adding the ground spices and Badepapa's chunky chaat masala; 15–20 seconds is enough to release their aroma without scorching them.",
        step: 6,
      },
      {
        src: "/images/recipes/badepapas-pindi-cholley-step-9-ai.webp",
        alt: "Finished dark Pindi Cholley with masala-coated chickpeas, golden paneer, ginger, green chilli, coriander and lemon",
        title: "Finish with a dry, clinging masala",
        caption: "Reduce until the masala coats every chickpea, warm the seared paneer through at the end, then finish with ginger, chilli, coriander and lemon.",
        step: 9,
      },
    ],
  },
];

export function getFeaturedRecipe(slug: string): FeaturedRecipe | undefined {
  return featuredRecipes.find((recipe) => recipe.slug === slug);
}
