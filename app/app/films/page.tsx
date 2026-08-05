import type { Metadata } from "next";
import { Eyebrow } from "../_components/primitives";
import MobileTabBar from "../_components/MobileTabBar";
import { films } from "../../../lib/films";

export const metadata: Metadata = { title: "Films" };

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#EED8B2">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export default function FilmsScreen() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-shrink-0 border-b-2 border-[#123C39]/35 px-5 pb-4 pt-16">
        <Eyebrow className="mb-2">The OPR film collection</Eyebrow>
        <h1 className="text-[30px]">Films</h1>
        <p className="mt-2 text-sm opacity-70">Watch on the OPR YouTube channel.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="flex flex-col gap-4">
          {films.map((film) => (
            <a
              key={film.youtubeUrl}
              href={film.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3.5 border-b-2 border-[#123C39]/35 pb-4"
            >
              <div className="relative h-24 w-24 flex-shrink-0 bg-[#F5E6C4]">
                {/* eslint-disable-next-line @next/next/no-img-element -- external YouTube thumbnail URL */}
                <img src={film.thumbnail} alt="" className="h-24 w-24 object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <PlayIcon />
                </div>
              </div>
              <div className="flex min-w-0 flex-col justify-center gap-1.5">
                <div className="text-[17px] font-bold leading-snug">{film.title}</div>
                <div className="text-xs uppercase tracking-[0.1em] opacity-60">Watch on YouTube →</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <MobileTabBar />
    </div>
  );
}
