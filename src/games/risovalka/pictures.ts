import type { LevelInfo } from "../../shared/levelgame";

/**
 * Pictures to trace, in a 200 × 200 box. `strokes` are traced one by one
 * (each starts where the green dot is); `fill` appears under the lines when
 * all are done; `alive` is how the finished picture comes to life.
 */
export type Alive = "glow" | "bounce" | "float" | "swim" | "flutter" | "run" | "crawl" | "smoke" | "drive" | "sway" | "rain" | "rock" | "count";

export type Picture = LevelInfo & {
  strokes: string[];
  fill: string;
  ink: string;
  alive: Alive;
  done: string;
  /** Digits: how many things to count after tracing. */
  count?: number;
};

const INK = "#3b2e25";
const eye = (x: number, y: number): string => `<circle cx="${x}" cy="${y}" r="5" fill="${INK}"/><circle cx="${x + 1.5}" cy="${y - 1.5}" r="1.6" fill="#fff"/>`;

export const worlds = [
  { id: "first", title: "Первые рисунки", color: "#ffb23f" },
  { id: "animals", title: "Оживают!", color: "#7cc46a" },
  { id: "digits", title: "Цифры", color: "#6db3d4" },
];

export const pictures: Picture[] = [
  {
    id: "r1",
    world: "first",
    title: "Солнышко",
    ink: "#f5a623",
    alive: "glow",
    done: "Солнышко улыбается!",
    strokes: ["M100 58 A42 42 0 1 1 99.9 58", "M100 40 V16", "M160 100 H184", "M100 160 V184", "M40 100 H16"],
    fill: `<circle cx="100" cy="100" r="42" fill="#ffd54a"/>${eye(86, 94)}${eye(114, 94)}<path d="M84 114 Q 100 128 116 114" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><circle cx="76" cy="110" r="6" fill="#f58fb4" opacity=".6"/><circle cx="124" cy="110" r="6" fill="#f58fb4" opacity=".6"/>`,
  },
  {
    id: "r2",
    world: "first",
    title: "Мячик",
    ink: "#e8463a",
    alive: "bounce",
    done: "Мячик прыгает!",
    strokes: ["M100 40 A60 60 0 1 1 99.9 40", "M42 100 Q 100 140 158 100"],
    fill: `<circle cx="100" cy="100" r="60" fill="#e8463a"/><path d="M42 100 Q 100 140 158 100 Q 150 150 100 160 Q 50 150 42 100 Z" fill="#ffc94a"/><ellipse cx="78" cy="70" rx="10" ry="16" fill="#fff" opacity=".5"/>`,
  },
  {
    id: "r3",
    world: "first",
    title: "Воздушный шарик",
    ink: "#f27aa0",
    alive: "float",
    done: "Шарик полетел!",
    strokes: ["M100 30 C 140 30 152 66 152 88 C 152 118 126 140 100 140 C 74 140 48 118 48 88 C 48 66 60 30 100 30", "M100 140 C 88 158 112 170 100 190"],
    fill: `<path d="M100 30 C 140 30 152 66 152 88 C 152 118 126 140 100 140 C 74 140 48 118 48 88 C 48 66 60 30 100 30 Z" fill="#f58fb4"/><ellipse cx="80" cy="64" rx="9" ry="16" fill="#fff" opacity=".6"/>`,
  },
  {
    id: "r4",
    world: "first",
    title: "Облачко",
    ink: "#6db3d4",
    alive: "rain",
    done: "Пошёл дождик!",
    strokes: ["M50 130 C 24 130 24 94 50 94 C 50 64 90 56 104 80 C 120 56 166 64 156 100 C 182 100 182 130 156 130 H50", "M72 150 L64 176", "M102 150 L94 176", "M132 150 L124 176"],
    fill: `<path d="M50 130 C 24 130 24 94 50 94 C 50 64 90 56 104 80 C 120 56 166 64 156 100 C 182 100 182 130 156 130 Z" fill="#e3f5ff"/>${eye(88, 108)}${eye(120, 108)}<path d="M96 120 q8 6 16 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`,
  },
  {
    id: "r5",
    world: "animals",
    title: "Рыбка",
    ink: "#f5862b",
    alive: "swim",
    done: "Рыбка поплыла!",
    strokes: ["M36 100 C 60 58 122 58 150 100 C 122 142 60 142 36 100", "M150 100 L184 74 L184 126 L150 100"],
    fill: `<path d="M150 100 L184 74 L184 126 Z" fill="#f5a623"/><path d="M36 100 C 60 58 122 58 150 100 C 122 142 60 142 36 100 Z" fill="#ffb347"/>${eye(64, 94)}<path d="M96 76 C 106 88 106 112 96 124" fill="none" stroke="#e8822a" stroke-width="4"/>`,
  },
  {
    id: "r6",
    world: "animals",
    title: "Бабочка",
    ink: "#9b6cd8",
    alive: "flutter",
    done: "Бабочка полетела!",
    strokes: [
      "M98 96 C 70 44 26 50 32 86 C 26 124 70 132 98 106",
      "M102 96 C 130 44 174 50 168 86 C 174 124 130 132 102 106",
      "M100 66 V146",
    ],
    fill: `<path d="M98 96 C 70 44 26 50 32 86 C 26 124 70 132 98 106 Z" fill="#f58fb4"/><path d="M102 96 C 130 44 174 50 168 86 C 174 124 130 132 102 106 Z" fill="#f58fb4"/><circle cx="62" cy="84" r="11" fill="#fff"/><circle cx="138" cy="84" r="11" fill="#fff"/><circle cx="70" cy="114" r="7" fill="#ffc94a"/><circle cx="130" cy="114" r="7" fill="#ffc94a"/><path d="M96 66 L 86 48 M104 66 L 114 48" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`,
  },
  {
    id: "r7",
    world: "animals",
    title: "Ёжик",
    ink: "#8a5a2b",
    alive: "run",
    done: "Ёжик побежал!",
    strokes: ["M36 132 L48 96 L60 122 L72 82 L86 114 L98 72 L110 110 L124 76 L134 112 L148 90 L158 126", "M36 132 C 60 154 140 154 160 134 L184 126 L160 112"],
    fill: `<path d="M36 132 L48 96 L60 122 L72 82 L86 114 L98 72 L110 110 L124 76 L134 112 L148 90 L158 126 Z" fill="#8a5a2b"/><path d="M36 132 C 60 154 140 154 160 134 L184 126 L160 112 C 150 120 120 128 36 132 Z" fill="#f0d2a8"/>${eye(160, 122)}<circle cx="184" cy="126" r="5" fill="${INK}"/>`,
  },
  {
    id: "r8",
    world: "animals",
    title: "Улитка",
    ink: "#c08a52",
    alive: "crawl",
    done: "Улитка ползёт!",
    strokes: [
      "M104 104 C 104 96 116 96 116 106 C 116 120 96 124 90 110 C 82 90 110 80 126 94 C 144 110 130 140 102 140 C 72 140 60 110 78 88",
      "M44 150 H160 C 174 150 178 134 168 124 L 176 104",
    ],
    fill: `<path d="M44 150 H160 C 174 150 178 134 168 124 L 160 130 C 150 140 120 146 44 150 Z" fill="#f5d38a"/><path d="M102 140 C 72 140 60 110 78 88 C 96 70 130 76 138 100 C 146 126 126 140 102 140 Z" fill="#e7a35a"/>${eye(170, 116)}`,
  },
  {
    id: "r9",
    world: "animals",
    title: "Машинка",
    ink: "#e8463a",
    alive: "drive",
    done: "Би-би! Машинка поехала!",
    strokes: ["M30 140 V116 C 30 108 36 104 42 104 H60 L76 78 H130 L148 104 H160 C 168 104 172 110 172 118 V140 H30", "M70 124 A16 16 0 1 1 69.9 124", "M134 124 A16 16 0 1 1 133.9 124"],
    fill: `<path d="M30 140 V116 C 30 108 36 104 42 104 H60 L76 78 H130 L148 104 H160 C 168 104 172 110 172 118 V140 Z" fill="#e8463a"/><path d="M82 102 L 92 86 H 104 V 102 Z M112 102 V86 H126 L 136 102 Z" fill="#cfeefc"/><circle cx="70" cy="140" r="16" fill="${INK}"/><circle cx="134" cy="140" r="16" fill="${INK}"/><circle cx="70" cy="140" r="6" fill="#ccc"/><circle cx="134" cy="140" r="6" fill="#ccc"/>`,
  },
  {
    id: "r10",
    world: "animals",
    title: "Домик",
    ink: "#9b6a3c",
    alive: "smoke",
    done: "В домике тепло!",
    strokes: ["M52 100 V170 H148 V100", "M40 106 L100 50 L160 106", "M88 170 V134 H112 V170"],
    fill: `<rect x="128" y="56" width="14" height="28" fill="#9b6a3c"/><path d="M52 100 V170 H148 V100 L100 58 Z" fill="#ffe1a8"/><path d="M40 106 L100 50 L160 106 Z" fill="#e8463a"/><rect x="88" y="134" width="24" height="36" fill="#9b6a3c"/><rect x="62" y="116" width="18" height="18" fill="#ffd54a" stroke="${INK}" stroke-width="3"/><rect x="120" y="116" width="18" height="18" fill="#ffd54a" stroke="${INK}" stroke-width="3"/>`,
  },
  {
    id: "r11",
    world: "animals",
    title: "Цветочек",
    ink: "#3f8f2c",
    alive: "sway",
    done: "Цветочек вырос!",
    strokes: ["M100 190 V108", "M100 80 C 70 40 130 40 100 80 C 140 50 150 110 100 80 C 130 120 70 120 100 80 C 50 110 60 50 100 80", "M100 160 C 76 156 62 140 70 132 C 84 130 98 144 100 160"],
    fill: `<path d="M100 160 C 76 156 62 140 70 132 C 84 130 98 144 100 160 Z" fill="#6fbf4a"/><circle cx="100" cy="56" r="18" fill="#f58fb4"/><circle cx="124" cy="80" r="18" fill="#f58fb4"/><circle cx="100" cy="104" r="18" fill="#f58fb4"/><circle cx="76" cy="80" r="18" fill="#f58fb4"/><circle cx="100" cy="80" r="13" fill="#ffc94a"/>`,
  },
  {
    id: "r12",
    world: "animals",
    title: "Кораблик",
    ink: "#3a8fd4",
    alive: "rock",
    done: "Кораблик плывёт!",
    strokes: ["M36 130 H164 L142 162 H58 L36 130", "M100 130 V36 L152 114 H100"],
    fill: `<path d="M36 130 H164 L142 162 H58 Z" fill="#3a8fd4"/><path d="M100 36 L152 114 H100 Z" fill="#fff"/><circle cx="78" cy="146" r="5" fill="#fff"/><circle cx="100" cy="146" r="5" fill="#fff"/><circle cx="122" cy="146" r="5" fill="#fff"/><path d="M10 176 q15 -10 30 0 t30 0 t30 0 t30 0 t30 0 t30 0" fill="none" stroke="#6db3d4" stroke-width="5" stroke-linecap="round"/>`,
  },
];

