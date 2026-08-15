"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";
import { CheckIcon, Divider } from "../_components/primitives";
import { supabase } from "../../../lib/supabase/client";
import { attachmentMetadata, AttachmentKind } from "../../../lib/media-attachments";

// Matches the desktop form's combined agreement (see app/share/RecipeForm.tsx):
// age 18+, licence to publish, and permission to share identifiable people
// in submitted media — relevant here too since attachments can include photos.
const CONSENT_VERSION = "opr-submission-terms-2026-08-03-combined";

const inputClassName =
  "mt-1.5 w-full border border-[#D1AD75] bg-[#FFF3DF] px-3.5 py-3 text-[15px] outline-none transition placeholder:text-stone-500 focus:border-[#123C39]";

type AttachmentKey = "photo" | "audioStory" | "recipeVideo" | "originalRecipePhoto";

const attachments: { key: AttachmentKey; label: string; accept: string; kind: AttachmentKind; icon: React.ReactNode }[] = [
  {
    key: "photo",
    label: "Photo of the dish",
    accept: "image/jpeg,image/png,image/webp",
    kind: "dish",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="6" width="18" height="14" />
        <circle cx="12" cy="13" r="3.5" />
        <path d="M8 6l1.5-2.5h5L16 6" />
      </svg>
    ),
  },
  {
    key: "audioStory",
    label: "Record an audio story",
    accept: ".m4a,.mp3,.wav,.webm,audio/aac,audio/m4a,audio/mp4,audio/mpeg,audio/ogg,audio/wav,audio/webm,audio/x-m4a",
    kind: "audio",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="2" width="6" height="12" rx="3" />
        <path d="M5 10a7 7 0 0014 0M12 17v5M8 22h8" />
      </svg>
    ),
  },
  {
    key: "recipeVideo",
    label: "Upload a short video",
    accept: "video/mp4,video/quicktime,video/webm",
    kind: "video",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="5" width="15" height="14" />
        <path d="M17 9l5-3v12l-5-3" />
      </svg>
    ),
  },
  {
    key: "originalRecipePhoto",
    label: "Photo of the handwritten recipe",
    accept: "image/jpeg,image/png,image/webp",
    kind: "original",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6" />
      </svg>
    ),
  },
];

