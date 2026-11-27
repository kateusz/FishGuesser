"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FishArt } from "@/components/mascot/Captain";
import { useChrome } from "@/components/layout/AppShell";
import { ApiError, api } from "@/lib/api";
import { topScores } from "@/lib/game/records";
import { fill, messagesFor, type Messages } from "@/lib/messages";
import { sliderFromWeightKg, weightKgFromSlider, WEIGHT_KG_MAX, WEIGHT_KG_MIN } from "@/server/scoring";

const WEIGHT_MIN = WEIGHT_KG_MIN;
const WEIGHT_MAX = WEIGHT_KG_MAX;

let audio: AudioContext | null = null;
const heardRounds = new Set<string>();

function tone(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  osc.type = "sine";
  osc.frequency.value = 740;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.15);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
}

function play(ctx: AudioContext) {
  const start = () => {
    try {
      tone(ctx);
    } catch {
      /* browser refused */
    }
  };
  if (ctx.state === "running") start();
  else void ctx.resume().then(start).catch(() => {});
}

function beepFromGesture(sound: boolean) {
  if (!sound || typeof AudioContext === "undefined") return;
  try {
    if (!audio) audio = new AudioContext();
    play(audio);
  } catch {
    /* browser refused */
  }
}

// ponytail: round start never constructs AudioContext; autoplay needs the submit gesture first.
function beepIfArmed(sound: boolean) {
  if (!sound || !audio) return;
  try {
    play(audio);
  } catch {
    /* browser refused */
  }
}

const SCORE_CARD_FILE = "fishguesser-score.png";

function scoreCardCanvas(nick: string, score: number, rank: number | null) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = rank == null ? 280 : 340;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.fillStyle = "#FFF4DC";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
  ctx.fillStyle = "#14B8C4";
  ctx.font = "700 28px Arial, sans-serif";
  ctx.fillText("FishGuesser", 40, 64);
  ctx.fillStyle = "#111111";
  ctx.font = "700 48px Arial, sans-serif";
  ctx.fillText(nick, 40, 140);
  ctx.font = "700 64px Arial, sans-serif";
  ctx.fillText(String(score), 40, 220);
  if (rank != null) {
    ctx.font = "700 36px Arial, sans-serif";
    ctx.fillText(`#${rank}`, 40, 290);
  }
  return canvas;
}

function scoreCardFile(nick: string, score: number, rank: number | null) {
  const data = scoreCardCanvas(nick, score, rank).toDataURL("image/png");
  const binary = atob(data.slice(data.indexOf(",") + 1));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], SCORE_CARD_FILE, { type: "image/png" });
}

function downloadScoreCard(nick: string, score: number, rank: number | null) {
  const link = document.createElement("a");
  link.href = scoreCardCanvas(nick, score, rank).toDataURL("image/png");
  link.download = SCORE_CARD_FILE;
  link.click();
}

