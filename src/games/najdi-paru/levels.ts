import { CHARACTER_NAMES, characters } from "../../shared/assets";
import { inWorldOrder } from "../../shared/order";
import { OBJECTS, type ObjectId } from "../../shared/objects";
import type { LevelInfo } from "../../shared/levelgame";
import { shuffle } from "../../shared/rng";

/**
 * What makes a pair: the same picture twice (default); a thing and its
 * shadow; a number and that many things; or three alike.
 */
export type PairMode = "same" | "shadow" | "count" | "three";

export type ParaLevel = LevelInfo & {
  cols: number;
  rows: number;
  /** Card faces: a character cutout ("ryzhik") or a drawn object ("obj:apple"). */
  faces: string[];
  mode?: PairMode;
  /** «Цифра и счёт»: the numbers on the cards (the things come from `faces`). */
  numbers?: number[];
};

const FAMILY = ["ryzhik", "mama", "papa"];
const FRIENDS = ["belka", "ezhik", "mishka"];

export const worlds = [
  { id: "family", title: "Семья и друзья", color: "#f27aa0" },
  { id: "fun", title: "Весёлые пары", color: "#7cc46a" },
  { id: "things", title: "Предметы", color: "#ffb23f" },
  { id: "big", title: "Большие игры", color: "#9b8cf0" },
  { id: "count", title: "Цифра и счёт", color: "#3b7fc4" },
  { id: "shadow", title: "Предмет и тень", color: "#5a5f6a" },
  { id: "three", title: "Найди три", color: "#e8463a" },
];

const FRUIT = ["obj:apple", "obj:pear", "obj:cherry", "obj:banana"];
const NATURE = ["obj:sun", "obj:star", "obj:leaf", "obj:flower", "obj:drop", "obj:mushroom"];
const TOYS = ["obj:ball", "obj:balloon", "obj:kite", "obj:car", "obj:boat", "obj:cube"];
const HOME = ["obj:house", "obj:cup", "obj:umbrella", "obj:carrot"];

/**
 * 4 → 20 cards. Ids p1–p6 are the first version's levels, kept so saved
 * stars stay. Levels with more faces than pairs pick a random set each time.
 */
const ALL: ParaLevel[] = [
  { id: "p1", world: "family", title: "Рыжик и мама", cols: 2, rows: 2, faces: ["ryzhik", "mama"] },
  { id: "p2", world: "family", title: "Семья", cols: 2, rows: 3, faces: FAMILY },
  { id: "p3", world: "family", title: "Друзья", cols: 2, rows: 3, faces: FRIENDS },
  { id: "p4", world: "family", title: "Все вместе", cols: 3, rows: 4, faces: [...FAMILY, ...FRIENDS] },
  { id: "p7", world: "things", title: "Фрукты", cols: 2, rows: 4, faces: FRUIT },
  { id: "p5", world: "things", title: "Игрушки", cols: 3, rows: 4, faces: ["obj:apple", "obj:ball", "obj:balloon", "obj:kite", "obj:sun", "obj:car"] },
  { id: "p8", world: "things", title: "На прогулке", cols: 3, rows: 4, faces: NATURE },
  { id: "p9", world: "things", title: "Во дворе", cols: 4, rows: 4, faces: [...TOYS.slice(2), ...HOME] },
  { id: "p6", world: "big", title: "Большая игра", cols: 4, rows: 4, faces: [...FAMILY, ...FRIENDS, "obj:mushroom", "obj:star"] },
  { id: "p10", world: "big", title: "Цветная", cols: 4, rows: 4, faces: [...FRUIT, ...TOYS, ...NATURE] },
  { id: "p11", world: "big", title: "Друзья и игрушки", cols: 4, rows: 5, faces: [...FAMILY, ...FRIENDS, ...TOYS.slice(0, 4)] },
  { id: "p12", world: "big", title: "Самая большая", cols: 4, rows: 5, faces: [...FAMILY, ...FRIENDS, ...FRUIT, ...TOYS, ...NATURE, ...HOME] },
  { id: "p13", world: "fun", title: "Чаепитие", cols: 2, rows: 4, faces: ["obj:cup", "obj:cherry", "obj:pear", "obj:banana"] },
  { id: "p14", world: "fun", title: "Что в небе?", cols: 3, rows: 4, faces: ["obj:sun", "obj:star", "obj:balloon", "obj:kite", "obj:drop", "obj:leaf"] },
  { id: "p15", world: "fun", title: "Лесные друзья", cols: 3, rows: 4, faces: [...FRIENDS, "obj:mushroom", "obj:leaf", "obj:flower"] },
  // v10 «Цифра и счёт»: a number goes with that many things.
  { id: "c1", world: "count", title: "До пяти", cols: 2, rows: 5, mode: "count", numbers: [1, 2, 3, 4, 5], faces: ["obj:apple", "obj:cherry", "obj:star", "obj:ball", "obj:flower"] },
  { id: "c2", world: "count", title: "До шести", cols: 3, rows: 4, mode: "count", numbers: [1, 2, 3, 4, 5, 6], faces: ["obj:pear", "obj:leaf", "obj:drop", "obj:mushroom", "obj:cube", "obj:carrot"] },
  { id: "c3", world: "count", title: "До восьми", cols: 4, rows: 4, mode: "count", numbers: [1, 2, 3, 4, 5, 6, 7, 8], faces: ["obj:apple", "obj:star", "obj:ball", "obj:flower", "obj:drop", "obj:cherry", "obj:sun", "obj:leaf"] },
  // v10 «Предмет и тень»: a thing goes with its black shadow.
  { id: "q1", world: "shadow", title: "Чья тень?", cols: 3, rows: 4, mode: "shadow", faces: ["obj:apple", "obj:ball", "obj:star", "obj:house", "obj:umbrella", "obj:fish"] },
  { id: "q2", world: "shadow", title: "Тени во дворе", cols: 4, rows: 4, mode: "shadow", faces: ["obj:car", "obj:boat", "obj:kite", "obj:balloon", "obj:cup", "obj:carrot", "obj:mushroom", "obj:sun"] },
  { id: "q3", world: "shadow", title: "Похожие тени", cols: 4, rows: 4, mode: "shadow", faces: ["obj:apple", "obj:pear", "obj:cherry", "obj:ball", "obj:balloon", "obj:sun", "obj:flower", "obj:leaf"] },
  // v10 «Найди три»: open three alike in a row.
  { id: "r1", world: "three", title: "Три яблока", cols: 3, rows: 3, mode: "three", faces: ["obj:apple", "obj:star", "obj:ball"] },
  { id: "r2", world: "three", title: "Три игрушки", cols: 3, rows: 4, mode: "three", faces: ["obj:car", "obj:boat", "obj:kite", "obj:cube", "obj:balloon"] },
  { id: "r3", world: "three", title: "Три друга", cols: 3, rows: 5, mode: "three", faces: [...FAMILY, ...FRIENDS] },
];

