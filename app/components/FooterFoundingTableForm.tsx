"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function FooterFoundingTableForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function saveSeat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/founding-table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, marketingOptIn: true }),
      });
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "We could not save your seat just now. Please try again.");
        return;
      }

      setMessage(
        result.alreadyJoined
          ? "Your seat is already saved. Thank you for being part of OPR."
          : "Your seat is saved. Please check your inbox for a welcome from OPR.",
      );
      setName("");
      setEmail("");
    } catch {
      setMessage("We could not save your seat just now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="mt-7 max-w-md border-t border-[#1C5A50] pt-6"
      style={{ fontFamily: '"Gill Sans MT", "Gill Sans", Avenir, Corbel, Arial, sans-serif' }}
    >
      <p className="text-2xl font-semibold text-[#FFF3DF]">Save your seat at the table</p>
      <form onSubmit={saveSeat} className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="sr-only" htmlFor="footer-founding-name">First name</label>
        <input
          id="footer-founding-name"
          name="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="given-name"
          placeholder="First name"
          className="min-w-0 rounded-xl border border-[#8B6B42] bg-[#FFF3DF] px-3.5 py-3 text-sm text-[#123C39] outline-none transition placeholder:text-stone-500 focus:border-[#FFD58C] focus:ring-2 focus:ring-[#FFD58C]/50"
        />
        <label className="sr-only" htmlFor="footer-founding-email">Email address</label>
        <input
          id="footer-founding-email"
          name="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          autoComplete="email"
          placeholder="Email address"
          className="min-w-0 rounded-xl border border-[#8B6B42] bg-[#FFF3DF] px-3.5 py-3 text-sm text-[#123C39] outline-none transition placeholder:text-stone-500 focus:border-[#FFD58C] focus:ring-2 focus:ring-[#FFD58C]/50"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-[#DDB765] px-4 py-3 text-sm font-bold text-[#08231F] transition hover:bg-[#FFD58C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFD58C] disabled:cursor-not-allowed disabled:opacity-70 sm:col-span-2"
        >
          {isSubmitting ? "Saving your seat…" : "Save my seat"}
        </button>
      </form>
      <p className="mt-3 text-xs leading-5 text-[#DABF8D]">
        By saving your seat, you agree to receive OPR news and invitations. Unsubscribe at any time. Read our{" "}
        <Link href="/privacy" className="underline underline-offset-2 transition hover:text-[#FFF3DF]">Privacy Notice</Link>.
      </p>
      <p role="status" aria-live="polite" className="mt-2 min-h-5 text-sm text-[#FFE4A3]">{message}</p>
    </div>
  );
}
