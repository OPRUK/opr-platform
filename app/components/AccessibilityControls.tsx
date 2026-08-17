"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type TextSize = "small" | "default" | "large" | "largest";

const TEXT_SIZE_KEY = "opr-text-size";
const READABLE_FONT_KEY = "opr-readable-font";
const CHANGE_EVENT = "opr-accessibility-change";

const textSizes: Array<{ value: TextSize; label: string; description: string }> = [
  { value: "small", label: "A−", description: "Smaller text" },
  { value: "default", label: "A", description: "Default text size" },
  { value: "large", label: "A+", description: "Larger text" },
  { value: "largest", label: "A++", description: "Largest text" },
];

function isTextSize(value: string | null): value is TextSize {
  return textSizes.some((size) => size.value === value);
}

function subscribeToPreferences(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getTextSizeSnapshot(): TextSize {
  const savedSize = window.localStorage.getItem(TEXT_SIZE_KEY);
  return isTextSize(savedSize) ? savedSize : "default";
}

function getReadableFontSnapshot() {
  return window.localStorage.getItem(READABLE_FONT_KEY) === "true";
}

export default function AccessibilityControls() {
  const [open, setOpen] = useState(false);
  const textSize = useSyncExternalStore(subscribeToPreferences, getTextSizeSnapshot, () => "default");
  const readableFont = useSyncExternalStore(subscribeToPreferences, getReadableFontSnapshot, () => false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.dataset.textSize = textSize;
    document.documentElement.dataset.readableFont = String(readableFont);
  }, [readableFont, textSize]);

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function closeOnOutsideClick(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, [open]);

  function chooseTextSize(size: TextSize) {
    window.localStorage.setItem(TEXT_SIZE_KEY, size);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  function toggleReadableFont() {
    const nextValue = !readableFont;
    window.localStorage.setItem(READABLE_FONT_KEY, String(nextValue));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return (
    <div ref={panelRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[#123C39]/35 bg-white/70 px-3 font-bold text-[#123C39] transition hover:bg-[#EED8B2] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#9A622A]"
        aria-label="Open text accessibility settings"
        aria-expanded={open}
        aria-controls="accessibility-controls"
      >
        Aa
      </button>

      {open ? (
        <div
          id="accessibility-controls"
          className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-72 rounded-2xl border border-[#DDB765] bg-[#FFF3DF] p-4 text-[#123C39] shadow-2xl"
          aria-label="Text accessibility settings"
        >
          <p className="font-bold">Text size</p>
          <div className="mt-3 grid grid-cols-4 gap-2" role="group" aria-label="Choose text size">
            {textSizes.map((size) => (
              <button
                key={size.value}
                type="button"
                onClick={() => chooseTextSize(size.value)}
                className={`min-h-11 rounded-xl border px-2 font-bold transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#9A622A] ${
                  textSize === size.value
                    ? "border-[#123C39] bg-[#123C39] text-white"
                    : "border-[#DDB765] bg-white hover:bg-[#EED8B2]"
                }`}
                aria-label={size.description}
                aria-pressed={textSize === size.value}
              >
                {size.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={toggleReadableFont}
            className="mt-4 flex min-h-11 w-full items-center justify-between gap-4 rounded-xl border border-[#DDB765] bg-white px-4 py-2 text-left font-medium transition hover:bg-[#EED8B2] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#9A622A]"
            aria-pressed={readableFont}
          >
            <span>Readable font</span>
            <span aria-hidden="true" className={`h-6 w-11 rounded-full p-1 transition ${readableFont ? "bg-[#123C39]" : "bg-stone-300"}`}>
              <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${readableFont ? "translate-x-5" : ""}`} />
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
