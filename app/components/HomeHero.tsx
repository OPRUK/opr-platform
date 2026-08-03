"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import HeroCarousel from "./HeroCarousel";

type HomeHeroProps = {
  children: ReactNode;
};

const introductionFilm = {
  desktop: "/videos/opr-home-introduction-complete.mp4",
  mobile: "/videos/opr-home-introduction-complete-mobile.mp4",
  poster: "/images/opr-home-introduction-poster.jpg",
  label: "Other People's Recipes introduction films",
};

export default function HomeHero({ children }: HomeHeroProps) {
  const [introductionComplete, setIntroductionComplete] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (introductionComplete || !videoRef.current) return;

    videoRef.current.muted = isMuted;
    void videoRef.current.play().catch(() => {
      // If a browser blocks playback, leave the film visible for the visitor to start.
    });
  }, [introductionComplete, isMuted]);

  function toggleSound() {
    if (!videoRef.current) return;

    videoRef.current.muted = !isMuted;
    setIsMuted((current) => !current);
  }

  function finishIntroduction() {
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
          ref={videoRef}
          autoPlay
          muted={isMuted}
          playsInline
          preload="auto"
          poster={introductionFilm.poster}
          onEnded={finishIntroduction}
          onError={finishIntroduction}
          className="absolute inset-0 h-full w-full object-contain sm:object-cover"
          aria-label={introductionFilm.label}
        >
          <source
            media="(max-width: 640px)"
            src={introductionFilm.mobile}
            type="video/mp4"
          />
          <source src={introductionFilm.desktop} type="video/mp4" />
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
