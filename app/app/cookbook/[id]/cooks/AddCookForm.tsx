"use client";

import { ChangeEvent, FormEvent, useState } from "react";

const inputClassName =
  "mt-1.5 w-full border border-[#D1AD75] bg-[#F4DDAE] px-3.5 py-2.5 text-[15px] outline-none transition placeholder:text-stone-500 focus:border-[#123C39]";

export default function AddCookForm({
  recipeSlug,
  recipeTitle,
  recipeId,
}: {
  recipeSlug: string | null;
  recipeTitle: string;
  recipeId: number | null;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    setPhoto(event.target.files?.[0] ?? null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.set("name", name);
    formData.set("note", note);
    formData.set("recipeTitle", recipeTitle);
    if (recipeId) formData.set("recipeId", String(recipeId));
    if (recipeSlug) formData.set("recipeSlug", recipeSlug);
    formData.set("agreementAccepted", String(agreementAccepted));
    if (photo) formData.set("photo", photo);

    try {
      const response = await fetch("/api/recipe-community-cook", { method: "POST", body: formData });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error ?? "failed");

      setSubmitted(true);
      setOpen(false);
      setName("");
      setNote("");
      setPhoto(null);
      setAgreementAccepted(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error && submitError.message !== "failed"
          ? submitError.message
          : "We could not save that just now. Please try again.",
      );
    }

    setIsSubmitting(false);
  }

  if (submitted) {
    return (
      <p role="status" aria-live="polite" className="mt-4 border border-[#123C39]/35 bg-[#FFF3DF] p-4 text-center text-sm leading-6">
        Thank you — your photo and note are with the OPR team and will appear here once reviewed.
      </p>
    );
  }

  if (open) {
    return (
      <form onSubmit={submit} className="mt-4 border border-[#123C39]/35 bg-[#FFF3DF] p-4">
        <label className="block text-sm font-medium">
          Your name
          <input
            required
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            className={inputClassName}
          />
        </label>
        <label className="mt-3.5 block text-sm font-medium">
          How did it go? <span className="font-normal text-stone-500">(optional)</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Tell us about your cook"
            className={inputClassName}
          />
        </label>
        <label className="mt-3.5 block text-sm font-medium">
          A photo of your dish <span className="font-normal text-stone-500">(optional)</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={choosePhoto}
            className="mt-1.5 block w-full text-sm file:mr-3 file:border-0 file:bg-[#123C39] file:px-3.5 file:py-2 file:text-sm file:font-medium file:text-[#EED8B2]"
          />
        </label>
        <label className="mt-3.5 flex items-start gap-2.5 text-[13px] leading-[1.5]">
          <input
            required
            type="checkbox"
            checked={agreementAccepted}
            onChange={(e) => setAgreementAccepted(e.target.checked)}
            className="mt-[3px] accent-[#123C39]"
          />
          <span>This photo and note are mine to share, and OPR may publish them with this recipe.</span>
        </label>
        <button
          type="submit"
          disabled={!name || !agreementAccepted || isSubmitting}
          className="mt-4 w-full bg-[#123C39] px-[18px] py-3.5 text-[15px] font-medium text-[#EED8B2] transition hover:bg-[#0d2b28] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Posting…" : "Post it"}
        </button>
        {error ? <p role="alert" className="mt-3 text-sm text-red-800">{error}</p> : null}
      </form>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 flex w-full items-center gap-2 bg-[#123C39] px-[18px] py-4 text-[17px] font-medium text-[#EED8B2] transition hover:bg-[#0d2b28]"
      >
        <span>Add your own photo &amp; note</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="ml-auto flex-shrink-0">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
      <p className="mt-3 text-center text-[11px] opacity-80">Reviewed by OPR before it appears publicly.</p>
    </>
  );
}
