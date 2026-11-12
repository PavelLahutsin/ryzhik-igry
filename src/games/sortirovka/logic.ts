import { rateBy, STARS, type Score } from "../../shared/stars";
import type { SortLevel } from "./levels";

/** Basket id a thing belongs to on this level, or null. */
export function basketOf(level: SortLevel, item: string): string | null {
  return level.baskets.find((b) => b.items.includes(item as never))?.id ?? null;
}

/** "full": a «сколько» basket already has its number of things. */
export type SortResult = "placed" | "wrong" | "full" | "none";

/**
 * Where the thing was dropped. `fill` = how many things the basket has now
 * (only «Сколько положить?» baskets use it: any thing fits until full).
 */
export function judge(level: SortLevel, item: string, basket: string | null, fill = 0): SortResult {
  if (basket === null) return "none";
  const b = level.baskets.find((x) => x.id === basket);
  if (b?.need !== undefined) return fill < b.need ? "placed" : "full";
  return basketOf(level, item) === basket ? "placed" : "wrong";
}

/** For the hand and the hint: a «сколько» basket that still needs things, else the thing's own basket. */
export function targetFor(level: SortLevel, item: string, fills: ReadonlyMap<string, number>): string | null {
  const open = level.baskets.find((b) => b.need !== undefined && (fills.get(b.id) ?? 0) < b.need);
  return open ? open.id : basketOf(level, item);
}

/** The thing the hint points at: the first one still on the table. */
export function hintFor<T>(order: readonly T[], sorted: ReadonlySet<T>): T | null {
  return order.find((id) => !sorted.has(id)) ?? null;
}

/** Stars: hints and wrong baskets; a quarter of the things may go wrong for ★★★. */
export function starsFor(misses: number, count: number, hints = 0): Score {
  return rateBy(STARS.sortirovka, misses, hints, count);
}
