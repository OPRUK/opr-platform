import type { Metadata } from "next";
import Link from "next/link";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import PublishedRecipes from "./PublishedRecipes";
import { featuredRecipes } from "../../lib/recipes";

export const metadata: Metadata = {
  title: "The Family Cookbook",
  description:
    "Real recipes from real family kitchens, each one saved with the memory that made it matter.",
  alternates: { canonical: "/family-cookbook" },
};

const recipes = featuredRecipes;

export default function FamilyCookbook() {
  return (
    <main className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <Navigation />

      <section className="relative isolate overflow-hidden bg-[#123C39] px-6 pb-24 pt-40 text-center text-white">
        <video
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/images/recipes/barbaras-beef-casserole-wide.png"
          aria-hidden="true"
        >
          <source src="/videos/opr-recipe-stories-film-v2.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 -z-10 bg-[#0D342F]/75" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#08231F]/65 via-[#123C39]/45 to-[#08231F]/80" />

        <div className="mx-auto max-w-4xl">
          <p className="mb-5 text-sm uppercase tracking-[0.4em] text-amber-200">
            The Family Cookbook
          </p>
          <h1 className="text-5xl font-bold leading-tight drop-shadow-lg md:text-7xl">
            Every recipe has travelled through time before finding its way here.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 md:px-8">
        <div className="mb-14 max-w-2xl">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
            Choose a recipe
          </p>
          <h2 className="mt-4 text-4xl font-bold md:text-5xl">
            Stories from family kitchens
          </h2>
          <p className="mt-6 text-lg leading-8 text-stone-700">
            These are the first pages of the OPR cookbook: recipes shared with
            love, and the memories that make them matter.
          </p>
        </div>

        <PublishedRecipes featuredRecipes={recipes} />
      </section>

      <section className="bg-[#FFF3DF] px-6 py-24 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
          Whet Our Appetite
        </p>
        <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-bold md:text-5xl">
          Could your family&apos;s recipe be next?
        </h2>
        <Link
          href="/share"
          className="mt-10 inline-block rounded-full bg-[#123C39] px-8 py-4 text-lg font-medium text-white transition hover:scale-105"
        >
          Share Your Story
        </Link>
      </section>
      <Footer />
    </main>
  );
}
