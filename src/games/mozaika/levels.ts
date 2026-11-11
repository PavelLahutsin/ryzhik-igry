import { picture } from "../../shared/assets";
import type { LevelInfo } from "../../shared/levelgame";

export type MozaikaLevel = LevelInfo & {
  picture: string;
  cols: number;
  rows: number;
  /** Faded picture under the pieces as a hint; otherwise only the grid. */
  ghost: boolean;
};

/** 4 → 6 → 9 → 12 pieces. Pictures are 16:9, so 6 is 3×2 and 12 is 4×3. */
export const levels: MozaikaLevel[] = [
  { id: "m1", title: "Рыжик машет", picture: "ryzhik-mashet", cols: 2, rows: 2, ghost: true },
  { id: "m2", title: "Мама", picture: "mama", cols: 2, rows: 2, ghost: true },
  { id: "m3", title: "Папа", picture: "papa", cols: 3, rows: 2, ghost: true },
  { id: "m4", title: "Пикник", picture: "piknik", cols: 3, rows: 2, ghost: true },
  { id: "m5", title: "В саду", picture: "sad", cols: 3, rows: 3, ghost: true },
  { id: "m6", title: "Белочка", picture: "belka", cols: 3, rows: 3, ghost: false },
  { id: "m7", title: "Все вместе", picture: "vse-vmeste", cols: 4, rows: 3, ghost: true },
  { id: "m8", title: "Воздушный змей", picture: "ryzhik-zmey", cols: 4, rows: 3, ghost: false },
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
