"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { FishArt } from "@/components/mascot/Captain";
import { isLocale, messagesFor } from "@/lib/messages";

export default function NotFound() {
  const segment = (usePathname() ?? "").split("/")[1] ?? "";
  const locale = isLocale(segment) ? segment : "pl";
  const copy = messagesFor(locale).notFound;
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return (
    <main className="app">
      <div className="app-main stack error-hero">
        <span className="tag">{copy.tag}</span>
        <h1 className="display title">{copy.title}</h1>
        <div className="net-wrap">
          <FishArt pose="sad" mascot />
          <svg className="net-overlay" viewBox="0 0 220 145" aria-hidden="true">
            <defs>
              <pattern id="net" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <path d="M0 0H20M0 10H20" fill="none" stroke="#111" strokeWidth="2.5" />
              </pattern>
            </defs>
            <ellipse cx="112" cy="73" rx="92" ry="58" fill="url(#net)" />
          </svg>
        </div>
        <p className="bubble">{copy.body}</p>
        <Link className="btn primary block" href={`/${locale}`}>
          {copy.home}
        </Link>
      </div>
    </main>
  );
}
