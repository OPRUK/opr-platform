"use client";

import { useState } from "react";

export default function RecipeActions({
  title,
  imageUrl,
}: {
  title: string;
  imageUrl?: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const [instagramMessage, setInstagramMessage] = useState("");

  const shareText = `I thought you might enjoy ${title} from Other People's Recipes.`;

  function currentUrl() {
    return window.location.href;
  }

  function shareOnWhatsApp() {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareText} ${currentUrl()}`)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function shareOnFacebook() {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl())}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(currentUrl());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  function drawWrappedText(
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
  ) {
    const words = text.split(" ");
    let line = "";
    let currentY = y;

    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (context.measureText(candidate).width > maxWidth && line) {
        context.fillText(line, x, currentY);
        line = word;
        currentY += lineHeight;
      } else {
        line = candidate;
      }
    });

    if (line) {
      context.fillText(line, x, currentY);
    }
  }

  async function downloadInstagramCard() {
    setInstagramMessage("");
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const context = canvas.getContext("2d");

    if (!context) {
      setInstagramMessage("We could not create the image just now.");
      return;
    }

    context.fillStyle = "#FFF3DF";
    context.fillRect(0, 0, 1080, 1080);
    context.fillStyle = "#123C39";
    context.fillRect(0, 0, 1080, 640);

    if (imageUrl) {
      try {
        const image = new window.Image();
        image.crossOrigin = "anonymous";
        image.src = imageUrl;
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject(new Error("Image failed to load"));
        });

        const sourceSize = Math.min(image.width, image.height);
        const sourceX = (image.width - sourceSize) / 2;
        const sourceY = (image.height - sourceSize) / 2;
        context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, 1080, 640);
        const gradient = context.createLinearGradient(0, 430, 0, 640);
        gradient.addColorStop(0, "rgba(45, 33, 23, 0)");
        gradient.addColorStop(1, "rgba(45, 33, 23, 0.55)");
        context.fillStyle = gradient;
        context.fillRect(0, 0, 1080, 640);
      } catch {
        // The finished card remains useful even if a contributor image is unavailable.
      }
    }

    context.fillStyle = "#9A622A";
    context.font = "600 28px Arial, sans-serif";
    context.letterSpacing = "4px";
    context.fillText("OTHER PEOPLE'S RECIPES", 76, 740);
    context.letterSpacing = "0px";
    context.fillStyle = "#123C39";
    context.font = "bold 62px Georgia, serif";
    drawWrappedText(context, title, 76, 820, 928, 76);
    context.fillStyle = "#766B5C";
    context.font = "italic 28px Georgia, serif";
    context.fillText("Every Recipe has a Story.", 76, 1010);

    canvas.toBlob((blob) => {
      if (!blob) {
        setInstagramMessage("We could not create the image just now.");
        return;
      }

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-opr.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
      setInstagramMessage("Instagram card downloaded — ready to share.");
    }, "image/png");
  }

  const iconButtonClass =
    "flex h-11 w-11 items-center justify-center rounded-full border border-[#D1AD75] bg-[#FFF9EC] text-[#123C39] shadow-sm transition hover:-translate-y-0.5 hover:border-[#123C39] hover:bg-[#123C39] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123C39]";

  return (
    <div className="shrink-0 print:hidden" aria-label="Share and save this recipe">
      <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">
        Share
      </p>
      <div className="flex flex-col gap-2">
        <button type="button" onClick={shareOnWhatsApp} className={iconButtonClass} aria-label="Share on WhatsApp" title="Share on WhatsApp">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.5 9.5 0 0 1-4-.9L3 21l1.8-4.8A8.5 8.5 0 1 1 21 11.5Z" />
            <path d="M8.6 8.3c.4 3.1 2 4.8 5.2 5.4" />
          </svg>
        </button>
        <button type="button" onClick={shareOnFacebook} className={iconButtonClass} aria-label="Share on Facebook" title="Share on Facebook">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="2.5" />
            <circle cx="6" cy="12" r="2.5" />
            <circle cx="18" cy="19" r="2.5" />
            <path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" />
          </svg>
        </button>
        <button type="button" onClick={() => void copyLink()} className={iconButtonClass} aria-label={copied ? "Link copied" : "Copy recipe link"} title={copied ? "Link copied" : "Copy recipe link"}>
          {copied ? (
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12 4 4L19 6" />
            </svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" />
              <path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" />
            </svg>
          )}
        </button>
        <button type="button" onClick={() => window.print()} className={iconButtonClass} aria-label="Print recipe" title="Print recipe">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <path d="M6 14h12v7H6z" />
          </svg>
        </button>
        <button type="button" onClick={() => void downloadInstagramCard()} className={iconButtonClass} aria-label="Download social media card" title="Download social media card">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21M12 17v4m-2-2 2 2 2-2" />
          </svg>
        </button>
      </div>
      <p className="sr-only" aria-live="polite">{instagramMessage}</p>
    </div>
  );
}
