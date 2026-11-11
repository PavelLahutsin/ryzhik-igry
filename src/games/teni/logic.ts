/** Shadow matching rules, no DOM. */
export type DropResult = "placed" | "wrong" | "none";

/**
 * `target` is the id of the silhouette the piece was dropped on (or null
 * when it landed nowhere near one). Already filled silhouettes don't count.
 */
export function judge(itemId: string, target: string | null, filled: ReadonlySet<string>): DropResult {
  if (target === null || filled.has(target)) return "none";
  return target === itemId ? "placed" : "wrong";
}

export function starsFor(misses: number): number {
  if (misses <= 1) return 3;
  if (misses <= 3) return 2;
  return 1;
}

/** Silhouette rows: up to 3 per row, so 5 becomes 3 + 2 and 6 is 3 + 3. */
export function rowsOf(count: number): number[] {
  if (count <= 3) return [count];
  if (count === 4) return [2, 2];
  return [3, count - 3];
}

/** The thing the hint shows: the first one still in the tray. */
export function hintTarget(items: readonly string[], filled: ReadonlySet<string>): string | null {
  return items.find((id) => !filled.has(id)) ?? null;
}
