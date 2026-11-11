import type { LevelInfo } from "../../shared/levelgame";

export type ChainStep = { name: string; color: string };

/** The picture chain: each pair of equal steps grows into the next one. */
export const CHAIN: ChainStep[] = [
  { name: "Семечко", color: "#f3e3c6" },
  { name: "Росток", color: "#e3f1c8" },
  { name: "Цветок", color: "#fde0ea" },
  { name: "Кустик", color: "#d5efc7" },
  { name: "Яблонька", color: "#c9e8b8" },
  { name: "Яблоня с яблоками", color: "#ffe1c9" },
  { name: "Рыжик в саду", color: "#fff1b8" },
];

export type SliyanieLevel = LevelInfo & {
  size: number;
  /** Index in CHAIN to grow. */
  goal: number;
  /** Line on the praise card. */
  done: string;
};

export const levels: SliyanieLevel[] = [
  { id: "s1", title: "Вырасти цветок", size: 3, goal: 2, done: "Вырос цветок!" },
  { id: "s2", title: "Вырасти кустик", size: 3, goal: 3, done: "Вырос кустик!" },
  { id: "s3", title: "Вырасти яблоньку", size: 4, goal: 4, done: "Выросла яблонька!" },
  { id: "s4", title: "Вырасти яблоки", size: 4, goal: 5, done: "Выросли яблоки!" },
  { id: "s5", title: "Сад для Рыжика", size: 4, goal: 6, done: "Рыжик гуляет в своём саду!" },
];
