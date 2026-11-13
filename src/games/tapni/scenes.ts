import { OBJECTS, type ObjectId } from "../../shared/objects";
import type { SoundKind } from "../../shared/sounds";
import type { Motion, Touchable } from "../../shared/toys";
import { SHAPES } from "../teni/shapes";

/**
 * «Тапни и послушай»: calm scenes where every thing answers a touch with its
 * sound, a little move and a word. No tasks, no score, nothing goes wrong.
 * Pictures are the shared objects and the «Тени» pictures.
 */
type Spot = Touchable & { x: number; y: number };
export type TapScene = { id: string; title: string; icon: string; spots: Spot[] };

const art = (id: string): { name: string; svg: string } => OBJECTS[id as ObjectId] ?? SHAPES[id]!;
const named: Record<string, string> = { cat: "Котик", bird: "Птичка", tree: "Дерево" };
const t = (id: string, sound: SoundKind, motion: Motion, word: string, x = 0, y = 0): Spot => ({
  id,
  name: named[id] ?? art(id).name,
  svg: art(id).svg,
  sound,
  motion,
  word,
  x,
  y,
});

export const SCENES: TapScene[] = [
  {
    id: "les",
    title: "Лес",
    icon: SHAPES.tree!.svg,
    spots: [
      t("tree", "rustle", "swing", "Шур-шур!", 18, 22),
      t("owl", "owl", "wobble", "Ух-ух!", 50, 18),
      t("bird", "tweet", "hop", "Чик-чирик!", 82, 24),
      t("butterfly", "whoosh", "float", "Порх-порх!", 30, 50),
      t("rabbit", "boing", "hop", "Прыг-скок!", 70, 50),
      t("mushroom", "pop", "squash", "Пум!", 18, 78),
      t("snail", "rustle", "wobble", "Ползу-ползу", 50, 80),
      t("frog", "frog", "hop", "Ква-ква!", 82, 78),
    ],
  },
  {
    id: "kuhnya",
    title: "Кухня",
    icon: SHAPES.teapot!.svg,
    spots: [
      t("clock", "click", "shake", "Тик-так!", 18, 20),
      t("lamp", "click", "swing", "Щёлк!", 50, 18),
      t("teapot", "bubble", "shake", "Буль-буль!", 82, 22),
      t("cup", "ding", "wobble", "Дзынь!", 28, 50),
      t("glass", "pour", "wobble", "Буль!", 72, 50),
      t("apple", "munch", "squash", "Хрум!", 18, 80),
      t("spoon", "clack", "spin", "Динь!", 50, 80),
      t("egg", "pop", "wobble", "Тук-тук!", 82, 80),
    ],
  },
  {
    id: "dvor",
    title: "Двор",
    icon: SHAPES.dog!.svg,
    spots: [
      t("sun", "sparkle", "spin", "Тепло!", 18, 18),
      t("bell", "ding", "swing", "Динь-дон!", 50, 18),
      t("kite", "whoosh", "float", "Ввысь!", 82, 20),
      t("cat", "meow", "wobble", "Мяу!", 25, 50),
      t("dog", "woof", "hop", "Гав-гав!", 75, 50),
      t("car", "honk", "shake", "Би-бип!", 18, 80),
      t("bicycle", "ding", "shake", "Дзынь-дзынь!", 50, 80),
      t("tractor", "chug", "shake", "Тр-р-р!", 82, 80),
    ],
  },
];

/** «Потрогай»: toys that wobble and bounce; also the break between levels. */
export const TOYS: Touchable[] = [
  t("ball", "boing", "bounce", "Прыг!"),
  t("drum", "thump", "shake", "Бум-бум!"),
  t("top", "whoosh", "spin", "Ж-ж-ж!"),
  t("balloon", "whoosh", "float", "Лети!"),
  t("rattle", "clack", "shake", "Тр-р!"),
  t("robot", "beep", "hop", "Бип-буп!"),
  t("pyramid", "note", "wobble", "Ля-ля!"),
  t("matryoshka", "clack", "wobble", "Тук!"),
  t("teddy", "boing", "squash", "Обнимашки!"),
];

/** Every thing that can be touched, for «Найдено x из y» on the home tile. */
export function allFinds(): string[] {
  return [...SCENES.flatMap((s) => s.spots.map((p) => `${s.id}:${p.id}`)), ...TOYS.map((p) => `toys:${p.id}`)];
}