function canShareFile(file: File) {
  try {
    return typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

function onRoundActive(gameId: string, idx: number, sound: boolean) {
  const key = `${gameId}:${idx}`;
  if (heardRounds.has(key)) return;
  heardRounds.add(key);
  beepIfArmed(sound);
}

function parseKg(raw: string): number | null {
  const trimmed = raw.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

function weightAccepted(raw: string): boolean {
  const value = parseKg(raw);
  return value != null && value >= WEIGHT_MIN && value <= WEIGHT_MAX;
}

function timerLabel(left: number | null, round: Messages["round"]): string {
  if (left == null) return round.noLimit;
  if (left <= 5) return fill(round.tick, { n: left });
  return fill(round.left, { n: Math.ceil(left / 5) * 5 });
}

const POOL_IDS = ["EU", "PL", "EU_MINUS_PL"] as const;
const MODE_IDS = ["mix", "species", "weight", "price"] as const;

type Option = { id: string; namePl: string; nameLatin: string };
type View = {
  phase: string;
  stateVersion: number;
  serverNow: string;
  poolCounts: Record<string, number>;
  you: { id: string; isHost: boolean; nickname: string; avatarId: string };
  game: {
    id: string;
    code: string | null;
    type: string;
    pool: string;
    mode: string;
    rounds: number;
    seconds: number | null;
    difficulty: string;
    currentRound: number;
    phaseEndsAt: string | null;
  };
  players: Array<{ id: string; nickname: string; avatarId: string; isHost: boolean; score: number; rank: number | null }>;
  round?: {
    idx: number;
    mode: "species" | "weight" | "price";
    deadlineAt: string | null;
    question?: {
      photoToken?: string;
      credit?: string;
      photoAlt?: string;
      options?: Option[];
      hint?: string | null;
      productForm?: string;
      market?: string;
      observedOn?: string;
      minKg?: number;
      maxKg?: number;
      minPln?: number;
      maxPln?: number;
    };
    myAnswer: { optionId?: string; kg?: number; plnPerKg?: number } | null;
    answerCount: number;
    playerCount: number;
  };
  results?: {
    truth: {
      namePl: string;
      nameLatin: string;
      funFact: string;
      credit: string;
      correctOptionId: string | null;
      weightKg: number | null;
      pricePlnPerKg: number | null;
    };
    answers: Array<{ playerId: string; nickname: string; points: number; answer: { optionId?: string; kg?: number; plnPerKg?: number } }>;
  };
  summary?: { players?: Array<{ playerId: string; meanAbsPercentError: number | null }> } | null;
};

export function RoomScreen({ locale, code, gameId }: { locale: string; code?: string; gameId?: string }) {
  const messages = messagesFor(locale);
  const { sound } = useChrome();
  const router = useRouter();
  const base = code ? `/api/v1/rooms/${code}` : `/api/v1/solo/games/${gameId}`;
  const [view, setView] = useState<View | null>(null);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const [optionId, setOptionId] = useState("");
  const [kgText, setKgText] = useState("1");
  const [price, setPrice] = useState(40);
  const [top, setTop] = useState<number[] | null>(null);
  const [recordToast, setRecordToast] = useState("");
  const [shareNote, setShareNote] = useState("");
  const [offline, setOffline] = useState(false);
  const [backNote, setBackNote] = useState("");
  const seen = useRef(0);
  const wasOffline = useRef(false);

  function markOffline() {
    wasOffline.current = true;
    setBackNote("");
    setOffline(true);
    setError("");
  }

  function markOnline() {
    if (wasOffline.current) setBackNote(messages.room.back);
    wasOffline.current = false;
    setOffline(false);
  }

  function accept(next: View) {
    if (next.stateVersion < seen.current) return;
    seen.current = next.stateVersion;
    setView(next);
    setError("");
  }

  async function load() {
    try {
      accept(await api<View>(`${base}/state`));
      markOnline();
    } catch (caught) {
      if (caught instanceof ApiError && caught.code === "NOT_A_MEMBER" && code) {
        router.push(`/${locale}/profile?intent=join&code=${code}`);
        return;
      }
      if (!(caught instanceof ApiError)) {
        markOffline();
        return;
      }
      markOnline();
      setError(caught.message);
    }
  }

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    const poll = window.setInterval(() => void load(), 2000);
    void load();
    return () => {
      window.clearInterval(timer);
      window.clearInterval(poll);
    };
  }, [base]);

  useEffect(() => {
    setOptionId("");
    setKgText("1");
    setPrice(40);
  }, [view?.round?.idx]);

  useEffect(() => {
    if (view?.phase !== "round_active" || view.round == null) return;
    onRoundActive(view.game.id, view.round.idx, sound);
  }, [view?.phase, view?.game.id, view?.round?.idx, sound]);

  const soloRecord =
    view?.phase === "finished" && view.game.type === "solo"
      ? view.players.find((player) => player.id === view.you.id)
      : undefined;
  const soloKey = view
    ? `fg-records-${view.game.pool}-${view.game.mode}-${view.game.rounds}-${view.game.seconds == null ? "untimed" : "timed"}`
    : "";
  const soloGameId = view?.game.type === "solo" ? view.game.id : "";

  useEffect(() => {
    if (view?.phase !== "finished" || !soloGameId || soloRecord == null) return;
    try {
      setRecordToast("");
      setTop(topScores(localStorage, soloKey, soloRecord.score, soloGameId));
    } catch {
      setRecordToast(messages.finished.recordFailed);
    }
  }, [view?.phase, soloGameId, soloKey, soloRecord, messages.finished.recordFailed]);

  useEffect(() => {
    if (!backNote) return;
    const id = window.setTimeout(() => setBackNote(""), 4000);
    return () => window.clearTimeout(id);
  }, [backNote]);

  async function send(path: string, method: string, body?: unknown) {
    setError("");
    try {
      const next = await api<View>(`${base}${path}`, { method, body });
      if (next && "phase" in next) {
        accept(next);
        markOnline();
      } else await load();
    } catch (caught) {
      if (!(caught instanceof ApiError)) {
        markOffline();
        return;
      }
      markOnline();
      setError(caught.message);
    }
  }

  const connection = offline ? (
    <p className="toast" role="status">
      {messages.room.reconnecting}{" "}
      <button type="button" className="link-btn" onClick={() => void load()}>
        {messages.common.retry}
      </button>
    </p>
  ) : backNote ? (
    <p className="toast" role="status">
      {backNote}
    </p>
  ) : null;

  if (!view) {
    return (
      <div className="stack">
        {connection}
        {offline ? null : <p>{error || messages.room.connecting}</p>}
        {error && !offline ? (
          <button type="button" className="btn block" onClick={() => void load()}>
            {messages.common.retry}
          </button>
        ) : null}
      </div>
    );
  }
  const ends = view.game.phaseEndsAt ? Date.parse(view.game.phaseEndsAt) : null;
  const left = ends ? Math.max(0, Math.ceil((ends - now) / 1000)) : null;

  if (view.phase === "lobby" && code) {
    function saveSettings(patch: { pool?: string; mode?: string; rounds?: number; seconds?: number }) {
      const game = view?.game;
      if (!game) return;
      void send("/settings", "PATCH", {
        pool: patch.pool ?? game.pool,
        mode: patch.mode ?? game.mode,
        rounds: patch.rounds ?? game.rounds,
        seconds: patch.seconds ?? game.seconds ?? 30,
        difficulty: game.difficulty,
      });
    }

    return (
      <div className="stack">
        {connection}
        <div className="room-code">{view.game.code}</div>
        <p>{view.players.length}/12</p>
        {POOL_IDS.map((id) => (
          <button key={id} type="button" className={`chip${view.game.pool === id ? " active" : ""}`} aria-pressed={view.game.pool === id} disabled={!view.you.isHost} onClick={() => saveSettings({ pool: id })}>
            {messages.game.pools[id]} · {view.poolCounts[id] ?? 0}
          </button>
        ))}
        <div className="chips">
          {MODE_IDS.map((id) => (
            <button key={id} type="button" className={`chip${view.game.mode === id ? " active" : ""}`} aria-pressed={view.game.mode === id} disabled={!view.you.isHost} onClick={() => saveSettings({ mode: id })}>
              {messages.game.modes[id]}
            </button>
          ))}
        </div>
        <div className="chips">
          {[5, 10, 15].map((value) => (
            <button key={value} type="button" className={`chip${view.game.rounds === value ? " active" : ""}`} aria-pressed={view.game.rounds === value} disabled={!view.you.isHost} onClick={() => saveSettings({ rounds: value })}>
              {fill(messages.game.rounds, { n: value })}
            </button>
          ))}
        </div>
        <div className="chips">
          {[15, 30, 45, 60].map((value) => (
            <button key={value} type="button" className={`chip${view.game.seconds === value ? " active" : ""}`} aria-pressed={view.game.seconds === value} disabled={!view.you.isHost} onClick={() => saveSettings({ seconds: value })}>
              {fill(messages.game.seconds, { n: value })}
            </button>
          ))}
        </div>
        {view.players.map((player) => (
          <div key={player.id} className="player-row">
            <span className="avatar">
              <FishArt i={Number(player.avatarId.slice(-2)) - 1} />
            </span>
            <span className="player-name">{player.nickname}{player.isHost ? " ♛" : ""}</span>
          </div>
        ))}
        {error ? (
          <p role="alert">
            {error}{" "}
            <button type="button" className="link-btn" onClick={() => void load()}>
              {messages.common.retry}
            </button>
          </p>
        ) : null}
        {view.you.isHost ? (
          <>
            {view.players.length < 2 ? <p>{messages.lobby.needPlayer}</p> : null}
            <button type="button" className="btn primary block" disabled={view.players.length < 2} onClick={() => void send("/start", "POST", {})}>
              {messages.common.start}
            </button>
          </>
        ) : (
          <p>{messages.lobby.waiting}</p>
        )}
        <button type="button" className="link-btn" onClick={() => void send("/leave", "POST", {}).then(() => router.push(`/${locale}`))}>
          {messages.lobby.leave}
        </button>
      </div>
    );
  }

  if (view.phase === "countdown") {
    return (
      <div className="countdown">
        {connection}
        <div className="countdown-num">{left ?? 3}</div>
        <p>{messages.round.countdown}</p>
      </div>
    );
  }

  if (view.phase === "round_active" && view.round?.question) {
    const question = view.round.question;
    const locked = Boolean(view.round.myAnswer);
    return (
      <div className="stack">
        {connection}
        <div className="round-top">
          <span className="tag">{fill(messages.round.label, { current: view.round.idx, total: view.game.rounds })}</span>
          <div className={`timer${left != null && left <= 5 ? " urgent" : ""}`} aria-label={timerLabel(left, messages.round)}>{left ?? "∞"}</div>
        </div>
        <figure className="photo">
          <div className="photo-frame">
            <img src={`/api/v1/assets/${question.photoToken}`} alt={messages.round.photoAlt} />
          </div>
          <figcaption>{String(question.credit ?? "")}</figcaption>
        </figure>
        {view.round.mode === "species" ? (
          <div className="answers">
            {(question.options ?? []).map((option) => {
              const picked = optionId === option.id || view.round?.myAnswer?.optionId === option.id;
              return (
                <button key={option.id} type="button" className={`answer${picked ? " selected" : ""}`} aria-pressed={picked} disabled={locked} onClick={() => setOptionId(option.id)}>
                  <strong>{option.namePl}</strong>
                  <i>{option.nameLatin}</i>
                </button>
              );
            })}
          </div>
        ) : null}
        {view.round.mode === "weight" ? (
          <div className="stack">
            {question.hint ? <p className="bubble">{question.hint}</p> : null}
            {/* ponytail: one ceiling for every fish, above the heaviest in the catalog (80 kg). */}
            <WeightField
              locked={locked}
              savedKg={view.round.myAnswer?.kg}
              kgText={kgText}
              onKgText={setKgText}
              weightLabel={messages.round.weight}
              sliderLabel={messages.round.weightSlider}
              rangeError={messages.round.weightRange}
            />
          </div>
        ) : null}
        {view.round.mode === "price" ? (
          <div className="stack">
            <p>{question.productForm} · {question.market} · {question.observedOn}</p>
            <input
              className="field"
              inputMode="decimal"
              value={String(locked && typeof view.round.myAnswer?.plnPerKg === "number" ? view.round.myAnswer.plnPerKg : price)}
              disabled={locked}
              aria-label={messages.round.price}
              onChange={(event) => setPrice(Number(event.target.value.replace(",", ".")))}
            />
            <div className="chips">
              {[5, 10, 50].map((step) => (
                <button key={step} type="button" className="chip" disabled={locked} onClick={() => setPrice((value) => Math.min(question.maxPln ?? 200, value + step))}>+{step}</button>
              ))}
            </div>
          </div>
        ) : null}
        <p>{fill(messages.round.answered, { done: view.round.answerCount, total: view.round.playerCount })}</p>
        {error ? (
          <p role="alert">
            {error}{" "}
            <button type="button" className="link-btn" onClick={() => void load()}>
              {messages.common.retry}
            </button>
          </p>
        ) : null}
        <button
          type="button"
          className="btn primary block"
          disabled={
            offline ||
            locked ||
            (view.round.mode === "species" && !(question.options ?? []).some((option) => option.id === optionId)) ||
            (view.round.mode === "weight" && !weightAccepted(kgText))
          }
          onClick={() => {
            beepFromGesture(sound);
            const kg = parseKg(kgText);
            const answer = view.round?.mode === "species" ? { optionId } : view.round?.mode === "weight" ? { kg } : { plnPerKg: price };
            void send(`/rounds/${view.round?.idx}/answer`, "POST", { requestId: crypto.randomUUID(), answer });
          }}
        >
          {locked ? messages.round.locked : messages.round.submit}
        </button>
      </div>
    );
  }

  if ((view.phase === "round_results" || view.phase === "ranking") && view.results) {
    const mine = view.results.answers.find((item) => item.playerId === view.you.id);
    return (
      <div className={view.phase === "ranking" && view.players.length >= 12 ? "stack has-rank-pin" : "stack"}>
        {connection}
        <h1 className="display title">{view.results.truth.namePl}</h1>
        <p><i>{view.results.truth.nameLatin}</i></p>
        <p>{view.results.truth.funFact}</p>
        <p className="result-score">{mine?.points ?? 0}</p>
        {view.phase === "ranking" ? (
          <>
            {view.players.map((player) => (
              <div key={player.id} className={`rank-row${player.id === view.you.id ? " me" : ""}`}>
                <span className="position">{player.rank}</span>
                <span className="rank-name">{player.nickname}</span>
                <span className="points">{player.score}</span>
              </div>
            ))}
            {view.players.length >= 12
              ? view.players
                  .filter((player) => player.id === view.you.id)
                  .map((player) => (
                    <div key={`${player.id}-pin`} className="rank-sticky" aria-hidden="true">
                      <div className="rank-row me">
                        <span className="position">{player.rank}</span>
                        <span className="rank-name">{player.nickname}</span>
                        <span className="points">{player.score}</span>
                      </div>
                    </div>
                  ))
              : null}
          </>
        ) : null}
        {view.you.isHost || view.game.type === "solo" ? (
          <button type="button" className="btn primary block" onClick={() => void send("/advance", "POST", {})}>{messages.common.next}</button>
        ) : (
          <p>
            {messages.results.hostNext}
            {left != null ? ` · ${left}s` : ""}
          </p>
        )}
      </div>
    );
  }

  if (view.phase === "finished") {
    const current = view;
    const ordered = [...current.players].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
    const numeric = current.summary?.players?.find((item) => item.playerId === current.you.id)?.meanAbsPercentError;
    const mine = current.players.find((player) => player.id === current.you.id);
    const scoreLine = fill(messages.finished.scoreLine, {
      nick: current.you.nickname,
      score: mine?.score ?? 0,
      rank: mine?.rank ?? "—",
    });
    async function shareScore() {
      setShareNote("");
      if (typeof navigator.share === "function") {
        const share: ShareData = { title: "FishGuesser", text: scoreLine };
        const file = scoreCardFile(current.you.nickname, mine?.score ?? 0, mine?.rank ?? null);
        if (canShareFile(file)) share.files = [file];
        try {
          await navigator.share(share);
          return;
        } catch (caught) {
          if (caught instanceof Error && caught.name === "AbortError") return;
        }
      }
      try {
        await navigator.clipboard.writeText(scoreLine);
        setShareNote(messages.finished.copied);
      } catch {
        setShareNote(messages.finished.copyFailed);
      }
    }
    async function again() {
      setShareNote("");
      const settings = {
        pool: current.game.pool,
        mode: current.game.mode,
        rounds: current.game.rounds,
        seconds: current.game.seconds ?? 30,
        difficulty: current.game.difficulty,
      };
      try {
        if (current.game.type === "solo") {
          const state = await api<{ game: { id: string } }>("/api/v1/solo/games", {
            method: "POST",
            body: {
              nickname: current.you.nickname,
              avatarId: current.you.avatarId,
              untimed: current.game.seconds == null,
              settings,
            },
          });
          router.push(`/${locale}/solo/${state.game.id}`);
          return;
        }
        const state = await api<{ game: { code: string } }>("/api/v1/rooms", {
          method: "POST",
          body: { nickname: current.you.nickname, avatarId: current.you.avatarId, settings },
        });
        router.push(`/${locale}/room/${state.game.code}`);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : messages.finished.againFailed);
      }
    }
    return (
      <div className="stack">
        {connection}
        <h1 className="display title">{messages.finished.title}</h1>
        {ordered.slice(0, 3).map((player) => (
          <div key={player.id} className="player-row"><strong>{player.rank}. {player.nickname}</strong><span>{player.score}</span></div>
        ))}
        <p>{fill(messages.finished.numeric, { value: numeric == null ? messages.finished.notApplicable : `${Math.round(numeric)}%` })}</p>
        {view.game.type === "solo" && top ? (
          <div className="panel">
            <h2>{messages.finished.top}</h2>
            {top.map((score, index) => (
              <div key={`${score}-${index}`} className="player-row">
                <span>{index + 1}.</span>
                <span className="player-name">{messages.finished.yourScore}</span>
                <b>{score}</b>
              </div>
            ))}
          </div>
        ) : null}
        {recordToast ? (
          <p className="toast" role="status">
            {recordToast}
          </p>
        ) : null}
        {error ? <p role="alert">{error}</p> : null}
        <button type="button" className="btn primary block" onClick={() => void again()}>
          {messages.finished.again}
        </button>
        <div className="row">
          <button type="button" className="btn" style={{ flex: 1, minWidth: 0 }} onClick={() => void shareScore()}>
            {messages.finished.share}
          </button>
          <button
            type="button"
            className="btn"
            style={{ flex: 1, minWidth: 0 }}
            onClick={() => downloadScoreCard(current.you.nickname, mine?.score ?? 0, mine?.rank ?? null)}
          >
            {messages.finished.card}
          </button>
        </div>
        {shareNote ? (
          <p className="toast" role="status">
            {shareNote}
          </p>
        ) : null}
        <button type="button" className="link-btn" onClick={() => router.push(`/${locale}`)}>
          {messages.finished.exit}
        </button>
      </div>
    );
  }

  return (
    <div className="stack">
      {connection}
      {offline ? null : <p>{error || messages.room.wait}</p>}
    </div>
  );
}

