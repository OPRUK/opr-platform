import test from 'node:test';
import assert from 'node:assert/strict';
import { filmPlaybackUrl } from '../lib/film-playback.ts';
import { films } from '../lib/films.ts';

test('all 63 films bypass the website media proxy', () => {
  assert.equal(films.length, 63);
  for (const film of films) {
    const playback = filmPlaybackUrl(film.video);
    assert.equal(playback, film.video, film.title);
    assert.ok(playback.startsWith('https://kag2qb9d0la7upu4.public.blob.vercel-storage.com/'));
  }
});

test('unrelated origins and local media are preserved', () => {
  for (const url of ['/videos/example.mp4', 'https://example.com/video.mp4', 'https://kag2qb9d0la7upu4.public.blob.vercel-storage.com.example.com/video.mp4']) {
    assert.equal(filmPlaybackUrl(url), url);
  }
});
