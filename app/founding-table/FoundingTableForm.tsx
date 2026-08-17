"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function FoundingTableForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function joinFoundingTable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/founding-table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, marketingOptIn }),
      });
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "We could not join you just now. Please try again.");
        setIsSubmitting(false);
        return;
      }

      if (result.alreadyJoined) {
        setMessage("You have already joined our table. Thank you for being part of OPR.");
      } else {
        setMessage("You are on the list. Please check your inbox for a welcome from OPR.");
      }
      setName("");
      setEmail("");
      setMarketingOptIn(false);
    } catch {
      setMessage("We could not join you just now. Please try again.");
    }

    setIsSubmitting(false);
  }

  return (
    <form onSubmit={joinFoundingTable} className="mt-10 space-y-5 text-left">
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
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#DDB765]/40 bg-[#FFF3DF]/10 px-4 py-3 text-base leading-6 text-[#FFF3DF]">
        <input
          checked={marketingOptIn}
          onChange={(event) => setMarketingOptIn(event.target.checked)}
          type="checkbox"
          className="mt-1 h-4 w-4 accent-[#DDB765]"
        />
        <span>Keep me posted about OPR news, events and future invitations. You can unsubscribe at any time.</span>
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
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-[#DDB765] px-7 py-4 font-medium text-[#08231F] transition hover:scale-[1.02] hover:bg-[#DDB765] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Joining the table…" : "Join Our Table"}
      </button>
      <p className="text-center text-xs leading-5 text-[#DDB765]">
        Your details are kept securely for our invitation list. You can unsubscribe from optional news at any time. Read our{" "}
        <Link href="/privacy" className="underline underline-offset-2">Privacy Notice</Link>.
      </p>
      {message ? <p role="status" aria-live="polite" className="text-center text-base text-[#DDB765]">{message}</p> : null}
    </form>
  );
}
