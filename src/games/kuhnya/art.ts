import { OBJECTS } from "../../shared/objects";
import type { IngredientId, Reaction } from "./logic";

/** Kitchen art, drawn in code (viewBox 0 0 100 100 unless said). */
const INK = "#3b2e25";
const O = `stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"`;
const svg = (body: string, vb = "0 0 100 100"): string => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

export const INGREDIENT_ART: Record<IngredientId, string> = {
  apple: OBJECTS.apple.svg,
  pear: OBJECTS.pear.svg,
  banana: OBJECTS.banana.svg,
  carrot: OBJECTS.carrot.svg,
  mushroom: OBJECTS.mushroom.svg,
  fish: OBJECTS.fish.svg,
  berries: svg(
    `<path d="M50 20 C 40 10 30 12 26 20" fill="none" stroke="#3f8f2c" stroke-width="5" stroke-linecap="round"/>` +
      `<circle cx="36" cy="52" r="16" fill="#5b5bd6" ${O}/><circle cx="64" cy="52" r="16" fill="#5b5bd6" ${O}/><circle cx="50" cy="76" r="16" fill="#5b5bd6" ${O}/>` +
      `<circle cx="32" cy="46" r="4" fill="#fff" opacity=".7"/><circle cx="60" cy="46" r="4" fill="#fff" opacity=".7"/>`,
  ),
  tomato: svg(
    `<circle cx="50" cy="58" r="34" fill="#e8463a" ${O}/>` +
      `<path d="M50 26 L 40 16 M50 26 L 62 16 M50 26 L 34 30 M50 26 L 66 30 M50 26 V 14" stroke="#3f8f2c" stroke-width="6" stroke-linecap="round"/>` +
      `<ellipse cx="36" cy="50" rx="6" ry="9" fill="#fff" opacity=".5"/>`,
  ),
  potato: svg(
    `<path d="M20 52 C 18 30 44 22 62 28 C 84 34 88 56 78 70 C 66 86 34 84 24 72 C 20 66 20 60 20 52 Z" fill="#d9b071" ${O}/>` +
      `<circle cx="40" cy="44" r="2.5" fill="#9b6a3c"/><circle cx="62" cy="54" r="2.5" fill="#9b6a3c"/><circle cx="46" cy="66" r="2.5" fill="#9b6a3c"/>`,
  ),
  egg: svg(
    `<path d="M50 12 C 72 12 84 46 82 62 C 80 80 66 90 50 90 C 34 90 20 80 18 62 C 16 46 28 12 50 12 Z" fill="#fffaf0" ${O}/>` +
      `<ellipse cx="38" cy="40" rx="6" ry="10" fill="#fff" opacity=".9"/>`,
  ),
  cheese: svg(
    `<path d="M10 70 L 70 30 L 90 46 L 90 80 L 10 80 Z" fill="#ffd54a" ${O}/><path d="M10 70 L 90 46" stroke="${INK}" stroke-width="3"/>` +
      `<circle cx="34" cy="74" r="5" fill="#f5b82a"/><circle cx="60" cy="68" r="6" fill="#f5b82a"/><circle cx="78" cy="72" r="4" fill="#f5b82a"/>`,
  ),
  honey: svg(
    `<path d="M26 34 H74 L 78 84 C 78 90 22 90 22 84 Z" fill="#f5a623" ${O}/>` +
      `<rect x="22" y="22" width="56" height="16" rx="5" fill="#e8463a" ${O}/>` +
      `<path d="M30 46 C 40 52 60 52 70 46" fill="none" stroke="#ffd54a" stroke-width="5" stroke-linecap="round"/>` +
      `<rect x="34" y="58" width="32" height="18" rx="4" fill="#fff4e0" ${O}/>`,
  ),
  lemon: svg(
    `<path d="M14 52 C 14 30 36 20 50 20 C 66 20 86 30 86 52 C 86 74 66 82 50 82 C 34 82 14 74 14 52 Z" fill="#fff27a" ${O}/>` +
      `<path d="M14 52 L 6 50 M86 52 L 94 50" ${O}/><ellipse cx="38" cy="42" rx="8" ry="5" fill="#fff" opacity=".7"/>`,
  ),
  pepper: svg(
    `<path d="M34 22 C 30 14 36 8 44 10" fill="none" stroke="#3f8f2c" stroke-width="6" stroke-linecap="round"/>` +
      `<path d="M28 26 C 40 18 52 24 56 36 C 62 56 70 76 88 90 C 60 92 34 74 26 48 C 22 38 22 30 28 26 Z" fill="#e8463a" ${O}/>` +
      `<path d="M36 36 C 40 50 48 62 58 72" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6"/>`,
  ),
};

