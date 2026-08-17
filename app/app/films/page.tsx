import type { Metadata } from "next";
import { Eyebrow } from "../_components/primitives";
import MobileTabBar from "../_components/MobileTabBar";
import FilmEmbed from "../../components/FilmEmbed";
import { films } from "../../../lib/films";

export const metadata: Metadata = { title: "Films" };

export default function FilmsScreen() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-shrink-0 border-b-2 border-[#123C39]/35 px-5 pb-4 pt-16">
        <Eyebrow className="mb-2">The OPR film collection</Eyebrow>
        <h1 className="font-display text-[30px]">Films</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="flex flex-col gap-6">
          {films.map((film) => (
            <article key={film.video}>
              <FilmEmbed video={film.video} poster={film.poster} captions={film.captions} title={film.title} className="aspect-video w-full" />
              <h2 className="font-display mt-3 text-[17px] font-bold leading-snug">{film.title}</h2>
              {film.transcript ? (
                <details className="mt-3 border-t border-[#123C39]/25 pt-3 text-sm">
                  <summary className="cursor-pointer font-semibold">Read transcript</summary>
                  <div className="mt-2 whitespace-pre-wrap leading-6">{film.transcript}</div>
                </details>
              ) : null}
            </article>
          ))}
        </div>
      </div>

      <MobileTabBar />
    </div>
  );
}
