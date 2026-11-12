import { picture, scene } from "../../shared/assets";
import type { LevelInfo } from "../../shared/levelgame";

export type MozaikaLevel = LevelInfo & {
  picture: string;
  cols: number;
  rows: number;
  /** Faded picture under the pieces as a hint; otherwise only the grid. */
  ghost: boolean;
  /** A drawn (vector) scene from shared/assets/scenes instead of a cartoon still. */
  drawn?: boolean;
  /** How many loose pieces lie upside down (a tap turns one over). */
  flip?: number;
  /** Extra pieces cut from another picture that fit nowhere. */
  extra?: { from: string; count: number };
};

export const worlds = [
  { id: "w4", title: "4 кусочка", color: "#6db3d4" },
  { id: "w6", title: "6 кусочков", color: "#7cc46a" },
  { id: "w9", title: "9 кусочков", color: "#ffb23f" },
  { id: "w12", title: "12 кусочков", color: "#f27aa0" },
  { id: "w16", title: "16 кусочков", color: "#9b8cf0" },
  { id: "flip", title: "Вверх ногами", color: "#3fae6a" },
  { id: "extra", title: "Лишние кусочки", color: "#e8463a" },
];

/**
 * 4 → 6 → 9 → 12 → 16 pieces, every scene picture once. Pictures are 16:9,
 * so 6 is 3×2, 12 is 4×3. Within a world the faded hint goes away last.
 */
export const levels: MozaikaLevel[] = [
  { id: "m1", world: "w4", title: "Рыжик машет", picture: "ryzhik-mashet", cols: 2, rows: 2, ghost: true },
  { id: "m2", world: "w4", title: "Мама", picture: "mama", cols: 2, rows: 2, ghost: true },
  { id: "m3", world: "w4", title: "Папа", picture: "papa", cols: 2, rows: 2, ghost: false },
  { id: "m4", world: "w6", title: "Пикник", picture: "piknik", cols: 3, rows: 2, ghost: true },
  { id: "m5", world: "w6", title: "Братик", picture: "bratik", cols: 3, rows: 2, ghost: true },
  { id: "m6", world: "w6", title: "Ёжик", picture: "ezhik", cols: 3, rows: 2, ghost: false },
  { id: "m7", world: "w9", title: "В саду", picture: "sad", cols: 3, rows: 3, ghost: true },
  { id: "m8", world: "w9", title: "Белочка", picture: "belka", cols: 3, rows: 3, ghost: true },
  { id: "m9", world: "w9", title: "Зайка", picture: "zayka", cols: 3, rows: 3, ghost: false },
  { id: "m10", world: "w12", title: "Все вместе", picture: "vse-vmeste", cols: 4, rows: 3, ghost: true },
  { id: "m11", world: "w12", title: "Мишка", picture: "mishka", cols: 4, rows: 3, ghost: true },
  { id: "m12", world: "w12", title: "Змей", picture: "ryzhik-zmey", cols: 4, rows: 3, ghost: false },
  { id: "m13", world: "w16", title: "Рыжик с мячиком", picture: "ryzhik-myachik", cols: 4, rows: 4, ghost: true },
  { id: "m14", world: "w16", title: "Рыжик стоит", picture: "ryzhik-stoit", cols: 4, rows: 4, ghost: true },
  { id: "m15", world: "w16", title: "Зарядка", picture: "ryzhik-zaryadka", cols: 4, rows: 4, ghost: false },
  // v10 «Вверх ногами»: some pieces lie upside down — tap to turn, then put in place.
  // v12: a gentle start — a known picture, 6 pieces, only one upside down.
  { id: "m23", world: "flip", title: "Пикник наоборот", picture: "piknik", cols: 3, rows: 2, ghost: true, flip: 1 },
  { id: "m16", world: "flip", title: "Радуга", picture: "raduga", drawn: true, cols: 4, rows: 3, ghost: true, flip: 3 },
  { id: "m17", world: "flip", title: "Ферма", picture: "ferma", drawn: true, cols: 4, rows: 3, ghost: false, flip: 4 },
  { id: "m18", world: "flip", title: "Замок", picture: "zamok", drawn: true, cols: 4, rows: 4, ghost: true, flip: 5 },
  { id: "m19", world: "flip", title: "Город", picture: "gorod", drawn: true, cols: 4, rows: 4, ghost: false, flip: 6 },
  // v10 «Лишние кусочки»: pieces of another picture are mixed in — find what does not belong.
  { id: "m20", world: "extra", title: "Зима", picture: "zima", drawn: true, cols: 4, rows: 3, ghost: true, extra: { from: "kosmos", count: 2 } },
  { id: "m21", world: "extra", title: "Под водой", picture: "podvodny", drawn: true, cols: 4, rows: 4, ghost: true, extra: { from: "gorod", count: 2 } },
  { id: "m22", world: "extra", title: "Космос", picture: "kosmos", drawn: true, cols: 4, rows: 4, ghost: true, flip: 5, extra: { from: "podvodny", count: 2 } },
];

/**
 * How hard a level is: pieces, + 1 per upside-down piece, + 2 per extra
 * piece, − 2 with the faded hint. Tests check it grows world by world.
 */
export function difficulty(l: MozaikaLevel): number {
  return l.cols * l.rows + (l.flip ?? 0) + 2 * (l.extra?.count ?? 0) - (l.ghost ? 2 : 0);
}

export function pictureUrl(level: MozaikaLevel): string {
  return level.drawn ? scene(level.picture) : picture(level.picture);
}

export function pieceWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} кусочек`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} кусочка`;
  return `${n} кусочков`;
}
