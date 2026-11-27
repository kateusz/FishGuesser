import { randomInt, randomUUID } from "node:crypto";
import { RESULTS_MS, stepClock, type Clock } from "@/lib/game/clock";
import { cleanNick, isAvatarId } from "@/lib/game/nickname";
import { buildRoundPlan } from "@/lib/game/plan";
import { rankPlayers } from "@/lib/game/ranking";
import { fishById, fishes, poolCounts, type Difficulty, type GameMode, type Pool, type QuestionMode } from "@/server/fish";
import { GameError } from "@/server/errors";
import { numericAccuracy, roundPoints, WEIGHT_KG_MAX, WEIGHT_KG_MIN } from "@/server/scoring";
import { dbError, serviceClient } from "@/server/sb";

export { GameError } from "@/server/errors";

type GameRow = {
  id: string;
  type: "multiplayer" | "solo";
  status: Clock["status"];
  code: string | null;
  pool: Pool;
  mode: GameMode;
  rounds_count: number;
  seconds: number | null;
  difficulty: Difficulty;
  current_round: number;
  phase_ends_at: number | null;
  host_user_id: string;
  state_version: number;
  summary: unknown;
  created_at: number;
};

type PlayerRow = {
  id: string;
  game_id: string;
  user_id: string;
  nickname: string;
  avatar_id: string;
  status: string;
  total_score: number;
  accuracy_sum: number;
  response_sum: number;
  joined_at: number;
  last_seen: number;
};

type RoundRow = {
  id: string;
  game_id: string;
  idx: number;
  mode: QuestionMode;
  status: string;
  question: unknown;
  truth: unknown;
  photo_token: string;
  starts_at: number | null;
  deadline_at: number | null;
};

type AnswerRow = {
  id: string;
  round_id: string;
  player_id: string;
  request_id: string;
  answer: unknown;
  accuracy: number;
  points: number;
  response_ms: number;
  submitted_at: number;
};

type Truth = {
  fishId: string;
  namePl: string;
  funFact: string;
  credit: string;
  correctOptionId?: string;
  weightKg?: number;
  weightNote?: string;
  pricePlnPerKg?: number;
};

const ROUNDS = new Set([5, 10, 15]);
const SECONDS = new Set([15, 30, 45, 60]);
const POOLS = new Set<Pool>(["PL", "EU", "EU_MINUS_PL"]);
const MODES = new Set<GameMode>(["species", "weight", "price", "mix"]);
const DIFFICULTIES = new Set<Difficulty>(["easy", "medium", "hard", "mix"]);

export type Settings = {
  pool: Pool;
  mode: GameMode;
  rounds: number;
  seconds: number | null;
  difficulty: Difficulty;
};

function num(value: unknown): number {
  return typeof value === "number" ? value : Number(value);
}

function json<T>(value: unknown): T {
  if (typeof value === "string") return JSON.parse(value) as T;
  return value as T;
}

function gameFrom(row: Record<string, unknown>): GameRow {
  return {
    id: String(row.id),
    type: row.type as GameRow["type"],
    status: row.status as GameRow["status"],
    code: row.code == null ? null : String(row.code),
    pool: row.pool as Pool,
    mode: row.mode as GameMode,
    rounds_count: num(row.rounds_count),
    seconds: row.seconds == null ? null : num(row.seconds),
    difficulty: row.difficulty as Difficulty,
    current_round: num(row.current_round),
    phase_ends_at: row.phase_ends_at == null ? null : num(row.phase_ends_at),
    host_user_id: String(row.host_user_id),
    state_version: num(row.state_version),
    summary: row.summary ?? null,
    created_at: num(row.created_at),
  };
}

function playerFrom(row: Record<string, unknown>): PlayerRow {
  return {
    id: String(row.id),
    game_id: String(row.game_id),
    user_id: String(row.user_id),
    nickname: String(row.nickname),
    avatar_id: String(row.avatar_id),
    status: String(row.status),
    total_score: num(row.total_score),
    accuracy_sum: num(row.accuracy_sum),
    response_sum: num(row.response_sum),
    joined_at: num(row.joined_at),
    last_seen: num(row.last_seen),
  };
}

