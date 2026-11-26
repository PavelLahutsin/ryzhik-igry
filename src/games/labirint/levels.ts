import type { LevelInfo } from "../../shared/levelgame";
import { inWorldOrder } from "../../shared/order";

export type LabLevel = LevelInfo & {
  cols: number;
  rows: number;
  /** Who waits at the exit (character key). */
  goal: string;
  /** Apples to pick up on the way. */
  apples: number;
  /** Line on the praise card. */
  done: string;
};

export const worlds = [
  { id: "home", title: "Домой", color: "#7cc46a" },
  { id: "guests", title: "В гости", color: "#ffb23f" },
  { id: "forest", title: "Лесные тропинки", color: "#6fbf4a" },
  { id: "big", title: "Большие лабиринты", color: "#9b8cf0" },
];

/** 3×3 → 8×9. Apples come in from the middle world. */
const ALL: LabLevel[] = [
  { id: "l1", world: "home", title: "К маме", cols: 3, rows: 3, goal: "mama", apples: 0, done: "Рыжик рядом с мамой!" },
  { id: "l2", world: "home", title: "К папе", cols: 3, rows: 4, goal: "papa", apples: 0, done: "Рыжик рядом с папой!" },
  { id: "l3", world: "home", title: "Домой", cols: 4, rows: 4, goal: "mama", apples: 0, done: "Мама ждала Рыжика!" },
  { id: "l4", world: "home", title: "К белочке", cols: 4, rows: 5, goal: "belka", apples: 0, done: "Белочка рада Рыжику!" },
  { id: "l5", world: "guests", title: "К ёжику", cols: 5, rows: 5, goal: "ezhik", apples: 0, done: "Ёжик встретил Рыжика!" },
  { id: "l6", world: "guests", title: "Яблоко для мишки", cols: 5, rows: 6, goal: "mishka", apples: 1, done: "Мишка любит яблоки!" },
  { id: "l7", world: "guests", title: "Яблоки для белочки", cols: 5, rows: 6, goal: "belka", apples: 2, done: "Белочка говорит: спасибо!" },
  { id: "l19", world: "guests", title: "К мишке в гости", cols: 5, rows: 7, goal: "mishka", apples: 2, done: "Рыжик принёс мишке два яблока!" },
  { id: "l8", world: "guests", title: "Гостинцы ёжику", cols: 6, rows: 7, goal: "ezhik", apples: 3, done: "Ёжик угостит друзей!" },
  { id: "l9", world: "big", title: "Длинная дорожка", cols: 7, rows: 7, goal: "mishka", apples: 3, done: "Какая длинная дорожка!" },
  { id: "l22", world: "big", title: "По дорожке к маме", cols: 7, rows: 7, goal: "mama", apples: 3, done: "Мама обняла Рыжика в конце дорожки!" },
  { id: "l27", world: "big", title: "Мамины оладушки", cols: 7, rows: 7, goal: "mama", apples: 3, done: "Мама испекла для Рыжика яблочные оладушки!" },
  { id: "l17", world: "big", title: "Яблоки для ёжика", cols: 7, rows: 8, goal: "ezhik", apples: 3, done: "Ёжик дождался Рыжика!" },
  { id: "l10", world: "big", title: "Яблоки для мамы", cols: 7, rows: 8, goal: "mama", apples: 3, done: "Мама испечёт пирог!" },
  { id: "l28", world: "big", title: "К папе на пруд", cols: 7, rows: 8, goal: "papa", apples: 3, done: "Папа и Рыжик пустили кораблик!" },
  { id: "l11", world: "big", title: "Яблоки для папы", cols: 7, rows: 8, goal: "papa", apples: 4, done: "Папа гордится Рыжиком!" },
  { id: "l23", world: "big", title: "Папа у мостика", cols: 7, rows: 8, goal: "papa", apples: 4, done: "Папа и Рыжик встретились у мостика!" },
  { id: "l29", world: "big", title: "К мишке за мёдом", cols: 7, rows: 8, goal: "mishka", apples: 4, done: "Мишка поделился с Рыжиком мёдом!" },
  { id: "l24", world: "big", title: "К мишке на пикник", cols: 8, rows: 8, goal: "mishka", apples: 4, done: "Рыжик и мишка хрустят яблоками!" },
  { id: "l30", world: "big", title: "Качели для двоих", cols: 8, rows: 8, goal: "belka", apples: 4, done: "Рыжик и белочка качаются вместе!" },
  { id: "l12", world: "big", title: "Большой лабиринт", cols: 8, rows: 9, goal: "mama", apples: 5, done: "Рыжик у выхода из большого лабиринта!" },
  { id: "l18", world: "big", title: "Самый длинный путь", cols: 8, rows: 9, goal: "papa", apples: 5, done: "Папа встретил Рыжика у выхода!" },
  { id: "l13", world: "forest", title: "К белочке в дупло", cols: 6, rows: 7, goal: "belka", apples: 3, done: "Белочка угостит Рыжика орешками!" },
  { id: "l20", world: "forest", title: "К ёжику через кусты", cols: 6, rows: 7, goal: "ezhik", apples: 3, done: "Ёжик выглянул из кустов навстречу Рыжику!" },
  { id: "l25", world: "forest", title: "Белочкины орешки", cols: 6, rows: 7, goal: "belka", apples: 3, done: "Белочка угостила Рыжика орешком!" },
  { id: "l14", world: "forest", title: "Мишкина поляна", cols: 6, rows: 8, goal: "mishka", apples: 3, done: "Мишка рад яблокам!" },
  { id: "l21", world: "forest", title: "К белочке под ёлку", cols: 6, rows: 8, goal: "belka", apples: 3, done: "Белочка ждала Рыжика под ёлкой!" },
  { id: "l15", world: "forest", title: "Ёжикина тропинка", cols: 7, rows: 7, goal: "ezhik", apples: 3, done: "Ёжик собрал яблоки на иголки!" },
  // v22
  { id: "l16", world: "forest", title: "Через лесок", cols: 7, rows: 7, goal: "mishka", apples: 3, done: "Мишка ждал Рыжика на опушке!" },
  { id: "l26", world: "forest", title: "С ёжиком за грибами", cols: 7, rows: 7, goal: "ezhik", apples: 3, done: "Ёжик и Рыжик нашли гриб под ёлкой!" },
];

/** Easier extra worlds sit where their difficulty fits, so levels keep getting harder. */
export const levels: LabLevel[] = inWorldOrder(ALL, worlds.map((w) => w.id));
