/**
 * Skins of «Вырасти сад» (the 2048 mode): 11 pictures per skin, one per number
 * 2 … 2048 (tier 0 … 10). Flat vector art in the style of art.ts
 * (viewBox 0 0 100 100), drawn in code. The number is always shown too.
 */
import { CHAIN_ART, OUT, SOIL, SNOWY, WINTER_ART, apple, ball, crown, flake, flowerHead, leaf, svg } from "./art";

export type SkinId = "cifry" | "sad" | "zima" | "les" | "kosmos" | "pesok" | "tort" | "more" | "ferma" | "transport";
export type SkinTier = { name: string; color: string; art: string | null };
export type Skin = { id: SkinId; title: string; color: string; tiers: SkinTier[] };

/** Inside of an <svg> string, to place it in another picture. */
const inner = (markup: string): string => markup.replace(/<\/?svg[^>]*>/g, "");
const place = (markup: string, x: number, y: number, s: number): string =>
  `<g transform="translate(${x} ${y}) scale(${s})">${inner(markup)}</g>`;

// ---------- shared pieces ----------
const GRASS = `<ellipse cx="50" cy="86" rx="40" ry="8" fill="#7cc46a"/><ellipse cx="50" cy="84" rx="36" ry="5" fill="#9bd77f"/>`;
const sky = (color: string): string => `<rect width="100" height="100" fill="${color}"/>`;
const sun = (x: number, y: number, r: number): string => {
  let rays = "";
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    rays += `<path d="M${(x + Math.cos(a) * r * 1.3).toFixed(1)} ${(y + Math.sin(a) * r * 1.3).toFixed(1)} L ${(x + Math.cos(a) * r * 1.7).toFixed(1)} ${(y + Math.sin(a) * r * 1.7).toFixed(1)}" stroke="#ffb020" stroke-width="3" stroke-linecap="round"/>`;
  }
  return rays + `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffd54a" ${OUT}/>`;
};
const fir = (x: number, base: number, h: number, w: number, color = "#3f9a4a", snow = false): string => {
  const trunk = `<rect x="${x - w * 0.09}" y="${base - h * 0.16}" width="${w * 0.18}" height="${h * 0.16}" fill="#8a5a2b" ${OUT}/>`;
  let tiers = "";
  for (let i = 0; i < 3; i++) {
    const top = base - h + i * h * 0.24;
    const bottom = base - h * 0.14 - (2 - i) * h * 0.2;
    const half = (w / 2) * (0.6 + i * 0.2);
    tiers += `<path d="M${x} ${top.toFixed(1)} L ${(x + half).toFixed(1)} ${bottom.toFixed(1)} L ${(x - half).toFixed(1)} ${bottom.toFixed(1)} Z" fill="${color}" ${OUT}/>`;
    if (snow) tiers += `<path d="M${(x - half * 0.55).toFixed(1)} ${(top + (bottom - top) * 0.55).toFixed(1)} L ${x} ${(top + (bottom - top) * 0.25).toFixed(1)} L ${(x + half * 0.55).toFixed(1)} ${(top + (bottom - top) * 0.55).toFixed(1)}" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  return trunk + tiers;
};
const star = (x: number, y: number, r: number, fill = "#ffd54a", line = OUT): string => {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    d += `${i ? "L" : "M"}${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)} `;
  }
  return `<path d="${d}Z" fill="${fill}" ${line}/>`;
};
const gift = (x: number, y: number, s: number, box: string, ribbon: string): string =>
  `<rect x="${x}" y="${y}" width="${14 * s}" height="${12 * s}" rx="2" fill="${box}" ${OUT}/>` +
  `<path d="M${x + 7 * s} ${y} V ${y + 12 * s} M${x} ${y + 5 * s} H ${x + 14 * s}" stroke="${ribbon}" stroke-width="${2.6 * s}"/>` +
  `<path d="M${x + 7 * s} ${y} C ${x + 2 * s} ${y - 6 * s} ${x} ${y - 1 * s} ${x + 7 * s} ${y} C ${x + 14 * s} ${y - 1 * s} ${x + 12 * s} ${y - 6 * s} ${x + 7 * s} ${y} Z" fill="${ribbon}" stroke="#3b2e25" stroke-width="1.6"/>`;
const house = (x: number, y: number, s: number, wall: string, roof: string, snow = false): string =>
  `<rect x="${x}" y="${y}" width="${30 * s}" height="${22 * s}" fill="${wall}" ${OUT}/>` +
  `<path d="M${x - 4 * s} ${y + 1} L ${x + 15 * s} ${y - 16 * s} L ${x + 34 * s} ${y + 1} Z" fill="${roof}" ${OUT}/>` +
  (snow ? `<path d="M${x - 3 * s} ${y} L ${x + 15 * s} ${y - 15 * s} L ${x + 33 * s} ${y}" fill="none" stroke="#ffffff" stroke-width="${4 * s}" stroke-linecap="round" stroke-linejoin="round"/>` : "") +
  `<rect x="${x + 4 * s}" y="${y + 6 * s}" width="${9 * s}" height="${8 * s}" rx="1.5" fill="#ffe27a" ${OUT}/>` +
  `<rect x="${x + 18 * s}" y="${y + 9 * s}" width="${8 * s}" height="${13 * s}" rx="1.5" fill="#9b6a3c" ${OUT}/>`;
const fence = (y: number): string => {
  let out = `<path d="M6 ${y + 6} H 94 M6 ${y + 14} H 94" stroke="#c99a62" stroke-width="3"/>`;
  for (let x = 10; x <= 90; x += 10) out += `<path d="M${x - 3} ${y + 20} V ${y + 2} L ${x} ${y - 2} L ${x + 3} ${y + 2} V ${y + 20} Z" fill="#e9c48d" stroke="#3b2e25" stroke-width="1.6" stroke-linejoin="round"/>`;
  return out;
};
const tree = (x: number, base: number, s: number, apples: boolean): string =>
  `<path d="M${x - 4 * s} ${base} L ${x - 3 * s} ${base - 24 * s} L ${x + 3 * s} ${base - 24 * s} L ${x + 4 * s} ${base} Z" fill="#9b6a3c" ${OUT}/>` +
  crown(x, base - 42 * s, 24 * s) +
  (apples ? apple(x - 12 * s, base - 40 * s) + apple(x + 8 * s, base - 52 * s) + apple(x + 12 * s, base - 36 * s) : "");

// ---------- Сад ----------
const tulip = (x: number, top: number, color: string): string =>
  `<path d="M${x} 82 L ${x} ${top + 12}" stroke="#3f8f2c" stroke-width="4.5" stroke-linecap="round"/>` +
  leaf(x, 72, -150, 0.8) +
  leaf(x, 66, -30, 0.8) +
  `<path d="M${x - 10} ${top} L ${x - 5} ${top + 6} L ${x} ${top - 2} L ${x + 5} ${top + 6} L ${x + 10} ${top} C ${x + 11} ${top + 14} ${x + 6} ${top + 18} ${x} ${top + 18} C ${x - 6} ${top + 18} ${x - 11} ${top + 14} ${x - 10} ${top} Z" fill="${color}" ${OUT}/>`;
const stemFlower = (x: number, top: number, r: number, color: string): string =>
  `<path d="M${x} 82 L ${x} ${top}" stroke="#3f8f2c" stroke-width="4" stroke-linecap="round"/>` + flowerHead(x, top, r, color);

const SAD: SkinTier[] = [
  { name: "Семечко", color: "#f3e3c6", art: CHAIN_ART[0]! },
  { name: "Росток", color: "#e3f1c8", art: CHAIN_ART[1]! },
  { name: "Цветок", color: "#fde0ea", art: CHAIN_ART[2]! },
  { name: "Тюльпан", color: "#ffe4d6", art: svg(SOIL + tulip(50, 30, "#e8463a")) },
  {
    name: "Три цветка",
    color: "#fbe7f7",
    art: svg(SOIL + stemFlower(30, 46, 8, "#ffffff") + stemFlower(70, 44, 8, "#b48cf2") + stemFlower(50, 32, 10, "#f58fb4")),
  },
  { name: "Кустик", color: "#d5efc7", art: CHAIN_ART[3]! },
  { name: "Яблонька", color: "#c9e8b8", art: CHAIN_ART[4]! },
  { name: "Яблоня с яблоками", color: "#ffe1c9", art: CHAIN_ART[5]! },
  {
    name: "Две яблони",
    color: "#d9f2e4",
    art: svg(GRASS + tree(30, 84, 0.78, true) + tree(70, 84, 0.78, true)),
  },
  {
    name: "Сад с заборчиком",
    color: "#e6f6d4",
    art: svg(sky("#cfeefc") + fence(56) + GRASS + tree(28, 86, 0.72, true) + tree(72, 86, 0.72, false) + flowerHead(50, 80, 5, "#f58fb4") + flowerHead(88, 82, 4.5, "#ffffff")),
  },
  {
    name: "Домик в саду",
    color: "#fff1b8",
    art: svg(sky("#cfeefc") + sun(84, 16, 8) + `<path d="M0 70 Q 30 60 60 66 T 100 62 V 100 H 0 Z" fill="#8fd46a"/>` + house(36, 54, 1, "#ffcf8a", "#e8463a") + tree(16, 92, 0.7, true) + flowerHead(80, 84, 5, "#f58fb4") + flowerHead(90, 76, 4, "#ffffff") + flowerHead(70, 90, 4, "#b48cf2")),
  },
];

// ---------- Зима ----------
const sled = svg(
  SNOWY +
    `<path d="M20 74 H 76 C 86 74 86 64 80 62" fill="none" stroke="#3b2e25" stroke-width="4" stroke-linecap="round"/>` +
    `<path d="M30 74 V 64 M66 74 V 64" stroke="#3b2e25" stroke-width="3.5"/>` +
    `<rect x="22" y="56" width="56" height="9" rx="3" fill="#e8463a" ${OUT}/>` +
    ball(50, 42, 12) +
    `<path d="M22 60 C 12 54 12 44 18 40" fill="none" stroke="#c99a62" stroke-width="3" stroke-linecap="round"/>`,
);
const balls = (spots: Array<[number, number, string]>): string =>
  spots.map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="${c}" stroke="#3b2e25" stroke-width="1.6"/>`).join("");
