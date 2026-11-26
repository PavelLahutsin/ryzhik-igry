import { CHARACTER_NAMES, characters } from "../../shared/assets";
import { OBJECTS, type ObjectId } from "../../shared/objects";
import type { LevelInfo } from "../../shared/levelgame";
import { SHAPES } from "./shapes";
import { TENI_V23, TENI_V23_AFTER } from "./levels-v23";

/** Where a shadow hides behind something: a bush, a cloud or a box. */
export type Hide = "bush" | "cloud" | "box";

/**
 * One shadow on the board. `id` is a picture: an object or shape id, a
 * character as "char:<id>"; "@s" at the end makes a smaller copy (for the
 * «big and small» levels). The shadow may be turned (degrees), mirrored or
 * partly hidden; the picture in the tray is always drawn the normal way.
 */
export type Spec = string | { id: string; turn?: number; flip?: boolean; hide?: Hide };

export type Round = {
  /** Pictures to put on their shadows. */
  items: Spec[];
  /** Extra shadows with no picture. */
  decoys?: Spec[];
  /** Extra pictures with no shadow: they stay in the tray. */
  extra?: Spec[];
};

export type TeniLevel = LevelInfo & Round & {
  /** Later rounds of a big scene, played one after another in one level. */
  more?: Round[];
};

export const worlds = [
  { id: "easy", title: "Простые тени", color: "#7cc46a" },
  { id: "friends", title: "Чья тень?", color: "#f27aa0" },
  { id: "more", title: "Ещё тени", color: "#6db3d4" },
  { id: "tricky", title: "Похожие тени", color: "#9b8cf0" },
  { id: "turn", title: "Перевёртыши", color: "#f2a65a" },
  { id: "hide", title: "Прятки", color: "#5bb89a" },
  { id: "odd", title: "Лишние картинки", color: "#c98a3e" },
  { id: "scene", title: "Большие сцены", color: "#e0656f" },
];

const flip = (id: string): Spec => ({ id, flip: true });
const turn = (id: string, deg: number): Spec => ({ id, turn: deg });
const hide = (id: string, where: Hide = "bush"): Spec => ({ id, hide: where });

/**
 * Play order: every world brings one new idea and starts a bit easier than
 * it ends; each world's easiest and hardest level are harder than the last
 * world's (see `difficulty` and the tests). Ids t1–t15 are the levels of
 * earlier versions, kept (with new pictures) so saved stars stay.
 */
