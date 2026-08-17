import Image from "next/image";

/** The single canonical OPR badge used across navigation, films and social links. */
export default function OprBadge({
  className = "",
  preload = false,
}: {
  className?: string;
  preload?: boolean;
}) {
  return (
    <Image
      src="/images/social/opr-pinterest-profile.png"
      alt=""
      width={132}
      height={132}
      preload={preload}
      className={`rounded-full ${className}`}
    />
  );
}