const DRESSED = balls([[42, 40, "#e8463a"], [58, 50, "#ffd54a"], [40, 60, "#4aa3df"], [62, 70, "#e8463a"], [50, 66, "#ffd54a"], [36, 76, "#f58fb4"]]);
const ZIMA: SkinTier[] = [
  { name: "Снежинка", color: "#e3f2fd", art: WINTER_ART[0]! },
  { name: "Снежок", color: "#eaf4fb", art: WINTER_ART[1]! },
  { name: "Снежный ком", color: "#e1effa", art: WINTER_ART[2]! },
  { name: "Маленький снеговик", color: "#e6f0ff", art: WINTER_ART[3]! },
  { name: "Снеговик", color: "#dff0fb", art: WINTER_ART[4]! },
  { name: "Снеговик в шапке", color: "#ffe6e3", art: WINTER_ART[5]! },
  { name: "Санки", color: "#fde9d9", art: sled },
  { name: "Ёлочка в снегу", color: "#dcefe6", art: svg(SNOWY + fir(50, 86, 70, 56, "#3f9a4a", true)) },
  { name: "Нарядная ёлка", color: "#fff3cf", art: svg(SNOWY + fir(50, 88, 72, 60) + DRESSED + star(50, 18, 8)) },
  {
    name: "Зимний домик",
    color: "#d6e6fb",
    art: svg(sky("#cfe3fb") + `<path d="M0 72 Q 40 62 100 70 V 100 H 0 Z" fill="#ffffff"/>` + house(30, 56, 1.25, "#ffcf8a", "#9b6a3c", true) + `<path d="M64 30 C 60 24 68 20 64 14 M70 30 C 66 24 74 20 70 14" fill="none" stroke="#a9bfd6" stroke-width="2.5" stroke-linecap="round"/>` + flake(16, 18, 6) + flake(86, 40, 5)),
  },
  {
    name: "Новогодняя ёлка",
    color: "#fff1b8",
    art: svg(
      sky("#2f4b8a") +
        star(14, 14, 3, "#ffffff", `stroke="none"`) + star(86, 12, 3.5, "#ffffff", `stroke="none"`) + star(78, 34, 2.5, "#ffffff", `stroke="none"`) +
        `<path d="M0 78 Q 50 70 100 78 V 100 H 0 Z" fill="#ffffff"/>` +
        fir(50, 84, 70, 58) + DRESSED + star(50, 16, 8) +
        gift(18, 76, 1, "#e8463a", "#ffd54a") + gift(64, 78, 0.9, "#4aa3df", "#ffffff") + gift(80, 80, 0.7, "#ffd54a", "#e8463a"),
    ),
  },
];

// ---------- Лес ----------
const acorn = svg(
  GRASS +
    `<path d="M38 50 C 38 70 46 80 50 80 C 54 80 62 70 62 50 Z" fill="#c99a62" ${OUT}/>` +
    `<path d="M34 50 C 34 38 66 38 66 50 Z" fill="#8a5a2b" ${OUT}/>` +
    `<path d="M50 38 L 52 30" stroke="#3b2e25" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M40 46 H 60" stroke="#6b4420" stroke-width="2"/>`,
);
const cone = (() => {
  let scales = "";
  for (let row = 0; row < 4; row++) {
    for (let k = 0; k <= row; k++) {
      const x = 50 + (k - row / 2) * 9;
      const y = 40 + row * 10;
      scales += `<path d="M${x - 5} ${y} Q ${x} ${y + 10} ${x + 5} ${y} Z" fill="#9b6a3c" stroke="#3b2e25" stroke-width="1.8" stroke-linejoin="round"/>`;
    }
  }
  return svg(GRASS + `<path d="M50 30 C 72 40 70 80 50 82 C 30 80 28 40 50 30 Z" fill="#b5804a" ${OUT}/>` + scales + `<path d="M50 30 L 50 22" stroke="#3b2e25" stroke-width="3" stroke-linecap="round"/>`);
})();
const mushroom = svg(
  GRASS +
    `<path d="M42 84 C 40 72 42 62 44 56 H 56 C 58 62 60 72 58 84 Z" fill="#fff4e0" ${OUT}/>` +
    `<path d="M20 58 C 20 30 80 30 80 58 Z" fill="#e8463a" ${OUT}/>` +
    `<circle cx="36" cy="46" r="4" fill="#ffffff"/><circle cx="56" cy="40" r="5" fill="#ffffff"/><circle cx="68" cy="52" r="3.5" fill="#ffffff"/><circle cx="46" cy="54" r="3" fill="#ffffff"/>`,
);
const birch = (x: number, base: number, s: number): string =>
  `<path d="M${x - 3.5 * s} ${base} L ${x - 2.5 * s} ${base - 52 * s} L ${x + 2.5 * s} ${base - 52 * s} L ${x + 3.5 * s} ${base} Z" fill="#ffffff" ${OUT}/>` +
  `<path d="M${x - 3 * s} ${base - 14 * s} h ${4 * s} M${x} ${base - 28 * s} h ${3 * s} M${x - 2.5 * s} ${base - 40 * s} h ${3 * s}" stroke="#3b2e25" stroke-width="${2.4 * s}" stroke-linecap="round"/>` +
  `<ellipse cx="${x - 12 * s}" cy="${base - 52 * s}" rx="${13 * s}" ry="${11 * s}" fill="#a6dc6e" ${OUT}/>` +
  `<ellipse cx="${x + 12 * s}" cy="${base - 56 * s}" rx="${13 * s}" ry="${11 * s}" fill="#a6dc6e" ${OUT}/>` +
  `<ellipse cx="${x}" cy="${base - 66 * s}" rx="${14 * s}" ry="${12 * s}" fill="#b8e683" ${OUT}/>`;
const oak = (x: number, base: number, s: number): string =>
  `<path d="M${x - 6 * s} ${base} L ${x - 4 * s} ${base - 26 * s} L ${x + 4 * s} ${base - 26 * s} L ${x + 6 * s} ${base} Z" fill="#7d5230" ${OUT}/>` +
  `<circle cx="${x - 16 * s}" cy="${base - 36 * s}" r="${15 * s}" fill="#4f9a38" ${OUT}/>` +
  `<circle cx="${x + 16 * s}" cy="${base - 36 * s}" r="${15 * s}" fill="#4f9a38" ${OUT}/>` +
  `<circle cx="${x}" cy="${base - 50 * s}" r="${19 * s}" fill="#5aac3e" ${OUT}/>` +
  `<circle cx="${x - 8 * s}" cy="${base - 40 * s}" r="${2.6 * s}" fill="#c99a62"/><circle cx="${x + 10 * s}" cy="${base - 52 * s}" r="${2.6 * s}" fill="#c99a62"/>`;
const sprout = svg(
  SOIL +
    `<path d="M50 80 L 50 52" stroke="#6b4420" stroke-width="4" stroke-linecap="round"/>` +
    `<path d="M50 40 L 60 54 H 40 Z M50 50 L 63 66 H 37 Z" fill="#3f9a4a" ${OUT}/>`,
);
const LES: SkinTier[] = [
  { name: "Жёлудь", color: "#f3e3c6", art: acorn },
  { name: "Шишка", color: "#efe0cc", art: cone },
  { name: "Росток ёлочки", color: "#e3f1c8", art: sprout },
  { name: "Грибок", color: "#ffe4d6", art: mushroom },
  { name: "Ёлочка", color: "#d6efd9", art: svg(GRASS + fir(50, 86, 56, 46)) },
  { name: "Берёзка", color: "#eaf7d4", art: svg(GRASS + birch(50, 86, 1)) },
  { name: "Дуб", color: "#d5efc7", art: svg(GRASS + oak(50, 86, 1)) },
  { name: "Высокая ель", color: "#cfe9d6", art: svg(GRASS + fir(50, 90, 82, 58, "#2f7f3c")) },
  { name: "Две ёлки", color: "#d9f2e4", art: svg(GRASS + fir(32, 88, 66, 40) + fir(66, 90, 78, 46, "#2f7f3c")) },
  { name: "Роща", color: "#e6f6d4", art: svg(GRASS + birch(24, 86, 0.75) + oak(74, 88, 0.7) + fir(50, 90, 70, 40, "#2f7f3c")) },
  {
    name: "Лесная полянка",
    color: "#fff1b8",
    art: svg(
      sky("#cfeefc") + sun(82, 16, 8) +
        `<path d="M0 68 Q 30 58 60 66 T 100 60 V 100 H 0 Z" fill="#8fd46a"/>` +
        fir(14, 80, 54, 28, "#2f7f3c") + fir(32, 74, 46, 24) + birch(62, 80, 0.62) + fir(88, 82, 50, 26, "#2f7f3c") +
        place(mushroom, 34, 64, 0.32) + flowerHead(76, 88, 4, "#ffffff") + flowerHead(54, 92, 4, "#f58fb4"),
    ),
  },
];

