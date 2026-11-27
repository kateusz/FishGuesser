import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "teal" | "surface";

export function Button({
  href,
  variant = "primary",
  children,
}: {
  href: string;
  variant?: Variant;
  children: ReactNode;
}) {
  const tone = variant === "surface" ? "" : variant;
  return (
    <Link className={`btn block ${tone}`.trim()} href={href}>
      {children}
    </Link>
  );
}
