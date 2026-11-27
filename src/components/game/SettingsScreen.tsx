"use client";

import Link from "next/link";
import { useChrome } from "@/components/layout/AppShell";
import { isLocale, messagesFor, otherLocale } from "@/lib/messages";

export function SettingsScreen({ locale }: { locale: string }) {
  const safe = isLocale(locale) ? locale : "pl";
  const messages = messagesFor(safe);
  const copy = messages.settings;
  const home = messages.home;
  const { night, sound, reduceMotion, toggleTheme, toggleSound, toggleMotion } = useChrome();

  return (
    <div className="narrow-content stack">
      <h1 className="display title">{copy.title}</h1>
      <button type="button" className="btn block" onClick={toggleTheme}>
        {night ? `☾ ${home.night}` : `☀ ${home.day}`}
      </button>
      <button type="button" className="btn block" onClick={toggleSound}>
        {sound ? home.soundOn : home.soundOff}
      </button>
      <button type="button" className="btn block" aria-pressed={reduceMotion} onClick={toggleMotion}>
        {reduceMotion ? copy.motionReduce : copy.motionFull}
      </button>
      <Link className="btn block" href={`/${safe}/credits`}>
        {copy.credits}
      </Link>
      <Link className="btn block" href={`/${safe}/privacy`}>
        {copy.privacy}
      </Link>
      <Link className="btn block" href={`/${otherLocale(safe)}/settings`}>
        {home.locale}
      </Link>
    </div>
  );
}
