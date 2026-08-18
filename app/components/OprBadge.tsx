import Image from "next/image";

/** The single canonical OPR badge used across navigation, films and social links. */
export default function OprBadge({
  className = "",
  preload = false,
  sizes,
}: {
  className?: string;
  preload?: boolean;
  sizes?: string;
}) {
  return (
    <Image
      src="/images/social/opr-pinterest-profile.png"
      alt=""
      width={132}
      height={132}
      preload={preload}
      // Without an explicit sizes value, Next has no idea the badge is
      // actually rendered much smaller than its 132px intrinsic size at
      // most call sites, and serves the nearest larger fixed candidate
      // (384px) regardless of the className shrinking it down with CSS.
      sizes={sizes ?? "132px"}
      className={`rounded-full ${className}`}
    />
  );
}
