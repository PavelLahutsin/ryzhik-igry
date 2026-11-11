/**
 * Simple flat objects drawn in code (viewBox 0 0 100 100), shared by
 * «Тени» and «Найди пару». Bold outline, soft colours, chunky shapes, so the
 * black silhouettes are easy to tell apart.
 */
const O = `stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"`;

const svg = (body: string): string => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

function sunRays(): string {
  let out = "";
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const x1 = 50 + Math.cos(a) * 30;
    const y1 = 50 + Math.sin(a) * 30;
    const x2 = 50 + Math.cos(a) * 45;
    const y2 = 50 + Math.sin(a) * 45;
    out += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="#f5a623" stroke-width="8" stroke-linecap="round"/>`;
  }
  return out;
}

export type ObjectId =
  | "apple"
  | "ball"
  | "balloon"
  | "mushroom"
  | "star"
  | "kite"
  | "umbrella"
  | "sun"
  | "fish"
  | "car"
  | "house"
  | "carrot"
  | "pear"
  | "cherry"
  | "banana"
  | "leaf"
  | "flower"
  | "boat"
  | "drop"
  | "cube"
  | "cup";

/** Main colour of each object, for sorting games. */
export type ObjectColor = "red" | "yellow" | "blue" | "green" | "pink" | "orange" | "mixed";

export const OBJECTS: Record<ObjectId, { name: string; svg: string; color: ObjectColor }> = {
  apple: {
    color: "red",
    name: "Яблоко",
    svg: svg(
      `<path d="M50 30 C 30 18 12 34 16 56 C 20 80 38 92 50 86 C 62 92 80 80 84 56 C 88 34 70 18 50 30 Z" fill="#e8463a" ${O}/>` +
        `<path d="M50 30 C 50 22 52 14 56 8" fill="none" ${O}/>` +
        `<path d="M54 18 C 62 8 76 8 80 14 C 72 22 62 24 54 18 Z" fill="#6fbf4a" ${O}/>` +
        `<ellipse cx="32" cy="46" rx="5" ry="8" fill="#fff" opacity=".55"/>`,
    ),
  },
  ball: {
    color: "mixed",
    name: "Мячик",
    svg: svg(
      `<circle cx="50" cy="52" r="38" fill="#fff" ${O}/>` +
        `<path d="M50 14 C 30 30 30 74 50 90 C 40 70 40 34 50 14 Z" fill="#e8463a"/>` +
        `<path d="M14 46 C 34 56 66 56 88 46 C 70 66 30 66 14 46 Z" fill="#3a8fd4"/>` +
        `<path d="M50 14 C 70 30 70 74 50 90 C 60 70 60 34 50 14 Z" fill="#ffc94a"/>` +
        `<circle cx="50" cy="52" r="38" fill="none" ${O}/>`,
    ),
  },
  balloon: {
    color: "pink",
    name: "Шарик",
    svg: svg(
      `<path d="M50 70 C 50 80 42 84 46 96" fill="none" stroke="#3b2e25" stroke-width="2.5" stroke-linecap="round"/>` +
        `<path d="M50 70 C 24 66 18 40 26 24 C 34 8 66 8 74 24 C 82 40 76 66 50 70 Z" fill="#f58fb4" ${O}/>` +
        `<path d="M45 70 L 55 70 L 52 76 L 48 76 Z" fill="#f58fb4" ${O}/>` +
        `<ellipse cx="38" cy="30" rx="6" ry="10" fill="#fff" opacity=".6"/>`,
    ),
  },
  mushroom: {
    color: "red",
    name: "Грибок",
    svg: svg(
      `<path d="M38 56 L 36 88 C 36 92 64 92 64 88 L 62 56 Z" fill="#fff4e0" ${O}/>` +
        `<path d="M10 56 C 10 26 30 12 50 12 C 70 12 90 26 90 56 C 70 62 30 62 10 56 Z" fill="#e8463a" ${O}/>` +
        `<circle cx="34" cy="34" r="6" fill="#fff"/><circle cx="58" cy="26" r="5" fill="#fff"/><circle cx="70" cy="44" r="6" fill="#fff"/><circle cx="46" cy="48" r="4" fill="#fff"/>`,
    ),
  },
  star: {
    color: "yellow",
    name: "Звёздочка",
    svg: svg(
      `<path d="M50 8 L 61 36 L 92 38 L 68 58 L 76 90 L 50 72 L 24 90 L 32 58 L 8 38 L 39 36 Z" fill="#ffc94a" ${O}/>` +
        `<circle cx="42" cy="50" r="3" fill="#3b2e25"/><circle cx="58" cy="50" r="3" fill="#3b2e25"/>` +
        `<path d="M44 60 Q 50 65 56 60" fill="none" stroke="#3b2e25" stroke-width="3" stroke-linecap="round"/>`,
    ),
  },
  kite: {
    color: "mixed",
    name: "Воздушный змей",
    svg: svg(
      `<path d="M50 70 C 44 78 56 82 50 90 C 44 96 52 98 56 96" fill="none" stroke="#3b2e25" stroke-width="2.5" stroke-linecap="round"/>` +
        `<path d="M47 82 L 41 78 L 42 86 Z M 52 90 L 60 88 L 56 94 Z" fill="#f58fb4" stroke="#3b2e25" stroke-width="2"/>` +
        `<path d="M50 6 L 78 36 L 50 70 L 22 36 Z" fill="#3a8fd4" ${O}/>` +
        `<path d="M50 6 L 50 70 M 22 36 L 78 36" stroke="#3b2e25" stroke-width="2.5"/>` +
        `<path d="M50 6 L 78 36 L 50 36 Z" fill="#ffc94a"/><path d="M22 36 L 50 70 L 50 36 Z" fill="#ffc94a"/>` +
        `<path d="M50 6 L 78 36 L 50 70 L 22 36 Z" fill="none" ${O}/>`,
    ),
  },
  umbrella: {
    color: "pink",
    name: "Зонтик",
    svg: svg(
      `<path d="M50 48 L 50 82 C 50 92 36 92 36 82" fill="none" stroke="#3b2e25" stroke-width="5" stroke-linecap="round"/>` +
        `<path d="M8 50 C 10 24 30 10 50 10 C 70 10 90 24 92 50 C 86 44 78 44 71 50 C 64 44 57 44 50 50 C 43 44 36 44 29 50 C 22 44 14 44 8 50 Z" fill="#9b6cd8" ${O}/>` +
        `<path d="M50 10 C 40 22 36 36 36 47 M50 10 C 60 22 64 36 64 47" fill="none" stroke="#3b2e25" stroke-width="2.5"/>`,
    ),
  },
  sun: {
    color: "yellow",
    name: "Солнышко",
    svg: svg(
      sunRays() +
        `<circle cx="50" cy="50" r="24" fill="#ffd54a" ${O}/>` +
        `<circle cx="42" cy="47" r="3" fill="#3b2e25"/><circle cx="58" cy="47" r="3" fill="#3b2e25"/>` +
        `<path d="M42 57 Q 50 64 58 57" fill="none" stroke="#3b2e25" stroke-width="3" stroke-linecap="round"/>`,
    ),
  },
  fish: {
    color: "orange",
    name: "Рыбка",
    svg: svg(
      `<path d="M70 50 L 94 30 L 92 70 Z" fill="#f5a623" ${O}/>` +
        `<path d="M8 50 C 22 24 56 20 74 50 C 56 80 22 76 8 50 Z" fill="#ffb347" ${O}/>` +
        `<circle cx="26" cy="46" r="4" fill="#3b2e25"/>` +
        `<path d="M44 36 C 50 44 50 56 44 64" fill="none" stroke="#3b2e25" stroke-width="2.5"/>`,
    ),
  },
  car: {
    color: "red",
    name: "Машинка",
    svg: svg(
      `<path d="M8 66 L 8 52 C 8 46 12 44 18 44 L 28 44 L 38 28 C 40 25 42 24 46 24 L 66 24 C 70 24 72 26 74 29 L 82 44 L 86 44 C 90 44 92 48 92 52 L 92 66 Z" fill="#e8463a" ${O}/>` +
        `<path d="M40 44 L 47 32 L 56 32 L 56 44 Z M 62 44 L 62 32 L 68 32 L 74 44 Z" fill="#cfeefc" stroke="#3b2e25" stroke-width="2.5" stroke-linejoin="round"/>` +
        `<circle cx="28" cy="68" r="11" fill="#3b2e25"/><circle cx="28" cy="68" r="4" fill="#ccc"/>` +
        `<circle cx="72" cy="68" r="11" fill="#3b2e25"/><circle cx="72" cy="68" r="4" fill="#ccc"/>`,
    ),
  },
  house: {
    color: "mixed",
    name: "Домик",
    svg: svg(
      `<path d="M18 46 L 18 90 L 82 90 L 82 46" fill="#ffe1a8" ${O}/>` +
        `<path d="M6 50 L 50 12 L 94 50 Z" fill="#e8463a" ${O}/>` +
        `<path d="M42 90 L 42 64 L 58 64 L 58 90" fill="#9b6a3c" ${O}/>` +
        `<rect x="24" y="56" width="12" height="12" fill="#cfeefc" stroke="#3b2e25" stroke-width="2.5"/>` +
        `<rect x="64" y="56" width="12" height="12" fill="#cfeefc" stroke="#3b2e25" stroke-width="2.5"/>`,
    ),
  },
  carrot: {
    color: "orange",
    name: "Морковка",
    svg: svg(
      `<path d="M50 22 C 44 8 34 6 30 10 M50 22 C 50 8 56 4 60 6 M50 22 C 58 12 70 12 72 16" fill="none" stroke="#3f8f2c" stroke-width="6" stroke-linecap="round"/>` +
        `<path d="M34 26 C 40 20 60 20 66 26 C 66 46 56 78 50 94 C 44 78 34 46 34 26 Z" fill="#f5862b" ${O}/>` +
        `<path d="M40 40 L 48 40 M 52 54 L 60 54 M 42 66 L 49 66" stroke="#3b2e25" stroke-width="2.5" stroke-linecap="round"/>`,
    ),
  },
  pear: {
    color: "green",
    name: "Груша",
    svg: svg(
      `<path d="M50 20 C 40 20 38 34 36 44 C 22 52 18 72 28 84 C 38 94 62 94 72 84 C 82 72 78 52 64 44 C 62 34 60 20 50 20 Z" fill="#9ccc3c" ${O}/>` +
        `<path d="M50 20 C 50 14 52 10 55 6" fill="none" ${O}/>` +
        `<path d="M53 14 C 60 6 72 8 74 12 C 68 18 60 19 53 14 Z" fill="#5aac3e" ${O}/>` +
        `<ellipse cx="36" cy="66" rx="5" ry="9" fill="#fff" opacity=".5"/>`,
    ),
  },
  cherry: {
    color: "red",
    name: "Вишенки",
    svg: svg(
      `<path d="M30 66 C 34 40 46 22 62 12 M70 70 C 68 44 64 26 62 12" fill="none" stroke="#3f8f2c" stroke-width="4" stroke-linecap="round"/>` +
        `<path d="M62 12 C 70 4 84 6 88 12 C 80 20 70 20 62 12 Z" fill="#6fbf4a" ${O}/>` +
        `<circle cx="30" cy="72" r="17" fill="#d6303a" ${O}/><circle cx="70" cy="74" r="17" fill="#e8463a" ${O}/>` +
        `<circle cx="24" cy="66" r="4" fill="#fff" opacity=".6"/><circle cx="64" cy="68" r="4" fill="#fff" opacity=".6"/>`,
    ),
  },
  banana: {
    color: "yellow",
    name: "Банан",
    svg: svg(
      `<path d="M78 14 L 84 12 L 86 20 C 90 54 66 86 26 86 C 16 86 12 80 16 76 C 50 76 74 54 76 22 Z" fill="#ffd54a" ${O}/>` +
        `<path d="M24 80 C 56 78 76 56 80 24" fill="none" stroke="#e0a82a" stroke-width="3" stroke-linecap="round"/>`,
    ),
  },
  leaf: {
    color: "green",
    name: "Листик",
    svg: svg(
      `<path d="M18 84 C 10 46 36 14 86 12 C 88 60 60 90 18 84 Z" fill="#6fbf4a" ${O}/>` +
        `<path d="M14 90 L 24 78 C 40 60 56 42 74 26 M40 58 L 38 40 M52 46 L 64 48 M30 70 L 46 72" fill="none" stroke="#3f8f2c" stroke-width="3" stroke-linecap="round"/>`,
    ),
  },
  flower: {
    color: "pink",
    name: "Цветочек",
    svg: svg(
      `<path d="M50 56 L 50 92" stroke="#3f8f2c" stroke-width="6" stroke-linecap="round"/>` +
        `<path d="M50 80 C 40 70 28 72 24 78 C 32 86 44 86 50 80 Z" fill="#6fbf4a" ${O}/>` +
        [0, 1, 2, 3, 4]
          .map((i) => {
            const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            return `<circle cx="${(50 + Math.cos(a) * 18).toFixed(1)}" cy="${(36 + Math.sin(a) * 18).toFixed(1)}" r="13" fill="#f58fb4" ${O}/>`;
          })
          .join("") +
        `<circle cx="50" cy="36" r="10" fill="#ffc94a" ${O}/>`,
    ),
  },
  boat: {
    color: "blue",
    name: "Кораблик",
    svg: svg(
      `<path d="M50 12 L 50 64" stroke="#3b2e25" stroke-width="4" stroke-linecap="round"/>` +
        `<path d="M54 16 L 82 58 L 54 58 Z" fill="#fff" ${O}/><path d="M46 24 L 22 58 L 46 58 Z" fill="#cfeefc" ${O}/>` +
        `<path d="M10 66 L 90 66 L 78 86 L 22 86 Z" fill="#3a8fd4" ${O}/>` +
        `<circle cx="36" cy="76" r="3.5" fill="#fff"/><circle cx="50" cy="76" r="3.5" fill="#fff"/><circle cx="64" cy="76" r="3.5" fill="#fff"/>`,
    ),
  },
  drop: {
    color: "blue",
    name: "Капелька",
    svg: svg(
      `<path d="M50 8 C 62 30 80 46 80 64 C 80 82 66 92 50 92 C 34 92 20 82 20 64 C 20 46 38 30 50 8 Z" fill="#5ab4ec" ${O}/>` +
        `<ellipse cx="36" cy="62" rx="5" ry="10" fill="#fff" opacity=".6"/>` +
        `<circle cx="43" cy="66" r="3" fill="#3b2e25"/><circle cx="59" cy="66" r="3" fill="#3b2e25"/>` +
        `<path d="M44 76 Q 51 81 58 76" fill="none" stroke="#3b2e25" stroke-width="3" stroke-linecap="round"/>`,
    ),
  },
  cube: {
    color: "green",
    name: "Кубик",
    svg: svg(
      `<path d="M20 34 L 50 20 L 80 34 L 50 48 Z" fill="#9ee07a" ${O}/>` +
        `<path d="M20 34 L 50 48 L 50 86 L 20 72 Z" fill="#6fbf4a" ${O}/>` +
        `<path d="M80 34 L 50 48 L 50 86 L 80 72 Z" fill="#4f9e34" ${O}/>` +
        `<circle cx="35" cy="60" r="5" fill="#fff"/>` +
        `<circle cx="58" cy="56" r="4" fill="#fff"/><circle cx="72" cy="68" r="4" fill="#fff"/><circle cx="65" cy="62" r="4" fill="#fff"/>` +
        `<circle cx="50" cy="34" r="4" fill="#fff"/>`,
    ),
  },
  cup: {
    color: "blue",
    name: "Чашка",
    svg: svg(
      `<path d="M70 42 C 90 40 90 70 68 68" fill="none" stroke="#3b2e25" stroke-width="10" stroke-linecap="round"/>` +
        `<path d="M70 42 C 90 40 90 70 68 68" fill="none" stroke="#3a8fd4" stroke-width="4" stroke-linecap="round"/>` +
        `<path d="M16 32 L 76 32 L 70 78 C 68 86 62 88 56 88 L 36 88 C 30 88 24 86 22 78 Z" fill="#3a8fd4" ${O}/>` +
        `<ellipse cx="46" cy="32" rx="30" ry="6" fill="#cfeefc" ${O}/>` +
        `<circle cx="36" cy="58" r="5" fill="#fff"/><circle cx="54" cy="64" r="4" fill="#fff"/>` +
        `<path d="M36 22 C 32 16 40 12 36 6 M52 22 C 48 16 56 12 52 6" fill="none" stroke="#c7dcec" stroke-width="3" stroke-linecap="round"/>`,
    ),
  },
};

export const OBJECT_IDS = Object.keys(OBJECTS) as ObjectId[];
