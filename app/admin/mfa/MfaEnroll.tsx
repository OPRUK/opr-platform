"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "../../../lib/supabase/client";

export default function MfaEnroll({
  onEnrolled,
  onCancel,
}: {
  onEnrolled: () => void;
  onCancel: () => void;
}) {
  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
      });
      if (cancelled) return;
      if (enrollError || !data) {
        setError(enrollError?.message ?? "We could not start two-factor setup. Please try again.");
        setStarting(false);
        return;
      }
      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setStarting(false);
    }

    void start();
    return () => {
      cancelled = true;
    };
  }, []);

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
      onEnrolled();
    } finally {
      setVerifying(false);
    }
  }

  async function cancel() {
    if (factorId) {
      await supabase.auth.mfa.unenroll({ factorId }).catch(() => undefined);
    }
    onCancel();
  }

  if (starting) {
    return <p className="text-stone-600">Preparing two-factor setup...</p>;
  }

  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-bold text-[#123C39]">Set up two-factor authentication</h2>
      <p className="mt-3 leading-6 text-stone-700">
        Scan this code with an authenticator app (like Google Authenticator or 1Password), or enter the
        secret below by hand.
      </p>
      {error ? <p role="alert" className="mt-4 text-sm text-red-800">{error}</p> : null}
      {qrCode ? (
        <Image
          src={qrCode}
          alt="Two-factor QR code"
          width={192}
          height={192}
          unoptimized
          className="mt-5 h-48 w-48 rounded-xl border border-[#D1AD75]/70 bg-white p-3"
        />
      ) : null}
      {secret ? (
        <p className="mt-4 break-all rounded-xl bg-[#F4DDAE] px-4 py-3 font-mono text-sm text-[#123C39]">{secret}</p>
      ) : null}
      <label className="mt-6 block text-sm font-medium text-[#123C39]">
        Code from your authenticator app
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          className="mt-3 w-full rounded-xl border border-[#D1AD75] bg-white px-4 py-3 outline-none transition focus:border-[#123C39] focus:ring-2 focus:ring-[#D1AD75]/60"
        />
      </label>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => void verify()}
          disabled={verifying}
          className="rounded-full bg-[#123C39] px-6 py-3 font-medium text-white transition hover:bg-[#08231F] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {verifying ? "Checking..." : "Verify and enable"}
        </button>
        <button
          type="button"
          onClick={() => void cancel()}
          className="rounded-full border border-[#123C39] px-6 py-3 font-medium text-[#123C39] transition hover:bg-[#123C39] hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
