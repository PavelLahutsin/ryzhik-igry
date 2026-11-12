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
  /** Digits and letters: small numbers show the order of the lines. */
  order?: boolean;
  /**
   * Less help later on, step by step: "next" — only the current line is
   * shown, the arrow stays; "less" — only the current line, no arrow.
   */
  help?: "next" | "less";
  /** Where smoke puffs come out (chimney), when `alive` is "smoke" or "drive". */
  puff?: [number, number];
};

const INK = "#3b2e25";
const eye = (x: number, y: number, r = 5): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}"/><circle cx="${x + r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.32}" fill="#fff"/>`;
const cheek = (x: number, y: number, r = 6): string => `<circle cx="${x}" cy="${y}" r="${r}" fill="#f58fb4" opacity=".55"/>`;
const smile = (x1: number, y: number, x2: number, dip = 7, w = 4): string =>
  `<path d="M${x1} ${y} Q ${(x1 + x2) / 2} ${y + dip} ${x2} ${y}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round"/>`;

export const worlds = [
  { id: "first", title: "Первые рисунки", color: "#ffb23f" },
  { id: "animals", title: "Оживают!", color: "#7cc46a" },
  { id: "harder", title: "Посложнее", color: "#6db3d4" },
  { id: "master", title: "Мастер рисования", color: "#9b6cd8" },
  { id: "paths", title: "Длинные дорожки", color: "#3fae6a" },
];

