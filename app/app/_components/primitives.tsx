import Link from "next/link";
import type { ReactNode } from "react";

const dividerClass = "h-[2px] w-full bg-[#123C39]/35";

export function Divider({ className = "" }: { className?: string }) {
  return <div className={`${dividerClass} ${className}`} />;
}

export function Eyebrow({
  children,
  tone = "gold",
  className = "",
}: {
  children: ReactNode;
  tone?: "gold" | "cream";
  className?: string;
}) {
  const color = tone === "cream" ? "text-[#EED8B2]" : "text-[#6B4F1F]";
  return (
    <p className={`text-xs font-extrabold uppercase tracking-[0.2em] ${color} ${className}`}>
      {children}
    </p>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="bg-[#DCE7E1] px-2.5 py-1 text-xs font-medium uppercase tracking-[0.05em] text-[#123C39]">
      {children}
    </span>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

const primaryClass =
  "flex w-full items-center gap-2 px-[18px] py-4 text-[17px] font-medium transition disabled:cursor-not-allowed disabled:opacity-50";

export function PrimaryButton({
  children,
  href,
  onClick,
  disabled,
  type = "button",
  inverted = false,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  inverted?: boolean;
}) {
  const colorClass = inverted ? "bg-[#EED8B2] text-[#123C39]" : "bg-[#123C39] text-[#EED8B2] hover:bg-[#0d2b28]";
  const content = (
    <>
      <span>{children}</span>
      <span className="ml-auto flex-shrink-0">
        <ChevronRightIcon />
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${primaryClass} ${colorClass}`}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${primaryClass} ${colorClass}`}>
      {content}
    </button>
  );
}

export function SecondaryButton({
  children,
  href,
  onClick,
  disabled,
  type = "button",
  block = true,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  block?: boolean;
}) {
  const className = `flex items-center gap-2 border border-[#123C39] px-4 py-3 text-sm font-medium text-[#123C39] transition hover:bg-[#123C39] hover:text-[#EED8B2] disabled:cursor-not-allowed disabled:opacity-50 ${block ? "w-full" : ""}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  );
}

export function BackButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="Back"
      className="flex h-11 w-11 items-center justify-center bg-[#FFF3DF] text-[#123C39] shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
    >
      <ChevronLeftIcon />
    </Link>
  );
}

export function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#123C39" strokeWidth="1.6" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12l3 3 5-6" />
    </svg>
  );
}
