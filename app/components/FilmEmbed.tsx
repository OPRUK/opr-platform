"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import VideoBrandMark from "./VideoBrandMark";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [autoplayMuted, setAutoplayMuted] = useState(false);

  function keepControlsVisible() {
    setControlsVisible(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setControlsVisible(false);
    }, 2200);
  }

  function closeFilm() {
    videoRef.current?.pause();
    setOpen(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setAutoplayMuted(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
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
    if (player.paused) void player.play();
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
      if (event.key === "Escape") closeFilm();
      setControlsVisible(true);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, [open]);

  const modal = open && typeof document !== "undefined" ? createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#08231F]/95 px-3 py-5 backdrop-blur-sm sm:px-8"
      onPointerMove={keepControlsVisible}
      onClick={closeFilm}
    >
      <button
        type="button"
        onClick={closeFilm}
        aria-label={`Close ${title}`}
        autoFocus
        className="absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/45 bg-black/50 text-2xl text-white transition hover:bg-white hover:text-[#08231F] focus-visible:bg-white focus-visible:text-[#08231F] sm:right-8 sm:top-8"
      >
        <span aria-hidden="true">×</span>
      </button>

      <div
        className="relative w-full max-w-6xl overflow-hidden rounded-2xl bg-black shadow-2xl shadow-black/60"
        onClick={(event) => {
          event.stopPropagation();
          keepControlsVisible();
        }}
      >
        <video
          ref={videoRef}
          aria-label={title}
          className="aspect-video max-h-[82vh] w-full bg-black object-contain"
          src={video}
          playsInline
          preload="auto"
          poster={poster}
          controls={false}
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          onPlay={() => setIsPlaying(true)}
          onPause={() => {
            setIsPlaying(false);
            setControlsVisible(true);
          }}
          onEnded={() => {
            setIsPlaying(false);
            setControlsVisible(true);
          }}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        >
          {captions ? <track kind="captions" src={captions} srcLang="en" label="English captions" default /> : null}
          Your browser does not support video playback.
        </video>
        <VideoBrandMark />

        {autoplayMuted ? (
          <button
            type="button"
            onClick={toggleMuted}
            className="absolute left-1/2 top-5 z-20 -translate-x-1/2 rounded-full bg-[#FFF3DF] px-5 py-2.5 text-sm font-bold text-[#123C39] shadow-lg"
          >
            Tap for sound
          </button>
        ) : null}

        <div
          className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-16 text-white transition-opacity duration-300 sm:px-6 sm:pb-6 ${
            controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onFocusCapture={() => setControlsVisible(true)}
        >
          <p className="mb-4 line-clamp-1 pr-12 text-sm font-semibold sm:text-base">{title}</p>
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={togglePlayback}
              aria-label={isPlaying ? "Pause film" : "Play film"}
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
              className="min-w-0 flex-1 accent-[#DDB765]"
            />
            <span className="shrink-0 text-xs tabular-nums text-white/85 sm:text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <button
              type="button"
              onClick={toggleMuted}
              aria-label={muted ? "Turn sound on" : "Mute film"}
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