const BASE: TeniLevel[] = [
  // Простые тени: 2 → 4 different shapes, nothing extra.
  { id: "t1", world: "easy", title: "Яблоко и звёздочка", items: ["apple", "star"] },
  { id: "t2", world: "easy", title: "Шарик и рыбка", items: ["balloon", "fish", "car"] },
  { id: "t16", world: "easy", title: "Зверята", items: ["cat", "elephant", "snail"] },
  { id: "t3", world: "easy", title: "Грибок и зонтик", items: ["mushroom", "kite", "sun", "umbrella"] },
  { id: "t7", world: "easy", title: "Вкусные тени", items: ["banana", "bread", "egg", "strawberry"] },
  // v22: new outlines — a crab, a bee, a pineapple, an anchor.
  { id: "t38", world: "easy", title: "Крабик и пчёлка", items: ["crab", "bee", "pineapple", "anchor"] },
  { id: "t47", world: "easy", title: "Лейка и расчёска", items: ["wateringcan", "comb", "bucket", "spoon"] },
  // Чья тень?: Рыжик, his family and friends; the first extra shadow.
  { id: "t4", world: "friends", title: "Чья тень?", items: ["char:ryzhik", "char:mishka", "char:ezhik", "char:belka"] },
  { id: "t17", world: "friends", title: "На ферме", items: ["hen", "dog", "rabbit", "duck", "frog"] },
  { id: "t8", world: "friends", title: "Друзья и игрушки", items: ["char:belka", "char:papa", "teddy", "drum", "robot"] },
  { id: "t39", world: "friends", title: "В море", items: ["crab", "octopus", "whale", "fish", "anchor"] },
  { id: "t9", world: "friends", title: "Лишняя тень", items: ["char:ryzhik", "char:mama", "char:ezhik", "owl"], decoys: ["char:mishka"] },
  { id: "t48", world: "friends", title: "Морской конёк и рыбка", items: ["seahorse", "fish", "whale", "boat"], decoys: ["crab"] },
  { id: "t6", world: "friends", title: "Вся семья", items: ["char:ryzhik", "char:mama", "char:papa", "char:mishka", "char:ezhik"] },
  // Ещё тени: five pictures and one or two extra shadows.
  { id: "t13", world: "more", title: "Друзья и фрукты", items: ["char:belka", "grapes", "char:ezhik", "watermelon", "candy"], decoys: ["pizza"] },
  { id: "t18", world: "more", title: "Поехали!", items: ["bus", "plane", "rocket", "bicycle", "tractor"], decoys: ["helicopter"] },
  { id: "t40", world: "more", title: "Всё для дела", items: ["hammer", "guitar", "crown", "sock", "pineapple"], decoys: ["bee"] },
  { id: "t14", world: "more", title: "В саду", items: ["flower", "leaf", "mushroom", "drop", "butterfly"], decoys: ["sun"] },
  // v12: a different rhythm in the middle — only three pictures, but six shadows.
  { id: "t37", world: "more", title: "Три из шести", items: ["char:belka", "tractor", "umbrella"], decoys: ["teapot", "giraffe", "boat"] },
  { id: "t15", world: "more", title: "Все-все тени", items: ["char:papa", "char:mishka", "kite", "boat", "cup"], decoys: ["ball", "hat"] },
  { id: "t19", world: "more", title: "Игрушки", items: ["teddy", "pyramid", "top", "rattle", "matryoshka"], decoys: ["drum", "bucket"] },
  { id: "t49", world: "more", title: "Всё для пикника", items: ["broccoli", "croissant", "apple", "cup"], decoys: ["cheese", "pear"] },
  // Похожие тени: twins that differ in one detail — a tail, an ear, a candle.
  { id: "t10", world: "tricky", title: "Похожие", items: ["apple", "cherry", "pear", "ball", "balloon"] },
  { id: "t20", world: "tricky", title: "Котики и зайки", items: ["cat", "cat2", "rabbit", "rabbit2", "mouse"], decoys: ["dog"] },
  { id: "t21", world: "tricky", title: "Тортики", items: ["cake3", "cake1", "icecream", "icecream2", "cheese"], decoys: ["candy"] },
  { id: "t5", world: "tricky", title: "Ключики и птички", items: ["key", "key2", "bird", "bird2", "owl"], decoys: ["bell"] },
  { id: "t41", world: "tricky", title: "Короны", items: ["crown", "crown5", "cup", "glass", "penguin"], decoys: ["octopus"] },
  { id: "t50", world: "tricky", title: "Верблюды в пустыне", items: ["dromedary", "camel", "sun", "flower", "tree"], decoys: ["cactus"] },
  { id: "t11", world: "tricky", title: "Шесть теней", items: ["leaf", "flower", "cup", "glass", "fir", "fir2"], decoys: ["tree"] },
  { id: "t12", world: "tricky", title: "Лишние двойняшки", items: ["cat2", "bird", "icecream"], decoys: ["cat", "bird2", "icecream2"] },
  // Перевёртыши: big and small, mirrored, upside down, tilted.
  { id: "t25", world: "turn", title: "Большой и маленький", items: ["ball", "ball@s", "fish", "fish@s", "star", "star@s"] },
  { id: "t51", world: "turn", title: "Самокат и всё наоборот", items: [flip("scooter"), turn("comb", 90), "lightning@s", flip("sled"), turn("bell", 180)], decoys: ["key"] },
  { id: "t22", world: "turn", title: "В другую сторону", items: [flip("dog"), flip("duck"), flip("snail"), flip("giraffe"), flip("whale")], decoys: ["turtle"] },
  { id: "t23", world: "turn", title: "Вверх ногами", items: [turn("umbrella", 180), turn("mushroom", 180), turn("icecream", 180), turn("fir", 180), turn("bell", 180)], decoys: ["lamp"] },
  { id: "t42", world: "turn", title: "Кто перевернулся?", items: [flip("dino"), turn("anchor", 180), flip("penguin"), turn("guitar", 45), flip("crab")], decoys: ["hammer"] },
  { id: "t24", world: "turn", title: "Кувырок", items: [turn("plane", 90), turn("rocket", -45), flip("giraffe"), turn("teddy", 30), flip("train")], decoys: ["helicopter", flip("boot")] },
  { id: "t26", world: "turn", title: "Путаница", items: [flip("cat"), "cat2", turn("rabbit", 90), "rabbit2", flip("key2")], decoys: ["key", "bird"] },
  // Прятки: part of a shadow is behind a bush, a cloud or a box.
  { id: "t27", world: "hide", title: "В кустах", items: [hide("elephant"), hide("cat"), hide("teapot"), hide("snowman"), hide("giraffe")], decoys: ["cat2", "clock"] },
  { id: "t43", world: "hide", title: "Динозаврик в кустах", items: [hide("dino"), hide("guitar", "box"), hide("penguin"), hide("crown", "bush"), "crown5"], decoys: [hide("bee", "cloud"), "pineapple"] },
  { id: "t52", world: "hide", title: "Кто за ёлочкой?", items: [hide("sled"), hide("fir"), hide("rabbit", "box"), hide("penguin"), "fir2"], decoys: [hide("mitten", "cloud"), "boot"] },
  { id: "t28", world: "hide", title: "Кто за тучкой?", items: [hide("owl", "cloud"), hide("aerostat", "cloud"), hide("plane", "cloud"), hide("hen", "cloud"), hide("bird", "cloud")], decoys: [hide("moon", "cloud"), "bird2"] },
  { id: "t53", world: "hide", title: "Молния за тёмной тучкой", items: [hide("lightning", "cloud"), hide("drop", "cloud"), hide("umbrella", "cloud"), hide("boot", "cloud"), hide("bird", "cloud")], decoys: [hide("bell", "cloud"), "bird2"] },
  { id: "t29", world: "hide", title: "Прятки с друзьями", items: [hide("char:ryzhik", "box"), hide("char:mama"), hide("char:papa", "box"), hide("char:belka"), "teddy@s"], decoys: ["char:ezhik", "char:mishka"] },
  { id: "t30", world: "hide", title: "Хитрые прятки", items: [{ id: "dog", hide: "bush", flip: true }, hide("bird2", "cloud"), hide("key", "box"), turn("glass", 180), hide("cake1"), "chair"], decoys: ["cake3", "bird"] },
  { id: "t44", world: "hide", title: "Ещё прятки", items: [hide("crab", "box"), flip("octopus"), hide("dino"), turn("anchor", 180), hide("cup", "box"), turn("glass", 180)], decoys: ["sock", hide("bird", "cloud")] },
  // v10 Лишние картинки: some pictures have no shadow — check each one, leave the extra ones.
  {
    id: "t34",
    world: "odd",
    title: "Кому нет тени?",
    // v12: the world starts with one extra picture (the next ones have two).
    items: [hide("elephant"), "giraffe", flip("whale"), "pear", hide("owl", "cloud"), turn("snail", 180)],
    extra: ["frog"],
    decoys: [hide("hen", "cloud"), "apple"],
  },
  {
    id: "t54",
    world: "odd",
    title: "Всё к чаю",
    items: ["croissant", "teapot", hide("cup"), turn("spoon", 90), hide("hat"), flip("bread")],
    extra: ["comb", "cheese"],
    decoys: ["cake1", "lamp"],
  },
  {
    id: "t35",
    world: "odd",
    title: "Лишние двойняшки",
    items: [hide("cat"), flip("dog"), turn("key", 180), hide("bird", "cloud"), "mitten", "lamp"],
    extra: ["cat2", "bird2"],
    decoys: ["clock"],
  },
  {
    id: "t36",
    world: "odd",
    title: "Проверь каждую",
    items: [hide("rabbit"), flip("truck"), turn("fir", 180), hide("cup", "box"), "icecream", "teapot"],
    extra: ["rabbit2"],
    decoys: ["bus", "glass"],
  },  {
    id: "t45",
    world: "odd",
    title: "Кто без тени?",
    items: [hide("dino"), flip("penguin"), "crown", turn("hammer", 90), hide("bee", "cloud"), hide("pineapple", "box")],
    extra: ["crown5"],
    decoys: ["octopus", hide("sock", "box")],
  },

  // Большие сцены: two or three rounds in one level, everything together.
  {
    id: "t31",
    world: "scene",
    title: "Прогулка в парке",
    items: ["tree", "cactus", "dog", "bicycle", "butterfly"],
    decoys: ["cloud"],
    more: [{ items: [flip("duck"), hide("frog"), turn("snail", 180), "bird", "bird2"], decoys: [hide("hen", "cloud")] }],
  },
  {
    id: "t32",
    world: "scene",
    title: "День рождения",
    items: ["cake3", "cake1", "spoon", "lollipop", "icecream"],
    decoys: ["icecream2"],
    more: [{ items: [hide("teddy", "box"), flip("robot"), "drum", turn("pyramid", 30), "matryoshka", "top"], decoys: ["rattle", hide("bucket")] }],
  },  {
    id: "t46",
    world: "scene",
    title: "На берегу моря",
    items: ["crab", "octopus", "whale", "boat", "anchor"],
    decoys: ["penguin"],
    more: [{ items: [flip("crab"), hide("fish"), turn("anchor", 180), "sun", "crown", "crown5"], decoys: [hide("bird", "cloud"), "bird2"] }],
  },
  {
    id: "t55",
    world: "scene",
    title: "У тёплого моря",
    items: [hide("seahorse", "bush"), flip("fish"), "crab", "anchor", "boat"],
    decoys: ["octopus"],
    more: [{ items: ["submarine@s", hide("sun", "cloud"), "whale", "star", hide("drop")], decoys: ["aerostat", hide("bird", "cloud")], extra: ["sled"] }],
  },
  {
    id: "t56",
    world: "scene",
    title: "Всё на ярмарке",
    items: ["scooter", "sled", hide("wateringcan", "box"), turn("comb", 90)],
    decoys: ["bucket", "chair"],
    more: [
      { items: ["croissant", "broccoli", "pear@s", hide("bread", "box")], decoys: ["cheese"], extra: ["mitten"] },
      { items: [flip("camel"), flip("dromedary"), "giraffe", "elephant"], decoys: ["dino"] },
    ],
  },

  {
    id: "t33",
    world: "scene",
    title: "Сложные тени",
    items: [flip("char:ryzhik"), hide("char:mama"), "char:papa", turn("char:mishka", 30), "char:ezhik", "char:belka@s"],
    decoys: ["teddy"],
    more: [
      { items: ["car", flip("truck"), hide("bus", "box"), turn("plane", 90), "rocket", "submarine"], decoys: [hide("helicopter", "cloud"), flip("train")] },
      { items: [flip("cat2"), hide("rabbit2"), turn("key2", 180), "fir2", hide("icecream2", "cloud"), flip("mitten")], decoys: ["cat", "rabbit"] },
    ],
  },
];

