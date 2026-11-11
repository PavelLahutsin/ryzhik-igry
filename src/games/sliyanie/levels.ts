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

/** Winter chain: snowflakes grow into a snowman. */
export const WINTER: ChainStep[] = [
  { name: "Снежинка", color: "#e3f2fd" },
  { name: "Снежок", color: "#eaf4fb" },
  { name: "Снежный ком", color: "#e1effa" },
  { name: "Маленький снеговик", color: "#e6f0ff" },
  { name: "Снеговик", color: "#dff0fb" },
  { name: "Снеговик в шапке", color: "#ffe6e3" },
  { name: "Рыжик и снеговик", color: "#fff1b8" },
];

export type ChainId = "sad" | "zima";
export const CHAINS: Record<ChainId, ChainStep[]> = { sad: CHAIN, zima: WINTER };

export const worlds = [
  { id: "sad", title: "Сад", color: "#7cc46a" },
  { id: "zima", title: "Зима", color: "#6db3d4" },
];

export type SliyanieLevel = LevelInfo & {
  chain: ChainId;
  size: number;
  /** Index in CHAIN to grow. */
  goal: number;
  /** Line on the praise card. */
  done: string;
};

/**
 * Two chains of six levels. The board grows as the goal grows; the last
 * level of each world is the same goal on a tighter board.
 */
export const levels: SliyanieLevel[] = [
  { id: "s1", world: "sad", chain: "sad", title: "Вырасти цветок", size: 3, goal: 2, done: "Вырос цветок!" },
  { id: "s2", world: "sad", chain: "sad", title: "Вырасти кустик", size: 3, goal: 3, done: "Вырос кустик!" },
  { id: "s3", world: "sad", chain: "sad", title: "Вырасти яблоньку", size: 4, goal: 4, done: "Выросла яблонька!" },
  { id: "s4", world: "sad", chain: "sad", title: "Вырасти яблоки", size: 4, goal: 5, done: "Выросли яблоки!" },
  { id: "s5", world: "sad", chain: "sad", title: "Сад для Рыжика", size: 5, goal: 6, done: "Рыжик гуляет в своём саду!" },
  { id: "s6", world: "sad", chain: "sad", title: "Сад на полянке", size: 4, goal: 6, done: "Целый сад на маленькой полянке!" },
  { id: "z1", world: "zima", chain: "zima", title: "Слепи ком", size: 3, goal: 2, done: "Получился снежный ком!" },
  { id: "z2", world: "zima", chain: "zima", title: "Маленький снеговик", size: 3, goal: 3, done: "Вот и маленький снеговик!" },
  { id: "z3", world: "zima", chain: "zima", title: "Слепи снеговика", size: 4, goal: 4, done: "Какой большой снеговик!" },
  { id: "z4", world: "zima", chain: "zima", title: "Шапка для снеговика", size: 4, goal: 5, done: "Снеговику тепло в шапке!" },
  { id: "z5", world: "zima", chain: "zima", title: "Рыжик и снеговик", size: 5, goal: 6, done: "Рыжик дружит со снеговиком!" },
  { id: "z6", world: "zima", chain: "zima", title: "Снеговик во дворе", size: 4, goal: 6, done: "Самый лучший снеговик во дворе!" },
];
