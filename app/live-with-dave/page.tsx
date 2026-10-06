import type { Metadata } from "next";
import Link from "next/link";
import HeroCarousel from "../components/HeroCarousel";
import Navigation from "../components/Navigation";
import { buildMetadata } from "../../lib/metadata";
import { cookalongEvent } from "../../lib/cookalong-event";

export const metadata: Metadata = buildMetadata({
  title: "Cook With Dave",
  description:
    cookalongEvent.public.livePage.summary,
  path: "/live-with-dave",
});

export default function LiveWithDavePage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <Navigation />

      <section className="relative isolate overflow-hidden bg-[#123C39] px-6 pb-24 pt-40 text-center text-[#FFF3DF]">
        <HeroCarousel />
        <div className="relative z-10">
          <p className="mb-5 text-sm uppercase tracking-[0.4em] text-[#DDB765]">
            {cookalongEvent.public.livePage.eyebrow}
          </p>
          <h1 className="font-display mx-auto max-w-4xl text-5xl font-bold leading-tight drop-shadow-2xl md:text-7xl">
            {cookalongEvent.public.livePage.title}
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-[#FFF3DF]">
            {cookalongEvent.public.livePage.summary}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1.05fr_0.95fr] md:px-8">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
            The next session
          </p>
          <h2 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
            {cookalongEvent.public.livePage.nextSessionHeading}
          </h2>
          <p className="mt-7 max-w-xl text-lg leading-8 text-stone-700">
            {cookalongEvent.public.livePage.nextSessionCopy}
          </p>
          <p className="mt-10 text-stone-700">
            Cook Dave&apos;s recipe at home: <Link href="/family-cookbook/daves-butter-chicken" className="font-semibold text-[#9A622A] underline decoration-[#DDB765] underline-offset-4">see Dave&apos;s Butter Chicken recipe.</Link>
          </p>
        </div>

        <div className="rounded-3xl bg-[#1C5A50] p-8 shadow-2xl md:p-10">
          <p className="text-sm uppercase tracking-[0.35em] text-[#DDB765]">Stay at the table</p>
          <h2 className="mt-5 text-3xl font-bold leading-tight text-[#FFF3DF]">
            {cookalongEvent.public.livePage.inviteHeading}
          </h2>
          <p className="mt-5 leading-7 text-[#FFF3DF]">
            {cookalongEvent.public.livePage.inviteCopy}
          </p>
          <Link
            href={cookalongEvent.cta.href}
            className="mt-10 inline-flex rounded-full bg-[#DDB765] px-7 py-4 font-medium text-[#08231F] transition hover:scale-[1.02] hover:bg-[#FFF3DF]"
          >
            {cookalongEvent.cta.label}
          </Link>
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
