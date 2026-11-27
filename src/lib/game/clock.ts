export const COUNTDOWN_MS = 3_000;
export const RESULTS_MS = 8_000;
export const RANKING_MS = 5_000;

export type Phase =
  | "lobby"
  | "countdown"
  | "round_active"
  | "round_results"
  | "ranking"
  | "finished"
  | "abandoned";

export type Clock = {
  status: Phase;
  currentRound: number;
  roundsCount: number;
  secondsPerRound: number | null;
  phaseEndsAt: number | null;
  activePlayers: number;
  solo: boolean;
};

export type ClockStep = {
  status: Phase;
  currentRound: number;
  phaseEndsAt: number | null;
  changed: boolean;
};

function unchanged(game: Clock): ClockStep {
  return {
    status: game.status,
    currentRound: game.currentRound,
    phaseEndsAt: game.phaseEndsAt,
    changed: false,
  };
}

function nextRound(game: Clock, now: number): ClockStep {
  if (game.currentRound >= game.roundsCount) {
    return { status: "finished", currentRound: game.currentRound, phaseEndsAt: null, changed: true };
  }
  return {
    status: "countdown",
    currentRound: game.currentRound + 1,
    phaseEndsAt: now + COUNTDOWN_MS,
    changed: true,
  };
}

export function stepClock(game: Clock, now: number, action: "tick" | "advance"): ClockStep {
  if (game.activePlayers <= 0 && game.status !== "finished" && game.status !== "abandoned") {
    return { status: "abandoned", currentRound: game.currentRound, phaseEndsAt: null, changed: true };
  }
  if (game.status === "finished" || game.status === "abandoned" || game.status === "lobby") {
    return unchanged(game);
  }

  if (action === "advance") {
    if (game.status === "round_results") {
      return game.solo
        ? nextRound(game, now)
        : { status: "ranking", currentRound: game.currentRound, phaseEndsAt: now + RANKING_MS, changed: true };
    }
    if (game.status === "ranking") return nextRound(game, now);
    return unchanged(game);
  }

  if (game.phaseEndsAt == null || now < game.phaseEndsAt) return unchanged(game);

  if (game.status === "countdown") {
    return {
      status: "round_active",
      currentRound: game.currentRound,
      phaseEndsAt: game.secondsPerRound == null ? null : now + game.secondsPerRound * 1000,
      changed: true,
    };
  }
  if (game.status === "round_active") {
    return {
      status: "round_results",
      currentRound: game.currentRound,
      phaseEndsAt: game.solo ? null : now + RESULTS_MS,
      changed: true,
    };
  }
  if (game.status === "round_results") {
    return game.solo
      ? nextRound(game, now)
      : { status: "ranking", currentRound: game.currentRound, phaseEndsAt: now + RANKING_MS, changed: true };
  }
  return nextRound(game, now);
}
