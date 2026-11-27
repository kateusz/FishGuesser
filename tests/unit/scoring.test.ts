import { describe, expect, test } from "vitest";
import { numericAccuracy, roundPoints, sliderFromWeightKg, weightKgFromSlider } from "@/server/scoring";

describe("punktacja liczbowa", () => {
  test("dokładna waga i czterokrotne odchylenie", () => {
    expect(numericAccuracy(2, 2)).toBeCloseTo(1, 4);
    expect(numericAccuracy(4, 2)).toBeCloseTo(0.5, 4);
    expect(numericAccuracy(8, 2)).toBeCloseTo(0, 4);
    expect(numericAccuracy(0.5, 2)).toBeCloseTo(0, 4);
  });

  test("cena jest symetryczna na skali logarytmicznej", () => {
    expect(numericAccuracy(100, 50)).toBeCloseTo(0.5, 4);
    expect(numericAccuracy(25, 50)).toBeCloseTo(0.5, 4);
    expect(numericAccuracy(12.5, 50)).toBeCloseTo(0, 4);
  });

  test("niedodatnie wartości dają zero", () => {
    expect(numericAccuracy(0, 2)).toBe(0);
    expect(numericAccuracy(2, 0)).toBe(0);
    expect(numericAccuracy(-1, 2)).toBe(0);
  });

  test("połowa trafności i połowa czasu daje 450 punktów", () => {
    expect(roundPoints(0.5, 15_000, 30_000)).toBe(450);
  });

  test("bez limitu czasu nie ma bonusu", () => {
    expect(roundPoints(1, 10_000, null)).toBe(800);
  });

  test("pudło nie dostaje punktów nawet przy szybkiej odpowiedzi", () => {
    expect(roundPoints(0, 0, 30_000)).toBe(0);
  });

  test("punkty mieszczą się w 0..1000", () => {
    expect(roundPoints(1, 0, 30_000)).toBe(1000);
    expect(roundPoints(2, 0, 30_000)).toBe(1000);
  });
});

describe("suwak wagi", () => {
  test("końce skali to 0,05 kg i 100 kg", () => {
    expect(weightKgFromSlider(0)).toBeCloseTo(0.05, 5);
    expect(weightKgFromSlider(1000)).toBeCloseTo(100, 5);
  });

  test("środek skali wraca na suwak", () => {
    const kg = 0.05 * (100 / 0.05) ** 0.5;
    expect(sliderFromWeightKg(kg)).toBeCloseTo(500, 4);
  });
});
