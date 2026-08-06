"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import HeroCarousel from "./HeroCarousel";

type HomeHeroProps = {
  children: ReactNode;
};

const introductionFilms = [
  {
    desktop: "/videos/opr-add-your-recipe-promo.mp4",
    mobile: "/videos/opr-add-your-recipe-promo-mobile.mp4",
    poster: "/images/opr-add-your-recipe-promo-poster.jpg",
    label: "Add your family recipe to Other People's Recipes",
  },
  {
    desktop: "/videos/opr-sam-and-nadines-shepherds-pie.mp4",
    mobile: "/videos/opr-sam-and-nadines-shepherds-pie-mobile.mp4",
    poster: "/images/opr-sam-and-nadines-shepherds-pie-poster.jpg",
    label: "Sam & Nadine's Shepherd's Pie | A Recipe Worth Passing On",
  },
  {
    desktop: "/videos/opr-krishna-kitchen-drawer.mp4",
    mobile: "/videos/opr-krishna-kitchen-drawer-mobile.mp4",
    poster: "/images/opr-krishna-kitchen-drawer-poster.jpg",
    label: "Krishna Anand's Baingan Ka Bharta | From the Kitchen Drawer",
  },
];

export default function HomeHero({ children }: HomeHeroProps) {
  const [introductionComplete, setIntroductionComplete] = useState(false);
  const [filmIndex, setFilmIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const completedFilmIndexRef = useRef<number | null>(null);
  const activeFilmIndexRef = useRef(0);
  const activeFilm = introductionFilms[filmIndex];

  useEffect(() => {
    if (introductionComplete || !videoRef.current) return;

    activeFilmIndexRef.current = filmIndex;
    videoRef.current.muted = isMuted;
    void videoRef.current.play().catch(() => {
      // If a browser blocks playback, leave the film visible for the visitor to start.
    });
  }, [filmIndex, introductionComplete, isMuted]);

  function toggleSound() {
    if (!videoRef.current) return;

    videoRef.current.muted = !isMuted;
    setIsMuted((current) => !current);
  }

  function playNextFilm(completedIndex: number) {
    // Browsers can deliver a late `ended` event while React is swapping clips.
    // Only the film currently on screen is allowed to advance the playlist,
    // and each film gets exactly one turn.
    if (
      completedIndex !== activeFilmIndexRef.current ||
      completedFilmIndexRef.current === completedIndex
    ) {
      return;
    }

    completedFilmIndexRef.current = completedIndex;

    if (completedIndex < introductionFilms.length - 1) {
      setFilmIndex(completedIndex + 1);
      return;
    }

    setIntroductionComplete(true);
  }

  return (
    <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#0D342F]">
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          introductionComplete ? "opacity-100" : "opacity-0"
        }`}
      >
        <HeroCarousel />
      </div>

      {!introductionComplete ? (
      <video
        key={activeFilm.desktop}
        ref={videoRef}
          autoPlay
          muted={isMuted}
          playsInline
        preload="auto"
        poster={activeFilm.poster}
        data-film-index={filmIndex}
        onEnded={(event) => playNextFilm(Number(event.currentTarget.dataset.filmIndex))}
        onCanPlay={() => {
          void videoRef.current?.play().catch(() => {
            // Some browsers require the visitor to start a muted video manually.
          });
        }}
          className="absolute inset-0 h-full w-full object-contain sm:object-cover"
          aria-label={activeFilm.label}
        >
          <source
            media="(max-width: 640px)"
            src={activeFilm.mobile}
            type="video/mp4"
          />
          <source src={activeFilm.desktop} type="video/mp4" />
        </video>
      ) : null}

      <div className="absolute inset-0 z-[1] bg-[#08231F]/35" />
      {!introductionComplete ? (
        <button
          type="button"
          onClick={toggleSound}
          className="absolute bottom-7 right-7 z-20 rounded-full border border-white/70 bg-[#08231F]/75 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-[#123C39]"
          aria-label={isMuted ? "Turn sound on" : "Mute introduction film"}
        >
          {isMuted ? "Turn sound on" : "Mute sound"}
        </button>
      ) : null}
      <div
        className={`relative z-10 transition-all duration-1000 ${
          introductionComplete
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        {children}
      </div>
    </section>
  );
}
