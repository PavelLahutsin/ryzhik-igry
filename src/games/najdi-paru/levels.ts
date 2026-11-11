import { CHARACTER_NAMES, characters } from "../../shared/assets";
import { OBJECTS, type ObjectId } from "../../shared/objects";
import type { LevelInfo } from "../../shared/levelgame";

export type ParaLevel = LevelInfo & {
  cols: number;
  rows: number;
  /** Card faces: a character cutout ("ryzhik") or a drawn object ("obj:apple"). */
  faces: string[];
};

const FAMILY = ["ryzhik", "mama", "papa"];
const FRIENDS = ["belka", "ezhik", "mishka"];

export const worlds = [
  { id: "family", title: "Семья и друзья", color: "#f27aa0" },
  { id: "things", title: "Предметы", color: "#ffb23f" },
  { id: "big", title: "Большие игры", color: "#9b8cf0" },
];

const FRUIT = ["obj:apple", "obj:pear", "obj:cherry", "obj:banana"];
const NATURE = ["obj:sun", "obj:star", "obj:leaf", "obj:flower", "obj:drop", "obj:mushroom"];
const TOYS = ["obj:ball", "obj:balloon", "obj:kite", "obj:car", "obj:boat", "obj:cube"];
const HOME = ["obj:house", "obj:cup", "obj:umbrella", "obj:carrot"];

/**
 * 4 → 20 cards. Ids p1–p6 are the first version's levels, kept so saved
 * stars stay. Levels with more faces than pairs pick a random set each time.
 */
export const levels: ParaLevel[] = [
  { id: "p1", world: "family", title: "Рыжик и мама", cols: 2, rows: 2, faces: ["ryzhik", "mama"] },
  { id: "p2", world: "family", title: "Семья", cols: 2, rows: 3, faces: FAMILY },
  { id: "p3", world: "family", title: "Друзья", cols: 2, rows: 3, faces: FRIENDS },
  { id: "p4", world: "family", title: "Все вместе", cols: 3, rows: 4, faces: [...FAMILY, ...FRIENDS] },
  { id: "p7", world: "things", title: "Фрукты", cols: 2, rows: 4, faces: FRUIT },
  { id: "p5", world: "things", title: "Игрушки", cols: 3, rows: 4, faces: ["obj:apple", "obj:ball", "obj:balloon", "obj:kite", "obj:sun", "obj:car"] },
  { id: "p8", world: "things", title: "На прогулке", cols: 3, rows: 4, faces: NATURE },
  { id: "p9", world: "things", title: "Во дворе", cols: 4, rows: 4, faces: [...TOYS.slice(2), ...HOME] },
  { id: "p6", world: "big", title: "Большая игра", cols: 4, rows: 4, faces: [...FAMILY, ...FRIENDS, "obj:mushroom", "obj:star"] },
  { id: "p10", world: "big", title: "Разноцветная", cols: 4, rows: 4, faces: [...FRUIT, ...TOYS, ...NATURE] },
  { id: "p11", world: "big", title: "Друзья и игрушки", cols: 4, rows: 5, faces: [...FAMILY, ...FRIENDS, ...TOYS.slice(0, 4)] },
  { id: "p12", world: "big", title: "Самая большая", cols: 4, rows: 5, faces: [...FAMILY, ...FRIENDS, ...FRUIT, ...TOYS, ...NATURE, ...HOME] },
];

export function pairsOf(level: ParaLevel): number {
  return (level.cols * level.rows) / 2;
}

export type Face = { kind: "character"; src: string; name: string } | { kind: "object"; svg: string; name: string };

export function face(key: string): Face {
  if (key.startsWith("obj:")) {
    const obj = OBJECTS[key.slice(4) as ObjectId];
    if (!obj) throw new Error(`Нет предмета ${key}`);
    return { kind: "object", svg: obj.svg, name: obj.name };
  }
  const src = characters[key];
  if (!src) throw new Error(`Нет героя ${key}`);
  return { kind: "character", src, name: CHARACTER_NAMES[key] ?? key };
}

/** Soft background per face, so pairs are also told apart by colour. */
export const FACE_COLORS: Record<string, string> = {
  ryzhik: "#ffe0c2",
  mama: "#eadcf7",
  papa: "#dcefd9",
  belka: "#fff0c4",
  ezhik: "#e4f2fb",
  mishka: "#f9dcdc",
};
