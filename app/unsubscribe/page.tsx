import type { Metadata } from "next";
import Link from "next/link";
import Navigation from "../components/Navigation";
import UnsubscribeForm from "./UnsubscribeForm";
import { hasValidUnsubscribeToken } from "../../lib/unsubscribe";

export const metadata: Metadata = {
  title: "Email preferences",
  description: "Manage your Other People's Recipes email preferences.",
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string }>;
}) {
  const { email: rawEmail = "", token = "" } = await searchParams;
  const email = rawEmail.trim().toLowerCase();
  const valid = Boolean(email && hasValidUnsubscribeToken(email, token));

  return (
    <main className="min-h-screen bg-[#EED8B2] text-[#123C39]">
      <Navigation />
      <section className="px-6 pb-24 pt-40">
        <div className="mx-auto max-w-2xl rounded-3xl bg-[#FFF3DF] p-8 shadow-xl shadow-[#1C5A50]/15 md:p-12">
          <p className="text-sm uppercase tracking-[0.35em] text-[#9A622A]">Email preferences</p>
          <h1 className="font-display mt-4 text-4xl font-bold md:text-5xl">Stay in control of your inbox.</h1>
          {valid ? (
            <>
              <p className="mt-6 leading-8 text-stone-700">
                This will stop optional OPR news, event invitations and newsletters for <strong>{email}</strong>. We may still send essential messages about a recipe you have submitted.
              </p>
              <div className="mt-8"><UnsubscribeForm email={email} token={token} /></div>
            </>
          ) : (
            <>
              <p className="mt-6 leading-8 text-stone-700">This link is incomplete or has expired. Please use the unsubscribe link in a recent OPR email, or contact us and we will help.</p>
              <Link href="/contact" className="mt-8 inline-block rounded-full bg-[#123C39] px-7 py-4 font-medium text-white transition hover:bg-[#08231F]">Get in touch</Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
