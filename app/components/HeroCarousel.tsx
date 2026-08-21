"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    image: "/images/hero-kitchen-wide.webp",
    alt: "The Other People's Recipes kitchen table",
    label: "Other People's Recipes · Every Recipe has a Story",
  },
  {
    image: "/images/recipes/nana-serbs-rice-pudding-wide.webp",
    alt: "Nana Serb's Sunday Rice Pudding",
    label: "Nana Serb's Sunday Rice Pudding · Birmingham",
  },
  {
    image: "/images/recipes/daves-butter-chicken-wide.webp",
    alt: "Dave's Butter Chicken",
    label: "Dave's Butter Chicken · New Malden",
  },
  {
    image: "/images/recipes/barbaras-beef-casserole-wide.webp",
    alt: "Barbara's Beef Casserole",
    label: "Barbara's Beef Casserole · Swansea",
  },
  {
    image: "/images/recipes/krishna-vantis-baingan-ka-bharta-wide.webp",
    alt: "Krishna Anand's Baingan ka Bharta",
    label: "Krishna Anand's Baingan ka Bharta · New Delhi",
  },
  {
    image: "/images/recipes/sudeshs-bhindi-wide.webp",
    alt: "Sudesh's Bhindi",
    label: "Sudesh's Bhindi · Maidenhead",
  },
];

const CROSSFADE_MS = 1800;
const SLIDE_HOLD_MS = 6000;

type HeroCarouselProps = {
  paused?: boolean;
  // True only when this carousel's first slide is the page's actual LCP
  // element (mobile home hero, which skips the video intro entirely) — see
  // the sizes/priority comment below for why this defaults to off.
  priority?: boolean;
};

export default function HeroCarousel({ paused = false, priority = false }: HeroCarouselProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  // The slide being faded out. Kept mounted only for the duration of the
  // crossfade so the incoming slide always has something to fade over —
  // without it, swapping which index counts as "active" unmounts the
  // outgoing image in the same render, and the new one fades in over the
  // plain background instead of crossfading with it.
  const [previousSlide, setPreviousSlide] = useState<number | null>(null);
  const isTransitioning = previousSlide !== null;

  function goToSlide(index: number) {
    if (paused || isTransitioning || activeSlide === index) return;
    setPreviousSlide(activeSlide);
    setActiveSlide(index);
  }

  useEffect(() => {
    if (paused || isTransitioning) return;

    // Schedule from the end of the previous transition. A timeout avoids an
    // automatic change landing halfway through a visitor's manual change.
    const timer = window.setTimeout(() => {
      setPreviousSlide(activeSlide);
      setActiveSlide((activeSlide + 1) % slides.length);
    }, SLIDE_HOLD_MS);

    return () => window.clearTimeout(timer);
  }, [activeSlide, isTransitioning, paused]);

  useEffect(() => {
    if (previousSlide === null) return;
    const timer = window.setTimeout(() => setPreviousSlide(null), CROSSFADE_MS);
    return () => window.clearTimeout(timer);
  }, [previousSlide]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#123C39]">
      {slides.map((slide, index) => {
        // Only the active slide and, briefly during a transition, the one
        // it's crossfading from are mounted — with all six always in the
        // DOM, Next downloaded every slide's full-size image on first
        // paint even though five of them sit behind the intro video (still
        // hidden below at opacity-0) and wouldn't be visible for 30+
        // seconds, if ever.
        if (index !== activeSlide && index !== previousSlide) return null;
        const isOutgoing = index === previousSlide;
        return (
          <Image
            key={slide.image}
            src={slide.image}
            alt={index === activeSlide ? slide.alt : ""}
            fill
            quality={65}
            // On desktop/join-our-table this carousel sits behind (or is)
            // secondary content, so it's never eagerly preloaded by default —
            // that would compete with the real LCP element for bandwidth.
            // The one exception is the mobile home hero, which skips the
            // video intro entirely and hands this its first slide as the
            // actual LCP image via `priority`.
            priority={priority && index === activeSlide}
            sizes="100vw"
            className={`object-cover transition-opacity ease-in-out ${
              isOutgoing ? "opacity-0" : "opacity-100"
            }`}
            // The outgoing image must stay above the incoming image while it
            // fades. Without fixed layer ordering, forward transitions mount
            // the fully opaque incoming image on top and look like hard cuts.
            style={{
              transitionDuration: `${CROSSFADE_MS}ms`,
              zIndex: isOutgoing ? 1 : 0,
            }}
          />
        );
      })}

      <div className="absolute inset-0 z-[2] bg-[#08231F]/55" />
      <div className="absolute inset-0 z-[2] bg-gradient-to-b from-[#08231F]/35 via-transparent to-[#08231F]/60" />

      <div className="absolute bottom-7 left-1/2 z-10 flex w-full max-w-4xl -translate-x-1/2 flex-col items-center justify-center gap-3 px-6 text-center text-xs font-medium leading-5 tracking-wide text-[#FFF3DF] sm:bottom-10 sm:flex-row sm:gap-4">
        <span className="hidden text-balance sm:inline">{slides[activeSlide].label}</span>
        <div
          className="flex shrink-0 gap-2"
          role="group"
          aria-label="Featured recipe images"
          aria-busy={isTransitioning || undefined}
        >
          {slides.map((slide, index) => (
            <button
              key={slide.image}
              type="button"
              onClick={() => goToSlide(index)}
              disabled={paused || isTransitioning}
              className={`h-2 rounded-full transition-all ${
                index === activeSlide
                  ? "w-7 bg-[#DDB765]"
                  : "w-2 bg-white/60 hover:bg-white"
              } disabled:cursor-wait disabled:hover:bg-white/60`}
              aria-label={`Show ${slide.alt}`}
              aria-current={index === activeSlide ? "true" : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
