import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { films } from "../lib/films.ts";

const newFilmTitles = [
  "Dave & Rubble | The Longest Two Seconds",
  "Dave & Rubble | Butter Chicken Recipe",
];

test("the new Dave and Rubble films have complete website assets", () => {
  for (const title of newFilmTitles) {
    const film = films.find((candidate) => candidate.title === title);

    assert.ok(film, `${title} should be present in the film collection`);
    assert.equal(film.recipeSlug, "daves-butter-chicken");
    assert.equal(film.uploadDate, "2026-08-20");
    assert.ok(film.transcript?.startsWith("Visual description:"));
    assert.ok(film.poster);
    assert.ok(existsSync(resolve(`public${film.video}`)), `${film.video} should exist`);
    assert.ok(existsSync(resolve(`public${film.poster}`)), `${film.poster} should exist`);
  }
});
