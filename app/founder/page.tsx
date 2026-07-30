import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";

export default function FounderPage() {
  return (
    <main className="min-h-screen bg-[#EED8B2] text-[#4A4232]">
      <Navigation />

      <section className="relative isolate overflow-hidden px-6 pb-24 pt-36 md:px-8 md:pt-44">
        <Image
          src="/images/founders-letter-desk.png"
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
            <h1 className="text-5xl font-bold leading-tight drop-shadow-lg md:text-7xl">
              A founder&apos;s letter,
              <span className="block text-[#FFD58C]">written in 2000.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#FFF3DF]/90">
              A small reminder left in a desk drawer: when life gives you the
              time, build the place where family recipes can live on.
            </p>
          </div>

          <article
            className="relative ml-auto mt-14 max-w-2xl rotate-[0.35deg] overflow-hidden rounded-sm border border-[#C29A60]/60 bg-[#F7E7C4]/95 p-8 shadow-2xl shadow-black/45 backdrop-blur-[1px] md:mt-18 md:p-12"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, transparent 0, transparent 33px, rgba(125, 83, 41, 0.13) 34px)",
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
            <h2
              className="mt-8 text-4xl font-bold leading-tight text-[#4A4232] md:text-5xl"
              style={{ fontFamily: '"Segoe Print", "Bradley Hand", cursive' }}
            >
              OPR is as much about you and your family as it is about the recipes we hold dear to our hearts.
            </h2>

          <div
            className="mt-9 space-y-6 text-[1.08rem] leading-8 text-[#5B4834]"
            style={{ fontFamily: '"Segoe Print", "Bradley Hand", cursive' }}
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
        </div>
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