function roundFrom(row: Record<string, unknown>): RoundRow {
  return {
    id: String(row.id),
    game_id: String(row.game_id),
    idx: num(row.idx),
    mode: row.mode as QuestionMode,
    status: String(row.status),
    question: row.question,
    truth: row.truth,
    photo_token: String(row.photo_token),
    starts_at: row.starts_at == null ? null : num(row.starts_at),
    deadline_at: row.deadline_at == null ? null : num(row.deadline_at),
  };
}

function answerFrom(row: Record<string, unknown>): AnswerRow {
  return {
    id: String(row.id),
    round_id: String(row.round_id),
    player_id: String(row.player_id),
    request_id: String(row.request_id),
    answer: row.answer,
    accuracy: num(row.accuracy),
    points: num(row.points),
    response_ms: num(row.response_ms),
    submitted_at: num(row.submitted_at),
  };
}

async function gameById(id: string): Promise<GameRow> {
  const result = await serviceClient().from("games").select("*").eq("id", id).maybeSingle();
  dbError(result.error);
  if (!result.data) throw new GameError(404, "GAME_NOT_FOUND", "Nie ma takiej gry.");
  return gameFrom(result.data as Record<string, unknown>);
}

async function gameByCode(code: string): Promise<GameRow> {
  const result = await serviceClient().from("games").select("*").eq("code", code.toUpperCase()).maybeSingle();
  dbError(result.error);
  if (!result.data) throw new GameError(404, "ROOM_NOT_FOUND", "Nie ma takiego pokoju.");
  return gameFrom(result.data as Record<string, unknown>);
}

async function playersOf(gameId: string): Promise<PlayerRow[]> {
  const result = await serviceClient().from("players").select("*").eq("game_id", gameId).order("joined_at");
  dbError(result.error);
  return ((result.data ?? []) as Record<string, unknown>[]).map(playerFrom);
}

function active(players: PlayerRow[]): PlayerRow[] {
  return players.filter((player) => player.status === "active");
}

function selfPlayer(players: PlayerRow[], userId: string): PlayerRow {
  const player = players.find((item) => item.user_id === userId);
  if (!player || player.status !== "active") {
    throw new GameError(403, player?.status === "kicked" ? "PLAYER_KICKED" : "NOT_A_MEMBER", "Nie jesteś w tej grze.");
  }
  return player;
}

function parseSettings(input: Partial<Settings>, soloUntimed = false): Settings {
  const pool = input.pool ?? "EU";
  const mode = input.mode ?? "mix";
  const rounds = input.rounds ?? 5;
  const difficulty = input.difficulty ?? "medium";
  const seconds = soloUntimed ? null : (input.seconds ?? 30);
  if (!POOLS.has(pool) || !MODES.has(mode) || !DIFFICULTIES.has(difficulty) || !ROUNDS.has(rounds)) {
    throw new GameError(400, "VALIDATION_ERROR", "Złe ustawienia gry.");
  }
  if (seconds != null && !SECONDS.has(seconds)) throw new GameError(400, "VALIDATION_ERROR", "Zły czas rundy.");
  if (!soloUntimed && seconds == null) throw new GameError(400, "VALIDATION_ERROR", "Wybierz czas rundy.");
  return { pool, mode, rounds, seconds, difficulty };
}

function identity(nickname: string, avatarId: string) {
  const nick = cleanNick(nickname);
  if (!nick.ok) throw new GameError(400, "VALIDATION_ERROR", nick.message);
  if (!isAvatarId(avatarId)) throw new GameError(400, "VALIDATION_ERROR", "Wybierz awatar.");
  return { nickname: nick.value, avatarId };
}

function makeCode(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from({ length: 5 }, () => alphabet[randomInt(alphabet.length)] ?? "A").join("");
}

async function currentRound(game: GameRow): Promise<RoundRow | undefined> {
  if (game.current_round <= 0) return undefined;
  const result = await serviceClient().from("rounds").select("*").eq("game_id", game.id).eq("idx", game.current_round).maybeSingle();
  dbError(result.error);
  return result.data ? roundFrom(result.data as Record<string, unknown>) : undefined;
}

