import { describe, expect, test } from "vitest";
import { buildRoundPlan, questionModes } from "@/lib/game/plan";
import { fishes, fishInPool, inPool, type Fish } from "@/server/fish";

const FISH = fishes();

function fake(id: string, family: string): Fish {
  const base = FISH[0];
  if (!base) throw new Error("brak katalogu");
  return { ...base, id, family, namePl: id, pools: ["PL", "EU"] };
}

describe("pule", () => {
  test("katalog rozdziela pule", () => {
    expect(fishInPool("PL").some((fish) => fish.id === "bream")).toBe(false);
    expect(fishInPool("EU_MINUS_PL").some((fish) => fish.id === "bream")).toBe(true);
    expect(fishInPool("EU").length).toBeGreaterThan(0);
    expect(fishInPool("PL").length).toBeGreaterThan(0);
  });

  test("tagi ryby decydują o puli", () => {
    const pike = FISH.find((fish) => fish.id === "pike");
    const bream = FISH.find((fish) => fish.id === "bream");
    if (!pike || !bream) throw new Error("brak ryb");
    expect(inPool(pike, "PL")).toBe(true);
    expect(inPool(pike, "EU_MINUS_PL")).toBe(false);
    expect(inPool(bream, "PL")).toBe(false);
    expect(inPool(bream, "EU")).toBe(true);
  });
});

describe("plan rund", () => {
  test("miks obraca tylko gatunek, wagę i cenę i nie powtarza trybu z rzędu", () => {
    const modes = questionModes("gra-1", 6, "mix");
    expect(modes.every((mode) => mode === "species" || mode === "weight" || mode === "price")).toBe(true);
    expect(modes).not.toContain("map");
    for (let index = 1; index < modes.length; index += 1) {
      expect(modes[index]).not.toBe(modes[index - 1]);
    }
    expect(questionModes("gra-1", 6, "mix")).toEqual(modes);
  });

  test("stały tryb nie losuje innych", () => {
    expect(questionModes("gra-1", 4, "weight")).toEqual(["weight", "weight", "weight", "weight"]);
  });

  test("za mało ryb blokuje start", () => {
    const plan = buildRoundPlan({
      gameId: "gra",
      pool: "EU",
      mode: "weight",
      rounds: 5,
      difficulty: "medium",
      catalog: FISH.filter((fish) => fish.id === "pike"),
    });
    expect(plan.ok).toBe(false);
    if (!plan.ok) expect(plan.message).toContain("Za mała pula");
  });

  test("gatunek wymaga czterech ryb w puli", () => {
    const onlyBream = FISH.filter((fish) => fish.id === "bream");
    const plan = buildRoundPlan({
      gameId: "gra",
      pool: "EU_MINUS_PL",
      mode: "species",
      rounds: 1,
      difficulty: "medium",
      catalog: onlyBream,
    });
    expect(plan.ok).toBe(false);
    if (!plan.ok) expect(plan.message).toContain("Gatunek");
  });

  test("pięć rund miksu na puli EU ma unikalne ryby i cztery opcje gatunku", () => {
    const plan = buildRoundPlan({
      gameId: "stalowy-seed",
      pool: "EU",
      mode: "mix",
      rounds: 5,
      difficulty: "medium",
      catalog: FISH,
    });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(new Set(plan.rounds.map((round) => round.fishId)).size).toBe(5);
    for (const round of plan.rounds) {
      if (round.mode === "species") {
        expect(round.optionFishIds).toHaveLength(4);
        expect(round.optionFishIds).toContain(round.fishId);
      } else {
        expect(round.optionFishIds).toEqual([]);
      }
    }
    const again = buildRoundPlan({
      gameId: "stalowy-seed",
      pool: "EU",
      mode: "mix",
      rounds: 5,
      difficulty: "medium",
      catalog: FISH,
    });
    expect(again).toEqual(plan);
  });

  test("trudny gatunek woli tę samą rodzinę", () => {
    const catalog = [
      fake("cel", "Karpiowate"),
      fake("a", "Karpiowate"),
      fake("b", "Karpiowate"),
      fake("c", "Karpiowate"),
      fake("obcy", "Dorszowate"),
    ];
    const plan = buildRoundPlan({
      gameId: "rodzina",
      pool: "PL",
      mode: "species",
      rounds: 1,
      difficulty: "hard",
      catalog,
    });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    const round = plan.rounds[0];
    if (!round) throw new Error("brak rundy");
    const distractors = round.optionFishIds.filter((id) => id !== round.fishId);
    expect(distractors.every((id) => id !== "obcy")).toBe(true);
  });
});
