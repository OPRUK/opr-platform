import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { filmSlug, films, filmUploadDate, getFilmBySlug, getFilmsForRecipe, getRelatedFilms } from "../lib/films.ts";

const newFilmTitles = [
  "Dave & Rubble | The Longest Two Seconds",
  "Dave & Rubble | Butter Chicken Recipe",
];

test("the new Dave and Rubble films have complete website assets", () => {
  for (const title of newFilmTitles) {
    const film = films.find((candidate) => candidate.title === title);

    assert.ok(film, `${title} should be present in the film collection`);
    if (title === "Dave & Rubble | Butter Chicken Recipe") {
      assert.equal(film.recipeSlug, "daves-butter-chicken");
    }
    assert.equal(film.uploadDate, "2026-08-20T12:00:00+00:00");
    assert.ok(film.transcript?.startsWith("Visual description:"));
    assert.ok(film.poster);
    assert.ok(existsSync(resolve(`public${film.video}`)), `${film.video} should exist`);
    assert.ok(existsSync(resolve(`public${film.poster}`)), `${film.poster} should exist`);
  }
});

test("unrelated Dave and Rubble films do not link to the Butter Chicken recipe", () => {
  const titles = [
    "Dave & Rubble | The Longest Two Seconds",
    "Dave & Rubble | The Secret Ingredient",
    "Dave & Rubble | Quality Control",
  ];

  for (const title of titles) {
    const film = films.find((candidate) => candidate.title === title);
    assert.ok(film);
    assert.equal(film.recipeSlug, undefined);
  }
});

test("every VideoObject upload date is a valid ISO timestamp with a timezone", () => {
  for (const film of films) {
    const uploadDate = filmUploadDate(film);
    assert.match(uploadDate, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/);
    assert.ok(Number.isFinite(Date.parse(uploadDate)), `${film.title} should have a valid uploadDate`);
  }
});

test("Gautam and Shobha's Dish of the Week film has captions and an embedded OPR ending", () => {
  const film = films.find((candidate) => candidate.title === "Dave & Rubble | Dish of the Week: Gautam & Shobha");

  assert.ok(film);
  assert.equal(film.recipeSlug, "gautam-and-shobhas-tandoori-aloo-nazakat");
  assert.ok(film.captions);
  assert.ok(existsSync(resolve(`public${film.video}`)));
  assert.ok(existsSync(resolve(`public${film.captions}`)));
});

test("Your Nomination film has exact captions and an embedded OPR ending", () => {
  const film = films.find((candidate) => candidate.title === "Dave & Rubble | Your Nomination");

  assert.ok(film);
  assert.ok(film.transcript?.includes("You do. Every week."));
  assert.ok(film.captions);
  assert.ok(existsSync(resolve(`public${film.video}`)));
  assert.ok(existsSync(resolve(`public${film.captions}`)));
});

test("every film has a unique, reversible watch-page slug and transcript", () => {
  const slugs = films.map(filmSlug);
  assert.equal(new Set(slugs).size, films.length);

  for (const film of films) {
    assert.ok(film.transcript, `${film.title} should have a transcript`);
    assert.equal(getFilmBySlug(filmSlug(film)), film);
  }
});

test("every film watch page links to three other film stories", () => {
  for (const currentFilm of films) {
    const relatedFilms = getRelatedFilms(currentFilm);
    const relatedSlugs = relatedFilms.map(filmSlug);

    assert.equal(relatedFilms.length, 3, `${currentFilm.title} should have three related films`);
    assert.equal(new Set(relatedSlugs).size, relatedFilms.length);
    assert.ok(!relatedSlugs.includes(filmSlug(currentFilm)));
  }
});

test("recipe-linked films can be discovered from their matching recipe page", () => {
  for (const currentFilm of films) {
    if (!currentFilm.recipeSlug) continue;
    assert.ok(
      getFilmsForRecipe(currentFilm.recipeSlug).includes(currentFilm),
      `${currentFilm.title} should be linked from ${currentFilm.recipeSlug}`,
    );
  }
});
