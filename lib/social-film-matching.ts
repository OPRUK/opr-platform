import { films } from "./films.ts";

function normalise(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/&/g, " and ")
    .replace(/[’']/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const aliases: Record<string, string> = {
  "smoky celebratory and made to share": "Ada & Rubble | Party Jollof",
  "dave and rubbles taste test": "Dave & Rubble | Taste Test",
  "adas party jollof rice opr": "Ada’s Party Jollof Rice | A Recipe to Bring People Together",
  "dave says it was worth the wait": "Dave & Rubble | The Leftovers",
  "dave calls it a modest helping": "Dave & Rubble | The Portion",
  "my mum pat actually hated cooking": "Amy & Rubble | Pat’s Haddock & Tomato Bake",
  "a mum who hated cooking": "Amy & Rubble | Pat’s Haddock & Tomato Bake",
  "amy remembers her mum pat": "Amy & Rubble | Pat’s Haddock & Tomato Bake",
  "pats haddock and tomato bake amys family food story": "Amy & Rubble | Pat’s Haddock & Tomato Bake",
  "no old photographs plenty of memories": "Robin & Rubble | Mum’s Gingerbread",
  "some memories dont need a photograph": "Robin & Rubble | Mum’s Gingerbread",
  "robins mums gingerbread a family food story": "Robin & Rubble | Mum’s Gingerbread",
  "the secret was guinness": "John & Rubble | Grandad’s Steak & Ale Pie",
  "every family recipe has its little secrets": "John & Rubble | Grandad’s Steak & Ale Pie",
  "johns grandads steak and ale pie a family food story": "John & Rubble | Grandad’s Steak & Ale Pie",

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
  "this recipe goes back five generations": "Dave & Rubble | Five Generations",
  "five generations": "Dave & Rubble | Five Generations",
  "thats the whole family at sunday lunch": "Dave & Rubble | Before Your Time",
  "before your time": "Dave & Rubble | Before Your Time",
  "recipe says one level teaspoon": "Dave & Rubble | The Measuring Spoon",
  "the measuring spoon": "Dave & Rubble | The Measuring Spoon",
  "which one should we cook tonight": "Dave & Rubble | The Family Vote",
  "the family vote": "Dave & Rubble | The Family Vote",
  "rate this recipe out of ten": "Dave & Rubble | Ten Out of Ten",
  "dave asks rubble to rate the recipe out of ten": "Dave & Rubble | Ten Out of Ten",
  "ten out of ten": "Dave & Rubble | Ten Out of Ten",
  "this recipe calls for butter": "Dave & Rubble | The Substitution",
  "the substitution": "Dave & Rubble | The Substitution",
  "theres always a seat for another story": "Dave & Rubble | Room at the Table",
  "room at the table": "Dave & Rubble | Room at the Table",
};

type SocialPlatform = "facebook" | "instagram" | "tiktok" | "youtube" | "pinterest" | "linkedin";

// Stable IDs are the primary match when supplied. This optional JSON map lets
// OPR add IDs without a code release, for example:
// {"youtube:MkSF7Ky8Ybc":"Dave & Rubble | The Handwritten Recipe"}
const publishedPostIds: Record<string, string> = {
  "linkedin:urn:li:ugcPost:7518277577028022272": "Amy & Rubble | Pat’s Haddock & Tomato Bake",
  "linkedin:urn:li:ugcPost:7518291992439767040": "Robin & Rubble | Mum’s Gingerbread",
  "linkedin:urn:li:ugcPost:7518292422653775872": "John & Rubble | Grandad’s Steak & Ale Pie",
  "tiktok:7695098233483300118": "Dave & Rubble | The Finishing Touch",
  "facebook:972144875955764": "Amy & Rubble | Pat’s Haddock & Tomato Bake",
  "instagram:4012076930433721307": "Amy & Rubble | Pat’s Haddock & Tomato Bake",
  "instagram:DetwrYaCqPb": "Amy & Rubble | Pat’s Haddock & Tomato Bake",
  "tiktok:7698720517422976278": "Amy & Rubble | Pat’s Haddock & Tomato Bake",
  "youtube:8nLygxUlKSI": "Amy & Rubble | Pat’s Haddock & Tomato Bake",
  "pinterest:1090997079025485320": "Amy & Rubble | Pat’s Haddock & Tomato Bake",
  "facebook:1468100748496559": "Robin & Rubble | Mum’s Gingerbread",
  "instagram:Det_NLki1_q": "Robin & Rubble | Mum’s Gingerbread",
  "tiktok:7698749689704844566": "Robin & Rubble | Mum’s Gingerbread",
  "youtube:k9vY-K06ctw": "Robin & Rubble | Mum’s Gingerbread",
  "pinterest:1090997079025486914": "Robin & Rubble | Mum’s Gingerbread",
  "facebook:2161588158102130": "John & Rubble | Grandad’s Steak & Ale Pie",
  "instagram:4012143021331608558": "John & Rubble | Grandad’s Steak & Ale Pie",
  "instagram:4012140825764650986": "Robin & Rubble | Mum’s Gingerbread",
  "instagram:Det_tIWiHPu": "John & Rubble | Grandad’s Steak & Ale Pie",
  "tiktok:7698750562623294742": "John & Rubble | Grandad’s Steak & Ale Pie",
  "youtube:odhJL4QTMzM": "John & Rubble | Grandad’s Steak & Ale Pie",
  "pinterest:1090997079025487112": "John & Rubble | Grandad’s Steak & Ale Pie"
};

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
  const matched = configuredIdAliases()[`${platform}:${id}`] ?? publishedPostIds[`${platform}:${id}`];
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
  { title: "Dave & Rubble | Dave's Butter Chicken", views: 11 },
  { title: "The Secret Ingredient", views: 11 },
  { title: "Sam & Nadine’s Shepherd’s Pie | OPR", views: 10 },
  { title: "Dave and Rubbles Souffle", views: 8 },
  { title: "Some recipes never leave you.", views: 8 },
  { title: "Dave & Rubble | A Recipe Worth Passing On", views: 7 },
  { title: "Mummy Morris & Rubble | Dave’s Mum’s Beef Casserole", views: 5 },
  { title: "Dave and Rubble Butter Chicken Recipe", views: 4 },
  { title: "Quality Control", views: 12 },
  { title: "OPR Dave and Rubble's steak story", views: 12 },
  { title: "Dave & Rubble | Just a Taste", views: 9 },
  { title: "Dave & Rubble | The Story Behind It", views: 8 },
  { title: "Dave & Rubble | The Handwritten Recipe", views: 8 },
  { title: "Dave & Rubble | The Chicken Nomination", views: 7 },
  { title: "Dave & Rubble | Patience Is the Secret Ingredient", views: 9 },
  { title: "Dave & Rubble | Your Nomination", views: 7 },
  { title: "Dave & Rubble | Dish of the Week: Gautam & Shobha", views: 7 },
  { title: "Dave & Rubble | Five Generations", views: 1 },
  { title: "Dave & Rubble | Before Your Time", views: 0 },
  { title: "Dave & Rubble | The Measuring Spoon", views: 1 },
  { title: "Dave & Rubble | The Family Vote", views: 1 },
  { title: "Dave & Rubble | Ten Out of Ten", views: 1 },
  { title: "Dave & Rubble | The Substitution", views: 1 },
  { title: "Dave & Rubble | Room at the Table", views: 1 },
] as const;

