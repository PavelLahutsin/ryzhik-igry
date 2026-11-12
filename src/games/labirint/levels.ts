import type { LevelInfo } from "../../shared/levelgame";
import { inWorldOrder } from "../../shared/order";

export type LabLevel = LevelInfo & {
  cols: number;
  rows: number;
  /** Who waits at the exit (character key). */
  goal: string;
  /** Apples to pick up on the way. */
  apples: number;
  /** Line on the praise card. */
  done: string;
};

export const worlds = [
  { id: "home", title: "Домой", color: "#7cc46a" },
  { id: "guests", title: "В гости", color: "#ffb23f" },
  { id: "big", title: "Большие лабиринты", color: "#9b8cf0" },
  { id: "forest", title: "Лесные тропинки", color: "#6fbf4a" },
];

/** 3×3 → 8×9. Apples come in from the middle world. */
const ALL: LabLevel[] = [
  { id: "l1", world: "home", title: "К маме", cols: 3, rows: 3, goal: "mama", apples: 0, done: "Рыжик пришёл к маме!" },
  { id: "l2", world: "home", title: "К папе", cols: 3, rows: 4, goal: "papa", apples: 0, done: "Рыжик пришёл к папе!" },
  { id: "l3", world: "home", title: "Домой", cols: 4, rows: 4, goal: "mama", apples: 0, done: "Мама ждала Рыжика!" },
  { id: "l4", world: "home", title: "К белочке", cols: 4, rows: 5, goal: "belka", apples: 0, done: "Белочка рада Рыжику!" },
  { id: "l5", world: "guests", title: "К ёжику", cols: 5, rows: 5, goal: "ezhik", apples: 0, done: "Ёжик встретил Рыжика!" },
  { id: "l6", world: "guests", title: "Яблоко для мишки", cols: 5, rows: 6, goal: "mishka", apples: 1, done: "Мишка любит яблоки!" },
  { id: "l7", world: "guests", title: "Яблоки для белочки", cols: 5, rows: 6, goal: "belka", apples: 2, done: "Белочка говорит: спасибо!" },
  { id: "l8", world: "guests", title: "Гостинцы ёжику", cols: 6, rows: 7, goal: "ezhik", apples: 3, done: "Ёжик угостит друзей!" },
  { id: "l9", world: "big", title: "Длинная дорожка", cols: 6, rows: 7, goal: "mishka", apples: 0, done: "Какая длинная дорожка!" },
  { id: "l10", world: "big", title: "Яблоки для мамы", cols: 7, rows: 8, goal: "mama", apples: 3, done: "Мама испечёт пирог!" },
  { id: "l11", world: "big", title: "Яблоки для папы", cols: 7, rows: 8, goal: "papa", apples: 4, done: "Папа гордится Рыжиком!" },
  { id: "l12", world: "big", title: "Большой лабиринт", cols: 8, rows: 9, goal: "mama", apples: 5, done: "Рыжик прошёл самый большой лабиринт!" },
  { id: "l13", world: "forest", title: "К белочке в дупло", cols: 5, rows: 5, goal: "belka", apples: 2, done: "Белочка угостит Рыжика орешками!" },
  { id: "l14", world: "forest", title: "Мишкина поляна", cols: 6, rows: 6, goal: "mishka", apples: 2, done: "Мишка рад яблокам!" },
  { id: "l15", world: "forest", title: "Ёжикина тропинка", cols: 6, rows: 7, goal: "ezhik", apples: 3, done: "Ёжик собрал яблоки на иголки!" },
];

/** Easier extra worlds sit where their difficulty fits, so levels keep getting harder. */
export const levels: LabLevel[] = inWorldOrder(ALL, ["home", "guests", "forest", "big"]);