async function answersFor(roundIds: string[]): Promise<AnswerRow[]> {
  if (roundIds.length === 0) return [];
  const result = await serviceClient().from("answers").select("*").in("round_id", roundIds);
  dbError(result.error);
  return ((result.data ?? []) as Record<string, unknown>[]).map(answerFrom);
}

async function saveGame(game: GameRow, patch: Record<string, unknown>): Promise<void> {
  const result = await serviceClient()
    .from("games")
    .update({ ...patch, state_version: game.state_version + 1 })
    .eq("id", game.id)
    .eq("state_version", game.state_version);
  dbError(result.error);
}

async function closeScores(game: GameRow, round: RoundRow, players: PlayerRow[]): Promise<void> {
  const claimed = await serviceClient().from("rounds").update({ status: "closed" }).eq("id", round.id).eq("status", "active").select("id");
  dbError(claimed.error);
  if (!claimed.data?.length) return;
  const answers = await answersFor([round.id]);
  const limit = game.seconds == null ? 0 : game.seconds * 1000;
  for (const player of active(players)) {
    const answer = answers.find((item) => item.player_id === player.id);
    const saved = await serviceClient()
      .from("players")
      .update({
        total_score: player.total_score + (answer?.points ?? 0),
        accuracy_sum: player.accuracy_sum + (answer?.accuracy ?? 0),
        response_sum: player.response_sum + (answer?.response_ms ?? limit),
      })
      .eq("id", player.id);
    dbError(saved.error);
  }
}

async function finishRoundWhenEveryoneAnswered(gameId: string, round: RoundRow): Promise<void> {
  const game = await gameById(gameId);
  if (game.status !== "round_active") return;
  const players = await playersOf(gameId);
  const playing = active(players);
  if (playing.length === 0) return;
  const answers = await answersFor([round.id]);
  if (!playing.every((player) => answers.some((item) => item.player_id === player.id))) return;
  await closeScores(game, round, players);
  const now = Date.now();
  await saveGame(await gameById(gameId), {
    status: "round_results",
    phase_ends_at: game.type === "solo" ? null : now + RESULTS_MS,
  });
}

async function applyStep(game: GameRow, players: PlayerRow[], now: number, action: "tick" | "advance"): Promise<void> {
  const step = stepClock(
    {
      status: game.status,
      currentRound: game.current_round,
      roundsCount: game.rounds_count,
      secondsPerRound: game.seconds,
      phaseEndsAt: game.phase_ends_at,
      activePlayers: active(players).length,
      solo: game.type === "solo",
    },
    now,
    action,
  );
  if (!step.changed) return;
  if (step.status === "abandoned") {
    await saveGame(game, { status: "abandoned", phase_ends_at: null });
    return;
  }
  if (game.status === "countdown" && step.status === "round_active") {
    const round = await currentRound(game);
    if (!round) throw new GameError(500, "INTERNAL_ERROR", "Brak rundy.");
    const opened = await serviceClient()
      .from("rounds")
      .update({ status: "active", starts_at: now, deadline_at: step.phaseEndsAt })
      .eq("id", round.id);
    dbError(opened.error);
  }
  if (game.status === "round_active" && step.status === "round_results") {
    const round = await currentRound(game);
    if (round) await closeScores(game, round, players);
  }
  if (step.status === "finished") {
    await saveGame(game, { status: "finished", phase_ends_at: null, summary: await buildSummary(game.id) });
    return;
  }
  await saveGame(game, { status: step.status, current_round: step.currentRound, phase_ends_at: step.phaseEndsAt });
}

