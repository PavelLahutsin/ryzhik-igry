import { character } from "./assets";
import { el } from "./dom";
import { svgNode } from "./ui";
import { OBJECTS, type ObjectId } from "./objects";
import { platform } from "./platform";

/**
 * Sticker album: stars from all games open stickers one by one. The first
 * comes with the very first won level, then every few stars one more.
 */
export type Sticker = { id: string; name: string } & ({ obj: ObjectId } | { char: string });

const CHARS: Array<[string, string]> = [
  ["ryzhik", "Рыжик"],
  ["mama", "Мама"],
  ["papa", "Папа"],
  ["belka", "Белочка"],
  ["ezhik", "Ёжик"],
  ["mishka", "Мишка"],
];
const OBJ_ORDER: ObjectId[] = [
  "apple", "ball", "sun", "balloon", "flower", "fish", "car", "star", "mushroom", "boat",
  "kite", "umbrella", "house", "carrot", "cherry", "pear", "banana", "leaf", "drop", "cube", "cup",
];

/** Characters are spread among the things so a new friend comes now and then. */
export const STICKERS: Sticker[] = (() => {
  const out: Sticker[] = [];
  const chars = [...CHARS];
  OBJ_ORDER.forEach((o, i) => {
    if (i % 4 === 1 && chars.length) {
      const [id, name] = chars.shift()!;
      out.push({ id: `char-${id}`, name, char: id });
    }
    out.push({ id: o, name: OBJECTS[o].name, obj: o });
  });
  for (const [id, name] of chars) out.push({ id: `char-${id}`, name, char: id });
  return out;
})();

/** Stars needed for sticker k (0-based): 3, 8, 13, … */
export const starsFor = (k: number): number => 3 + 5 * k;

export function earned(stars: number): number {
  if (stars < 3) return 0;
  return Math.min(STICKERS.length, Math.floor((stars - 3) / 5) + 1);
}

export function stickerArt(s: Sticker, cls = "sticker__art"): Element {
  return "obj" in s
    ? svgNode(OBJECTS[s.obj].svg, cls)
    : el("img", { class: cls, attrs: { src: character(s.char), alt: "", draggable: "false" } });
}

export async function totalStars(): Promise<number> {
  const { games } = await import("../games/registry");
  const all = await Promise.all(games.map((g) => g.summary().catch(() => null)));
  return all.reduce((sum, s) => sum + (s && s.unit === "stars" ? s.got : 0), 0);
}

const KEY = "stickers";

/** Stickers opened since the album was last shown in a praise card. */
export async function newStickers(): Promise<Sticker[]> {
  const have = earned(await totalStars());
  const shown = (await platform.storage.get<{ shown: number }>(KEY))?.shown ?? 0;
  if (have <= shown) return [];
  await platform.storage.set(KEY, { shown: have });
  return STICKERS.slice(shown, have);
}
