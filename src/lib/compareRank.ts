import type { Album, Post } from "../types";

// Rate-by-comparison (Beli-style). The user first picks a sentiment, which
// fixes a score range; then a binary search over their past ratings in that
// range asks "which did you like more?" until the new album's position is
// known. The score is the midpoint between its neighbours. Existing ratings
// are never changed.

/** Ratings a user needs before comparison mode unlocks. */
export const COMPARISON_UNLOCK = 10;

export const SENTIMENTS = {
  loved: { label: "I loved it", min: 7.0, max: 10.0 },
  fine: { label: "It was fine", min: 4.0, max: 6.9 },
  disliked: { label: "I didn't like it", min: 0.0, max: 3.9 },
} as const;

export type Sentiment = keyof typeof SENTIMENTS;

/** Half-open range [lo, hi) of possible insertion indexes into the pool. */
export interface SearchRange {
  lo: number;
  hi: number;
}

const albumKey = (a: Pick<Album, "title" | "artist">) =>
  `${a.title.trim().toLowerCase()}\u0000${(a.artist ?? "").trim().toLowerCase()}`;

/**
 * Past ratings to compare against: one per album (the most recent), inside the
 * sentiment's range, excluding the album being rated, best first.
 */
export function comparisonPool(ratings: Post[], sentiment: Sentiment, newAlbum: Pick<Album, "title" | "artist">): Post[] {
  const { min, max } = SENTIMENTS[sentiment];
  const skip = albumKey(newAlbum);
  const latest = new Map<string, Post>();
  for (const r of ratings) {
    const key = albumKey(r.album);
    const seen = latest.get(key);
    if (!seen || r.createdAt > seen.createdAt) latest.set(key, r);
  }
  return [...latest.entries()]
    .filter(([key, r]) => key !== skip && r.rating >= min && r.rating <= max)
    .map(([, r]) => r)
    .sort((a, b) => b.rating - a.rating || b.createdAt.localeCompare(a.createdAt));
}

export function startSearch(pool: Post[]): SearchRange {
  return { lo: 0, hi: pool.length };
}

/** Index of the pool item to compare against next, or null when placement is known. */
export function nextComparison(range: SearchRange): number | null {
  return range.lo < range.hi ? Math.floor((range.lo + range.hi) / 2) : null;
}

/** Narrow the range after the user picks between the new album and pool[index]. */
export function answerComparison(range: SearchRange, preferNew: boolean): SearchRange {
  const mid = nextComparison(range);
  if (mid === null) return range;
  return preferNew ? { lo: range.lo, hi: mid } : { lo: mid + 1, hi: range.hi };
}

/** Most questions a pool of this size can take. */
export function maxComparisons(poolSize: number): number {
  return Math.ceil(Math.log2(poolSize + 1));
}

const roundToTenth = (n: number) => Math.round(n * 10 + Number.EPSILON) / 10;

/** Score for an album inserted at `index` (0 = better than everything in the pool). */
export function scoreAtPosition(pool: Post[], index: number, sentiment: Sentiment): number {
  const { min, max } = SENTIMENTS[sentiment];
  const above = index > 0 ? pool[index - 1].rating : max;
  const below = index < pool.length ? pool[index].rating : min;
  const score = roundToTenth((above + below) / 2);
  return Math.min(Math.max(score, Math.min(above, below)), Math.max(above, below));
}
