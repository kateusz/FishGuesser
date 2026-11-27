import { describe, expect, test } from "vitest";
import { COUNTDOWN_MS, RESULTS_MS, stepClock, type Clock } from "@/lib/game/clock";
import { rankPlayers } from "@/lib/game/ranking";

const now = Date.parse("2026-11-26T18:00:00.000Z");

function clock(patch: Partial<Clock>): Clock {
  return {
    status: "countdown",
    currentRound: 1,
    roundsCount: 5,
    secondsPerRound: 30,
    phaseEndsAt: now + COUNTDOWN_MS,
    activePlayers: 2,
    solo: false,
    ...patch,
  };
}

describe("zegar rundy", () => {
  test("tick przed końcem odliczania nic nie zmienia", () => {
    expect(stepClock(clock({}), now, "tick").changed).toBe(false);
  });

  test("tick po odliczaniu otwiera rundę na czas z ustawień", () => {
    const next = stepClock(clock({ phaseEndsAt: now }), now, "tick");
    expect(next.status).toBe("round_active");
    expect(next.phaseEndsAt).toBe(now + 30_000);
  });

  test("solo bez limitu nie dostaje deadline", () => {
    const next = stepClock(clock({ solo: true, secondsPerRound: null, phaseEndsAt: now }), now, "tick");
    expect(next.status).toBe("round_active");
    expect(next.phaseEndsAt).toBeNull();
  });

  test("advance nie zamyka aktywnej rundy przed deadline", () => {
    const next = stepClock(
      clock({ status: "round_active", phaseEndsAt: now + 30_000 }),
      now,
      "advance",
    );
    expect(next.changed).toBe(false);
    expect(next.status).toBe("round_active");
  });

  test("po deadline runda przechodzi do wyników", () => {
    const next = stepClock(clock({ status: "round_active", phaseEndsAt: now }), now, "tick");
    expect(next.status).toBe("round_results");
    expect(next.phaseEndsAt).toBe(now + RESULTS_MS);
  });

  test("ostatni ranking kończy grę", () => {
    const next = stepClock(
      clock({ status: "ranking", currentRound: 5, phaseEndsAt: now }),
      now,
      "tick",
    );
    expect(next.status).toBe("finished");
    expect(next.phaseEndsAt).toBeNull();
  });

  test("ranking w środku gry wraca do odliczania kolejnej rundy", () => {
    const next = stepClock(
      clock({ status: "ranking", currentRound: 2, phaseEndsAt: now }),
      now,
      "advance",
    );
    expect(next).toMatchObject({ status: "countdown", currentRound: 3, changed: true });
    expect(next.phaseEndsAt).toBe(now + COUNTDOWN_MS);
  });

  test("zero graczy porzuca grę", () => {
    const next = stepClock(clock({ status: "round_active", activePlayers: 0, phaseEndsAt: null }), now, "tick");
    expect(next.status).toBe("abandoned");
  });

  test("solo po wyniku ostatniej rundy kończy grę bez rankingu", () => {
    const next = stepClock(
      clock({ solo: true, status: "round_results", currentRound: 1, roundsCount: 1, phaseEndsAt: null }),
      now,
      "advance",
    );
    expect(next.status).toBe("finished");
  });
});

describe("ranking", () => {
  test("remis punktów rozstrzyga suma trafności, potem czas", () => {
    const ranked = rankPlayers([
      { id: "a", score: 100, accuracySum: 0.4, responseMs: 1000 },
      { id: "b", score: 100, accuracySum: 0.9, responseMs: 5000 },
      { id: "c", score: 100, accuracySum: 0.9, responseMs: 2000 },
    ]);
    expect(ranked.map((row) => row.id)).toEqual(["c", "b", "a"]);
    expect(ranked.map((row) => row.rank)).toEqual([1, 2, 3]);
  });

  test("pełny remis daje wspólne miejsce i omija kolejne", () => {
    const ranked = rankPlayers([
      { id: "a", score: 50, accuracySum: 1, responseMs: 10 },
      { id: "b", score: 50, accuracySum: 1, responseMs: 10 },
      { id: "c", score: 10, accuracySum: 0, responseMs: 10 },
    ]);
    expect(ranked.map((row) => row.rank)).toEqual([1, 1, 3]);
  });
});