export const GLASS = (color: string): string =>
  svg(
    `<path d="M58 8 L 52 40" stroke="#f27aa0" stroke-width="6" stroke-linecap="round"/>` +
      `<path d="M26 26 H74 L 68 90 C 68 94 32 94 32 90 Z" fill="#e3f5ff" ${O}/>` +
      `<path d="M29 40 H71 L 67 88 C 67 90 33 90 33 88 Z" fill="${color}"/>` +
      `<circle cx="42" cy="56" r="4" fill="#fff" opacity=".6"/><circle cx="56" cy="70" r="3" fill="#fff" opacity=".6"/>` +
      `<path d="M26 26 H74 L 68 90 C 68 94 32 94 32 90 Z" fill="none" ${O}/>`,
  );

export const BOWL = (color: string): string =>
  svg(
    `<path d="M40 30 C 36 22 44 18 40 10 M58 30 C 54 22 62 18 58 10" fill="none" stroke="#c7dcec" stroke-width="4" stroke-linecap="round"/>` +
      `<path d="M10 46 H90 C 90 70 72 86 50 86 C 28 86 10 70 10 46 Z" fill="#fffcf7" ${O}/>` +
      `<ellipse cx="50" cy="46" rx="40" ry="9" fill="${color}" ${O}/>` +
      `<circle cx="38" cy="45" r="4" fill="#f5862b"/><circle cx="58" cy="47" r="4" fill="#6fbf4a"/>` +
      `<path d="M30 62 C 40 66 60 66 70 62" fill="none" stroke="#6db3d4" stroke-width="5" stroke-linecap="round"/>`,
  );

// ---------- Tools (viewBox 0 0 160 120) ----------
const TV = "0 0 160 120";

export const TOOL_ART = {
  cut: svg(
    `<rect x="12" y="44" width="136" height="64" rx="14" fill="#e7b882" ${O}/><circle cx="134" cy="58" r="6" fill="#c08a52"/>` +
      `<path d="M30 92 h40 M80 96 h40" stroke="#c08a52" stroke-width="4" stroke-linecap="round"/>` +
      `<g class="kt-knife"><path d="M96 12 L 150 40 L 142 48 L 90 24 Z" fill="#e3eaf0" ${O}/><rect x="70" y="4" width="30" height="16" rx="6" transform="rotate(27 85 12)" fill="#9b6a3c" ${O}/></g>`,
    TV,
  ),
  fry: svg(
    `<path d="M108 66 L 156 54" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M108 66 L 156 54" stroke="#9b6a3c" stroke-width="6" stroke-linecap="round"/>` +
      `<ellipse cx="62" cy="74" rx="56" ry="26" fill="#4a4a55" ${O}/><ellipse cx="62" cy="70" rx="46" ry="18" fill="#6b6b78"/>` +
      `<rect x="16" y="98" width="92" height="14" rx="6" fill="#e8463a" ${O}/><path d="M30 102 h10 M56 102 h10 M82 102 h10" stroke="#ffc94a" stroke-width="4" stroke-linecap="round" class="kt-flame"/>`,
    TV,
  ),
  boil: svg(
    `<rect x="16" y="104" width="128" height="12" rx="5" fill="#e8463a" ${O}/>` +
      `<path d="M30 36 H130 V92 C 130 102 120 106 110 106 H50 C 40 106 30 102 30 92 Z" fill="#6db3d4" ${O}/>` +
      `<path d="M30 46 H10 M130 46 H150" ${O} stroke-width="8"/>` +
      `<ellipse cx="80" cy="36" rx="50" ry="10" fill="#cfeefc" ${O}/>` +
      `<g class="kt-bubbles"><circle cx="60" cy="34" r="4" fill="#fff"/><circle cx="84" cy="36" r="5" fill="#fff"/><circle cx="102" cy="33" r="3" fill="#fff"/></g>`,
    TV,
  ),
  blend: svg(
    `<rect x="44" y="92" width="72" height="24" rx="8" fill="#9b6cd8" ${O}/><circle cx="80" cy="104" r="6" fill="#ffc94a" ${O}/>` +
      `<path d="M48 14 H112 L 104 92 H56 Z" fill="#e3f5ff" fill-opacity=".85" ${O}/>` +
      `<rect x="44" y="6" width="72" height="12" rx="5" fill="#9b6cd8" ${O}/>` +
      `<path d="M68 80 L 92 70 M68 70 L 92 80" stroke="${INK}" stroke-width="4" stroke-linecap="round" class="kt-blades"/>`,
    TV,
  ),
} as const;

export const BIN = svg(
  `<path d="M24 30 H76 L 70 90 H30 Z" fill="#9fb3c8" ${O}/><rect x="18" y="20" width="64" height="12" rx="5" fill="#7a8ea3" ${O}/>` +
    `<path d="M40 44 V80 M50 44 V80 M60 44 V80" stroke="#7a8ea3" stroke-width="4" stroke-linecap="round"/><path d="M42 20 V14 H58 V20" fill="none" ${O}/>`,
);

