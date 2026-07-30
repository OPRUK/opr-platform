import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";

export default function FounderPage() {
  return (
    <main className="min-h-screen bg-[#EED8B2] text-[#4A4232]">
      <Navigation />

      <section className="bg-[#4A4232] px-6 pb-24 pt-40 text-center text-white">
        <p className="mb-5 text-sm uppercase tracking-[0.4em] text-amber-300">
          From the founder
        </p>
        <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
          Every recipe deserves to be remembered.
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-stone-200">
          A note from Chaten, founder of Other People&apos;s Recipes.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[0.9fr_1.1fr] md:items-start md:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#6E4B2C] shadow-2xl">
          <Image
            src="/images/hero-kitchen.png"
            alt="A treasured recipe book on a kitchen table"
            width={1000}
            height={750}
            className="h-full min-h-[360px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-[#21170F]/45" />
          <div className="absolute inset-x-0 bottom-0 p-8 text-[#FFF3DF]">
            <p className="text-sm uppercase tracking-[0.3em] text-[#FFD58C]">Chaten</p>
            <p className="mt-2 text-3xl font-bold">Founder</p>
          </div>
        </div>

        <article
          className="relative rotate-[0.35deg] overflow-hidden rounded-sm border border-[#C29A60]/60 bg-[#F7E7C4] p-8 shadow-2xl shadow-[#6E4B2C]/20 md:p-12"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0, transparent 33px, rgba(125, 83, 41, 0.12) 34px)",
          }}
        >
          <div className="absolute -top-3 left-1/2 h-7 w-28 -translate-x-1/2 rotate-[-2deg] bg-[#D9B66D]/70 shadow-sm" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4 border-b border-[#9A622A]/35 pb-5">
              <p className="text-xs uppercase tracking-[0.3em] text-[#8B5A2B]">
                A founder&apos;s letter
              </p>
              <p className="font-serif text-2xl italic text-[#8B5A2B]">2000</p>
            </div>
            <h2 className="mt-8 font-serif text-4xl font-bold leading-tight text-[#4A4232] md:text-5xl">
              OPR is as much about you and your family as it is about the recipes we hold dear to our hearts.
            </h2>

          <div className="mt-9 space-y-6 font-serif text-lg leading-8 text-[#5B4834]">
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
              his own, changing the recipe as it travelled into his family. That
              is what OPR means to me: food is never only food. It is memory,
              generosity, pride and the people who taught us along the way.
            </p>
            <p>
              I hope OPR becomes part of your family history too. Share a
              recipe with the world, see how other home cooks make it, and
              discover flavours that can rival any restaurant.
            </p>
          </div>

          <p
            className="mt-10 text-4xl text-[#6E4B2C]"
            style={{ fontFamily: '"Segoe Print", "Bradley Hand", cursive' }}
          >
            Chaten
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[#9A622A]">
            Founder, Other People&apos;s Recipes
          </p>
          </div>
        </article>
      </section>

      <section className="bg-[#33291F] px-6 py-20 text-center text-[#FFF3DF]">
        <p className="text-sm uppercase tracking-[0.35em] text-[#FFD58C]">
          Join the story
        </p>
        <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
          There is a place for your story at our table.
        </h2>
        <div className="mx-auto mt-10 flex max-w-3xl flex-col justify-center gap-4 sm:flex-row sm:flex-wrap">
          <Link
            href="/share"
            className="rounded-full bg-[#DDB765] px-7 py-4 font-medium text-[#33291F] transition hover:scale-105 hover:bg-[#FFD58C]"
          >
            Share your recipe
          </Link>
          <a
            href="mailto:info@otherpeoplesrecipes.co.uk?subject=OPR%20Partnership"
            className="rounded-full border border-[#DDB765] px-7 py-4 font-medium text-[#FFF3DF] transition hover:bg-[#DDB765] hover:text-[#33291F]"
          >
            Partner with us
          </a>
          <a
            href="mailto:info@otherpeoplesrecipes.co.uk?subject=OPR%20Enquiry"
            className="rounded-full border border-[#FFF3DF]/70 px-7 py-4 font-medium text-[#FFF3DF] transition hover:bg-[#FFF3DF] hover:text-[#33291F]"
          >
            Get in touch
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
