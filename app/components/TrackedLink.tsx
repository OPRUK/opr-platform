"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { AnalyticsEventKey } from "../../lib/attribution";
import { sendAnalyticsEvent } from "../../lib/attribution-client";

export default function TrackedLink({
  href,
  eventKey,
  children,
  className,
}: {
  href: string;
  eventKey: AnalyticsEventKey;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={() => sendAnalyticsEvent(eventKey, href)}
      className={className}
    >
      {children}
    </Link>
  );
}
