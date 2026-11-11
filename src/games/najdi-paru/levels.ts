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

export const levels: ParaLevel[] = [
  { id: "p1", title: "Рыжик и мама", cols: 2, rows: 2, faces: ["ryzhik", "mama"] },
  { id: "p2", title: "Семья", cols: 2, rows: 3, faces: FAMILY },
  { id: "p3", title: "Друзья", cols: 2, rows: 3, faces: FRIENDS },
  { id: "p4", title: "Все вместе", cols: 3, rows: 4, faces: [...FAMILY, ...FRIENDS] },
  {
    id: "p5",
    title: "Игрушки",
    cols: 3,
    rows: 4,
    faces: ["obj:apple", "obj:ball", "obj:balloon", "obj:kite", "obj:sun", "obj:car"],
  },
  {
    id: "p6",
    title: "Большая игра",
    cols: 4,
    rows: 4,
    faces: [...FAMILY, ...FRIENDS, "obj:mushroom", "obj:star"],
  },
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
