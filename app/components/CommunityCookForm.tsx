"use client";

import { FormEvent, useRef, useState } from "react";

type CommunityCookFormProps = {
  recipeTitle: string;
  recipeId?: number;
  recipeSlug?: string;
};

export default function CommunityCookForm({ recipeId, recipeSlug, recipeTitle }: CommunityCookFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    formData.set("recipeTitle", recipeTitle);
    if (recipeId) formData.set("recipeId", String(recipeId));
    if (recipeSlug) formData.set("recipeSlug", recipeSlug);

    try {
      const response = await fetch("/api/recipe-community-cook", { method: "POST", body: formData });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error ?? "We could not save your post");
      formRef.current?.reset();
      setMessage("Thank you — your photo and note are with the OPR team for approval.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not save your post");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="bg-[#EED8B2]/60 px-6 pb-5 pt-4 md:pb-6 md:pt-5">
      <div className="mx-auto grid max-w-5xl gap-10 rounded-[2rem] bg-[#FFF3DF] p-8 shadow-xl shadow-[#1C5A50]/10 md:grid-cols-[0.85fr_1.15fr] md:p-12">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#9A622A]">Families who&apos;ve made this</p>
          <h2 className="mt-4 text-4xl font-bold text-[#123C39]">Add your place at the table.</h2>
          <p className="mt-5 text-lg leading-8 text-stone-700">
            Cooked {recipeTitle}? Share a photo or a few words for the families who make it next.
            Every post is checked by OPR before it appears here.
          </p>
        </div>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          <label className="block text-sm font-medium text-[#123C39]">
            Your first name
            <input name="name" required maxLength={80} className="mt-2 w-full rounded-xl border border-[#DDB765] bg-white px-4 py-3 outline-none focus:border-[#123C39] focus:ring-2 focus:ring-[#DDB765]/60" />
          </label>
          <label className="block text-sm font-medium text-[#123C39]">
            Your note <span className="font-normal text-stone-500">(optional)</span>
            <textarea name="note" rows={4} maxLength={1000} placeholder="Tell us how it went, what you served it with, or the memory it created." className="mt-2 w-full resize-y rounded-xl border border-[#DDB765] bg-white px-4 py-3 leading-6 outline-none focus:border-[#123C39] focus:ring-2 focus:ring-[#DDB765]/60" />
          </label>
          <label className="block text-sm font-medium text-[#123C39]">
            A photo of your dish <span className="font-normal text-stone-500">(optional)</span>
            <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm text-stone-700 file:mr-4 file:rounded-full file:border-0 file:bg-[#123C39] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#08231F]" />
            <span className="mt-2 block text-xs text-stone-500">JPG, PNG or WebP, up to 5MB.</span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#DDB765] bg-[#EED8B2]/50 p-4 text-sm leading-6 text-[#123C39]">
            <input name="agreementAccepted" value="true" type="checkbox" required className="mt-1 h-4 w-4 accent-[#123C39]" />
            <span>I confirm this photo and note are mine to share, and I am happy for Other People&apos;s Recipes to publish them with this recipe.</span>
          </label>
          <button disabled={sending} className="rounded-full bg-[#123C39] px-7 py-3 font-medium text-white transition hover:bg-[#08231F] disabled:cursor-not-allowed disabled:opacity-60">
            {sending ? "Sending…" : "Share your cook"}
          </button>
          {message ? <p role={message.startsWith("Thank") ? "status" : "alert"} aria-live="polite" className={`text-sm leading-6 ${message.startsWith("Thank") ? "text-[#1C5A50]" : "text-red-800"}`}>{message}</p> : null}
        </form>
      </div>
    </section>
  );
}
