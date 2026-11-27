"use client";

import Link from "next/link";
import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from "react";
import { GearIcon } from "@/components/icons/StrokeIcon";
import { FishArt } from "@/components/mascot/Captain";
import type { Locale } from "@/lib/messages";

type Chrome = {
  night: boolean;
  sound: boolean;
  reduceMotion: boolean;
  toggleTheme: () => void;
  toggleSound: () => void;
  toggleMotion: () => void;
};

const ChromeContext = createContext<Chrome | null>(null);

export function useChrome(): Chrome {
  const chrome = useContext(ChromeContext);
  if (!chrome) throw new Error("useChrome must be used inside AppShell");
  return chrome;
}

export function AppShell({
  locale,
  settingsLabel,
  children,
}: {
  locale: Locale;
  settingsLabel: string;
  children: ReactNode;
}) {
  const [night, setNight] = useState(false);
  const [sound, setSound] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [wide, setWide] = useState(false);
  const [chromeReady, setChromeReady] = useState(false);

  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    const isNight = localStorage.getItem("fg-theme") === "night";
    document.documentElement.dataset.theme = isNight ? "night" : "day";
    setNight(isNight);
    setSound(localStorage.getItem("fg-sound") !== "0");
    setReduceMotion(localStorage.getItem("fg-motion") === "reduce");

    const query = window.matchMedia("(min-width: 1100px)");
    const apply = () => setWide(query.matches);
    apply();
    query.addEventListener("change", apply);
    setChromeReady(true);
    return () => query.removeEventListener("change", apply);
  }, [locale]);

  const chrome: Chrome = {
    night,
    sound,
    toggleTheme() {
      const next = document.documentElement.dataset.theme === "night" ? "day" : "night";
      document.documentElement.dataset.theme = next;
      localStorage.setItem("fg-theme", next);
      setNight(next === "night");
    },
    toggleSound() {
      setSound((current) => {
        const next = !current;
        localStorage.setItem("fg-sound", next ? "1" : "0");
        return next;
      });
    },
    reduceMotion,
    toggleMotion() {
      setReduceMotion((current) => {
        const next = !current;
        localStorage.setItem("fg-motion", next ? "reduce" : "full");
        return next;
      });
    },
  };

  const className = chromeReady
    ? ["app", night ? "night" : "", reduceMotion ? "reduce-motion" : "", wide ? "desktop-app" : ""].filter(Boolean).join(" ")
    : "app";

  return (
    <ChromeContext.Provider value={chrome}>
      <div className={className} suppressHydrationWarning>
        <header className="app-header">
          <Link className="wordmark" href={`/${locale}`}>
            <FishArt i={0} pose="wink" />
            <span>
              Fish<em>Guesser</em>
            </span>
          </Link>
          <Link className="icon-btn" href={`/${locale}/settings`} aria-label={settingsLabel}>
            <GearIcon />
          </Link>
        </header>
        <div className="app-main">{children}</div>
      </div>
    </ChromeContext.Provider>
  );
}
