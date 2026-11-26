import { OBJECTS, type ObjectId } from "../../shared/objects";
import type { SoundKind } from "../../shared/sounds";
import type { Motion, Touchable } from "../../shared/toys";
import { SHAPES } from "../teni/shapes";

/**
 * «Тапни и послушай»: calm scenes where every thing answers a touch with its
 * sound, a little move and a word. No tasks, no score, nothing goes wrong.
 * Pictures are the shared objects, the «Тени» pictures, or a local EXTRA set for a new theme.
 */
type Spot = Touchable & { x: number; y: number };
export type TapScene = { id: string; title: string; icon: string; spots: Spot[] };

const EXTRA: Record<string, { name: string; svg: string }> = {
  fish: { name: "Рыбка", svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#f39758" d="M33 49L11 32Q6 48 11 68L33 55Z"/><path fill="#ffc561" d="M26 51Q40 18 70 31Q84 36 91 50Q81 72 59 74Q38 75 26 51Z"/><path fill="#ee9258" d="M53 50Q47 49 40 54Q45 62 55 60Z"/><path fill="none" d="M79 56Q84 59 88 54"/><circle cx="73" cy="44" r="3" fill="#3b2e25"/></g></svg>` },
  jelly: { name: "Медуза", svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#f5a4aa" d="M26 49Q20 62 27 69Q32 75 26 79Q24 85 31 84Q44 77 36 64Q32 58 38 51ZM47 50Q40 65 47 74Q51 80 47 85Q46 90 52 88Q63 79 55 68Q51 61 58 51ZM67 51Q61 61 69 69Q75 75 70 79Q68 84 75 82Q86 74 78 64Q73 58 78 51Z"/><path fill="#efb6d2" d="M14 52C15 27 31 13 50 13S85 27 86 52Q80 62 72 54Q64 63 56 55Q48 64 40 55Q31 63 24 54Q18 60 14 52Z"/><path fill="none" d="M27 38Q31 28 42 25"/></g></svg>` },
  lighthouse: { name: "Маяк", svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#fff0cf" d="M39 40H61L71 88H29Z"/><path fill="#e98168" d="M36 55H64L67 69H33Z"/><path fill="#ffd66f" d="M36 22H64V41H36Z"/><path fill="#e98168" d="M30 23L50 8L70 23Z"/><path fill="none" d="M50 25V39M31 41H69M24 88H76"/><path fill="#977259" d="M45 87V79A5 5 0 0 1 55 79V87Z"/></g></svg>` },
  wave: { name: "Волна", svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#65c9c2" d="M9 66Q25 65 34 44C43 21 63 13 82 28C65 26 57 41 65 54Q74 68 91 57Q84 82 56 83Q29 85 9 72Z"/><path fill="#fff1d5" d="M34 44C43 21 63 13 82 28C71 27 64 33 62 42Q55 48 52 40Q46 48 43 42Q38 49 34 44Z"/><path fill="none" d="M27 70Q40 66 46 55"/></g></svg>` },
  dolphin: { name: "Дельфин", svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#86c4d6" d="M15 66Q17 48 34 37Q35 27 28 19Q44 19 51 31C66 25 81 31 83 43L92 47Q97 53 84 54Q70 64 55 61Q52 72 40 75Q43 67 42 61Q28 60 21 69Q20 80 10 84Q13 76 11 72Q5 70 4 62Q11 62 15 66Z"/><circle cx="74" cy="42" r="2.5" fill="#3b2e25"/><path fill="none" d="M77 51Q81 54 85 53"/></g></svg>` },
  shell: { name: "Ракушка", svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#f5b198" d="M40 79C29 73 9 59 10 45Q10 35 20 34Q18 22 31 23Q36 11 48 19Q59 9 68 22Q81 18 83 32Q94 34 90 48Q87 63 59 79L61 86H38Z"/><path fill="none" d="M21 39Q26 56 43 72M33 29L46 69M50 25V68M66 28L54 69M80 38Q72 58 58 72"/></g></svg>` },
  crab: { name: "Крабик", svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="none" d="M33 59L18 57L10 64M33 65L19 68L14 76M67 59L82 57L90 64M67 65L81 68L86 76"/><path fill="#f18b67" d="M31 55Q19 53 15 46Q4 42 8 26L17 34L22 22Q34 32 23 44L35 48ZM69 55Q81 53 85 46Q96 42 92 26L83 34L78 22Q66 32 77 44L65 48Z"/><ellipse cx="50" cy="58" rx="26" ry="17" fill="#ffa17b"/><circle cx="41" cy="44" r="5" fill="#fff1d5"/><circle cx="59" cy="44" r="5" fill="#fff1d5"/><path fill="none" d="M41 44h.1M59 44h.1M44 60Q50 66 56 60"/></g></svg>` },
  starfish: { name: "Морская звезда", svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#f5ab63" d="M46 15Q50 6 54 16L61 38L84 36Q96 35 87 45L69 59L77 81Q80 92 69 86L50 72L31 86Q20 92 23 81L31 59L13 45Q4 35 16 36L39 38Z"/><g fill="#d98054" stroke="none"><circle cx="50" cy="31" r="3"/><circle cx="30" cy="46" r="3"/><circle cx="70" cy="46" r="3"/><circle cx="36" cy="71" r="3"/><circle cx="64" cy="71" r="3"/><circle cx="50" cy="53" r="5"/></g></g></svg>` },
  crown: { name: "Корона", svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#ffd66f" d="M14 70L20 34L36 54L50 22L64 54L80 34L86 70Z"/><path fill="#f5a623" d="M14 70H86V82H14Z"/><circle cx="20" cy="34" r="6" fill="#e98168"/><circle cx="50" cy="22" r="6" fill="#e98168"/><circle cx="80" cy="34" r="6" fill="#65c9c2"/></g></svg>` },
  guitar: { name: "Гитара", svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="36" cy="66" rx="24" ry="26" fill="#e8a05a"/><ellipse cx="36" cy="66" rx="9" ry="9" fill="#fff1d5"/><path fill="#d08948" d="M44 46L84 16L90 24L50 54Z"/><path fill="none" d="M49 50L86 22M52 54L88 26"/><circle cx="36" cy="66" r="3" fill="#3b2e25"/><path fill="#3b2e25" d="M84 16L92 12L96 18L90 24Z"/></g></svg>` },
};
const art = (id: string): { name: string; svg: string } => EXTRA[id] ?? OBJECTS[id as ObjectId] ?? SHAPES[id]!;
const named: Record<string, string> = { cat: "Котик", bird: "Птичка", tree: "Дерево", cloud: "Тучка", moon: "Месяц" };
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

/**
 * v22: one theme per tab, so a child finds the animals with the animals and
 * the cars with the cars (before, the dog, the car and the bicycle shared
 * «Двор» and the owl lived in «Лес»). Only things with a drawn picture and a
 * sound of their own; animals without a sound yet (утёнок, курочка, мышка,
 * слон…) wait for their sound.
 */
export const SCENES: TapScene[] = [
  {
    id: "zhivotnye",
    title: "Животные",
    icon: SHAPES.cat!.svg,
    spots: [
      t("cat", "meow", "wobble", "Мяу!", 18, 22),
      t("dog", "woof", "hop", "Гав-гав!", 50, 20),
      t("bird", "tweet", "hop", "Чик-чирик!", 82, 22),
      t("owl", "owl", "wobble", "Ух-ух!", 28, 50),
      t("frog", "frog", "hop", "Ква-ква!", 72, 50),
      t("rabbit", "boing", "hop", "Прыг-скок!", 18, 80),
      t("butterfly", "whoosh", "float", "Порх-порх!", 50, 78),
      t("snail", "rustle", "wobble", "Ползу-ползу", 82, 80),
    ],
  },
  {
    id: "transport",
    title: "Транспорт",
    icon: OBJECTS.car.svg,
    spots: [
      t("plane", "whoosh", "float", "Вжу-у-ух!", 18, 20),
      t("rocket", "rocket", "float", "Пуск!", 50, 18),
      t("boat", "splash", "wobble", "Плюх!", 82, 20),
      t("car", "honk", "shake", "Би-бип!", 28, 50),
      t("bus", "honk", "shake", "Би-би!", 72, 50),
      t("train", "toot", "shake", "Ту-ту!", 18, 80),
      t("tractor", "chug", "shake", "Тр-р-р!", 50, 80),
      t("bicycle", "ding", "shake", "Дзынь-дзынь!", 82, 80),
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
    id: "priroda",
    title: "Природа",
    icon: SHAPES.tree!.svg,
    spots: [
      t("sun", "sparkle", "spin", "Тепло!", 18, 18),
      t("cloud", "whoosh", "float", "Ву-у-ух!", 50, 20),
      t("moon", "note", "swing", "Баю-бай!", 82, 20),
      t("tree", "rustle", "swing", "Шур-шур!", 25, 50),
      t("flower", "magic", "wobble", "Расцвёл!", 75, 50),
      t("mushroom", "pop", "squash", "Пум!", 18, 80),
      t("leaf", "rustle", "float", "Шурх!", 50, 80),
      t("drop", "drip", "hop", "Кап-кап!", 82, 80),
    ],
  },
  {
    id: "more",
    title: "Море",
    icon: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#65c9c2" d="M9 66Q25 65 34 44C43 21 63 13 82 28C65 26 57 41 65 54Q74 68 91 57Q84 82 56 83Q29 85 9 72Z"/><path fill="#fff1d5" d="M34 44C43 21 63 13 82 28C71 27 64 33 62 42Q55 48 52 40Q46 48 43 42Q38 49 34 44Z"/></g></svg>`,
    spots: [
      t("fish", "bubble", "wobble", "Буль-буль!", 18, 18),
      t("jelly", "boing", "float", "Пруг-пруг!", 50, 18),
      t("lighthouse", "sparkle", "swing", "Миг-миг!", 82, 18),
      t("wave", "whoosh", "swing", "Ш-ш-ш!", 32, 50),
      t("dolphin", "splash", "hop", "Плюх!", 68, 50),
      t("shell", "rustle", "wobble", "Шур-шур!", 18, 82),
      t("crab", "clack", "shake", "Клац-клац!", 50, 82),
      t("starfish", "pop", "spin", "Оп-ля!", 82, 82),
    ],
  },
  {
    id: "prazdnik",
    title: "Праздник",
    icon: OBJECTS.balloon.svg,
    spots: [
      t("balloon", "whoosh", "float", "Фью-у!", 18, 18),
      t("star", "sparkle", "spin", "Дзинь!", 50, 18),
      t("crown", "ding", "wobble", "Динь!", 82, 18),
      t("guitar", "note", "swing", "Трень!", 32, 50),
      t("drum", "thump", "bounce", "Бум-бум!", 68, 50),
      t("candy", "rustle", "shake", "Шур-шур!", 18, 82),
      t("cake1", "yum", "squash", "Ням-ням!", 50, 82),
      t("grapes", "pop", "hop", "Чпок!", 82, 82),
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
