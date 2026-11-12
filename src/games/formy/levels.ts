import type { LevelInfo } from "../../shared/levelgame";
import type { ObjectId } from "../../shared/objects";
import type { Dim, PickSpec, Shape, Size, Tint } from "./logic";

export type ThingId = "coin" | "clock" | "ball" | "present" | "window" | "cube" | "pizza" | "flag" | "sign";

type Base = LevelInfo & { world: string; ask: string; done: string };
export type FamilyLevel = Base & { mode: "family"; sizes: Size[]; objects: ObjectId[] };
export type PyramidLevel = Base & { mode: "pyramid"; rings: number };
export type SorterLevel = Base & { mode: "sorter"; shapes: Shape[]; perShape: number };
export type ThingsLevel = Base & { mode: "things"; baskets: Shape[]; things: { id: ThingId; shape: Shape }[] };
/** Drag things onto a shelf in order (short → long, small → big …). */
export type OrderLevel = Base & { mode: "order"; dim: Dim; count: number; dir: "up" | "down"; object?: ObjectId };
/** One question per screen, tap the answer; `rounds` questions in a level. */
export type PickLevel = Base & { mode: "pick"; spec: PickSpec; rounds: number };
/** Sort by colour and shape together: a red circle goes to the red-circle box. */
export type Sort2Level = Base & { mode: "sort2"; bins: { shape: Shape; tint: Tint }[]; per: number };
export type FormLevel = FamilyLevel | PyramidLevel | SorterLevel | ThingsLevel | OrderLevel | PickLevel | Sort2Level;

export const worlds = [
  { id: "size", title: "Большой и маленький", color: "#ff8a3d" },
  { id: "measure", title: "Длинный, высокий, толстый", color: "#e8a23a" },
  { id: "shape", title: "Фигуры", color: "#9b6cd8" },
  { id: "logic", title: "Что лишнее? Что дальше?", color: "#3fae6a" },
  { id: "mix", title: "Цвет, форма и углы", color: "#6db3d4" },
];

/** The first levels (ids kept: stars are stored by id). */
const FIRST: FormLevel[] = [
  {
    id: "r1",
    world: "size",
    mode: "family",
    title: "Папе и Рыжику",
    sizes: ["big", "small"],
    objects: ["apple", "pear"],
    ask: "Большое — папе, маленькое — Рыжику!",
    done: "Всем досталось по размеру!",
  },
  {
    id: "r2",
    world: "size",
    mode: "family",
    title: "Вся семья",
    sizes: ["big", "mid", "small"],
    objects: ["apple", "cup"],
    ask: "Большое — папе, среднее — маме, маленькое — Рыжику.",
    done: "Папе большое, маме среднее, Рыжику маленькое!",
  },
  { id: "r3", world: "size", mode: "pyramid", title: "Пирамидка", rings: 4, ask: "Собери пирамидку: сначала самое большое колечко.", done: "Пирамидка готова!" },
  {
    id: "r4",
    world: "size",
    mode: "family",
    title: "Подарки",
    sizes: ["big", "mid", "small"],
    objects: ["ball", "star", "balloon"],
    ask: "Раздай подарки по размеру!",
    done: "Подарки нашли хозяев!",
  },
  { id: "r5", world: "size", mode: "pyramid", title: "Большая пирамидка", rings: 6, ask: "Шесть колечек — от большого к маленькому.", done: "Высокая пирамидка!" },
  { id: "f1", world: "shape", mode: "sorter", title: "Круг и квадрат", shapes: ["circle", "square"], perShape: 2, ask: "Найди для каждой фигурки её окошко.", done: "Все фигурки в коробке!" },
  { id: "f2", world: "shape", mode: "sorter", title: "Три фигуры", shapes: ["circle", "square", "triangle"], perShape: 2, ask: "Круг, квадрат, треугольник — опусти в своё окошко.", done: "Молодец, знаешь фигуры!" },
  {
    id: "f3",
    world: "shape",
    mode: "things",
    title: "На что похоже?",
    baskets: ["circle", "square", "triangle"],
    things: [
      { id: "coin", shape: "circle" },
      { id: "clock", shape: "circle" },
      { id: "present", shape: "square" },
      { id: "window", shape: "square" },
      { id: "pizza", shape: "triangle" },
      { id: "flag", shape: "triangle" },
    ],
    ask: "Что круглое, что квадратное, а что похоже на треугольник?",
    done: "Ты видишь фигуры везде!",
  },
  { id: "f4", world: "shape", mode: "sorter", title: "Звезда и сердце", shapes: ["circle", "triangle", "star", "heart"], perShape: 1, ask: "Новые фигуры: звезда и сердечко!", done: "Все окошки заняты!" },
  {
    id: "f5",
    world: "shape",
    mode: "things",
    title: "Круглое и квадратное",
    baskets: ["circle", "square", "triangle"],
    things: [
      { id: "ball", shape: "circle" },
      { id: "cube", shape: "square" },
      { id: "sign", shape: "triangle" },
      { id: "clock", shape: "circle" },
      { id: "present", shape: "square" },
      { id: "pizza", shape: "triangle" },
      { id: "coin", shape: "circle" },
    ],
    ask: "Разложи вещи по формам.",
    done: "Всё по полочкам!",
  },
  { id: "f6", world: "shape", mode: "sorter", title: "Шесть фигур", shapes: ["circle", "square", "triangle", "star", "heart", "rhombus"], perShape: 1, ask: "Шесть окошек — шесть фигур. Ромб похож на воздушного змея!", done: "Ты мастер фигур!" },
  {
    id: "r6",
    world: "mix",
    mode: "family",
    title: "Угощение",
    sizes: ["big", "mid", "small"],
    objects: ["pear", "cherry", "banana"],
    ask: "Угости всех: большое — папе, среднее — маме, маленькое — Рыжику.",
    done: "Всем вкусно!",
  },
  { id: "f7", world: "mix", mode: "sorter", title: "Звёзды и сердечки", shapes: ["star", "heart", "circle"], perShape: 2, ask: "Звёздочки, сердечки и кружочки — по окошкам!", done: "Красивая коробка!" },
  { id: "r7", world: "mix", mode: "pyramid", title: "Пирамидка из пяти", rings: 5, ask: "Пять колечек: сначала самое большое.", done: "Ровная пирамидка!" },
  {
    id: "f8",
    world: "mix",
    mode: "things",
    title: "Вещи в доме",
    baskets: ["circle", "square", "triangle"],
    things: [
      { id: "clock", shape: "circle" },
      { id: "window", shape: "square" },
      { id: "flag", shape: "triangle" },
      { id: "ball", shape: "circle" },
      { id: "present", shape: "square" },
      { id: "sign", shape: "triangle" },
    ],
    ask: "Что круглое, что квадратное, а что — треугольник?",
    done: "Всё нашло своё место!",
  },
];

