"use client";

import { useState } from "react";
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
  const [deviceName, setDeviceName] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [verifying, setVerifying] = useState(false);

  async function start() {
    const friendlyName = deviceName.trim();
    if (!friendlyName) {
      setError("Give this authenticator a name, such as Chaten's phone or Backup authenticator.");
      return;
    }

    setError("");
    setStarting(true);
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName,
    });
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

  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-bold text-[#123C39]">Set up two-factor authentication</h2>
      {!factorId ? (
        <>
          <p className="mt-3 leading-6 text-stone-700">
            Use a unique name so you can tell your primary and backup authenticators apart.
          </p>
          <label className="mt-6 block text-sm font-medium text-[#123C39]">
            Device name
            <input
              value={deviceName}
              onChange={(event) => setDeviceName(event.target.value.slice(0, 50))}
              autoComplete="off"
              placeholder="Backup authenticator"
              className="mt-3 w-full rounded-xl border border-[#DDB765] bg-white px-4 py-3 outline-none transition focus:border-[#123C39] focus:ring-2 focus:ring-[#DDB765]/60"
            />
          </label>
        </>
      ) : (
        <p className="mt-3 leading-6 text-stone-700">
          Scan this code with the named authenticator, or enter the secret below by hand. Do not store
          the secret with the credentials for this account.
        </p>
      )}
      {error ? <p role="alert" className="mt-4 text-sm text-red-800">{error}</p> : null}
      {qrCode ? (
        <Image
          src={qrCode}
          alt="Two-factor QR code"
          width={192}
          height={192}
          unoptimized
          className="mt-5 h-48 w-48 rounded-xl border border-[#DDB765]/70 bg-white p-3"
        />
      ) : null}
      {secret ? (
        <p className="mt-4 break-all rounded-xl bg-[#EED8B2] px-4 py-3 font-mono text-sm text-[#123C39]">{secret}</p>
      ) : null}
      {factorId ? <label className="mt-6 block text-sm font-medium text-[#123C39]">
        Code from your authenticator app
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          className="mt-3 w-full rounded-xl border border-[#DDB765] bg-white px-4 py-3 outline-none transition focus:border-[#123C39] focus:ring-2 focus:ring-[#DDB765]/60"
        />
      </label> : null}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => void (factorId ? verify() : start())}
          disabled={verifying || starting}
          className="rounded-full bg-[#123C39] px-6 py-3 font-medium text-white transition hover:bg-[#08231F] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {starting ? "Preparing..." : verifying ? "Checking..." : factorId ? "Verify and enable" : "Create QR code"}
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
