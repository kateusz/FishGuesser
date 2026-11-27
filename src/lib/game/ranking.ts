export type RankInput = {
  id: string;
  score: number;
  accuracySum: number;
  responseMs: number;
};

export function rankPlayers(rows: RankInput[]): Array<RankInput & { rank: number }> {
  const sorted = [...rows].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.accuracySum !== a.accuracySum) return b.accuracySum - a.accuracySum;
    if (a.responseMs !== b.responseMs) return a.responseMs - b.responseMs;
    return a.id < b.id ? -1 : 1;
  });

  let previousKey = "";
  let previousRank = 0;
  return sorted.map((row, index) => {
    const key = `${row.score}|${row.accuracySum}|${row.responseMs}`;
    const rank = key === previousKey ? previousRank : index + 1;
    previousKey = key;
    previousRank = rank;
    return { ...row, rank };
  });
}
