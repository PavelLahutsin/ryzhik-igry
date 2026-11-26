import type { LevelInfo } from "../../shared/levelgame";
import type { CountThing } from "./things";

/**
 * v23 «Сколько?» (in «Цифры и буквы»): count the things and tap the number;
 * «Где больше?»: tap the pile with more (or less). Data: Astra, brief 23-1/2,
 * with fixes — the new counting things (ladybugs, buttons, acorns…) used,
 * titles that match the picture, «Где меньше?» starting with a big
 * difference again (it is a new question), «у ёлки» cut from a 4-word title.
 */
export type CountLevel = LevelInfo & {
  world: "skolko";
  mode: "count";
  things: CountThing[];
  min: number;
  max: number;
  options: 2 | 3 | 4;
  layout: "row" | "dice" | "scatter";
  mixKinds: boolean;
  rounds: number;
  ask: string;
  done: string;
};
export type MoreLevel = LevelInfo & {
  world: "bolshe";
  mode: "more";
  want: "more" | "less";
  pairs: [number, number][];
  things: CountThing[];
  same: boolean;
  bigFew: boolean;
  ask: string;
  done: string;
};
export type SkolkoLevel = CountLevel | MoreLevel;

export const SKOLKO_WORLDS = [
  { id: "skolko", title: "Сколько?", color: "#2f9e8f" },
  { id: "bolshe", title: "Где больше?", color: "#e0884a" },
];

const C = (id: string, title: string, things: CountThing[], min: number, max: number, options: 2 | 3 | 4, layout: CountLevel["layout"], rounds: number, ask: string, done: string): CountLevel => ({
  // «sc…»: «Цифры и буквы» already has c1… (lowercase letters).
  id: `s${id}`,
  world: "skolko",
  mode: "count",
  title,
  things,
  min,
  max,
  options,
  layout,
  mixKinds: things.length > 1,
  rounds,
  ask,
  done,
});

export const COUNT_LEVELS: CountLevel[] = [
  C("c1", "Яблочки на столе", ["apple"], 1, 2, 2, "row", 4, "Посчитай яблочки и нажми ответ.", "Получилось!"),
  C("c2", "Весёлые мячики", ["ball"], 1, 2, 2, "row", 4, "Сколько мячиков? Нажми ответ.", "Ура!"),
  C("c3", "Жёлуди", ["acorn"], 1, 3, 2, "row", 4, "Посчитай жёлуди и нажми ответ.", "Здорово!"),
  C("c4", "Божьи коровки", ["ladybug"], 1, 3, 2, "dice", 4, "Сколько божьих коровок? Нажми ответ.", "Отлично!"),
  C("c5", "Рыбёшки", ["fish"], 1, 3, 3, "dice", 5, "Посчитай рыбок и нажми ответ.", "Получилось!"),
  C("c6", "Полёт шариков", ["balloon"], 1, 3, 3, "scatter", 5, "Сколько шариков? Нажми ответ.", "Ура!"),
  C("c7", "Чашки для чая", ["cup"], 1, 4, 3, "row", 5, "Посчитай чашки и нажми ответ.", "Здорово!"),
  C("c8", "Клубничка", ["strawberry"], 1, 5, 3, "row", 5, "Сколько клубничек? Нажми ответ.", "Отлично!"),
  C("c9", "Пуговицы", ["button"], 1, 5, 3, "dice", 5, "Посчитай пуговицы и нажми ответ.", "Получилось!"),
  C("c10", "Бабочки на лугу", ["butterfly"], 1, 5, 3, "scatter", 5, "Сколько бабочек? Нажми ответ.", "Ура!"),
  C("c11", "Всё из сада", ["apple", "pear"], 2, 5, 3, "scatter", 5, "Сколько яблок и груш вместе?", "Здорово!"),
  C("c12", "Пёстрая полянка", ["flower", "mushroom"], 2, 5, 4, "scatter", 5, "Сколько цветов и грибов вместе?", "Отлично!"),
  C("c13", "Ракушки", ["shell"], 3, 6, 4, "row", 5, "Посчитай ракушки и нажми ответ.", "Получилось!"),
  C("c14", "Разноцветные кубики", ["cube"], 3, 7, 4, "dice", 5, "Сколько кубиков? Нажми ответ.", "Ура!"),
  C("c15", "Весёлый дождик", ["drop"], 3, 8, 4, "scatter", 6, "Посчитай капельки и нажми ответ.", "Здорово!"),
  C("c16", "Улитки и бабочки", ["snail", "butterfly"], 3, 9, 4, "scatter", 6, "Сколько их вместе? Нажми ответ.", "Отлично!"),
  C("c17", "Фруктовый пир", ["apple", "pear", "banana"], 3, 10, 4, "scatter", 6, "Посчитай все фрукты и нажми ответ.", "Получилось!"),
  C("c18", "Всё для игры", ["ball", "car", "cube"], 5, 10, 4, "scatter", 6, "Сколько всего игрушек? Нажми ответ.", "Ура!"),
];

