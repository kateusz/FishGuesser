import { inPool, type Difficulty, type Fish, type GameMode, type Pool, type QuestionMode } from "@/server/fish";

export type PlannedRound = {
  mode: QuestionMode;
  fishId: string;
  optionFishIds: string[];
};

export type RoundPlan =
  | { ok: true; rounds: PlannedRound[] }
  | { ok: false; message: string };

const MODES: QuestionMode[] = ["species", "weight", "price"];

function hash(seed: string): number {
  let value = 2166136261;
  for (const char of seed) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return value >>> 0;
}

function randomOf(seed: string): () => number {
  let state = hash(seed) || 1;
  return () => {
    state = Math.imul(state ^ (state >>> 15), state | 1);
    state ^= state + Math.imul(state ^ (state >>> 7), 61 | state);
    return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: T[], seed: string): T[] {
  const copy = [...items];
  const random = randomOf(seed);
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    const current = copy[index];
    const other = copy[swap];
    if (current === undefined || other === undefined) continue;
    copy[index] = other;
    copy[swap] = current;
  }
  return copy;
}

export function questionModes(gameId: string, rounds: number, mode: GameMode): QuestionMode[] {
  if (mode !== "mix") return Array.from({ length: rounds }, () => mode);
  const start = hash(gameId) % MODES.length;
  return Array.from({ length: rounds }, (_, index) => MODES[(start + index) % MODES.length] ?? "species");
}

function distractors(answer: Fish, pool: Fish[], difficulty: Difficulty, seed: string): Fish[] {
  const others = pool.filter((fish) => fish.id !== answer.id);
  const same = others.filter((fish) => fish.family === answer.family);
  const different = others.filter((fish) => fish.family !== answer.family);
  const ordered =
    difficulty === "easy"
      ? [...shuffled(different, `${seed}:diff`), ...shuffled(same, `${seed}:same`)]
      : difficulty === "hard"
        ? [...shuffled(same, `${seed}:same`), ...shuffled(different, `${seed}:diff`)]
        : shuffled(others, seed);
  const picked: Fish[] = [];
  for (const fish of ordered) {
    if (picked.length === 3) break;
    if (!picked.some((item) => item.id === fish.id)) picked.push(fish);
  }
  return picked;
}

export function buildRoundPlan(input: {
  gameId: string;
  pool: Pool;
  mode: GameMode;
  rounds: number;
  difficulty: Difficulty;
  catalog: Fish[];
}): RoundPlan {
  const available = input.catalog.filter((fish) => inPool(fish, input.pool));
  const modes = questionModes(input.gameId, input.rounds, input.mode);
  if (available.length < input.rounds) {
    return {
      ok: false,
      message: `Za mała pula: dostępnych ryb ${available.length}, potrzebujesz ${input.rounds}. Zmień pulę lub liczbę rund.`,
    };
  }
  if (modes.includes("species") && available.length < 4) {
    return { ok: false, message: "Ta pula nie ma dość ryb do trybu Gatunek." };
  }

  const answers = shuffled(available, input.gameId).slice(0, input.rounds);
  const rounds: PlannedRound[] = answers.map((fish, index) => {
    const mode = modes[index] ?? "species";
    if (mode !== "species") return { mode, fishId: fish.id, optionFishIds: [] };
    const picked = distractors(fish, available, input.difficulty, `${input.gameId}:${index}`);
    const options = shuffled([fish, ...picked], `${input.gameId}:${index}:opt`).map((item) => item.id);
    return { mode, fishId: fish.id, optionFishIds: options };
  });
  return { ok: true, rounds };
}