async function buildSummary(gameId: string) {
  const roundsResult = await serviceClient().from("rounds").select("*").eq("game_id", gameId).order("idx");
  dbError(roundsResult.error);
  const rounds = ((roundsResult.data ?? []) as Record<string, unknown>[]).map(roundFrom);
  const answers = await answersFor(rounds.map((round) => round.id));
  const players = await playersOf(gameId);
  return {
    players: players.map((player) => {
      const mine = answers.filter((answer) => answer.player_id === player.id);
      const numeric = mine.flatMap((answer) => {
        const round = rounds.find((item) => item.id === answer.round_id);
        if (!round || (round.mode !== "weight" && round.mode !== "price")) return [];
        const truth = json<Truth>(round.truth);
        const given = json<{ kg?: number; plnPerKg?: number }>(answer.answer);
        const reference = round.mode === "weight" ? truth.weightKg : truth.pricePlnPerKg;
        const value = round.mode === "weight" ? given.kg : given.plnPerKg;
        if (!reference || value == null) return [];
        return [(Math.abs(value - reference) / reference) * 100];
      });
      let streak = 0;
      let bestStreak = 0;
      for (const round of rounds.filter((item) => item.mode === "species")) {
        const answer = mine.find((item) => item.round_id === round.id);
        if (answer && answer.accuracy === 1) {
          streak += 1;
          bestStreak = Math.max(bestStreak, streak);
        } else streak = 0;
      }
      const scored = mine.filter((answer) => answer.accuracy > 0);
      return {
        playerId: player.id,
        bestRound: mine.length ? Math.max(...mine.map((answer) => answer.points)) : null,
        meanAbsPercentError: numeric.length ? numeric.reduce((sum, value) => sum + value, 0) / numeric.length : null,
        speciesStreak: rounds.some((round) => round.mode === "species") ? bestStreak : null,
        fastestMs: scored.length ? Math.min(...scored.map((answer) => answer.response_ms)) : null,
      };
    }),
  };
}

async function insertRound(gameId: string, idx: number, round: { mode: QuestionMode; fishId: string; optionFishIds: string[] }) {
  const fish = fishById(round.fishId);
  if (!fish) throw new GameError(500, "INTERNAL_ERROR", "Brak ryby.");
  const photoToken = randomUUID();
  const credit = `${fish.author} · ${fish.license}`;
  const options = round.optionFishIds.map((fishId) => {
    const optionFish = fishById(fishId);
    if (!optionFish) throw new GameError(500, "INTERNAL_ERROR", "Brak ryby.");
    return { id: randomUUID(), fishId, namePl: optionFish.namePl };
  });
  const correct = options.find((option) => option.fishId === fish.id);
  const saved = await serviceClient().from("rounds").insert({
    id: randomUUID(),
    game_id: gameId,
    idx,
    mode: round.mode,
    status: "pending",
    photo_token: photoToken,
    question: {
      photoToken,
      credit,
      photoAlt: "Fotografia ryby do rozpoznania",
      options: options.map(({ id, namePl }) => ({ id, namePl })),
      hint: round.mode === "weight" ? fish.weightHint : null,
      productForm: fish.productForm,
      market: fish.market,
      observedOn: fish.observedOn,
      minKg: 0.05,
      maxKg: 100,
      minPln: 5,
      maxPln: 200,
    },
    truth: {
      fishId: fish.id,
      namePl: fish.namePl,
      funFact: fish.funFact,
      credit,
      correctOptionId: correct?.id,
      weightKg: fish.weightKg,
      weightNote: fish.weightNote,
      pricePlnPerKg: fish.pricePln,
    } satisfies Truth,
  });
  dbError(saved.error);
}

async function insertPlayer(gameId: string, userId: string, who: { nickname: string; avatarId: string }, now: number) {
  const saved = await serviceClient().from("players").insert({
    id: randomUUID(),
    game_id: gameId,
    user_id: userId,
    nickname: who.nickname,
    avatar_id: who.avatarId,
    status: "active",
    total_score: 0,
    accuracy_sum: 0,
    response_sum: 0,
    joined_at: now,
    last_seen: now,
  });
  dbError(saved.error);
}

export async function createRoom(userId: string, nickname: string, avatarId: string, settings?: Partial<Settings>) {
  const who = identity(nickname, avatarId);
  const chosen = parseSettings(settings ?? {});
  const gameId = randomUUID();
  const now = Date.now();
  let code = makeCode();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const taken = await serviceClient().from("games").select("id").eq("code", code).maybeSingle();
    dbError(taken.error);
    if (!taken.data) break;
    code = makeCode();
  }
  const saved = await serviceClient().from("games").insert({
    id: gameId,
    type: "multiplayer",
    status: "lobby",
    code,
    pool: chosen.pool,
    mode: chosen.mode,
    rounds_count: chosen.rounds,
    seconds: chosen.seconds,
    difficulty: chosen.difficulty,
    current_round: 0,
    phase_ends_at: null,
    host_user_id: userId,
    state_version: 1,
    summary: null,
    created_at: now,
  });
  dbError(saved.error);
  await insertPlayer(gameId, userId, who, now);
  return snapshot(gameId, userId);
}

