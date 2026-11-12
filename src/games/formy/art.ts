import { cornerPoints, shapePath, type Fig, type Shape, type Tint } from "./logic";
import type { ThingId } from "./levels";

const INK = "#3b2e25";
const O = `stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
const svg = (body: string, vb = "0 0 100 100", fit = ""): string => `<svg viewBox="${vb}"${fit ? ` preserveAspectRatio="${fit}"` : ""} xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

export const SHAPE_COLOR: Record<Shape, string> = {
  circle: "#e8463a",
  square: "#3a8fd4",
  triangle: "#ffc94a",
  star: "#ff8a3d",
  heart: "#f58fb4",
  rhombus: "#5fbf4e",
  oval: "#9b6cd8",
  rect: "#3fae6a",
  pentagon: "#e8463a",
  hexagon: "#3a8fd4",
};

export const TINT_HEX: Record<Tint, string> = {
  red: "#e8463a",
  blue: "#3a8fd4",
  yellow: "#ffc94a",
  green: "#5fbf4e",
  purple: "#9b6cd8",
  orange: "#ff8a3d",
};

/** Radius of a figure of size 1 / 2 / 3 in a 100 × 100 box. */
export const FIG_R = { 1: 20, 2: 31, 3: 42 } as const;

/** A figure: shape, colour, size (all in one 100 box so sizes compare), maybe turned. */
export function figSvg(f: Fig): string {
  const r = FIG_R[f.size];
  const t = f.turn ? ` transform="rotate(${f.turn} 50 50)"` : "";
  return svg(`<g${t}><path d="${shapePath(f.shape, 50, 50, r)}" fill="${TINT_HEX[f.tint]}" ${O}/><path d="${shapePath(f.shape, 50 - r * 0.15, 50 - r * 0.15, r * 0.38)}" fill="#fff" opacity=".35"/></g>`);
}

/** A dark hole of a figure's shape and size (the figure that fits drops in). */
export function figHoleSvg(f: Fig): string {
  const r = FIG_R[f.size] + 2;
  return svg(`<path d="${shapePath(f.shape, 50, 50, r)}" fill="${INK}" opacity=".82"/><path d="${shapePath(f.shape, 50, 50, r)}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>`);
}

/** A big shape for «Сколько углов?»; `marks` puts numbered dots on its corners. */
export function cornersSvg(shape: Shape, tint: Tint, marks: boolean): string {
  const pts = cornerPoints(shape, 50, 52, 40);
  const dots = marks
    ? pts
        .map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="#fff" ${O} stroke-width="3"/><text x="${x.toFixed(1)}" y="${(y + 3.6).toFixed(1)}" font-family="Nunito,Arial,sans-serif" font-weight="900" font-size="10" fill="${INK}" text-anchor="middle">${i + 1}</text>`)
        .join("")
    : "";
  return svg(`<path d="${shapePath(shape, 50, 52, 40)}" fill="${TINT_HEX[tint]}" ${O}/>${dots}`, "-6 -4 112 112");
}

/** A number with that many dots under it (an answer button). */
export function numberSvg(n: number): string {
  let dots = "";
  for (let i = 0; i < n; i++) dots += `<circle cx="${50 + (i - (n - 1) / 2) * 13}" cy="84" r="4.5" fill="${INK}"/>`;
  return svg(`<text x="50" y="62" font-family="Nunito,Arial,sans-serif" font-weight="900" font-size="58" fill="${INK}" text-anchor="middle">${n}</text>${dots}`);
}

const lerp = (v: number, n: number, a: number, b: number): number => (n <= 1 ? b : a + ((v - 1) / (n - 1)) * (b - a));

/** A pencil `v` of `n` long (1 = shortest), lying left-aligned. */
export function pencilSvg(v: number, n: number, color = "#3a8fd4"): string {
  const L = lerp(v, n, 70, 210);
  return svg(
    `<rect x="6" y="10" width="${L - 36}" height="24" rx="4" fill="${color}" ${O} stroke-width="3"/><path d="M${L - 30} 10 L${L} 22 L${L - 30} 34 Z" fill="#f6dfb8" ${O} stroke-width="3"/><path d="M${L - 10} 18 L${L} 22 L${L - 10} 26 Z" fill="${INK}"/><rect x="6" y="10" width="14" height="24" rx="4" fill="#f58fb4" ${O} stroke-width="3"/><path d="M24 17 H${L - 40}" stroke="#fff" stroke-width="3" opacity=".45" stroke-linecap="round"/>`,
    "0 0 220 44",
    "xMinYMid meet",
  );
}

/** A fir tree `v` of `n` tall, standing on the bottom edge. */
export function firSvg(v: number, n: number): string {
  const H = lerp(v, n, 70, 190);
  const top = 196 - H;
  const w = 24 + H * 0.16;
  const tier = (y0: number, y1: number, half: number): string => `<path d="M40 ${y0} L${40 + half} ${y1} H${40 - half} Z" fill="#3fae6a" ${O} stroke-width="3"/>`;
  const h = H - 18;
  return svg(
    `<rect x="35" y="${196 - 20}" width="10" height="20" fill="#a0683a" ${O} stroke-width="3"/>` +
      tier(top + h * 0.45, 196 - 16, w) +
      tier(top + h * 0.2, top + h * 0.72, w * 0.8) +
      tier(top, top + h * 0.45, w * 0.6),
    "0 0 80 200",
    "xMidYMax meet",
  );
}

/** A book `v` of `n` thick, standing up (spine to us). */
export function bookSvg(v: number, n: number, color = "#e8463a"): string {
  const W = lerp(v, n, 14, 70);
  const x = 45 - W / 2;
  return svg(
    `<rect x="${x}" y="14" width="${W}" height="110" rx="4" fill="${color}" ${O} stroke-width="3"/><path d="M${x} 32 H${x + W} M${x} 106 H${x + W}" stroke="#ffd54a" stroke-width="5"/>`,
    "0 0 90 130",
    "xMidYMax meet",
  );
}

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

/** The kitchen table the family sits at (stretches to the scene width). */
export const TABLE = `<svg viewBox="0 0 400 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="400" height="22" rx="6" fill="#e0a56a" stroke="${INK}" stroke-width="4"/><rect x="6" y="22" width="388" height="78" fill="#c98a50" stroke="${INK}" stroke-width="4"/><path d="M6 40 H394" stroke="#b07440" stroke-width="3"/><path d="M14 8 H386" stroke="#f3c48e" stroke-width="4" stroke-linecap="round"/></svg>`;

/** Pyramid pole on a base. */
export const POLE = svg(`<rect x="92" y="20" width="16" height="250" rx="8" fill="#c48a4a" ${O}/><path d="M30 270 H170 L160 296 H40 Z" fill="#e8463a" ${O}/>`, "0 0 200 300");

export const RING_COLORS = ["#9b6cd8", "#3a8fd4", "#5fbf4e", "#ffc94a", "#ff8a3d", "#e8463a"];
