"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    image: "/images/hero-kitchen-wide.png",
    alt: "The Other People's Recipes kitchen table",
    label: "Other People's Recipes · Every recipe has a story",
  },
  {
    image: "/images/recipes/nana-serbs-rice-pudding-wide.png",
    alt: "Nana Serb's Sunday Rice Pudding",
    label: "Nana Serb's Sunday Rice Pudding · Birmingham",
  },
  {
    image: "/images/recipes/daves-butter-chicken-wide.png",
    alt: "Dave's Butter Chicken",
    label: "Dave's Butter Chicken · New Malden",
  },
  {
    image: "/images/recipes/barbaras-beef-casserole-wide.png",
    alt: "Barbara's Beef Casserole",
    label: "Barbara's Beef Casserole · Swansea",
  },
  {
    image: "/images/recipes/krishna-vantis-baingan-ka-bharta-wide.png",
    alt: "Krishna Vanti's Baingan Ka Bharta",
    label: "Krishna Vanti's Baingan Ka Bharta · From the family kitchen",
  },
];

export default function HeroCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((currentSlide) => (currentSlide + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#0D342F]">
      {slides.map((slide, index) => (
        <Image
          key={slide.image}
          src={slide.image}
          alt={index === activeSlide ? slide.alt : ""}
          fill
          priority={index === 0}
          sizes="100vw"
          className={`object-cover transition-opacity duration-[1800ms] ease-in-out ${
            index === activeSlide ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-[#0A2A27]/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#08231F]/35 via-transparent to-[#08231F]/60" />

      <div className="absolute bottom-9 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 text-xs font-medium tracking-wide text-[#FFF3DF] sm:bottom-11">
        <span className="hidden sm:inline">{slides[activeSlide].label}</span>
        <div className="flex gap-2" aria-label="Featured recipe images">
          {slides.map((slide, index) => (
            <button
              key={slide.image}
              type="button"
              onClick={() => setActiveSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === activeSlide
                  ? "w-7 bg-[#FFD58C]"
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
