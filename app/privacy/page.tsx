import type { Metadata } from "next";
import Navigation from "../components/Navigation";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description: "How Other People's Recipes collects, uses and protects the information you share with us.",
  alternates: { canonical: "/privacy" },
};

const updated = "3 August 2026";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <Navigation />
      <section className="bg-[#123C39] px-6 pb-20 pt-40 text-center text-white">
        <p className="mb-5 text-sm uppercase tracking-[0.4em] text-amber-300">Legal</p>
        <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-tight md:text-6xl">Privacy Notice</h1>
        <p className="mt-6 text-sm uppercase tracking-[0.25em] text-stone-300">Last updated: {updated}</p>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-[#FFF3DF] p-8 shadow-xl shadow-[#1C5A50]/15 md:p-12">
          <div className="space-y-9 leading-7 text-stone-700">
            <p>
              This notice explains how <strong>OTHER PEOPLES RECIPES LTD</strong> (company number 17370145, “OPR”, “we”, “us”) uses personal information when you visit otherpeoplesrecipes.co.uk, share a recipe or join the Founding Table.
            </p>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">1. Contact us</h2>
              <p className="mt-3">We are the controller of the information described in this notice. For privacy questions, requests or concerns, email <a className="underline underline-offset-4" href="mailto:info@otherpeoplesrecipes.co.uk">info@otherpeoplesrecipes.co.uk</a>.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">2. Information we collect</h2>
              <p className="mt-3">Information comes directly from you when you use OPR. Depending on what you choose to do, this can include:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>your name, email address and town or region;</li>
                <li>the recipe, ingredients, method and personal story or memory you share;</li>
                <li>photos of a finished dish or an original handwritten recipe card;</li>
                <li>an optional audio story;</li>
                <li>your Founding Table details and marketing choices; and</li>
                <li>anonymous, aggregated website-usage information.</li>
              </ul>
              <p className="mt-3">Please avoid including anyone else&apos;s private information in a recipe, photo or story unless you have permission to share it.</p>
              <p className="mt-3">Recipe submissions are currently for adults aged 18 and over. We do not knowingly collect recipe submissions from children. If you believe a child&apos;s information has been sent to us, please contact us and we will investigate and remove it where appropriate.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">3. How and why we use it</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>To receive, assess, manage and, where agreed, publish recipe submissions and contributor stories.</li>
                <li>To contact you about your submission or a possible feature.</li>
                <li>To send OPR news, events and invitations only where you have opted in. You can unsubscribe at any time.</li>
                <li>To operate, protect and improve the website, including understanding which pages are useful to visitors.</li>
              </ul>
              <p className="mt-3">We rely on our legitimate interests in running and improving OPR for submission administration and site operation. We rely on your consent for marketing emails and for the optional Founding Table communications you choose to receive. You may withdraw consent at any time.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">4. Optional AI recipe reader</h2>
              <p className="mt-3">If you select “Read my recipe with AI”, we send the image you choose to our AI provider, OpenAI, solely to create an editable recipe draft. You must check and correct the draft before submitting. The reader does not publish your image or recipe; an original recipe image is retained only if you choose to include it in your recipe submission.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">5. Who helps us run OPR</h2>
              <p className="mt-3">We use trusted providers to host the site, store submissions and send emails:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Vercel for hosting and privacy-focused website analytics;</li>
                <li>Supabase for our secure database and form processing;</li>
                <li>Resend for email delivery and unsubscribe management; and</li>
                <li>OpenAI for the optional recipe-card transcription helper.</li>
              </ul>
              <p className="mt-3">Some providers may process information outside the UK. Where this happens, we use providers that apply appropriate safeguards for international transfers. We do not sell your personal information.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">6. How long we keep it</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Published recipes and their accompanying stories are kept as part of the living OPR archive unless we agree to remove them.</li>
                <li>Unpublished submissions are reviewed and normally deleted within 24 months unless we need to keep them longer to resolve a query or meet a legal obligation.</li>
                <li>Founding Table and marketing details are kept until you unsubscribe or ask us to remove them.</li>
                <li>We keep a minimal record of your marketing choice and unsubscribe request where needed to respect that choice.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">7. Your rights</h2>
              <p className="mt-3">You may ask us to access, correct, delete, restrict or transfer your personal information, or object to our use of it. You can withdraw marketing consent at any time. Email <a className="underline underline-offset-4" href="mailto:info@otherpeoplesrecipes.co.uk">info@otherpeoplesrecipes.co.uk</a> and we will respond within the time required by law.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">8. Complaints</h2>
              <p className="mt-3">Please contact us first so we can try to help. You can also complain to the Information Commissioner&apos;s Office at <a className="underline underline-offset-4" href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noreferrer">ico.org.uk/make-a-complaint</a> or on 0303 123 1113.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#123C39]">9. Cookies and analytics</h2>
              <p className="mt-3">OPR uses Vercel Web Analytics to understand aggregated page visits. It does not use cookies or track you across websites. Read our <a className="underline underline-offset-4" href="/cookies">Cookie Notice</a> for more.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
