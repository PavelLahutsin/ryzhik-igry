import type { LevelInfo } from "../../shared/levelgame";
import type { ObjectColor, ObjectId } from "../../shared/objects";

/** A basket: by colour (all its things share the colour) or by kind. */
export type Basket = {
  id: string;
  name: string;
  /** Basket colour; for colour baskets it is the colour to sort by. */
  color: string;
  /** Colour baskets: the object colour that belongs here. */
  sorts?: ObjectColor;
  /** Kind baskets: a drawn object on the label. */
  label?: ObjectId;
  items: ObjectId[];
};

export type SortLevel = LevelInfo & { ask: string; baskets: Basket[] };

export const COLORS: Record<string, { name: string; color: string }> = {
  red: { name: "Красное", color: "#e8463a" },
  yellow: { name: "Жёлтое", color: "#ffc94a" },
  blue: { name: "Синее", color: "#3a8fd4" },
  green: { name: "Зелёное", color: "#6fbf4a" },
  pink: { name: "Розовое", color: "#f58fb4" },
  orange: { name: "Оранжевое", color: "#f5862b" },
};

const byColor = (sorts: ObjectColor, items: ObjectId[]): Basket => ({
  id: sorts,
  name: COLORS[sorts]!.name,
  color: COLORS[sorts]!.color,
  sorts,
  items,
});

const byKind = (id: string, name: string, color: string, label: ObjectId, items: ObjectId[]): Basket => ({
  id,
  name,
  color,
  label,
  items,
});

export const worlds = [
  { id: "colors", title: "По цвету", color: "#e8463a" },
  { id: "kinds", title: "Что куда?", color: "#3a8fd4" },
];

const COLOR_ASK = "Разложи по цвету: каждую картинку в корзинку своего цвета";

/** 4 → 10 things, 2 → 4 baskets. */
export const levels: SortLevel[] = [
  { id: "c1", world: "colors", title: "Красное и жёлтое", ask: COLOR_ASK, baskets: [byColor("red", ["apple", "car"]), byColor("yellow", ["sun", "star"])] },
  { id: "c2", world: "colors", title: "Синее и зелёное", ask: COLOR_ASK, baskets: [byColor("blue", ["boat", "drop"]), byColor("green", ["pear", "leaf"])] },
  {
    id: "c3",
    world: "colors",
    title: "Шесть картинок",
    ask: COLOR_ASK,
    baskets: [byColor("red", ["apple", "cherry", "car"]), byColor("yellow", ["sun", "star", "banana"])],
  },
  {
    id: "c4",
    world: "colors",
    title: "Три корзинки",
    ask: COLOR_ASK,
    baskets: [byColor("red", ["apple", "mushroom"]), byColor("blue", ["drop", "cup"]), byColor("green", ["leaf", "cube"])],
  },
  {
    id: "c5",
    world: "colors",
    title: "Тёплые цвета",
    ask: COLOR_ASK,
    baskets: [byColor("yellow", ["sun", "banana", "star"]), byColor("pink", ["balloon", "flower"]), byColor("orange", ["fish", "carrot"])],
  },
  {
    id: "c6",
    world: "colors",
    title: "Четыре цвета",
    ask: COLOR_ASK,
    baskets: [
      byColor("red", ["cherry", "car"]),
      byColor("yellow", ["banana", "sun"]),
      byColor("blue", ["boat", "cup"]),
      byColor("green", ["pear", "cube"]),
    ],
  },
  {
    id: "k1",
    world: "kinds",
    title: "Еда и игрушки",
    ask: "Что можно съесть, а чем играть?",
    baskets: [byKind("food", "Еда", "#ff9f6b", "apple", ["apple", "banana"]), byKind("toys", "Игрушки", "#9b8cf0", "ball", ["ball", "car"])],
  },
  {
    id: "k2",
    world: "kinds",
    title: "Обед и игра",
    ask: "Что можно съесть, а чем играть?",
    baskets: [
      byKind("food", "Еда", "#ff9f6b", "apple", ["pear", "carrot", "cherry"]),
      byKind("toys", "Игрушки", "#9b8cf0", "ball", ["kite", "cube", "car"]),
    ],
  },
  {
    id: "k3",
    world: "kinds",
    title: "Небо и вода",
    ask: "Что бывает в небе, а что в воде?",
    baskets: [byKind("sky", "В небе", "#7cc0e8", "sun", ["sun", "star", "kite"]), byKind("water", "В воде", "#3a8fd4", "drop", ["fish", "boat"])],
  },
  {
    id: "k4",
    world: "kinds",
    title: "Высоко и глубоко",
    ask: "Что бывает в небе, а что в воде?",
    baskets: [
      byKind("sky", "В небе", "#7cc0e8", "sun", ["sun", "star", "kite", "balloon"]),
      byKind("water", "В воде", "#3a8fd4", "drop", ["fish", "boat", "drop"]),
    ],
  },
  {
    id: "k5",
    world: "kinds",
    title: "Кухня, игрушки, лес",
    ask: "Разложи: еда, игрушки и то, что растёт в лесу",
    baskets: [
      byKind("food", "Еда", "#ff9f6b", "apple", ["apple", "cherry", "banana"]),
      byKind("toys", "Игрушки", "#9b8cf0", "ball", ["ball", "car", "cube"]),
      byKind("forest", "В лесу", "#6fbf4a", "leaf", ["leaf", "flower", "mushroom"]),
    ],
  },
  {
    id: "k6",
    world: "kinds",
    title: "Большая уборка",
    ask: "Наведи порядок: всё по своим корзинкам",
    baskets: [
      byKind("food", "Еда", "#ff9f6b", "apple", ["pear", "carrot", "banana"]),
      byKind("toys", "Игрушки", "#9b8cf0", "ball", ["ball", "kite", "cube"]),
      byKind("forest", "В лесу", "#6fbf4a", "leaf", ["leaf", "flower"]),
      byKind("home", "Дома", "#ffb23f", "house", ["cup", "umbrella"]),
    ],
  },
];

export function itemCount(level: SortLevel): number {
  return level.baskets.reduce((sum, b) => sum + b.items.length, 0);
}
