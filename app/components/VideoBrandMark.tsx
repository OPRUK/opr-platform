import OprBadge from "./OprBadge";

/**
 * A light-touch OPR identifier for films shown on the website.
 */
export default function VideoBrandMark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-5 left-5 z-20 inline-flex h-9 w-9 items-center justify-center sm:h-11 sm:w-11 ${className}`}
    >
      <OprBadge className="h-full w-full" />
    </span>
  );
}
