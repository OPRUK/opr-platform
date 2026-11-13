import test from 'node:test';
import assert from 'node:assert/strict';
import { filmPlaybackUrl } from '../lib/film-playback.ts';
import { films } from '../lib/films.ts';

test('all 63 films use the mobile-compatible encodes', () => {
  assert.equal(films.length, 63);
  for (const film of films) {
    const playback = filmPlaybackUrl(film.video);
    assert.ok(playback.includes('/mobile-compatible-20261113/'), film.title);
    assert.equal(new URL(playback).pathname.split('/').pop(), new URL(film.video).pathname.split('/').pop());
    assert.ok(playback.startsWith('https://kag2qb9d0la7upu4.public.blob.vercel-storage.com/'));
  }
});

test('unrelated origins and local media are preserved', () => {
  for (const url of ['/videos/example.mp4', 'https://example.com/video.mp4', 'https://kag2qb9d0la7upu4.public.blob.vercel-storage.com.example.com/video.mp4']) {
    assert.equal(filmPlaybackUrl(url), url);
  }
});
