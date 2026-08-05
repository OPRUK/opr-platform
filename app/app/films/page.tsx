import type { Metadata } from "next";
import { Divider, Eyebrow } from "../_components/primitives";
import MobileTabBar from "../_components/MobileTabBar";
import { films } from "../../../lib/films";

export const metadata: Metadata = { title: "Films" };

export default function FilmsScreen() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-shrink-0 border-b-2 border-[#123C39]/35 px-5 pb-4 pt-16">
        <Eyebrow className="mb-2">The OPR film collection</Eyebrow>
        <h1 className="text-[30px]">Films</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="flex flex-col gap-8">
          {films.map((film) => (
            <article key={film.title}>
              <div className="bg-black">
                <video
                  className="aspect-video w-full"
                  controls
                  playsInline
                  preload="metadata"
                  poster={film.poster}
                >
                  <source src={film.source} type="video/mp4" />
                </video>
              </div>
              <Eyebrow className="mb-1.5 mt-3.5">{film.label}</Eyebrow>
              <h2 className="mb-2 text-[20px] font-bold leading-tight">{film.title}</h2>
              <p className="text-sm leading-[1.6] opacity-80">{film.synopsis}</p>
              <Divider className="mt-6" />
            </article>
          ))}
        </div>
      </div>

      <MobileTabBar />
    </div>
  );
}