// Verified directly in each channel's creator dashboard. These figures provide
// a fallback when an API is unavailable or a post caption does not match the
// website title. Live API totals override them when available.
export const socialFilmAuditCapturedAt = "2026-08-25T13:45:00+01:00";

export const facebookFilmViews = [
  { title: "Sam & Nadine’s Shepherd’s Pie | A Recipe Worth Passing On", views: 293 },
  { title: "Krishna Anand’s Baingan Ka Bharta | From the Kitchen Drawer", views: 53 },
  { title: "Krishna Anand’s Baingan ka Bharta | A Family Recipe", views: 575 },
  { title: "Dave & Rubble | Your Nomination", views: 27 },
  { title: "Dave & Rubble | Dish of the Week: Gautam & Shobha", views: 54 },
  { title: "Dave & Rubble | The Longest Two Seconds", views: 173 },
  { title: "Dave & Rubble | Butter Chicken Recipe", views: 301 },
  { title: "Dave & Rubble | Quality Control", views: 137 },
  { title: "Dave & Rubble | The Secret Ingredient", views: 186 },
  { title: "Dave & Rubble | Dave's Butter Chicken", views: 332 },
  { title: "Dave & Rubble | Five Generations", views: 36 },
  { title: "Dave & Rubble | Before Your Time", views: 95 },
  { title: "Dave & Rubble | The Measuring Spoon", views: 34 },
  { title: "Dave & Rubble | The Family Vote", views: 25 },
  { title: "Dave & Rubble | Ten Out of Ten", views: 107 },
  { title: "Dave & Rubble | The Substitution", views: 37 },
  { title: "Dave & Rubble | Room at the Table", views: 4 },
] as const;

