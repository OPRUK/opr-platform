"use client";

import { useId, useState } from "react";
import {
  convertIngredient,
  type MeasurementSystem,
} from "../../lib/ingredient-units";

type IngredientMeasurementsProps = {
  ingredients: string[];
  size?: "regular" | "large";
};

const OPTIONS: { value: MeasurementSystem; label: string; detail: string }[] = [
  { value: "metric", label: "Metric", detail: "kg, g & ml" },
  { value: "imperial", label: "Imperial", detail: "lb, oz & fl oz" },
];

export default function IngredientMeasurements({
  ingredients,
  size = "large",
}: IngredientMeasurementsProps) {
  const measurementId = useId();
  const [system, setSystem] = useState<MeasurementSystem>("metric");
  const itemClasses = size === "large"
    ? "text-2xl leading-8 md:text-3xl md:leading-9"
    : "text-xl leading-8 md:text-2xl md:leading-9";

  return (
    <>
      <h2 className="recipe-card-ingredients text-center text-4xl font-semibold text-[#344F50] md:text-5xl">
        What you&apos;ll need
      </h2>

      <fieldset className="mx-auto mt-5 w-fit">
        <legend className="sr-only">Choose ingredient measurements</legend>
        <div className="inline-flex rounded-full border border-[#8A6A3B]/35 bg-[#FFF3DF]/55 p-1 shadow-sm">
          {OPTIONS.map((option) => {
            const inputId = `${measurementId}-${option.value}`;
            const isSelected = system === option.value;

            return (
              <label
                key={option.value}
                htmlFor={inputId}
                className={`cursor-pointer rounded-full px-4 py-2 text-center text-sm transition focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#123C39] ${
                  isSelected
                    ? "bg-[#123C39] text-[#FFF3DF] shadow-sm"
                    : "text-[#4B3524] hover:bg-[#FFF3DF]"
                }`}
              >
                <input
                  id={inputId}
                  type="radio"
                  name={measurementId}
                  value={option.value}
                  checked={isSelected}
                  onChange={() => setSystem(option.value)}
                  className="sr-only"
                />
                <span className="block font-bold">{option.label}</span>
                <span className="block text-xs opacity-80">{option.detail}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <p className="recipe-card-ingredients mx-auto mt-3 max-w-xl text-center text-[1.75rem] leading-9">
        Conversions are approximate. Teaspoons and tablespoons stay as written.
      </p>

      <ul className={`recipe-card-ingredients mx-auto mt-6 space-y-1.5 text-center text-[#4B3524] ${itemClasses}`}>
        {ingredients.map((ingredient, index) => (
          <li key={`${index}-${ingredient}`} className="pb-1.5">
            {convertIngredient(ingredient, system)}
          </li>
        ))}
      </ul>
    </>
  );
}
