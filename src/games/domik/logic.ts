/** Pure rules of «Домик Рыжика»: layout, seats, food. No DOM. */
export const WORLD_W = 1600;
export const WORLD_H = 1000;

export type CharId = "ryzhik" | "mama" | "papa" | "belka" | "ezhik" | "mishka";
export type FoodId = "apple" | "carrot" | "mushroom" | "cone" | "berries";
export type ToyId = "ball" | "cube" | "car";
export type CarryId = FoodId | ToyId;

export const FOODS: readonly FoodId[] = ["apple", "carrot", "mushroom", "cone", "berries"];

export function isFood(id: CarryId): id is FoodId {
  return (FOODS as readonly string[]).includes(id);
}

/** Height on screen in world units (Ryzhik is a little fox, papa is tall). */
export const CHAR_HEIGHT: Record<CharId, number> = {
  ryzhik: 270,
  mama: 340,
  papa: 360,
  belka: 230,
  ezhik: 190,
  mishka: 320,
};

/** Width / height of the cutout pictures. */
export const CHAR_ASPECT: Record<CharId, number> = {
  ryzhik: 0.711,
  mama: 0.613,
  papa: 0.627,
  belka: 0.691,
  ezhik: 0.706,
  mishka: 0.575,
};

export const FAVORITE: Record<CharId, FoodId> = {
  ryzhik: "apple",
  mama: "carrot",
  papa: "mushroom",
  belka: "cone",
  ezhik: "mushroom",
  mishka: "berries",
};

/** World size in pixels for a stage: whole scene when the screen is wide, a scrollable strip on a tall phone. */
export function fitWorld(stageW: number, stageH: number): { w: number; h: number; scroll: boolean } {
  // A phone on its side is short: let the scene be a bit taller than the screen and scroll up and down.
  const h = stageH < 480 && stageW > stageH ? Math.min((stageW * WORLD_H) / WORLD_W, stageH * 1.5) : Math.min(stageH, stageW * 1.4);
  const hh = Math.max(200, h);
  const w = (hh * WORLD_W) / WORLD_H;
  return { w, h: hh, scroll: w > stageW + 1 || hh > stageH + 1 };
}

export type Seat = { id: string; x: number; y: number; pose: "sleep" | "swing" | "sit" };

/** The free seat nearest to a foot point, within reach (world units). */
export function nearestSeat(seats: readonly Seat[], x: number, y: number, taken: ReadonlySet<string>, reach = 150): Seat | null {
  let best: Seat | null = null;
  let bestDist = reach;
  for (const seat of seats) {
    if (taken.has(seat.id)) continue;
    const d = Math.hypot(seat.x - x, seat.y - y);
    if (d <= bestDist) {
      best = seat;
      bestDist = d;
    }
  }
  return best;
}

export type Reaction = "love" | "yum" | "play";

/** What a character does with a thing dropped on them. Everyone eats; the favourite gets hearts. */
export function react(char: CharId, thing: CarryId): Reaction {
  if (!isFood(thing)) return "play";
  return FAVORITE[char] === thing ? "love" : "yum";
}

/** Keep a foot point inside the world and on the ground band. */
export function clampFoot(x: number, y: number, minY: number): { x: number; y: number } {
  return { x: Math.min(WORLD_W - 60, Math.max(60, x)), y: Math.min(WORLD_H - 10, Math.max(minY, y)) };
}

export function cycle(n: number, size: number): number {
  return (n + 1) % size;
}
