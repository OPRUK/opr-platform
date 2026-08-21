import type { Metadata } from "next";
import Link from "next/link";
import HeroCarousel from "../components/HeroCarousel";
import Navigation from "../components/Navigation";
import CookalongSignupForm from "./CookalongSignupForm";
import { buildMetadata } from "../../lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Live With Dave: Butter Chicken Cook-Along",
  description:
    "Join Dave live over Zoom on Sunday 4 October as he cooks his family butter chicken. Free to join — save your spot.",
  path: "/live-with-dave",
});

const whatToExpect = [
  "Dave cooks his family butter chicken live, start to finish",
  "The recipe list lands in your inbox the week before, so you can shop and prep",
  "The Zoom join link follows a few days before the event",
  "Ask Dave anything — this is a live kitchen, not a recording",
];

export default function LiveWithDavePage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <Navigation />

      <section className="relative isolate overflow-hidden bg-[#123C39] px-6 pb-24 pt-40 text-center text-[#FFF3DF]">
        <HeroCarousel />
        <div className="relative z-10">
          <p className="mb-5 text-sm uppercase tracking-[0.4em] text-[#DDB765]">
            Live cook-along
          </p>
          <h1 className="font-display mx-auto max-w-4xl text-5xl font-bold leading-tight drop-shadow-2xl md:text-7xl">
            Cook Dave&apos;s butter chicken with him, live.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-[#FFF3DF]">
            Sunday 4 October, over Zoom. Free to join — bring your apron and your questions.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1.05fr_0.95fr] md:px-8">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
            Sunday 4 October
          </p>
          <h2 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
            The family butter chicken recipe, cooked live in Dave&apos;s kitchen.
          </h2>
          <p className="mt-7 max-w-xl text-lg leading-8 text-stone-700">
            Four generations, no shortcuts. Save your spot and we will send everything
            you need to cook along in real time — or just watch and ask questions.
          </p>
          <ul className="mt-10 space-y-5">
            {whatToExpect.map((item) => (
              <li key={item} className="flex gap-4 text-lg leading-7 text-stone-700">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1C5A50] text-base text-[#DDB765]">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-10 text-stone-700">
            Want a preview first? <Link href="/family-cookbook/daves-butter-chicken" className="font-semibold text-[#9A622A] underline decoration-[#DDB765] underline-offset-4">See Dave&apos;s butter chicken recipe.</Link>
          </p>
        </div>

        <div className="rounded-3xl bg-[#1C5A50] p-8 shadow-2xl md:p-10">
          <p className="text-sm uppercase tracking-[0.35em] text-[#DDB765]">
            Save your spot
          </p>
          <h2 className="mt-5 text-3xl font-bold leading-tight text-[#FFF3DF]">
            Free to join. Just tell us where to send it.
          </h2>
          <p className="mt-5 leading-7 text-[#FFF3DF]">
            Leave your details and we will send the recipe list a week before, then the Zoom link closer to the day.
          </p>
          <CookalongSignupForm />
        </div>
      </section>

      <section className="bg-[#FFF3DF] px-6 py-20 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-700">One kitchen, everyone welcome</p>
        <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
          Some recipes are better cooked together.
        </h2>
      </section>

    </main>
  );
}
