"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import HeroCarousel from "./HeroCarousel";
import VideoBrandMark from "./VideoBrandMark";

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

// Each clip ends with the website address on screen, so the crossfade must
// not start until the clip has essentially finished playing — otherwise the
// address dissolves under the incoming clip before it's readable. The blend
// itself (CROSSFADE_MS) can still be smooth; only the trigger point
// (CROSSFADE_LEAD_SECONDS) needs to sit right at the very end.
const CROSSFADE_MS = 350;
const CROSSFADE_LEAD_SECONDS = 0.12;

export default function HomeHero({ children }: HomeHeroProps) {
  const [introductionComplete, setIntroductionComplete] = useState(false);
  const [videosDone, setVideosDone] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  // Two alternating <video> elements so the incoming clip can start playing
  // underneath the outgoing one and we crossfade opacity between them,
  // rather than hard-swapping a single video's `src` (the previous jump cut).
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0);
  const [slotFilm, setSlotFilm] = useState<[number, number]>([0, 1 % introductionFilms.length]);
  const videoRefs = [useRef<HTMLVideoElement | null>(null), useRef<HTMLVideoElement | null>(null)];
  const currentIndexRef = useRef(0);
  const transitioningRef = useRef(false);

  useEffect(() => {
    const el = videoRefs[activeSlot].current;
    if (!el) return;
    el.muted = isMuted;
    void el.play().catch(() => {
      // If a browser blocks autoplay, the poster stays visible for the visitor to start.
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleSound() {
    const current = videoRefs[activeSlot].current;
    if (!current) return;
    current.muted = !isMuted;
    setIsMuted((value) => !value);
  }

  function beginCrossfade() {
    if (transitioningRef.current) return;
    transitioningRef.current = true;

    const currentIndex = currentIndexRef.current;
    const isLastFilm = currentIndex >= introductionFilms.length - 1;

    if (isLastFilm) {
      // Fade the final clip out while the photo carousel fades in underneath
      // (see the wrapping div below), instead of unmounting the video the
      // instant it ends.
      setIntroductionComplete(true);
      window.setTimeout(() => setVideosDone(true), CROSSFADE_MS + 100);
      return;
    }

    const nextIndex = currentIndex + 1;
    const nextSlot: 0 | 1 = activeSlot === 0 ? 1 : 0;
    const previousSlot = activeSlot;

    setSlotFilm(([a, b]) => (nextSlot === 0 ? [nextIndex, b] : [a, nextIndex]));

    // Wait a frame for React to commit the new <source> children before we
    // reload and play — <video> elements don't pick up source changes on
    // their own.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = videoRefs[nextSlot].current;
        if (el) {
          el.muted = isMuted;
          el.load();
          void el.play().catch(() => {});
        }
        setActiveSlot(nextSlot);
        currentIndexRef.current = nextIndex;

        window.setTimeout(() => {
          videoRefs[previousSlot].current?.pause();
          transitioningRef.current = false;
        }, CROSSFADE_MS);
      });
    });
  }

  function handleTimeUpdate(slot: 0 | 1) {
    if (slot !== activeSlot || transitioningRef.current) return;
    const el = videoRefs[slot].current;
    if (!el || !el.duration) return;
    if (el.duration - el.currentTime <= CROSSFADE_LEAD_SECONDS) {
      beginCrossfade();
    }
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

      {!videosDone ? (
        <>
          {([0, 1] as const).map((slot) => {
            const film = introductionFilms[slotFilm[slot]];
            const isVisible = slot === activeSlot && !introductionComplete;
            return (
              <video
                key={slot}
                ref={videoRefs[slot]}
                muted={isMuted}
                playsInline
                preload="auto"
                poster={film.poster}
                onTimeUpdate={() => handleTimeUpdate(slot)}
                onCanPlay={() => {
                  if (slot === activeSlot) {
                    void videoRefs[slot].current?.play().catch(() => {});
                  }
                }}
                className="absolute inset-0 h-full w-full object-contain transition-opacity ease-in-out sm:object-cover"
                style={{ transitionDuration: `${CROSSFADE_MS}ms`, opacity: isVisible ? 1 : 0 }}
                aria-label={film.label}
                aria-hidden={!isVisible}
              >
                <source media="(max-width: 640px)" src={film.mobile} type="video/mp4" />
                <source src={film.desktop} type="video/mp4" />
              </video>
            );
          })}
          <VideoBrandMark className="z-30" />
        </>
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
        style={{ transitionDelay: introductionComplete ? `${CROSSFADE_MS}ms` : "0ms" }}
      >
        {children}
      </div>
    </section>
  );
}