export async function joinRoom(userId: string, code: string, nickname: string, avatarId: string) {
  const who = identity(nickname, avatarId);
  const game = await gameByCode(code);
  if (game.status !== "lobby") throw new GameError(409, "GAME_ALREADY_STARTED", "Gra już trwa.");
  const players = await playersOf(game.id);
  const existing = players.find((player) => player.user_id === userId);
  if (existing?.status === "active") return snapshot(game.id, userId);
  if (active(players).length >= 12) throw new GameError(409, "ROOM_FULL", "Pokój jest pełny (12/12).");
  const nickTaken = active(players).some(
    (player) => player.user_id !== userId && player.nickname.toLowerCase() === who.nickname.toLowerCase(),
  );
  if (nickTaken) throw new GameError(409, "NICKNAME_TAKEN", "Ten nick jest zajęty.");
  const now = Date.now();
  if (existing) {
    const saved = await serviceClient()
      .from("players")
      .update({ nickname: who.nickname, avatar_id: who.avatarId, status: "active", last_seen: now })
      .eq("id", existing.id);
    dbError(saved.error);
  } else {
    await insertPlayer(game.id, userId, who, now);
  }
  await saveGame(game, {});
  return snapshot(game.id, userId);
}

export async function updateSettings(userId: string, code: string, settings: Partial<Settings>) {
  const game = await gameByCode(code);
  if (game.host_user_id !== userId) throw new GameError(403, "NOT_HOST", "Tylko host zmienia ustawienia.");
  if (game.status !== "lobby") throw new GameError(409, "INVALID_PHASE", "Ustawienia można zmienić tylko w lobby.");
  const chosen = parseSettings(settings);
  await saveGame(game, {
    pool: chosen.pool,
    mode: chosen.mode,
    rounds_count: chosen.rounds,
    seconds: chosen.seconds,
    difficulty: chosen.difficulty,
  });
  return snapshot(game.id, userId);
}

export async function startGame(userId: string, code: string) {
  const game = await gameByCode(code);
  if (game.host_user_id !== userId) throw new GameError(403, "NOT_HOST", "Tylko host startuje grę.");
  if (game.status !== "lobby") throw new GameError(409, "INVALID_PHASE", "Gra już wystartowała.");
  const players = await playersOf(game.id);
  if (active(players).length < 2) throw new GameError(409, "NOT_ENOUGH_PLAYERS", "Potrzeba co najmniej 2 graczy.");
  const plan = buildRoundPlan({
    gameId: game.id,
    pool: game.pool,
    mode: game.mode,
    rounds: game.rounds_count,
    difficulty: game.difficulty,
    catalog: fishes(),
  });
  if (!plan.ok) throw new GameError(409, "POOL_TOO_SMALL", plan.message);
  for (let index = 0; index < plan.rounds.length; index += 1) {
    const round = plan.rounds[index];
    if (round) await insertRound(game.id, index + 1, round);
  }
  await saveGame(game, { status: "countdown", current_round: 1, phase_ends_at: Date.now() + 3000 });
  return snapshot(game.id, userId);
}

export async function createSolo(userId: string, nickname: string, avatarId: string, settings: Partial<Settings>, untimed: boolean) {
  const who = identity(nickname, avatarId);
  const chosen = parseSettings(settings, untimed);
  const gameId = randomUUID();
  const plan = buildRoundPlan({
    gameId,
    pool: chosen.pool,
    mode: chosen.mode,
    rounds: chosen.rounds,
    difficulty: chosen.difficulty,
    catalog: fishes(),
  });
  if (!plan.ok) throw new GameError(409, "POOL_TOO_SMALL", plan.message);
  const now = Date.now();
  const saved = await serviceClient().from("games").insert({
    id: gameId,
    type: "solo",
    status: "lobby",
    code: null,
    pool: chosen.pool,
    mode: chosen.mode,
    rounds_count: chosen.rounds,
    seconds: chosen.seconds,
    difficulty: chosen.difficulty,
    current_round: 0,
    phase_ends_at: null,
    host_user_id: userId,
    state_version: 1,
    summary: null,
    created_at: now,
  });
  dbError(saved.error);
  await insertPlayer(gameId, userId, who, now);
  for (let index = 0; index < plan.rounds.length; index += 1) {
    const round = plan.rounds[index];
    if (round) await insertRound(gameId, index + 1, round);
  }
  const created = await gameById(gameId);
  await saveGame(created, { status: "countdown", current_round: 1, phase_ends_at: now + 3000 });
  return snapshot(gameId, userId);
}