/** A spiral from the centre out, as one line (for «Леденец»). */
function spiral(cx: number, cy: number, turns: number, r0: number, r1: number): string {
  const n = Math.round(turns * 36);
  let d = "";
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * turns * 2 * Math.PI;
    const r = r0 + ((r1 - r0) * i) / n;
    d += `${i ? " L" : "M"}${(cx + r * Math.cos(t)).toFixed(1)} ${(cy + r * Math.sin(t)).toFixed(1)}`;
  }
  return d;
}

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
    fill: `<path d="M98 96 C 70 44 26 50 32 86 C 26 124 70 132 98 106 Z" fill="#f58fb4"/><path d="M102 96 C 130 44 174 50 168 86 C 174 124 130 132 102 106 Z" fill="#f58fb4"/><circle cx="62" cy="84" r="11" fill="#fff"/><circle cx="138" cy="84" r="11" fill="#fff"/><circle cx="70" cy="114" r="7" fill="#ffc94a"/><circle cx="130" cy="114" r="7" fill="#ffc94a"/><ellipse cx="100" cy="112" rx="9" ry="34" fill="#7a4a9e"/><circle cx="100" cy="70" r="12" fill="#7a4a9e"/>${eye(95, 68, 3)}${eye(105, 68, 3)}<path d="M96 60 L 86 44 M104 60 L 114 44" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><circle cx="86" cy="44" r="4" fill="${INK}"/><circle cx="114" cy="44" r="4" fill="${INK}"/>`,
  },
  {
    id: "r7",
    world: "animals",
    title: "Ёжик",
    ink: "#7a4a22",
    alive: "run",
    done: "Ёжик побежал за яблоком!",
    strokes: [
      "M40 150 C 32 140 30 132 36 126 L28 112 L44 110 L40 92 L58 96 L62 76 L78 86 L88 66 L100 82 L114 68 L120 90",
      "M120 90 C 140 92 158 106 172 120 C 180 128 178 136 168 138 C 158 140 150 152 134 156 H48 C 44 156 42 154 40 150",
    ],
    fill: `<path d="M40 150 C 32 140 30 132 36 126 L28 112 L44 110 L40 92 L58 96 L62 76 L78 86 L88 66 L100 82 L114 68 L120 90 C 140 92 158 106 172 120 C 180 128 178 136 168 138 C 158 140 150 152 134 156 H48 C 44 156 42 154 40 150 Z" fill="#9a5f30"/>`
      + `<path d="M58 112 L66 102 M78 104 L86 92 M98 98 L104 88 M70 128 L78 118 M92 120 L98 110" stroke="#6e4020" stroke-width="4" stroke-linecap="round"/>`
      + `<path d="M120 90 C 140 92 158 106 172 120 C 180 128 178 136 168 138 C 158 140 150 152 134 156 H118 C 104 134 106 106 120 90 Z" fill="#f3d3a6"/>`
      + `<circle cx="174" cy="126" r="7" fill="${INK}"/>${eye(146, 112, 6)}${cheek(146, 134)}${smile(152, 140, 164, 5)}`
      + `<ellipse cx="66" cy="158" rx="12" ry="6" fill="#6e4020"/><ellipse cx="124" cy="158" rx="12" ry="6" fill="#6e4020"/>`
      + `<circle cx="80" cy="60" r="16" fill="#e8463a"/><path d="M80 44 q4 -8 12 -8 q-4 8 -12 8" fill="#3f8f2c"/><ellipse cx="74" cy="54" rx="4" ry="6" fill="#fff" opacity=".5"/>`,
  },
  {
    id: "r8",
    world: "animals",
    title: "Улитка",
    ink: "#b8732f",
    alive: "crawl",
    done: "Улитка ползёт — не торопится!",
    strokes: [
      "M94 64 A46 46 0 1 1 93.9 64",
      "M96 110 C 96 102 108 102 108 112 C 108 124 90 128 84 114 C 76 96 100 84 116 96 C 134 110 124 140 98 142 C 70 144 56 116 70 94",
      "M24 162 H140 C 162 162 178 150 178 128 C 178 108 164 98 152 102 C 140 106 140 124 138 140",
    ],
    fill: `<path d="M24 162 H140 C 162 162 178 150 178 128 C 178 108 164 98 152 102 C 140 106 140 124 138 140 L 60 148 C 40 150 26 154 24 162 Z" fill="#f7d98c"/>`
      + `<path d="M150 102 L142 74 M166 104 L176 76" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><circle cx="142" cy="72" r="6" fill="#ffb23f"/><circle cx="176" cy="74" r="6" fill="#ffb23f"/>`
      + `<circle cx="94" cy="110" r="46" fill="#f2a04f"/><path d="M94 64 A46 46 0 0 1 140 110" fill="none" stroke="#ffc985" stroke-width="8" stroke-linecap="round" opacity=".7"/>`
      + `${eye(162, 120, 5)}${cheek(168, 138, 5)}${smile(154, 140, 166, 5, 3.5)}`,
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
  {
    id: "r13",
    world: "harder",
    title: "Грибок",
    ink: "#c0392b",
    done: "Грибок вырос!",
    strokes: [
      "M36 108 C 36 60 70 38 100 38 C 130 38 164 60 164 108 Z",
      "M78 108 C 74 130 72 150 76 166 H124 C 128 150 126 130 122 108",
      "M70 72 A10 10 0 1 1 69.9 72",
      "M124 64 A9 9 0 1 1 123.9 64",
    ],
    fill: `<path d="M78 108 C 74 130 72 150 76 166 H124 C 128 150 126 130 122 108 Z" fill="#fbe9cc"/><path d="M36 108 C 36 60 70 38 100 38 C 130 38 164 60 164 108 Z" fill="#e8463a"/><circle cx="70" cy="82" r="10" fill="#fff"/><circle cx="124" cy="73" r="9" fill="#fff"/><circle cx="104" cy="56" r="6" fill="#fff"/><circle cx="146" cy="94" r="6" fill="#fff"/>${eye(90, 132, 4.5)}${eye(110, 132, 4.5)}${smile(94, 146, 106, 5, 3.5)}<path d="M30 172 q20 -10 40 0 q30 -12 60 0 q20 -8 40 0" fill="none" stroke="#7cc46a" stroke-width="6" stroke-linecap="round"/>`,
    alive: "sway",
  },
  {
    id: "r14",
    world: "harder",
    title: "Ёлочка",
    ink: "#2f8a3e",
    done: "Ёлочка засияла!",
    strokes: [
      "M100 30 L136 76 H64 Z",
      "M100 62 L148 116 H52 Z",
      "M100 98 L162 160 H38 Z",
      "M90 160 V182 H110 V160",
    ],
    fill: `<rect x="90" y="156" width="20" height="26" fill="#8a5a2b"/><path d="M100 98 L162 160 H38 Z" fill="#3fae6a"/><path d="M100 62 L148 116 H52 Z" fill="#46b873"/><path d="M100 30 L136 76 H64 Z" fill="#52c27e"/><circle cx="78" cy="140" r="7" fill="#e8463a"/><circle cx="124" cy="146" r="7" fill="#ffc94a"/><circle cx="100" cy="104" r="6" fill="#6db3d4"/><circle cx="118" cy="96" r="6" fill="#e8463a"/><circle cx="86" cy="64" r="5" fill="#ffc94a"/><path d="M100 14 L105 25 L117 26 L108 33 L111 45 L100 39 L89 45 L92 33 L83 26 L95 25 Z" fill="#ffd54a" stroke="#f5a623" stroke-width="2"/>`,
    alive: "glow",
  },
  {
    id: "r15",
    world: "harder",
    title: "Черепаха",
    ink: "#2f8a3e",
    done: "Черепаха пошла гулять!",
    strokes: [
      "M40 132 C 40 80 70 60 100 60 C 130 60 160 80 160 132 Z",
      "M160 120 C 168 100 188 98 190 116 C 192 130 178 136 162 132",
      "M54 132 V152 H72 V132 M128 132 V152 H146 V132",
      "M72 96 L100 80 L128 96 L120 122 H80 Z",
    ],
    fill: `<path d="M54 132 V152 H72 V132 Z M128 132 V152 H146 V132 Z" fill="#9bd27a"/><path d="M160 120 C 168 100 188 98 190 116 C 192 130 178 136 162 132 Z" fill="#9bd27a"/><path d="M40 132 C 40 80 70 60 100 60 C 130 60 160 80 160 132 Z" fill="#3fae6a"/><path d="M72 96 L100 80 L128 96 L120 122 H80 Z" fill="#7cc46a"/><path d="M72 96 L52 104 M128 96 L148 104 M80 122 L70 132 M120 122 L130 132 M100 80 V64" stroke="#2f8a3e" stroke-width="4"/>${eye(178, 112, 4.5)}${smile(176, 124, 186, 4, 3)}<path d="M30 132 H170" stroke="#3fae6a" stroke-width="6" stroke-linecap="round"/>`,
    alive: "crawl",
  },
  {
    id: "r16",
    world: "harder",
    title: "Котик",
    ink: "#e07a2c",
    done: "Котик прыгает!",
    strokes: [
      "M100 168 C 56 168 40 140 40 116 C 40 96 46 82 54 72 L50 34 L82 58 C 94 54 106 54 118 58 L150 34 L146 72 C 154 82 160 96 160 116 C 160 140 144 168 100 168",
      "M92 120 H108 L100 130 Z",
      "M100 130 C 100 140 88 144 82 138 M100 130 C 100 140 112 144 118 138",
      "M70 128 H34 M70 136 L38 146",
      "M130 128 H166 M130 136 L162 146",
    ],
    fill: `<path d="M100 168 C 56 168 40 140 40 116 C 40 96 46 82 54 72 L50 34 L82 58 C 94 54 106 54 118 58 L150 34 L146 72 C 154 82 160 96 160 116 C 160 140 144 168 100 168 Z" fill="#ffb15e"/><path d="M58 64 L56 46 L74 60 Z M142 64 L144 46 L126 60 Z" fill="#f7a3b8"/><path d="M84 60 L92 78 M100 58 V78 M116 60 L108 78" stroke="#e8822a" stroke-width="5" stroke-linecap="round"/><ellipse cx="100" cy="140" rx="30" ry="22" fill="#fff3e0"/>${eye(78, 104, 7)}${eye(122, 104, 7)}<path d="M92 120 H108 L100 130 Z" fill="#f27aa0"/>${cheek(64, 128, 7)}${cheek(136, 128, 7)}`,
    alive: "bounce",
  },
  {
    id: "r17",
    world: "harder",
    title: "Ракета",
    ink: "#e8463a",
    done: "Ракета летит к звёздам!",
    strokes: [
      "M100 24 C 128 46 134 84 128 140 H72 C 66 84 72 46 100 24",
      "M100 70 A14 14 0 1 1 99.9 70",
      "M72 110 L48 146 H72",
      "M128 110 L152 146 H128",
      "M84 146 C 86 166 94 176 100 188 C 106 176 114 166 116 146",
    ],
    fill: `<path d="M84 146 C 86 166 94 176 100 188 C 106 176 114 166 116 146 Z" fill="#ffb23f"/><path d="M92 146 C 94 160 98 168 100 176 C 102 168 106 160 108 146 Z" fill="#ffe36b"/><path d="M72 110 L48 146 H72 Z M128 110 L152 146 H128 Z" fill="#e8463a"/><path d="M100 24 C 128 46 134 84 128 140 H72 C 66 84 72 46 100 24 Z" fill="#f2f4f8"/><path d="M100 24 C 112 34 120 44 124 56 H76 C 80 44 88 34 100 24 Z" fill="#e8463a"/><circle cx="100" cy="84" r="14" fill="#6db3d4" stroke="#3a8fd4" stroke-width="4"/><ellipse cx="96" cy="80" rx="4" ry="6" fill="#fff" opacity=".7"/>`,
    alive: "float",
  },
  {
    id: "r18",
    world: "harder",
    title: "Паровозик",
    ink: "#3a8fd4",
    done: "Ту-ту! Паровозик поехал!",
    strokes: [
      "M28 146 V96 H76 V146",
      "M76 112 H156 C 166 112 170 120 170 128 V146 H28",
      "M130 112 V82 H150 V112",
      "M58 146 A16 16 0 1 1 57.9 146",
      "M140 146 A16 16 0 1 1 139.9 146",
    ],
    fill: `<path d="M22 96 H82 V86 H22 Z" fill="#e8463a"/><path d="M28 146 V96 H76 V146 Z" fill="#3a8fd4"/><rect x="38" y="104" width="28" height="22" rx="4" fill="#cfeefc"/><path d="M76 112 H156 C 166 112 170 120 170 128 V146 H76 Z" fill="#e8463a"/><path d="M130 112 V82 H150 V112 Z" fill="#3b2e25"/><path d="M126 82 H154 V74 H126 Z" fill="#3b2e25"/><circle cx="168" cy="126" r="5" fill="#ffd54a"/><path d="M90 122 H120" stroke="#ffd54a" stroke-width="5" stroke-linecap="round"/><circle cx="58" cy="162" r="16" fill="${INK}"/><circle cx="140" cy="162" r="16" fill="${INK}"/><circle cx="58" cy="162" r="6" fill="#ccc"/><circle cx="140" cy="162" r="6" fill="#ccc"/><circle cx="100" cy="166" r="11" fill="${INK}"/><path d="M10 182 H190" stroke="#9b6a3c" stroke-width="5" stroke-linecap="round"/>`,
    alive: "drive",
    puff: [140, 66],
  },
  {
    id: "r19",
    world: "master",
    title: "Самолёт",
    ink: "#3a8fd4",
    done: "Самолёт полетел!",
    help: "next",
    strokes: [
      "M24 108 C 24 96 40 90 60 90 H150 C 170 90 182 100 182 108 C 182 118 170 124 150 124 H60 C 40 124 24 118 24 108",
      "M88 108 L120 60 H136 L120 108",
      "M88 112 L116 152 H130 L118 112",
      "M36 96 L28 66 H42 L60 90",
      "M150 98 A7 7 0 1 1 149.9 98 M128 98 A7 7 0 1 1 127.9 98",
    ],
    fill: `<path d="M88 108 L120 60 H136 L120 108 Z" fill="#6db3d4"/><path d="M36 96 L28 66 H42 L60 90 Z" fill="#e8463a"/><path d="M24 108 C 24 96 40 90 60 90 H150 C 170 90 182 100 182 108 C 182 118 170 124 150 124 H60 C 40 124 24 118 24 108 Z" fill="#f2f4f8"/><path d="M24 108 C 24 116 40 124 60 124 H150 C 170 124 182 118 182 108 Z" fill="#dfe8f2"/><path d="M168 98 C 176 100 180 104 181 108 H166 Z" fill="#6db3d4"/><circle cx="150" cy="105" r="7" fill="#cfeefc"/><circle cx="128" cy="105" r="7" fill="#cfeefc"/><circle cx="106" cy="105" r="7" fill="#cfeefc"/><path d="M88 112 L116 152 H130 L118 112 Z" fill="#3a8fd4"/><path d="M20 40 q10 -8 20 0 q10 -8 20 0 M150 160 q10 -8 20 0 q10 -8 20 0" fill="none" stroke="#bfe3f5" stroke-width="6" stroke-linecap="round"/>`,
    alive: "float",
  },
  {
    id: "r20",
    world: "master",
    title: "Зайка",
    ink: "#8f8aa8",
    done: "Зайка скачет!",
    help: "next",
    strokes: [
      "M84 82 C 70 60 68 20 80 16 C 92 14 96 50 94 80",
      "M106 80 C 104 50 108 14 120 16 C 132 20 130 60 116 82",
      "M100 76 C 136 76 148 102 148 120 C 148 146 126 160 100 160 C 74 160 52 146 52 120 C 52 102 64 76 100 76",
      "M94 124 H106 L100 132 Z",
      "M100 132 C 100 140 90 142 86 136 M100 132 C 100 140 110 142 114 136",
    ],
    fill: `<path d="M84 82 C 70 60 68 20 80 16 C 92 14 96 50 94 80 Z M106 80 C 104 50 108 14 120 16 C 132 20 130 60 116 82 Z" fill="#eeeaf6"/><path d="M84 70 C 78 54 78 30 81 26 C 86 30 88 54 88 72 Z M112 72 C 112 54 114 30 119 26 C 122 30 122 54 116 70 Z" fill="#f7a3b8"/><path d="M100 76 C 136 76 148 102 148 120 C 148 146 126 160 100 160 C 74 160 52 146 52 120 C 52 102 64 76 100 76 Z" fill="#eeeaf6"/>${eye(82, 110, 6)}${eye(118, 110, 6)}<path d="M94 124 H106 L100 132 Z" fill="#f27aa0"/>${cheek(70, 130)}${cheek(130, 130)}<rect x="94" y="140" width="12" height="9" rx="2" fill="#fff" stroke="${INK}" stroke-width="2"/><path d="M60 168 q40 14 80 0" fill="none" stroke="#7cc46a" stroke-width="6" stroke-linecap="round"/><path d="M144 160 l8 -18 l6 18 Z" fill="#ff8a3d"/><path d="M152 142 l-4 -8 M152 142 l4 -8" stroke="#3fae6a" stroke-width="3" stroke-linecap="round"/>`,
    alive: "bounce",
  },
  {
    id: "r21",
    world: "master",
    title: "Сова",
    ink: "#8a5a2b",
    done: "Сова машет крыльями: у-ху!",
    help: "next",
    strokes: [
      "M100 178 C 56 178 44 140 44 108 C 44 76 54 56 60 40 L80 58 C 92 54 108 54 120 58 L140 40 C 146 56 156 76 156 108 C 156 140 144 178 100 178",
      "M80 72 A18 18 0 1 1 79.9 72",
      "M120 72 A18 18 0 1 1 119.9 72",
      "M92 106 L100 120 L108 106",
      "M100 120 C 124 120 134 136 134 148 C 134 166 120 176 100 176 C 80 176 66 166 66 148 C 66 136 76 120 100 120",
      "M44 120 C 30 130 32 150 48 156 M156 120 C 170 130 168 150 152 156",
    ],
    fill: `<path d="M100 178 C 56 178 44 140 44 108 C 44 76 54 56 60 40 L80 58 C 92 54 108 54 120 58 L140 40 C 146 56 156 76 156 108 C 156 140 144 178 100 178 Z" fill="#b07a46"/><path d="M44 120 C 30 130 32 150 48 156 Z M156 120 C 170 130 168 150 152 156 Z" fill="#8a5a2b"/><ellipse cx="100" cy="148" rx="34" ry="28" fill="#f3d3a6"/><path d="M82 140 l6 6 l6 -6 M106 140 l6 6 l6 -6 M94 156 l6 6 l6 -6" fill="none" stroke="#c99a68" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="80" cy="90" r="18" fill="#fff"/><circle cx="120" cy="90" r="18" fill="#fff"/>${eye(82, 92, 8)}${eye(122, 92, 8)}<path d="M92 106 L100 120 L108 106 Z" fill="#ffb23f"/><path d="M80 182 l-6 8 M88 182 v9 M112 182 v9 M120 182 l6 8" stroke="#ffb23f" stroke-width="4" stroke-linecap="round"/>`,
    alive: "rock",
  },
  {
    id: "r22",
    world: "master",
    title: "Лисёнок",
    ink: "#e8661c",
    done: "Лисёнок радуется!",
    help: "less",
    strokes: [
      "M100 168 C 70 168 40 140 36 106 L44 36 L84 70 C 94 66 106 66 116 70 L156 36 L164 106 C 160 140 130 168 100 168",
      "M52 110 C 66 118 82 120 100 140 C 118 120 134 118 148 110",
      "M88 142 C 92 136 108 136 112 142 C 108 150 92 150 88 142",
      "M70 92 A8 8 0 1 1 69.9 92",
      "M130 92 A8 8 0 1 1 129.9 92",
      "M90 154 Q 100 162 110 154",
    ],
    fill: `<path d="M100 168 C 70 168 40 140 36 106 L44 36 L84 70 C 94 66 106 66 116 70 L156 36 L164 106 C 160 140 130 168 100 168 Z" fill="#ff8a3d"/><path d="M50 52 L54 84 L72 70 Z M150 52 L146 84 L128 70 Z" fill="#3b2e25"/><path d="M36 106 C 52 112 80 118 100 140 C 120 118 148 112 164 106 C 160 140 130 168 100 168 C 70 168 40 140 36 106 Z" fill="#fff6ea"/>${eye(70, 100, 8)}${eye(130, 100, 8)}<path d="M88 142 C 92 136 108 136 112 142 C 108 150 92 150 88 142 Z" fill="${INK}"/>${cheek(58, 128, 8)}${cheek(142, 128, 8)}`,
    alive: "bounce",
  },
  {
    id: "r23",
    world: "master",
    title: "Замок",
    ink: "#8f6bd0",
    done: "В замке праздник!",
    help: "less",
    strokes: [
      "M40 176 V92 H52 V80 H62 V92 H72 V80 H82 V92 H92 V176",
      "M108 176 V92 H118 V80 H128 V92 H138 V80 H148 V92 H160 V176",
      "M92 120 H108",
      "M86 176 V144 C 86 128 114 128 114 144 V176",
      "M150 80 V36 L174 46 L150 56",
      "M40 176 H160",
    ],
    fill: `<path d="M40 176 V92 H52 V80 H62 V92 H72 V80 H82 V92 H92 V176 Z M108 176 V92 H118 V80 H128 V92 H138 V80 H148 V92 H160 V176 Z" fill="#cdbdf2"/><rect x="92" y="120" width="16" height="56" fill="#b9a5ec"/><path d="M86 176 V144 C 86 128 114 128 114 144 V176 Z" fill="#9b6a3c"/><path d="M150 36 L174 46 L150 56 Z" fill="#e8463a"/><rect x="58" y="110" width="16" height="22" rx="8" fill="#ffd54a" stroke="${INK}" stroke-width="3"/><rect x="126" y="110" width="16" height="22" rx="8" fill="#ffd54a" stroke="${INK}" stroke-width="3"/><path d="M20 30 l4 8 8 1 -6 6 2 8 -8 -4 -8 4 2 -8 -6 -6 8 -1 Z" fill="#ffd54a"/>`,
    alive: "glow",
  },
  {
    id: "r24",
    world: "master",
    title: "Пчёлка",
    ink: "#d99a00",
    done: "Пчёлка полетела: ж-ж-ж!",
    help: "less",
    strokes: [
      "M56 120 C 56 92 80 78 108 78 C 140 78 160 96 160 120 C 160 144 140 160 108 160 C 80 160 56 148 56 120",
      "M92 82 C 86 98 86 140 92 156",
      "M124 80 C 118 98 118 140 124 158",
      "M96 80 C 70 40 40 52 46 72 C 52 88 80 84 98 80",
      "M114 78 C 120 36 160 34 158 58 C 156 76 130 80 116 80",
      "M160 120 L182 124 L160 130",
    ],
    fill: `<path d="M96 80 C 70 40 40 52 46 72 C 52 88 80 84 98 80 Z M114 78 C 120 36 160 34 158 58 C 156 76 130 80 116 80 Z" fill="#d8f1ff" opacity=".9"/><path d="M160 120 L182 124 L160 130 Z" fill="${INK}"/><path d="M56 120 C 56 92 80 78 108 78 C 140 78 160 96 160 120 C 160 144 140 160 108 160 C 80 160 56 148 56 120 Z" fill="#ffd54a"/><path d="M92 82 C 86 98 86 140 92 156 L106 160 C 100 140 100 98 106 78 Z M124 80 C 118 98 118 140 124 158 L138 154 C 132 140 132 100 138 84 Z" fill="${INK}"/>${eye(72, 112, 6)}${cheek(68, 132, 6)}${smile(64, 140, 80, 6, 3.5)}<path d="M64 96 L52 76 M74 90 L70 70" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><circle cx="52" cy="74" r="4" fill="${INK}"/><circle cx="70" cy="68" r="4" fill="${INK}"/>`,
    alive: "flutter",
  },
  // --- Длинные дорожки: one long line without lifting the finger (graphomotor patterns).
  {
    id: "r25",
    world: "paths",
    title: "Волны",
    ink: "#3a8fd4",
    help: "less",
    alive: "rock",
    done: "Море волнуется — кораблик качается!",
    strokes: ["M20 122 q15 -14 30 0 t30 0 t30 0 t30 0 t30 0", "M20 148 q15 -14 30 0 t30 0 t30 0 t30 0 t30 0", "M20 174 q15 -14 30 0 t30 0 t30 0 t30 0 t30 0"],
    fill: `<rect x="12" y="116" width="176" height="74" rx="16" fill="#bfe3f5"/><circle cx="160" cy="40" r="16" fill="#ffd54a"/><path d="M70 104 H130 L120 118 H80 Z" fill="#e8463a"/><path d="M100 104 V58 L128 96 H100 Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`,
  },
  {
    id: "r26",
    world: "paths",
    title: "Горы",
    ink: "#5a6b7c",
    help: "less",
    alive: "glow",
    done: "Высокие горы со снежными шапками!",
    strokes: ["M14 164 L54 84 L80 124 L110 52 L146 128 L166 100 L188 164", "M14 176 H188"],
    fill: `<path d="M14 164 L54 84 L80 124 L110 52 L146 128 L166 100 L188 164 Z" fill="#9fb3c8"/><path d="M44 104 L54 84 L64 104 L56 98 L50 106 Z M98 76 L110 52 L122 78 L114 72 L106 80 Z" fill="#fff"/><circle cx="40" cy="40" r="14" fill="#ffd54a"/><rect x="14" y="164" width="174" height="12" fill="#8fd46a"/>`,
  },
  {
    id: "r27",
    world: "paths",
    title: "Заборчик",
    ink: "#a0683a",
    help: "less",
    alive: "sway",
    done: "Ровный заборчик, а за ним цветы!",
    strokes: [
      "M30 172 V96 L40 84 L50 96 V172 H70 V96 L80 84 L90 96 V172 H110 V96 L120 84 L130 96 V172 H150 V96 L160 84 L170 96 V172",
      "M22 118 H178",
      "M22 148 H178",
    ],
    fill: `<path d="M30 172 V96 L40 84 L50 96 V172 Z M70 172 V96 L80 84 L90 96 V172 Z M110 172 V96 L120 84 L130 96 V172 Z M150 172 V96 L160 84 L170 96 V172 Z" fill="#f3d9a8"/><rect x="22" y="114" width="156" height="8" fill="#e0b47a"/><rect x="22" y="144" width="156" height="8" fill="#e0b47a"/><path d="M60 60 V84 M100 52 V84 M140 62 V84" stroke="#3fae6a" stroke-width="4"/><circle cx="60" cy="56" r="9" fill="#f58fb4"/><circle cx="100" cy="48" r="9" fill="#ffc94a"/><circle cx="140" cy="58" r="9" fill="#9b6cd8"/>`,
  },
  {
    id: "r28",
    world: "paths",
    title: "Гусеница",
    ink: "#3fae6a",
    help: "less",
    alive: "crawl",
    done: "Гусеница ползёт по листику!",
    strokes: ["M20 150 C20 116 52 116 52 150 C52 116 84 116 84 150 C84 116 116 116 116 150 C116 116 148 116 148 150", "M20 150 H148", "M168 108 A20 20 0 1 1 167.9 108"],
    fill: `<path d="M8 168 Q 100 150 192 168 Q 100 186 8 168 Z" fill="#8fd46a"/><path d="M20 150 C20 116 52 116 52 150 C52 116 84 116 84 150 C84 116 116 116 116 150 C116 116 148 116 148 150 Z" fill="#a6dd6e"/><circle cx="168" cy="128" r="20" fill="#a6dd6e"/>${eye(162, 124, 4)}${eye(176, 124, 4)}${smile(160, 136, 176, 5, 3)}<path d="M160 110 L154 92 M176 110 L184 92" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><circle cx="154" cy="90" r="4" fill="#e8463a"/><circle cx="184" cy="90" r="4" fill="#e8463a"/>`,
  },
  {
    id: "r29",
    world: "paths",
    title: "Леденец",
    ink: "#e8463a",
    help: "less",
    alive: "glow",
    done: "Сладкий леденец на палочке!",
    strokes: [spiral(100, 82, 3, 4, 50), "M100 134 V188"],
    fill: `<circle cx="100" cy="82" r="54" fill="#ffd1dc"/><path d="${spiral(100, 82, 3, 4, 50)}" fill="none" stroke="#fff" stroke-width="10" opacity=".7"/><rect x="95" y="134" width="10" height="54" rx="4" fill="#fff" stroke="${INK}" stroke-width="3"/><path d="M100 140 L84 132 L84 150 Z M100 140 L116 132 L116 150 Z" fill="#9b6cd8"/>`,
  },
  {
    id: "r30",
    world: "paths",
    title: "Радуга",
    ink: "#9b6cd8",
    help: "less",
    alive: "glow",
    done: "Радуга после дождика!",
    strokes: ["M28 150 A72 72 0 0 1 172 150", "M48 150 A52 52 0 0 1 152 150", "M68 150 A32 32 0 0 1 132 150", "M10 160 Q10 138 32 142 Q42 124 60 140 Q76 140 74 160 Z", "M126 160 Q124 140 142 140 Q158 124 168 142 Q190 138 190 160 Z"],
    fill: `<path d="M28 150 A72 72 0 0 1 172 150" fill="none" stroke="#e8463a" stroke-width="16"/><path d="M38 150 A62 62 0 0 1 162 150" fill="none" stroke="#ff8a3d" stroke-width="8"/><path d="M48 150 A52 52 0 0 1 152 150" fill="none" stroke="#ffc94a" stroke-width="12"/><path d="M58 150 A42 42 0 0 1 142 150" fill="none" stroke="#5fbf4e" stroke-width="10"/><path d="M68 150 A32 32 0 0 1 132 150" fill="none" stroke="#3a8fd4" stroke-width="10"/><path d="M10 160 Q10 138 32 142 Q42 124 60 140 Q76 140 74 160 Z M126 160 Q124 140 142 140 Q158 124 168 142 Q190 138 190 160 Z" fill="#fff"/>`,
  },
];

export const levels = pictures;
