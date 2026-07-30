"use client";

import { FormEvent, useState } from "react";

export default function FoundingTableForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
        body: JSON.stringify({ name, email }),
      });
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "We could not join you just now. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setMessage("You are on the list. Please check your inbox for a welcome from OPR.");
      setName("");
      setEmail("");
    } catch {
      setMessage("We could not join you just now. Please try again.");
    }

    setIsSubmitting(false);
  }

  return (
    <form onSubmit={joinFoundingTable} className="mt-10 space-y-5 text-left">
      <label className="block text-sm font-medium text-[#FFF3DF]">
        First name
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="given-name"
          className="mt-2 w-full rounded-xl border border-[#DDB765]/60 bg-[#FFF3DF] px-4 py-3 text-[#4A4232] outline-none transition focus:border-[#FFD58C] focus:ring-2 focus:ring-[#FFD58C]/50"
          placeholder="Your first name"
        />
      </label>
      <label className="block text-sm font-medium text-[#FFF3DF]">
        Email address
        <input
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          autoComplete="email"
          className="mt-2 w-full rounded-xl border border-[#DDB765]/60 bg-[#FFF3DF] px-4 py-3 text-[#4A4232] outline-none transition focus:border-[#FFD58C] focus:ring-2 focus:ring-[#FFD58C]/50"
          placeholder="you@example.com"
        />
      </label>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-[#DDB765] px-7 py-4 font-medium text-[#33291F] transition hover:scale-[1.02] hover:bg-[#FFD58C] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Joining the table…" : "Join the Founding Table"}
      </button>
      <p className="text-center text-xs leading-5 text-[#F0D4A0]">
        By joining, you agree to receive occasional news from OPR. You can unsubscribe at any time.
      </p>
      {message ? <p className="text-center text-sm text-[#FFE4A3]">{message}</p> : null}
    </form>
  );
}
