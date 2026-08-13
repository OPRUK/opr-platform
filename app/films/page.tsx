import type { Metadata } from "next";
import Navigation from "../components/Navigation";
import FilmEmbed from "../components/FilmEmbed";
import VideoBrandMark from "../components/VideoBrandMark";
import { films } from "../../lib/films";
import { absoluteUrl } from "../../lib/site";


export const metadata: Metadata = {
  title: "The OPR Film Collection",
  description:
    "Short films about food, family and the recipes we choose to pass on.",
  alternates: { canonical: "/films" },
};


export default function FilmsPage() {
  const videoJsonLd = {
    "@context": "https://schema.org",
    "@graph": films.map((film) => ({
      "@type": "VideoObject",
      name: film.title,
      description: film.title + ", from the OPR Film Collection: short films about food, family and the recipes we choose to pass on.",
      thumbnailUrl: [absoluteUrl(film.poster ?? "/images/recipes/barbaras-beef-casserole-wide.webp")],
      uploadDate: "2026-08-01",
      contentUrl: absoluteUrl(film.video),
      embedUrl: absoluteUrl("/films") + "#" + encodeURIComponent(film.title),
    })),
  };

  return (
    <main className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(videoJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Navigation />


      <section className="relative isolate overflow-hidden bg-[#123C39] px-6 pb-24 pt-40 text-center text-white">
        <video
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/images/recipes/barbaras-beef-casserole-wide.webp"
          aria-hidden="true"
        >
          <source src="/videos/opr-recipe-stories-film-v2.mp4" type="video/mp4" />
        </video>
        <VideoBrandMark />
        <div className="absolute inset-0 -z-10 bg-[#0D342F]/75" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#08231F]/65 via-[#123C39]/45 to-[#08231F]/80" />


        <div className="mx-auto max-w-4xl">
