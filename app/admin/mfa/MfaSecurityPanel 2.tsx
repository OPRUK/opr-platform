"use client";

import { useEffect, useState } from "react";
import type { Factor } from "@supabase/supabase-js";
import { supabase } from "../../../lib/supabase/client";
import MfaEnroll from "./MfaEnroll";

export default function MfaSecurityPanel({ onFactorsChanged }: { onFactorsChanged?: () => void }) {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function refresh() {
    setLoading(true);
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors(data?.totp ?? []);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;

    void supabase.auth.mfa.listFactors().then(({ data }) => {
      if (cancelled) return;
      setFactors(data?.totp ?? []);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function removeFactor(factor: Factor) {
    if (!window.confirm("Remove this authenticator? You will be able to sign in with just a magic link until you set up a new one.")) {
      return;
    }
    setRemovingId(factor.id);
    setMessage("");

    if (factor.status === "verified") {
      const { data: aalData, error: aalError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalError || aalData.currentLevel !== "aal2") {
        setMessage("Verify with your authenticator again before removing this factor.");
        setRemovingId(null);
        onFactorsChanged?.();
        return;
      }
    }

    const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
    if (error) {
      setMessage("We could not remove that authenticator. Please try again.");
    } else {
      setMessage("Authenticator removed.");
      await refresh();
      onFactorsChanged?.();
    }
    setRemovingId(null);
  }

  if (enrolling) {
    return (
      <MfaEnroll
        onEnrolled={() => {
          setEnrolling(false);
          setMessage("Two-factor authentication is now enabled.");
          void refresh();
          onFactorsChanged?.();
        }}
        onCancel={() => setEnrolling(false)}
      />
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#123C39]">Two-factor authentication</h2>
      {message ? <p role="status" aria-live="polite" className="mt-3 text-sm text-[#1C5A50]">{message}</p> : null}
      {loading ? (
        <p className="mt-4 text-stone-600">Loading...</p>
      ) : factors.length ? (
        <ul className="mt-5 space-y-3">
          {factors.map((factor) => (
            <li
              key={factor.id}
              className="flex items-center justify-between rounded-2xl border border-[#DDB765]/70 bg-[#EED8B2]/45 px-5 py-4"
            >
              <div>
                <p className="font-medium text-[#123C39]">{factor.friendly_name || "Authenticator app"}</p>
                <p className="text-sm text-stone-600 capitalize">{factor.status}</p>
              </div>
              <button
                type="button"
                onClick={() => void removeFactor(factor)}
                disabled={removingId === factor.id}
                className="rounded-full border border-red-700 px-4 py-2 text-sm font-medium text-red-800 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {removingId === factor.id ? "Removing..." : "Remove"}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 leading-6 text-stone-700">
          No authenticator set up yet. We recommend adding one so this account is protected by more than
          just your email.
        </p>
      )}
      <button
        type="button"
        onClick={() => setEnrolling(true)}
        className="mt-6 rounded-full bg-[#123C39] px-6 py-3 font-medium text-white transition hover:bg-[#08231F]"
      >
        Add authenticator
      </button>
    </div>
  );
}
