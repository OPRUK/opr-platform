"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

type DecorativeHeroVideoProps = {
  className?: string;
  poster: string;
  src: string;
};

type DataSavingConnection = {
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
  saveData?: boolean;
};

function getConnection(): DataSavingConnection | undefined {
  return (navigator as Navigator & { connection?: DataSavingConnection }).connection;
}

function prefersStaticPoster(): boolean {
  if (typeof window === "undefined") return true;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return reducedMotion || getConnection()?.saveData === true;
}

function subscribeToPlaybackPreference(onChange: () => void) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const connection = getConnection();

  reducedMotion.addEventListener("change", onChange);
  connection?.addEventListener?.("change", onChange);

  return () => {
    reducedMotion.removeEventListener("change", onChange);
    connection?.removeEventListener?.("change", onChange);
  };
}

function getServerStaticPosterPreference() {
  return true;
}

export default function DecorativeHeroVideo({
  className,
  poster,
  src,
}: DecorativeHeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const showStaticPoster = useSyncExternalStore(
    subscribeToPlaybackPreference,
    prefersStaticPoster,
    getServerStaticPosterPreference,
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (showStaticPoster) {
      video.pause();
      return;
    }

    video.load();
    void video.play().catch(() => {
      // The poster remains visible if a browser blocks decorative autoplay.
    });
  }, [showStaticPoster]);

  return (
    <video
      ref={videoRef}
      className={className}
      loop
      muted
      playsInline
      preload="none"
      poster={poster}
      aria-hidden="true"
    >
      {showStaticPoster ? null : <source src={src} type="video/mp4" />}
    </video>
  );
}
