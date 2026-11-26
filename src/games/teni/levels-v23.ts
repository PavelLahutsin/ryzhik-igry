/** v23 (Astra): «Тени» t57 … t66 with the new pictures; levels.ts puts each where its difficulty fits. */
import type { Hide, Spec, TeniLevel } from "./levels";

const flip = (id: string): Spec => ({ id, flip: true });
const turn = (id: string, deg: number): Spec => ({ id, turn: deg });
const hide = (id: string, where: Hide = "bush"): Spec => ({ id, hide: where });

export const TENI_V23: TeniLevel[] = [
  { id: "t57", title: "Поросёнок и кукуруза", world: "easy", items: ["pig", "corn"] },
  { id: "t58", title: "Ёжик на грядке", world: "friends", items: ["char:ezhik", "radish", "carrot"], decoys: ["corn"] },
  { id: "t59", title: "На зелёном лугу", world: "more", items: ["sheep", "pig", "butterfly", "flower", "bee"], decoys: ["tree", "snail"] },
  // Integration: Astra's t60–t66 were far easier than their worlds; more pictures, turns and hiding places were added in her themes.
  { id: "t60", title: "Ключ от замка", world: "tricky", items: ["castle", "flagcastle", "cube", "key", "key2"], decoys: ["pyramid"] },
  { id: "t61", title: "Подъём на гору", world: "turn", items: ["cablecar", flip("excavator"), turn("fir", 90), flip("truck"), "fir2"], decoys: ["helicopter"] },
  { id: "t62", title: "Кто в зелёных кустах?", world: "hide", items: [hide("parrot"), hide("butterfly"), hide("snail"), hide("corn"), hide("radish"), "bird"], decoys: ["frog", hide("bird2")] },
  { id: "t63", title: "Коробки с колёсами", world: "hide", items: [hide("bicycle", "box"), hide("excavator", "box"), hide("scooter", "box"), hide("car", "box"), "truck"], decoys: ["bus", hide("tractor", "box")] },
  { id: "t64", title: "Обед для поросёнка", world: "odd", items: ["pig", hide("corn"), turn("carrot", 90), hide("pear"), flip("bread")], decoys: ["apple", "sheep"], extra: ["radish", "mushroom"] },
  {
    id: "t65",
    title: "Утёс над морем",
    world: "scene",
    items: ["cablecar", "sun", "parrot", flip("bird"), hide("plane", "cloud")],
    decoys: ["cloud"],
    more: [{ items: ["wave", "boat", hide("crab", "box"), flip("whale"), "octopus"], decoys: ["anchor", hide("fish", "box")] }],
  },
  {
    id: "t66",
    title: "Игрушечный город",
    world: "scene",
    items: ["castle", "flagcastle", "cube", "key"],
    decoys: ["house"],
    more: [{ items: [flip("excavator"), "truck", hide("car", "box")], decoys: ["tractor", "bus"], extra: ["helicopter"] }],
  },
];

/** Where each new level goes: right after this one (by difficulty). */
export const TENI_V23_AFTER: Record<string, string> = {
  t57: "t1", t58: "t47", t59: "t49", t60: "t50", t61: "t25", t62: "t29", t63: "t53", t64: "t54", t66: "t31", t65: "t66",
};
