"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { getStoredAttribution } from "../../lib/attribution-client";

export default function CookalongSignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function joinCookalong(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/cookalong-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          marketingOptIn,
          attribution: getStoredAttribution(),
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "We could not save your spot just now. Please try again.");
        setIsSubmitting(false);
        return;
      }

      if (result.alreadyJoined) {
        setMessage("You are already on the list. We will be in touch before Sunday 4 October.");
      } else {
        setMessage("You are on the list. Check your inbox for confirmation — the recipe list follows a week before.");
      }
      setName("");
      setEmail("");
      setMarketingOptIn(false);
    } catch {
      setMessage("We could not save your spot just now. Please try again.");
    }

    setIsSubmitting(false);
  }

  return (
    <form onSubmit={joinCookalong} className="mt-10 space-y-5 text-left">
      <label className="block text-base font-medium text-[#FFF3DF]">
        First name
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="given-name"
          className="mt-2 w-full rounded-xl border border-[#DDB765]/60 bg-[#FFF3DF] px-4 py-3 text-[#123C39] outline-none transition focus:border-[#DDB765] focus:ring-2 focus:ring-[#DDB765]/50"
          placeholder="Your first name"
        />
      </label>
      <label className="block text-base font-medium text-[#FFF3DF]">
        Email address
        <input
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          autoComplete="email"
          className="mt-2 w-full rounded-xl border border-[#DDB765]/60 bg-[#FFF3DF] px-4 py-3 text-[#123C39] outline-none transition focus:border-[#DDB765] focus:ring-2 focus:ring-[#DDB765]/50"
          placeholder="you@example.com"
        />
      </label>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#DDB765]/40 bg-[#FFF3DF]/10 px-4 py-3 text-base leading-6 text-[#FFF3DF]">
        <input
          checked={marketingOptIn}
          onChange={(event) => setMarketingOptIn(event.target.checked)}
          type="checkbox"
          className="mt-1 h-4 w-4 accent-[#DDB765]"
        />
        <span>Also keep me posted about future OPR news and events. You can unsubscribe at any time.</span>
      </label>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-[#DDB765] px-7 py-4 font-medium text-[#08231F] transition hover:scale-[1.02] hover:bg-[#DDB765] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Saving your spot…" : "Save My Spot"}
      </button>
      <p className="text-center text-xs leading-5 text-[#DDB765]">
        We will only email you about this cook-along unless you opt in above. Read our{" "}
        <Link href="/privacy" className="underline underline-offset-2">Privacy Notice</Link>.
      </p>
      {message ? <p role="status" aria-live="polite" className="text-center text-base text-[#DDB765]">{message}</p> : null}
    </form>
  );
}
