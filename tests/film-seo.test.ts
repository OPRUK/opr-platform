import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { films, filmDuration, filmUploadDate } from "../lib/films.ts";

function seconds(timestamp: string) {
  const parts = timestamp.split(":").map(Number);
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

test("all films have their own complete, measurable search metadata", () => {
  assert.ok(films.length > 0);
  assert.equal(new Set(films.map((film) => film.description)).size, films.length);
  assert.equal(new Set(films.map((film) => film.poster)).size, films.length);
  for (const film of films) {
    assert.ok(film.description && film.description.length >= 70 && film.description.length <= 160, film.title);
    assert.ok(film.durationSeconds && film.durationSeconds > 0 && film.durationSeconds < 60, film.title);
    assert.match(filmDuration(film) ?? "", /^PT\d+(?:\.\d+)?S$/);
    assert.ok(film.width && film.height && film.posterWidth && film.posterHeight, film.title);
    assert.ok(film.uploadDate, `${film.title}: date must be sourced, not a launch-day fallback`);
    assert.ok(Date.parse(filmUploadDate(film)) <= Date.now(), film.title);
    assert.ok(film.poster && film.captions && film.transcript, film.title);
    if (film.poster.startsWith("/")) assert.ok(existsSync(resolve(`public${film.poster}`)), film.title);
  }
});

test("every caption track is readable, ordered and inside the actual video duration", () => {
  for (const film of films) {
    const content = readFileSync(resolve(`public${film.captions}`), "utf8");
    assert.ok(content.startsWith("WEBVTT\n"), film.title);
    const cues = content.trim().split(/\n\n+/).slice(1);
    assert.ok(cues.length > 0, film.title);
    let previousEnd = 0;
    for (const cue of cues) {
      const [timing, ...lines] = cue.split("\n");
      const [start, end] = timing.split(" --> ").map(seconds);
      assert.ok(Number.isFinite(start) && start >= previousEnd, `${film.title}: cues must not overlap`);
      assert.ok(end > start && end <= film.durationSeconds!, `${film.title}: cue must fit the file`);
      assert.ok(lines.length > 0 && lines.length <= 2 && lines.every((line) => line.length <= 42), film.title);
      previousEnd = end;
    }
  }
});

test("missing dates fail rather than silently claiming a made-up publication date", () => {
  assert.throws(() => filmUploadDate({}), /documented film publication date/);
});
