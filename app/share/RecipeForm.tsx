"use client";

import { FormEvent, useEffect, useState } from "react";

type RecipeFormValues = {
  name: string;
  email: string;
  location: string;
  title: string;
  category: string;
  servings: string;
  story: string;
  ingredients: string;
  method: string;
  permission: boolean;
};

const initialValues: RecipeFormValues = {
  name: "",
  email: "",
  location: "",
  title: "",
  category: "",
  servings: "",
  story: "",
  ingredients: "",
  method: "",
  permission: false,
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
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.sessionStorage.setItem(recipeDraftKey, JSON.stringify(values));
  }, [values]);

  function updateValue(field: keyof RecipeFormValues, value: string | boolean) {
    setValues((current) => ({ ...current, [field]: value }));
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
    formData.set("story", values.story);
    formData.set("ingredients", values.ingredients);
    formData.set("method", values.method);
    formData.set("permission", String(values.permission));
    if (photo) formData.set("photo", photo);

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
        <button
          type="button"
          onClick={() => {
            setValues(initialValues);
            setPhoto(null);
            setPhotoPreview("");
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
              <img
                src={photoPreview}
                alt="Recipe photo preview"
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
      </fieldset>

      <label className="mt-10 flex gap-4 rounded-2xl border border-[#D1AD75]/80 bg-[#F4DDAE]/70 p-5 text-sm leading-6">
        <input
          checked={values.permission}
          onChange={(event) => updateValue("permission", event.target.checked)}
          type="checkbox"
          name="permission"
          className="mt-1 h-4 w-4 accent-[#123C39]"
        />
        <span>
          I&apos;m happy for OPR to contact me if this recipe could be featured on
          the website, in the restaurant or in a future film.
        </span>
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
        details to respond about your submission.
      </p>
    </form>
  );
}
