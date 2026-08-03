import type { Metadata } from "next";
import Link from "next/link";
import HeroCarousel from "../components/HeroCarousel";
import Navigation from "../components/Navigation";
import FoundingTableForm from "./FoundingTableForm";

export const metadata: Metadata = {
  title: "Join the Founding Table",
  description:
    "Be there at the beginning. Free to join, first look at every new recipe and story.",
  alternates: { canonical: "/founding-table" },
};

const benefits = [
  "First look at new family recipes and stories",
  "Early invitations to OPR tasting events and launch nights",
  "A future vote in Recipe of the Month",
  "Priority news on Founding Table membership",
];

export default function FoundingTablePage() {
  return (
    <main className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <Navigation />

      <section className="relative isolate overflow-hidden bg-[#0D342F] px-6 pb-24 pt-40 text-center text-[#FFF3DF]">
        <HeroCarousel />
        <div className="relative z-10">
          <p className="mb-5 text-sm uppercase tracking-[0.4em] text-[#FFD58C]">
            The Founding Table
          </p>
          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight drop-shadow-2xl md:text-7xl">
            Be there at the beginning.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-[#FFF1D8]">
            A small group of people helping to shape the living cookbook,
            the conversations and the table we are building together.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1.05fr_0.95fr] md:px-8">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
            Your seat is waiting
          </p>
          <h2 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
            Join the people who believe family recipes deserve a future.
          </h2>
          <p className="mt-7 max-w-xl text-lg leading-8 text-stone-700">
            The Founding Table is free to join. It is where we will share the
            first news, invite our earliest supporters into the conversation,
            and begin building future OPR membership together.
          </p>
          <ul className="mt-10 space-y-5">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex gap-4 text-lg leading-7 text-stone-700">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1C5A50] text-sm text-[#FFD58C]">✓</span>
                {benefit}
              </li>
            ))}
          </ul>
          <p className="mt-10 text-stone-700">
            Have a recipe ready now? <Link href="/share" className="font-semibold text-[#9A622A] underline decoration-[#D1AD75] underline-offset-4">Share it with OPR.</Link>
          </p>
        </div>

        <div className="rounded-3xl bg-[#1C5A50] p-8 shadow-2xl md:p-10">
          <p className="text-sm uppercase tracking-[0.35em] text-[#FFD58C]">
            Save your seat
          </p>
          <h2 className="mt-5 text-3xl font-bold leading-tight text-[#FFF3DF]">
            The first chapter starts here.
          </h2>
          <p className="mt-5 leading-7 text-[#FFF1D8]">
            Leave your details and we will make sure you are part of what comes next.
          </p>
          <FoundingTableForm />
        </div>
      </section>

      <section className="bg-[#FFF3DF] px-6 py-20 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-700">From one family to another</p>
        <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
          The recipes we save today become the stories we share tomorrow.
        </h2>
      </section>

    </main>
  );
}
