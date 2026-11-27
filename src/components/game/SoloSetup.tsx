"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FishArt } from "@/components/mascot/Captain";
import { api } from "@/lib/api";
import { fill, messagesFor } from "@/lib/messages";

const POOLS = ["EU", "PL", "EU_MINUS_PL"] as const;
const MODES = ["mix", "species", "weight", "price"] as const;
const DIFFICULTIES = ["easy", "medium", "hard", "mix"] as const;
const poolMarks = { PL: "PL", EU: "EU", EU_MINUS_PL: "EU−" };
const poolCopy = { PL: "poolPoland", EU: "poolEurope", EU_MINUS_PL: "poolEuropeWithoutPoland" } as const;

export function SoloSetup({ locale, poolCounts }: { locale: string; poolCounts: Record<(typeof POOLS)[number], number> }) {
  const messages = messagesFor(locale);
  const copy = messages.solo;
  const router = useRouter();
  const [pool, setPool] = useState<(typeof POOLS)[number]>("EU");
  const [mode, setMode] = useState<(typeof MODES)[number]>("mix");
  const [rounds, setRounds] = useState(5);
  const [seconds, setSeconds] = useState(30);
  const [untimed, setUntimed] = useState(false);
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>("medium");
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
          settings: { pool, mode, rounds, seconds, difficulty },
        },
      });
      router.push(`/${locale}/solo/${state.game.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.startFailed);
    }
  }

  return (
    <div className="narrow-content stack">
      <span className="tag">{copy.tag}</span>
      <h1 className="display title">{copy.heading}</h1>
      <div className="mascot-line lobby-tip">
        <FishArt i={1} pose="think" mascot />
        <p className="bubble">{copy.hint}</p>
      </div>
      <div className="setting-group">
        <span className="label">{messages.lobby.fishPool}</span>
        <div className="pool-grid">
          {POOLS.map((id) => (
            <button key={id} type="button" className={`pool${pool === id ? " active" : ""}`} aria-pressed={pool === id} onClick={() => setPool(id)}>
              <span className="pool-symbol">{poolMarks[id]}</span>
              <span><strong>{messages.game.pools[id]}</strong><small>{messages.lobby[poolCopy[id]]}</small><small>{fill(messages.lobby.fishCount, { n: poolCounts[id] })}</small></span>
              <span className="check">{pool === id ? "✓" : "○"}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="setting-group">
        <span className="label">{messages.lobby.questionModes}</span>
        <div className="chips">
          {MODES.map((id) => (
            <button key={id} type="button" className={`chip${mode === id ? " active" : ""}`} aria-pressed={mode === id} onClick={() => setMode(id)}>
              {messages.game.modes[id]}
            </button>
          ))}
        </div>
      </div>
      <div className="settings-fields">
        <div className="setting-group">
          <span className="label">{messages.lobby.roundCount}</span>
          <div className="chips">
            {[5, 10, 15].map((value) => (
              <button key={value} type="button" className={`chip${rounds === value ? " active" : ""}`} aria-pressed={rounds === value} onClick={() => setRounds(value)}>
                {value}
              </button>
            ))}
          </div>
        </div>
        <div className="setting-group">
          <span className="label">{messages.lobby.roundTime}</span>
          <div className="chips">
            {[15, 30, 45, 60].map((value) => (
              <button key={value} type="button" className={`chip${seconds === value ? " active" : ""}`} aria-pressed={seconds === value} disabled={untimed} onClick={() => setSeconds(value)}>
                {fill(messages.game.seconds, { n: value })}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="setting-group">
        <span className="label">{messages.lobby.difficulty}</span>
        <div className="chips">
          {DIFFICULTIES.map((value) => (
            <button key={value} type="button" className={`chip${difficulty === value ? " active" : ""}`} aria-pressed={difficulty === value} onClick={() => setDifficulty(value)}>
              {messages.lobby.difficulties[value]}
            </button>
          ))}
        </div>
      </div>
      <label className="check-row">
        {copy.untimed}
        <input type="checkbox" checked={untimed} onChange={(event) => setUntimed(event.target.checked)} />
      </label>
      <p className="small">{copy.catalogNote}</p>
      {error ? <p role="alert">{error}</p> : null}
      <button type="button" className="btn primary block" onClick={() => void start()}>
        {copy.start}
      </button>
    </div>
  );
}
