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

export default function HeroCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  // The slide being faded out. Kept mounted only for the duration of the
  // crossfade so the incoming slide always has something to fade over —
  // without it, swapping which index counts as "active" unmounts the
  // outgoing image in the same render, and the new one fades in over the
  // plain background instead of crossfading with it.
  const [previousSlide, setPreviousSlide] = useState<number | null>(null);

  function goToSlide(index: number) {
    setActiveSlide((current) => {
      if (current === index) return current;
      setPreviousSlide(current);
      return index;
    });
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => {
        setPreviousSlide(current);
        return (current + 1) % slides.length;
      });
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

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
        return (
          <Image
            key={slide.image}
            src={slide.image}
            alt={index === activeSlide ? slide.alt : ""}
            fill
            quality={65}
            // This carousel sits behind the intro video (HomeHero renders it
            // at opacity-0 until the video sequence finishes, several+
            // seconds in) — eagerly preloading its first slide competed with
            // the actual LCP-critical video poster for the same bandwidth
            // during the crucial first paint, for content nobody sees yet.
            sizes="100vw"
            className={`object-cover transition-opacity ease-in-out ${
              index === activeSlide ? "opacity-100" : "opacity-0"
            }`}
            style={{ transitionDuration: `${CROSSFADE_MS}ms` }}
          />
        );
      })}

      <div className="absolute inset-0 bg-[#08231F]/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#08231F]/35 via-transparent to-[#08231F]/60" />

      <div className="absolute bottom-9 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 text-xs font-medium tracking-wide text-[#FFF3DF] sm:bottom-11">
        <span className="hidden sm:inline">{slides[activeSlide].label}</span>
        <div className="flex gap-2" role="group" aria-label="Featured recipe images">
          {slides.map((slide, index) => (
            <button
              key={slide.image}
              type="button"
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === activeSlide
                  ? "w-7 bg-[#DDB765]"
                  : "w-2 bg-white/60 hover:bg-white"
              }`}
              aria-label={`Show ${slide.alt}`}
              aria-current={index === activeSlide ? "true" : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
