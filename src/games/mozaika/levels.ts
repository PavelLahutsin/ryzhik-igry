import { picture } from "../../shared/assets";
import type { LevelInfo } from "../../shared/levelgame";

export type MozaikaLevel = LevelInfo & {
  picture: string;
  cols: number;
  rows: number;
  /** Faded picture under the pieces as a hint; otherwise only the grid. */
  ghost: boolean;
};

export const worlds = [
  { id: "w4", title: "4 кусочка", color: "#6db3d4" },
  { id: "w6", title: "6 кусочков", color: "#7cc46a" },
  { id: "w9", title: "9 кусочков", color: "#ffb23f" },
  { id: "w12", title: "12 кусочков", color: "#f27aa0" },
  { id: "w16", title: "16 кусочков", color: "#9b8cf0" },
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
  { id: "m12", world: "w12", title: "Воздушный змей", picture: "ryzhik-zmey", cols: 4, rows: 3, ghost: false },
  { id: "m13", world: "w16", title: "Рыжик с мячиком", picture: "ryzhik-myachik", cols: 4, rows: 4, ghost: true },
  { id: "m14", world: "w16", title: "Рыжик стоит", picture: "ryzhik-stoit", cols: 4, rows: 4, ghost: true },
  { id: "m15", world: "w16", title: "Зарядка", picture: "ryzhik-zaryadka", cols: 4, rows: 4, ghost: false },
];

export function pictureUrl(level: MozaikaLevel): string {
  return picture(level.picture);
}

export function pieceWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} кусочек`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} кусочка`;
  return `${n} кусочков`;
}