function scoreAnswer(mode: QuestionMode, body: Record<string, unknown>, truth: Truth, options: Array<{ id: string }>) {
  if (mode === "species") {
    const optionId = body.optionId;
    if (typeof optionId !== "string" || !options.some((option) => option.id === optionId)) {
      throw new GameError(422, "INVALID_ANSWER", "Wybierz jedną z odpowiedzi.");
    }
    return { accuracy: optionId === truth.correctOptionId ? 1 : 0, stored: { optionId } };
  }
  if (mode === "weight") {
    const kg = typeof body.kg === "number" ? body.kg : Number.NaN;
    if (!(kg >= WEIGHT_KG_MIN && kg <= WEIGHT_KG_MAX))
      throw new GameError(422, "INVALID_ANSWER", `Waga musi być od ${WEIGHT_KG_MIN} do ${WEIGHT_KG_MAX} kg.`);
    return { accuracy: numericAccuracy(kg, truth.weightKg ?? 0), stored: { kg } };
  }
  const plnPerKg = typeof body.plnPerKg === "number" ? body.plnPerKg : Number.NaN;
  if (!(plnPerKg >= 5 && plnPerKg <= 200)) throw new GameError(422, "INVALID_ANSWER", "Cena musi być od 5 do 200 zł.");
  return { accuracy: numericAccuracy(plnPerKg, truth.pricePlnPerKg ?? 0), stored: { plnPerKg } };
}

export async function answer(userId: string, gameId: string, idx: number, requestId: string, body: Record<string, unknown>) {
  if (!/^[0-9a-f-]{36}$/i.test(requestId)) throw new GameError(400, "VALIDATION_ERROR", "Brak identyfikatora odpowiedzi.");
  const game = await gameById(gameId);
  const players = await playersOf(game.id);
  const player = selfPlayer(players, userId);
  const roundResult = await serviceClient().from("rounds").select("*").eq("game_id", game.id).eq("idx", idx).maybeSingle();
  dbError(roundResult.error);
  if (!roundResult.data) throw new GameError(409, "INVALID_PHASE", "Ta runda nie przyjmuje odpowiedzi.");
  const round = roundFrom(roundResult.data as Record<string, unknown>);
  if (round.status !== "active") throw new GameError(409, "INVALID_PHASE", "Ta runda nie przyjmuje odpowiedzi.");
  if (round.deadline_at != null && Date.now() > round.deadline_at) throw new GameError(409, "DEADLINE_PASSED", "Czas minął.");
  const existing = await answersFor([round.id]);
  if (existing.some((item) => item.player_id === player.id && item.request_id === requestId)) return snapshot(game.id, userId);
  if (existing.some((item) => item.player_id === player.id)) {
    throw new GameError(409, "ANSWER_ALREADY_SUBMITTED", "Odpowiedź jest już zapisana.");
  }
  const truth = json<Truth>(round.truth);
  const question = json<{ options?: Array<{ id: string }>; minKg?: number; maxKg?: number; minPln?: number; maxPln?: number }>(round.question);
  const scored = scoreAnswer(round.mode, body, truth, question.options ?? []);
  const limit = game.seconds == null ? null : game.seconds * 1000;
  const responseMs = Math.max(0, Date.now() - (round.starts_at ?? Date.now()));
  const clamped = limit == null ? responseMs : Math.min(responseMs, limit);
  const saved = await serviceClient().from("answers").insert({
    id: randomUUID(),
    round_id: round.id,
    player_id: player.id,
    request_id: requestId,
    answer: scored.stored,
    accuracy: scored.accuracy,
    points: roundPoints(scored.accuracy, clamped, limit),
    response_ms: clamped,
    submitted_at: Date.now(),
  });
  dbError(saved.error);
  await saveGame(game, {});
  await finishRoundWhenEveryoneAnswered(game.id, round);
  return snapshot(game.id, userId);
}

