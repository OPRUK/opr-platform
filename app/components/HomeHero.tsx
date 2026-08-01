"use client";

import { ReactNode, useState } from "react";
import HeroCarousel from "./HeroCarousel";

type HomeHeroProps = {
  children: ReactNode;
};

export default function HomeHero({ children }: HomeHeroProps) {
  const [introductionComplete, setIntroductionComplete] = useState(false);

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
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={() => setIntroductionComplete(true)}
          onError={() => setIntroductionComplete(true)}
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        >
          <source src="/videos/opr-home-introduction.mp4" type="video/mp4" />
        </video>
      ) : null}

      <div className="absolute inset-0 z-[1] bg-[#08231F]/35" />
      {children}
    </section>
  );
}
