import test from 'node:test';
import assert from 'node:assert/strict';
import { filmPlaybackUrl } from '../lib/film-playback.ts';
import { films } from '../lib/films.ts';

test('all published films use same-origin media delivery without changing the master filename', () => {
  assert.equal(films.length, 63);
  for (const film of films) {
    const playback = filmPlaybackUrl(film.video);
    assert.ok(playback.startsWith('/film-media/'), film.title);
    assert.equal(playback.slice('/film-media'.length), new URL(film.video).pathname);
  }
});

test('unrelated origins and local media are preserved', () => {
  for (const url of ['/videos/example.mp4', 'https://example.com/video.mp4', 'https://kag2qb9d0la7upu4.public.blob.vercel-storage.com.example.com/video.mp4']) {
    assert.equal(filmPlaybackUrl(url), url);
  }
});