export default function MobileShareForm() {
  const [submissionToken] = useState(() => crypto.randomUUID());
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [place, setPlace] = useState("");
  const [story, setStory] = useState("");
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [files, setFiles] = useState<Partial<Record<AttachmentKey, File>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [uploadWarnings, setUploadWarnings] = useState<string[]>([]);

  function chooseFile(attachment: (typeof attachments)[number], event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!attachmentMetadata(attachment.kind, file.type, file.name)) {
      setError(`“${file.name}” is not a supported ${attachment.kind} file.`);
      event.target.value = "";
      return;
    }

    setError("");
    setFiles((current) => ({ ...current, [attachment.key]: file }));
  }

  // The design's minimum disable rule is title+story+agreement; name is also
  // required since recipe_submissions.name is a NOT NULL column.
  const canSubmit = Boolean(title && name && story && agreementAccepted);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError("");
    setUploadWarnings([]);

    try {
      // Upload attachments straight from the browser to Supabase Storage.
      // Proxying multi-MB files through the API route hits Vercel's
      // serverless function request-size limit (~4.5MB) once more than one
      // attachment is combined — uploading client-side avoids that entirely,
      // since the route only ever receives short storage paths, not bytes.
      // The `recipe-uploads` bucket is private, so each file is uploaded via
      // a short-lived signed URL minted server-side, rather than a direct
      // anon-key write against the bucket.
      const paths: Partial<Record<AttachmentKey, string>> = {};
      const warnings: string[] = [];
      for (const attachment of attachments) {
        const file = files[attachment.key];
        if (!file) continue;

        const urlResponse = await fetch("/api/submissions/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: attachment.kind,
            size: file.size,
            type: file.type,
            name: file.name,
            submissionToken,
          }),
        });
        if (!urlResponse.ok) {
          const payload = await urlResponse.json().catch(() => null);
          warnings.push(`We couldn't upload “${file.name}” (${payload?.error || "please try again"}).`);
          continue;
        }
        const { path, token, contentType } = await urlResponse.json();

        const { error: uploadError } = await supabase.storage
          .from("recipe-uploads")
          .uploadToSignedUrl(path, token, file, { contentType });

        if (uploadError) {
          warnings.push(`We couldn't upload “${file.name}” (${uploadError.message}).`);
          continue;
        }
        paths[attachment.key] = path;
      }

      const response = await fetch("/api/recipe-submission-mobile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          name,
          location: place,
          story,
          submissionAgreementAccepted: agreementAccepted,
          marketingOptIn: marketing,
          consentVersion: CONSENT_VERSION,
          photoPath: paths.photo,
          audioStoryPath: paths.audioStory,
          recipeVideoPath: paths.recipeVideo,
          originalRecipePath: paths.originalRecipePhoto,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "failed");
      }

      setUploadWarnings(warnings);
      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error && submitError.message !== "failed"
          ? submitError.message
          : "We could not save your recipe just now. Please try again in a moment.",
      );
    }

    setIsSubmitting(false);
  }

  if (submitted) {
    return (
      <div role="status" aria-live="polite" className="flex flex-col items-center pt-14 text-center">
        <CheckIcon />
        <h2 className="font-display mb-2.5 mt-5 text-[26px]">Thank you.</h2>
        <p className="max-w-[26ch] text-[15px] opacity-80">
          Your family&apos;s story is now with the OPR kitchen — we&apos;ll be in touch before it&apos;s published.
        </p>
        {uploadWarnings.length ? (
          <div className="mt-5 border border-amber-700/50 bg-[#FFF3DF] p-4 text-left text-sm text-amber-900">
            <p className="font-semibold">Your recipe was saved, but:</p>
            {uploadWarnings.map((warning) => <p key={warning} className="mt-1">{warning}</p>)}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setTitle("");
            setName("");
            setPlace("");
            setStory("");
            setAgreementAccepted(false);
            setMarketing(false);
            setFiles({});
            setUploadWarnings([]);
            setSubmitted(false);
          }}
          className="mt-6 border border-[#123C39] px-5 py-3 text-sm font-medium transition hover:bg-[#123C39] hover:text-[#EED8B2]"
        >
          Share another recipe
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <label className="mb-3.5 block text-sm font-medium">
        Recipe title
        <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Grandad's Sunday Roast" className={inputClassName} />
      </label>
      <label className="mb-3.5 block text-sm font-medium">
        Your name
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputClassName} />
      </label>
      <label className="mb-3.5 block text-sm font-medium">
        Where it&apos;s from
        <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Town, country" className={inputClassName} />
      </label>
      <label className="mb-5 block text-sm font-medium">
        The story behind it
        <textarea
          required
          value={story}
          onChange={(e) => setStory(e.target.value)}
          rows={4}
          placeholder="Who taught you this recipe, and why does it matter?"
          className={inputClassName}
        />
      </label>

      <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em]">Add to your story</p>
      <div className="flex flex-col gap-2.5">
        {attachments.map((attachment) => {
          const file = files[attachment.key];
          return (
            <label
              key={attachment.key}
              className="flex w-full cursor-pointer items-center gap-2 border border-[#123C39] px-4 py-3 text-sm font-medium transition hover:bg-[#123C39] hover:text-[#EED8B2]"
            >
              {attachment.icon}
              <span className="flex-1 truncate">{file ? file.name : attachment.label}</span>
              <input type="file" accept={attachment.accept} onChange={(e) => chooseFile(attachment, e)} className="hidden" />
            </label>
          );
        })}
      </div>

      <Divider className="my-5" />

      <label className="mb-3 flex items-start gap-2.5 text-[13px] leading-[1.5]">
        <input
          required
          type="checkbox"
          checked={agreementAccepted}
          onChange={(e) => setAgreementAccepted(e.target.checked)}
          className="mt-[3px] accent-[#123C39]"
        />
        <span>
          I confirm I&apos;m 18 or over, this recipe and story are mine to share, and I have permission to
          share anyone identifiable in my photos or recordings. I grant OPR a licence to publish it.{" "}
          <Link href="/terms" className="underline underline-offset-4">
            Read our full terms.
          </Link>
        </span>
      </label>
      <label className="mb-5 flex items-start gap-2.5 text-[13px] leading-[1.5]">
        <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-[3px] accent-[#123C39]" />
        <span>Keep me updated about OPR (optional).</span>
      </label>

      <button
        type="submit"
        disabled={!canSubmit || isSubmitting}
        className="w-full bg-[#123C39] px-4 py-[14px] text-[16px] font-medium text-[#EED8B2] transition hover:bg-[#0d2b28] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Saving your recipe…" : "Submit your recipe"}
      </button>
      {error ? <p role="alert" className="mt-3 text-sm text-red-800">{error}</p> : null}
    </form>
  );
}
