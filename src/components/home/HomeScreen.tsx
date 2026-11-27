"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { CloseIcon, PeopleIcon } from "@/components/icons/StrokeIcon";
import { AppShell, useChrome } from "@/components/layout/AppShell";
import { Captain, FishArt } from "@/components/mascot/Captain";
import { Button } from "@/components/ui/Button";
import { otherLocale, type Locale, type Messages } from "@/lib/messages";

export function HomeScreen({
  locale,
  messages,
  previewSrc,
}: {
  locale: Locale;
  messages: Messages;
  previewSrc?: string;
}) {
  return (
    <AppShell locale={locale} settingsLabel={messages.header.settings}>
      <HomeBody locale={locale} messages={messages} previewSrc={previewSrc} />
    </AppShell>
  );
}

function HomeBody({ locale, messages, previewSrc }: { locale: Locale; messages: Messages; previewSrc?: string }) {
  const copy = messages.home;
  const { night, sound, toggleTheme, toggleSound } = useChrome();
  const slogan = copy.slogan.split("\n");
  const howRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const closeHow = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <div className="hero-layout">
      <section className="hero">
        <span className="tag">{copy.tag}</span>
        <h1 className="hero-title">
          {copy.titleLine1}
          <span> {copy.titleLine2}</span>
        </h1>
        <div className="hero-art">
          <Captain />
          <span className="burst-word">PLUSK!</span>
        </div>
        <p className="hero-slogan bubble">
          {slogan[0]}
          <br />
          {slogan[1]}
        </p>
        <div className="stack hero-actions">
          <Button href={`/${locale}/profile?intent=host`}>
            <PeopleIcon /> {copy.create}
          </Button>
          <Button href={`/${locale}/join`} variant="surface">
            {copy.join}
          </Button>
          <Button href={`/${locale}/profile?intent=solo`} variant="teal">
            {copy.solo}
          </Button>
        </div>
        <p className="home-fine">{copy.fine}</p>
        <div className="home-prefs">
          <button type="button" aria-pressed={night} onClick={toggleTheme}>
            {night ? `☾ ${copy.night}` : `☀ ${copy.day}`}
          </button>
          <button type="button" aria-pressed={sound} onClick={toggleSound}>
            {sound ? copy.soundOn : copy.soundOff}
          </button>
          <Link href={`/${otherLocale(locale)}`}>{copy.locale}</Link>
        </div>
        <button
          type="button"
          className="link-btn"
          ref={howRef}
          onClick={() => {
            setRoot(document.querySelector(".app"));
            setOpen(true);
          }}
        >
          {copy.how}
        </button>
      </section>
      <aside className="home-preview">
        <div className="panel paper-panel">
          <div className="row between" style={{ marginBottom: 14 }}>
            <span className="tag">{copy.previewTag}</span>
            <span className="timer" aria-hidden="true">
              24
            </span>
          </div>
          <figure className="photo">
            <div className="photo-frame">
              {previewSrc ? <img src={previewSrc} alt={messages.round.photoAlt} /> : null}
            </div>
          </figure>
          <h2 style={{ margin: "19px 0 12px" }}>{copy.previewQuestion}</h2>
          <div className="answers">
            <div className="answer selected">
              <strong>Szczupak</strong>
              <i>Esox lucius</i>
            </div>
            <div className="answer">
              <strong>Sandacz</strong>
              <i>Sander lucioperca</i>
            </div>
          </div>
        </div>
        <div className="panel paper-panel preview-rank">
          <div className="row between">
            <h3>{copy.previewCrew}</h3>
            <span className="tag">{copy.previewSample}</span>
          </div>
          {[copy.previewYou, "Karp Diem", "Okoń Kenobi"].map((name, index) => (
            <div key={name} className="player-row">
              <span className="avatar">
                <FishArt i={index} pose="wink" />
              </span>
              <span className="player-name">{name}</span>
            </div>
          ))}
        </div>
      </aside>
      {open && root ? createPortal(<HowTo copy={messages.howTo} onClose={closeHow} opener={howRef} />, root) : null}
    </div>
  );
}

function HowTo({
  copy,
  onClose,
  opener,
}: {
  copy: Messages["howTo"];
  onClose: () => void;
  opener: RefObject<HTMLButtonElement | null>;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    dialogRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const items = [...root.querySelectorAll<HTMLElement>("button:not(:disabled), a[href]")];
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === root)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener.current?.focus();
    };
  }, [opener]);

  const text = copy.steps[step - 1] ?? copy.steps[0];

  return (
    <div className="overlay">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="how-title"
        aria-describedby="how-step"
        tabIndex={-1}
        ref={dialogRef}
      >
        <button type="button" className="icon-btn close" aria-label={copy.close} onClick={onClose}>
          <CloseIcon />
        </button>
        <span className="tag">{copy.tag}</span>
        <h2 id="how-title" style={{ marginTop: 15 }}>
          {copy.title} {step}/4
        </h2>
        <div className="how-art">
          {step === 1 ? <FishArt pose="welcome" mascot /> : null}
          {step === 2 ? <span className="empty-signal">{copy.modes}</span> : null}
          {step === 3 ? <span className="burst-word">{copy.points}</span> : null}
          {step === 4 ? <FishArt pose="celebrate" mascot /> : null}
        </div>
        <div className="bubble" id="how-step">
          {text}
        </div>
        <div className="dots">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              className={n === step ? "active" : undefined}
              aria-label={`${copy.step} ${n}`}
              aria-current={n === step ? "step" : undefined}
              onClick={() => setStep(n)}
            />
          ))}
        </div>
        <button type="button" className="btn primary block" onClick={() => (step === 4 ? onClose() : setStep(step + 1))}>
          {step === 4 ? copy.start : copy.next}
        </button>
      </div>
    </div>
  );
}
