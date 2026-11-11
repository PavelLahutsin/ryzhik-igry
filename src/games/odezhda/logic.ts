import { ITEMS, type Weather } from "./items";

export type DressResult = "wear" | "wrong" | "taken";

/** Can this item go on Ryzhik now? `worn` holds the ids already on him. */
export function tryWear(itemId: string, weather: Weather, worn: readonly string[]): DressResult {
  const item = ITEMS[itemId];
  if (!item || !item.weathers.includes(weather)) return "wrong";
  if (worn.some((id) => ITEMS[id]?.slot === item.slot)) return "taken";
  return "wear";
}

export function dressed(wear: readonly string[], worn: readonly string[]): boolean {
  return wear.every((id) => worn.includes(id));
}

export function starsFor(misses: number): number {
  if (misses <= 1) return 3;
  if (misses <= 3) return 2;
  return 1;
}
