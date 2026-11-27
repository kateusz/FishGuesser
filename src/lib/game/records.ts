// ponytail: last 40 game ids. A reload of an older solo result can append the same score again.
export function topScores(
  storage: Pick<Storage, "getItem" | "setItem">,
  key: string,
  score: number,
  gameId: string,
): number[] {
  const seenRaw = storage.getItem("fg-recorded-games");
  const seen = seenRaw ? (JSON.parse(seenRaw) as unknown) : [];
  const ids = Array.isArray(seen) ? seen.filter((item): item is string => typeof item === "string") : [];
  const currentRaw = storage.getItem(key);
  const current = currentRaw ? (JSON.parse(currentRaw) as unknown) : [];
  const scores = Array.isArray(current) ? current.filter((item): item is number => typeof item === "number") : [];
  if (ids.includes(gameId)) return scores.slice(0, 5);
  scores.push(score);
  scores.sort((a, b) => b - a);
  const top = scores.slice(0, 5);
  storage.setItem(key, JSON.stringify(top));
  storage.setItem("fg-recorded-games", JSON.stringify([...ids, gameId].slice(-40)));
  return top;
}
