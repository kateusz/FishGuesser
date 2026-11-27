"use client";

import Link from "next/link";
import { useChrome } from "@/components/layout/AppShell";
import { isLocale, messagesFor, otherLocale } from "@/lib/messages";

export function SettingsScreen({ locale }: { locale: string }) {
  const safe = isLocale(locale) ? locale : "pl";
  const messages = messagesFor(safe);
  const copy = messages.settings;
  const { theme, soundVolume, musicVolume, vibrations, reduceMotion, setTheme, setSoundVolume, setMusicVolume, setVibrations, toggleMotion } =
    useChrome();

  return (
    <div className="narrow-content settings-screen">
      <h1 className="display title">{copy.title}</h1>
      <div className="stack settings-fields">
        <label className="field-label" htmlFor="theme-setting">
          {copy.theme}
        </label>
        <select id="theme-setting" className="field" value={theme} onChange={(event) => setTheme(event.target.value as typeof theme)}>
          <option value="day">{copy.themeDay}</option>
          <option value="night">{copy.themeNight}</option>
          <option value="auto">{copy.themeAuto}</option>
        </select>

        <label className="field-label" htmlFor="sound-setting">
          {copy.sound} <output htmlFor="sound-setting">{soundVolume}%</output>
        </label>
        <input
          id="sound-setting"
          type="range"
          min="0"
          max="100"
          value={soundVolume}
          onChange={(event) => setSoundVolume(Number(event.target.value))}
        />

        <label className="field-label" htmlFor="music-setting">
          {copy.music} <output htmlFor="music-setting">{musicVolume}%</output>
        </label>
        <input
          id="music-setting"
          type="range"
          min="0"
          max="100"
          value={musicVolume}
          onChange={(event) => setMusicVolume(Number(event.target.value))}
        />

        <label className="check-row">
          {copy.vibrations}
          <input type="checkbox" checked={vibrations} onChange={(event) => setVibrations(event.target.checked)} />
        </label>
        <label className="field-label" htmlFor="language-setting">
          {copy.language}
        </label>
        <select
          id="language-setting"
          className="field"
          value={safe}
          onChange={(event) => {
            window.location.assign(`/${otherLocale(event.target.value as typeof safe)}/settings`);
          }}
        >
          <option value="pl">{copy.languagePl}</option>
          <option value="en">{copy.languageEn}</option>
        </select>

        <label className="check-row">
          {copy.reducedMotion}
          <input type="checkbox" checked={reduceMotion} onChange={toggleMotion} />
        </label>
        <Link className="btn teal block" href={`/${safe}/profile?intent=edit`}>
          {copy.profile}
        </Link>
        <p className="small muted">{copy.note}</p>
        <Link className="btn block" href={`/${safe}`}>
          {copy.done}
        </Link>
      </div>
    </div>
  );
}
