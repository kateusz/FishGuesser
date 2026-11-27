export function numericAccuracy(answer: number, reference: number): number {
  if (!(answer > 0) || !(reference > 0)) return 0;
  const accuracy = 1 - Math.abs(Math.log(answer / reference)) / Math.log(4);
  return Math.max(0, accuracy);
}

export function roundPoints(accuracy: number, responseMs: number, limitMs: number | null): number {
  const remaining = limitMs == null ? 0 : Math.max(0, limitMs - responseMs);
  const bonus = limitMs == null || limitMs <= 0 ? 0 : 200 * accuracy * (remaining / limitMs);
  return Math.min(1000, Math.max(0, Math.round(800 * accuracy + bonus)));
}

export const WEIGHT_KG_MIN = 0.001;
export const WEIGHT_KG_MAX = 100;

export function weightKgFromSlider(value: number, min = WEIGHT_KG_MIN, max = WEIGHT_KG_MAX): number {
  const slider = Math.min(1000, Math.max(0, value));
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  if (!(lo > 0) || hi === lo) return lo;
  return lo * (hi / lo) ** (slider / 1000);
}

export function sliderFromWeightKg(kg: number, min = WEIGHT_KG_MIN, max = WEIGHT_KG_MAX): number {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const clamped = Math.min(hi, Math.max(lo, kg));
  if (!(lo > 0) || hi === lo) return 0;
  return (Math.log(clamped / lo) / Math.log(hi / lo)) * 1000;
}
