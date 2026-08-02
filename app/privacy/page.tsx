import type { Metadata } from "next";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Other People's Recipes collects, uses and protects the personal information you share with us.",
  alternates: { canonical: "/privacy" },
};

function ReviewNotice() {
  return (
    <p className="mb-8 rounded-2xl border border-dashed border-[#B77938]/70 bg-[#F4DDAE]/60 px-5 py-4 text-sm leading-6 text-stone-700">
      <strong>[LEGAL REVIEW REQUIRED]</strong> This page is a working draft. It
      has not been reviewed by a solicitor and should not be relied upon until
      it has been. It is not legal advice.
    </p>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <Navigation />

      <section className="bg-[#123C39] px-6 pb-20 pt-40 text-center text-white">
        <p className="mb-5 text-sm uppercase tracking-[0.4em] text-amber-300">
          Legal
        </p>
        <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-tight md:text-6xl">
          Privacy Policy
        </h1>
        <p className="mt-6 text-sm uppercase tracking-[0.25em] text-stone-300">
          Last updated: [DATE — LEGAL REVIEW REQUIRED]
        </p>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-[#FFF3DF] p-8 shadow-xl shadow-[#1C5A50]/15 md:p-12">
          <ReviewNotice />

          <div className="space-y-9 leading-7 text-stone-700">
            <p>
              Other People&apos;s Recipes (&quot;OPR&quot;, &quot;we&quot;,
              &quot;us&quot;) collects a small amount of personal information
              in order to build and maintain the family cookbook archive at
              otherpeoplesrecipes.co.uk. This page explains what we collect,
              why, and what rights you have over it.
            </p>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">1. What we collect</h2>
              <p className="mt-3">
                When you submit a recipe through the Share Your Recipe form, we may collect:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Your name</li>
                <li>Your email address</li>
                <li>Your town or region</li>
                <li>The recipe itself, including any free-text personal story or memory you share with it</li>
                <li>A photograph of the finished dish</li>
                <li>A photograph of the recipe as originally written (if you provide one)</li>
                <li>An audio recording of you or someone else telling the recipe&apos;s story (if you provide one)</li>
                <li>An AI-generated draft of the recipe text, only if you choose to use the optional “Read my recipe with AI” helper</li>
              </ul>
              <p className="mt-3">
                If you join the Founding Table, we collect your name and email address.
              </p>
              <p className="mt-3">
                We do not knowingly collect information from children.{" "}
                <strong>[LEGAL REVIEW REQUIRED — confirm age restriction / parental consent position if under-18 submissions are possible.]</strong>
              </p>
              <p className="mt-3">
                If you choose the optional AI recipe-reading helper, the image is sent to our AI provider solely to create an editable draft for you to review. We do not store a separate copy through that helper. The original image is stored only if you choose to submit it with your recipe.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">2. Why we collect it</h2>
              <p className="mt-3">We use this information to:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Publish your recipe and story on the site, and in other OPR formats (print, film, events) under the licence you grant us when you submit (see our <a href="/terms" className="underline underline-offset-4">Terms</a>)</li>
                <li>Contact you about your submission, including if we&apos;d like to feature it</li>
                <li>Send you OPR news and updates, but only if you&apos;ve opted in to marketing communications</li>
                <li>Maintain a searchable archive of contributors as the record of the project</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">3. Our lawful basis for processing</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li><strong>Submissions</strong> (publishing your recipe, story and images): legitimate interest — maintaining and growing the OPR archive, which you have actively chosen to contribute to under an explicit licence grant. <strong>[LEGAL REVIEW REQUIRED — confirm legitimate interest is the correct basis rather than consent, given the licence-grant mechanism in the Terms.]</strong></li>
                <li><strong>Marketing communications:</strong> consent, given separately and optionally via the marketing checkbox. You can withdraw this at any time.</li>
                <li><strong>Founding Table membership:</strong> consent, confirmed via double opt-in.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">4. How long we keep it</h2>
              <p className="mt-3">
                <strong>[LEGAL REVIEW REQUIRED — retention period not yet confirmed.]</strong>{" "}
                As a living archive, submitted recipes, stories and images are
                intended to be retained indefinitely as part of the cookbook,
                unless you ask us to remove them. Contact details used only
                for marketing are retained until you unsubscribe or withdraw
                consent.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">5. Who we share it with</h2>
              <p className="mt-3">
                We use third-party services to run the site and process submissions. As of this draft:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Hosting: Vercel</li>
                <li>Form / submission processing and secure database: Supabase</li>
                <li>Email / mailing list: Resend</li>
                <li>Optional handwritten-recipe transcription: OpenAI, only when you choose to use that helper</li>
              </ul>
              <p className="mt-3">
                We do not sell your personal information.{" "}
                <strong>[LEGAL REVIEW REQUIRED — a full processor list and data processing agreements should be confirmed and named here once vendors are finalised.]</strong>
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">6. Your rights</h2>
              <p className="mt-3">Under UK GDPR, you have the right to:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Access the personal information we hold about you</li>
                <li>Ask us to correct inaccurate information</li>
                <li>Ask us to delete your information</li>
                <li>Ask us to restrict how we use it</li>
                <li>Object to our use of it</li>
                <li>Receive your information in a portable format</li>
                <li>Withdraw consent at any time, where we rely on consent</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, contact us at [CONTACT EMAIL — TO BE CONFIRMED].
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">7. Complaints</h2>
              <p className="mt-3">
                If you&apos;re unhappy with how we&apos;ve handled your
                information, you can complain to the Information
                Commissioner&apos;s Office (ICO) at ico.org.uk, or by calling
                0303 123 1113.
              </p>
              <p className="mt-3">
                <strong>[LEGAL REVIEW REQUIRED — confirm whether OPR needs to register with the ICO. As a general guide, most small organisations processing personal data pay a data protection fee, currently around £52 a year, though the correct tier depends on turnover and staff numbers and should be checked directly on the ICO&apos;s fee self-assessment tool.]</strong>
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">8. Cookies</h2>
              <p className="mt-3">
                This site does not currently use analytics or non-essential
                cookies. If that changes, this policy will be updated and a
                cookie consent banner will be added before any such cookies
                are set.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">9. Changes to this policy</h2>
              <p className="mt-3">
                We may update this policy from time to time. The date at the
                top shows when it was last revised.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
