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

// Keep the transition deliberately short and stop each film a fraction early.
// That removes abrupt last frames before the following film begins.
const CROSSFADE_MS = 500;
const END_TRIM_SECONDS = 0.2;
const FINAL_FRAME_HOLD_MS = 250;

// On mobile, waiting for all three intro films to finish before the CTAs
// appear (~10s+) costs conversions from visitors landing via a social link.
// Cut the intro short on small screens only; desktop keeps the full sequence.
const MOBILE_INTRO_MS = 4000;

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
  const transitionTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const el = videoRefs[activeSlot].current;
    if (!el) return;
    el.muted = isMuted;
    void el.play().catch(() => {
      // If a browser blocks autoplay, the poster stays visible for the visitor to start.
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 640px)").matches) return;
    const timer = window.setTimeout(() => {
      setIntroductionComplete(true);
      videoRefs[0].current?.pause();
      videoRefs[1].current?.pause();
    }, MOBILE_INTRO_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleSound() {
    const current = videoRefs[activeSlot].current;
    if (!current) return;
    current.muted = !isMuted;
    setIsMuted((value) => !value);
  }

  function beginCrossfade() {
    const currentIndex = currentIndexRef.current;
    const isLastFilm = currentIndex >= introductionFilms.length - 1;

    if (isLastFilm) {
      // Fade the final frame into the photo carousel rather than leaving a
      // hard cut at the end of the films.
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
          el.currentTime = 0;
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

  function moveToNextFilm() {
    if (transitioningRef.current) return;
    transitioningRef.current = true;

    // Finish slightly early, then let the final visual breathe for a moment
    // before crossfading into the next film. The films now remain unobstructed.
    videoRefs[activeSlot].current?.pause();
    transitionTimerRef.current = window.setTimeout(() => {
      transitionTimerRef.current = null;
      beginCrossfade();
    }, FINAL_FRAME_HOLD_MS);
  }

  function handleTimeUpdate(slot: 0 | 1) {
    if (slot !== activeSlot || transitioningRef.current) return;
    const el = videoRefs[slot].current;
    if (!el || !el.duration) return;
    if (el.duration - el.currentTime <= END_TRIM_SECONDS) {
      moveToNextFilm();
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
                onEnded={() => {
                  if (slot === activeSlot) moveToNextFilm();
                }}
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
