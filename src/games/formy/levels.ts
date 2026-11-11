import type { LevelInfo } from "../../shared/levelgame";
import type { ObjectId } from "../../shared/objects";
import type { Shape, Size } from "./logic";

export type ThingId = "coin" | "clock" | "ball" | "present" | "window" | "cube" | "pizza" | "flag" | "sign";

type Base = LevelInfo & { world: string; ask: string; done: string };
export type FamilyLevel = Base & { mode: "family"; sizes: Size[]; objects: ObjectId[] };
export type PyramidLevel = Base & { mode: "pyramid"; rings: number };
export type SorterLevel = Base & { mode: "sorter"; shapes: Shape[]; perShape: number };
export type ThingsLevel = Base & { mode: "things"; baskets: Shape[]; things: { id: ThingId; shape: Shape }[] };
export type FormLevel = FamilyLevel | PyramidLevel | SorterLevel | ThingsLevel;

export const worlds = [
  { id: "size", title: "Большой и маленький", color: "#ff8a3d" },
  { id: "shape", title: "Формы", color: "#9b6cd8" },
  { id: "mix", title: "Всё вместе", color: "#6db3d4" },
];

export const levels: FormLevel[] = [
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