const SIMPLE: Shape[] = ["circle", "square", "triangle"];
const SIX: Shape[] = ["circle", "square", "triangle", "star", "heart", "rhombus"];
const ALL: Shape[] = [...SIX, "oval", "rect", "pentagon", "hexagon"];

/** Levels added in v9: comparing, ordering, finding the same, odd one out, patterns, holes, corners. */
const ADDED: FormLevel[] = [
  // --- size
  {
    id: "c1",
    world: "size",
    mode: "pick",
    title: "Где большое?",
    spec: { kind: "compare", dims: ["size"], count: 2, want: "most", things: ["apple", "ball", "balloon", "car"] },
    rounds: 4,
    ask: "Нажми на большое!",
    done: "Ты знаешь, где большое!",
  },
  { id: "o1", world: "size", mode: "order", title: "По росту", dim: "size", count: 3, dir: "up", object: "fish", ask: "Поставь рыбок по порядку: от маленькой к большой.", done: "Рыбки выстроились по росту!" },
  { id: "o2", world: "size", mode: "order", title: "От большого", dim: "size", count: 4, dir: "down", object: "house", ask: "Поставь домики: от большого к маленькому.", done: "Большой, поменьше, ещё меньше — и самый маленький!" },
  // --- long / tall / thick
  {
    id: "m1",
    world: "measure",
    mode: "pick",
    title: "Длинный и короткий",
    spec: { kind: "compare", dims: ["length"], count: 2, want: "mix" },
    rounds: 4,
    ask: "Где длинный карандаш, а где короткий?",
    done: "Длинный и короткий — ты различаешь!",
  },
  {
    id: "m2",
    world: "measure",
    mode: "pick",
    title: "Высокая и низкая",
    spec: { kind: "compare", dims: ["height"], count: 2, want: "mix" },
    rounds: 4,
    ask: "Где высокая ёлка, а где низкая?",
    done: "Высокая и низкая — правильно!",
  },
  {
    id: "m3",
    world: "measure",
    mode: "pick",
    title: "Толстая и тонкая",
    spec: { kind: "compare", dims: ["thick"], count: 2, want: "mix" },
    rounds: 4,
    ask: "Где толстая книга, а где тонкая?",
    done: "Толстая и тонкая — молодец!",
  },
  {
    id: "m4",
    world: "measure",
    mode: "pick",
    title: "Самый-самый",
    spec: { kind: "compare", dims: ["length", "height", "thick"], count: 3, want: "mix" },
    rounds: 6,
    ask: "Слушай внимательно: самый длинный? самая низкая?",
    done: "Самые-самые найдены!",
  },
  { id: "m5", world: "measure", mode: "order", title: "Карандаши", dim: "length", count: 4, dir: "up", ask: "Разложи карандаши: от короткого к длинному.", done: "Карандаши лесенкой!" },
  { id: "m6", world: "measure", mode: "order", title: "Ёлочки", dim: "height", count: 5, dir: "up", ask: "Посади ёлочки: от низкой к высокой.", done: "Ёлочки растут лесенкой!" },
  // --- shapes
  {
    id: "s1",
    world: "shape",
    mode: "pick",
    title: "Такая же",
    spec: { kind: "same", options: 3, shapes: SIMPLE, variant: "plain" },
    rounds: 4,
    ask: "Найди внизу такую же фигуру.",
    done: "Все пары нашлись!",
  },
  {
    id: "s2",
    world: "shape",
    mode: "pick",
    title: "Одного цвета",
    spec: { kind: "same", options: 4, shapes: SIX, variant: "tint" },
    rounds: 5,
    ask: "Все одного цвета! Смотри на форму.",
    done: "Ты смотришь на форму — здорово!",
  },
  {
    id: "s3",
    world: "shape",
    mode: "pick",
    title: "Повернулась",
    spec: { kind: "same", options: 5, shapes: ALL, variant: "turn" },
    rounds: 6,
    ask: "Найди ту же форму. Она может повернуться и сменить цвет!",
    done: "Узнаёшь фигуры в любом виде!",
  },
  // --- odd one out, patterns
  { id: "d1", world: "logic", mode: "pick", title: "Что лишнее?", spec: { kind: "odd", options: 3, shapes: SIMPLE, by: "shape" }, rounds: 4, ask: "Одна фигура не такая, как все. Какая?", done: "Лишнее найдено!" },
  { id: "q1", world: "logic", mode: "pick", title: "Что дальше?", spec: { kind: "pattern", shown: 4, unit: "AB", attr: "shape", options: 3, shapes: SIMPLE }, rounds: 4, ask: "Фигуры идут по очереди. Что будет дальше?", done: "Узор продолжается!" },
  { id: "d2", world: "logic", mode: "pick", title: "Не того цвета", spec: { kind: "odd", options: 4, shapes: SIX, by: "tint" }, rounds: 5, ask: "Какая фигура другого цвета?", done: "Глазки зоркие!" },
  { id: "q2", world: "logic", mode: "pick", title: "Цветные бусы", spec: { kind: "pattern", shown: 5, unit: "AAB", attr: "tint", options: 3, shapes: SIX }, rounds: 5, ask: "Какая бусинка будет следующей?", done: "Красивые бусы!" },
  { id: "d3", world: "logic", mode: "pick", title: "Другой размер", spec: { kind: "odd", options: 4, shapes: SIX, by: "size" }, rounds: 5, ask: "Какая фигура не такого размера?", done: "Размер не обманет!" },
  { id: "q3", world: "logic", mode: "pick", title: "Три фигуры", spec: { kind: "pattern", shown: 5, unit: "ABC", attr: "shape", options: 3, shapes: SIX }, rounds: 5, ask: "Три фигуры по очереди. Что дальше?", done: "Узор разгадан!" },
  { id: "d4", world: "logic", mode: "pick", title: "Найди лишнее", spec: { kind: "odd", options: 5, shapes: ALL, by: "mix" }, rounds: 6, ask: "Что лишнее: форма, цвет или размер?", done: "Ты настоящий сыщик!" },
  { id: "q4", world: "logic", mode: "pick", title: "Хитрый узор", spec: { kind: "pattern", shown: 5, unit: "ABB", attr: "both", options: 4, shapes: ALL }, rounds: 6, ask: "Узор хитрый: смотри и на форму, и на цвет.", done: "Хитрый узор разгадан!" },
  // --- colour + shape, holes, corners
  { id: "h1", world: "mix", mode: "pick", title: "В окошко", spec: { kind: "fit", options: 3, shapes: SIX, sizes: false }, rounds: 4, ask: "Какая фигурка пролезет в окошко?", done: "Все фигурки пролезли!" },
  { id: "h2", world: "mix", mode: "pick", title: "Впору", spec: { kind: "fit", options: 4, shapes: ALL, sizes: true }, rounds: 5, ask: "Окошко маленькое или большое? Найди фигурку как раз!", done: "Всё как раз впору!" },
  { id: "k1", world: "mix", mode: "pick", title: "Сколько углов?", spec: { kind: "corners", shapes: ["triangle", "square", "rect", "rhombus"], options: 3 }, rounds: 4, ask: "Посчитай уголки у фигуры.", done: "Уголки посчитаны!" },
  {
    id: "x1",
    world: "mix",
    mode: "sort2",
    title: "Цвет и форма",
    bins: [
      { shape: "circle", tint: "red" },
      { shape: "circle", tint: "blue" },
      { shape: "square", tint: "red" },
      { shape: "square", tint: "blue" },
    ],
    per: 2,
    ask: "Красный круг — к красному кругу. Смотри и на цвет, и на форму!",
    done: "Цвет и форма — всё совпало!",
  },
  { id: "k2", world: "mix", mode: "pick", title: "Много углов", spec: { kind: "corners", shapes: ["triangle", "square", "pentagon", "hexagon", "rhombus"], options: 4 }, rounds: 6, ask: "Посчитай уголки. Бывает и пять, и шесть!", done: "Ты умеешь считать углы!" },
  {
    id: "x2",
    world: "mix",
    mode: "sort2",
    title: "Шесть коробок",
    bins: [
      { shape: "triangle", tint: "yellow" },
      { shape: "triangle", tint: "green" },
      { shape: "star", tint: "yellow" },
      { shape: "star", tint: "green" },
      { shape: "heart", tint: "yellow" },
      { shape: "heart", tint: "green" },
    ],
    per: 2,
    ask: "Шесть коробок: и цвет, и форма должны совпасть.",
    done: "Всё разложено без ошибок!",
  },
];

