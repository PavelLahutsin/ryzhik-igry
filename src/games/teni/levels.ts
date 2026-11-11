import { CHARACTER_NAMES, characters } from "../../shared/assets";
import { OBJECTS, type ObjectId } from "../../shared/objects";
import type { LevelInfo } from "../../shared/levelgame";

export type TeniLevel = LevelInfo & {
  /** Drawn objects by id, or characters as "char:<id>". */
  items: string[];
  /** Extra shadows with no picture, for older kids. */
  decoys?: string[];
};

export const worlds = [
  { id: "easy", title: "Простые тени", color: "#7cc46a" },
  { id: "friends", title: "Чья тень?", color: "#f27aa0" },
  { id: "tricky", title: "Хитрые тени", color: "#9b8cf0" },
  { id: "more", title: "Ещё тени", color: "#6db3d4" },
];

/** Ids t1–t6 are the first version's levels, kept so saved stars stay. */
export const levels: TeniLevel[] = [
  { id: "t1", world: "easy", title: "Яблоко и звёздочка", items: ["apple", "star", "house"] },
  { id: "t2", world: "easy", title: "Шарик и рыбка", items: ["balloon", "fish", "car"] },
  { id: "t3", world: "easy", title: "Грибок и зонтик", items: ["mushroom", "kite", "sun", "umbrella"] },
  { id: "t7", world: "easy", title: "Вкусные тени", items: ["banana", "pear", "cherry", "carrot"] },
  { id: "t4", world: "friends", title: "Чья тень?", items: ["char:ryzhik", "char:mishka", "char:ezhik", "char:belka"] },
  { id: "t8", world: "friends", title: "Друзья и игрушки", items: ["char:belka", "char:papa", "ball", "boat"] },
  { id: "t6", world: "friends", title: "Вся семья", items: ["char:ryzhik", "char:mama", "char:papa", "char:mishka", "char:ezhik"] },
  { id: "t9", world: "friends", title: "Лишняя тень", items: ["char:ryzhik", "char:mama", "char:ezhik"], decoys: ["char:mishka"] },
  { id: "t5", world: "tricky", title: "Пять теней", items: ["carrot", "ball", "umbrella", "fish", "house"] },
  { id: "t10", world: "tricky", title: "Похожие", items: ["apple", "cherry", "pear", "ball", "balloon"] },
  { id: "t11", world: "tricky", title: "Шесть теней", items: ["leaf", "flower", "drop", "cup", "cube", "boat"] },
  { id: "t12", world: "tricky", title: "Лишние тени", items: ["sun", "star", "umbrella", "kite"], decoys: ["flower", "mushroom"] },
  { id: "t13", world: "more", title: "Друзья и фрукты", items: ["char:belka", "banana", "char:ezhik", "cherry"] },
  { id: "t14", world: "more", title: "В саду", items: ["flower", "leaf", "mushroom", "drop"], decoys: ["sun"] },
  { id: "t15", world: "more", title: "Все-все тени", items: ["char:papa", "char:mishka", "kite", "boat", "cup"], decoys: ["ball"] },
];

export function shadowCount(level: TeniLevel): number {
  return level.items.length + (level.decoys?.length ?? 0);
}

export type Thing = { id: string; name: string } & ({ kind: "svg"; svg: string } | { kind: "img"; src: string });

export function thing(id: string): Thing {
  if (id.startsWith("char:")) {
    const key = id.slice(5);
    const src = characters[key];
    if (!src) throw new Error(`Нет героя ${key}`);
    return { id, name: CHARACTER_NAMES[key] ?? key, kind: "img", src };
  }
  const obj = OBJECTS[id as ObjectId];
  if (!obj) throw new Error(`Нет предмета ${id}`);
  return { id, name: obj.name, kind: "svg", svg: obj.svg };
}
