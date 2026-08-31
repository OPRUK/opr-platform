import Image from "next/image";
import type { RecipeMethodPhoto } from "../../lib/recipes";

export default function RecipeVisualGuide({
  photos,
}: {
  photos: RecipeMethodPhoto[];
}) {
  if (!photos.length) return null;

  return (
    <section className="bg-[#EED8B2] px-6 py-12 md:px-8 md:py-16" aria-labelledby="visual-guide-heading">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-sm font-bold uppercase tracking-[0.35em] text-[#9A622A]">
          A visual guide
        </p>
        <h2
          id="visual-guide-heading"
          className="font-display mx-auto mt-3 max-w-3xl text-center text-4xl font-bold text-[#123C39] md:text-5xl"
        >
          See the key stages
        </h2>
        <p className="mx-auto mt-5 max-w-3xl text-center text-base leading-7 text-stone-700">
          Key moments to look for as you cook. Use these visual cues alongside the written method.
        </p>
        <div className={`mt-9 grid gap-6 ${photos.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"}`}>
          {photos.map((photo) => (
            <figure
              key={photo.src}
              className="overflow-hidden rounded-3xl bg-[#FFF3DF] shadow-lg shadow-[#1C5A50]/10"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={1536}
                height={1024}
                sizes="(min-width: 1152px) 352px, (min-width: 768px) calc(33vw - 32px), calc(100vw - 48px)"
                className="aspect-[3/2] w-full object-cover"
              />
              <figcaption className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#9A622A]">
                  Step {photo.step}
                </p>
                <h3 className="mt-3 text-2xl font-bold text-[#123C39]">{photo.title}</h3>
                <p className="mt-3 leading-7 text-stone-700">{photo.caption}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
