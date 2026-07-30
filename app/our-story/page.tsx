import Link from "next/link";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import HeroCarousel from "../components/HeroCarousel";

export default function OurStory() {
  return (
    <main className="min-h-screen bg-[#EED8B2] text-[#4A4232]">
      <Navigation />

      <section className="relative isolate overflow-hidden bg-[#2D2117] px-6 pb-24 pt-40 text-center text-white">
        <HeroCarousel />
        <div className="relative z-10">
          <p className="mb-5 text-sm uppercase tracking-[0.4em] text-amber-300">
            Your Story
          </p>
          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight drop-shadow-2xl md:text-7xl">
            Every family has a recipe worth remembering.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-stone-100">
            Other People&apos;s Recipes exists to preserve the meals, memories and
            traditions that make a house feel like home.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-8 py-24 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
            Why we started
          </p>
          <h2 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
            Recipes are more than instructions.
          </h2>
        </div>
        <div className="space-y-6 text-lg leading-8 text-stone-700">
          <p>
            They are Sunday lunches, birthday cakes, handwritten notes and the
            people who taught us how to cook them.
          </p>
          <p>
            We are creating a living collection of family recipes and the
            stories behind them — shared with care, discovered by others, and
            one day celebrated around real restaurant tables.
          </p>
        </div>
      </section>

      <section className="bg-[#FFF3DF] px-8 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
            The invitation
          </p>
          <h2 className="mt-5 text-4xl font-bold md:text-5xl">
            What&apos;s the one recipe your family would never let disappear?
          </h2>
          <Link
            href="/share"
            className="mt-10 inline-block rounded-full bg-[#4A4232] px-8 py-4 text-lg font-medium text-white transition hover:scale-105"
          >
            Share Your Story
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
