"use client";

import { ReactNode, useEffect, useRef, useState, useSyncExternalStore } from "react";
import HeroCarousel from "./HeroCarousel";
import VideoBrandMark from "./VideoBrandMark";
import { optimizedPoster } from "../../lib/optimized-poster";

type HomeHeroProps = {
  children: ReactNode;
};

const introductionFilms = [
  {
    desktop: "/videos/opr-add-your-recipe-promo.mp4",
    mobile: "/videos/opr-add-your-recipe-promo-mobile.mp4",
    poster: optimizedPoster("/images/opr-add-your-recipe-promo-poster.jpg"),
    label: "Add your family recipe to Other People's Recipes",
  },
  {
    desktop: "/videos/opr-sam-and-nadines-shepherds-pie.mp4",
    mobile: "/videos/opr-sam-and-nadines-shepherds-pie-mobile.mp4",
    poster: optimizedPoster("/images/opr-sam-and-nadines-shepherds-pie-poster.jpg"),
    label: "Sam & Nadine's Shepherd's Pie | A Recipe Worth Passing On",
  },
  {
    desktop: "/videos/opr-krishna-kitchen-drawer.mp4",
    mobile: "/videos/opr-krishna-kitchen-drawer-mobile.mp4",
    poster: optimizedPoster("/images/opr-krishna-kitchen-drawer-poster.jpg"),
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

// Visitors who've asked the OS for less motion, or the browser for less
// data, should land on a static poster rather than have ~3 film downloads
// kick off and autoplay regardless.
function prefersStaticHero() {
  if (typeof window === "undefined") return false;
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  return reducedMotion || nav.connection?.saveData === true;
}

function subscribeToStaticHeroPreference(onPreferenceChange: () => void) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const connection = (
    navigator as Navigator & {
      connection?: {
        addEventListener?: (type: "change", listener: () => void) => void;
        removeEventListener?: (type: "change", listener: () => void) => void;
      };
    }
  ).connection;

  reducedMotion.addEventListener("change", onPreferenceChange);
  connection?.addEventListener?.("change", onPreferenceChange);

  return () => {
    reducedMotion.removeEventListener("change", onPreferenceChange);
    connection?.removeEventListener?.("change", onPreferenceChange);
  };
}

function getServerStaticHeroPreference() {
  return false;
}

export default function HomeHero({ children }: HomeHeroProps) {
  // useSyncExternalStore supplies the same server snapshot during hydration,
  // then updates from browser-only preferences without a markup mismatch.
  const skipAutoplay = useSyncExternalStore(
    subscribeToStaticHeroPreference,
    prefersStaticHero,
    getServerStaticHeroPreference,
  );
  const [introductionComplete, setIntroductionComplete] = useState(false);
  const [videosDone, setVideosDone] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  // Two alternating <video> elements so the incoming clip can start playing
  // underneath the outgoing one and we crossfade opacity between them,
  // rather than hard-swapping a single video's `src` (the previous jump cut).
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0);
  const [slotFilm, setSlotFilm] = useState<[number, number]>([0, 1 % introductionFilms.length]);
  const videoRefs = useRef<[HTMLVideoElement | null, HTMLVideoElement | null]>([null, null]);
  const currentIndexRef = useRef(0);
  const transitioningRef = useRef(false);
  const transitionTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Re-read here as well as using the store value. On the first hydrated
    // render the store intentionally matches the server snapshot; this guard
    // prevents even that brief render from starting a film for static users.
    if (prefersStaticHero()) {
      videoRefs.current[0]?.pause();
      videoRefs.current[1]?.pause();
      return;
    }

    const el = videoRefs.current[activeSlot];
    if (!el) return;
    el.muted = isMuted;
    void el.play().catch(() => {
      // If a browser blocks autoplay, the poster stays visible for the visitor to start.
    });
    // The film switcher starts subsequent slots itself. This effect only
    // responds when the visitor changes their motion/data preference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipAutoplay]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (skipAutoplay || !window.matchMedia("(max-width: 640px)").matches) return;
    const timer = window.setTimeout(() => {
      setIntroductionComplete(true);
      videoRefs.current[0]?.pause();
      videoRefs.current[1]?.pause();
    }, MOBILE_INTRO_MS);
    return () => window.clearTimeout(timer);
  }, [skipAutoplay]);

  function toggleSound() {
    const current = videoRefs.current[activeSlot];
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
        const el = videoRefs.current[nextSlot];
        if (el) {
          el.muted = isMuted;
          el.currentTime = 0;
          el.load();
          void el.play().catch(() => {});
        }
        setActiveSlot(nextSlot);
        currentIndexRef.current = nextIndex;
        window.setTimeout(() => {
          videoRefs.current[previousSlot]?.pause();
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
    videoRefs.current[activeSlot]?.pause();
    transitionTimerRef.current = window.setTimeout(() => {
      transitionTimerRef.current = null;
      beginCrossfade();
    }, FINAL_FRAME_HOLD_MS);
  }

  function handleTimeUpdate(slot: 0 | 1) {
    if (slot !== activeSlot || transitioningRef.current) return;
    const el = videoRefs.current[slot];
    if (!el || !el.duration) return;
    if (el.duration - el.currentTime <= END_TRIM_SECONDS) {
      moveToNextFilm();
    }
  }

  return (
    <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#123C39]">
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          introductionComplete ? "opacity-100" : "opacity-0"
        }`}
      >
        <HeroCarousel paused={skipAutoplay} />
      </div>

      {!videosDone ? (
        <>
          {([0, 1] as const).map((slot) => {
            const film = introductionFilms[slotFilm[slot]];
            const isVisible = slot === activeSlot && !introductionComplete;
            return (
              <video
                key={slot}
                ref={(element) => {
                  videoRefs.current[slot] = element;
                }}
                muted={isMuted}
                playsInline
                // Always "none": `skipAutoplay` is only known once this
                // component hydrates on the client (matchMedia/connection
                // aren't available during SSR), so a server-rendered
                // preload="auto" would already have told the browser to
                // start fetching before React ever got a chance to check
                // prefers-reduced-motion / saveData — the fetch doesn't
                // wait for JS. Eager loading for the active slot instead
                // comes entirely from the explicit play() call below (and
                // load()+play() in beginCrossfade for the next slot), both
                // already gated on !skipAutoplay.
                preload="none"
                // Tells the browser the active slot's poster (the LCP
                // candidate) matters more than everything else competing
                // for bandwidth — pairs with the preload hint in page.tsx,
                // which gets the browser started on it before this
                // component has even hydrated. Not yet in React's DOM
                // types for <video>, though browsers support it there.
                {...({ fetchPriority: slot === activeSlot ? "high" : "auto" } as Record<string, string>)}
                poster={film.poster}
                onTimeUpdate={() => handleTimeUpdate(slot)}
                onEnded={() => {
                  if (slot === activeSlot) moveToNextFilm();
                }}
                className="absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out"
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
      {!introductionComplete && !skipAutoplay ? (
        <button
          type="button"
          onClick={toggleSound}
          className="home-hero-sound-control absolute bottom-7 right-7 z-20 rounded-full border border-white/70 bg-[#08231F]/75 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-[#123C39]"
          aria-label={isMuted ? "Turn sound on" : "Mute introduction film"}
        >
          {isMuted ? "Turn sound on" : "Mute sound"}
        </button>
      ) : null}
      {/* Visible immediately on mobile (base, unprefixed classes below) —
          waiting for the film intro to finish before painting the heading
          and CTA was directly responsible for a ~4s mobile LCP delay.
          Desktop keeps the original crossfade-in-after-intro choreography
          via the sm: breakpoint. */}
      <div
        className={`home-hero-copy relative z-10 pointer-events-auto translate-y-0 opacity-100 transition-all duration-1000 ${
          introductionComplete || skipAutoplay
            ? "sm:translate-y-0 sm:opacity-100 sm:pointer-events-auto"
            : "sm:pointer-events-none sm:translate-y-4 sm:opacity-0"
        }`}
        style={{ transitionDelay: introductionComplete ? `${CROSSFADE_MS}ms` : "0ms" }}
      >
        {children}
      </div>
    </section>
  );
}
