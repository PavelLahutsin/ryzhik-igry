import { CHARACTER_NAMES, characters } from "../../shared/assets";
import { OBJECTS, type ObjectId } from "../../shared/objects";
import type { LevelInfo } from "../../shared/levelgame";

export type TeniLevel = LevelInfo & {
  /** Drawn objects by id, or characters as "char:<id>". */
  items: string[];
};

export const levels: TeniLevel[] = [
  { id: "t1", title: "Яблоко и звёздочка", items: ["apple", "star", "house"] },
  { id: "t2", title: "Шарик и рыбка", items: ["balloon", "fish", "car"] },
  { id: "t3", title: "Грибок и зонтик", items: ["mushroom", "kite", "sun", "umbrella"] },
  { id: "t4", title: "Чья тень?", items: ["char:ryzhik", "char:mishka", "char:ezhik", "char:belka"] },
  { id: "t5", title: "Пять теней", items: ["carrot", "ball", "umbrella", "fish", "house"] },
  { id: "t6", title: "Вся семья", items: ["char:ryzhik", "char:mama", "char:papa", "char:mishka", "char:ezhik"] },
];

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
