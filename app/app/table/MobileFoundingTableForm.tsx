"use client";

import { FormEvent, useState } from "react";
import { CheckIcon, Eyebrow } from "../_components/primitives";

const inputClassName =
  "mt-1.5 w-full border border-[#D1AD75] bg-[#FFF3DF] px-3.5 py-3 text-[15px] outline-none transition placeholder:text-stone-500 focus:border-[#123C39]";

export default function MobileFoundingTableForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = Boolean(name && email);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/founding-table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, marketingOptIn: optIn }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "failed");
      setJoined(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error && submitError.message !== "failed"
          ? submitError.message
          : "We could not join you just now. Please try again.",
      );
    }

    setIsSubmitting(false);
  }

  if (joined) {
    return (
      <div role="status" aria-live="polite" className="flex h-full flex-col items-center justify-center px-5 text-center">
        <CheckIcon />
        <h1 className="font-display mb-2.5 mt-5 text-[26px]">You&apos;re on the list.</h1>
        <p className="max-w-[26ch] text-[15px] opacity-80">
          We&apos;ll invite you to join our table as OPR grows.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="px-5 pb-6 pt-16">
      <Eyebrow className="mb-2.5">OPR invitation</Eyebrow>
      <h1 className="font-display mb-3 text-[28px]">Join Our Table</h1>
      <p className="mb-6 text-[15px] leading-[1.6] opacity-80">
        A small circle of early members shaping OPR from the start. We&apos;ll invite you in as we grow.
      </p>

      <label className="mb-3.5 block text-sm font-medium">
        Name
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputClassName} />
      </label>
      <label className="mb-5 block text-sm font-medium">
        Email
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputClassName}
        />
      </label>
      <label className="mb-5 flex items-start gap-2.5 text-[13px] leading-[1.5]">
        <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} className="mt-[3px] accent-[#123C39]" />
        <span>Send me occasional OPR updates.</span>
      </label>

      <button
        type="submit"
        disabled={!canSubmit || isSubmitting}
        className="w-full bg-[#123C39] px-4 py-[14px] text-[16px] font-medium text-[#EED8B2] transition hover:bg-[#0d2b28] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Joining…" : "Join the waiting list"}
      </button>
      {error ? <p role="alert" className="mt-3 text-sm text-red-800">{error}</p> : null}
    </form>
  );
}