const DIGITS: Record<number, string[]> = {
  1: ["M78 62 L106 38 V164"],
  2: ["M64 70 C 64 36 136 36 136 74 C 136 106 66 138 64 162 H142"],
  3: ["M64 54 C 92 28 142 40 132 76 C 126 96 104 100 96 100 C 132 100 146 122 136 146 C 124 172 78 170 62 150"],
  4: ["M122 164 V38 L58 126 H148"],
  5: ["M138 42 H76 L70 96 C 96 84 142 90 140 126 C 138 162 90 170 64 150"],
  6: ["M132 48 C 100 32 64 58 64 110 C 64 150 88 164 104 164 C 130 164 142 144 142 126 C 142 104 126 92 104 92 C 84 92 70 104 66 118"],
  7: ["M62 42 H142 L94 164"],
  8: ["M100 100 C 68 90 68 42 100 42 C 132 42 132 90 100 100 C 64 110 64 162 100 162 C 136 162 136 110 100 100"],
  9: ["M136 84 C 132 102 116 110 100 110 C 80 110 64 96 64 76 C 64 56 82 42 100 42 C 122 42 138 58 136 92 C 134 132 116 162 74 160"],
};

for (let n = 1; n <= 9; n++) {
  pictures.push({
    id: `d${n}`,
    world: "digits",
    title: `Цифра ${n}`,
    ink: "#3a8fd4",
    alive: "count",
    count: n,
    done: "",
    strokes: DIGITS[n]!,
    fill: "",
  });
}

export const levels = pictures;