export const instagramFilmViews = [
  { title: "Krishna Anand’s Baingan ka Bharta | A Family Recipe", views: 179 },
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
  { title: "Dave & Rubble | Five Generations", views: 0 },
  { title: "Dave & Rubble | Before Your Time", views: 0 },
  { title: "Dave & Rubble | The Measuring Spoon", views: 0 },
  { title: "Dave & Rubble | The Family Vote", views: 0 },
  { title: "Dave & Rubble | Ten Out of Ten", views: 0 },
  { title: "Dave & Rubble | The Substitution", views: 0 },
  { title: "Dave & Rubble | Room at the Table", views: 0 },
] as const;

export const tiktokFilmViews = [
  { title: "Dave & Rubble | Dave's Butter Chicken", views: 250 },
  { title: "Dave & Rubble | Quality Control", views: 246 },
  { title: "Dave & Rubble | Finding an Old Family Recipe", views: 243 },
  { title: "Dave & Rubble | The Secret Ingredient", views: 241 },
  { title: "Dave & Rubble | Sam's Soufflé", views: 239 },
  { title: "Dave & Rubble | Five Generations", views: 192 },
  { title: "Dave & Rubble | Before Your Time", views: 199 },
  { title: "Dave & Rubble | The Measuring Spoon", views: 184 },
  { title: "Dave & Rubble | The Family Vote", views: 145 },
  { title: "Dave & Rubble | Ten Out of Ten", views: 187 },
  { title: "Dave & Rubble | The Substitution", views: 133 },
  { title: "Dave & Rubble | Room at the Table", views: 1 },
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
  { title: "Dave & Rubble | Five Generations", views: 3 },
  { title: "Dave & Rubble | Before Your Time", views: 2 },
  { title: "Dave & Rubble | The Measuring Spoon", views: 4 },
  { title: "Dave & Rubble | The Family Vote", views: 0 },
  { title: "Dave & Rubble | Ten Out of Ten", views: 0 },
  { title: "Dave & Rubble | The Substitution", views: 0 },
  { title: "Dave & Rubble | Room at the Table", views: 0 },
] as const;

export type SocialFilmMetricPost = { id?: string; title: string; views: number };

// Reconcile individual posts before summing films. A partial live response must
// not replace the cached total for a film with several posts. Each post is
// counted once; the live value replaces its saved value rather than adding it.
export function reconciledSocialFilmTotals(
  platform: SocialPlatform,
  saved: readonly SocialFilmMetricPost[],
  live: readonly SocialFilmMetricPost[],
  matches: ReadonlyMap<string, string> = new Map(),
  ignored: ReadonlySet<string> = new Set(),
): Map<string, number> {
  const posts = new Map<string, SocialFilmMetricPost>();
  for (const row of [...saved, ...live]) {
    if (row.id) posts.set(row.id, row);
  }
  const totals = new Map<string, number>();
  for (const row of posts.values()) {
    const key = `${platform}:${row.id}`;
    if (ignored.has(key)) continue;
    const title = matches.get(key) ?? matchSocialFilmId(platform, row.id) ?? matchSocialFilmTitle(row.title);
    if (!title || !Number.isFinite(row.views) || row.views < 0) continue;
    totals.set(title, (totals.get(title) ?? 0) + row.views);
  }
  return totals;
}
