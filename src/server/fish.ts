import { readFileSync, statSync } from "node:fs";
import path from "node:path";

export type Pool = "PL" | "EU" | "EU_MINUS_PL";
export type GameMode = "species" | "weight" | "price" | "mix";
export type QuestionMode = "species" | "weight" | "price";
export type Difficulty = "easy" | "medium" | "hard" | "mix";
export type Phase =
  | "lobby"
  | "countdown"
  | "round_active"
  | "round_results"
  | "ranking"
  | "finished"
  | "abandoned";

export type Fish = {
  id: string;
  namePl: string;
  nameLatin: string;
  pools: Array<"PL" | "EU">;
  family: string;
  weightKg: number;
  weightNote: string;
  weightHint: string;
  pricePln: number;
  productForm: string;
  market: string;
  observedOn: string;
  funFact: string;
  author: string;
  license: string;
  photoFile: string;
};

const catalogPath = path.join(process.cwd(), "src", "content", "fish-catalog.json");

// ponytail: mtime+size cache. A same-size rewrite inside one timestamp tick stays stale until the next change. Upgrade: hash the bytes.
let cached: { mtimeMs: number; size: number; fish: Fish[] } | null = null;

export function fishes(): Fish[] {
  try {
    const stat = statSync(catalogPath);
    if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) return cached.fish;
    const parsed: unknown = JSON.parse(readFileSync(catalogPath, "utf8"));
    if (!Array.isArray(parsed) || parsed.length === 0) return cached?.fish ?? [];
    const fish = parsed as Fish[];
    cached = { mtimeMs: stat.mtimeMs, size: stat.size, fish };
    return fish;
  } catch {
    return cached?.fish ?? [];
  }
}

export function inPool(fish: Fish, pool: Pool): boolean {
  const pl = fish.pools.includes("PL");
  const eu = fish.pools.includes("EU");
  if (pool === "PL") return pl;
  if (pool === "EU") return eu;
  return eu && !pl;
}

export function fishInPool(pool: Pool): Fish[] {
  return fishes().filter((fish) => inPool(fish, pool));
}

export function poolCounts(): Record<Pool, number> {
  return {
    PL: fishInPool("PL").length,
    EU: fishInPool("EU").length,
    EU_MINUS_PL: fishInPool("EU_MINUS_PL").length,
  };
}

export function fishById(id: string): Fish | undefined {
  return fishes().find((fish) => fish.id === id);
}