// ---------- Космос ----------
const SPACE = sky("#24306b");
const dots = `<circle cx="14" cy="20" r="1.4" fill="#fff"/><circle cx="84" cy="14" r="1.6" fill="#fff"/><circle cx="76" cy="82" r="1.3" fill="#fff"/><circle cx="20" cy="80" r="1.5" fill="#fff"/><circle cx="90" cy="54" r="1.2" fill="#fff"/>`;
const space = (body: string): string => svg(SPACE + dots + body);
const planet = (x: number, y: number, r: number, fill: string, spot: string): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${OUT}/>` +
  `<circle cx="${x - r * 0.35}" cy="${y - r * 0.2}" r="${r * 0.22}" fill="${spot}"/><circle cx="${x + r * 0.3}" cy="${y + r * 0.35}" r="${r * 0.16}" fill="${spot}"/>`;
const rocket = (x: number, y: number, s: number, flame: boolean): string =>
  (flame ? `<path d="M${x - 6 * s} ${y + 22 * s} Q ${x} ${y + 42 * s} ${x + 6 * s} ${y + 22 * s} Z" fill="#ffb020" stroke="#e8463a" stroke-width="2"/>` : "") +
  `<path d="M${x - 10 * s} ${y + 10 * s} L ${x - 20 * s} ${y + 26 * s} L ${x - 8 * s} ${y + 22 * s} Z M${x + 10 * s} ${y + 10 * s} L ${x + 20 * s} ${y + 26 * s} L ${x + 8 * s} ${y + 22 * s} Z" fill="#e8463a" ${OUT}/>` +
  `<path d="M${x} ${y - 30 * s} C ${x + 14 * s} ${y - 16 * s} ${x + 12 * s} ${y + 10 * s} ${x + 9 * s} ${y + 24 * s} H ${x - 9 * s} C ${x - 12 * s} ${y + 10 * s} ${x - 14 * s} ${y - 16 * s} ${x} ${y - 30 * s} Z" fill="#f4f6fb" ${OUT}/>` +
  `<circle cx="${x}" cy="${y - 6 * s}" r="${6 * s}" fill="#6db3d4" ${OUT}/>`;
const KOSMOS: SkinTier[] = [
  { name: "Звёздочка", color: "#3a4688", art: space(star(50, 52, 18)) },
  { name: "Созвездие", color: "#34407e", art: space(`<path d="M24 66 L 42 40 L 64 52 L 80 28" fill="none" stroke="#9fb4ff" stroke-width="2" stroke-dasharray="3 4"/>` + star(24, 66, 8) + star(42, 40, 9) + star(64, 52, 8) + star(80, 28, 9)) },
  { name: "Комета", color: "#2f3a78", art: space(`<path d="M64 40 L 14 80 L 22 84 Z M64 40 L 20 68 L 26 74 Z" fill="#9fd3ff" opacity=".8"/>` + `<circle cx="66" cy="38" r="12" fill="#bfe3fb" ${OUT}/>`) },
  { name: "Луна", color: "#2b366f", art: space(`<path d="M60 18 A 32 32 0 1 0 82 70 A 26 26 0 1 1 60 18 Z" fill="#ffe27a" ${OUT}/>`) },
  { name: "Марс", color: "#3b2f6b", art: space(planet(50, 52, 26, "#e8743a", "#c4562a")) },
  {
    name: "Сатурн",
    color: "#2f3570",
    art: space(
      `<ellipse cx="50" cy="52" rx="40" ry="12" fill="none" stroke="#3b2e25" stroke-width="9"/><ellipse cx="50" cy="52" rx="40" ry="12" fill="none" stroke="#f0c977" stroke-width="5"/>` +
        `<circle cx="50" cy="52" r="22" fill="#f3d58a" ${OUT}/>` +
        `<path d="M14 52 C 20 62 80 62 86 52" fill="none" stroke="#3b2e25" stroke-width="9"/><path d="M14 52 C 20 62 80 62 86 52" fill="none" stroke="#f0c977" stroke-width="5"/>`,
    ),
  },
  {
    name: "Земля",
    color: "#283a74",
    art: space(`<circle cx="50" cy="52" r="28" fill="#4aa3df" ${OUT}/><path d="M34 34 C 44 32 46 44 38 48 C 30 52 32 62 26 60 C 22 52 26 40 34 34 Z M56 50 C 66 46 76 54 72 66 C 64 74 54 72 56 62 Z M54 28 C 60 26 66 30 64 34 C 58 36 54 32 54 28 Z" fill="#6fbf4a" stroke="#3b2e25" stroke-width="2"/>`),
  },
  {
    name: "Спутник",
    color: "#2a3170",
    art: space(
      `<rect x="10" y="44" width="24" height="14" fill="#4a6fd8" ${OUT}/><rect x="66" y="44" width="24" height="14" fill="#4a6fd8" ${OUT}/>` +
        `<path d="M22 44 V 58 M78 44 V 58 M34 51 H 40 M60 51 H 66" stroke="#3b2e25" stroke-width="2"/>` +
        `<rect x="38" y="38" width="24" height="26" rx="4" fill="#dfe3ea" ${OUT}/><path d="M50 38 V 26" stroke="#3b2e25" stroke-width="3"/><circle cx="50" cy="24" r="4" fill="#e8463a" ${OUT}/>`,
    ),
  },
  { name: "Ракета", color: "#323a7c", art: space(rocket(50, 46, 1, false)) },
  { name: "Ракета летит", color: "#3a3f86", art: space(planet(80, 78, 14, "#ffe27a", "#e0be52") + rocket(44, 40, 0.9, true)) },
  {
    name: "Солнце и планеты",
    color: "#fff1b8",
    art: space(
      `<circle cx="50" cy="50" r="38" fill="none" stroke="#9fb4ff" stroke-width="1.5" stroke-dasharray="3 4"/>` +
        sun(50, 50, 15) +
        planet(16, 36, 7, "#4aa3df", "#6fbf4a") + planet(80, 22, 6, "#e8743a", "#c4562a") + planet(76, 80, 8, "#f3d58a", "#e0be52") + planet(26, 82, 5, "#b48cf2", "#9370d8"),
    ),
  },
];


// ---------- Песочница (v22, Astra) ----------
const PESOK: SkinTier[] = [

    { name: "Горка песка", color: "#fff2da", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M13 66 Q24 62 32 49 Q42 32 51 34 Q59 34 68 48 Q77 61 87 65 Q91 71 74 73 Q49 77 24 73 Q11 72 13 66Z" fill="#efb75f"/><path d="M35 51 Q40 42 46 40" fill="none" stroke="#ffe19a"/></g><g fill="#bf8041"><circle cx="57" cy="58" r="2"/><circle cx="64" cy="62" r="1.6"/><circle cx="35" cy="66" r="1.7"/></g></svg>` },
    { name: "Куличик", color: "#fff0dc", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M29 34 Q50 27 71 34 L81 72 Q83 80 50 81 Q17 80 19 72Z" fill="#efb75f"/><ellipse cx="50" cy="34" rx="21" ry="6" fill="#ffdc91"/><path d="M33 45 L28 65" fill="none" stroke="#ffdc91"/></g><g fill="#bf8041"><circle cx="65" cy="65" r="2"/><circle cx="60" cy="70" r="1.6"/></g></svg>` },
    { name: "Песчаная башенка", color: "#fff4df", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M26 42 L74 42 L80 77 Q50 86 20 77Z" fill="#eeb05a"/><path d="M25 23 H36 V32 H44 V22 H56 V32 H64 V23 H75 V44 Q50 52 25 44Z" fill="#ffcf78"/><path d="M32 53 L29 69" fill="none" stroke="#ffdb91"/></g><circle cx="66" cy="71" r="2" fill="#bd7f40"/></svg>` },
    { name: "Башенка с окошком", color: "#ffedda", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M26 40 H74 L80 79 Q50 87 20 79Z" fill="#eeb05a"/><path d="M25 21 H36 V30 H44 V20 H56 V30 H64 V21 H75 V42 Q50 49 25 42Z" fill="#ffcf78"/><path d="M41 68 V59 Q41 53 50 49 Q59 53 59 59 V68Z" fill="#975c39"/><path d="M39 70 H61" fill="none" stroke="#ffdc91"/></g></svg>` },
    { name: "Башенка с флажком", color: "#fff2df", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M50 37 V8" fill="none"/><path d="M50 8 Q60 5 72 13 Q64 21 50 19Z" fill="#ef6955"/><path d="M26 48 H74 L80 83 Q50 90 20 83Z" fill="#eeb05a"/><path d="M25 31 H36 V39 H44 V30 H56 V39 H64 V31 H75 V50 Q50 57 25 50Z" fill="#ffcf78"/><path d="M42 75 V67 Q42 60 50 57 Q58 60 58 67 V75Z" fill="#975c39"/><path d="M40 77 H60" fill="none" stroke="#ffdc91"/></g></svg>` },
    { name: "Две башенки", color: "#fff1db", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M73 37 V11 M27 48 V23" fill="none"/><path d="M73 11 Q83 9 92 16 L73 23Z" fill="#ef6955"/><path d="M27 23 Q36 21 43 27 L27 34Z" fill="#62bdb0"/><path d="M13 59 H41 L45 81 Q28 87 9 81Z M58 47 H87 L92 80 Q73 87 54 80Z" fill="#eeb05a"/><path d="M12 44 H21 V51 H32 V44 H42 V59 Q27 64 12 59Z M57 32 H67 V40 H78 V32 H88 V48 Q73 53 57 48Z" fill="#ffcf78"/><path d="M22 74 V70 Q22 66 27 64 Q32 66 32 70 V74Z M67 68 V61 Q67 56 73 54 Q79 56 79 61 V68Z" fill="#975c39"/></g></svg>` },
    { name: "Песчаные ворота", color: "#ffefdf", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M24 38 V16 M76 38 V16" fill="none"/><path d="M24 16 Q32 13 40 20 L24 26Z" fill="#62bdb0"/><path d="M76 16 Q85 13 93 20 L76 26Z" fill="#ef6955"/><path d="M29 48 Q50 38 71 48 V82 H60 V69 Q60 57 50 55 Q40 57 40 69 V82 H29Z" fill="#f8c678"/><path d="M13 47 H35 L39 82 Q24 87 9 82Z M65 47 H87 L91 82 Q76 87 61 82Z" fill="#eeb05a"/><path d="M12 33 H20 V39 H28 V33 H36 V48 Q24 52 12 48Z M64 33 H72 V39 H80 V33 H88 V48 Q76 52 64 48Z" fill="#ffcf78"/><path d="M20 66 V60 Q20 56 24 54 Q28 56 28 60 V66Z M72 66 V60 Q72 56 76 54 Q80 56 80 60 V66Z" fill="#975c39"/></g></svg>` },
    { name: "Стена с зубцами", color: "#fff3dc", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M18 39 V15 M82 39 V15" fill="none"/><path d="M18 15 Q27 13 35 19 L18 26Z" fill="#62bdb0"/><path d="M82 15 Q89 13 96 19 L82 26Z" fill="#ef6955"/><path d="M22 45 H35 V52 H44 V44 H56 V52 H65 V45 H78 V84 H60 V71 Q60 60 50 57 Q40 60 40 71 V84 H22Z" fill="#f8c678"/><path d="M9 46 H27 L31 83 Q18 87 5 83Z M73 46 H91 L95 83 Q82 87 69 83Z" fill="#eeb05a"/><path d="M7 32 H14 V38 H21 V32 H29 V47 Q18 51 7 47Z M71 32 H79 V38 H86 V32 H93 V47 Q82 51 71 47Z" fill="#ffcf78"/><path d="M15 66 V60 Q15 56 18 55 Q22 56 22 60 V66Z M78 66 V60 Q78 56 82 55 Q85 56 85 60 V66Z" fill="#975c39"/></g></svg>` },
    { name: "Высокий замок", color: "#fff0dc", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M50 26 V6" fill="none"/><path d="M50 6 Q60 4 69 11 L50 17Z" fill="#ef6955"/><path d="M36 30 H64 L67 62 H33Z" fill="#e6a250"/><path d="M34 21 H43 V27 H56 V21 H66 V34 H34Z" fill="#ffd58a"/><path d="M46 49 V44 Q46 40 50 38 Q54 40 54 44 V49Z" fill="#975c39"/><path d="M21 50 H35 V56 H44 V50 H56 V56 H65 V50 H79 V85 H60 V74 Q60 63 50 60 Q40 63 40 74 V85 H21Z" fill="#f8c678"/><path d="M9 48 H27 L31 84 Q18 88 5 84Z M73 48 H91 L95 84 Q82 88 69 84Z" fill="#eeb05a"/><path d="M7 35 H14 V41 H21 V35 H29 V50 Q18 54 7 50Z M71 35 H79 V41 H86 V35 H93 V50 Q82 54 71 50Z" fill="#ffcf78"/><path d="M15 68 V61 Q15 58 18 56 Q22 58 22 61 V68Z M78 68 V61 Q78 58 82 56 Q85 58 85 61 V68Z" fill="#975c39"/></g></svg>` },
    { name: "Замок со рвом", color: "#fff4df", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="50" cy="78" rx="47" ry="16" fill="#79d0d1"/><ellipse cx="50" cy="75" rx="39" ry="10" fill="#f4cb84"/><path d="M50 25 V5" fill="none"/><path d="M50 5 Q60 4 69 10 L50 16Z" fill="#ef6955"/><path d="M37 28 H63 L65 58 H35Z" fill="#e6a250"/><path d="M35 19 H43 V25 H56 V19 H65 V31 H35Z" fill="#ffd58a"/><path d="M46 46 V41 Q46 37 50 35 Q54 37 54 41 V46Z" fill="#975c39"/><path d="M23 46 H36 V52 H45 V46 H55 V52 H64 V46 H77 V77 H59 V68 Q59 58 50 55 Q41 58 41 68 V77 H23Z" fill="#f8c678"/><path d="M13 44 H29 L33 76 Q21 80 9 76Z M71 44 H87 L91 76 Q79 80 67 76Z" fill="#eeb05a"/><path d="M11 32 H18 V37 H24 V32 H31 V46 Q21 50 11 46Z M69 32 H76 V37 H82 V32 H89 V46 Q79 50 69 46Z" fill="#ffcf78"/><path d="M18 63 V57 Q18 54 21 52 Q25 54 25 57 V63Z M75 63 V57 Q75 54 79 52 Q82 54 82 57 V63Z" fill="#975c39"/><path d="M17 84 Q21 87 26 86 M69 87 Q75 88 81 84" fill="none" stroke="#d5f6ed"/></g></svg>` },
    { name: "Замок с мостиком", color: "#fff0de", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="50" cy="77" rx="47" ry="16" fill="#79d0d1"/><ellipse cx="50" cy="74" rx="39" ry="10" fill="#f4cb84"/><path d="M50 25 V5 M21 36 V18 M79 36 V18" fill="none"/><path d="M50 5 Q60 3 70 10 L50 16Z" fill="#ef6955"/><path d="M21 18 Q29 16 35 21 L21 27Z M79 18 Q87 16 93 21 L79 27Z" fill="#62bdb0"/><path d="M37 28 H63 L65 58 H35Z" fill="#e6a250"/><path d="M35 19 H43 V25 H56 V19 H65 V31 H35Z" fill="#ffd58a"/><path d="M46 46 V41 Q46 37 50 35 Q54 37 54 41 V46Z" fill="#975c39"/><path d="M23 46 H36 V52 H45 V46 H55 V52 H64 V46 H77 V77 H59 V68 Q59 58 50 55 Q41 58 41 68 V77 H23Z" fill="#f8c678"/><path d="M13 44 H29 L33 76 Q21 80 9 76Z M71 44 H87 L91 76 Q79 80 67 76Z" fill="#eeb05a"/><path d="M11 32 H18 V37 H24 V32 H31 V46 Q21 50 11 46Z M69 32 H76 V37 H82 V32 H89 V46 Q79 50 69 46Z" fill="#ffcf78"/><path d="M18 63 V57 Q18 54 21 52 Q25 54 25 57 V63Z M75 63 V57 Q75 54 79 52 Q82 54 82 57 V63Z" fill="#975c39"/><path d="M42 74 H58 L67 94 Q50 97 33 94Z" fill="#d98d55"/><path d="M41 81 Q50 83 59 81 M38 88 Q50 90 62 88" fill="none" stroke="#915939"/><path d="M16 83 Q21 86 26 85 M74 85 Q79 86 84 82" fill="none" stroke="#d5f6ed"/></g></svg>` }
];



// ---------- Торт (v22, Astra) ----------
const TORT: SkinTier[] = [
    { name: "Корж", color: "#fff2d8", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round"><path d="M18 45 Q50 32 82 45 V59 C82 71 18 71 18 59 Z" fill="#df9852"/><ellipse cx="50" cy="45" rx="32" ry="10" fill="#ffc879"/></g><path d="M29 59 L33 60 M42 62 H46 M65 60 L69 59" fill="none" stroke="#ac693c" stroke-width="3" stroke-linecap="round"/></svg>` },
    { name: "Корж с кремом", color: "#ffeddf", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round"><path d="M15 47 Q50 33 85 47 V62 C85 74 15 74 15 62 Z" fill="#e8a158"/><path d="M15 46 C15 32 85 32 85 46 Q87 53 78 53 Q73 61 65 55 Q58 62 49 56 Q38 62 31 55 Q21 59 18 52 Q13 52 15 46 Z" fill="#fff1bd"/></g><path d="M29 44 Q43 38 62 41" fill="none" stroke="#efca80" stroke-width="3" stroke-linecap="round"/></svg>` },
    { name: "Два коржа", color: "#fff4dc", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round"><path d="M14 54 Q50 44 86 54 V66 C86 78 14 78 14 66 Z" fill="#df9852"/><path d="M14 48 H86 V56 Q80 63 72 58 Q64 65 55 60 Q44 66 35 60 Q22 63 14 56 Z" fill="#fff1bd"/><path d="M14 36 Q50 23 86 36 V48 C86 60 14 60 14 48 Z" fill="#eda85f"/><ellipse cx="50" cy="36" rx="36" ry="9" fill="#ffca80"/></g></svg>` },
    { name: "Розовая глазурь", color: "#fff3d5", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round"><path d="M12 36 Q50 23 88 36 V69 C88 81 12 81 12 69 Z" fill="#eca45b"/><path d="M12 51 Q50 62 88 51 V58 Q50 71 12 58 Z" fill="#fff1bd"/><path d="M12 36 C12 22 88 22 88 36 Q89 42 83 43 V48 Q79 56 75 48 V45 Q64 49 54 46 V52 Q50 59 46 52 V47 Q34 49 27 44 Q20 54 17 43 Q12 42 12 36 Z" fill="#ff8fa6"/></g><path d="M27 33 Q40 29 53 30" fill="none" stroke="#ffdae2" stroke-width="3" stroke-linecap="round"/></svg>` },
    { name: "Ягодная дорожка", color: "#fff0db", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round"><path d="M10 40 Q50 25 90 40 V71 C90 83 10 83 10 71 Z" fill="#eca45b"/><path d="M10 54 Q50 66 90 54 V61 Q50 74 10 61 Z" fill="#fff1bd"/><path d="M10 40 C10 25 90 25 90 40 Q91 46 83 46 Q79 57 74 48 Q62 51 54 48 V53 Q50 60 46 53 V49 Q33 51 25 46 Q19 54 16 46 Q10 45 10 40 Z" fill="#ff8fa6"/><circle cx="24" cy="36" r="6" fill="#ed525e"/><circle cx="41" cy="40" r="6" fill="#b378ca"/><circle cx="59" cy="40" r="6" fill="#ed525e"/><circle cx="76" cy="36" r="6" fill="#b378ca"/></g></svg>` },
    { name: "Второй ярус", color: "#fff3de", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round"><path d="M9 49 Q50 35 91 49 V75 C91 87 9 87 9 75 Z" fill="#eca45b"/><path d="M9 62 Q50 73 91 62 V68 Q50 80 9 68 Z" fill="#fff1bd"/><path d="M9 49 C9 35 91 35 91 49 Q88 56 79 54 Q75 63 70 56 Q59 60 49 56 Q37 62 29 55 Q16 59 9 49 Z" fill="#ff8fa6"/><path d="M27 28 Q50 18 73 28 V45 C73 54 27 54 27 45 Z" fill="#ffc879"/><ellipse cx="50" cy="28" rx="23" ry="7" fill="#fff1bd"/><circle cx="18" cy="46" r="5" fill="#ed525e"/><circle cx="82" cy="46" r="5" fill="#b378ca"/></g></svg>` },
    { name: "Сливочные завитки", color: "#fef0df", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round"><path d="M8 52 Q50 39 92 52 V77 C92 89 8 89 8 77 Z" fill="#eca45b"/><path d="M8 65 Q50 76 92 65 V71 Q50 83 8 71 Z" fill="#fff1bd"/><path d="M8 52 C8 38 92 38 92 52 Q88 59 80 56 Q75 66 70 59 Q58 63 48 59 Q36 65 28 58 Q16 62 8 52 Z" fill="#ff8fa6"/><path d="M26 29 Q50 19 74 29 V48 C74 57 26 57 26 48 Z" fill="#ffc879"/><ellipse cx="50" cy="29" rx="24" ry="7" fill="#fff1bd"/><path d="M27 29 C25 23 34 23 34 16 Q45 22 41 29 Q35 34 27 29 Z M43 31 C41 24 50 24 50 16 Q62 23 57 31 Q50 35 43 31 Z M60 29 C58 23 66 22 67 15 Q78 22 73 29 Q67 33 60 29 Z" fill="#fff8df"/><circle cx="17" cy="49" r="5" fill="#ed525e"/><circle cx="83" cy="49" r="5" fill="#b378ca"/></g></svg>` },
    { name: "Вишнёвый торт", color: "#fff3da", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M8 56 Q50 42 92 56 V79 C92 91 8 91 8 79 Z" fill="#eca45b"/><path d="M8 68 Q50 79 92 68 V74 Q50 85 8 74 Z" fill="#fff1bd"/><path d="M8 56 C8 42 92 42 92 56 Q87 63 80 60 Q75 69 70 62 Q59 66 49 62 Q36 68 28 61 Q16 66 8 56 Z" fill="#ff8fa6"/><path d="M25 34 Q50 24 75 34 V52 C75 61 25 61 25 52 Z" fill="#ffc879"/><ellipse cx="50" cy="34" rx="25" ry="7" fill="#fff1bd"/><path d="M26 34 Q24 30 29 27 Q34 25 34 20 Q45 29 40 34 Q33 38 26 34 Z M60 34 Q57 30 63 26 Q67 24 67 20 Q78 28 74 34 Q67 38 60 34 Z" fill="#fff8df"/><circle cx="50" cy="29" r="9" fill="#ee4759"/><path d="M50 21 Q50 13 57 10" fill="none"/><path d="M56 11 Q65 3 73 10 Q65 17 56 11 Z" fill="#78be64"/><circle cx="17" cy="52" r="5" fill="#ed525e"/><circle cx="83" cy="52" r="5" fill="#b378ca"/></g><circle cx="47" cy="26" r="2" fill="#ffe1da"/></svg>` },
    { name: "Полосатая свечка", color: "#fff1e1", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M7 59 Q50 46 93 59 V82 C93 94 7 94 7 82 Z" fill="#eca45b"/><path d="M7 71 Q50 82 93 71 V77 Q50 88 7 77 Z" fill="#fff1bd"/><path d="M7 59 C7 45 93 45 93 59 Q88 66 80 63 Q75 72 70 65 Q59 69 49 65 Q36 71 28 64 Q15 69 7 59 Z" fill="#ff8fa6"/><path d="M25 39 Q50 29 75 39 V55 C75 64 25 64 25 55 Z" fill="#ffc879"/><ellipse cx="50" cy="39" rx="25" ry="7" fill="#fff1bd"/><rect x="45" y="13" width="10" height="25" rx="3" fill="#61c7bd"/><path d="M47 22 L53 18 M47 31 L53 27" stroke="#fff8df"/><path d="M50 13 V8" fill="none"/><path d="M26 39 Q24 34 30 31 Q34 28 34 25 Q45 33 40 39 Q34 43 26 39 Z M45 41 Q43 36 49 33 Q53 30 53 27 Q63 35 59 41 Q52 45 45 41 Z" fill="#fff8df"/><circle cx="66" cy="35" r="7" fill="#ee4759"/><path d="M66 28 Q66 21 72 19" fill="none"/><circle cx="16" cy="56" r="5" fill="#ed525e"/><circle cx="84" cy="56" r="5" fill="#b378ca"/></g></svg>` },
    { name: "Три свечки", color: "#fff4de", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M7 61 Q50 48 93 61 V83 C93 95 7 95 7 83 Z" fill="#eca45b"/><path d="M7 73 Q50 84 93 73 V79 Q50 90 7 79 Z" fill="#fff1bd"/><path d="M7 61 C7 47 93 47 93 61 Q88 68 80 65 Q75 74 70 67 Q59 71 49 67 Q36 73 28 66 Q15 71 7 61 Z" fill="#ff8fa6"/><path d="M24 41 Q50 31 76 41 V57 C76 66 24 66 24 57 Z" fill="#ffc879"/><ellipse cx="50" cy="41" rx="26" ry="7" fill="#fff1bd"/><rect x="29" y="20" width="9" height="20" rx="2" fill="#bd89df"/><rect x="45" y="13" width="10" height="26" rx="2" fill="#61c7bd"/><rect x="62" y="20" width="9" height="20" rx="2" fill="#ff9b61"/><path d="M33 19 V15 M50 12 V8 M67 19 V15" fill="none"/><path d="M31 30 L36 26 M47 23 L53 19 M47 32 L53 28 M64 30 L69 26" stroke="#fff8df"/><path d="M25 42 Q24 37 30 35 Q34 33 34 29 Q45 37 40 42 Q34 46 25 42 Z M43 44 Q41 39 47 36 Q51 34 51 30 Q62 38 57 44 Q50 47 43 44 Z" fill="#fff8df"/><circle cx="66" cy="41" r="7" fill="#ee4759"/><circle cx="16" cy="58" r="5" fill="#ed525e"/><circle cx="84" cy="58" r="5" fill="#b378ca"/></g></svg>` },
    { name: "Праздничный торт", color: "#e6f6f4", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="50" cy="86" rx="47" ry="9" fill="#75d2c5"/><path d="M8 62 Q50 49 92 62 V82 C92 94 8 94 8 82 Z" fill="#eca45b"/><path d="M8 74 Q50 85 92 74 V80 Q50 91 8 80 Z" fill="#fff1bd"/><path d="M8 62 C8 48 92 48 92 62 Q87 69 80 66 Q75 75 70 68 Q59 72 49 68 Q36 74 28 67 Q16 72 8 62 Z" fill="#ff8fa6"/><path d="M24 44 Q50 34 76 44 V58 C76 67 24 67 24 58 Z" fill="#ffc879"/><ellipse cx="50" cy="44" rx="26" ry="7" fill="#fff1bd"/><rect x="29" y="26" width="9" height="17" rx="2" fill="#bd89df"/><rect x="45" y="19" width="10" height="23" rx="2" fill="#61c7bd"/><rect x="62" y="26" width="9" height="17" rx="2" fill="#ff9b61"/><path d="M31 35 L36 31 M47 30 L53 26 M64 35 L69 31" stroke="#fff8df"/><path d="M33 24 C24 22 31 15 34 11 C34 16 42 22 33 24 Z M50 17 C40 15 48 8 51 3 C51 9 60 15 50 17 Z M67 24 C58 22 65 15 68 11 C68 16 76 22 67 24 Z" fill="#ffbf46"/><path d="M25 45 Q24 40 30 38 Q34 36 34 32 Q45 40 40 45 Q34 49 25 45 Z M43 47 Q41 42 47 39 Q51 37 51 33 Q62 41 57 47 Q50 50 43 47 Z" fill="#fff8df"/><circle cx="66" cy="44" r="7" fill="#ee4759"/><circle cx="16" cy="59" r="5" fill="#ed525e"/><circle cx="84" cy="59" r="5" fill="#b378ca"/></g><path d="M10 30 L14 34 M84 21 L87 17" fill="none" stroke="#ee778e" stroke-width="4" stroke-linecap="round"/><circle cx="15" cy="19" r="3" fill="#ffc34e"/><circle cx="89" cy="35" r="3" fill="#ad84d5"/></svg>` },
  ];



// ---------- Море (v22, Astra) ----------
const MORE: SkinTier[] = [
    { name: "Брёвнышко", color: "#e4f7fa", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g transform="rotate(-12 50 50)" stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M27 37H71C84 37 84 63 71 63H27Z" fill="#d7975c"/><ellipse cx="27" cy="50" rx="10" ry="13" fill="#ffda96"/><path d="M26 45Q32 49 27 55M45 44H64" fill="none" stroke="#a36540"/></g><path d="M22 73Q30 78 38 73M58 70Q66 75 74 70" fill="none" stroke="#63bdcf" stroke-width="3" stroke-linecap="round"/></svg>` },
    { name: "Плотик", color: "#def5fa", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g transform="rotate(-10 50 50)" stroke="#3b2e25" stroke-width="3" stroke-linejoin="round"><rect x="20" y="28" width="61" height="15" rx="7" fill="#edb576"/><rect x="15" y="42" width="70" height="16" rx="8" fill="#d99356"/><rect x="18" y="57" width="63" height="16" rx="8" fill="#edb576"/><path d="M30 29H36V72H30ZM64 29H70V72H64Z" fill="#ffdd86"/></g><path d="M19 81Q29 86 39 81M61 78Q70 83 79 78" fill="none" stroke="#63bdcf" stroke-width="3" stroke-linecap="round"/></svg>` },
    { name: "Плот с веслом", color: "#e5f8ef", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><g transform="rotate(-8 50 55)"><rect x="16" y="32" width="67" height="16" rx="8" fill="#edb576"/><rect x="11" y="47" width="77" height="16" rx="8" fill="#d99356"/><rect x="15" y="62" width="69" height="16" rx="8" fill="#edb576"/><path d="M25 33H31V77H25ZM67 33H73V77H67Z" fill="#ffdd86"/></g><path d="M75 16Q78 13 81 17L46 56Q47 60 43 65L28 81Q24 85 18 79L14 75Q11 72 15 68L32 52Q36 49 40 51Z" fill="#ffae58"/><path d="M22 73L35 60" stroke="#c37039"/></g></svg>` },
    { name: "Гребная лодочка", color: "#e0f5ff", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M8 49Q44 29 92 42Q59 73 8 49Z" fill="#f7cd89"/><path d="M8 49Q50 58 92 42Q83 68 66 74Q28 85 8 49Z" fill="#ee8165"/><path d="M29 43L49 50L62 47L42 40Z" fill="#be8050"/><path d="M68 20Q71 17 74 21L45 56Q47 60 42 66L29 80Q25 83 20 78Q16 74 19 70L32 55Q36 51 40 52Z" fill="#ffb85f"/></g><path d="M48 84Q57 89 66 84M72 80Q80 84 87 79" fill="none" stroke="#63bdcf" stroke-width="3" stroke-linecap="round"/></svg>` },
    { name: "Первый парус", color: "#fff1d6", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M58 16V67" fill="none"/><path d="M54 18Q30 31 19 57Q36 53 54 57Z" fill="#ffbf50"/><path d="M9 63Q48 72 91 58Q84 79 68 84H33Q19 81 9 63Z" fill="#ee8165"/><path d="M18 69Q50 77 83 65" fill="none" stroke="#ffcd95"/></g><path d="M21 90Q30 94 39 90M65 90Q74 94 83 89" fill="none" stroke="#63bdcf" stroke-width="3" stroke-linecap="round"/></svg>` },
    { name: "Два паруса", color: "#e4f7fb", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M52 12V68" fill="none"/><path d="M48 16Q24 32 12 59Q32 54 48 59Z" fill="#ffbd50"/><path d="M56 21Q72 37 86 55Q68 52 56 58Z" fill="#54c5c0"/><path d="M7 64Q50 72 93 58Q86 79 68 85H32Q18 81 7 64Z" fill="#eb8063"/><path d="M17 70Q49 77 84 66" fill="none" stroke="#ffd296"/></g><path d="M18 91Q29 96 40 91M62 91Q73 96 85 90" fill="none" stroke="#63bdcf" stroke-width="3" stroke-linecap="round"/></svg>` },
    { name: "Нарядный парусник", color: "#fff0dd", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M52 6V68" fill="none"/><path d="M53 6Q60 3 71 9L53 15Z" fill="#ef6861"/><path d="M48 18Q24 32 11 59Q31 54 48 59Z" fill="#ffc653"/><path d="M48 32V41L22 43Q26 37 31 32Z" fill="#fff4cd" stroke="none"/><path d="M56 21Q73 37 88 56Q70 53 56 59Z" fill="#59c9c1"/><path d="M7 64Q48 72 93 58Q85 80 68 86H32Q17 81 7 64Z" fill="#ed8165"/><g fill="#ffe6a4"><circle cx="36" cy="75" r="4"/><circle cx="52" cy="75" r="4"/><circle cx="68" cy="73" r="4"/></g></g><path d="M13 91Q23 96 33 91Q43 96 53 91Q63 96 73 91Q81 95 89 90" fill="none" stroke="#63bdcf" stroke-width="3" stroke-linecap="round"/></svg>` },
    { name: "Большая шхуна", color: "#e2f7f6", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M37 8V66M67 16V66" fill="none"/><path d="M38 8L54 12L38 17Z" fill="#ef6861"/><path d="M33 20Q17 32 7 57L33 54Z" fill="#62c9c2"/><path d="M42 19L60 23Q54 39 59 54L42 51Q47 36 42 19Z" fill="#ffbd50"/><path d="M71 27Q84 37 93 53L71 54Z" fill="#fff2ba"/><path d="M14 63V54H31V65Z" fill="#ffcd7a"/><path d="M5 61Q48 71 95 57Q88 79 71 86H30Q15 81 5 61Z" fill="#db7560"/><path d="M14 67Q49 76 86 65" fill="none" stroke="#ffcb81"/><g fill="#ffecb9"><circle cx="34" cy="77" r="3"/><circle cx="50" cy="78" r="3"/><circle cx="66" cy="76" r="3"/></g></g><path d="M9 91Q19 96 29 91Q39 96 49 91Q59 96 69 91Q79 96 90 90" fill="none" stroke="#63bdcf" stroke-width="3" stroke-linecap="round"/></svg>` },
    { name: "Корабли рядом", color: "#e5f5ff", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M72 11V47" fill="none"/><path d="M68 15L49 39H68Z" fill="#f7a5a2"/><path d="M76 18L91 38H76Z" fill="#ffe8ad"/><path d="M48 43Q73 48 95 41Q89 56 79 58H61Z" fill="#50b6b4"/><path d="M29 20V71M54 28V72" fill="none"/><path d="M30 20L44 24L30 28Z" fill="#ed7060"/><path d="M25 31Q12 42 5 61L25 59Z" fill="#63ccc2"/><path d="M33 31L47 35Q43 47 47 60L33 58Q37 45 33 31Z" fill="#ffc359"/><path d="M58 41L73 61H58Z" fill="#ffe8a0"/><path d="M4 65Q42 74 80 63Q73 83 58 87H24Q11 80 4 65Z" fill="#e37b60"/><g fill="#ffebb6"><circle cx="29" cy="77" r="3"/><circle cx="43" cy="78" r="3"/><circle cx="57" cy="76" r="3"/></g></g><path d="M8 92Q18 96 27 92M57 92Q67 96 77 91M82 63Q88 66 95 61" fill="none" stroke="#63bdcf" stroke-width="3" stroke-linecap="round"/></svg>` },
    { name: "Тихая пристань", color: "#fff2d8", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M4 58Q28 50 50 57T96 55V87Q73 96 49 90T4 88Z" fill="#a1dfdf"/><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M69 16V48" fill="none"/><path d="M65 20L48 41H65Z" fill="#ffaaa0"/><path d="M73 24L87 40H73Z" fill="#ffdf92"/><path d="M46 45Q69 50 92 43Q86 55 77 58H58Z" fill="#50b6b4"/><path d="M29 27V72M51 34V72" fill="none"/><path d="M29 27L41 30L29 34Z" fill="#ef7060"/><path d="M25 37Q13 47 6 62L25 60Z" fill="#65cbc0"/><path d="M33 38L45 41Q42 51 45 61L33 59Z" fill="#ffc055"/><path d="M55 45L69 62H55Z" fill="#ffeaab"/><path d="M4 66Q39 73 74 64Q69 81 54 85H23Q11 80 4 66Z" fill="#e37b60"/><g fill="#ffebb6"><circle cx="28" cy="76" r="3"/><circle cx="42" cy="77" r="3"/></g><path d="M76 73V87M91 73V85" stroke="#895c42" stroke-width="5"/><rect x="70" y="65" width="27" height="8" rx="2" fill="#d79a62"/><path d="M76 66V60M92 66V58" stroke="#895c42" stroke-width="4"/></g><path d="M12 90Q21 94 30 90M49 89Q58 93 67 88" fill="none" stroke="#56aec1" stroke-width="3" stroke-linecap="round"/></svg>` },
    { name: "Бухта с маяком", color: "#e4f6ff", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="17" cy="16" r="9" fill="#ffd168"/><path d="M4 55Q30 48 53 56T96 53V87Q73 96 48 90T4 88Z" fill="#91d8df"/><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M61 54Q65 44 76 43Q90 40 97 50V56Q82 61 61 54Z" fill="#99c878"/><path d="M73 47L77 22H87L91 47Z" fill="#fff4cf"/><path d="M76 29H88L89 36H75Z" fill="#ee7961" stroke="none"/><rect x="75" y="14" width="14" height="10" rx="2" fill="#ffd05a"/><path d="M72 15L82 6L92 15Z" fill="#ed795e"/><path d="M51 27V54" fill="none"/><path d="M47 31L34 47H47Z" fill="#ffac9c"/><path d="M55 34L66 46H55Z" fill="#ffdf92"/><path d="M32 51Q50 55 68 49Q63 61 54 62H41Z" fill="#53b8b4"/><path d="M25 35V76M46 44V76" fill="none"/><path d="M25 35L36 38L25 42Z" fill="#ed7060"/><path d="M21 45Q11 54 5 66L21 64Z" fill="#62c8bc"/><path d="M29 45L40 48Q37 56 40 65L29 63Z" fill="#ffc055"/><path d="M50 53L62 66H50Z" fill="#ffe9ab"/><path d="M4 69Q36 77 68 67Q62 84 49 87H21Q9 81 4 69Z" fill="#e37b60"/><g fill="#ffeab2"><circle cx="26" cy="79" r="3"/><circle cx="40" cy="79" r="3"/></g><path d="M74 75V87M90 75V84" stroke="#895c42" stroke-width="5"/><rect x="68" y="67" width="29" height="8" rx="2" fill="#d79a62"/><path d="M74 67V62M91 67V60" stroke="#895c42" stroke-width="4"/></g><path d="M10 92Q19 96 28 92M48 91Q58 95 67 90" fill="none" stroke="#56aec1" stroke-width="3" stroke-linecap="round"/></svg>` },
  ];


// ---------- Ферма (v22, Astra) ----------
const FERMA: SkinTier[] = [
    { name: "Яичко", color: "#e5f3d3", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="78" rx="25" ry="5" fill="#c5dcad"/><path d="M50 23 C63 23 74 49 74 59 C74 73 64 79 50 79 C36 79 26 72 26 59 C26 46 38 23 50 23Z" fill="#ffe9ba" stroke="#3b2e25" stroke-width="3"/><path d="M37 49 Q39 41 44 36" fill="none" stroke="#fff8e5" stroke-width="5" stroke-linecap="round"/></svg>` },
    { name: "Треснуло яичко", color: "#fff1d7", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="80" rx="28" ry="5" fill="#e5d3ad"/><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M50 19 C64 19 76 47 76 59 C76 74 65 81 50 81 C35 81 24 74 24 59 C24 45 37 19 50 19Z" fill="#ffe5b1"/><path d="M26 52 L37 55 L42 46 L51 58 L60 49 L65 55 L74 50" fill="none"/><path d="M20 37 L15 33 M77 35 L82 29" fill="none" stroke="#d78b39"/></g></svg>` },
    { name: "Клювик наружу", color: "#e6f4ef", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="82" rx="29" ry="5" fill="#c4dfcc"/><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M49 17 C64 17 77 46 77 60 C77 75 65 83 50 83 C34 83 22 75 22 60 C22 46 35 17 49 17Z" fill="#ffe7b7"/><path d="M30 51 L39 48 L43 36 L51 44 L61 38 L64 49 L73 54 L64 61 L60 69 L50 62 L40 66 L39 57Z" fill="#ffd449"/><path d="M56 50 L79 55 L57 61Z" fill="#ff9544"/></g><circle cx="49" cy="49" r="3" fill="#3b2e25"/></svg>` },
    { name: "Цыплёнок в скорлупке", color: "#fbe6da", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="85" rx="31" ry="5" fill="#e9cbb6"/><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M26 66 C20 54 24 35 37 29 Q32 19 39 20 L47 26 Q46 12 53 16 Q58 19 56 27 C72 28 79 47 72 65Z" fill="#ffd449"/><path d="M58 45 L77 50 L58 56Z" fill="#ff9440"/><path d="M19 56 L31 62 L40 52 L51 64 L62 54 L69 62 L80 54 C80 75 68 86 50 86 C32 86 20 76 19 56Z" fill="#ffebc3"/></g><circle cx="53" cy="41" r="3.4" fill="#3b2e25"/><ellipse cx="46" cy="50" rx="5" ry="3" fill="#ffb173"/></svg>` },
    { name: "Пушистый цыплёнок", color: "#e8f3d4", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="86" rx="32" ry="5" fill="#cadfae"/><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M42 70 V83 L34 86 M42 83 L47 86 M62 69 V82 L55 85 M62 82 L68 85" fill="none"/><path d="M26 45 Q22 29 38 23 Q33 12 40 14 L48 21 Q48 9 54 12 Q60 14 58 22 C73 23 79 37 76 49 C83 66 68 78 50 78 C30 78 17 66 14 49 L26 54Z" fill="#ffd347"/><path d="M68 38 L86 44 L69 50Z" fill="#ff9944"/><path d="M33 51 Q40 45 54 51 Q51 66 39 64 Q33 62 33 57" fill="#ffbd36"/></g><circle cx="62" cy="35" r="3.5" fill="#3b2e25"/><ellipse cx="59" cy="45" rx="5" ry="3" fill="#ffac75"/></svg>` },
    { name: "Рыжая курочка", color: "#fff0cd", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="87" rx="36" ry="5" fill="#e6d5a9"/><g stroke="#3b2e25" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M41 70 V83 L33 87 M41 83 L47 86 M59 70 V82 L52 86 M59 82 L65 85" fill="none"/><path d="M52 28 Q43 17 50 15 Q54 13 57 20 Q56 9 62 10 Q68 11 66 19 Q72 12 75 17 Q78 23 69 29Z" fill="#ee6552"/><path d="M30 45 Q17 23 11 31 Q8 35 18 48 Q4 40 8 52 Q12 61 23 63 C28 78 50 81 65 72 Q80 65 77 47 Q83 31 69 24 Q51 17 47 38 Q43 48 30 45Z" fill="#efaa58"/><path d="M74 34 L90 39 L75 45Z" fill="#ffc444"/><path d="M30 52 Q42 45 58 51 Q54 65 41 66 Q32 65 30 52Z" fill="#dc8049"/></g><circle cx="66" cy="32" r="3" fill="#3b2e25"/></svg>` },
    { name: "Курочка с малышом", color: "#e3f3e8", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="84" rx="44" ry="6" fill="#bedcc0"/><g stroke="#3b2e25" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M32 68 V80 L26 84 M32 80 L37 83 M48 68 V80 L43 83" fill="none"/><path d="M41 27 Q34 16 40 15 L46 20 Q44 9 50 11 Q55 12 54 19 Q61 13 62 19 L57 28Z" fill="#ec6450"/><path d="M25 45 Q12 25 7 33 Q6 38 14 47 Q3 42 7 52 L18 61 Q24 76 43 74 Q65 74 66 54 L64 38 Q63 23 51 23 Q39 22 37 38 Q35 46 25 45Z" fill="#efaa58"/><path d="M61 34 L75 40 L62 45Z" fill="#ffc444"/><path d="M23 52 Q35 47 47 52 Q38 70 25 62Z" fill="#dc8049"/><path d="M75 76 V84 L71 86 M84 76 V84 L88 85" fill="none"/><path d="M65 69 Q62 55 74 52 Q87 49 90 65 L96 61 Q95 79 81 80 Q69 81 65 69Z" fill="#ffda4f"/><path d="M67 60 L57 65 L67 68Z" fill="#ff9844"/></g><g fill="#3b2e25"><circle cx="55" cy="33" r="3"/><circle cx="72" cy="59" r="2.4"/></g></svg>` },
    { name: "Дружный выводок", color: "#fff0de", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="86" rx="46" ry="6" fill="#dfd7ac"/><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M27 68 V80 L21 84 M40 69 V80 L45 83" fill="none"/><path d="M36 27 Q28 16 35 15 L40 20 Q39 8 45 10 Q50 11 49 18 Q56 12 58 18 L52 26Z" fill="#ef6453"/><path d="M22 45 Q11 26 6 32 Q4 36 11 47 Q2 41 5 51 L15 61 Q20 74 36 74 Q60 74 61 53 L59 37 Q58 23 46 22 Q34 22 32 38 Q30 46 22 45Z" fill="#efaa58"/><path d="M56 32 L69 38 L57 43Z" fill="#ffc444"/><path d="M18 52 Q28 47 42 51 Q33 69 21 62Z" fill="#dc8049"/></g><circle cx="50" cy="32" r="3" fill="#3b2e25"/><g stroke="#3b2e25" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"><path d="M54 80 V87 L50 88 M65 80 V87 L69 88 M79 74 V81 L75 82 M88 74 V81 L92 82" fill="none"/><path d="M74 65 Q72 52 82 50 Q92 49 94 61 L98 58 Q97 76 86 77 Q77 78 74 65Z" fill="#ffcb43"/><path d="M76 58 L68 62 L76 65Z" fill="#ff9244"/><path d="M46 72 Q44 58 55 56 Q66 54 69 68 L75 64 Q73 82 61 83 Q50 84 46 72Z" fill="#ffdf60"/><path d="M48 64 L39 69 L48 72Z" fill="#ff9244"/></g><g fill="#3b2e25"><circle cx="81" cy="56" r="2.2"/><circle cx="54" cy="63" r="2.4"/></g></svg>` },
    { name: "Тёплый курятник", color: "#def2f5", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="87" rx="45" ry="6" fill="#bfdfa9"/><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M17 67 H24 V83 H17Z M63 67 H70 V83 H63Z" fill="#aa724c"/><path d="M14 37 L44 17 L75 37 V70 H14Z" fill="#f4bc72"/><path d="M7 38 L43 11 L82 37 L77 44 L44 22 L12 45Z" fill="#ee7253"/><circle cx="44" cy="32" r="4" fill="#a96548"/><path d="M37 69 V54 A11 11 0 0 1 59 54 V69Z" fill="#865a45"/><path d="M37 68 H59 L48 87 H23Z" fill="#deb07a"/><path d="M35 75 H52 M30 81 H49" fill="none" stroke="#986847"/><path d="M67 78 Q63 65 74 62 Q86 60 88 74 L94 70 Q93 86 80 87 Q70 87 67 78Z" fill="#ffda4f"/><path d="M68 70 L60 74 L69 77Z" fill="#ff9741"/></g><circle cx="74" cy="69" r="2.5" fill="#3b2e25"/><ellipse cx="19" cy="86" rx="3" ry="2" fill="#e8ac42"/></svg>` },
    { name: "Птичий двор", color: "#e5f4ff", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="82" rx="47" ry="11" fill="#b8db96"/><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M50 47 H95 V53 H50Z M50 59 H95 V65 H50Z" fill="#eab67b"/><path d="M65 69 V43 L69 38 L73 43 V69Z M85 69 V43 L89 38 L93 43 V69Z" fill="#ffcf91"/><path d="M10 36 L33 19 L59 37 V68 H10Z" fill="#f4bc72"/><path d="M4 36 L33 12 L65 36 L61 42 L33 22 L8 43Z" fill="#ed7355"/><circle cx="33" cy="32" r="4" fill="#a96548"/><path d="M24 68 V52 A9 9 0 0 1 42 52 V68Z" fill="#865a45"/><path d="M24 67 H42 L34 80 H14Z" fill="#dbac72"/><path d="M22 73 H36" fill="none"/><path d="M55 56 Q51 47 56 48 L60 52 Q60 43 65 47 L65 55Z" fill="#ef6651"/><path d="M48 65 L36 56 Q33 67 42 73 Q45 83 57 82 Q74 81 72 66 Q72 54 63 53 Q55 52 53 62Z" fill="#efa557"/><path d="M69 60 L79 64 L70 68Z" fill="#ffbe44"/><path d="M45 69 Q51 65 59 68 Q55 78 47 75Z" fill="#d78049"/><path d="M74 80 Q71 70 80 68 Q89 67 91 77 L96 75 Q94 88 84 88 Q76 87 74 80Z" fill="#ffda50"/><path d="M75 74 L68 78 L76 80Z" fill="#ff9741"/></g><g fill="#3b2e25"><circle cx="64" cy="59" r="2.3"/><circle cx="80" cy="73" r="2"/></g></svg>` },
    { name: "Ферма с мельницей", color: "#dff3ff", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="18" r="9" fill="#ffce56"/><path d="M3 64 Q29 45 54 58 Q76 48 97 59 V83 Q51 97 3 83Z" fill="#a8d887"/><g stroke="#3b2e25" stroke-width="2.8" stroke-linejoin="round" stroke-linecap="round"><path d="M63 65 L68 28 L80 28 L88 65Z" fill="#f5cf96"/><path d="M64 30 L74 16 L84 30Z" fill="#cd7751"/><g fill="#fff0c5"><path d="M74 28 L57 16 L61 10 L75 25Z"/><path d="M74 28 L86 10 L92 15 L77 29Z"/><path d="M74 28 L93 39 L89 46 L73 31Z"/><path d="M74 28 L62 47 L56 42 L71 27Z"/></g><circle cx="74" cy="28" r="3.5" fill="#d68d51"/><path d="M7 50 L30 30 L54 50 V75 H7Z" fill="#ee9a66"/><path d="M3 51 L13 33 L30 23 L49 33 L59 51 L53 55 L44 39 L30 31 L18 39 L9 55Z" fill="#d96049"/><circle cx="30" cy="43" r="4" fill="#fff0c6"/><path d="M20 75 V59 A10 10 0 0 1 40 59 V75Z" fill="#875c47"/><path d="M20 74 H40 L32 86 H10Z" fill="#eab97b"/><path d="M18 80 H34" fill="none"/><path d="M54 59 H95 V64 H54Z" fill="#edbd84"/><path d="M62 71 V57 L65 53 L68 57 V71Z M85 71 V57 L88 53 L91 57 V71Z" fill="#ffce8e"/><path d="M55 67 Q50 59 55 60 L58 63 Q59 55 63 59 L62 67Z" fill="#ee6452"/><path d="M49 73 L39 66 Q38 77 46 81 Q52 89 62 84 Q71 79 67 70 Q65 62 58 64 Q52 65 51 72Z" fill="#efaa58"/><path d="M65 69 L74 73 L66 76Z" fill="#ffc444"/><path d="M46 75 Q51 71 57 74 Q53 82 48 80Z" fill="#d88048"/><path d="M75 81 Q73 72 81 71 Q89 70 90 78 L95 76 Q94 88 84 88 Q78 88 75 81Z" fill="#ffda50"/><path d="M76 77 L70 80 L76 82Z" fill="#ff9741"/></g><g fill="#3b2e25"><circle cx="61" cy="69" r="2"/><circle cx="81" cy="76" r="1.8"/></g></svg>` },
  ];


// ---------- Транспорт (v22, Astra) ----------
const TRANSPORT: SkinTier[] = [
    { name: "Колёсико", color: "#e8f2fb", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><circle cx="50" cy="50" r="28" fill="#526579"/><circle cx="50" cy="50" r="17" fill="#ffc75c"/><circle cx="50" cy="50" r="6" fill="#fff1bd"/><path d="M30 42 Q33 33 41 30" fill="none" stroke="#99afbd"/></g></svg>` },
    { name: "Скейт", color: "#fff0d9", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M26 50 V62 M72 50 V62" fill="none" stroke-width="6"/><circle cx="26" cy="62" r="9" fill="#ec9460"/><circle cx="72" cy="62" r="9" fill="#ec9460"/><path d="M10 37 Q18 42 26 42 H73 Q81 42 88 37 Q94 35 91 43 Q86 54 73 54 H26 Q14 54 8 44 Q4 36 10 37Z" fill="#48b7a0"/><path d="M25 47 H71" stroke="#a4e1c5"/></g></svg>` },
    { name: "Тележка", color: "#eaf6e5", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M71 55 L85 24" fill="none" stroke-width="5"/><rect x="80" y="19" width="14" height="7" rx="3.5" fill="#ffc85c"/><path d="M10 40 H75 L70 63 Q69 67 64 67 H22 Q17 67 16 62Z" fill="#ef795c"/><rect x="8" y="37" width="69" height="7" rx="3.5" fill="#ffa578"/><circle cx="25" cy="69" r="10" fill="#526579"/><circle cx="62" cy="69" r="10" fill="#526579"/></g><g fill="#ffcf6a"><circle cx="25" cy="69" r="4"/><circle cx="62" cy="69" r="4"/></g></svg>` },
    { name: "Педальная машинка", color: "#fff0df", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M28 54 L22 33 Q21 28 26 28 H31 L37 46 H46 V54Z" fill="#eb8964"/><path d="M61 52 L55 35 M49 38 L61 32" fill="none" stroke-width="5"/><path d="M9 49 Q16 41 28 43 L36 51 H49 Q54 51 57 43 Q60 37 70 38 Q88 39 91 53 V63 Q91 67 85 67 H16 Q9 67 9 60Z" fill="#55bfaa"/><circle cx="25" cy="66" r="11" fill="#526579"/><circle cx="75" cy="66" r="11" fill="#526579"/></g><g fill="#ffcf6a"><circle cx="25" cy="66" r="5"/><circle cx="75" cy="66" r="5"/><ellipse cx="86" cy="49" rx="3" ry="4"/></g></svg>` },
    { name: "Легковая машина", color: "#e5f4fa", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M7 52 Q8 45 17 43 L26 31 Q31 24 42 24 H52 Q61 24 67 32 L76 43 Q91 45 93 54 V63 Q93 69 86 69 H14 Q7 69 7 62Z" fill="#f17b61"/><path d="M25 43 L32 33 Q35 30 42 30 H45 V43Z M51 30 H53 Q59 30 63 35 L69 43 H51Z" fill="#b8e9ef"/><path d="M47 48 V61 M52 50 H57" fill="none" stroke-width="2"/><circle cx="25" cy="68" r="11" fill="#526579"/><circle cx="74" cy="68" r="11" fill="#526579"/></g><g fill="#ffda82"><circle cx="25" cy="68" r="5"/><circle cx="74" cy="68" r="5"/><rect x="82" y="50" width="8" height="5" rx="2"/></g></svg>` },
    { name: "Почтовый фургон", color: "#fff2d9", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M9 29 Q9 22 17 22 H54 V69 H11 Q7 69 7 63Z" fill="#58b8a4"/><path d="M54 33 H66 Q71 33 75 39 L82 48 Q91 49 93 57 V68 H54Z" fill="#ffc35d"/><path d="M60 38 H66 Q69 38 71 42 L76 49 H60Z" fill="#c1eaf2"/><rect x="17" y="33" width="28" height="20" rx="3" fill="#fff1cd"/><path d="M18 35 L31 45 L44 35" fill="none" stroke-width="2"/><circle cx="25" cy="69" r="11" fill="#526579"/><circle cx="75" cy="69" r="11" fill="#526579"/></g><g fill="#ffda82"><circle cx="25" cy="69" r="5"/><circle cx="75" cy="69" r="5"/></g></svg>` },
    { name: "Микроавтобус", color: "#f1ecfc", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M7 35 Q7 23 20 23 H61 Q72 23 77 33 L86 47 Q93 50 93 58 V65 Q93 70 86 70 H14 Q7 70 7 63Z" fill="#ffbe59"/><rect x="13" y="30" width="20" height="18" rx="4" fill="#bce9ee"/><rect x="37" y="30" width="18" height="18" rx="4" fill="#bce9ee"/><path d="M61 30 H64 Q69 30 72 36 L79 48 H61Z" fill="#bce9ee"/><path d="M11 54 H54" stroke="#e77b50" stroke-width="5"/><path d="M58 51 V65 M63 54 H67" fill="none" stroke-width="2"/><circle cx="24" cy="69" r="11" fill="#526579"/><circle cx="75" cy="69" r="11" fill="#526579"/></g><g fill="#ffe2a3"><circle cx="24" cy="69" r="5"/><circle cx="75" cy="69" r="5"/></g></svg>` },
    { name: "Городской автобус", color: "#fff1df", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><rect x="5" y="19" width="90" height="53" rx="10" fill="#50b7aa"/><rect x="11" y="27" width="15" height="20" rx="3" fill="#cbf0f4"/><rect x="30" y="27" width="15" height="20" rx="3" fill="#cbf0f4"/><rect x="49" y="27" width="15" height="20" rx="3" fill="#cbf0f4"/><rect x="70" y="27" width="19" height="38" rx="3" fill="#b0deea"/><path d="M80 28 V64" fill="none" stroke-width="2"/><path d="M10 53 H63" stroke="#ffcf67" stroke-width="5"/><circle cx="23" cy="71" r="10" fill="#526579"/><circle cx="60" cy="71" r="10" fill="#526579"/></g><g fill="#ffda82"><circle cx="23" cy="71" r="4"/><circle cx="60" cy="71" r="4"/></g></svg>` },
    { name: "Двухэтажный автобус", color: "#e3f4fc", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><rect x="6" y="12" width="88" height="66" rx="10" fill="#ed795e"/><g fill="#c4eaf0"><rect x="13" y="20" width="19" height="15" rx="3"/><rect x="37" y="20" width="19" height="15" rx="3"/><rect x="61" y="20" width="25" height="15" rx="3"/><rect x="13" y="49" width="19" height="15" rx="3"/><rect x="37" y="49" width="19" height="15" rx="3"/><rect x="68" y="48" width="18" height="24" rx="3"/></g><path d="M11 42 H89" stroke="#ffcf69" stroke-width="5"/><path d="M77 49 V71" fill="none" stroke-width="2"/><circle cx="24" cy="77" r="10" fill="#526579"/><circle cx="60" cy="77" r="10" fill="#526579"/></g><g fill="#ffda82"><circle cx="24" cy="77" r="4"/><circle cx="60" cy="77" r="4"/></g></svg>` },
    { name: "Автобусная остановка", color: "#fff3dd", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M5 81 H95" stroke="#ae9277"/><rect x="8" y="27" width="27" height="37" rx="2" fill="#c6e9e5"/><path d="M9 29 V78 M34 29 V78 M14 66 V73 M28 66 V73" fill="none"/><rect x="10" y="59" width="23" height="6" rx="2" fill="#df9958"/><path d="M4 28 L9 18 H33 L39 28Z" fill="#61be9e"/><rect x="39" y="31" width="56" height="43" rx="7" fill="#ed795e"/><g fill="#c4eaf0" stroke-width="2"><rect x="44" y="36" width="12" height="10" rx="2"/><rect x="60" y="36" width="12" height="10" rx="2"/><rect x="76" y="36" width="14" height="10" rx="2"/><rect x="44" y="55" width="12" height="10" rx="2"/><rect x="60" y="55" width="12" height="10" rx="2"/><rect x="78" y="55" width="11" height="15" rx="2"/></g><path d="M43 50 H91" stroke="#ffcf69"/><circle cx="51" cy="74" r="7" fill="#526579"/><circle cx="77" cy="74" r="7" fill="#526579"/></g></svg>` },
    { name: "Большой автовокзал", color: "#e4f3fb", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><rect x="11" y="31" width="78" height="39" rx="3" fill="#ffcf79"/><path d="M7 33 L13 23 H33 L50 10 L67 23 H87 L93 33Z" fill="#ef8665"/><circle cx="50" cy="25" r="9" fill="#fff5cf"/><path d="M50 20 V25 L54 27" fill="none" stroke-width="2"/><g fill="#bce7ee"><rect x="18" y="40" width="14" height="14" rx="2"/><rect x="68" y="40" width="14" height="14" rx="2"/><path d="M39 68 V49 Q39 38 50 38 Q61 38 61 49 V68Z"/></g><path d="M50 42 V68 M5 87 H95" fill="none"/><rect x="4" y="62" width="40" height="19" rx="5" fill="#56b8a3"/><rect x="50" y="53" width="46" height="28" rx="5" fill="#ed795e"/><g fill="#cff0f2" stroke-width="2"><rect x="8" y="66" width="12" height="8" rx="2"/><rect x="23" y="66" width="16" height="8" rx="2"/><rect x="55" y="57" width="15" height="7" rx="2"/><rect x="74" y="57" width="16" height="7" rx="2"/><rect x="55" y="68" width="15" height="7" rx="2"/><rect x="74" y="68" width="16" height="7" rx="2"/></g><g fill="#526579"><circle cx="14" cy="82" r="5"/><circle cx="34" cy="82" r="5"/><circle cx="61" cy="82" r="5"/><circle cx="85" cy="82" r="5"/></g></g></svg>` },
  ];

// ---------- Цифры ----------
const NUMBER_COLORS = ["#fff4e0", "#ffe6c2", "#ffc98a", "#ffad6b", "#ff8f5a", "#ff6f4a", "#ffd86b", "#ffcf4a", "#ffc531", "#ffbb1a", "#ffb000"];
const CIFRY: SkinTier[] = NUMBER_COLORS.map((color, tier) => ({ name: String(2 ** (tier + 1)), color, art: null }));

export const SKINS: Skin[] = [
  { id: "sad", title: "Сад", color: "#7cc46a", tiers: SAD },
  { id: "zima", title: "Зима", color: "#6db3d4", tiers: ZIMA },
  { id: "les", title: "Лес", color: "#3f9a4a", tiers: LES },
  { id: "kosmos", title: "Космос", color: "#4a56a8", tiers: KOSMOS },
  { id: "pesok", title: "Песочница", color: "#e99a38", tiers: PESOK },
  { id: "tort", title: "Торт", color: "#e65d71", tiers: TORT },
  { id: "more", title: "Море", color: "#249fb5", tiers: MORE },
  { id: "ferma", title: "Ферма", color: "#7bb24a", tiers: FERMA },
  { id: "transport", title: "Транспорт", color: "#4a8fd4", tiers: TRANSPORT },
  { id: "cifry", title: "Цифры", color: "#ff8a3d", tiers: CIFRY },
];

export const DEFAULT_SKIN: SkinId = "sad";

export function skinById(id: unknown): Skin {
  return SKINS.find((s) => s.id === id) ?? SKINS.find((s) => s.id === DEFAULT_SKIN)!;
}

/** Tier above 2048 (play on): the last picture repeats, the number grows. */
export function skinTier(skin: Skin, tier: number): SkinTier {
  return skin.tiers[Math.min(tier, skin.tiers.length - 1)]!;
}
