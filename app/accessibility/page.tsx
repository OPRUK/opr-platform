import type { Metadata } from "next";
import Link from "next/link";
import Navigation from "../components/Navigation";
import { buildMetadata } from "../../lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Accessibility Statement",
  description: "How Other People's Recipes supports accessible use of its website and how to request help or an alternative format.",
  path: "/accessibility",
});

const reviewedDate = "15 August 2026";

export default function AccessibilityStatementPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <Navigation />
      <section className="bg-[#123C39] px-6 pb-20 pt-40 text-center text-white">
        <p className="mb-5 text-sm uppercase tracking-[0.4em] text-amber-300">Access for everyone</p>
        <h1 className="font-display mx-auto max-w-3xl text-5xl font-bold leading-tight md:text-6xl">Accessibility Statement</h1>
        <p className="mt-6 text-sm uppercase tracking-[0.25em] text-stone-300">Last reviewed: {reviewedDate}</p>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-[#FFF3DF] p-8 shadow-xl shadow-[#1C5A50]/15 md:p-12">
          <div className="space-y-9 leading-7 text-stone-700">
            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">Our commitment</h2>
              <p className="mt-3">
                Other People&apos;s Recipes wants everyone to be able to explore, read and share family recipes. We are working towards the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA and review accessibility as the site develops.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">What you can do</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Use the <strong>Aa</strong> control in the header to make text smaller or larger.</li>
                <li>Choose <strong>Readable font</strong> to replace decorative handwriting and display fonts.</li>
                <li>Zoom the page using your browser without losing content or needing to scroll sideways.</li>
                <li>Navigate links, buttons and forms using a keyboard.</li>
                <li>Use the skip link at the start of each page to move directly to the main content.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">How we have improved the site</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Clear page landmarks, headings, link names and image descriptions.</li>
                <li>Visible keyboard focus and sufficiently large interactive controls.</li>
                <li>Form labels and announcements for errors, progress and successful submissions.</li>
                <li>Responsive layouts tested at a 320-pixel viewport with enlarged text.</li>
                <li>Reduced-motion support for visitors who request it in their device settings.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">Known limitations</h2>
              <p className="mt-3">
                Every film in the OPR Film Collection includes a written transcript. Verified synchronised captions for films and complete transcripts for some contributor audio or video recordings are still being prepared. Decorative recipe-card textures may also be less comfortable for some readers; the Readable font setting simplifies the type while preserving the recipe content.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">Request an alternative format</h2>
              <p className="mt-3">
                If you need a recipe, film, audio story or any other part of the site in another format, email{" "}
                <a className="font-semibold underline underline-offset-4" href="mailto:info@otherpeoplesrecipes.co.uk?subject=Accessibility%20request">
                  info@otherpeoplesrecipes.co.uk
                </a>.
                Please tell us which page or item you need and the format that would help. We aim to reply within 10 working days.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">Report an accessibility problem</h2>
              <p className="mt-3">
                If something is difficult to use, please email us with the page address and a short description of the problem. Your feedback helps us improve the site. You can also read our{" "}
                <Link href="/privacy" className="underline underline-offset-4">Privacy Notice</Link>.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">Assessment approach</h2>
              <p className="mt-3">
                We assess the site through automated code checks, keyboard and rendered-page testing, text enlargement and narrow-screen reflow checks. A specialist screen-reader and media-caption review remains part of our ongoing work.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
