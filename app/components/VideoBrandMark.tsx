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
      className={`pointer-events-none absolute left-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E7B84B]/80 bg-[#0D342F]/90 p-1 shadow-lg shadow-black/30 ${className}`}
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
