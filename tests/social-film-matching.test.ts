import assert from "node:assert/strict";
import test from "node:test";
import { matchSocialFilmId, matchSocialFilmTitle, reconciledSocialFilmTotals } from "../lib/social-film-matching.ts";

test("matches approved Pinterest aliases to canonical website film names", () => {
  assert.equal(matchSocialFilmTitle("Quality Control"), "Dave & Rubble | Quality Control");
  assert.equal(
    matchSocialFilmTitle("OPR Dave and Rubble's steak story"),
    "Dave & Rubble | Some Recipes Are Made with a Little Extra Company",
  );
  assert.equal(
    matchSocialFilmTitle("Dave and Rubbles Souffle"),
    "Dave & Rubble | Sam's Soufflé",
  );
});

test("excludes the agreed Every Recipe Has a Story pins", () => {
  assert.equal(matchSocialFilmTitle("Every Recipe Has a Story | Other Peoples Recipes"), null);
});

test("matches live social captions and channel-specific titles", () => {
  assert.equal(
    matchSocialFilmTitle("Rubble's relationship with time needs work. Every recipe has a story."),
    "Dave & Rubble | The Longest Two Seconds",
  );
  assert.equal(
    matchSocialFilmTitle('Some recipes get "adjusted." Rubble never lets it slide. 🐾'),
    "Dave & Rubble | Butter Chicken Recipe",
  );
  assert.equal(
    matchSocialFilmTitle("OPR Dave and Rubble Gautam Shobha dish of the week"),
    "Dave & Rubble | Dish of the Week: Gautam & Shobha",
  );
  assert.equal(
    matchSocialFilmTitle("Dave says the recipe needs one secret ingredient. Rubble doesn’t need long to decide."),
    "Dave & Rubble | The Secret Ingredient",
  );
});

test("matches the new Dave and Rubble films from their social caption openings", () => {
  assert.equal(matchSocialFilmTitle("Some recipes are too important to lose."), "Dave & Rubble | The Handwritten Recipe");
  assert.equal(matchSocialFilmTitle("A recipe tells you what to cook."), "Dave & Rubble | The Story Behind It");
  assert.equal(matchSocialFilmTitle("The recipe tells you what to cook."), "Dave & Rubble | The Story Behind It");
  assert.equal(matchSocialFilmTitle("Every kitchen needs a taste tester."), "Dave & Rubble | Just a Taste");
  assert.equal(matchSocialFilmTitle("That’s ready for the table."), "Dave & Rubble | Just a Taste");
  assert.equal(matchSocialFilmTitle("Every recipe has a secret ingredient."), "Dave & Rubble | Patience Is the Secret Ingredient");
  assert.equal(matchSocialFilmTitle("Which dish should Dave and Rubble cook next?"), "Dave & Rubble | The Chicken Nomination");
});

test("stable platform IDs override inconsistent post titles", () => {
  process.env.OPR_SOCIAL_FILM_IDS = JSON.stringify({
    "youtube:MkSF7Ky8Ybc": "Dave & Rubble | The Handwritten Recipe",
  });
  assert.equal(matchSocialFilmId("youtube", "MkSF7Ky8Ybc"), "Dave & Rubble | The Handwritten Recipe");
  delete process.env.OPR_SOCIAL_FILM_IDS;
});


test("matches today's contributor captions and stable IDs", () => {
  assert.equal(matchSocialFilmTitle("“My mum Pat actually hated cooking.” ❤️"), "Amy & Rubble | Pat’s Haddock & Tomato Bake");
  assert.equal(matchSocialFilmTitle("No old photographs. Plenty of memories. ❤️"), "Robin & Rubble | Mum’s Gingerbread");
  assert.equal(matchSocialFilmId("tiktok", "7698750562623294742"), "John & Rubble | Grandad’s Steak & Ale Pie");
});

test("reconciles post IDs before totals, preserving posts missing from partial refreshes", () => {
  const title = "Dave & Rubble | Quality Control";
  const saved = [{ id: "a", title, views: 100 }, { id: "b", title, views: 200 }];
  const live = [{ id: "a", title, views: 110 }];
  assert.equal(reconciledSocialFilmTotals("facebook", saved, live).get(title), 310);
  assert.equal(reconciledSocialFilmTotals("facebook", saved, live, new Map(), new Set(["facebook:a"])).get(title), 200);
  assert.equal(reconciledSocialFilmTotals("facebook", [], [{ id: "x", title, views: NaN }]).size, 0);
});

test("matches the current Meta caption openings after media replacement", () => {
  assert.equal(matchSocialFilmTitle("Dave asked for a second opinion. Rubble was ready. Dave had other ideas. 🍲"), "Dave & Rubble | Taste Test");
  assert.equal(matchSocialFilmTitle("A family recipe passed down for years… and Rubble still wants to know whether he made the notes."), "Dave & Rubble | Does It Mention Me?");
  assert.equal(matchSocialFilmTitle("Rubble’s been ready for dinner since breakfast. ⏲️"), "Dave & Rubble | The Timer");
});
