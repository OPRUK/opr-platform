import Image from "next/image";

/**
 * A light-touch OPR identifier for films shown on the website. It deliberately
 * sits away from the lower-right corner, so any creator/platform attribution
 * in a film remains visible.
 */
export default function VideoBrandMark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute left-5 top-5 z-20 inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#E7B84B] bg-[#0D342F]/95 p-1.5 shadow-xl shadow-black/40 sm:h-20 sm:w-20 ${className}`}
    >
      <Image
        src="/images/social/opr-pinterest-profile.png"
        alt=""
        width={64}
        height={64}
        className="h-full w-full rounded-full"
      />
    </span>
  );
}
