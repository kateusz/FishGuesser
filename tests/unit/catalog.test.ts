import { describe, expect, test } from "vitest";
import catalog from "@/content/fish-catalog.json";
import { fishes, fishInPool, inPool, type Fish } from "@/server/fish";

const FISH = fishes();

const REQUIRED: (keyof Fish)[] = [
  "id",
  "namePl",
  "nameLatin",
  "pools",
  "family",
  "weightKg",
  "weightNote",
  "weightHint",
  "pricePln",
  "productForm",
  "market",
  "observedOn",
  "funFact",
  "author",
  "license",
  "photoFile",
];

describe("katalog ryb", () => {
  test("ma 200 gatunków z kompletem pól", () => {
    expect(catalog.length).toBe(200);
    expect(FISH.length).toBe(200);
    const ids = new Set<string>();
    const latin = new Set<string>();
    for (const fish of FISH) {
      for (const key of REQUIRED) {
        expect(fish[key], `${fish.id}.${key}`).toBeTruthy();
      }
      expect(ids.has(fish.id)).toBe(false);
      ids.add(fish.id);
      const key = fish.nameLatin.toLowerCase();
      expect(latin.has(key)).toBe(false);
      latin.add(key);
      expect(fish.weightKg).toBeGreaterThan(0);
      expect(fish.pricePln).toBeGreaterThan(0);
      if (fish.pools.includes("PL")) {
        expect(fish.weightNote).toMatch(/PL:/);
      }
    }
  });

  test("pule PL/EU są spójne", () => {
    expect(fishInPool("EU").length).toBe(200);
    expect(fishInPool("PL").length).toBeGreaterThanOrEqual(50);
    expect(fishInPool("EU_MINUS_PL").length).toBeGreaterThanOrEqual(20);
    const bream = FISH.find((fish) => fish.id === "bream");
    if (!bream) throw new Error("brak dorady");
    expect(inPool(bream, "PL")).toBe(false);
    expect(inPool(bream, "EU_MINUS_PL")).toBe(true);
  });

  test("waga i cena mieszczą się w zakresie gry", () => {
    for (const fish of FISH) {
      expect(fish.weightKg, `${fish.id}.weightKg`).toBeGreaterThanOrEqual(0.001);
      expect(fish.weightKg, `${fish.id}.weightKg`).toBeLessThanOrEqual(100);
      expect(fish.pricePln, `${fish.id}.pricePln`).toBeGreaterThanOrEqual(5);
      expect(fish.pricePln, `${fish.id}.pricePln`).toBeLessThanOrEqual(200);
    }
  });
});