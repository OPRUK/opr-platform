"use client";

import { useState } from "react";
import VideoBrandMark from "./VideoBrandMark";

/**
 * Click-to-play video, self-hosted on Supabase Storage. Starts as a poster
 * image so a page full of films stays light; the actual video only loads
 * once the visitor presses play, and playback never leaves this page.
 */
export default function FilmEmbed({
  video,
  poster,
  title,
  className = "",
}: {
  video: string;
  poster?: string;
  title: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className={`relative ${className}`}>
        <video
          className="h-full w-full"
          src={video}
          controls
          autoPlay
          playsInline
          preload="metadata"
          poster={poster}
        >
          Your browser does not support video playback.
        </video>
        <VideoBrandMark />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play ${title}`}
      className={`group relative block bg-black ${className}`}
    >
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element -- self-hosted poster, no configured Image domain
        <img src={poster} alt="" className="h-full w-full object-cover" />
      ) : null}
      <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition group-hover:bg-black/35">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="#FFF3DF">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  );
}
