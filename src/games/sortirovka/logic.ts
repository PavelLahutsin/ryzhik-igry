import { rate, type Score } from "../../shared/stars";
import type { ObjectId } from "../../shared/objects";
import type { SortLevel } from "./levels";

/** Basket id a thing belongs to on this level, or null. */
export function basketOf(level: SortLevel, item: ObjectId): string | null {
  return level.baskets.find((b) => b.items.includes(item))?.id ?? null;
}

export type SortResult = "placed" | "wrong" | "none";

export function judge(level: SortLevel, item: ObjectId, basket: string | null): SortResult {
  if (basket === null) return "none";
  return basketOf(level, item) === basket ? "placed" : "wrong";
}

/** The thing the hint points at: the first one still on the table. */
export function hintFor(order: readonly ObjectId[], sorted: ReadonlySet<ObjectId>): ObjectId | null {
  return order.find((id) => !sorted.has(id)) ?? null;
}

/** Stars: hints and wrong baskets; a quarter of the things may go wrong for ★★★. */
export function starsFor(misses: number, count: number, hints = 0): Score {
  const free = Math.max(1, Math.floor(count / 4));
  return rate(misses, hints, { free, more: free + 1 });
}
