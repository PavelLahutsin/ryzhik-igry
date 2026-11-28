/**
 * v29: «Домик Рыжика» draws its props as soft hand-painted pictures (transparent
 * webp, cropped to the object, ≤ 40 KB each). The key is `scene:prop`. A picture
 * may be missing for some state; then the old svg is used (`null`).
 */
import type { PropState } from "./scenes";
import { ART } from "../../shared/art";

const files = import.meta.glob<string>("./assets/*.webp", { eager: true, import: "default" });
const URL_OF: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) URL_OF[path.split("/").pop()!.replace(/\.webp$/, "")] = url;

type Opts = { pos?: "top" | "bottom"; css?: string };

export function pic(id: string, o: Opts = {}): string {
  const url = URL_OF[id] ?? ART[id];
  if (!url) throw new Error(`Нет картинки домика ${id}`);
  const pos = o.pos === "top" ? "50% 0%" : "50% 100%";
  return `<img class="art-img" src="${url}" alt="" draggable="false" decoding="async" style="object-position:${pos};${o.css ?? ""}">`;
}

type Fn = (s: PropState) => string | null;
const one = (id: string, o?: Opts): Fn => () => pic(id, o);

/** Picture for a prop, or null when the prop keeps its svg. */
export const PICS: Record<string, Fn> = {
  // Дом
  "dom:storybook": one("storybook"),
  "dom:bells": one("bells", { pos: "top" }),
  "dom:window": (s) => pic(s.on ? (s.night ? "window-night" : "window-day") : "window"),
  "dom:frame": one("frame"),
  "dom:clock": one("clock", { pos: "top" }),
  "dom:lamp": (s) => pic(s.on ? "lamp-on" : "lamp-off"),
  "dom:bed": one("bed"),
  "dom:blanket": one("blanket"),
  "dom:radio": one("radio"),
  "dom:toybox": (s) => pic(s.on ? "toybox-open" : "toybox"),
  "dom:plant": (s) => pic(s.n % 4 === 0 ? "seedling-pot" : "plant"),
  // Сад
  "sad:pinwheel": one("pinwheel"),
  "sad:can": one("can"),
  "sad:sun": (s) => (s.night ? null : pic("sun")),
  "sad:cloud": (s) => pic(s.night ? "cloud-night" : "cloud"),
  "sad:appletree": (s) => pic(s.n >= 4 ? "appletree-5" : s.n >= 1 ? "appletree-2" : "appletree-0"),
  "sad:swing": one("swing", { pos: "top" }),
  "sad:birdhouse": one("birdhouse-bird"),
  "sad:flowerbed": (s) => pic(s.n <= 0 ? "flowerbed-1" : "flowerbed-2"),
  "sad:carrots": (s) => pic(s.n >= 3 ? "carrots-3" : s.n >= 1 ? "carrots-2" : "carrots-0"),
  "sad:butterfly": one("butterfly"),
  // Лес
  "les:snail": one("snail"),
  "les:fern": one("fern"),
  "les:oak": (s) => pic("oak", { css: s.night ? "filter:brightness(.78) saturate(.9);" : "" }),
  "les:fir": one("fir"),
  "les:bush": (s) => pic(s.n >= 4 ? "blueberry-many" : s.n >= 1 ? "blueberry-few" : "blueberry-0"),
  "les:stump": one("stump"),
  "les:mushrooms": one("mushrooms"),
  "les:frog": one("frog"),
  // Речка
  "rechka:bridge": one("bridge"),
  "rechka:sailboat": one("sailboat"),
  "rechka:rushes": one("reeds"),
  "rechka:shoal": one("shoal"),
  "rechka:ducks": one("ducks"),
  // Детская
  "detskaya:tent": (s) => pic(s.on ? "tent-open" : "tent"),
  "detskaya:rocker": one("rocker"),
  "detskaya:blocks": one("blocks"),
  "detskaya:nightlight": (s) => pic(s.on ? "nightlight-on" : "nightlight-off"),
  "detskaya:drum": one("drum"),
  "detskaya:picturebook": one("picturebook"),
  // Пляж
  "plyazh:parasol": (s) => pic("parasol", { css: s.on ? "transform:scaleX(.55);" : "" }),
  "plyazh:dinghy": one("dinghy"),
  "plyazh:shellbells": one("shellbells", { pos: "top" }),
  "plyazh:lounger": one("lounger"),
  "plyazh:pinwheel": one("beach-pinwheel"),
  "plyazh:sandfort": one("sandfort"),
  "plyazh:pail": one("pail"),
  // Двор
  "dvor:line": one("line", { pos: "top" }),
  "dvor:gate": (s) => pic(s.on ? "gate-open" : "gate"),
  "dvor:pinwheel": one("beach-pinwheel"),
  "dvor:bells": one("bells", { pos: "top" }),
  "dvor:bench": one("bench"),
  "dvor:sandpit": one("sandpit"),
  "dvor:puddle": one("puddle"),
  // Чердак
  "cherdak:atticCase": one("suitcase"),
  "cherdak:atticSpinner": one("papersp"),
  "cherdak:atticLamp": (s) => pic(s.on ? "hanglamp-on" : "hanglamp-off", { pos: "top" }),
  "cherdak:atticMap": one("map"),
  "cherdak:atticBells": one("bells", { pos: "top" }),
  "cherdak:atticBlocks": one("blocksbox"),
  "cherdak:atticScope": one("spyglass"),
  // Веранда
  "veranda:gardenwindow": (s) => pic(s.on ? (s.night ? "window-night" : "window-day") : "window"),
  "veranda:postlight": (s) => pic("postlamp", { pos: "top", css: s.on ? "" : "filter:brightness(.62) saturate(.5);" }),
  "veranda:breezebells": one("windchime", { pos: "top" }),
  "veranda:leafbasket": one("hangbasket", { pos: "top" }),
  "veranda:seedtray": one("feeder-birds"),
  "veranda:porchteapot": one("teatable"),
};
