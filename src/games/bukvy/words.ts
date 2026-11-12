/**
 * A picture for every letter's word in «Цифры и буквы» (viewBox 0 0 100 100),
 * flat and outlined like the other games' pictures. Most come from the
 * shared sets (objects.ts, «Тени» shapes); the rest are drawn here.
 * Ъ, Ы and Ь have no words that start with them: the word has the letter
 * inside (подЪёмный кран, сЫр, мышЬ).
 */
import { OBJECTS } from "../../shared/objects";
import { SHAPES } from "../teni/shapes";

const O = `stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"`;
const f = (c: string): string => `fill="${c}" ${O}`;
const svg = (body: string): string => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
const line = (d: string, c: string, w = 6): string =>
  `<path d="${d}" fill="none" stroke="#3b2e25" stroke-width="${w + 4}" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const eye = (x: number, y: number, r = 2.8): string => `<circle cx="${x}" cy="${y}" r="${r}" fill="#3b2e25"/><circle cx="${x + 1}" cy="${y - 1}" r="${r / 3}" fill="#fff"/>`;

function spikes(): string {
  // A spiky half-dome: points alternate long and short over the back.
  let d = "M8 76";
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI + (i / 16) * Math.PI * 0.92;
    const r = i % 2 ? 44 : 33;
    d += ` L${(46 + Math.cos(a) * r).toFixed(1)} ${(74 + Math.sin(a) * r).toFixed(1)}`;
  }
  return `<path d="${d} L80 76 Z" ${f("#8b5a2b")}/>`;
}

const DRAWN = {
  hedgehog: svg(
    spikes() +
      `<path d="M16 76 C16 66 30 62 46 62 C58 52 76 52 86 66 L96 72 C96 80 88 84 80 84 L24 86 C18 86 16 82 16 76 Z" ${f("#f2d9b1")}/>` +
      eye(76, 66) + `<circle cx="96" cy="72" r="4.5" fill="#3b2e25"/>` +
      `<circle cx="70" cy="76" r="4" fill="#f7b3c8"/>` +
      `<path d="M34 86 L32 94 M62 86 L64 94" fill="none" stroke="#3b2e25" stroke-width="6" stroke-linecap="round"/>`,
  ),
  beetle: svg(
    `<path d="M30 30 L18 14 M70 30 L82 14 M24 54 L8 50 M76 54 L92 50 M26 70 L12 80 M74 70 L88 80" fill="none" ${O}/>` +
      `<circle cx="50" cy="28" r="14" ${f("#3b2e25")}/>` +
      `<ellipse cx="50" cy="60" rx="30" ry="32" ${f("#e8463a")}/>` +
      `<path d="M50 30 L50 92" fill="none" ${O}/>` +
      `<circle cx="36" cy="52" r="6" fill="#3b2e25"/><circle cx="64" cy="52" r="6" fill="#3b2e25"/><circle cx="38" cy="74" r="5" fill="#3b2e25"/><circle cx="62" cy="74" r="5" fill="#3b2e25"/>` +
      `<circle cx="44" cy="24" r="3" fill="#fff"/><circle cx="56" cy="24" r="3" fill="#fff"/>`,
  ),
  needle: svg(
    line("M30 20 C64 24 80 50 56 64 C36 76 30 60 46 54 C64 48 82 70 72 90", "#e8463a", 4) +
      `<path d="M14 92 L80 12 C84 8 90 12 86 18 L20 96 Z" ${f("#c6cfda")}/>` +
      `<ellipse cx="80" cy="17" rx="2" ry="4" transform="rotate(40 80 17)" fill="#fff" ${O}/>`,
  ),
  yogurt: svg(
    line("M64 6 L54 40", "#c6cfda", 4) +
      `<path d="M20 30 L80 30 L72 90 L28 90 Z" ${f("#fff")}/>` +
      `<path d="M24 46 L76 46 L72 74 L28 74 Z" fill="#f7b3c8"/>` +
      `<circle cx="42" cy="60" r="5" ${f("#e8463a")}/><circle cx="58" cy="58" r="5" ${f("#e8463a")}/>` +
      `<rect x="14" y="22" width="72" height="12" rx="5" ${f("#4aa3df")}/>`,
  ),
  sock: svg(
    `<path d="M34 8 L64 8 L64 56 C64 64 70 68 78 70 C92 74 92 94 76 94 L44 94 C30 94 26 80 30 68 L34 56 Z" ${f("#4aa3df")}/>` +
      `<rect x="30" y="8" width="38" height="14" rx="4" ${f("#fff")}/>` +
      `<path d="M34 34 L64 34 M33 46 L64 46" fill="none" stroke="#fff" stroke-width="5"/>` +
      `<path d="M72 70 C82 72 90 80 84 92" fill="none" ${O}/><path d="M74 72 C84 76 88 84 82 92 L76 94 C70 86 70 78 72 70 Z" fill="#e8463a"/>`,
  ),
  cloud: svg(
    `<path d="M18 72 C4 72 4 50 20 48 C18 30 40 22 50 36 C58 18 86 22 84 44 C98 46 98 72 82 72 Z" ${f("#f4f8fc")}/>` +
      eye(40, 54, 2.4) + eye(60, 54, 2.4) + `<path d="M44 62 C48 66 54 66 58 62" fill="none" ${O}/>` +
      `<circle cx="32" cy="62" r="4" fill="#f7b3c8"/><circle cx="68" cy="62" r="4" fill="#f7b3c8"/>`,
  ),
  bee: svg(
    `<ellipse cx="40" cy="28" rx="14" ry="18" transform="rotate(-20 40 28)" fill="#e3f2fd" ${O}/>` +
      `<ellipse cx="62" cy="26" rx="14" ry="18" transform="rotate(20 62 26)" fill="#e3f2fd" ${O}/>` +
      `<path d="M86 60 L98 62 L86 66 Z" ${f("#3b2e25")}/>` +
      `<ellipse cx="54" cy="60" rx="34" ry="24" ${f("#ffd84a")}/>` +
      `<path d="M44 38 C38 50 38 70 44 82 M62 37 C56 50 56 72 62 83" fill="none" stroke="#3b2e25" stroke-width="8"/>` +
      `<circle cx="22" cy="54" r="16" ${f("#ffd84a")}/>` + eye(18, 50) +
      `<path d="M14 60 C18 64 24 64 26 60" fill="none" ${O}/>` +
      `<path d="M18 40 C14 30 10 26 6 26 M26 40 C28 30 30 26 34 24" fill="none" ${O}/>`,
  ),
  flag: svg(
    line("M24 8 L24 94", "#a8743f", 5) +
      `<circle cx="24" cy="8" r="5" ${f("#ffd84a")}/>` +
      `<path d="M28 14 C44 6 58 22 74 14 C80 12 86 10 90 12 L90 52 C80 48 74 56 60 54 C46 52 40 46 28 52 Z" ${f("#e8463a")}/>` +
      `<path d="M50 24 L53 31 L61 31 L55 36 L57 44 L50 39 L43 44 L45 36 L39 31 L47 31 Z" fill="#ffd84a"/>`,
  ),
  pike: svg(
    `<path d="M80 50 L98 34 L94 50 L98 66 Z" ${f("#6fae5a")}/>` +
      `<path d="M4 52 C10 40 24 36 40 36 C60 36 74 42 82 50 C74 58 60 64 40 64 C24 64 10 62 4 52 Z" ${f("#8fcf6f")}/>` +
      `<path d="M4 52 L24 54" fill="none" ${O}/>` +
      `<path d="M44 36 L52 26 L62 38 Z M48 64 L56 74 L64 62 Z" ${f("#6fae5a")}/>` +
      `<path d="M38 44 C42 48 42 56 38 60 M52 42 C56 48 56 56 52 60 M66 46 C68 50 68 54 66 56" fill="none" stroke="#4f9e5a" stroke-width="3"/>` +
      eye(20, 46),
  ),
  crane: svg(
    `<path d="M36 94 L36 20 L48 20 L48 94 Z" ${f("#ffc94a")}/>` +
      `<path d="M36 30 L48 40 M48 30 L36 40 M36 50 L48 60 M48 50 L36 60 M36 70 L48 80 M48 70 L36 80" fill="none" ${O}/>` +
      `<rect x="10" y="14" width="86" height="10" rx="2" ${f("#ffc94a")}/>` +
      `<rect x="10" y="24" width="18" height="14" rx="2" ${f("#a9b4c2")}/>` +
      `<rect x="38" y="4" width="10" height="10" ${f("#e8463a")}/>` +
      line("M84 24 L84 56", "#3b2e25", 1.5) +
      `<path d="M78 56 L90 56 L90 60 C90 66 84 66 84 62" fill="none" ${O}/>` +
      `<rect x="72" y="66" width="24" height="18" rx="2" ${f("#4aa3df")}/>` +
      `<rect x="22" y="90" width="40" height="8" rx="2" ${f("#a9b4c2")}/>`,
  ),
  eskimo: svg(
    line("M50 70 L50 96", "#e8c49a", 7) +
      `<path d="M28 34 C28 12 72 12 72 34 L72 72 C72 76 28 76 28 72 Z" ${f("#8b5a2b")}/>` +
      `<path d="M28 40 C36 48 42 36 50 44 C58 52 64 38 72 46" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>` +
      `<circle cx="40" cy="58" r="3" fill="#ffd84a"/><circle cx="58" cy="62" r="3" fill="#f27aa0"/><circle cx="52" cy="26" r="3" fill="#7cc4ef"/>`,
  ),
};

export type WordArt = { word: string; svg: string };

const shape = (id: string): string => SHAPES[id]!.svg;

/** Letter → its word and picture. Every one of the 33 letters is here. */
export const WORDS: Record<string, WordArt> = {
  А: { word: "Арбуз", svg: shape("watermelon") },
  Б: { word: "Банан", svg: OBJECTS.banana.svg },
  В: { word: "Вишня", svg: OBJECTS.cherry.svg },
  Г: { word: "Гриб", svg: OBJECTS.mushroom.svg },
  Д: { word: "Дом", svg: OBJECTS.house.svg },
  Е: { word: "Ель", svg: shape("fir") },
  Ё: { word: "Ёжик", svg: DRAWN.hedgehog },
  Ж: { word: "Жук", svg: DRAWN.beetle },
  З: { word: "Зонтик", svg: OBJECTS.umbrella.svg },
  И: { word: "Иголка", svg: DRAWN.needle },
  Й: { word: "Йогурт", svg: DRAWN.yogurt },
  К: { word: "Кубик", svg: OBJECTS.cube.svg },
  Л: { word: "Лодка", svg: OBJECTS.boat.svg },
  М: { word: "Мячик", svg: OBJECTS.ball.svg },
  Н: { word: "Носок", svg: DRAWN.sock },
  О: { word: "Облако", svg: DRAWN.cloud },
  П: { word: "Пчела", svg: DRAWN.bee },
  Р: { word: "Рыбка", svg: OBJECTS.fish.svg },
  С: { word: "Солнце", svg: OBJECTS.sun.svg },
  Т: { word: "Торт", svg: shape("cake3") },
  У: { word: "Утка", svg: shape("duck") },
  Ф: { word: "Флажок", svg: DRAWN.flag },
  Х: { word: "Хлеб", svg: shape("bread") },
  Ц: { word: "Цветок", svg: OBJECTS.flower.svg },
  Ч: { word: "Чашка", svg: OBJECTS.cup.svg },
  Ш: { word: "Шарик", svg: OBJECTS.balloon.svg },
  Щ: { word: "Щука", svg: DRAWN.pike },
  Ъ: { word: "подЪёмный кран", svg: DRAWN.crane },
  Ы: { word: "сЫр", svg: shape("cheese") },
  Ь: { word: "мышЬ", svg: shape("mouse") },
  Э: { word: "Эскимо", svg: DRAWN.eskimo },
  Ю: { word: "Юла", svg: shape("top") },
  Я: { word: "Яблоко", svg: OBJECTS.apple.svg },
};

/** The pictures drawn here, for the contact sheet and tests. */
export const DRAWN_WORDS = DRAWN;
