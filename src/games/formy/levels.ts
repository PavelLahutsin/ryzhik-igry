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
  { id: "f1", world: "shape", mode: "sorter", title: "Круг и квадрат", shapes: ["circle", "square"], perShape: 2, ask: "Найди такую же форму", done: "Все фигурки в коробке!" },
  { id: "f2", world: "shape", mode: "sorter", title: "Три фигуры", shapes: ["circle", "square", "triangle"], perShape: 2, ask: "Круг, квадрат, треугольник — опусти в своё окошко.", done: "Все фигуры в своих окошках!" },
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
  { id: "f6", world: "shape", mode: "sorter", title: "Шесть фигур", shapes: ["circle", "square", "triangle", "star", "heart", "rhombus"], perShape: 1, ask: "Шесть окошек — шесть фигур. Ромб похож на воздушного змея!", done: "Все шесть фигур на месте!" },
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
    done: "Вот толстая книга, а вот тонкая!",
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
  { id: "d4", world: "logic", mode: "pick", title: "Найди лишнее", spec: { kind: "odd", options: 5, shapes: ALL, by: "mix" }, rounds: 6, ask: "Что лишнее: форма, цвет или размер?", done: "Зоркий глаз! Всё лишнее найдено!" },
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

/** v22: more levels in every world — new things, new shapes, longer rows. */
const MORE: FormLevel[] = [
  {
    id: "n1",
    world: "size",
    mode: "pick",
    title: "Где маленькое?",
    spec: { kind: "compare", dims: ["size"], count: 2, want: "least", things: ["mushroom", "boat", "kite", "cube"] },
    rounds: 4,
    ask: "Нажми на маленькое!",
    done: "Маленькое нашлось!",
  },
  { id: "n2", world: "size", mode: "order", title: "Машинки", dim: "size", count: 3, dir: "down", object: "car", ask: "Поставь машинки: от большой к маленькой.", done: "Машинки стоят по порядку!" },
  {
    id: "n3",
    world: "size",
    mode: "family",
    title: "Морковка и грибок",
    sizes: ["big", "mid", "small"],
    objects: ["carrot", "mushroom", "flower"],
    ask: "Раздай по размеру: большое — папе, среднее — маме, маленькое — Рыжику.",
    done: "Каждому — по размеру!",
  },
  {
    id: "n4",
    world: "measure",
    mode: "pick",
    title: "Самый короткий",
    spec: { kind: "compare", dims: ["length"], count: 3, want: "least" },
    rounds: 4,
    ask: "Нажми на самый короткий карандаш!",
    done: "Самый короткий найден!",
  },
  { id: "n5", world: "measure", mode: "order", title: "Ёлочки вниз", dim: "height", count: 4, dir: "down", ask: "Расставь ёлочки: от высокой к низкой.", done: "Ёлочки по порядку!" },
  { id: "n6", world: "measure", mode: "order", title: "Пять карандашей", dim: "length", count: 5, dir: "down", ask: "Разложи карандаши: от длинного к короткому.", done: "Карандаши лесенкой вниз!" },
  {
    id: "n7",
    world: "shape",
    mode: "pick",
    title: "Найди пару",
    spec: { kind: "same", options: 4, shapes: ALL, variant: "plain" },
    rounds: 5,
    ask: "Найди внизу такую же фигуру. Тут есть и новые!",
    done: "Все пары нашлись!",
  },
  { id: "n8", world: "shape", mode: "sorter", title: "Овал и прямоугольник", shapes: ["oval", "rect", "circle", "square"], perShape: 1, ask: "Новые фигуры: овал и прямоугольник! Найди им окошки.", done: "Все фигуры в окошках!" },
  { id: "n9", world: "logic", mode: "pick", title: "Какая не такая?", spec: { kind: "odd", options: 4, shapes: ALL, by: "shape" }, rounds: 5, ask: "Одна фигура другой формы. Какая?", done: "Лишняя фигура найдена!" },
  { id: "n10", world: "logic", mode: "pick", title: "Цветные бусинки", spec: { kind: "pattern", shown: 6, unit: "AB", attr: "tint", options: 3, shapes: SIX }, rounds: 5, ask: "Цвета идут по очереди. Какая бусинка следующая?", done: "Бусы по порядку!" },
  { id: "n11", world: "logic", mode: "pick", title: "Самый хитрый узор", spec: { kind: "pattern", shown: 6, unit: "ABC", attr: "both", options: 4, shapes: ALL }, rounds: 6, ask: "Три фигуры по очереди, и цвет тоже меняется. Что дальше?", done: "Самый хитрый узор разгадан!" },
  { id: "n12", world: "mix", mode: "pick", title: "Пять фигурок", spec: { kind: "fit", options: 5, shapes: ALL, sizes: true }, rounds: 6, ask: "Пять фигурок, одно окошко. Какая пролезет как раз?", done: "Как раз впору!" },
  {
    id: "n13",
    world: "mix",
    mode: "sort2",
    title: "Сердечки и кружки",
    bins: [
      { shape: "heart", tint: "purple" },
      { shape: "heart", tint: "orange" },
      { shape: "circle", tint: "purple" },
      { shape: "circle", tint: "orange" },
    ],
    per: 2,
    ask: "Фиолетовое сердечко — к фиолетовому сердечку. Смотри на цвет и на форму!",
    done: "Цвет и форма совпали!",
  },
  // v22: 10 new levels from Astra (n14–n23).
  { id: "n14", world: "shape", mode: "pick", title: "По контуру", spec: { kind: "fit", options: 3, shapes: ["oval", "rect", "pentagon", "hexagon"], sizes: false }, rounds: 4, ask: "Посмотри на контур. Какая фигура точно в него войдёт?", done: "Для каждого контура нашлась своя фигурка!" },
  { id: "n15", world: "logic", mode: "pick", title: "Три похожи", spec: { kind: "odd", options: 4, shapes: ["oval", "circle", "rect", "square", "pentagon", "hexagon"], by: "shape" }, rounds: 4, ask: "У трёх фигур форма одинаковая. Найди четвёртую!", done: "У каждой четвёрки нашлась фигурка другой формы!" },
  { id: "n16", world: "mix", mode: "pick", title: "Уголки по счёту", spec: { kind: "corners", shapes: ["triangle", "rect", "pentagon", "hexagon"], options: 4 }, rounds: 4, ask: "Веди пальчиком от уголка к уголку и считай. Какая фигура подойдёт?", done: "Все уголки сочтены, все фигуры найдены!" },
  { id: "n17", world: "measure", mode: "pick", title: "Сравни и выбери", spec: { kind: "compare", dims: ["length", "height"], count: 4, want: "mix" }, rounds: 5, ask: "Сравни все четыре предмета. Какой подойдёт под подсказку?", done: "Все нужные предметы нашлись — и вот ещё один!" },
  { id: "n18", world: "size", mode: "pyramid", title: "Семь колечек", rings: 7, ask: "Каждый раз бери самое большое из колечек, что ещё остались.", done: "Все семь колечек на месте, маленькое — на самой верхушке!" },
  { id: "n19", world: "shape", mode: "sorter", title: "У каждого своё окошко", shapes: ["oval", "rect", "pentagon", "hexagon"], perShape: 3, ask: "Подбери каждой фигурке своё окошко. Смотри на уголки и круглые бока!", done: "Каждая фигурка нашла своё окошко!" },
  { id: "n20", world: "logic", mode: "pick", title: "Тройка за тройкой", spec: { kind: "pattern", shown: 6, unit: "ABC", attr: "both", options: 4, shapes: ["oval", "rect", "pentagon", "hexagon"], }, rounds: 6, ask: "Посмотри на первые три фигурки, а потом ещё на три. Какая форма и какой цвет будут дальше?", done: "Цветные тройки повторяются снова и снова — всё по порядку!" },
  { id: "n21", world: "mix", mode: "sort2", title: "Зелёные и синие уголки", bins: [{ shape: "pentagon", tint: "green" }, { shape: "hexagon", tint: "green" }, { shape: "pentagon", tint: "blue" }, { shape: "hexagon", tint: "blue" }], per: 3, ask: "Сначала найди цвет фигурки: зелёный или синий. Теперь проверь, где столько же уголков!", done: "Зелёные и синие фигурки разложены по форме!" },
  { id: "n22", world: "measure", mode: "order", title: "Всё длиннее", dim: "length", count: 5, dir: "up", ask: "Начни с самого короткого предмета. Пусть каждый следующий будет ещё длиннее!", done: "Весь ряд на месте: дальше — всё длиннее!" },
  { id: "n23", world: "measure", mode: "order", title: "Ступеньки вниз", dim: "height", count: 6, dir: "down", ask: "Начни с самого высокого предмета. Поставь рядом тот, что пониже, а за ним — ещё ниже.", done: "Шесть предметов встали в ряд: всё ниже и ниже!" },
  // v22: 10 more from Astra (n24–n33). Titles n24 and n30 adapted to match the objects / option count.
  { id: "n24", world: "size", mode: "family", title: "Чашки и зонтики", sizes: ["big", "small"], objects: ["cup", "umbrella"], ask: "Дай папе большую чашку и большой зонтик, а Рыжику — маленькие.", done: "У каждого свой зонтик и своя чашка!" },
  { id: "n25", world: "size", mode: "order", title: "Парад корабликов", dim: "size", count: 4, dir: "up", object: "boat", ask: "Поставь кораблики в ряд: сначала самый маленький, потом всё больше.", done: "Самый большой кораблик замыкает ряд!" },
  { id: "n26", world: "measure", mode: "order", title: "Улица домиков", dim: "height", count: 5, dir: "up", object: "house", ask: "Начни с самого низкого домика. Ставь рядом домики всё выше.", done: "Все домики стоят по росту!" },
  { id: "n27", world: "measure", mode: "pick", title: "Кто тоньше всех?", spec: { kind: "compare", dims: ["thick"], count: 3, want: "least" }, rounds: 4, ask: "Найди самый тонкий предмет.", done: "Вот он, самый тонкий!" },
  { id: "n28", world: "shape", mode: "things", title: "Монетка и флажок", baskets: ["circle", "triangle"], things: [{ id: "coin", shape: "circle" }, { id: "flag", shape: "triangle" }, { id: "clock", shape: "circle" }, { id: "pizza", shape: "triangle" }], ask: "Положи круглые вещи в корзинку с кругом, а треугольные — в корзинку с треугольником.", done: "У каждой вещи своя корзинка!" },
  { id: "n29", world: "shape", mode: "sorter", title: "Ромб в гостях у квадрата", shapes: ["rhombus", "square"], perShape: 3, ask: "Положи каждый ромб в окошко с ромбом, а каждый квадрат — в окошко с квадратом.", done: "Ромбы и квадраты нашли свои окошки!" },
  { id: "n30", world: "logic", mode: "pick", title: "Одна среди пяти", spec: { kind: "odd", options: 5, shapes: ["circle", "triangle", "star", "square", "heart"], by: "shape" }, rounds: 4, ask: "Найди фигурку, которая по форме не похожа на остальные.", done: "У этой фигурки другая форма!" },
  { id: "n31", world: "logic", mode: "pick", title: "Две подряд, одна следом", spec: { kind: "pattern", shown: 6, unit: "AAB", attr: "shape", options: 3, shapes: ["star", "oval", "heart"] }, rounds: 5, ask: "Посмотри, как повторяются фигурки. Выбери следующую.", done: "Узор продолжается!" },
  { id: "n32", world: "mix", mode: "sort2", title: "Солнышки и звёзды", bins: [{ shape: "circle", tint: "yellow" }, { shape: "star", tint: "yellow" }, { shape: "circle", tint: "orange" }, { shape: "star", tint: "orange" }], per: 2, ask: "Положи каждый кружок и каждую звёздочку в коробку с такой же фигуркой такого же цвета.", done: "Кружки и звёздочки в своих коробках!" },
  { id: "n33", world: "mix", mode: "pick", title: "Цветные двойники", spec: { kind: "same", options: 4, shapes: ["heart", "rhombus", "oval", "triangle"], variant: "tint" }, rounds: 5, ask: "Найди фигурку такой же формы и такого же цвета, как образец.", done: "У фигурок совпали и форма, и цвет!" },
];

/** Play order inside each world: from easy to hard (see `difficulty`). */
const ORDER: Record<string, string[]> = {
  size: ["c1", "n1", "r1", "n24", "o1", "r3", "n2", "r2", "r7", "n25", "o2", "r4", "r6", "n3", "r5", "n18"],
  measure: ["m1", "m2", "m3", "n4", "n27", "m4", "n17", "m5", "n5", "m6", "n22", "n26", "n6", "n23"],
  shape: ["s1", "n14", "f1", "n29", "n7", "f2", "f4", "n8", "s2", "n28", "s3", "f6", "n19", "f3", "f5"],
  logic: ["d1", "q1", "n15", "n9", "n10", "d2", "q2", "d3", "n30", "n31", "q3", "q4", "d4", "n11", "n20"],
  mix: ["h1", "f7", "k1", "h2", "n33", "x1", "n13", "n12", "n32", "n16", "k2", "n21", "f8", "x2"],
};

const BY_ID = new Map([...FIRST, ...ADDED, ...MORE].map((l) => [l.id, l]));
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
