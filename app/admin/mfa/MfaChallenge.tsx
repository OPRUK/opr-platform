"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase/client";

export default function MfaChallenge({
  factorId,
  onVerified,
  onSignOut,
}: {
  factorId: string;
  onVerified: () => void;
  onSignOut: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  async function verify() {
    setError("");
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setVerifying(true);
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError || !challenge) {
        setError(challengeError?.message ?? "We could not start verification. Please try again.");
        return;
      }
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: code.trim(),
      });
      if (verifyError) {
        setError("That code did not match. Check the time on your device and try again.");
        return;
      }
      onVerified();
    } finally {
      setVerifying(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#EED8B2] px-6 text-[#123C39]">
      <div className="w-full max-w-md rounded-3xl bg-[#FFF3DF] p-8 shadow-xl shadow-[#1C5A50]/15 md:p-10">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Private OPR area</p>
        <h1 className="font-display mt-4 text-3xl font-bold">Enter your code</h1>
        <p className="mt-5 leading-7 text-stone-700">
          Enter the 6-digit code from your authenticator app to finish signing in.
        </p>
        {error ? <p role="alert" className="mt-4 text-sm text-red-800">{error}</p> : null}
        <label className="mt-6 block text-sm font-medium">
          Authenticator code
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={(event) => {
              if (event.key === "Enter") void verify();
            }}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            placeholder="123456"
            className="mt-3 w-full rounded-xl border border-[#D1AD75] bg-[#F4DDAE] px-4 py-3 outline-none transition focus:border-[#123C39] focus:ring-2 focus:ring-[#D1AD75]/60"
          />
        </label>
        <div className="mt-8 flex items-center gap-4">
          <button
            type="button"
            onClick={() => void verify()}
            disabled={verifying}
            className="rounded-full bg-[#123C39] px-7 py-3 font-medium text-white transition hover:bg-[#08231F] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {verifying ? "Checking..." : "Verify"}
          </button>
          <button type="button" onClick={onSignOut} className="text-sm font-medium underline">
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}
