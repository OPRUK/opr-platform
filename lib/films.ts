// The OPR Film Collection. Video masters live in public/videos so they
// are versioned and named consistently in one place. Some poster images
// remain in the public Supabase Storage bucket. Both /films (desktop)
// and /app/films (mobile) read from this one list.
const storageBase = "https://gtvgjymbmtaplvxdrnln.supabase.co/storage/v1/object/public/films";

export type Film = {
  title: string;
  video: string;
  poster?: string;
  captions?: string;
  transcript?: string;
  recipeSlug?: string;
  uploadDate?: string;
};

export function filmSlug(film: Pick<Film, "title">): string {
  return film.title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getFilmBySlug(slug: string): Film | null {
  return films.find((candidate) => filmSlug(candidate) === slug) ?? null;
}

export const defaultFilmUploadDate = "2026-08-01T12:00:00+00:00";

export function filmUploadDate(film: Pick<Film, "uploadDate">): string {
  if (!film.uploadDate) return defaultFilmUploadDate;
  return /^\d{4}-\d{2}-\d{2}$/.test(film.uploadDate)
    ? `${film.uploadDate}T12:00:00+00:00`
    : film.uploadDate;
}

function film(
  title: string,
  file: string,
  {
    hasPoster = true,
    videoFile = `opr-${file}`,
    transcript,
    recipeSlug,
  }: {
    hasPoster?: boolean;
    videoFile?: string;
    transcript: string;
    recipeSlug?: string;
  },
): Film {
  return {
    title,
    video: `/videos/${videoFile}.mp4`,
    poster: hasPoster ? `${storageBase}/posters/${file}.jpg` : undefined,
    transcript,
    recipeSlug,
  };
}

const filmsUnordered: Film[] = [
  {
    title: "Dave & Rubble | The Handwritten Recipe",
    video: "/videos/opr-dave-and-rubble-the-handwritten-recipe.mp4",
    poster: "/images/opr-dave-and-rubble-the-handwritten-recipe-poster.jpg",
    captions: "/captions/opr-dave-and-rubble-the-handwritten-recipe.vtt",
    transcript:
      "Dave: “Some recipes are too important to lose.”\nRubble: “Does it mention chicken?”\nDave: “It’s your first question every time.”\nRubble: “It’s an important question.”",
    uploadDate: "2026-08-22T18:00:00+01:00",
  },
  {
    title: "Dave & Rubble | The Story Behind It",
    video: "/videos/opr-dave-and-rubble-the-story-behind-it.mp4",
    poster: "/images/opr-dave-and-rubble-the-story-behind-it-poster.jpg",
    captions: "/captions/opr-dave-and-rubble-the-story-behind-it.vtt",
    transcript:
      "Dave: “The recipe tells you what to cook.”\nRubble: “What tells you why?”\nDave: “The story behind it.”\nRubble: “And whether there’s chicken.”",
    uploadDate: "2026-08-22T18:00:00+01:00",
  },
  {
    title: "Dave & Rubble | Just a Taste",
    video: "/videos/opr-dave-and-rubble-just-a-taste.mp4",
    poster: "/images/opr-dave-and-rubble-just-a-taste-poster.jpg",
    captions: "/captions/opr-dave-and-rubble-just-a-taste.vtt",
    transcript:
      "Dave: “That’s ready for the table.”\nRubble: “I should test it first.”\nDave: “That isn’t your job.”\nRubble: “It could be.”",
    uploadDate: "2026-08-22T18:00:00+01:00",
  },
  {
    title: "Dave & Rubble | Patience Is the Secret Ingredient",
    video: "/videos/opr-dave-and-rubble-patience-is-the-secret-ingredient.mp4",
    poster: "/images/opr-dave-and-rubble-patience-is-the-secret-ingredient-poster.jpg",
    captions: "/captions/opr-dave-and-rubble-patience-is-the-secret-ingredient.vtt",
    transcript:
      "Dave: “Every recipe has a secret ingredient.”\nRubble: “Is it chicken?”\nDave: “It’s patience.”\nRubble: “I preferred chicken.”",
    uploadDate: "2026-08-22T12:00:00+01:00",
  },
  {
    title: "Dave & Rubble | The Chicken Nomination",
    video: "/videos/opr-dave-and-rubble-the-chicken-nomination.mp4",
    poster: "/images/opr-dave-and-rubble-the-chicken-nomination-poster.jpg",
    captions: "/captions/opr-dave-and-rubble-the-chicken-nomination.vtt",
    transcript:
      "Dave: “Which dish should we cook next?”\nRubble: “The one with chicken.”\nDave: “That isn’t a nomination.”\nRubble: “It is now.”",
    uploadDate: "2026-08-22T12:00:00+01:00",
  },
  {
    title: "Dave & Rubble | Five Generations",
    video: "/videos/opr-dave-and-rubble-five-generations.mp4",
    poster: "/images/opr-dave-and-rubble-five-generations-poster.jpg",
    captions: "/captions/opr-dave-and-rubble-five-generations.vtt",
    transcript:
      "Dave: “This recipe goes back five generations.”\nRubble: “Which generation invented gravy?”\nDave: “That’s not how family trees work.”",
    uploadDate: "2026-08-25T12:05:00+01:00",
  },
  {
    title: "Dave & Rubble | Before Your Time",
    video: "/videos/opr-dave-and-rubble-before-your-time.mp4",
    poster: "/images/opr-dave-and-rubble-before-your-time-poster.jpg",
    captions: "/captions/opr-dave-and-rubble-before-your-time.vtt",
    transcript:
      "Dave: “That’s the whole family at Sunday lunch.”\nRubble: “I don’t see myself.”\nDave: “This was taken before you were born.”",
    uploadDate: "2026-08-25T12:06:00+01:00",
  },
  {
    title: "Dave & Rubble | The Measuring Spoon",
    video: "/videos/opr-dave-and-rubble-the-measuring-spoon.mp4",
    poster: "/images/opr-dave-and-rubble-the-measuring-spoon-poster.jpg",
    captions: "/captions/opr-dave-and-rubble-the-measuring-spoon.vtt",
    transcript:
      "Dave: “Recipe says one level teaspoon.”\nRubble: “My professional measurement is one heaped spoon of chicken.”\nDave: “That’s not a measurement, that’s a preference.”",
    uploadDate: "2026-08-25T12:07:00+01:00",
  },
  {
    title: "Dave & Rubble | The Family Vote",
    video: "/videos/opr-dave-and-rubble-the-family-vote.mp4",
    poster: "/images/opr-dave-and-rubble-the-family-vote-poster.jpg",
    captions: "/captions/opr-dave-and-rubble-the-family-vote.vtt",
    transcript:
      "Dave: “Which one should we cook tonight?”\nRubble: “Whichever one smells more like chicken.”\nDave: “You haven’t smelled either of them.”",
    uploadDate: "2026-08-25T12:07:00+01:00",
  },
  {
    title: "Dave & Rubble | Ten Out of Ten",
    video: "/videos/opr-dave-and-rubble-ten-out-of-ten.mp4",
    poster: "/images/opr-dave-and-rubble-ten-out-of-ten-poster.jpg",
    captions: "/captions/opr-dave-and-rubble-ten-out-of-ten.vtt",
    transcript:
      "Dave: “Rate this recipe out of ten.”\nRubble: “Does it contain chicken?”\nDave: “No.”\nRubble: “One.”",
    uploadDate: "2026-08-25T12:08:00+01:00",
  },
  {
    title: "Dave & Rubble | The Substitution",
    video: "/videos/opr-dave-and-rubble-the-substitution.mp4",
    poster: "/images/opr-dave-and-rubble-the-substitution-poster.jpg",
    captions: "/captions/opr-dave-and-rubble-the-substitution.vtt",
    transcript:
      "Dave: “This recipe calls for butter.”\nRubble: “Might I suggest chicken instead.”\nDave: “It’s a dessert, Rubble.”",
    uploadDate: "2026-08-25T12:08:00+01:00",
  },
  {
    title: "Dave & Rubble | Room at the Table",
    video: "/videos/opr-dave-and-rubble-room-at-the-table.mp4",
    poster: "/images/opr-dave-and-rubble-room-at-the-table-poster.jpg",
    captions: "/captions/opr-dave-and-rubble-room-at-the-table.vtt",
    transcript:
      "Dave: “There’s always a seat for another story.”\nRubble: “Does the seat come with dinner?”\nDave: “It comes with listening.”\nRubble: “I’ll wait.”",
    uploadDate: "2026-08-25T12:09:00+01:00",
  },
  {
    title: "Dave & Rubble | Your Nomination",
    video: "/videos/opr-dave-and-rubble-your-nomination.mp4",
    captions: "/captions/opr-dave-and-rubble-your-nomination.vtt",
    transcript:
      "Dave: “Nominate the family dish everyone should taste.”\nRubble: “Can I nominate Butter Chicken?”\nDave: “You do. Every week.”",
    uploadDate: "2026-08-21T12:00:00+00:00",
  },
  {
    title: "Dave & Rubble | Dish of the Week: Gautam & Shobha",
    video: "/videos/opr-dave-and-rubble-gautam-shobha-dish-of-the-week.mp4",
    captions: "/captions/opr-dave-and-rubble-gautam-shobha-dish-of-the-week.vtt",
    transcript:
      "Dave: “This week’s dish comes from Gautam and his mum, Shobha.”\nRubble: “Did they make one for me?”\nDave: “You can have the story.”",
    recipeSlug: "gautam-and-shobhas-tandoori-aloo-nazakat",
    uploadDate: "2026-08-21T12:00:00+00:00",
  },
  {
    title: "Dave & Rubble | The Longest Two Seconds",
    video: "/videos/opr-dave-and-rubble-longest-two-seconds.mp4",
    poster: "/images/opr-dave-and-rubble-longest-two-seconds-poster.jpg",
    transcript:
      "Visual description: Dave sets a kitchen timer while Rubble watches closely. They exchange a joke as the final seconds count down before the OPR social card appears.",
    uploadDate: "2026-08-20T12:00:00+00:00",
  },
  {
    title: "Dave & Rubble | Butter Chicken Recipe",
    video: "/videos/opr-dave-and-rubble-butter-chicken-recipe.mp4",
    poster: "/images/opr-dave-and-rubble-butter-chicken-recipe-poster.jpg",
    transcript:
      "Visual description: Dave stirs a steaming pan of Butter Chicken while Rubble watches beside the hob. They exchange a joke about the recipe before the OPR social card appears.",
    recipeSlug: "daves-butter-chicken",
    uploadDate: "2026-08-20T12:00:00+00:00",
  },
  {
    title: "Dave & Rubble | The Secret Ingredient",
    video: "/videos/opr-dave-and-rubble-secret-ingredient.mp4",
    poster: "/images/opr-dave-and-rubble-secret-ingredient-poster.jpg",
    transcript:
      "Dave: “It just needs one secret ingredient.”\nRubble: “Chicken?”\nDave: “Apparently.”",
    uploadDate: "2026-08-17T12:00:00+01:00",
  },
  {
    title: "Dave & Rubble | Quality Control",
    video: "/videos/opr-dave-and-rubble-quality-control.mp4",
    poster: "/images/opr-dave-and-rubble-quality-control-poster.jpg",
    transcript:
      "Dave: “Family recipe. Four generations. Really?”\nRubble: “Quality control.”",
  },
  {
    title: "Dave & Rubble | Dave's Butter Chicken",
    video: "/videos/opr-dave-and-rubble-daves-butter-chicken.mp4",
    transcript:
      "Dave: “You’ve been watching this pan for ages.”\nRubble: “I’m supervising the Butter Chicken.”\nDave: “Family recipe. No shortcuts.”",
    recipeSlug: "daves-butter-chicken",
  },
  {
    title: "Dave & Rubble | Sam's Soufflé",
    video: "/videos/opr-dave-and-rubble-sams-souffle.mp4",
    transcript:
      "Dave: “Sam says we mustn’t let it fall.”\nRubble: “Then stop talking to it.”\nDave: “Sam doesn’t need to know.”",
    uploadDate: "2026-08-14T12:00:00+01:00",
  },
  {
    title: "Dave & Rubble | Some Recipes Never Leave You",
    video: "/videos/opr-dave-and-rubble-some-recipes-never-leave-you.mp4",
    transcript:
      "Dave: “You remember this one, Rubble?”\nRubble: “Of course. Your mum’s beef casserole.”\nDave: “Some recipes never leave you.”",
    recipeSlug: "barbaras-beef-casserole",
  },
  {
    title: "Dave & Rubble | Some Recipes Are Made with a Little Extra Company",
    video: "/videos/opr-dave-and-rubble-steak-story.mp4",
    transcript:
      "Visual description: Dave prepares a steak recipe in the kitchen while Rubble keeps him company.",
  },
  {
    title: "Dave & Rubble | Finding an Old Family Recipe",
    video: "/videos/opr-dave-and-rubble-old-family-recipe.mp4",
    transcript:
      "Dave: “This one has been in the family for years. The best recipes are not just made; they are passed on.”",
  },
  {
    title: "Mummy Morris & Rubble | Dave’s Mum’s Beef Casserole",
    video: "/videos/opr-mummy-morris-and-rubble-beef-casserole.mp4",
    transcript:
      "Mummy Morris: “This is my generation’s special beef casserole.”\nRubble: “Can I have some?”\nMummy Morris: “No, but I will make you some dental sticks that I found on Other People’s Recipes.”",
    recipeSlug: "barbaras-beef-casserole",
    uploadDate: "2026-08-13T12:00:00+01:00",
  },
  {
    title: "Dave & Rubble | A Recipe Worth Passing On",
    video: "/videos/opr-dave-and-rubble-recipe-worth-passing-on.mp4",
    poster: "/images/opr-dave-and-rubble-recipe-worth-passing-on-poster.jpg",
    transcript: "Dave: “Every family has one recipe worth passing on.”",
  },
  {
    title: "Dave & Rubble | OPR Recipe of the Month",
    video: "/videos/opr-dave-and-rubble-recipe-of-the-month.mp4",
    transcript: "Dave: “Which one gets your vote?”",
  },
  {
    title: "Dave & Rubble | Cooking Together",
    video: "/videos/opr-dave-and-rubble-kitchen-story-enhanced.mp4",
    poster: "/images/opr-dave-and-rubble-kitchen-story-poster.jpg",
    transcript:
      "Rubble: “All right, Dave, pay attention. We are making dental sticks.”\nDave: “Okay, I am listening.”\nRubble: “Go to OPR if you want to make it.”",
    uploadDate: "2026-08-07T12:00:00+01:00",
  },
  film("Three Recipes, Three Stories | The OPR Cookbook", "three-recipes-three-stories", {
    transcript:
      "Visual description: No dialogue. Three finished family dishes are shown in turn, each presented at the table.",
  }),
  film("Ada’s Party Jollof Rice | A Recipe to Bring People Together", "adas-party-jollof-rice", {
    transcript:
      "Ada: “I’m recording this to upload onto OPR, so the dish becomes a part of everyone’s family.”",
    recipeSlug: "adas-jollof-rice",
  }),
  film(
    "Sam & Nadine’s Shepherd’s Pie | A Recipe Worth Passing On",
    "sam-and-nadines-shepherds-pie",
    {
      videoFile: "opr-sam-and-nadines-shepherds-pie-film",
      transcript:
        "Sam: “Now, Nadine, here is the secret. Aunty Sharon used Marmite and anchovies to enhance the lamb.”\nNadine: “Wow.”\nSam: “I’m uploading this video to OPR. So when you want to make it, just go there.”",
      recipeSlug: "sams-shepherds-pie",
    },
  ),
  film(
    "Krishna Anand’s Baingan Ka Bharta | From the Kitchen Drawer",
    "krishna-anands-baingan-ka-bharta-kitchen-drawer",
    {
      transcript:
        "Grandma Krishna: “Chaten, it’s completely charred.”\nChaten: “Like this, Grandma Krishna?”\nGrandma Krishna: “Perfect. The onion’s soft and pink. This degi mirch gives that beautiful colour.”\nChaten: “Wow!”\nGrandma Krishna: “Taste your favourite baingan ka bharta.”",
      recipeSlug: "krishna-anands-baingan-ka-bharta",
    },
  ),
  film(
    "Krishna Anand’s Baingan ka Bharta | A Family Recipe",
    "krishna-anands-baingan-ka-bharta-family-recipe",
    {
      transcript:
        "Chaten: “This is my Nani’s famous baingan recipe. I am recording it so it never dies. It is going straight onto OPR, so everyone can enjoy her cooking.”",
      recipeSlug: "krishna-anands-baingan-ka-bharta",
    },
  ),
  film("The OPR Idea | A Menu Written by the People", "the-opr-idea", {
    transcript:
      "Narrator: “At OPR, Other People’s Recipes, the public writes the menu. And when two people think their family makes it better, the town picks sides.”",
  }),
  film("A Menu Written by the People | The OPR Vision", "a-menu-written-by-the-people", {
    transcript: "Diner: “I learnt this recipe from my mother-in-law.”",
  }),
  film("Same Town. Same Dish. | The OPR Vision", "same-town-same-dish", {
    transcript: "Diner: “This recipe has been in my family for generations.”",
  }),
  film("A New Menu Every Month | The OPR Vision", "a-new-menu-every-month", {
    transcript:
      "Narrator: “What if the best recipes in Britain weren’t written by chefs? At OPR, Other People’s Recipes, the public writes the menu. Real restaurant that never stops changing.”",
  }),
];

// Newest first — actual publish order, not the order entries happen to sit
// in the array above. Every page that lists films relies on this ordering
// rather than sorting itself.
export const films: Film[] = [...filmsUnordered].sort(
  (a, b) => new Date(filmUploadDate(b)).getTime() - new Date(filmUploadDate(a)).getTime(),
);
