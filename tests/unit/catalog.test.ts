import { describe, expect, test } from "vitest";
import catalog from "@/content/fish-catalog.json";
import { fishes, fishInPool, inPool, type Fish } from "@/server/fish";

const FISH = fishes();

const REQUIRED: (keyof Fish)[] = [
  "id",
  "namePl",
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
  test("ma 205 gatunków z kompletem pól", () => {
    expect(catalog.length).toBe(205);
    expect(FISH.length).toBe(205);
    const ids = new Set<string>();
    const names = new Set<string>();
    for (const fish of FISH) {
      for (const key of REQUIRED) {
        expect(fish[key], `${fish.id}.${key}`).toBeTruthy();
      }
      expect(ids.has(fish.id)).toBe(false);
      ids.add(fish.id);
      const key = fish.namePl.toLowerCase();
      expect(names.has(key), `zduplikowana nazwa: ${fish.namePl}`).toBe(false);
      names.add(key);
      expect(fish.weightKg).toBeGreaterThan(0);
      expect(fish.pricePln).toBeGreaterThan(0);
      expect(fish.funFact.split(/\s+/).length, `${fish.id}.funFact`).toBeGreaterThanOrEqual(8);
      if (fish.pools.includes("PL")) {
        expect(fish.weightNote).toMatch(/PL:/);
      }
    }
  });

  test("pule PL/EU są spójne", () => {
    expect(fishInPool("EU").length).toBe(205);
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

  test("katalog nie zawiera łaciny", () => {
    for (const fish of catalog as Array<Record<string, unknown>>) {
      expect(fish).not.toHaveProperty("nameLatin");
    }
  });
});