/** Round face badge next to the guest: shows the reaction even without reading. */
export function faceArt(r: Reaction): string {
  const skin: Record<Reaction, string> = {
    love: "#ffd54a",
    yum: "#ffd54a",
    ok: "#ffe08a",
    yuck: "#a6d96a",
    raw: "#c9e59a",
    sour: "#fff27a",
    spicy: "#ff7a5c",
    burnt: "#b9b4ad",
  };
  const eyes: Record<Reaction, string> = {
    love: `<path d="M30 40 c-6 -8 -16 0 -8 8 l8 8 l8 -8 c8 -8 -2 -16 -8 -8z M70 40 c-6 -8 -16 0 -8 8 l8 8 l8 -8 c8 -8 -2 -16 -8 -8z" fill="#e8463a"/>`,
    yum: `<path d="M24 44 q8 -10 16 0 M60 44 q8 -10 16 0" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`,
    ok: `<circle cx="34" cy="42" r="5" fill="${INK}"/><circle cx="66" cy="42" r="5" fill="${INK}"/>`,
    yuck: `<path d="M24 36 l14 8 l-14 8 M76 36 l-14 8 l14 8" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
    raw: `<circle cx="34" cy="42" r="6" fill="${INK}"/><path d="M58 42 h16" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`,
    sour: `<path d="M22 38 l16 6 M78 38 l-16 6" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M26 46 h12 M62 46 h12" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`,
    spicy: `<circle cx="34" cy="42" r="7" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="66" cy="42" r="7" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="34" cy="42" r="3" fill="${INK}"/><circle cx="66" cy="42" r="3" fill="${INK}"/>`,
    burnt: `<path d="M26 38 l12 10 M38 38 l-12 10 M62 38 l12 10 M74 38 l-12 10" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`,
  };
  const mouth: Record<Reaction, string> = {
    love: `<path d="M30 62 Q 50 86 70 62 Z" fill="#a3302a" ${O}/>`,
    yum: `<path d="M30 62 Q 50 82 70 62" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M52 70 q8 10 14 -2" fill="#f27aa0" stroke="${INK}" stroke-width="3"/>`,
    ok: `<path d="M36 66 Q 50 72 64 66" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`,
    yuck: `<path d="M28 70 q6 -8 11 0 q6 8 11 0 q6 -8 11 0 q6 8 11 0" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`,
    raw: `<path d="M34 64 H66" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M46 64 v10 q6 8 12 0 v-10" fill="#f27aa0" stroke="${INK}" stroke-width="3"/>`,
    sour: `<circle cx="50" cy="68" r="6" fill="none" stroke="${INK}" stroke-width="5"/>`,
    spicy: `<ellipse cx="50" cy="70" rx="14" ry="10" fill="#a3302a" ${O}/><path d="M44 80 q6 14 12 0" fill="#ffc94a"/>`,
    burnt: `<path d="M34 70 Q 50 60 66 70" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`,
  };
  return svg(`<circle cx="50" cy="50" r="44" fill="${skin[r]}" ${O}/>${eyes[r]}${mouth[r]}`);
}

/** Kitchen backdrop behind the guest (viewBox 0 0 400 300, sliced to fill). */
export const KITCHEN = `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
<rect width="400" height="300" fill="#fff1d6"/>
${[...Array(10)].map((_, i) => [...Array(6)].map((__, j) => `<rect x="${i * 40 + 2}" y="${j * 40 + 2}" width="36" height="36" rx="6" fill="${(i + j) % 2 ? "#ffe6c0" : "#fff6e6"}"/>`).join("")).join("")}
<rect x="250" y="34" width="110" height="90" rx="10" fill="#aee0ff" stroke="${INK}" stroke-width="5"/><path d="M305 34 V124 M250 79 H360" stroke="#fffcf7" stroke-width="7"/><circle cx="335" cy="58" r="12" fill="#ffd54a"/>
<path d="M20 40 h120" stroke="#9b6a3c" stroke-width="8" stroke-linecap="round"/>
<rect x="30" y="10" width="24" height="30" rx="5" fill="#e8463a" stroke="${INK}" stroke-width="3"/><rect x="66" y="16" width="20" height="24" rx="5" fill="#6db3d4" stroke="${INK}" stroke-width="3"/><rect x="98" y="8" width="26" height="32" rx="5" fill="#ffc94a" stroke="${INK}" stroke-width="3"/>
</svg>`;

export const TABLE = `<svg viewBox="0 0 400 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="10" width="400" height="70" fill="#e8463a"/>${[...Array(10)].map((_, i) => `<rect x="${i * 40}" y="10" width="20" height="70" fill="#fff6e6" opacity=".9"/>`).join("")}<path d="M0 10 H400" stroke="${INK}" stroke-width="5"/></svg>`;

export const PLATE = svg(`<ellipse cx="50" cy="56" rx="46" ry="16" fill="#fffcf7" ${O}/><ellipse cx="50" cy="54" rx="30" ry="9" fill="none" stroke="#e9dac4" stroke-width="3"/>`, "0 0 100 80");