/** Play order inside each world: from easy to hard (see `difficulty`). */
const ORDER: Record<string, string[]> = {
  size: ["c1", "r1", "o1", "r3", "r2", "r7", "o2", "r4", "r6", "r5"],
  measure: ["m1", "m2", "m3", "m4", "m5", "m6"],
  shape: ["s1", "f1", "f2", "f4", "s2", "s3", "f6", "f3", "f5"],
  logic: ["d1", "q1", "d2", "q2", "d3", "q3", "q4", "d4"],
  mix: ["h1", "f7", "k1", "h2", "x1", "k2", "f8", "x2"],
};

const BY_ID = new Map([...FIRST, ...ADDED].map((l) => [l.id, l]));
export const levels: FormLevel[] = worlds.flatMap((w) =>
  ORDER[w.id]!.map((id) => {
    const l = BY_ID.get(id);
    if (!l) throw new Error(`formy: no level ${id}`);
    return { ...l, world: w.id };
  }),
);

/** A rough effort score: how many things, how many kinds, how abstract. */
export function difficulty(l: FormLevel): number {
  switch (l.mode) {
    case "family":
      return l.sizes.length * l.objects.length + l.sizes.length;
    case "pyramid":
      return l.rings * 2;
    case "sorter":
      return l.shapes.length * 1.5 + l.shapes.length * l.perShape * 0.5;
    case "things":
      return l.things.length + l.baskets.length * 1.5 + 2;
    case "order":
      return l.count * 2.5 + (l.dir === "down" ? 1 : 0) + (l.dim === "size" ? 0 : 1);
    case "sort2":
      return l.bins.length * 1.5 + l.bins.length * l.per * 0.5;
    case "pick": {
      const sp = l.spec;
      const r = (l.rounds - 4) * 0.25;
      switch (sp.kind) {
        case "compare":
          return sp.count * 2 + (sp.dims.length > 1 ? 2 : sp.dims[0] === "size" ? 0 : sp.dims[0] === "thick" ? 1.5 : 1) + (sp.want === "mix" ? 1.5 : 0) - 1.5 + r;
        case "same":
          return sp.options * 1.5 + { plain: 0, tint: 2, turn: 4 }[sp.variant] + r;
        case "odd":
          return sp.options * 1.5 + { shape: 0, tint: 0.5, size: 1, mix: 2.5 }[sp.by] + r;
        case "pattern":
          return sp.shown * 0.5 + { AB: 2, AAB: 3, ABB: 3, ABC: 4 }[sp.unit] + (sp.attr === "both" ? 2 : 0) + sp.options * 0.5 + r;
        case "fit":
          return sp.options * 1.5 + (sp.sizes ? 2 : 0) + r;
        case "corners":
          return sp.options + Math.max(...sp.shapes.map((s) => ({ triangle: 3, square: 4, rect: 4, rhombus: 4, pentagon: 5, hexagon: 6 })[s as "square"] ?? 4)) - 3 + 4 + r;
      }
    }
  }
}
