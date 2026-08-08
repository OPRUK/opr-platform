import Image from "next/image";

/**
 * A light-touch OPR identifier for films shown on the website.
 */
export default function VideoBrandMark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-5 left-5 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#E7B84B] bg-[#35162F]/95 p-1 shadow-xl shadow-black/40 sm:h-10 sm:w-10 ${className}`}
    >
      <Image
        src="/images/social/opr-pinterest-profile.png"
        alt=""
        width={40}
        height={40}
        className="h-full w-full rounded-full"
      />
    </span>
  );
}
