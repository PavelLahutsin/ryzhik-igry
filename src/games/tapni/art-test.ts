import type { Motion, Touchable } from "../../shared/toys";
import { touchable } from "../../shared/toys";
import type { SoundKind } from "../../shared/sounds";
import { el } from "../../shared/dom";

/**
 * Test only (v29 picture choice): «Нажми и послушай» → «Животные» with the new
 * animals drawn in two ways. Opens only with ?art=a (Flow) or ?art=b (Grok
 * Bot's generator); without the parameter nothing here is loaded.
 */
export type ArtVariant = "a" | "b";

export function artVariant(search: string): ArtVariant | null {
  const v = new URLSearchParams(search).get("art");
  return v === "a" || v === "b" ? v : null;
}

type Animal = { id: string; name: string; sound: SoundKind; motion: Motion; word: string; x: number; y: number };

/** Same eight places as the real «Животные» screen. */
export const TEST_ANIMALS: Animal[] = [
  { id: "cat", name: "Котик", sound: "meow", motion: "wobble", word: "Мяу!", x: 18, y: 22 },
  { id: "dog", name: "Собачка", sound: "woof", motion: "hop", word: "Гав-гав!", x: 50, y: 20 },
  { id: "cow", name: "Коровка", sound: "bear", motion: "wobble", word: "Му-у!", x: 82, y: 22 },
  { id: "pig", name: "Поросёнок", sound: "hedgehog", motion: "hop", word: "Хрю-хрю!", x: 28, y: 50 },
  { id: "horse", name: "Лошадка", sound: "boing", motion: "hop", word: "Иго-го!", x: 72, y: 50 },
  { id: "sheep", name: "Овечка", sound: "rustle", motion: "wobble", word: "Бе-е!", x: 18, y: 80 },
  { id: "rooster", name: "Петушок", sound: "tweet", motion: "hop", word: "Ку-ка-ре-ку!", x: 50, y: 78 },
  { id: "snail", name: "Улитка", sound: "rustle", motion: "wobble", word: "Ползу-ползу", x: 82, y: 80 },
];

const PICS = import.meta.glob<string>("./art-test/*/*.webp", { eager: true, import: "default" });

export function pictureUrl(variant: ArtVariant, id: string): string {
  const url = PICS[`./art-test/${variant}/${id}.webp`];
  if (!url) throw new Error(`Нет картинки ${variant}/${id}`);
  return url;
}

/** The field for the «Животные» tab, plus a small label with the other link. */
export function testField(variant: ArtVariant): HTMLElement {
  const field = el("div", { class: "tp-scene tp-scene--zhivotnye", attrs: { role: "group", "aria-label": "Животные" } });
  for (const a of TEST_ANIMALS) {
    const spot: Touchable & { x: number; y: number } = { id: a.id, name: a.name, svg: "<svg viewBox=\"0 0 1 1\"></svg>", sound: a.sound, motion: a.motion, word: a.word, x: a.x, y: a.y };
    const node = touchable(spot, undefined, "toy tp-spot");
    const img = el("img", { class: "toy__art", attrs: { src: pictureUrl(variant, a.id), alt: "", draggable: "false", width: "256", height: "256" } });
    node.querySelector(".toy__art")?.replaceWith(img);
    node.style.left = `${a.x}%`;
    node.style.top = `${a.y}%`;
    field.append(node);
  }
  const other = variant === "a" ? "b" : "a";
  const label = el("div", { class: "tp-arttest" }, [
    el("span", { text: variant === "a" ? "Тест A: Flow" : "Тест B: генератор Grok Bot" }),
    el("a", { attrs: { href: `?art=${other}#/tapni` }, text: `Показать ${other.toUpperCase()}` }),
  ]);
  field.append(label);
  return field;
}