/** Worlds go from easy to hard (tests check the mean difficulty rises world by world). */
export const levels: ParaLevel[] = inWorldOrder(ALL, ["family", "fun", "things", "big", "count", "shadow", "three"]);

/** How many groups (pairs, or threes) are on the table. */
export function pairsOf(level: ParaLevel): number {
  return (level.cols * level.rows) / (level.mode === "three" ? 3 : 2);
}

/**
 * How hard a level is: the cards, + half again for a thing that has to be
 * matched to a different card (shadow, count; counting adds 2 more), twice
 * for threes (more to remember, a miss can come on the third card).
 */
export function difficulty(l: ParaLevel): number {
  const n = l.cols * l.rows;
  if (l.mode === "three") return n * 2;
  if (l.mode === "count") return n * 1.5 + 2;
  if (l.mode === "shadow") return n * 1.5;
  return n;
}

/** The cards that belong together, for logic.dealGroups. */
export function groupsFor(l: ParaLevel, rand: () => number = Math.random): string[][] {
  const n = pairsOf(l);
  if (l.mode === "count") {
    const things = shuffle([...l.faces], rand);
    return l.numbers!.slice(0, n).map((k, i) => [`num:${k}`, `many:${things[i % things.length]!}:${k}`]);
  }
  const chosen = l.faces.length > n ? shuffle([...l.faces], rand).slice(0, n) : l.faces.slice(0, n);
  if (l.mode === "shadow") return chosen.map((f) => [f, `shadow:${f}`]);
  if (l.mode === "three") return chosen.map((f) => [f, f, f]);
  return chosen.map((f) => [f, f]);
}

export type Face =
  | { kind: "character"; src: string; name: string }
  | { kind: "object"; svg: string; name: string }
  | { kind: "shadow"; svg: string; name: string }
  | { kind: "number"; n: number; name: string }
  | { kind: "many"; svg: string; n: number; name: string };

const NUMBER_WORDS = ["", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять", "десять"];

export function face(key: string): Face {
  if (key.startsWith("num:")) {
    const n = Number(key.slice(4));
    if (!(n >= 1 && n <= 10)) throw new Error(`Нет числа ${key}`);
    return { kind: "number", n, name: `Цифра ${n}` };
  }
  if (key.startsWith("many:")) {
    const parts = key.split(":");
    const n = Number(parts.pop());
    const inner = face(parts.slice(1).join(":"));
    if (inner.kind !== "object" || !(n >= 1 && n <= 10)) throw new Error(`Нет карточки ${key}`);
    return { kind: "many", svg: inner.svg, n, name: `${NUMBER_WORDS[n]}: ${inner.name}` };
  }
  if (key.startsWith("shadow:")) {
    const inner = face(key.slice(7));
    if (inner.kind !== "object") throw new Error(`Нет тени ${key}`);
    return { kind: "shadow", svg: inner.svg, name: `Тень: ${inner.name}` };
  }
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