const M = (id: string, title: string, want: "more" | "less", pairs: [number, number][], things: CountThing[], bigFew: boolean, done: string): MoreLevel => ({
  id: `s${id}`,
  world: "bolshe",
  mode: "more",
  title,
  want,
  pairs,
  things,
  same: things.length === 1,
  bigFew,
  ask: want === "more" ? "Где больше? Нажми!" : "Где меньше? Нажми!",
  done,
});

export const MORE_LEVELS: MoreLevel[] = [
  M("g1", "Яблоки под ёлкой", "more", [[1, 5], [5, 1], [5, 1], [1, 5]], ["apple"], false, "Получилось!"),
  M("g2", "Весёлые мячи", "more", [[5, 1], [2, 6], [1, 5], [6, 2]], ["ball"], false, "Ура!"),
  M("g3", "Жёлуди под дубом", "more", [[2, 6], [5, 2], [6, 2], [3, 6]], ["acorn"], false, "Здорово!"),
  M("g4", "Звёздное небо", "more", [[6, 3], [2, 5], [3, 6], [7, 4]], ["star"], false, "Отлично!"),
  M("g5", "Чашки на полке", "more", [[3, 6], [7, 4], [4, 7], [6, 4]], ["cup"], false, "Ура!"),
  M("g6", "Зелёный сад", "more", [[7, 4], [6, 4], [4, 7], [5, 7]], ["apple", "pear"], false, "Получилось!"),
  M("g7", "Тёплый дождик", "more", [[4, 7], [7, 5], [6, 8], [6, 4]], ["drop", "umbrella"], true, "Здорово!"),
  M("g8", "Лёгкий ветерок", "more", [[7, 5], [5, 7], [6, 8], [8, 6]], ["balloon", "kite"], true, "Отлично!"),
  M("g9", "Бабочки и улитки", "more", [[5, 7], [8, 6], [7, 5], [6, 7]], ["butterfly", "snail"], true, "Получилось!"),
  M("g10", "Лодки на озёрах", "more", [[8, 6], [6, 7], [6, 8], [8, 7]], ["boat", "fish"], true, "Ура!"),
  M("g11", "Пёстрые кубики", "less", [[2, 6], [6, 2], [1, 4], [5, 2]], ["cube"], false, "Здорово!"),
  M("g12", "Весёлый гараж", "less", [[3, 6], [6, 3], [2, 5], [6, 4]], ["car", "cube"], true, "Отлично!"),
  M("g13", "Спелый урожай", "less", [[4, 6], [7, 4], [5, 7], [6, 4]], ["carrot", "pear"], true, "Получилось!"),
  M("g14", "Домики и листики", "less", [[6, 8], [8, 5], [5, 7], [7, 6]], ["house", "leaf"], true, "Здорово!"),
  M("g15", "Солнце и звёзды", "less", [[7, 8], [9, 7], [8, 9], [9, 8]], ["sun", "star"], true, "Ура!"),
];

export const SKOLKO_LEVELS: SkolkoLevel[] = [...COUNT_LEVELS, ...MORE_LEVELS];