/** v23: the new levels sit where their difficulty fits (ids stay, so stars stay). */
export const levels: TeniLevel[] = (() => {
  const out = [...BASE];
  const left = [...TENI_V23];
  while (left.length) {
    const i = left.findIndex((l) => out.some((b) => b.id === TENI_V23_AFTER[l.id]));
    if (i < 0) throw new Error(`Нет места для ${left[0]!.id}`);
    const [l] = left.splice(i, 1);
    out.splice(out.findIndex((b) => b.id === TENI_V23_AFTER[l!.id]) + 1, 0, l!);
  }
  return out;
})();

/** All rounds of a level, the first one included. */
export function roundsOf(level: TeniLevel): Round[] {
  return [{ items: level.items, decoys: level.decoys, extra: level.extra }, ...(level.more ?? [])];
}

export function specOf(spec: Spec): { id: string; turn: number; flip: boolean; hide: Hide | null } {
  if (typeof spec === "string") return { id: spec, turn: 0, flip: false, hide: null };
  return { id: spec.id, turn: spec.turn ?? 0, flip: !!spec.flip, hide: spec.hide ?? null };
}

/** Shadows on the board in one round. */
export function roundShadows(round: Round): number {
  return round.items.length + (round.decoys?.length ?? 0);
}

/** Shadows in the whole level, all rounds. */
export function shadowCount(level: TeniLevel): number {
  return roundsOf(level).reduce((n, r) => n + roundShadows(r), 0);
}

export type Thing = { id: string; name: string; small: boolean } & ({ kind: "svg"; svg: string } | { kind: "img"; src: string });

/** Smaller copies are this big compared with the normal picture. */
export const SMALL = 0.58;

export function thing(key: string): Thing {
  const small = key.endsWith("@s");
  const id = small ? key.slice(0, -2) : key;
  const tail = small ? " (поменьше)" : "";
  if (id.startsWith("char:")) {
    const name = id.slice(5);
    const src = characters[name];
    if (!src) throw new Error(`Нет героя ${name}`);
    return { id: key, name: (CHARACTER_NAMES[name] ?? name) + tail, small, kind: "img", src };
  }
  const shape = SHAPES[id] ?? OBJECTS[id as ObjectId];
  if (!shape) throw new Error(`Нет предмета ${id}`);
  return { id: key, name: shape.name + tail, small, kind: "svg", svg: shape.svg };
}
