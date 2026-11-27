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
      <div className="app-main stack">
        <span className="tag">{copy.tag}</span>
        <FishArt pose="sad" mascot />
        <h1 className="display title">{copy.title}</h1>
        <p className="bubble">{copy.body}</p>
        <Link className="btn primary block" href={`/${locale}`}>
          {copy.home}
        </Link>
      </div>
    </main>
  );
}
