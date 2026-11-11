/**
 * Clothes drawn in the coordinates of the Ryzhik cutout (shared
 * characters/ryzhik.webp scaled to 100 × 140). The same markup is the
 * overlay on Ryzhik and, cropped with `box`, the icon in the tray.
 */
export type Weather = "sun" | "rain" | "snow" | "wind";

export type Slot = "head" | "eyes" | "neck" | "body" | "hands" | "feet" | "holds";

export type Item = {
  id: string;
  name: string;
  slot: Slot;
  weathers: Weather[];
  /** Gentle explanation when it doesn't fit the weather. */
  why: string;
  body: string;
  /** Icon crop: x, y, w, h in figure coordinates. */
  box: [number, number, number, number];
  /** Separate tray icon when the worn parts sit far apart (mittens). */
  icon?: string;
};

const O = `stroke="#3b2e25" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"`;

/** Centres of the slots on the figure (figure coordinates), for drop targets. */
export const ANCHORS: Record<Slot, { x: number; y: number }> = {
  head: { x: 49, y: 20 },
  eyes: { x: 54, y: 45 },
  neck: { x: 51, y: 70 },
  body: { x: 51, y: 90 },
  hands: { x: 30, y: 102 },
  feet: { x: 51, y: 128 },
  holds: { x: 87, y: 50 },
};

const boot = (x: number, y: number, fill: string, top = ""): string =>
  `<path d="M${x} ${y} L ${x} ${y + 16} C ${x} ${y + 20} ${x + 2} ${y + 21} ${x + 5} ${y + 21} L ${x + 20} ${y + 21} C ${x + 22} ${y + 21} ${x + 22} ${y + 17} ${x + 19} ${y + 16} L ${x + 15} ${y + 14} L ${x + 15} ${y} Z" fill="${fill}" ${O}/>` +
  top;

const mitten = (x: number, y: number, fill: string, flip = false): string => {
  const s = flip ? -1 : 1;
  return `<g transform="translate(${x} ${y}) scale(${s} 1)"><path d="M-6 -6 C -7 -12 5 -13 6 -6 L 6 6 C 6 10 -6 10 -6 6 Z" fill="${fill}" ${O}/><path d="M-6 -1 C -10 -3 -11 3 -6 4" fill="${fill}" ${O}/><path d="M-6 5 L 6 5" stroke="#fff" stroke-width="2.4"/></g>`;
};