function WeightField({
  locked,
  savedKg,
  kgText,
  onKgText,
  weightLabel,
  sliderLabel,
  rangeError,
}: {
  locked: boolean;
  savedKg: number | undefined;
  kgText: string;
  onKgText: (value: string) => void;
  weightLabel: string;
  sliderLabel: string;
  rangeError: string;
}) {
  const shown = locked && typeof savedKg === "number" ? String(savedKg) : kgText;
  const parsed = parseKg(shown);
  const rejected = shown.trim() !== "" && !weightAccepted(shown);
  return (
    <>
      <label className="field-label" htmlFor="weight-kg">
        {weightLabel}
      </label>
      <input
        id="weight-kg"
        className="field"
        inputMode="decimal"
        value={shown}
        disabled={locked}
        aria-invalid={rejected ? true : undefined}
        onChange={(event) => onKgText(event.target.value)}
      />
      <input
        type="range"
        min={0}
        max={1000}
        value={sliderFromWeightKg(parsed ?? 1, WEIGHT_MIN, WEIGHT_MAX)}
        onChange={(event) => {
          const next = Math.round(weightKgFromSlider(Number(event.target.value), WEIGHT_MIN, WEIGHT_MAX) * 100) / 100;
          onKgText(String(next));
        }}
        disabled={locked}
        aria-label={sliderLabel}
      />
      <p className="value-big">{parsed == null ? shown || "—" : `${parsed.toFixed(2)} kg`}</p>
      {rejected ? <p role="status">{rangeError}</p> : null}
    </>
  );
}
