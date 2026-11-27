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
  theme: "day" | "night" | "auto";
  soundVolume: number;
  musicVolume: number;
  vibrations: boolean;
  toggleTheme: () => void;
  toggleSound: () => void;
  toggleMotion: () => void;
  setTheme: (theme: "day" | "night" | "auto") => void;
  setSoundVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setVibrations: (enabled: boolean) => void;
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
  const [theme, setThemePreference] = useState<Chrome["theme"]>("day");
  const [soundVolume, setSoundVolumeState] = useState(70);
  const [musicVolume, setMusicVolumeState] = useState(30);
  const [vibrations, setVibrationsState] = useState(true);
  const [wide, setWide] = useState(false);
  const [chromeReady, setChromeReady] = useState(false);

  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    const savedTheme = localStorage.getItem("fg-theme");
    const preference: Chrome["theme"] = savedTheme === "night" || savedTheme === "auto" ? savedTheme : "day";
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    const isNight = preference === "night" || (preference === "auto" && systemTheme.matches);
    document.documentElement.dataset.theme = isNight ? "night" : "day";
    setNight(isNight);
    setThemePreference(preference);
    const savedSoundVolume = Number(localStorage.getItem("fg-sound-volume"));
    const initialSoundVolume = Number.isFinite(savedSoundVolume) ? Math.min(100, Math.max(0, savedSoundVolume)) : 70;
    setSoundVolumeState(initialSoundVolume);
    setSound(initialSoundVolume > 0);
    const savedMusicVolume = Number(localStorage.getItem("fg-music-volume"));
    setMusicVolumeState(Number.isFinite(savedMusicVolume) ? Math.min(100, Math.max(0, savedMusicVolume)) : 30);
    setVibrationsState(localStorage.getItem("fg-vibrations") !== "0");
    setReduceMotion(localStorage.getItem("fg-motion") === "reduce");

    const query = window.matchMedia("(min-width: 1100px)");
    const apply = () => setWide(query.matches);
    apply();
    query.addEventListener("change", apply);
    const syncSystemTheme = () => {
      if (localStorage.getItem("fg-theme") !== "auto") return;
      document.documentElement.dataset.theme = systemTheme.matches ? "night" : "day";
      setNight(systemTheme.matches);
    };
    systemTheme.addEventListener("change", syncSystemTheme);
    setChromeReady(true);
    return () => {
      query.removeEventListener("change", apply);
      systemTheme.removeEventListener("change", syncSystemTheme);
    };
  }, [locale]);

  const chrome: Chrome = {
    night,
    sound,
    toggleTheme() {
      const next = document.documentElement.dataset.theme === "night" ? "day" : "night";
      document.documentElement.dataset.theme = next;
      localStorage.setItem("fg-theme", next);
      setNight(next === "night");
      setThemePreference(next);
    },
    toggleSound() {
      setSound((current) => {
        const next = !current;
        localStorage.setItem("fg-sound", next ? "1" : "0");
        const volume = next ? (soundVolume || 70) : 0;
        localStorage.setItem("fg-sound-volume", String(volume));
        setSoundVolumeState(volume);
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
    theme,
    soundVolume,
    musicVolume,
    vibrations,
    setTheme(next) {
      const isNight = next === "night" || (next === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      localStorage.setItem("fg-theme", next);
      document.documentElement.dataset.theme = isNight ? "night" : "day";
      setThemePreference(next);
      setNight(isNight);
    },
    setSoundVolume(volume) {
      const next = Math.min(100, Math.max(0, volume));
      localStorage.setItem("fg-sound-volume", String(next));
      localStorage.setItem("fg-sound", next > 0 ? "1" : "0");
      setSoundVolumeState(next);
      setSound(next > 0);
    },
    setMusicVolume(volume) {
      const next = Math.min(100, Math.max(0, volume));
      localStorage.setItem("fg-music-volume", String(next));
      setMusicVolumeState(next);
    },
    setVibrations(enabled) {
      localStorage.setItem("fg-vibrations", enabled ? "1" : "0");
      setVibrationsState(enabled);
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
