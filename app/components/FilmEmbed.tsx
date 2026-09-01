"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import VideoBrandMark from "./VideoBrandMark";
import { sendAnalyticsEvent } from "../../lib/attribution-client";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
}

/** Poster card that opens the film in a minimal, accessible cinema-style player. */
export default function FilmEmbed({
  video,
  poster,
  captions,
  title,
  className = "",
}: {
  video: string;
  poster?: string;
  captions?: string;
  title: string;
  className?: string;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ambientVideoRef = useRef<HTMLVideoElement>(null);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guards against onPlay firing a "film_play" event every time a visitor
  // pauses and resumes — only the first play of a viewing session counts.
  const hasSentPlayEvent = useRef(false);
  const [open, setOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [autoplayMuted, setAutoplayMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenSupported, setFullscreenSupported] = useState(false);

  function keepControlsVisible() {
    setControlsVisible(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setControlsVisible(false);
    }, 2200);
  }

  function closeFilm() {
    videoRef.current?.pause();
    ambientVideoRef.current?.pause();
    if (document.fullscreenElement === stageRef.current) {
      void document.exitFullscreen().catch(() => undefined);
    }
    setOpen(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setAutoplayMuted(false);
    hasSentPlayEvent.current = false;
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }

  function syncAmbientVideo() {
    const player = videoRef.current;
    const ambient = ambientVideoRef.current;
    if (!player || !ambient) return;

    if (Math.abs(ambient.currentTime - player.currentTime) > 0.2) {
      ambient.currentTime = player.currentTime;
    }
    ambient.playbackRate = player.playbackRate;
  }

  async function toggleFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
      return;
    }
    await stageRef.current?.requestFullscreen().catch(() => undefined);
    keepControlsVisible();
  }

  async function openFilm() {
    setMuted(false);
    setAutoplayMuted(false);
    flushSync(() => setOpen(true));

    const player = videoRef.current;
    if (!player) return;
    player.muted = false;

    try {
      await player.play();
    } catch {
      // Safari may reject sound-on playback. Muted playback is allowed, so the
      // visitor still gets an immediate film with a clear route to sound.
      player.muted = true;
      setMuted(true);
      setAutoplayMuted(true);
      await player.play().catch(() => undefined);
    }
    keepControlsVisible();
  }

  function togglePlayback() {
    const player = videoRef.current;
    if (!player) return;
    if (player.paused) {
      void player.play();
    }
    else player.pause();
    keepControlsVisible();
  }

  function toggleMuted() {
    const player = videoRef.current;
    if (!player) return;
    player.muted = !player.muted;
    setMuted(player.muted);
    if (!player.muted) setAutoplayMuted(false);
    keepControlsVisible();
  }

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        // The first Escape leaves browser full screen; a second closes the film.
        if (document.fullscreenElement) return;
        closeFilm();
      }
      setControlsVisible(true);
    }

    function onFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === stageRef.current);
    }

    setFullscreenSupported(Boolean(stageRef.current?.requestFullscreen));
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.body.style.overflow = previousOverflow;
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, [open]);

  const modal = open && typeof document !== "undefined" ? createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] bg-black"
      onPointerMove={keepControlsVisible}
      onClick={closeFilm}
    >
      <div
        ref={stageRef}
        className="relative h-[100dvh] w-screen overflow-hidden bg-black"
        onClick={(event) => {
          event.stopPropagation();
          keepControlsVisible();
        }}
      >
        <video
          ref={ambientVideoRef}
          aria-hidden="true"
          tabIndex={-1}
          className="pointer-events-none absolute -inset-[8%] h-[116%] w-[116%] scale-110 object-cover opacity-55 blur-3xl"
          src={video}
          playsInline
          muted
          preload="auto"
          poster={poster}
          controls={false}
        />
        <div className="pointer-events-none absolute inset-0 bg-[#041513]/55" aria-hidden="true" />

        <video
          ref={videoRef}
          aria-label={title}
          className="relative z-10 h-full w-full object-contain"
          src={video}
          playsInline
          preload="auto"
          poster={poster}
          controls={false}
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          onPlay={() => {
            setIsPlaying(true);
            syncAmbientVideo();
            void ambientVideoRef.current?.play().catch(() => undefined);
            if (!hasSentPlayEvent.current) {
              hasSentPlayEvent.current = true;
              sendAnalyticsEvent("film_play", video);
            }
          }}
          onPause={() => {
            setIsPlaying(false);
            setControlsVisible(true);
            ambientVideoRef.current?.pause();
          }}
          onEnded={() => {
            setIsPlaying(false);
            setControlsVisible(true);
            ambientVideoRef.current?.pause();
            sendAnalyticsEvent("film_watched", video);
          }}
          onTimeUpdate={(event) => {
            setCurrentTime(event.currentTarget.currentTime);
            syncAmbientVideo();
          }}
          onSeeking={syncAmbientVideo}
          onRateChange={syncAmbientVideo}
          onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        >
          {captions ? <track kind="captions" src={captions} srcLang="en" label="English captions" default /> : null}
          Your browser does not support video playback.
        </video>
        <VideoBrandMark className="z-20" />

        <div
          className={`absolute inset-x-0 top-0 z-30 flex items-start justify-between bg-gradient-to-b from-black/75 to-transparent p-4 pb-16 transition-opacity duration-300 sm:p-6 sm:pb-20 ${
            controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onFocusCapture={() => setControlsVisible(true)}
        >
          <p className="line-clamp-2 max-w-[70vw] pt-2 text-sm font-semibold text-white sm:text-base">{title}</p>
          <div className="flex gap-2">
            {fullscreenSupported ? (
              <button
                type="button"
                onClick={() => void toggleFullscreen()}
                aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
                tabIndex={controlsVisible ? 0 : -1}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/45 bg-black/50 text-white transition hover:bg-white hover:text-[#08231F] focus-visible:bg-white focus-visible:text-[#08231F]"
              >
                {isFullscreen ? (
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
                  </svg>
                ) : (
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
                  </svg>
                )}
              </button>
            ) : null}
            <button
              type="button"
              onClick={closeFilm}
              aria-label={`Close ${title}`}
              autoFocus
              tabIndex={controlsVisible ? 0 : -1}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/45 bg-black/50 text-2xl text-white transition hover:bg-white hover:text-[#08231F] focus-visible:bg-white focus-visible:text-[#08231F]"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </div>

        {autoplayMuted ? (
          <button
            type="button"
            onClick={toggleMuted}
            className="absolute left-1/2 top-20 z-40 -translate-x-1/2 rounded-full bg-[#FFF3DF] px-5 py-2.5 text-sm font-bold text-[#123C39] shadow-lg sm:top-24"
          >
            Tap for sound
          </button>
        ) : null}

        <div
          className={`absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-16 text-white transition-opacity duration-300 sm:px-6 sm:pb-6 ${
            controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onFocusCapture={() => setControlsVisible(true)}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={togglePlayback}
              aria-label={isPlaying ? "Pause film" : "Play film"}
              tabIndex={controlsVisible ? 0 : -1}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF3DF] text-[#08231F] transition hover:scale-105"
            >
              <span aria-hidden="true">{isPlaying ? "❚❚" : "▶"}</span>
            </button>
            <label className="sr-only" htmlFor={`film-progress-${encodeURIComponent(video)}`}>Film progress</label>
            <input
              id={`film-progress-${encodeURIComponent(video)}`}
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={Math.min(currentTime, duration || 0)}
              onChange={(event) => {
                if (videoRef.current) videoRef.current.currentTime = Number(event.target.value);
              }}
              tabIndex={controlsVisible ? 0 : -1}
              className="min-w-0 flex-1 accent-[#DDB765]"
            />
            <span className="shrink-0 text-xs tabular-nums text-white/85 sm:text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <button
              type="button"
              onClick={toggleMuted}
              aria-label={muted ? "Turn sound on" : "Mute film"}
              tabIndex={controlsVisible ? 0 : -1}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/45 bg-black/35 text-lg transition hover:bg-white hover:text-[#08231F]"
            >
              <span aria-hidden="true">{muted ? "◖" : "◕"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => void openFilm()}
        aria-label={`Play ${title}`}
        className={`group relative block overflow-hidden bg-black ${className}`}
      >
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element -- Supabase poster URLs are runtime data
          <img src={poster} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        ) : (
          <video
            src={`${video}#t=0.001`}
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/35">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/70 bg-black/35 shadow-xl backdrop-blur-sm transition group-hover:scale-110 group-hover:bg-[#FFF3DF] group-hover:text-[#123C39]">
            <svg aria-hidden="true" width="34" height="34" viewBox="0 0 24 24" fill="currentColor" className="ml-1 text-[#FFF3DF] group-hover:text-[#123C39]">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      </button>
      {modal}
    </>
  );
}