export async function leave(userId: string, code: string) {
  const game = await gameByCode(code);
  const players = await playersOf(game.id);
  const player = selfPlayer(players, userId);
  const saved = await serviceClient().from("players").update({ status: "left", last_seen: Date.now() }).eq("id", player.id);
  dbError(saved.error);
  const rest = active(players).filter((item) => item.id !== player.id);
  if (rest.length === 0) {
    await saveGame(game, { status: "abandoned" });
    return;
  }
  if (game.host_user_id === userId && rest[0]) await saveGame(game, { host_user_id: rest[0].user_id });
  else await saveGame(game, {});
}

export async function kick(userId: string, code: string, playerId: string) {
  const game = await gameByCode(code);
  if (game.host_user_id !== userId) throw new GameError(403, "NOT_HOST", "Tylko host wyrzuca graczy.");
  const players = await playersOf(game.id);
  const target = players.find((player) => player.id === playerId);
  if (!target || target.user_id === userId) throw new GameError(400, "VALIDATION_ERROR", "Nie można wyrzucić tej osoby.");
  const saved = await serviceClient().from("players").update({ status: "kicked" }).eq("id", target.id);
  dbError(saved.error);
  await saveGame(game, {});
  return snapshot(game.id, userId);
}

async function migrateHost(game: GameRow, players: PlayerRow[]): Promise<void> {
  if (game.status !== "lobby") return;
  const host = players.find((player) => player.user_id === game.host_user_id);
  const stale = !host || host.status !== "active" || Date.now() - host.last_seen > 90_000;
  if (!stale) return;
  const next = active(players)[0];
  if (!next) return;
  await saveGame(game, { host_user_id: next.user_id });
}

export async function stateFor(userId: string, gameId: string) {
  let game = await gameById(gameId);
  let players = await playersOf(game.id);
  selfPlayer(players, userId);
  const touched = await serviceClient().from("players").update({ last_seen: Date.now() }).eq("game_id", game.id).eq("user_id", userId);
  dbError(touched.error);
  await migrateHost(game, players);
  game = await gameById(gameId);
  players = await playersOf(game.id);
  await applyStep(game, players, Date.now(), "tick");
  return snapshot(game.id, userId);
}

export async function stateForCode(userId: string, code: string) {
  return stateFor(userId, (await gameByCode(code)).id);
}

export async function preview(code: string) {
  const game = await gameByCode(code);
  const players = await playersOf(game.id);
  const currentPlayers = active(players);
  return {
    code: game.code,
    status: game.status,
    hostNickname: currentPlayers.find((player) => player.user_id === game.host_user_id)?.nickname ?? "",
    playerCount: currentPlayers.length,
    maxPlayers: 12,
    settings: {
      pool: game.pool,
      mode: game.mode,
      rounds: game.rounds_count,
      seconds: game.seconds,
      difficulty: game.difficulty,
    },
  };
}

export async function advance(userId: string, gameId: string) {
  const game = await gameById(gameId);
  if (game.type === "multiplayer" && game.host_user_id !== userId) {
    throw new GameError(403, "NOT_HOST", "Tylko host może iść dalej.");
  }
  selfPlayer(await playersOf(game.id), userId);
  await applyStep(game, await playersOf(game.id), Date.now(), "advance");
  return snapshot(game.id, userId);
}

export async function advanceCode(userId: string, code: string) {
  return advance(userId, (await gameByCode(code)).id);
}

export async function answerCode(userId: string, code: string, idx: number, requestId: string, body: Record<string, unknown>) {
  return answer(userId, (await gameByCode(code)).id, idx, requestId, body);
}

