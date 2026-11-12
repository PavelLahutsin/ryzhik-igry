/**
 * Skins of «Большая игра 2048»: 11 pictures per skin, one per number
 * 2 … 2048 (tier 0 … 10). Flat vector art in the style of art.ts
 * (viewBox 0 0 100 100), drawn in code. The number is always shown too.
 */
import { CHAIN_ART, OUT, SOIL, SNOWY, WINTER_ART, apple, ball, crown, flake, flowerHead, leaf, svg } from "./art";

export type SkinId = "cifry" | "sad" | "zima" | "les" | "kosmos";
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

// ---------- Цифры ----------
const NUMBER_COLORS = ["#fff4e0", "#ffe6c2", "#ffc98a", "#ffad6b", "#ff8f5a", "#ff6f4a", "#ffd86b", "#ffcf4a", "#ffc531", "#ffbb1a", "#ffb000"];
const CIFRY: SkinTier[] = NUMBER_COLORS.map((color, tier) => ({ name: String(2 ** (tier + 1)), color, art: null }));

export const SKINS: Skin[] = [
  { id: "sad", title: "Сад", color: "#7cc46a", tiers: SAD },
  { id: "zima", title: "Зима", color: "#6db3d4", tiers: ZIMA },
  { id: "les", title: "Лес", color: "#3f9a4a", tiers: LES },
  { id: "kosmos", title: "Космос", color: "#4a56a8", tiers: KOSMOS },
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
