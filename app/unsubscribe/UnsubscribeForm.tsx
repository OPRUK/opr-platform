"use client";

import { useState } from "react";

export default function UnsubscribeForm({ email, token }: { email: string; token: string }) {
  const [status, setStatus] = useState<"ready" | "working" | "done" | "error">("ready");
  const [message, setMessage] = useState("");

  async function unsubscribe() {
    setStatus("working");
    setMessage("");

    try {
      const response = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to unsubscribe");

      setStatus("done");
      setMessage("You will no longer receive optional OPR news, invitations or newsletters at this address.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "We could not update your preferences just now.");
    }
  }

  if (status === "done") {
    return <p role="status" aria-live="polite" className="rounded-2xl bg-[#EED8B2] px-5 py-4 leading-7 text-[#123C39]">{message}</p>;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void unsubscribe()}
        disabled={status === "working"}
        className="rounded-full bg-[#123C39] px-7 py-4 font-medium text-white transition hover:bg-[#08231F] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "working" ? "Updating your preferences…" : "Unsubscribe from OPR updates"}
      </button>
      {status === "error" ? <p role="alert" className="mt-4 text-sm text-red-800">{message}</p> : null}
    </div>
  );
}
