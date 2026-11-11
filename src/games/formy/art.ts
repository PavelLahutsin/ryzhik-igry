import { shapePath, type Shape } from "./logic";
import type { ThingId } from "./levels";

const INK = "#3b2e25";
const O = `stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
const svg = (body: string, vb = "0 0 100 100"): string => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

export const SHAPE_COLOR: Record<Shape, string> = {
  circle: "#e8463a",
  square: "#3a8fd4",
  triangle: "#ffc94a",
  star: "#ff8a3d",
  heart: "#f58fb4",
  rhombus: "#5fbf4e",
};

/** A chunky toy block of a shape. */
export function blockSvg(shape: Shape, color = SHAPE_COLOR[shape]): string {
  return svg(`<path d="${shapePath(shape, 50, 52, 42)}" fill="${color}" ${O}/><path d="${shapePath(shape, 44, 44, 16)}" fill="#fff" opacity=".35"/>`);
}

/** The hole in the sorter box. */
export function holeSvg(shape: Shape): string {
  return svg(`<path d="${shapePath(shape, 50, 52, 44)}" fill="#3b2e25" opacity=".82"/><path d="${shapePath(shape, 50, 52, 44)}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>`);
}

/** Small outline of a shape (labels). */
export function shapeIcon(shape: Shape): string {
  return svg(`<path d="${shapePath(shape, 50, 50, 40)}" fill="${SHAPE_COLOR[shape]}" ${O}/>`);
}

export const THINGS: Record<Exclude<ThingId, "ball" | "cube">, { name: string; art: string }> = {
  coin: {
    name: "Монетка",
    art: svg(`<circle cx="50" cy="50" r="38" fill="#ffd54a" ${O}/><circle cx="50" cy="50" r="26" fill="none" stroke="#e0a91a" stroke-width="5"/><path d="M44 36 h14 M50 36 V66 M42 66 h16" stroke="#b07a10" stroke-width="6" stroke-linecap="round"/>`),
  },
  clock: {
    name: "Часы",
    art: svg(`<circle cx="50" cy="52" r="38" fill="#fff" ${O}/><path d="M50 52 V28 M50 52 L66 60" ${O}/><circle cx="50" cy="52" r="4" fill="${INK}"/><path d="M26 16 L16 26 M74 16 L84 26" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`),
  },
  present: {
    name: "Подарок",
    art: svg(`<rect x="16" y="26" width="68" height="62" rx="6" fill="#9b6cd8" ${O}/><path d="M50 26 V88 M16 50 H84" stroke="#ffd54a" stroke-width="9"/><path d="M50 26 C38 8 24 16 34 26 M50 26 C62 8 76 16 66 26" fill="none" ${O}/>`),
  },
  window: {
    name: "Окошко",
    art: svg(`<rect x="14" y="14" width="72" height="72" rx="6" fill="#9fd3ea" ${O}/><path d="M50 14 V86 M14 50 H86" stroke="${INK}" stroke-width="5"/><path d="M22 22 L40 22" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`),
  },
  pizza: {
    name: "Кусочек пиццы",
    art: svg(`<path d="M50 90 L14 18 C36 8 64 8 86 18 Z" fill="#ffd27a" ${O}/><path d="M14 18 C36 8 64 8 86 18 L82 26 C62 18 38 18 18 26 Z" fill="#d9944a" ${O}/><circle cx="40" cy="38" r="7" fill="#e8463a"/><circle cx="60" cy="42" r="7" fill="#e8463a"/><circle cx="50" cy="62" r="6" fill="#e8463a"/>`),
  },
  flag: {
    name: "Флажок",
    art: svg(`<path d="M22 10 V92" ${O} stroke-width="6"/><path d="M24 14 L84 34 L24 54 Z" fill="#3a8fd4" ${O}/>`),
  },
  sign: {
    name: "Дорожный знак",
    art: svg(`<path d="M50 70 V96" ${O} stroke-width="7"/><path d="M50 8 L90 72 H10 Z" fill="#fff" stroke="#e8463a" stroke-width="9" stroke-linejoin="round"/><path d="M38 58 L50 34 L62 58" fill="none" ${O}/>`),
  },
};

/** A plate under each family member. */
export const PLATE = svg(`<ellipse cx="100" cy="24" rx="94" ry="18" fill="#fff" ${O}/><ellipse cx="100" cy="22" rx="64" ry="10" fill="#f0e6d8"/>`, "0 0 200 48");

/** Pyramid pole on a base. */
export const POLE = svg(`<rect x="92" y="20" width="16" height="250" rx="8" fill="#c48a4a" ${O}/><path d="M30 270 H170 L160 296 H40 Z" fill="#e8463a" ${O}/>`, "0 0 200 300");

export const RING_COLORS = ["#9b6cd8", "#3a8fd4", "#5fbf4e", "#ffc94a", "#ff8a3d", "#e8463a"];
