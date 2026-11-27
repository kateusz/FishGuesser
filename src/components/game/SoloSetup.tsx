"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { fill, messagesFor } from "@/lib/messages";

const POOLS = ["EU", "PL", "EU_MINUS_PL"] as const;
const MODES = ["mix", "species", "weight", "price"] as const;

export function SoloSetup({ locale }: { locale: string }) {
  const messages = messagesFor(locale);
  const copy = messages.solo;
  const router = useRouter();
  const [pool, setPool] = useState<(typeof POOLS)[number]>("EU");
  const [mode, setMode] = useState<(typeof MODES)[number]>("mix");
  const [rounds, setRounds] = useState(5);
  const [seconds, setSeconds] = useState(30);
  const [untimed, setUntimed] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    setError("");
    try {
      const state = await api<{ game: { id: string } }>("/api/v1/solo/games", {
        method: "POST",
        body: {
          nickname: sessionStorage.getItem("fg-nick") ?? "",
          avatarId: sessionStorage.getItem("fg-avatar") ?? "avatar-01",
          untimed,
          settings: { pool, mode, rounds, seconds },
        },
      });
      router.push(`/${locale}/solo/${state.game.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.startFailed);
    }
  }

  return (
    <div className="narrow-content stack">
      <h1 className="display title">{copy.title}</h1>
      <div className="chips">
        {POOLS.map((id) => (
          <button key={id} type="button" className={`chip${pool === id ? " active" : ""}`} aria-pressed={pool === id} onClick={() => setPool(id)}>
            {messages.game.pools[id]}
          </button>
        ))}
      </div>
      <div className="chips">
        {MODES.map((id) => (
          <button key={id} type="button" className={`chip${mode === id ? " active" : ""}`} aria-pressed={mode === id} onClick={() => setMode(id)}>
            {messages.game.modes[id]}
          </button>
        ))}
      </div>
      <div className="chips">
        {[5, 10, 15].map((value) => (
          <button key={value} type="button" className={`chip${rounds === value ? " active" : ""}`} aria-pressed={rounds === value} onClick={() => setRounds(value)}>
            {fill(messages.game.rounds, { n: value })}
          </button>
        ))}
      </div>
      <label className="check-row">
        {copy.untimed}
        <input type="checkbox" checked={untimed} onChange={(event) => setUntimed(event.target.checked)} />
      </label>
      {untimed ? null : (
        <div className="chips">
          {[15, 30, 45, 60].map((value) => (
            <button key={value} type="button" className={`chip${seconds === value ? " active" : ""}`} aria-pressed={seconds === value} onClick={() => setSeconds(value)}>
              {fill(messages.game.seconds, { n: value })}
            </button>
          ))}
        </div>
      )}
      {error ? <p role="alert">{error}</p> : null}
      <button type="button" className="btn primary block" onClick={() => void start()}>
        {messages.common.start}
      </button>
    </div>
  );
}
