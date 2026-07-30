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
    context.fillText("Every recipe has a story.", 76, 1010);

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

  return (
    <section className="bg-[#EED8B2] px-6 py-16 text-center print:hidden">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#D1AD75]/80 bg-[#FFF3DF] px-6 py-10 shadow-lg shadow-[#1C5A50]/10 md:px-10">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
          Pass it on
        </p>
        <h2 className="mt-4 text-3xl font-bold md:text-4xl">
          A good recipe is better when it&apos;s shared.
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={shareOnWhatsApp}
            className="rounded-full bg-[#2E7D4F] px-5 py-3 text-sm font-medium text-white transition hover:scale-105"
          >
            WhatsApp
          </button>
          <button
            type="button"
            onClick={shareOnFacebook}
            className="rounded-full bg-[#4267B2] px-5 py-3 text-sm font-medium text-white transition hover:scale-105"
          >
            Facebook
          </button>
          <button
            type="button"
            onClick={() => void copyLink()}
            className="rounded-full border border-[#123C39] px-5 py-3 text-sm font-medium transition hover:bg-[#123C39] hover:text-white"
          >
            {copied ? "Link copied" : "Copy link"}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-full border border-[#123C39] px-5 py-3 text-sm font-medium transition hover:bg-[#123C39] hover:text-white"
          >
            Print recipe
          </button>
          <button
            type="button"
            onClick={() => void downloadInstagramCard()}
            className="rounded-full bg-[#9A622A] px-5 py-3 text-sm font-medium text-white transition hover:scale-105 hover:bg-[#7A481B]"
          >
            Instagram card
          </button>
        </div>
        {instagramMessage ? <p className="mt-5 text-sm text-stone-600">{instagramMessage}</p> : null}
      </div>
    </section>
  );
}
