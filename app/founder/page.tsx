import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navigation from "../components/Navigation";

export const metadata: Metadata = {
  title: "The Founder's Letter",
  description:
    "An idea written down in 2000, finally built: why OPR exists, in Chaten's own words.",
  alternates: { canonical: "/founder" },
};

export default function FounderPage() {
  return (
    <main className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <Navigation />

      <section className="relative isolate overflow-hidden px-6 pb-24 pt-36 md:px-8 md:pt-44">
        <Image
          src="/images/founders-letter-desk.webp"
          alt="A handwritten note kept in a treasured wooden desk drawer"
          fill
          priority
          className="-z-20 object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(35,24,15,0.9)_0%,rgba(35,24,15,0.68)_42%,rgba(35,24,15,0.38)_100%)]" />

        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl text-[#FFF3DF]">
            <p className="mb-5 text-sm uppercase tracking-[0.4em] text-[#FFD58C]">
              A note to my future self
            </p>
            <h1 className="font-display text-5xl font-bold leading-tight drop-shadow-lg md:text-7xl">
              A founder&apos;s letter,
              <span className="block text-[#FFD58C]">written in 2000.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#FFF3DF]/90">
              A small reminder left in a desk drawer: when life gives you the
              time, build the place where family recipes can live on.
            </p>
          </div>

          <article
            className="font-founder-hand relative ml-auto mt-14 max-w-2xl rotate-[0.35deg] overflow-hidden rounded-sm border border-[#9B6935]/75 bg-[#EAD09B] p-8 shadow-2xl shadow-black/45 md:mt-18 md:p-12"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 14% 10%, rgba(112, 68, 26, 0.22) 0%, transparent 23%), radial-gradient(ellipse at 88% 84%, rgba(112, 68, 26, 0.18) 0%, transparent 25%), radial-gradient(ellipse at 42% 64%, rgba(255, 247, 218, 0.48) 0%, transparent 32%), repeating-linear-gradient(to bottom, transparent 0, transparent 33px, rgba(125, 83, 41, 0.16) 34px)",
              boxShadow:
                "inset 0 0 46px rgba(74, 42, 14, 0.42), inset 0 0 8px rgba(90, 48, 14, 0.45), 0 24px 52px rgba(0, 0, 0, 0.45)",
            }}
          >
          <div className="absolute inset-0 opacity-35" style={{ backgroundImage: "linear-gradient(105deg, rgba(89, 52, 20, 0.14), transparent 19%, transparent 80%, rgba(89, 52, 20, 0.16))" }} />
          <div className="absolute -top-3 left-1/2 z-20 h-7 w-28 -translate-x-1/2 rotate-[-2deg] bg-[#C9A55B]/70 shadow-sm" />
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4 border-b border-[#9A622A]/35 pb-5">
              <p className="text-xs uppercase tracking-[0.3em] text-[#8B5A2B]">
                A founder&apos;s letter
              </p>
              <p className="text-3xl italic text-[#8B5A2B]">2000</p>
            </div>
            <h2
              className="font-founder-hand mt-8 text-4xl font-semibold leading-tight text-[#123C39] md:text-5xl"
            >
              OPR is as much about you and your family as it is about the recipes we hold dear to our hearts.
            </h2>

          <div
            className="font-founder-hand mt-9 space-y-6 text-[1.4rem] leading-[1.55] text-[#5B4834] md:text-[1.55rem]"
          >
            <p>
              Other People&apos;s Recipes began as an idea back in 2000. It has
              always been a passion of mine, but life moved quickly and I never
              quite got round to bringing it to life. Now, with so much
              encouragement from family and friends, I finally have.
            </p>
            <p>
              I&apos;ve been lucky enough to travel the world and taste some
              extraordinary food. But here&apos;s the thing: a family recipe cooked
              with love, passed on by your mum, your auntie or your Masi, is
              something special.
            </p>
            <p>
              Take Dave&apos;s Butter Chicken. He learnt it from my mum and made it
              his own, changing the recipe as it travelled into our family. That
              is what OPR means to me: food is never only food. It is memory,
              generosity, pride and the people who taught us along the way.
            </p>
            <p>
              I hope OPR becomes part of your family history too. Share a
              recipe with the world, see how other home cooks make it, and
              discover flavours that can rival any restaurant.
            </p>
          </div>

          <div className="mt-10 flex items-center gap-5">
            <Image
              src="/images/chaten-founder-photo.webp"
              alt="Chaten, founder of Other People's Recipes"
              width={500}
              height={500}
              className="h-16 w-16 flex-shrink-0 rounded-full object-cover shadow-md md:h-20 md:w-20"
            />
            <div>
              <Image
                src="/images/chaten-signature.png"
                alt="Chaten's signature"
                width={1606}
                height={671}
                className="h-auto w-48 md:w-56"
              />
              <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[#9A622A]">
                Founder, Other People&apos;s Recipes
              </p>
            </div>
          </div>
          </div>
          </article>
        </div>
      </section>

      <section className="bg-[#08231F] px-6 py-20 text-center text-[#FFF3DF]">
        <p className="text-sm uppercase tracking-[0.35em] text-[#FFD58C]">
          Join the story
        </p>
        <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
          There is a place for your story at our table.
        </h2>
        <div className="mx-auto mt-10 flex max-w-3xl flex-col justify-center gap-4 sm:flex-row sm:flex-wrap">
          <Link
            href="/share"
            className="rounded-full bg-[#DDB765] px-7 py-4 font-medium text-[#08231F] transition hover:scale-105 hover:bg-[#FFD58C]"
          >
            Share your recipe
          </Link>
          <a
            href="mailto:info@otherpeoplesrecipes.co.uk?subject=OPR%20Partnership"
            className="rounded-full border border-[#DDB765] px-7 py-4 font-medium text-[#FFF3DF] transition hover:bg-[#DDB765] hover:text-[#08231F]"
          >
            Partner with us
          </a>
          <a
            href="mailto:info@otherpeoplesrecipes.co.uk?subject=OPR%20Enquiry"
            className="rounded-full border border-[#FFF3DF]/70 px-7 py-4 font-medium text-[#FFF3DF] transition hover:bg-[#FFF3DF] hover:text-[#08231F]"
          >
            Get in touch
          </a>
        </div>
      </section>

    </main>
  );
}
