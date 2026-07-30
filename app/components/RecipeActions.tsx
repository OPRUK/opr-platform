"use client";

import { useState } from "react";

export default function RecipeActions({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const shareText = `I thought you might enjoy ${title} from Other People's Recipes.`;

  function currentUrl() {
    return window.location.href;
  }

  function shareOnWhatsApp() {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareText} ${currentUrl()}`)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function shareOnFacebook() {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl())}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(currentUrl());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="bg-[#EED8B2] px-6 py-16 text-center print:hidden">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#D1AD75]/80 bg-[#FFF3DF] px-6 py-10 shadow-lg shadow-[#6E4B2C]/10 md:px-10">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
          Pass it on
        </p>
        <h2 className="mt-4 text-3xl font-bold md:text-4xl">
          A good recipe is better when it&apos;s shared.
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={shareOnWhatsApp}
            className="rounded-full bg-[#2E7D4F] px-5 py-3 text-sm font-medium text-white transition hover:scale-105"
          >
            WhatsApp
          </button>
          <button
            type="button"
            onClick={shareOnFacebook}
            className="rounded-full bg-[#4267B2] px-5 py-3 text-sm font-medium text-white transition hover:scale-105"
          >
            Facebook
          </button>
          <button
            type="button"
            onClick={() => void copyLink()}
            className="rounded-full border border-[#4A4232] px-5 py-3 text-sm font-medium transition hover:bg-[#4A4232] hover:text-white"
          >
            {copied ? "Link copied" : "Copy link"}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-full border border-[#4A4232] px-5 py-3 text-sm font-medium transition hover:bg-[#4A4232] hover:text-white"
          >
            Print recipe
          </button>
        </div>
      </div>
    </section>
  );
}