export async function photoFileForToken(userId: string, token: string): Promise<string | undefined> {
  const result = await serviceClient().from("rounds").select("*").eq("photo_token", token).maybeSingle();
  dbError(result.error);
  if (!result.data) return undefined;
  const round = roundFrom(result.data as Record<string, unknown>);
  selfPlayer(await playersOf(round.game_id), userId);
  const truth = json<Truth>(round.truth);
  return fishById(truth.fishId)?.photoFile ?? fishes().find((fish) => fish.namePl === truth.namePl)?.photoFile;
}

async function snapshot(gameId: string, userId: string) {
  const game = await gameById(gameId);
  const players = await playersOf(gameId);
  const me = selfPlayer(players, userId);
  const round = await currentRound(game);
  const truth = round ? json<Truth>(round.truth) : undefined;
  const question = round ? json<Record<string, unknown>>(round.question) : undefined;
  const reveal = game.status === "round_results" || game.status === "ranking" || game.status === "finished";
  const answers = round ? await answersFor([round.id]) : [];
  const mine = answers.find((item) => item.player_id === me.id);
  const ranked = rankPlayers(
    active(players).map((player) => ({
      id: player.id,
      score: player.total_score,
      accuracySum: player.accuracy_sum,
      responseMs: player.response_sum,
    })),
  );
  return {
    phase: game.status,
    stateVersion: game.state_version,
    serverNow: new Date().toISOString(),
    poolCounts: poolCounts(),
    you: { id: me.id, nickname: me.nickname, avatarId: me.avatar_id, isHost: game.host_user_id === userId },
    game: {
      id: game.id,
      code: game.code,
      type: game.type,
      pool: game.pool,
      mode: game.mode,
      rounds: game.rounds_count,
      seconds: game.seconds,
      difficulty: game.difficulty,
      currentRound: game.current_round,
      phaseEndsAt: game.phase_ends_at ? new Date(game.phase_ends_at).toISOString() : null,
    },
    players: active(players).map((player) => ({
      id: player.id,
      nickname: player.nickname,
      avatarId: player.avatar_id,
      isHost: player.user_id === game.host_user_id,
      online: Date.now() - player.last_seen < 15_000,
      score: player.total_score,
      rank: ranked.find((row) => row.id === player.id)?.rank ?? null,
    })),
    round:
      round && game.status !== "lobby"
        ? {
            idx: round.idx,
            mode: round.mode,
            startsAt: round.starts_at ? new Date(round.starts_at).toISOString() : null,
            deadlineAt: round.deadline_at ? new Date(round.deadline_at).toISOString() : null,
            question:
              game.status === "countdown"
                ? undefined
                : {
                    photoToken: question?.photoToken,
                    credit: question?.credit,
                    photoAlt: reveal ? truth?.namePl : question?.photoAlt,
                    options: question?.options,
                    hint: game.difficulty === "easy" ? question?.hint : null,
                    fishName: round.mode === "price" ? truth?.namePl : undefined,
                    productForm: question?.productForm,
                    market: question?.market,
                    minKg: 0.05,
                    maxKg: 100,
                    minPln: 5,
                    maxPln: 200,
                  },
            myAnswer: mine ? json<Record<string, unknown>>(mine.answer) : null,
            answerCount: answers.length,
            playerCount: active(players).length,
          }
        : undefined,
    results:
      reveal && truth && round
        ? {
            mode: round.mode,
            truth: {
              namePl: truth.namePl,
              funFact: truth.funFact,
              credit: truth.credit,
              correctOptionId: truth.correctOptionId ?? null,
              weightKg: truth.weightKg ?? null,
              weightNote: truth.weightNote ?? null,
              pricePlnPerKg: truth.pricePlnPerKg ?? null,
            },
            answers: answers.map((item) => ({
              playerId: item.player_id,
              nickname: players.find((player) => player.id === item.player_id)?.nickname ?? "",
              answer: json<Record<string, unknown>>(item.answer),
              points: item.points,
              accuracy: item.accuracy,
              responseMs: item.response_ms,
            })),
          }
        : undefined,
    summary: game.summary ?? undefined,
  };
}

export async function cleanup(now = Date.now()): Promise<void> {
  const result = await serviceClient()
    .from("games")
    .update({ status: "abandoned" })
    .lt("created_at", now - 6 * 60 * 60 * 1000)
    .not("status", "in", "(finished,abandoned)");
  dbError(result.error);
}
