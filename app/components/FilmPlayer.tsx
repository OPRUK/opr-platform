"use client";

import { useRef, useState } from "react";
import { filmPlaybackUrl } from "../../lib/film-playback";

type FilmPlayerProps = {
  video: string;
  title: string;
  poster?: string;
  captions?: string;
  width?: number;
  height?: number;
};

export default function FilmPlayer({video, title, poster, captions, width = 16, height = 9}: FilmPlayerProps) {
  const player = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [started, setStarted] = useState(false);
  function play() {
    void player.current?.play().catch(() => setFailed(true));
  }
  function retry() {
    setFailed(false);
    const element = player.current;
    if (!element) return;
    element.load();
    void element.play().catch(() => setFailed(true));
  }
  return <>
    <div className="relative">
    <video ref={player} id="film-player" src={filmPlaybackUrl(video)} aria-label={title}
      className="block h-auto w-full bg-black object-contain" style={{aspectRatio: `${width} / ${height}`}}
      width={width} height={height} controls playsInline preload="metadata" poster={poster}
      onError={() => setFailed(true)} onPlay={() => setStarted(true)} onEnded={() => setStarted(false)} onPlaying={() => setFailed(false)}>
      {captions ? <track kind="captions" src={captions} srcLang="en" label="English captions" default /> : null}
      Your browser does not support video playback.
    </video>
    {!started && !failed ? <button type="button" onClick={play} aria-label={`Play ${title}`}
      className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 whitespace-nowrap rounded-full border-2 border-white bg-[#123C39]/95 px-6 py-4 text-lg font-bold text-white shadow-xl transition hover:bg-[#1C5A50] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#DDB765]">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7 fill-current"><path d="M7 3v18l15-9z" /></svg>
      Play film
    </button> : null}
    </div>
    {failed ? <div role="alert" className="bg-[#FFF3DF] p-5 text-center text-[#123C39]">
      <p>The film could not load. Try again, or open the video directly.</p>
      <button type="button" onClick={retry} className="mt-3 min-h-11 rounded-full bg-[#123C39] px-5 py-2 text-white">Retry film</button>
      <a href={video} target="_blank" rel="noreferrer" className="ml-4 inline-block py-3 font-semibold underline">Open video directly</a>
    </div> : null}
  </>;
}
