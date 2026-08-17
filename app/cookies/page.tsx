import type { Metadata } from "next";
import Navigation from "../components/Navigation";
import { buildMetadata } from "../../lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Cookie Notice",
  description: "How Other People's Recipes uses cookies and privacy-focused analytics.",
  path: "/cookies",
});

export default function CookieNoticePage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <Navigation />
      <section className="bg-[#123C39] px-6 pb-20 pt-40 text-center text-white">
        <p className="mb-5 text-sm uppercase tracking-[0.4em] text-amber-300">Legal</p>
        <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-tight md:text-6xl">Cookie Notice</h1>
        <p className="mt-6 text-sm uppercase tracking-[0.25em] text-stone-300">Last updated: 17 August 2026</p>
      </section>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-[#FFF3DF] p-8 shadow-xl shadow-[#1C5A50]/15 md:p-12">
          <div className="space-y-8 leading-7 text-stone-700">
            <p>Cookies are small files that a website can place on your device. At present, OPR does not set advertising, marketing or cross-site tracking cookies.</p>
            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">Website analytics</h2>
              <p className="mt-3">We use Vercel Web Analytics to see anonymous, aggregated information such as which pages are visited and how people arrive on the site. Vercel says this service does not use cookies and does not identify you across websites. OPR also records privacy-safe counts when someone opens one of our social links or selects a key action, such as opening the Living Cookbook or sharing a recipe. These records may include the named social source and campaign, but not a name, email address, IP address, browser identifier or unique visitor ID.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">Your browser storage</h2>
              <p className="mt-3">The Share your recipe form may temporarily save a draft in your browser&apos;s session storage so that you do not lose work while completing the form. If you arrive through a tagged OPR social link, the named source and campaign may also be kept in session storage for the current browser tab so a later table signup or recipe submission can be counted against that source. This information has no unique identifier, stays only for the session and is not used to follow you across websites.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">If this changes</h2>
              <p className="mt-3">If OPR adds non-essential cookies in future, we will update this notice and ask for consent before those cookies are used. Questions about privacy can be sent to <a className="underline underline-offset-4" href="mailto:info@otherpeoplesrecipes.co.uk">info@otherpeoplesrecipes.co.uk</a>.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
