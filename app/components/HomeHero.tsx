"use client";

import { ReactNode, useRef, useState } from "react";
import HeroCarousel from "./HeroCarousel";

type HomeHeroProps = {
  children: ReactNode;
};

export default function HomeHero({ children }: HomeHeroProps) {
  const [introductionComplete, setIntroductionComplete] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  function toggleSound() {
    if (!videoRef.current) return;

    videoRef.current.muted = !isMuted;
    setIsMuted((current) => !current);
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
          onEnded={() => setIntroductionComplete(true)}
          onError={() => setIntroductionComplete(true)}
          className="absolute inset-0 h-full w-full object-cover"
          aria-label="Other People's Recipes introduction film"
        >
          <source src="/videos/opr-home-introduction.mp4" type="video/mp4" />
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
