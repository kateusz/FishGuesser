import type { ReactNode } from "react";

export function StrokeIcon({ d, extra }: { d?: string; extra?: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {extra}
      {d ? <path d={d} /> : null}
    </svg>
  );
}

export function PeopleIcon() {
  return (
    <StrokeIcon
      extra={
        <>
          <circle cx="9" cy="8" r="4" />
          <path d="M2 21v-2a7 7 0 0 1 14 0v2M16 4a4 4 0 0 1 0 8m3 4a5 5 0 0 1 3 5" />
        </>
      }
    />
  );
}

export function GearIcon() {
  return (
    <StrokeIcon
      extra={
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="m9 2-1 3-3 1-3 3 2 3-1 4 3 2 2 4 4-1 3 1 2-4 3-2-1-4 2-3-3-3-3-1-1-3z" />
        </>
      }
    />
  );
}

export function CloseIcon() {
  return <StrokeIcon d="m5 5 14 14M19 5 5 19" />;
}
