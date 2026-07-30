"use client";

import { FormEvent, useState } from "react";

type RecipeFormValues = {
  name: string;
  email: string;
  title: string;
  story: string;
  ingredients: string;
  method: string;
};

const initialValues: RecipeFormValues = {
  name: "",
  email: "",
  title: "",
  story: "",
  ingredients: "",
  method: "",
};

export default function RecipeForm() {
  const [values, setValues] = useState(initialValues);

  function updateValue(field: keyof RecipeFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function sendRecipe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const subject = `OPR recipe submission: ${values.title}`;
    const body = `Name: ${values.name}\nEmail: ${values.email}\n\nRecipe: ${values.title}\n\nTHE STORY\n${values.story}\n\nINGREDIENTS\n${values.ingredients}\n\nMETHOD\n${values.method}`;

    window.location.href = `mailto:info@otherpeoplesrecipes.co.uk?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form onSubmit={sendRecipe} className="rounded-3xl bg-[#FFF3DF] p-8 shadow-xl shadow-[#6E4B2C]/15 md:p-12">
      <div className="grid gap-7 md:grid-cols-2">
        <label className="block text-sm font-medium">
          Your name
          <input
            required
            value={values.name}
            onChange={(event) => updateValue("name", event.target.value)}
            type="text"
            name="name"
            placeholder="Your first name"
            className="mt-3 w-full rounded-xl border border-[#D1AD75] bg-[#F4DDAE] px-4 py-3 outline-none transition focus:border-[#4A4232]"
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
            placeholder="you@example.com"
            className="mt-3 w-full rounded-xl border border-[#D1AD75] bg-[#F4DDAE] px-4 py-3 outline-none transition focus:border-[#4A4232]"
          />
        </label>
      </div>

      <label className="mt-7 block text-sm font-medium">
        What&apos;s the recipe called?
        <input
          required
          value={values.title}
          onChange={(event) => updateValue("title", event.target.value)}
          type="text"
          name="title"
          placeholder="For example: Nan's Sunday Rice Pudding"
          className="mt-3 w-full rounded-xl border border-[#D1AD75] bg-[#F4DDAE] px-4 py-3 outline-none transition focus:border-[#4A4232]"
        />
      </label>

      <label className="mt-7 block text-sm font-medium">
        Tell us why it&apos;s special
        <textarea
          required
          value={values.story}
          onChange={(event) => updateValue("story", event.target.value)}
          name="story"
          rows={6}
          placeholder="Who taught you this recipe? When do you make it? What does it remind you of?"
          className="mt-3 w-full resize-y rounded-xl border border-[#D1AD75] bg-[#F4DDAE] px-4 py-3 outline-none transition focus:border-[#4A4232]"
        />
      </label>

      <label className="mt-7 block text-sm font-medium">
        Ingredients
        <textarea
          required
          value={values.ingredients}
          onChange={(event) => updateValue("ingredients", event.target.value)}
          name="ingredients"
          rows={5}
          placeholder="One ingredient per line is perfect."
          className="mt-3 w-full resize-y rounded-xl border border-[#D1AD75] bg-[#F4DDAE] px-4 py-3 outline-none transition focus:border-[#4A4232]"
        />
      </label>

      <label className="mt-7 block text-sm font-medium">
        Method
        <textarea
          required
          value={values.method}
          onChange={(event) => updateValue("method", event.target.value)}
          name="method"
          rows={7}
          placeholder="Tell us how your family makes it."
          className="mt-3 w-full resize-y rounded-xl border border-[#D1AD75] bg-[#F4DDAE] px-4 py-3 outline-none transition focus:border-[#4A4232]"
        />
      </label>

      <button
        type="submit"
        className="mt-10 rounded-full bg-[#4A4232] px-8 py-4 text-lg font-medium text-white transition hover:scale-105"
      >
        Prepare My Recipe Email
      </button>

      <p className="mt-5 text-sm leading-6 text-stone-500">
        Your email app will open with your recipe ready to send to the OPR team.
      </p>
    </form>
  );
}
