import { films } from "./films.ts";

function normalise(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/&/g, " and ")
    .replace(/[’']/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const aliases: Record<string, string> = {
  "some recipes are too important to lose": "Dave & Rubble | The Handwritten Recipe",
  "the handwritten recipe": "Dave & Rubble | The Handwritten Recipe",
  "a recipe tells you what to cook": "Dave & Rubble | The Story Behind It",
  "the recipe tells you what to cook": "Dave & Rubble | The Story Behind It",
  "the story behind it": "Dave & Rubble | The Story Behind It",
  "every kitchen needs a taste tester": "Dave & Rubble | Just a Taste",
  "thats ready for the table": "Dave & Rubble | Just a Taste",
  "just a taste": "Dave & Rubble | Just a Taste",
  "every recipe has a secret ingredient": "Dave & Rubble | Patience Is the Secret Ingredient",
  "patience is the secret ingredient": "Dave & Rubble | Patience Is the Secret Ingredient",
  "which dish should dave and rubble cook next": "Dave & Rubble | The Chicken Nomination",
  "the chicken nomination": "Dave & Rubble | The Chicken Nomination",
  "opr dave and rubble your nomination": "Dave & Rubble | Your Nomination",
  "what is the one family dish you think everyone should taste": "Dave & Rubble | Your Nomination",
  "opr dave and rubble gautam shobha dish of the week": "Dave & Rubble | Dish of the Week: Gautam & Shobha",
  "dish of the week": "Dave & Rubble | Dish of the Week: Gautam & Shobha",
  "dave and rubble long 2 seconds": "Dave & Rubble | The Longest Two Seconds",
  "rubbles relationship with time needs work": "Dave & Rubble | The Longest Two Seconds",
  "some recipes get adjusted rubble never lets it slide": "Dave & Rubble | Butter Chicken Recipe",
  "quality control": "Dave & Rubble | Quality Control",
  "every good kitchen needs quality control": "Dave & Rubble | Quality Control",
  "the secret ingredient": "Dave & Rubble | The Secret Ingredient",
  "dave says the recipe needs one secret ingredient": "Dave & Rubble | The Secret Ingredient",
  "some recipes never leave you": "Dave & Rubble | Some Recipes Never Leave You",
  "dave and rubble attempt sams souffle": "Dave & Rubble | Sam's Soufflé",
  "dave and rubbles souffle": "Dave & Rubble | Sam's Soufflé",
  "sam and nadines shepherds pie opr": "Sam & Nadine’s Shepherd’s Pie | A Recipe Worth Passing On",
  "opr dave and rubbles steak story": "Dave & Rubble | Some Recipes Are Made with a Little Extra Company",
  "some recipes are made with a little extra company": "Dave & Rubble | Some Recipes Are Made with a Little Extra Company",
  "dave and rubble a recipe worth passing on": "Dave & Rubble | A Recipe Worth Passing On",
  "opr dave and rubble recipe worth passing on": "Dave & Rubble | A Recipe Worth Passing On",
  "some recipes are written down the best ones are remembered": "Dave & Rubble | A Recipe Worth Passing On",
  "mummy morris and rubble daves mums beef casserole": "Mummy Morris & Rubble | Dave’s Mum’s Beef Casserole",
  "dave and rubble butter chicken recipe": "Dave & Rubble | Butter Chicken Recipe",
  "dave and rubble daves butter chicken": "Dave & Rubble | Dave's Butter Chicken",
  "daves butter chicken has a family recipe no shortcuts and one very attentive supervisor": "Dave & Rubble | Dave's Butter Chicken",
  "dave and rubble looking at an old recipe": "Dave & Rubble | Finding an Old Family Recipe",
  "dave and rubble finding an old family recipe": "Dave & Rubble | Finding an Old Family Recipe",
  "opr dave and rubble recipe of the month": "Dave & Rubble | OPR Recipe of the Month",
  "daves in the kitchen rubbles keeping watch": "Dave & Rubble | Cooking Together",
};

type SocialPlatform = "facebook" | "instagram" | "tiktok" | "youtube";

// Stable IDs are the primary match when supplied. This optional JSON map lets
// OPR add IDs without a code release, for example:
// {"youtube:MkSF7Ky8Ybc":"Dave & Rubble | The Handwritten Recipe"}
function configuredIdAliases(): Record<string, string> {
  try {
    return JSON.parse(process.env.OPR_SOCIAL_FILM_IDS ?? "{}") as Record<string, string>;
  } catch {
    console.warn("OPR_SOCIAL_FILM_IDS is not valid JSON");
    return {};
  }
}

export function matchSocialFilmId(platform: SocialPlatform, id: string | undefined): string | null {
  if (!id) return null;
  const matched = configuredIdAliases()[`${platform}:${id}`];
  return matched && films.some((film) => film.title === matched) ? matched : null;
}

export function matchSocialFilmTitle(rawTitle: string): string | null {
  const title = normalise(rawTitle.split("\n")[0] ?? rawTitle);
  if (!title || title.startsWith("every recipe has a story")) return null;
  if (aliases[title]) return aliases[title];
  for (const [alias, canonical] of Object.entries(aliases)) {
    if (title.startsWith(`${alias} `)) return canonical;
  }
  for (const film of films) {
    const canonical = normalise(film.title);
    const shortTitle = normalise(film.title.split("|").at(-1) ?? film.title);
    if (title === canonical || title.startsWith(`${canonical} `) || (shortTitle.length >= 12 && title === shortTitle)) return film.title;
  }
  return null;
}

export const pinterestFilmImpressions = [
  { title: "Dave & Rubble | Dave's Butter Chicken", views: 9 },
  { title: "The Secret Ingredient", views: 9 },
  { title: "Sam & Nadine’s Shepherd’s Pie | OPR", views: 7 },
  { title: "Dave and Rubbles Souffle", views: 6 },
  { title: "Some recipes never leave you.", views: 6 },
  { title: "Dave & Rubble | A Recipe Worth Passing On", views: 5 },
  { title: "Mummy Morris & Rubble | Dave’s Mum’s Beef Casserole", views: 3 },
  { title: "Dave and Rubble Butter Chicken Recipe", views: 1 },
  { title: "Quality Control", views: 10 },
  { title: "OPR Dave and Rubble's steak story", views: 9 },
  { title: "Dave & Rubble | Just a Taste", views: 0 },
  { title: "Dave & Rubble | The Story Behind It", views: 0 },
  { title: "Dave & Rubble | The Handwritten Recipe", views: 0 },
  { title: "Dave & Rubble | The Chicken Nomination", views: 0 },
  { title: "Dave & Rubble | Patience Is the Secret Ingredient", views: 0 },
  { title: "Dave & Rubble | Your Nomination", views: 0 },
  { title: "Dave & Rubble | Dish of the Week: Gautam & Shobha", views: 0 },
] as const;

// Verified directly in each channel's creator dashboard. These figures provide
// a fallback when an API is unavailable or a post caption does not match the
// website title. Live API totals override them when available.
export const socialFilmAuditCapturedAt = "2026-08-21T18:35:00+01:00";

export const facebookFilmViews = [
  { title: "Dave & Rubble | Your Nomination", views: 27 },
  { title: "Dave & Rubble | Dish of the Week: Gautam & Shobha", views: 54 },
  { title: "Dave & Rubble | The Longest Two Seconds", views: 173 },
  { title: "Dave & Rubble | Butter Chicken Recipe", views: 301 },
  { title: "Dave & Rubble | Quality Control", views: 137 },
  { title: "Dave & Rubble | The Secret Ingredient", views: 186 },
  { title: "Dave & Rubble | Dave's Butter Chicken", views: 332 },
] as const;

export const instagramFilmViews = [
  { title: "Dave & Rubble | Your Nomination", views: 41 },
  { title: "Dave & Rubble | Dish of the Week: Gautam & Shobha", views: 103 },
  { title: "Dave & Rubble | The Longest Two Seconds", views: 366 },
  { title: "Dave & Rubble | Butter Chicken Recipe", views: 218 },
  { title: "Dave & Rubble | Quality Control", views: 314 },
  { title: "Dave & Rubble | The Secret Ingredient", views: 195 },
  { title: "Dave & Rubble | Dave's Butter Chicken", views: 424 },
  { title: "Dave & Rubble | Sam's Soufflé", views: 231 },
  { title: "Dave & Rubble | Some Recipes Never Leave You", views: 206 },
  { title: "Mummy Morris & Rubble | Dave’s Mum’s Beef Casserole", views: 215 },
  { title: "Dave & Rubble | Finding an Old Family Recipe", views: 180 },
  { title: "Dave & Rubble | A Recipe Worth Passing On", views: 177 },
  { title: "Dave & Rubble | OPR Recipe of the Month", views: 169 },
  { title: "Dave & Rubble | Cooking Together", views: 158 },
  { title: "Dave & Rubble | Some Recipes Are Made with a Little Extra Company", views: 206 },
] as const;

export const tiktokFilmViews = [
  { title: "Dave & Rubble | Dave's Butter Chicken", views: 250 },
  { title: "Dave & Rubble | Quality Control", views: 246 },
  { title: "Dave & Rubble | Finding an Old Family Recipe", views: 243 },
  { title: "Dave & Rubble | The Secret Ingredient", views: 241 },
  { title: "Dave & Rubble | Sam's Soufflé", views: 239 },
] as const;

export const youtubeFilmViews = [
  { title: "Dave & Rubble | Your Nomination", views: 0 },
  { title: "Dave & Rubble | Dish of the Week: Gautam & Shobha", views: 0 },
  { title: "Dave & Rubble | The Longest Two Seconds", views: 0 },
  { title: "Dave & Rubble | Butter Chicken Recipe", views: 0 },
  { title: "Dave & Rubble | Quality Control", views: 0 },
  { title: "Dave & Rubble | The Secret Ingredient", views: 0 },
  { title: "Dave & Rubble | Dave's Butter Chicken", views: 1 },
  { title: "Dave & Rubble | Sam's Soufflé", views: 2 },
  { title: "Dave & Rubble | Some Recipes Never Leave You", views: 3 },
  { title: "Dave & Rubble | Finding an Old Family Recipe", views: 0 },
  { title: "Dave & Rubble | A Recipe Worth Passing On", views: 0 },
  { title: "Dave & Rubble | OPR Recipe of the Month", views: 0 },
] as const;
