import type { LevelInfo } from "../../shared/levelgame";
import { inWorldOrder } from "../../shared/order";
import type { ObjectColor, ObjectId } from "../../shared/objects";

/**
 * A thing on the table: an object, or an object drawn big or small
 * ("apple:big", "apple:small") for the size worlds.
 */
export type Item = ObjectId | `${ObjectId}:big` | `${ObjectId}:small` | Thing;
/** v13 «Собираемся»: pictures from «Тени» and things.ts (see thingArt). */
export type Thing = "hat" | "mitten" | "boot" | "teddy" | "chair" | "lamp" | "teapot" | "clock" | "bucket" | "icecream" | "watermelon" | "towel" | "soap" | "broom" | "suitcase" | "toothbrush";

export const objOf = (item: string): ObjectId => item.split(":")[0] as ObjectId;
export const sizeOf = (item: string): "big" | "small" | null => {
  const s = item.split(":")[1];
  return s === "big" || s === "small" ? s : null;
};

/**
 * A basket: by colour (all its things share the colour), by kind, by size,
 * by two features at once, or «сколько» — exactly `need` things, any of them.
 */
export type Basket = {
  id: string;
  name: string;
  /** Basket colour; for colour baskets it is the colour to sort by. */
  color: string;
  /** Colour baskets: the object colour that belongs here. */
  sorts?: ObjectColor;
  /** Kind baskets: a drawn object on the label. */
  label?: ObjectId | Thing;
  /** Size baskets: the label object is drawn big or small. */
  size?: "big" | "small";
  /** «Сколько положить?»: put exactly this many things here (any of them). */
  need?: number;
  items: Item[];
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

const byColor = (sorts: ObjectColor, items: Item[]): Basket => ({
  id: sorts,
  name: COLORS[sorts]!.name,
  color: COLORS[sorts]!.color,
  sorts,
  items,
});

const byKind = (id: string, name: string, color: string, label: ObjectId | Thing, items: Item[]): Basket => ({
  id,
  name,
  color,
  label,
  items,
});

const bySize = (size: "big" | "small", label: ObjectId, color: string, items: Item[], name = size === "big" ? "Большое" : "Маленькое"): Basket => ({
  id: `${size}-${name}`,
  name,
  color,
  label,
  size,
  items,
});

const byCount = (need: number, items: Item[], color: string): Basket => ({
  id: `n${need}`,
  name: String(need),
  color,
  need,
  items,
});

export const worlds = [
  { id: "colors", title: "По цвету", color: "#e8463a" },
  { id: "more", title: "Ещё порядок", color: "#7cc46a" },
  { id: "kinds", title: "Что куда?", color: "#3a8fd4" },
  { id: "trip", title: "Собираемся", color: "#e89a3a" },
  { id: "size", title: "Большое и маленькое", color: "#ffb23f" },
  { id: "count", title: "Сколько положить?", color: "#9b8cf0" },
  { id: "cross", title: "Два признака", color: "#f27aa0" },
];

const COLOR_ASK = "Разложи по цвету: каждую картинку в корзинку своего цвета";

/** 4 → 10 things, 2 → 4 baskets. */
const ALL: SortLevel[] = [
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
  {
    id: "k7",
    world: "more",
    title: "Солнышко и дождик",
    ask: "Что нужно в солнечный день, а что — в дождик?",
    baskets: [
      byKind("sunny", "Солнышко", "#ffc94a", "sun", ["kite", "balloon", "flower"]),
      byKind("rainy", "Дождик", "#3a8fd4", "drop", ["umbrella", "boat"]),
    ],
  },
  {
    id: "k8",
    world: "more",
    title: "Фрукты и игрушки",
    ask: "Фрукты — в одну корзинку, игрушки — в другую",
    baskets: [
      byKind("fruit", "Фрукты", "#ff9f6b", "pear", ["apple", "pear", "banana", "cherry"]),
      byKind("toys", "Игрушки", "#9b8cf0", "ball", ["ball", "cube", "car"]),
    ],
  },
  {
    id: "k9",
    world: "more",
    title: "В гости",
    ask: "Разложи: еда, игрушки и то, что в небе",
    baskets: [
      byKind("food", "Еда", "#ff9f6b", "apple", ["apple", "carrot", "banana"]),
      byKind("toys", "Игрушки", "#9b8cf0", "ball", ["ball", "car", "cube"]),
      byKind("sky", "В небе", "#7cc0e8", "sun", ["sun", "star", "balloon"]),
    ],
  },
  // v10 «Большое и маленькое»: the same things, big and small.
  {
    id: "z1",
    world: "size",
    title: "Большие и маленькие",
    ask: "Большое — в одну корзинку, маленькое — в другую",
    baskets: [bySize("big", "ball", "#ffb23f", ["apple:big", "ball:big", "star:big"]), bySize("small", "ball", "#7cc0e8", ["apple:small", "ball:small", "star:small"])],
  },
  {
    id: "z2",
    world: "size",
    title: "Большой и маленький",
    ask: "Большое — в одну корзинку, маленькое — в другую",
    baskets: [
      bySize("big", "car", "#ffb23f", ["mushroom:big", "car:big", "sun:big", "fish:big"]),
      bySize("small", "car", "#7cc0e8", ["mushroom:small", "car:small", "sun:small", "fish:small"]),
    ],
  },
  {
    id: "z3",
    world: "size",
    title: "Всё вперемешку",
    ask: "Смотри внимательно: что большое, а что маленькое?",
    baskets: [
      bySize("big", "house", "#ffb23f", ["house:big", "cup:big", "pear:big", "boat:big", "balloon:big"]),
      bySize("small", "house", "#7cc0e8", ["house:small", "cup:small", "pear:small", "boat:small", "balloon:small"]),
    ],
  },
  // v10 «Сколько положить?»: the number on a basket says how many things go in.
  {
    id: "n1",
    world: "count",
    title: "Одно и три",
    ask: "Положи в каждую корзинку столько яблок, сколько написано",
    baskets: [byCount(1, ["apple"], "#ff9f6b"), byCount(3, ["apple", "apple", "apple"], "#9b8cf0")],
  },
  {
    id: "n2",
    world: "count",
    title: "Два и четыре",
    ask: "Положи в каждую корзинку столько грибов, сколько написано",
    baskets: [byCount(2, ["mushroom", "mushroom"], "#ff9f6b"), byCount(4, ["mushroom", "mushroom", "mushroom", "mushroom"], "#9b8cf0")],
  },
  {
    id: "n3",
    world: "count",
    title: "Раз, два, три, четыре",
    ask: "Сколько написано — столько и положи",
    baskets: [
      byCount(1, ["star"], "#ffc94a"),
      byCount(2, ["star", "star"], "#ff9f6b"),
      byCount(3, ["star", "star", "star"], "#9b8cf0"),
      byCount(4, ["star", "star", "star", "star"], "#7cc0e8"),
    ],
  },
  // v10 «Два признака»: a basket asks for two things at once — kind and size, colour and size.
  {
    id: "x1",
    world: "cross",
    title: "Фрукты и игрушки",
    ask: "Смотри на два признака: что это и какого размера",
    baskets: [
      bySize("big", "apple", "#ff9f6b", ["apple:big", "pear:big"], "Большие фрукты"),
      bySize("small", "apple", "#ff9f6b", ["apple:small", "cherry:small"], "Маленькие фрукты"),
      bySize("big", "ball", "#9b8cf0", ["ball:big", "car:big"], "Большие игрушки"),
      bySize("small", "ball", "#9b8cf0", ["ball:small", "cube:small"], "Маленькие игрушки"),
    ],
  },
  {
    id: "x2",
    world: "cross",
    title: "Красное и жёлтое",
    ask: "Смотри на два признака: какого цвета и какого размера",
    baskets: [
      { ...byColor("red", ["apple:big", "car:big"] as Item[]), id: "red-big", name: "Большое красное", size: "big" },
      { ...byColor("red", ["apple:small", "cherry:small"] as Item[]), id: "red-small", name: "Маленькое красное", size: "small" },
      { ...byColor("yellow", ["sun:big", "banana:big"] as Item[]), id: "yellow-big", name: "Большое жёлтое", size: "big" },
      { ...byColor("yellow", ["sun:small", "star:small"] as Item[]), id: "yellow-small", name: "Маленькое жёлтое", size: "small" },
    ],
  },
  {
    id: "x3",
    world: "cross",
    title: "Синее и зелёное",
    ask: "Смотри на два признака: какого цвета и какого размера",
    baskets: [
      { ...byColor("blue", ["boat:big", "cup:big", "drop:big"] as Item[]), id: "blue-big", name: "Большое синее", size: "big" },
      { ...byColor("blue", ["boat:small", "drop:small"] as Item[]), id: "blue-small", name: "Маленькое синее", size: "small" },
      { ...byColor("green", ["leaf:big", "pear:big"] as Item[]), id: "green-big", name: "Большое зелёное", size: "big" },
      { ...byColor("green", ["cube:small", "leaf:small", "pear:small"] as Item[]), id: "green-small", name: "Маленькое зелёное", size: "small" },
    ],
  },
  // v13 «Собираемся»: sorting by meaning — what is needed for the trip.
  {
    id: "p1",
    world: "trip",
    title: "Собери вещи в поездку",
    ask: "Что берём с собой в чемодан, а что остаётся дома?",
    baskets: [
      byKind("bag", "В чемодан", "#e89a3a", "suitcase", ["teddy", "toothbrush", "hat"]),
      byKind("home", "Остаётся дома", "#a7a29a", "house", ["chair", "lamp", "teapot"]),
    ],
  },
  {
    id: "p2",
    world: "trip",
    title: "Собери в баню",
    ask: "Что пригодится в бане? Остальное — для игры",
    baskets: [
      byKind("banya", "В баню", "#7cc4e8", "bucket", ["towel", "soap", "broom"]),
      byKind("play", "Для игры", "#e8463a", "ball", ["kite", "car", "balloon"]),
    ],
  },
  {
    id: "p3",
    world: "trip",
    title: "На зимнюю прогулку",
    ask: "Что надеть зимой? А что пригодится летом?",
    baskets: [
      byKind("winter", "Зимой", "#3a8fd4", "mitten", ["hat", "boot", "mitten"]),
      byKind("summer", "Летом", "#f5c330", "sun", ["icecream", "watermelon", "umbrella"]),
    ],
  },
  {
    id: "p4",
    world: "trip",
    title: "Соберёмся в гости",
    ask: "В гости берём подарок и угощение. Что берём, а что остаётся?",
    baskets: [
      byKind("gift", "Взять в гости", "#f7a8c8", "balloon", ["teddy", "cherry", "flower", "apple"]),
      byKind("stay", "Остаётся дома", "#a7a29a", "house", ["clock", "chair", "broom"]),
    ],
  },
];

/** Worlds in the order of the list; the new ones come after the old three. */
export const levels: SortLevel[] = inWorldOrder(ALL, ["colors", "more", "kinds", "trip", "size", "count", "cross"]);

/** v13: «Собираемся» sits after «Что куда?», and «Большое и маленькое» still opens after k6 as before. */
export const AFTER: Record<string, string> = { z1: "k6" };

export function itemCount(level: SortLevel): number {
  return level.baskets.reduce((sum, b) => sum + b.items.length, 0);
}

/**
 * How hard a level is: 10 per basket + things, plus what the new worlds add:
 * telling sizes apart (+5), counting (+8), two features at once (+12).
 */
export function difficulty(l: SortLevel): number {
  const bonus = { size: 5, count: 8, cross: 12 }[l.world as "size" | "count" | "cross"] ?? 0;
  return l.baskets.length * 10 + itemCount(l) + bonus;
}
