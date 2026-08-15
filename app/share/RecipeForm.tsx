"use client";

import Link from "next/link";
import NextImage from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";

// Bump this whenever the submission licence wording on /terms changes, so we
// always know exactly which version of the terms a contributor agreed to.
const CONSENT_VERSION = "opr-submission-terms-2026-08-03-combined";

// iOS Safari sometimes hands back a file whose reported type (or even
// extension) is "image/jpeg" while the underlying bytes are still
// HEIC-encoded — a platform quirk, not something this app's validation can
// see. Sent as-is, OpenAI's vision model can't decode the real bytes and
// correctly (per its own "don't invent content" instructions) returns every
// field as null rather than an error, which looks like a silent failure
// rather than a rejection. Re-encoding through a canvas first guarantees the
// server always receives genuine JPEG bytes regardless of the source
// format or any mislabelling.
async function reencodeAsJpeg(file: File): Promise<File> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not read that image"));
      img.src = objectUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(image, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    if (!blob) return file;

    return new File([blob], "recipe-card.jpg", { type: "image/jpeg" });
  } catch {
    // If the browser genuinely can't decode it, fall back to the original
    // file and let the existing server-side error handling take over.
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

type RecipeFormValues = {
  name: string;
  email: string;
  location: string;
  title: string;
  category: string;
  servings: string;
  prepTime: string;
  cookTime: string;
  story: string;
  ingredients: string;
  method: string;
  cookNotes: string;
  submissionAgreementAccepted: boolean;
  marketingOptIn: boolean;
};

const initialValues: RecipeFormValues = {
  name: "",
  email: "",
  location: "",
  title: "",
  category: "",
  servings: "",
  prepTime: "",
  cookTime: "",
  story: "",
  ingredients: "",
  method: "",
  cookNotes: "",
  submissionAgreementAccepted: false,
  marketingOptIn: false,
};

const recipeDraftKey = "opr-recipe-submission-draft";

function getInitialValues(): RecipeFormValues {
  if (typeof window === "undefined") {
    return initialValues;
  }

  try {
    const savedDraft = window.sessionStorage.getItem(recipeDraftKey);
    return savedDraft ? { ...initialValues, ...JSON.parse(savedDraft) } : initialValues;
  } catch {
    window.sessionStorage.removeItem(recipeDraftKey);
    return initialValues;
  }
}

export default function RecipeForm() {
  const [values, setValues] = useState(getInitialValues);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [contributorPhoto, setContributorPhoto] = useState<File | null>(null);
  const [contributorPhotoPreview, setContributorPhotoPreview] = useState("");
  const [originalRecipe, setOriginalRecipe] = useState<File | null>(null);
  const [originalRecipePreview, setOriginalRecipePreview] = useState("");
  const [isReadingRecipe, setIsReadingRecipe] = useState(false);
  const [recipeReadMessage, setRecipeReadMessage] = useState("");
  const [audioStory, setAudioStory] = useState<File | null>(null);
  const [audioStoryPreview, setAudioStoryPreview] = useState("");
  const [recipeVideo, setRecipeVideo] = useState<File | null>(null);
  const [recipeVideoPreview, setRecipeVideoPreview] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<number | null>(null);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [instagramCopied, setInstagramCopied] = useState(false);

  useEffect(() => {
    window.sessionStorage.setItem(recipeDraftKey, JSON.stringify(values));
  }, [values]);

  function updateValue(field: keyof RecipeFormValues, value: string | boolean) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function thankYouShareText() {
    const recipeName = values.title ? ` my family recipe, ${values.title},` : " a family recipe";
    return `I’ve just shared${recipeName} with Other People's Recipes. What recipe feels like home to you? Share yours: https://otherpeoplesrecipes.co.uk/share`;
  }

  function shareOnWhatsApp() {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(thankYouShareText())}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function shareOnFacebook() {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://otherpeoplesrecipes.co.uk/share")}&quote=${encodeURIComponent(thankYouShareText())}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function prepareInstagramShare() {
    try {
      await navigator.clipboard.writeText(thankYouShareText());
      setInstagramCopied(true);
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
      window.setTimeout(() => setInstagramCopied(false), 3500);
    } catch {
      setInstagramCopied(false);
    }
  }

  function choosePhoto(file: File | null) {
    if (!file) {
      setPhoto(null);
      setPhotoPreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSubmissionError("Please choose an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSubmissionError("Please choose a photo smaller than 5 MB.");
      return;
    }

    setSubmissionError("");
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function chooseContributorPhoto(file: File | null) {
    if (!file) {
      setContributorPhoto(null);
      setContributorPhotoPreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSubmissionError("Please choose an image file for the cook's photo.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSubmissionError("Please choose a cook's photo smaller than 5 MB.");
      return;
    }

    setSubmissionError("");
    setContributorPhoto(file);
    setContributorPhotoPreview(URL.createObjectURL(file));
  }

  function chooseOriginalRecipe(file: File | null) {
    if (!file) {
      setOriginalRecipe(null);
      setOriginalRecipePreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSubmissionError("Please choose an image of the original recipe.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setSubmissionError("Please choose an original recipe image smaller than 10 MB.");
      return;
    }

    setSubmissionError("");
    setRecipeReadMessage("");
    setOriginalRecipe(file);
    setOriginalRecipePreview(URL.createObjectURL(file));
  }

  async function readOriginalRecipe() {
    if (!originalRecipe) {
      setSubmissionError("Choose a photo of the original recipe first.");
      return;
    }

    setIsReadingRecipe(true);
    setSubmissionError("");
    setRecipeReadMessage("");

    try {
      const formData = new FormData();
      formData.set("recipeImage", await reencodeAsJpeg(originalRecipe));
      const response = await fetch("/api/recipe-scan", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not read that recipe.");

      const draft = result.draft as Partial<RecipeFormValues>;
      setValues((current) => ({
        ...current,
        title: draft.title || current.title,
        category: draft.category || current.category,
        servings: draft.servings || current.servings,
        ingredients: draft.ingredients || current.ingredients,
        method: draft.method || current.method,
        cookNotes: draft.cookNotes || current.cookNotes,
      }));
      setRecipeReadMessage("We have made a first draft below. Please check every detail before you share it — old handwriting can be wonderfully unpredictable.");
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "We could not read that recipe just now.");
    } finally {
      setIsReadingRecipe(false);
    }
  }

  function chooseAudioStory(file: File | null) {
    if (!file) {
      setAudioStory(null);
      setAudioStoryPreview("");
      return;
    }

    if (!file.type.startsWith("audio/")) {
      setSubmissionError("Please choose an audio file for the voice story.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setSubmissionError("Please choose a voice story smaller than 10 MB.");
      return;
    }

    setSubmissionError("");
    setAudioStory(file);
    setAudioStoryPreview(URL.createObjectURL(file));
  }

  function chooseRecipeVideo(file: File | null) {
    if (!file) {
      setRecipeVideo(null);
      setRecipeVideoPreview("");
      return;
    }

    if (!file.type.startsWith("video/")) {
      setSubmissionError("Please choose a video file for the recipe.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setSubmissionError("Please choose a recipe video smaller than 20 MB.");
      return;
    }

    setSubmissionError("");
    setRecipeVideo(file);
    setRecipeVideoPreview(URL.createObjectURL(file));
  }

  async function startVoiceRecording() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setSubmissionError("Voice recording is not available in this browser. You can still upload an audio file below.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorderRef.current = recorder;
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      });
      recorder.addEventListener("stop", () => {
        if (recordingTimerRef.current) {
          window.clearTimeout(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        const audioType = recorder.mimeType || "audio/webm";
        const extension = audioType.includes("mp4") ? "m4a" : audioType.includes("ogg") ? "ogg" : "webm";
        chooseAudioStory(new File([new Blob(chunks, { type: audioType })], `opr-voice-story.${extension}`, { type: audioType }));
        stream.getTracks().forEach((track) => track.stop());
        recorderRef.current = null;
        setIsRecording(false);
      });

      setSubmissionError("");
      recorder.start();
      recordingTimerRef.current = window.setTimeout(() => recorder.stop(), 10 * 60 * 1000);
      setIsRecording(true);
    } catch {
      setSubmissionError("We could not access your microphone. Please allow microphone access or upload an audio file instead.");
    }
  }

  function stopVoiceRecording() {
    if (recordingTimerRef.current) {
      window.clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }

  async function submitRecipe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmissionError("");

    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("email", values.email);
    formData.set("location", values.location);
    formData.set("title", values.title);
    formData.set("category", values.category);
    formData.set("servings", values.servings);
    formData.set("prepTimeMinutes", values.prepTime);
    formData.set("cookTimeMinutes", values.cookTime);
    formData.set("story", values.story);
    formData.set("ingredients", values.ingredients);
    formData.set("method", values.method);
    formData.set("cookNotes", values.cookNotes);
    formData.set("submissionAgreementAccepted", String(values.submissionAgreementAccepted));
    formData.set("marketingOptIn", String(values.marketingOptIn));
    formData.set("consentVersion", CONSENT_VERSION);
    if (photo) formData.set("photo", photo);
    if (contributorPhoto) formData.set("contributorPhoto", contributorPhoto);
    if (originalRecipe) formData.set("originalRecipe", originalRecipe);
    if (audioStory) formData.set("audioStory", audioStory);
    if (recipeVideo) formData.set("recipeVideo", recipeVideo);

    try {
      const response = await fetch("/api/recipe-submission", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Recipe submission failed");
    } catch {
      setSubmissionError(
        "We could not save your recipe just now. Please try again in a moment.",
      );
      setIsSubmitting(false);
      return;
    }

    window.sessionStorage.removeItem(recipeDraftKey);
    setPhoto(null);
    setPhotoPreview("");
    setContributorPhoto(null);
    setContributorPhotoPreview("");
    setOriginalRecipe(null);
    setOriginalRecipePreview("");
    setAudioStory(null);
    setAudioStoryPreview("");
    setRecipeVideo(null);
    setRecipeVideoPreview("");
    setSubmissionComplete(true);
    setIsSubmitting(false);
  }

  if (submissionComplete) {
    return (
      <section className="rounded-3xl bg-[#FFF3DF] p-8 text-center shadow-xl shadow-[#1C5A50]/15 md:p-12">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
          Your recipe has been received
        </p>
        <h2 className="mt-5 text-4xl font-bold md:text-5xl">
          Thank you for sharing it with us.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-stone-700">
          Thank you for trusting OPR with your family&apos;s story. Our team will
          read it and may be in touch if it could become part of the living
          cookbook.
        </p>
        <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-[#D1AD75]/80 bg-[#F4DDAE]/65 p-6">
          <p className="text-sm uppercase tracking-[0.27em] text-[#9A622A]">
            Keep the story moving
          </p>
          <h3 className="mt-3 text-2xl font-bold text-[#123C39]">
            Invite the person who taught it to you.
          </h3>
          <p className="mt-3 leading-7 text-stone-700">
            They might have the next recipe that belongs in the OPR Cookbook.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={shareOnWhatsApp}
              className="rounded-full bg-[#1C5A50] px-5 py-3 font-medium text-white transition hover:scale-105 hover:bg-[#123C39]"
            >
              Share on WhatsApp
            </button>
            <button
              type="button"
              onClick={shareOnFacebook}
              className="rounded-full bg-[#315B9A] px-5 py-3 font-medium text-white transition hover:scale-105 hover:bg-[#244779]"
            >
              Share on Facebook
            </button>
            <button
              type="button"
              onClick={prepareInstagramShare}
              className="rounded-full border border-[#9A622A] px-5 py-3 font-medium text-[#123C39] transition hover:scale-105 hover:bg-[#FFF3DF]"
            >
              {instagramCopied ? "Caption copied" : "Share on Instagram"}
            </button>
          </div>
          {instagramCopied ? (
            <p className="mt-4 text-sm text-[#1C5A50]">
              Your caption is copied. Paste it into your Instagram post or Story.
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => {
            setValues(initialValues);
            setPhoto(null);
            setPhotoPreview("");
            setContributorPhoto(null);
            setContributorPhotoPreview("");
            setOriginalRecipe(null);
            setOriginalRecipePreview("");
            setAudioStory(null);
            setAudioStoryPreview("");
            setRecipeVideo(null);
            setRecipeVideoPreview("");
            window.sessionStorage.removeItem(recipeDraftKey);
            setSubmissionComplete(false);
          }}
          className="mt-9 rounded-full border border-[#123C39] px-7 py-3 font-medium transition hover:bg-[#123C39] hover:text-white"
        >
          Share another recipe
        </button>
      </section>
    );
  }

  const inputClassName =
    "mt-3 w-full rounded-xl border border-[#D1AD75] bg-[#F4DDAE] px-4 py-3 outline-none transition placeholder:text-stone-500 focus:border-[#123C39] focus:ring-2 focus:ring-[#D1AD75]/60";

  return (
    <form
      onSubmit={submitRecipe}
      className="rounded-3xl bg-[#FFF3DF] p-8 shadow-xl shadow-[#1C5A50]/15 md:p-12"
    >
      <div className="border-b border-[#D1AD75]/70 pb-8">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
          Your recipe
        </p>
        <h2 className="mt-4 text-3xl font-bold md:text-4xl">
          Give it a place in the book.
        </h2>
        <p className="mt-4 max-w-2xl leading-7 text-stone-700">
          There is no need for it to be perfect. The recipes we remember best
          are often the ones written in a hurry, with a story beside them.
        </p>
      </div>

      <fieldset className="mt-10">
        <legend className="text-xl font-bold">About you</legend>
        <div className="mt-6 grid gap-7 md:grid-cols-2">
          <label className="block text-sm font-medium">
            Your name
            <input
              required
              value={values.name}
              onChange={(event) => updateValue("name", event.target.value)}
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Your first name"
              className={inputClassName}
            />
          </label>

          <label className="block text-sm font-medium">
            Email address
            <input
              required
              value={values.email}
              onChange={(event) => updateValue("email", event.target.value)}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={inputClassName}
            />
          </label>
        </div>

        <label className="mt-7 block text-sm font-medium">
          Town or city <span className="font-normal text-stone-500">(optional)</span>
          <input
            value={values.location}
            onChange={(event) => updateValue("location", event.target.value)}
            type="text"
            name="location"
            placeholder="For example: Birmingham"
            className={inputClassName}
          />
        </label>
      </fieldset>

      <fieldset className="mt-12 border-t border-[#D1AD75]/70 pt-10">
        <legend className="text-xl font-bold">The recipe</legend>

        <label className="mt-6 block text-sm font-medium">
          What&apos;s it called?
          <input
            required
            value={values.title}
            onChange={(event) => updateValue("title", event.target.value)}
            type="text"
            name="title"
            placeholder="For example: Nana's Sunday Rice Pudding"
            className={inputClassName}
          />
        </label>

        <div className="mt-7 grid gap-7 md:grid-cols-2">
          <label className="block text-sm font-medium">
            Type of recipe
            <select
              required
              value={values.category}
              onChange={(event) => updateValue("category", event.target.value)}
              name="category"
              className={inputClassName}
            >
              <option value="" disabled>
                Choose one
              </option>
              <option>Breakfast or brunch</option>
              <option>Starter or side</option>
              <option>Main course</option>
              <option>Dessert or baking</option>
              <option>Drink</option>
              <option>Something else</option>
            </select>
          </label>

          <label className="block text-sm font-medium">
            How many does it serve? <span className="font-normal text-stone-500">(optional)</span>
            <input
              value={values.servings}
              onChange={(event) => updateValue("servings", event.target.value)}
              type="text"
              name="servings"
              placeholder="For example: 4 people"
              className={inputClassName}
            />
          </label>
        </div>

        <div className="mt-7 grid gap-7 md:grid-cols-2">
          <label className="block text-sm font-medium">
            Prep time (minutes) <span className="font-normal text-stone-500">(optional)</span>
            <input
              value={values.prepTime}
              onChange={(event) => updateValue("prepTime", event.target.value)}
              type="number"
              min="0"
              name="prepTimeMinutes"
              placeholder="For example: 20"
              className={inputClassName}
            />
          </label>

          <label className="block text-sm font-medium">
            Cook time (minutes) <span className="font-normal text-stone-500">(optional)</span>
            <input
              value={values.cookTime}
              onChange={(event) => updateValue("cookTime", event.target.value)}
              type="number"
              min="0"
              name="cookTimeMinutes"
              placeholder="For example: 45"
              className={inputClassName}
            />
          </label>
        </div>

        <label className="mt-7 block text-sm font-medium">
          Tell us why it&apos;s special
          <textarea
            required
            value={values.story}
            onChange={(event) => updateValue("story", event.target.value)}
            name="story"
            rows={6}
            placeholder="Who taught you this recipe? When do you make it? What does it remind you of?"
            className={inputClassName}
          />
        </label>

        <label className="mt-7 block text-sm font-medium">
          Ingredients
          <textarea
            required
            value={values.ingredients}
            onChange={(event) => updateValue("ingredients", event.target.value)}
            name="ingredients"
            rows={6}
            placeholder="One ingredient per line is perfect."
            className={inputClassName}
          />
        </label>

        <label className="mt-7 block text-sm font-medium">
          Method
          <textarea
            required
            value={values.method}
            onChange={(event) => updateValue("method", event.target.value)}
            name="method"
            rows={8}
            placeholder="Tell us how your family makes it, one step at a time."
            className={inputClassName}
          />
        </label>

        <label className="mt-7 block rounded-2xl border border-[#D1AD75] bg-[#F4DDAE]/45 p-5 text-sm font-medium">
          Cook&apos;s notes &amp; swaps <span className="font-normal text-stone-500">(optional)</span>
          <textarea
            value={values.cookNotes}
            onChange={(event) => updateValue("cookNotes", event.target.value)}
            name="cookNotes"
            rows={4}
            placeholder="For example: If you cannot find this ingredient, use this instead. Or share a helpful tip that makes the recipe work."
            className={`${inputClassName} mt-3 bg-[#FFF9EC]`}
          />
          <p className="mt-3 font-normal leading-6 text-stone-600">
            A lovely place for substitutions, serving ideas or a family tip.
          </p>
        </label>

        <div className="mt-7 rounded-2xl border border-dashed border-[#B77938]/70 bg-[#F4DDAE]/45 p-5">
          <label className="block text-sm font-medium">
            Add a photo <span className="font-normal text-stone-500">(optional)</span>
            <input
              onChange={(event) => choosePhoto(event.target.files?.[0] ?? null)}
              type="file"
              name="photo"
              accept="image/jpeg,image/png,image/webp"
              className="mt-3 block w-full text-sm text-stone-700 file:mr-4 file:rounded-full file:border-0 file:bg-[#123C39] file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-[#08231F]"
            />
          </label>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            A clear photo of the finished dish is perfect. JPG, PNG or WebP, up to 5 MB.
          </p>
          {photoPreview ? (
            <div className="mt-5 flex items-start gap-4">
              <NextImage
                src={photoPreview}
                alt="Recipe photo preview"
                width={112}
                height={112}
                unoptimized
                className="h-28 w-28 rounded-xl object-cover shadow-md"
              />
              <button
                type="button"
                onClick={() => choosePhoto(null)}
                className="rounded-full border border-[#123C39] px-4 py-2 text-sm font-medium transition hover:bg-[#123C39] hover:text-white"
              >
                Remove photo
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-[#B77938]/70 bg-[#F4DDAE]/45 p-5">
          <p className="text-sm uppercase tracking-[0.22em] text-[#9A622A]">Meet the cook</p>
          <label className="mt-3 block text-sm font-medium">
            Add a photo of the person behind the recipe <span className="font-normal text-stone-500">(optional)</span>
            <input
              onChange={(event) => chooseContributorPhoto(event.target.files?.[0] ?? null)}
              type="file"
              name="contributorPhoto"
              accept="image/jpeg,image/png,image/webp"
              className="mt-3 block w-full text-sm text-stone-700 file:mr-4 file:rounded-full file:border-0 file:bg-[#123C39] file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-[#08231F]"
            />
          </label>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Put a face to the story. If OPR publishes the recipe, we may show this portrait alongside the contributor&apos;s story in the cookbook. JPG, PNG or WebP, up to 5 MB.
          </p>
          {contributorPhotoPreview ? (
            <div className="mt-5 flex items-center gap-4">
              <NextImage
                src={contributorPhotoPreview}
                alt="Cook photo preview"
                width={96}
                height={96}
                unoptimized
                className="h-24 w-24 rounded-full object-cover shadow-md"
              />
              <button
                type="button"
                onClick={() => chooseContributorPhoto(null)}
                className="rounded-full border border-[#123C39] px-4 py-2 text-sm font-medium transition hover:bg-[#123C39] hover:text-white"
              >
                Remove cook&apos;s photo
              </button>
            </div>
          ) : null}
        </div>

        <div id="scan-a-recipe" className="mt-5 rounded-2xl border-2 border-dashed border-[#B77938]/70 bg-[#F4DDAE]/45 p-5 shadow-sm scroll-mt-8">
          <p className="text-sm uppercase tracking-[0.22em] text-[#9A622A]">
            Bring an old recipe back to life
          </p>
          <h3 className="mt-2 text-xl font-bold text-[#123C39]">Scan a handwritten recipe card</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-700">
            Take a clear photo of a recipe card or notebook page and OPR will make an editable first draft of the title, ingredients and method. You stay in control and can correct every word before sharing.
          </p>
          <label className="mt-5 block text-sm font-medium">
            Choose the recipe card <span className="font-normal text-stone-500">(optional)</span>
            <input
              onChange={(event) => chooseOriginalRecipe(event.target.files?.[0] ?? null)}
              type="file"
              name="originalRecipe"
              accept="image/jpeg,image/png,image/webp"
              className="mt-3 block w-full text-sm text-stone-700 file:mr-4 file:rounded-full file:border-0 file:bg-[#123C39] file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-[#08231F]"
            />
          </label>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            A photo of the recipe card, a handwritten notebook page or even the back of an envelope can be the most precious part of the story. JPG, PNG or WebP, up to 10 MB.
          </p>
          {originalRecipe ? (
            <div className="mt-5 flex items-start gap-4">
              {originalRecipePreview ? (
                <NextImage
                  src={originalRecipePreview}
                  alt="Original recipe preview"
                  width={112}
                  height={112}
                  unoptimized
                  className="h-28 w-28 rounded-xl object-cover shadow-md"
                />
              ) : null}
              <div>
                <p className="text-sm font-medium text-[#123C39]">{originalRecipe.name}</p>
                <button
                  type="button"
                  onClick={() => chooseOriginalRecipe(null)}
                  className="mt-3 rounded-full border border-[#123C39] px-4 py-2 text-sm font-medium transition hover:bg-[#123C39] hover:text-white"
                >
                  Remove original
                </button>
                <button
                  type="button"
                  onClick={() => void readOriginalRecipe()}
                  disabled={isReadingRecipe}
                  className="mt-3 block rounded-full bg-[#123C39] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#08231F] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isReadingRecipe ? "Reading your recipe…" : "Create my editable recipe draft"}
                </button>
              </div>
            </div>
          ) : null}
          {recipeReadMessage ? <p className="mt-5 rounded-xl bg-[#E2F2E7] px-4 py-3 text-sm leading-6 text-[#123C39]">{recipeReadMessage}</p> : null}
          <p className="mt-4 text-xs leading-5 text-stone-600">
            When you choose “Read my recipe with AI”, the image is securely sent to OpenAI only to create this editable draft. Check every detail before sharing. It is not saved by the reader itself. Read our{" "}
            <Link href="/privacy" className="underline underline-offset-2">Privacy Notice</Link>.
          </p>
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-[#B77938]/70 bg-[#F4DDAE]/45 p-5">
          <p className="text-sm font-medium">
            Tell us the story in your own words <span className="font-normal text-stone-500">(optional)</span>
          </p>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            A short voice note can bring a family recipe to life. Record it here or choose an existing audio file, up to 10 MB.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {!isRecording ? (
              <button
                type="button"
                onClick={() => void startVoiceRecording()}
                className="rounded-full bg-[#123C39] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#08231F]"
              >
                Record a voice note
              </button>
            ) : (
              <button
                type="button"
                onClick={stopVoiceRecording}
                className="rounded-full bg-red-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-950"
              >
                Stop recording
              </button>
            )}
            {isRecording ? <p className="self-center text-sm font-medium text-red-800">Recording…</p> : null}
          </div>
          <label className="mt-5 block text-sm font-medium">
            Or choose an audio file
            <input
              onChange={(event) => chooseAudioStory(event.target.files?.[0] ?? null)}
              type="file"
              name="audioStory"
              accept="audio/*"
              className="mt-3 block w-full text-sm text-stone-700 file:mr-4 file:rounded-full file:border-0 file:bg-[#123C39] file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-[#08231F]"
            />
          </label>
          {audioStory ? (
            <div className="mt-5">
              <p className="text-sm font-medium text-[#123C39]">{audioStory.name}</p>
              {audioStoryPreview ? <audio controls src={audioStoryPreview} className="mt-3 w-full" /> : null}
              <button
                type="button"
                onClick={() => chooseAudioStory(null)}
                className="mt-4 rounded-full border border-[#123C39] px-4 py-2 text-sm font-medium transition hover:bg-[#123C39] hover:text-white"
              >
                Remove voice story
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-[#B77938]/70 bg-[#F4DDAE]/45 p-5">
          <p className="text-sm font-medium">
            Show us how it is made <span className="font-normal text-stone-500">(optional)</span>
          </p>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Add a short recipe video, up to 20 MB. We will review it before it appears alongside your recipe in the cookbook.
          </p>
          <label className="mt-5 block text-sm font-medium">
            Choose a recipe video
            <input
              onChange={(event) => chooseRecipeVideo(event.target.files?.[0] ?? null)}
              type="file"
              name="recipeVideo"
              accept="video/mp4,video/quicktime,video/webm"
              className="mt-3 block w-full text-sm text-stone-700 file:mr-4 file:rounded-full file:border-0 file:bg-[#123C39] file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-[#08231F]"
            />
          </label>
          {recipeVideo ? (
            <div className="mt-5">
              <p className="text-sm font-medium text-[#123C39]">{recipeVideo.name}</p>
              {recipeVideoPreview ? <video controls playsInline preload="metadata" src={recipeVideoPreview} className="mt-3 aspect-video w-full rounded-xl bg-black" /> : null}
              <button
                type="button"
                onClick={() => chooseRecipeVideo(null)}
                className="mt-4 rounded-full border border-[#123C39] px-4 py-2 text-sm font-medium transition hover:bg-[#123C39] hover:text-white"
              >
                Remove recipe video
              </button>
            </div>
          ) : null}
        </div>
      </fieldset>

      <label className="mt-10 flex gap-4 rounded-2xl border border-[#D1AD75]/80 bg-[#F4DDAE]/70 p-5 text-sm leading-6">
        <input
          required
          checked={values.submissionAgreementAccepted}
          onChange={(event) => updateValue("submissionAgreementAccepted", event.target.checked)}
          type="checkbox"
          name="submissionAgreementAccepted"
          className="mt-1 h-4 w-4 accent-[#123C39]"
        />
        <span>
          I confirm that I am aged 18 or over; that this recipe and story are
          mine to share; and that I have permission to share anyone identifiable
          in my photos, including an optional Meet the cook photo, recipe-card images or voice recording. I grant Other
          People&apos;s Recipes a perpetual, worldwide, royalty-free licence to
          publish, edit, adapt and reproduce the recipe, story and submitted
          media, including in print, film, at OPR events and, if we ever open
          one, an OPR restaurant. {" "}
          <Link href="/terms" className="underline underline-offset-4">
            Read our full terms.
          </Link>
        </span>
      </label>

      <label className="mt-4 flex gap-4 rounded-2xl border border-[#D1AD75]/80 bg-[#F4DDAE]/70 p-5 text-sm leading-6">
        <input
          checked={values.marketingOptIn}
          onChange={(event) => updateValue("marketingOptIn", event.target.checked)}
          type="checkbox"
          name="marketingOptIn"
          className="mt-1 h-4 w-4 accent-[#123C39]"
        />
        <span>Keep me posted about OPR news and events. You can unsubscribe at any time.</span>
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-10 rounded-full bg-[#123C39] px-8 py-4 text-lg font-medium text-white transition hover:scale-105 hover:bg-[#08231F]"
      >
        {isSubmitting ? "Saving your recipe..." : "Share my recipe"}
      </button>

      {submissionError ? (
        <p className="mt-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
          {submissionError}
        </p>
      ) : null}

      <p className="mt-5 text-sm leading-6 text-stone-600">
        Your recipe is sent securely to the OPR team. We&apos;ll only use your
        details to respond about your submission. Read our{" "}
        <Link href="/privacy" className="underline underline-offset-4">Privacy Notice</Link>.
      </p>
    </form>
  );
}