export const ITEMS: Record<string, Item> = {
  panama: {
    id: "panama",
    name: "Панамка",
    slot: "head",
    weathers: ["sun"],
    why: "Панамка — от солнышка.",
    body:
      `<path d="M28 26 C 28 10 70 8 72 26 Z" fill="#7cc0e8" ${O}/>` +
      `<ellipse cx="50" cy="27" rx="35" ry="6" fill="#a6dcf5" ${O}/>` +
      `<path d="M29 22 C 40 19 60 19 71 22" fill="none" stroke="#ffffff" stroke-width="3"/>`,
    box: [12, 6, 76, 30],
  },
  hat: {
    id: "hat",
    name: "Шапка",
    slot: "head",
    weathers: ["snow", "wind"],
    why: "Шапка — когда холодно.",
    body:
      `<path d="M22 30 C 20 6 78 4 77 30 Z" fill="#e8463a" ${O}/>` +
      `<rect x="20" y="25" width="59" height="10" rx="5" fill="#ffffff" ${O}/>` +
      `<circle cx="50" cy="7" r="6" fill="#ffffff" ${O}/>` +
      `<path d="M34 14 L 36 24 M 50 11 L 50 24 M 64 14 L 62 24" stroke="#c5302a" stroke-width="2"/>`,
    box: [16, 0, 68, 38],
  },
  sunglasses: {
    id: "sunglasses",
    name: "Очки от солнца",
    slot: "eyes",
    weathers: ["sun"],
    why: "Тёмные очки — от яркого солнышка.",
    body:
      `<circle cx="42.5" cy="45" r="8.5" fill="#2d3a4a" fill-opacity=".85" ${O}/>` +
      `<circle cx="65.5" cy="45" r="8.5" fill="#2d3a4a" fill-opacity=".85" ${O}/>` +
      `<path d="M51 44 Q 54 41 57 44" fill="none" ${O}/>` +
      `<path d="M34 43 L 26 40 M 74 43 L 80 40" ${O}/>` +
      `<path d="M38 41 L 42 39" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><path d="M61 41 L 65 39" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`,
    box: [24, 34, 58, 22],
  },
  scarf: {
    id: "scarf",
    name: "Шарф",
    slot: "neck",
    weathers: ["snow", "wind"],
    why: "Шарф — когда холодно и дует ветер.",
    body:
      `<path d="M31 66 C 40 74 62 74 71 66 L 72 74 C 62 81 40 81 30 74 Z" fill="#3a8fd4" ${O}/>` +
      `<path d="M58 74 L 66 98 L 58 100 L 52 77 Z" fill="#3a8fd4" ${O}/>` +
      `<path d="M38 70 L 37 77 M 46 72 L 46 79 M 64 70 L 65 77" stroke="#ffc94a" stroke-width="2.2"/>` +
      `<path d="M58 99 L 57 104 M 62 98 L 62 103 M 66 97 L 67 102" stroke="#3a8fd4" stroke-width="2"/>`,
    box: [26, 62, 46, 44],
  },
  raincoat: {
    id: "raincoat",
    name: "Дождевик",
    slot: "body",
    weathers: ["rain"],
    why: "Дождевик — для дождя.",
    body:
      `<path d="M71 70 L 86 60 L 91 66 L 76 80 Z" fill="#ffd23f" ${O}/>` +
      `<path d="M30 71 L 22 98 L 30 101 L 35 82 Z" fill="#ffd23f" ${O}/>` +
      `<path d="M32 68 C 42 74 60 74 72 68 L 78 116 C 62 120 40 120 26 116 Z" fill="#ffd23f" ${O}/>` +
      `<path d="M52 73 L 52 117" stroke="#3b2e25" stroke-width="1.4"/>` +
      `<circle cx="56" cy="84" r="1.8" fill="#3b2e25"/><circle cx="56" cy="96" r="1.8" fill="#3b2e25"/><circle cx="56" cy="108" r="1.8" fill="#3b2e25"/>`,
    box: [18, 56, 76, 66],
  },
  jacket: {
    id: "jacket",
    name: "Тёплая куртка",
    slot: "body",
    weathers: ["snow", "wind"],
    why: "Тёплая куртка — когда холодно.",
    body:
      `<path d="M71 70 L 86 60 L 91 66 L 76 80 Z" fill="#7a5bd0" ${O}/>` +
      `<path d="M30 71 L 22 98 L 30 101 L 35 82 Z" fill="#7a5bd0" ${O}/>` +
      `<path d="M32 68 C 42 74 60 74 72 68 L 76 110 C 62 114 42 114 28 110 Z" fill="#7a5bd0" ${O}/>` +
      `<path d="M28 104 C 42 108 62 108 76 104 L 76 110 C 62 114 42 114 28 110 Z" fill="#ffffff" ${O}/>` +
      `<path d="M52 73 L 52 106" stroke="#ffc94a" stroke-width="2.4"/>` +
      `<path d="M38 86 L 46 86 M 58 86 L 66 86" stroke="#5a3fb0" stroke-width="2.4" stroke-linecap="round"/>`,
    box: [18, 56, 76, 62],
  },
  mittens: {
    id: "mittens",
    name: "Варежки",
    slot: "hands",
    weathers: ["snow"],
    why: "Варежки — для мороза.",
    body: mitten(29, 102, "#e8463a") + mitten(88, 56, "#e8463a", true),
    box: [0, 0, 40, 30],
    icon: mitten(13, 15, "#e8463a") + mitten(27, 15, "#e8463a", true),
  },
  rainboots: {
    id: "rainboots",
    name: "Резиновые сапоги",
    slot: "feet",
    weathers: ["rain"],
    why: "Резиновые сапоги — чтобы бегать по лужам.",
    body: boot(32, 116, "#e8463a") + boot(54, 114, "#e8463a"),
    box: [28, 110, 52, 30],
  },
  winterboots: {
    id: "winterboots",
    name: "Зимние сапожки",
    slot: "feet",
    weathers: ["snow"],
    why: "Зимние сапожки — для снега.",
    body:
      boot(32, 116, "#9b6a3c", `<rect x="31" y="113" width="17" height="6" rx="3" fill="#fff4e0" ${O}/>`) +
      boot(54, 114, "#9b6a3c", `<rect x="53" y="111" width="17" height="6" rx="3" fill="#fff4e0" ${O}/>`),
    box: [28, 108, 52, 32],
  },
  sandals: {
    id: "sandals",
    name: "Сандалики",
    slot: "feet",
    weathers: ["sun"],
    why: "Сандалики — для жаркого дня.",
    body:
      `<path d="M31 136 L 52 136 L 52 139 L 31 139 Z M 53 134 L 74 134 L 74 137 L 53 137 Z" fill="#9b6a3c" ${O}/>` +
      `<path d="M34 136 C 36 126 46 126 48 136 M 56 134 C 58 124 68 124 70 134" fill="none" stroke="#3fae6a" stroke-width="3.2" stroke-linecap="round"/>`,
    box: [28, 120, 50, 20],
  },
  umbrella: {
    id: "umbrella",
    name: "Зонтик",
    slot: "holds",
    weathers: ["rain"],
    why: "Зонтик — от дождя. А в ветер его унесёт!",
    body:
      `<path d="M87 60 L 87 4" stroke="#3b2e25" stroke-width="2.2"/>` +
      `<path d="M56 6 C 58 -14 116 -14 118 6 C 113 2 108 2 103 6 C 98 2 92 2 87 6 C 82 2 76 2 71 6 C 66 2 61 2 56 6 Z" fill="#9b6cd8" ${O}/>` +
      `<path d="M87 -10 C 80 -4 76 0 76 5 M 87 -10 C 94 -4 98 0 98 5" fill="none" stroke="#3b2e25" stroke-width="1.2"/>`,
    box: [54, -14, 66, 76],
  },
  kite: {
    id: "kite",
    name: "Воздушный змей",
    slot: "holds",
    weathers: ["wind"],
    why: "Воздушный змей летает, когда дует ветер.",
    body:
      `<path d="M87 56 C 95 40 92 26 104 14" fill="none" stroke="#3b2e25" stroke-width="1" stroke-dasharray="2 2"/>` +
      `<path d="M104 -6 L 118 10 L 104 28 L 90 10 Z" fill="#3a8fd4" ${O}/>` +
      `<path d="M104 -6 L 118 10 L 104 10 Z M 90 10 L 104 28 L 104 10 Z" fill="#ffc94a"/>` +
      `<path d="M104 -6 L 118 10 L 104 28 L 90 10 Z M 104 -6 L 104 28 M 90 10 L 118 10" fill="none" ${O}/>` +
      `<path d="M104 28 C 100 34 108 36 104 42" fill="none" stroke="#3b2e25" stroke-width="1"/>`,
    box: [84, -8, 36, 66],
  },
};

export function iconSvg(item: Item): string {
  const [x, y, w, h] = item.box;
  return `<svg viewBox="${x} ${y} ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${item.icon ?? item.body}</svg>`;
}

export function overlaySvg(item: Item): string {
  return `<svg viewBox="0 0 100 140" overflow="visible" xmlns="http://www.w3.org/2000/svg">${item.body}</svg>`;
}
