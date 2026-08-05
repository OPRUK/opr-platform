"use client";

import { useState } from "react";

/**
 * Click-to-play YouTube embed. Starts as a thumbnail (no request to YouTube
 * at all) so a page full of films stays light; only loads the iframe, via
 * youtube-nocookie.com, once the visitor actually presses play — and even
 * then playback stays on this page rather than sending them to youtube.com.
 */
export default function FilmEmbed({
  id,
  title,
  className = "",
}: {
  id: string;
  title: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        className={className}
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play ${title}`}
      className={`group relative block bg-black ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- external YouTube thumbnail URL */}
      <img
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt=""
        className="h-full w-full object-cover"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition group-hover:bg-black/35">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="#FFF3DF">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  );
}
