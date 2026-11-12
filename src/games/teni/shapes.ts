/**
 * Extra flat pictures for «Тени» (viewBox 0 0 100 100), in the same style as
 * shared/objects.ts: bold outline, soft colours. What matters for the game
 * is the outline — the shadow is the same picture painted black — so every
 * picture has its own clear silhouette, and the «twins» differ in one
 * outline detail (a tail, an ear, a candle, the teeth of a key).
 */
const O = `stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"`;
const f = (c: string): string => `fill="${c}" ${O}`;
const svg = (body: string): string => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
/** A thick coloured line with the outline around it (tails, trunks, sticks). */
const rope = (d: string, c: string, w = 7): string =>
  `<path d="${d}" fill="none" stroke="#3b2e25" stroke-width="${w + 4}" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const eye = (x: number, y: number, r = 2.6): string => `<circle cx="${x}" cy="${y}" r="${r}" fill="#3b2e25"/>`;

export type ShapeGroup = "animals" | "toys" | "food" | "transport" | "home" | "nature";
export type Shape = { name: string; group: ShapeGroup; svg: string };

function cat(tail: "up" | "down"): string {
  const t = tail === "up" ? "M68 84 C86 82 92 62 84 48" : "M68 86 C80 92 92 90 95 80";
  return svg(
    rope(t, "#f39a3d") +
      `<path d="M32 90 C26 72 30 54 42 48 L58 48 C70 54 74 72 68 90 Z" ${f("#f39a3d")}/>` +
      `<path d="M36 28 L35 8 L48 19 Z" ${f("#f39a3d")}/><path d="M64 28 L65 8 L52 19 Z" ${f("#f39a3d")}/>` +
      `<circle cx="50" cy="32" r="16" ${f("#f39a3d")}/>` +
      eye(44, 30) + eye(56, 30) +
      `<path d="M47 37 L50 39 L53 37" fill="none" ${O}/>` +
      `<path d="M42 90 L42 76 M58 90 L58 76" fill="none" ${O}/>`,
  );
}

function rabbit(ear: "up" | "down"): string {
  const right =
    ear === "up"
      ? `<ellipse cx="58" cy="18" rx="6" ry="16" ${f("#e9e4f2")}/>`
      : `<path d="M56 34 C58 22 70 14 84 18 C82 26 70 32 60 38 Z" ${f("#e9e4f2")}/>`;
  return svg(
    `<ellipse cx="42" cy="18" rx="6" ry="16" ${f("#e9e4f2")}/>` +
      right +
      `<ellipse cx="50" cy="72" rx="22" ry="20" ${f("#e9e4f2")}/>` +
      `<circle cx="73" cy="80" r="6" ${f("#fff")}/>` +
      `<circle cx="50" cy="44" r="15" ${f("#e9e4f2")}/>` +
      eye(45, 42) + eye(55, 42) +
      `<ellipse cx="50" cy="49" rx="3" ry="2" fill="#f27aa0"/>`,
  );
}

function bird(crest: boolean): string {
  return svg(
    (crest ? `<path d="M50 30 L46 12 L54 24 L58 10 L60 26 L68 16 L64 32 Z" ${f("#e8463a")}/>` : "") +
      `<path d="M22 58 L6 46 L10 66 Z" ${f("#4aa3df")}/>` +
      `<path d="M20 58 C20 40 36 30 54 32 C72 34 80 48 78 62 C76 78 60 86 44 84 C30 82 20 72 20 58 Z" ${f("#4aa3df")}/>` +
      `<path d="M76 46 L94 50 L76 56 Z" ${f("#ffc94a")}/>` +
      `<path d="M34 58 C42 70 56 70 60 60" ${f("#7cc4ef")}/>` +
      eye(66, 45) +
      `<path d="M42 84 L40 94 M54 84 L56 94" fill="none" ${O}/>`,
  );
}

function iceCream(scoops: 1 | 2): string {
  const top =
    scoops === 1
      ? `<circle cx="50" cy="38" r="20" ${f("#f7b3c8")}/>`
      : `<circle cx="50" cy="42" r="19" ${f("#f7b3c8")}/><circle cx="50" cy="18" r="15" ${f("#fff2c2")}/>`;
  return svg(top + `<path d="M30 46 L50 94 L70 46 Z" ${f("#e8b36b")}/>` + `<path d="M38 56 L62 56 M42 68 L58 68" fill="none" ${O}/>`);
}

function cake(candles: 1 | 3): string {
  const xs = candles === 1 ? [50] : [32, 50, 68];
  let c = "";
  for (const x of xs) {
    c += `<rect x="${x - 3.5}" y="20" width="7" height="18" rx="2" ${f("#7cc4ef")}/>`;
    c += `<path d="M${x} 6 C${x + 6} 12 ${x + 4} 18 ${x} 18 C${x - 4} 18 ${x - 6} 12 ${x} 6 Z" ${f("#ffc94a")}/>`;
  }
  return svg(
    c +
      `<rect x="14" y="38" width="72" height="50" rx="8" ${f("#f7b3c8")}/>` +
      `<path d="M14 54 C24 62 30 50 40 58 C50 66 56 50 66 58 C76 64 80 54 86 56" fill="none" ${O}/>` +
      `<path d="M8 90 L92 90" fill="none" ${O}/>`,
  );
}

function key(teeth: "two" | "three"): string {
  const t =
    teeth === "two"
      ? `<path d="M52 50 L92 50 L92 60 L84 60 L84 70 L76 70 L76 60 L68 60 L68 70 L60 70 L60 60 L52 60 Z" ${f("#ffc94a")}/>`
      : `<path d="M52 50 L92 50 L92 74 L86 74 L86 60 L80 60 L80 70 L74 70 L74 60 L68 60 L68 78 L62 78 L62 60 L52 60 Z" ${f("#ffc94a")}/>`;
  return svg(t + `<circle cx="32" cy="55" r="20" ${f("#ffc94a")}/>` + `<circle cx="28" cy="55" r="7" fill="#fff" ${O}/>`);
}

function fir(tiers: 2 | 3): string {
  const body =
    tiers === 3
      ? `<path d="M50 6 L70 32 L60 32 L78 56 L66 56 L86 82 L14 82 L34 56 L22 56 L40 32 L30 32 Z" ${f("#4f9e5a")}/>`
      : `<path d="M50 8 L74 44 L62 44 L86 82 L14 82 L38 44 L26 44 Z" ${f("#4f9e5a")}/>`;
  return svg(`<rect x="43" y="80" width="14" height="14" rx="2" ${f("#a8743f")}/>` + body);
}

export const SHAPES: Record<string, Shape> = {
  // ---------------------------------------------------------------- animals
  cat: { name: "Котик с хвостиком вверх", group: "animals", svg: cat("up") },
  cat2: { name: "Котик с хвостиком вниз", group: "animals", svg: cat("down") },
  rabbit: { name: "Зайка", group: "animals", svg: rabbit("up") },
  rabbit2: { name: "Зайка с ушком вниз", group: "animals", svg: rabbit("down") },
  bird: { name: "Птичка", group: "animals", svg: bird(false) },
  bird2: { name: "Птичка с хохолком", group: "animals", svg: bird(true) },
  dog: {
    name: "Собачка",
    group: "animals",
    svg: svg(
      rope("M22 56 C12 50 10 38 16 30", "#d9a066") +
        `<rect x="20" y="48" width="52" height="26" rx="13" ${f("#d9a066")}/>` +
        `<path d="M26 70 L26 90 M38 72 L38 90 M56 72 L56 90 M66 70 L66 90" fill="none" stroke="#3b2e25" stroke-width="7" stroke-linecap="round"/>` +
        `<circle cx="74" cy="40" r="15" ${f("#d9a066")}/>` +
        `<ellipse cx="88" cy="46" rx="8" ry="6" ${f("#e8c49a")}/>` +
        `<path d="M66 28 C58 32 58 48 64 54 C70 48 70 34 66 28 Z" ${f("#8b5a2b")}/>` +
        eye(76, 36) + `<circle cx="94" cy="44" r="3" fill="#3b2e25"/>`,
    ),
  },
  elephant: {
    name: "Слон",
    group: "animals",
    svg: svg(
      `<ellipse cx="42" cy="58" rx="30" ry="22" ${f("#a9b4c2")}/>` +
        `<path d="M22 72 L22 92 L34 92 L34 76 M50 76 L50 92 L62 92 L62 72" ${f("#a9b4c2")}/>` +
        rope("M84 50 C90 64 88 78 94 84", "#a9b4c2", 9) +
        `<circle cx="74" cy="44" r="16" ${f("#a9b4c2")}/>` +
        `<path d="M62 30 C48 30 48 58 62 60 C66 50 66 38 62 30 Z" ${f("#c6cfda")}/>` +
        eye(78, 40) + rope("M12 56 L6 66", "#a9b4c2", 4),
    ),
  },
  snail: {
    name: "Улитка",
    group: "animals",
    svg: svg(
      `<path d="M10 86 C10 76 20 74 30 76 L74 76 C80 62 78 48 82 40 C88 40 92 50 90 62 C88 76 84 86 74 88 Z" ${f("#f2d27a")}/>` +
        rope("M80 42 L74 24", "#f2d27a", 3) + rope("M86 44 L90 26", "#f2d27a", 3) +
        `<circle cx="74" cy="22" r="4" ${f("#f2d27a")}/><circle cx="90" cy="24" r="4" ${f("#f2d27a")}/>` +
        `<circle cx="44" cy="54" r="26" ${f("#e8873a")}/>` +
        `<path d="M44 54 C44 48 52 48 52 54 C52 62 38 62 38 52 C38 40 58 40 58 54 C58 70 30 70 30 52" fill="none" ${O}/>`,
    ),
  },
  giraffe: {
    name: "Жираф",
    group: "animals",
    svg: svg(
      `<path d="M30 70 L30 94 M40 72 L40 94 M58 72 L58 94 M68 70 L68 94" fill="none" stroke="#3b2e25" stroke-width="7" stroke-linecap="round"/>` +
        `<ellipse cx="48" cy="64" rx="24" ry="12" ${f("#f2c14e")}/>` +
        `<path d="M58 58 L66 18 L76 20 L70 60 Z" ${f("#f2c14e")}/>` +
        `<ellipse cx="78" cy="16" rx="13" ry="8" ${f("#f2c14e")}/>` +
        rope("M70 8 L68 2", "#a8743f", 3) + rope("M76 8 L76 2", "#a8743f", 3) +
        `<circle cx="44" cy="62" r="4" fill="#c8862f"/><circle cx="56" cy="66" r="3" fill="#c8862f"/><circle cx="68" cy="40" r="3" fill="#c8862f"/>` +
        eye(80, 14, 2) + rope("M24 62 L16 72", "#f2c14e", 3),
    ),
  },
  duck: {
    name: "Утёнок",
    group: "animals",
    svg: svg(
      `<path d="M12 60 C12 82 40 90 60 86 C80 82 90 70 86 56 C76 62 62 62 56 56 C46 48 26 48 12 60 Z" ${f("#ffd84a")}/>` +
        `<circle cx="66" cy="34" r="16" ${f("#ffd84a")}/>` +
        `<path d="M80 34 L96 38 L80 44 Z" ${f("#f39a3d")}/>` +
        eye(70, 30) + `<path d="M30 66 C40 74 54 72 58 64" fill="none" ${O}/>`,
    ),
  },
  hen: {
    name: "Курочка",
    group: "animals",
    svg: svg(
      `<path d="M14 40 L26 30 L24 46 L34 38 L30 54 Z" ${f("#f39a3d")}/>` +
        `<path d="M24 50 C24 76 40 86 56 86 C74 86 84 72 80 52 L72 30 C66 24 56 26 54 34 C52 46 44 50 24 50 Z" ${f("#fff")}/>` +
        `<path d="M58 26 C58 16 64 14 66 20 C68 12 76 14 74 24 Z" ${f("#e8463a")}/>` +
        `<path d="M74 34 L86 38 L74 42 Z" ${f("#ffc94a")}/>` +
        eye(68, 34) + `<path d="M48 86 L46 96 M62 86 L64 96" fill="none" ${O}/>`,
    ),
  },
  owl: {
    name: "Сова",
    group: "animals",
    svg: svg(
      `<path d="M24 22 L32 34 L68 34 L76 22 L74 44 C82 64 76 90 50 90 C24 90 18 64 26 44 Z" ${f("#b07a4f")}/>` +
        `<circle cx="38" cy="46" r="10" fill="#fff" ${O}/><circle cx="62" cy="46" r="10" fill="#fff" ${O}/>` +
        eye(38, 46, 4) + eye(62, 46, 4) + `<path d="M46 56 L50 62 L54 56 Z" ${f("#ffc94a")}/>` +
        `<path d="M36 70 C42 76 58 76 64 70" fill="none" ${O}/>` +
        `<path d="M8 94 L92 94" fill="none" stroke="#8b5a2b" stroke-width="8" stroke-linecap="round"/>` +
        `<path d="M40 90 L40 94 M60 90 L60 94" fill="none" ${O}/>`,
    ),
  },
  turtle: {
    name: "Черепаха",
    group: "animals",
    svg: svg(
      `<ellipse cx="84" cy="62" rx="10" ry="8" ${f("#8fd16a")}/>` +
        `<path d="M24 74 L22 86 L32 86 L34 74 M62 74 L64 86 L74 86 L72 74" ${f("#8fd16a")}/>` +
        `<path d="M14 74 C14 44 30 34 48 34 C66 34 80 44 80 74 Z" ${f("#4f9e5a")}/>` +
        `<path d="M30 74 L36 52 L60 52 L66 74 M36 52 L48 40 L60 52" fill="none" ${O}/>` +
        `<path d="M14 74 L4 78" fill="none" ${O}/>` + eye(87, 60, 2),
    ),
  },
  mouse: {
    name: "Мышка",
    group: "animals",
    svg: svg(
      rope("M20 78 C8 74 4 60 12 52", "#f2a0b5", 3) +
        `<path d="M18 80 C18 56 40 44 62 54 C76 60 86 70 92 80 Z" ${f("#c6cfda")}/>` +
        `<circle cx="60" cy="44" r="12" ${f("#c6cfda")}/><circle cx="60" cy="44" r="6" fill="#f7b3c8"/>` +
        eye(80, 66) + `<circle cx="92" cy="78" r="3" fill="#f27aa0"/>`,
    ),
  },
  whale: {
    name: "Кит",
    group: "animals",
    svg: svg(
      rope("M60 30 C58 20 52 14 46 12 M60 30 C62 20 68 14 74 12", "#7cc4ef", 3) +
        `<path d="M8 62 C8 40 30 34 52 36 C74 38 84 50 84 60 L94 46 L96 74 L84 66 C80 80 60 86 40 84 C20 82 8 74 8 62 Z" ${f("#4a7fc1")}/>` +
        `<path d="M14 66 C30 76 56 76 72 68" fill="none" ${O}/>` + eye(26, 54),
    ),
  },
  butterfly: {
    name: "Бабочка",
    group: "animals",
    svg: svg(
      `<path d="M50 46 C40 18 10 14 10 34 C10 50 30 54 50 50 Z" ${f("#f27aa0")}/>` +
        `<path d="M50 46 C60 18 90 14 90 34 C90 50 70 54 50 50 Z" ${f("#f27aa0")}/>` +
        `<path d="M50 52 C34 54 18 66 24 80 C30 90 46 78 50 60 Z" ${f("#9b8cf0")}/>` +
        `<path d="M50 52 C66 54 82 66 76 80 C70 90 54 78 50 60 Z" ${f("#9b8cf0")}/>` +
        `<ellipse cx="50" cy="54" rx="5" ry="22" ${f("#3b2e25")}/>` +
        `<path d="M48 34 C44 24 40 20 36 18 M52 34 C56 24 60 20 64 18" fill="none" ${O}/>`,
    ),
  },
  frog: {
    name: "Лягушка",
    group: "animals",
    svg: svg(
      `<circle cx="32" cy="32" r="12" ${f("#8fd16a")}/><circle cx="68" cy="32" r="12" ${f("#8fd16a")}/>` +
        `<path d="M10 72 C10 46 30 38 50 38 C70 38 90 46 90 72 C90 84 74 88 50 88 C26 88 10 84 10 72 Z" ${f("#8fd16a")}/>` +
        `<path d="M6 88 C14 80 22 82 26 88 M94 88 C86 80 78 82 74 88" ${f("#6fbf4a")}/>` +
        `<circle cx="32" cy="30" r="5" fill="#fff"/><circle cx="68" cy="30" r="5" fill="#fff"/>` +
        eye(32, 31) + eye(68, 31) + `<path d="M34 60 C42 68 58 68 66 60" fill="none" ${O}/>`,
    ),
  },
  // ---------------------------------------------------------------- toys
  teddy: {
    name: "Мишка-игрушка",
    group: "toys",
    svg: svg(
      `<circle cx="32" cy="16" r="9" ${f("#c8862f")}/><circle cx="68" cy="16" r="9" ${f("#c8862f")}/>` +
        `<circle cx="20" cy="56" r="9" ${f("#c8862f")}/><circle cx="80" cy="56" r="9" ${f("#c8862f")}/>` +
        `<circle cx="32" cy="86" r="10" ${f("#c8862f")}/><circle cx="68" cy="86" r="10" ${f("#c8862f")}/>` +
        `<ellipse cx="50" cy="64" rx="24" ry="24" ${f("#c8862f")}/>` +
        `<circle cx="50" cy="30" r="20" ${f("#c8862f")}/>` +
        `<ellipse cx="50" cy="36" rx="8" ry="6" ${f("#ecc790")}/>` + eye(43, 26) + eye(57, 26) +
        `<ellipse cx="50" cy="66" rx="12" ry="12" fill="#ecc790"/>`,
    ),
  },
  pyramid: {
    name: "Пирамидка",
    group: "toys",
    svg: svg(
      `<rect x="47" y="6" width="6" height="80" ${f("#c8862f")}/>` +
        `<ellipse cx="50" cy="80" rx="36" ry="10" ${f("#e8463a")}/>` +
        `<ellipse cx="50" cy="64" rx="28" ry="9" ${f("#f39a3d")}/>` +
        `<ellipse cx="50" cy="49" rx="21" ry="8" ${f("#ffd84a")}/>` +
        `<ellipse cx="50" cy="35" rx="15" ry="7" ${f("#6fbf4a")}/>` +
        `<circle cx="50" cy="18" r="9" ${f("#4aa3df")}/>` +
        `<rect x="30" y="88" width="40" height="7" rx="3" ${f("#c8862f")}/>`,
    ),
  },
  drum: {
    name: "Барабан",
    group: "toys",
    svg: svg(
      rope("M30 34 L8 6", "#ecc790", 4) + rope("M70 34 L92 6", "#ecc790", 4) +
        `<circle cx="8" cy="6" r="5" ${f("#e8463a")}/><circle cx="92" cy="6" r="5" ${f("#e8463a")}/>` +
        `<path d="M14 42 L14 78 C14 92 86 92 86 78 L86 42 Z" ${f("#e8463a")}/>` +
        `<path d="M14 46 L32 84 L50 46 L68 84 L86 46" fill="none" stroke="#fff" stroke-width="3"/>` +
        `<ellipse cx="50" cy="42" rx="36" ry="12" ${f("#fff2c2")}/>`,
    ),
  },
  top: {
    name: "Юла",
    group: "toys",
    svg: svg(
      `<rect x="45" y="4" width="10" height="22" rx="3" ${f("#c8862f")}/>` +
        `<path d="M10 46 C10 34 30 24 50 24 C70 24 90 34 90 46 L54 92 L46 92 Z" ${f("#9b8cf0")}/>` +
        `<path d="M10 46 C30 56 70 56 90 46" fill="none" ${O}/>` +
        `<path d="M22 62 C38 68 62 68 78 62" fill="none" stroke="#ffd84a" stroke-width="6"/>`,
    ),
  },
  robot: {
    name: "Робот",
    group: "toys",
    svg: svg(
      rope("M50 18 L50 8", "#a9b4c2", 3) + `<circle cx="50" cy="6" r="5" ${f("#e8463a")}/>` +
        `<rect x="30" y="18" width="40" height="28" rx="6" ${f("#a9b4c2")}/>` +
        `<circle cx="41" cy="31" r="5" fill="#7cc4ef" ${O}/><circle cx="59" cy="31" r="5" fill="#7cc4ef" ${O}/>` +
        `<rect x="26" y="50" width="48" height="30" rx="6" ${f("#4aa3df")}/>` +
        `<rect x="10" y="52" width="12" height="24" rx="5" ${f("#a9b4c2")}/><rect x="78" y="52" width="12" height="24" rx="5" ${f("#a9b4c2")}/>` +
        `<rect x="32" y="80" width="12" height="14" rx="3" ${f("#a9b4c2")}/><rect x="56" y="80" width="12" height="14" rx="3" ${f("#a9b4c2")}/>` +
        `<circle cx="50" cy="64" r="5" ${f("#ffd84a")}/>`,
    ),
  },
  rattle: {
    name: "Погремушка",
    group: "toys",
    svg: svg(
      rope("M50 52 L50 90", "#f27aa0", 9) +
        `<circle cx="50" cy="92" r="6" ${f("#f27aa0")}/>` +
        `<circle cx="50" cy="30" r="24" ${f("#ffd84a")}/>` +
        `<circle cx="42" cy="24" r="4" fill="#e8463a"/><circle cx="58" cy="26" r="4" fill="#4aa3df"/><circle cx="50" cy="38" r="4" fill="#6fbf4a"/>`,
    ),
  },
  bucket: {
    name: "Ведёрко",
    group: "toys",
    svg: svg(
      `<path d="M30 38 C30 12 70 12 70 38" fill="none" stroke="#3b2e25" stroke-width="4"/>` +
        `<path d="M22 38 L78 38 L70 90 L30 90 Z" ${f("#4aa3df")}/>` +
        `<rect x="18" y="32" width="64" height="10" rx="4" ${f("#7cc4ef")}/>` +
        rope("M84 92 L94 50", "#e8463a", 4) + `<path d="M88 52 L98 50 L96 30 L88 34 Z" ${f("#e8463a")}/>`,
    ),
  },
  matryoshka: {
    name: "Матрёшка",
    group: "toys",
    svg: svg(
      `<path d="M50 42 C20 42 18 70 22 92 L78 92 C82 70 80 42 50 42 Z" ${f("#e8463a")}/>` +
        `<circle cx="50" cy="30" r="22" ${f("#e8463a")}/>` +
        `<circle cx="50" cy="32" r="14" fill="#fde3c8" ${O}/>` +
        eye(45, 30, 2) + eye(55, 30, 2) + `<circle cx="42" cy="37" r="2.5" fill="#f27aa0"/><circle cx="58" cy="37" r="2.5" fill="#f27aa0"/>` +
        `<circle cx="50" cy="68" r="11" ${f("#ffd84a")}/>`,
    ),
  },
  // ---------------------------------------------------------------- food
  icecream: { name: "Мороженое", group: "food", svg: iceCream(1) },
  icecream2: { name: "Мороженое с двумя шариками", group: "food", svg: iceCream(2) },
  cake3: { name: "Торт с тремя свечками", group: "food", svg: cake(3) },
  cake1: { name: "Торт с одной свечкой", group: "food", svg: cake(1) },
  cheese: {
    name: "Сыр",
    group: "food",
    svg: svg(
      `<path d="M8 76 L8 48 L80 22 L92 48 L92 76 Z" ${f("#ffd84a")}/>` + `<path d="M8 48 L92 48" fill="none" ${O}/>` +
        `<circle cx="30" cy="62" r="6" fill="#f2b730"/><circle cx="62" cy="66" r="5" fill="#f2b730"/><circle cx="78" cy="58" r="3" fill="#f2b730"/>`,
    ),
  },
  pizza: {
    name: "Кусочек пиццы",
    group: "food",
    svg: svg(
      `<path d="M14 20 C38 8 62 8 86 20 L50 94 Z" ${f("#ffd84a")}/>` +
        `<path d="M10 18 C38 4 62 4 90 18 L86 26 C62 14 38 14 14 26 Z" ${f("#d9a066")}/>` +
        `<circle cx="40" cy="36" r="6" fill="#e8463a" ${O}/><circle cx="60" cy="40" r="6" fill="#e8463a" ${O}/><circle cx="50" cy="60" r="5" fill="#e8463a" ${O}/>`,
    ),
  },
  watermelon: {
    name: "Арбуз",
    group: "food",
    svg: svg(
      `<path d="M6 36 L94 36 C94 64 74 86 50 86 C26 86 6 64 6 36 Z" ${f("#4f9e5a")}/>` +
        `<path d="M14 36 L86 36 C86 58 70 76 50 76 C30 76 14 58 14 36 Z" fill="#f2645a"/>` +
        `<path d="M6 36 L94 36" fill="none" ${O}/>` +
        `<ellipse cx="36" cy="50" rx="2.5" ry="4" fill="#3b2e25"/><ellipse cx="50" cy="58" rx="2.5" ry="4" fill="#3b2e25"/><ellipse cx="64" cy="50" rx="2.5" ry="4" fill="#3b2e25"/>`,
    ),
  },
  grapes: {
    name: "Виноград",
    group: "food",
    svg: svg(
      rope("M50 24 L52 8", "#8b5a2b", 3) + `<path d="M52 14 C62 4 78 6 82 12 C72 20 60 20 52 14 Z" ${f("#6fbf4a")}/>` +
        [[36, 32], [52, 30], [68, 32], [28, 48], [44, 46], [60, 46], [76, 48], [36, 62], [52, 62], [68, 62], [44, 76], [60, 76], [52, 89]]
          .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" ${f("#9b6cc8")}/>`)
          .join(""),
    ),
  },
  strawberry: {
    name: "Клубника",
    group: "food",
    svg: svg(
      `<path d="M50 26 C26 20 12 36 18 54 C24 72 40 90 50 92 C60 90 76 72 82 54 C88 36 74 20 50 26 Z" ${f("#e8463a")}/>` +
        `<path d="M30 20 L40 28 L50 14 L60 28 L70 20 L66 32 L34 32 Z" ${f("#6fbf4a")}/>` +
        [[34, 46], [50, 44], [66, 46], [40, 62], [58, 62], [50, 78]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2" ry="3" fill="#ffd84a"/>`).join(""),
    ),
  },
  egg: {
    name: "Яйцо в подставке",
    group: "food",
    svg: svg(
      `<path d="M50 8 C30 8 22 40 24 56 C26 70 38 76 50 76 C62 76 74 70 76 56 C78 40 70 8 50 8 Z" ${f("#fff6e2")}/>` +
        `<path d="M26 56 L74 56 L66 80 L76 92 L24 92 L34 80 Z" ${f("#4aa3df")}/>`,
    ),
  },
  lollipop: {
    name: "Леденец",
    group: "food",
    svg: svg(
      rope("M50 56 L50 96", "#fff", 5) +
        `<circle cx="50" cy="32" r="26" ${f("#f27aa0")}/>` +
        `<path d="M50 32 C50 26 58 26 58 32 C58 42 42 42 42 30 C42 18 66 18 66 32 C66 48 34 48 34 30" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`,
    ),
  },
  candy: {
    name: "Конфета",
    group: "food",
    svg: svg(
      `<path d="M28 50 L6 32 L10 50 L6 68 Z" ${f("#ffd84a")}/><path d="M72 50 L94 32 L90 50 L94 68 Z" ${f("#ffd84a")}/>` +
        `<ellipse cx="50" cy="50" rx="26" ry="18" ${f("#e8463a")}/>` + `<path d="M38 40 L44 60 M52 38 L58 60" fill="none" stroke="#fff" stroke-width="4"/>`,
    ),
  },
  bread: {
    name: "Батон",
    group: "food",
    svg: svg(
      `<path d="M10 64 C10 40 30 30 50 30 C70 30 90 40 90 64 C90 74 80 78 50 78 C20 78 10 74 10 64 Z" ${f("#d9a066")}/>` +
        `<path d="M30 44 L38 56 M46 40 L54 52 M62 42 L70 54" fill="none" ${O}/>`,
    ),
  },
  // ---------------------------------------------------------------- transport
  bus: {
    name: "Автобус",
    group: "transport",
    svg: svg(
      `<rect x="6" y="24" width="88" height="50" rx="10" ${f("#ffc94a")}/>` +
        `<rect x="14" y="32" width="16" height="16" rx="3" fill="#bfe6fb" ${O}/><rect x="36" y="32" width="16" height="16" rx="3" fill="#bfe6fb" ${O}/><rect x="58" y="32" width="16" height="16" rx="3" fill="#bfe6fb" ${O}/>` +
        `<rect x="80" y="32" width="10" height="30" rx="2" fill="#bfe6fb" ${O}/>` +
        `<circle cx="26" cy="76" r="10" ${f("#3b2e25")}/><circle cx="72" cy="76" r="10" ${f("#3b2e25")}/>` +
        `<circle cx="26" cy="76" r="4" fill="#ddd"/><circle cx="72" cy="76" r="4" fill="#ddd"/>`,
    ),
  },
  truck: {
    name: "Грузовик",
    group: "transport",
    svg: svg(
      `<rect x="4" y="22" width="58" height="46" rx="4" ${f("#6fbf4a")}/>` +
        `<path d="M62 36 L82 36 L96 52 L96 68 L62 68 Z" ${f("#e8463a")}/>` +
        `<path d="M68 42 L80 42 L88 52 L68 52 Z" fill="#bfe6fb" ${O}/>` +
        `<circle cx="22" cy="74" r="10" ${f("#3b2e25")}/><circle cx="78" cy="74" r="10" ${f("#3b2e25")}/>` +
        `<circle cx="22" cy="74" r="4" fill="#ddd"/><circle cx="78" cy="74" r="4" fill="#ddd"/>`,
    ),
  },
  plane: {
    name: "Самолёт",
    group: "transport",
    svg: svg(
      `<path d="M46 46 L24 14 L36 14 L66 46 Z" ${f("#7cc4ef")}/>` +
        `<path d="M6 50 C6 40 20 38 30 40 L84 42 C94 42 96 52 88 56 L30 60 C18 62 6 58 6 50 Z" ${f("#f5f5f5")}/>` +
        `<path d="M14 42 L8 22 L18 22 L30 40 Z" ${f("#e8463a")}/>` +
        `<path d="M46 56 L28 84 L40 84 L66 56 Z" ${f("#7cc4ef")}/>` +
        `<circle cx="80" cy="47" r="3" fill="#4aa3df"/><circle cx="70" cy="47" r="3" fill="#4aa3df"/><circle cx="60" cy="47" r="3" fill="#4aa3df"/>`,
    ),
  },
  rocket: {
    name: "Ракета",
    group: "transport",
    svg: svg(
      `<path d="M42 82 C42 92 50 98 50 98 C50 98 58 92 58 82 Z" ${f("#f39a3d")}/>` +
        `<path d="M32 60 L18 82 L36 78 Z" ${f("#e8463a")}/><path d="M68 60 L82 82 L64 78 Z" ${f("#e8463a")}/>` +
        `<path d="M50 4 C66 18 70 40 66 80 L34 80 C30 40 34 18 50 4 Z" ${f("#f5f5f5")}/>` +
        `<circle cx="50" cy="40" r="9" fill="#7cc4ef" ${O}/>`,
    ),
  },
  bicycle: {
    name: "Велосипед",
    group: "transport",
    svg: svg(
      `<circle cx="24" cy="66" r="18" fill="none" stroke="#3b2e25" stroke-width="6"/><circle cx="78" cy="66" r="18" fill="none" stroke="#3b2e25" stroke-width="6"/>` +
        rope("M24 66 L42 40 L70 40 L78 66 M42 40 L52 66 L70 40", "#4aa3df", 4) +
        rope("M38 32 L48 32", "#3b2e25", 4) + rope("M70 40 L66 24 L76 22", "#4aa3df", 4),
    ),
  },
  helicopter: {
    name: "Вертолёт",
    group: "transport",
    svg: svg(
      rope("M10 14 L80 14", "#a9b4c2", 4) + rope("M45 14 L45 26", "#a9b4c2", 4) +
        rope("M30 52 L4 44", "#4aa3df", 6) + `<path d="M2 36 L8 52" fill="none" stroke="#3b2e25" stroke-width="5" stroke-linecap="round"/>` +
        `<path d="M24 52 C24 34 40 26 56 26 C76 26 88 40 88 54 C88 68 74 72 56 72 L36 72 C28 72 24 62 24 52 Z" ${f("#4aa3df")}/>` +
        `<path d="M62 32 C74 34 82 42 82 52 L62 52 Z" fill="#bfe6fb" ${O}/>` +
        rope("M36 72 L36 86 M70 72 L70 86", "#a9b4c2", 3) + rope("M24 88 L82 88", "#a9b4c2", 4),
    ),
  },
  tractor: {
    name: "Трактор",
    group: "transport",
    svg: svg(
      `<path d="M30 30 L56 30 L60 56 L28 56 Z" ${f("#bfe6fb")}/>` +
        `<rect x="22" y="50" width="72" height="20" rx="4" ${f("#6fbf4a")}/>` +
        rope("M80 50 L80 30", "#3b2e25", 4) +
        `<circle cx="34" cy="70" r="22" ${f("#3b2e25")}/><circle cx="34" cy="70" r="9" fill="#ffd84a"/>` +
        `<circle cx="82" cy="78" r="13" ${f("#3b2e25")}/><circle cx="82" cy="78" r="5" fill="#ffd84a"/>`,
    ),
  },
  train: {
    name: "Паровозик",
    group: "transport",
    svg: svg(
      `<path d="M20 12 L36 12 L32 30 L24 30 Z" ${f("#3b2e25")}/>` +
        `<rect x="10" y="30" width="44" height="38" rx="6" ${f("#e8463a")}/>` +
        `<rect x="54" y="16" width="38" height="52" rx="6" ${f("#4aa3df")}/>` +
        `<rect x="62" y="24" width="22" height="18" rx="3" fill="#bfe6fb" ${O}/>` +
        `<path d="M4 82 L10 68 L20 68" fill="none" ${O}/>` +
        `<circle cx="26" cy="76" r="10" ${f("#3b2e25")}/><circle cx="56" cy="76" r="10" ${f("#3b2e25")}/><circle cx="82" cy="76" r="10" ${f("#3b2e25")}/>`,
    ),
  },
  aerostat: {
    name: "Воздушный шар с корзинкой",
    group: "transport",
    svg: svg(
      `<path d="M50 4 C26 4 14 22 14 38 C14 56 34 66 42 74 L58 74 C66 66 86 56 86 38 C86 22 74 4 50 4 Z" ${f("#f39a3d")}/>` +
        `<path d="M50 4 C38 20 38 56 46 74 M50 4 C62 20 62 56 54 74" fill="none" ${O}/>` +
        `<path d="M42 74 L40 82 M58 74 L60 82" fill="none" ${O}/>` +
        `<rect x="36" y="82" width="28" height="14" rx="3" ${f("#a8743f")}/>`,
    ),
  },
  submarine: {
    name: "Подводная лодка",
    group: "transport",
    svg: svg(
      `<rect x="42" y="22" width="18" height="22" rx="4" ${f("#ffd84a")}/>` + rope("M54 22 L54 8 L64 8", "#a9b4c2", 3) +
        `<path d="M8 58 C8 44 24 40 50 40 C76 40 90 46 90 58 C90 70 76 76 50 76 C24 76 8 72 8 58 Z" ${f("#ffd84a")}/>` +
        `<path d="M90 50 L98 42 L98 74 L90 66 Z" ${f("#f39a3d")}/>` +
        `<circle cx="30" cy="58" r="6" fill="#bfe6fb" ${O}/><circle cx="50" cy="58" r="6" fill="#bfe6fb" ${O}/><circle cx="70" cy="58" r="6" fill="#bfe6fb" ${O}/>`,
    ),
  },
  // ---------------------------------------------------------------- home
  key: { name: "Ключик", group: "home", svg: key("two") },
  key2: { name: "Ключик с длинными зубчиками", group: "home", svg: key("three") },
  glass: {
    name: "Стакан",
    group: "home",
    svg: svg(`<path d="M24 14 L76 14 L68 90 L32 90 Z" ${f("#bfe6fb")}/>` + `<path d="M28 44 L72 44 L68 86 L32 86 Z" fill="#7cc4ef"/>`),
  },
  teapot: {
    name: "Чайник",
    group: "home",
    svg: svg(
      `<path d="M72 50 C86 44 90 60 82 70 C78 74 74 74 70 72" fill="none" stroke="#3b2e25" stroke-width="6"/>` +
        `<path d="M28 56 L8 36 L12 32 L32 46 Z" ${f("#f27aa0")}/>` +
        `<path d="M20 64 C20 42 36 32 50 32 C64 32 80 42 80 64 C80 80 68 88 50 88 C32 88 20 80 20 64 Z" ${f("#f27aa0")}/>` +
        `<path d="M34 34 C38 22 62 22 66 34 Z" ${f("#f7b3c8")}/><circle cx="50" cy="20" r="5" ${f("#f7b3c8")}/>` +
        `<circle cx="50" cy="62" r="8" fill="#fff"/>`,
    ),
  },
  chair: {
    name: "Стульчик",
    group: "home",
    svg: svg(
      `<rect x="26" y="6" width="44" height="46" rx="6" ${f("#d9a066")}/>` +
        `<rect x="20" y="50" width="60" height="12" rx="4" ${f("#c8862f")}/>` +
        `<path d="M26 62 L22 94 M74 62 L78 94" fill="none" stroke="#3b2e25" stroke-width="8" stroke-linecap="round"/>` +
        `<path d="M36 18 L60 18 M36 30 L60 30" fill="none" ${O}/>`,
    ),
  },
  lamp: {
    name: "Лампа",
    group: "home",
    svg: svg(
      `<path d="M34 8 L66 8 L80 42 L20 42 Z" ${f("#ffd84a")}/>` +
        `<rect x="45" y="42" width="10" height="40" ${f("#a8743f")}/>` +
        `<path d="M22 94 C22 82 78 82 78 94 Z" ${f("#a8743f")}/>`,
    ),
  },
  spoon: {
    name: "Ложка",
    group: "home",
    svg: svg(rope("M50 44 L50 94", "#c6cfda", 7) + `<ellipse cx="50" cy="26" rx="16" ry="22" ${f("#c6cfda")}/>` + `<ellipse cx="45" cy="20" rx="4" ry="8" fill="#fff" opacity=".7"/>`),
  },
  bell: {
    name: "Колокольчик",
    group: "home",
    svg: svg(
      `<circle cx="50" cy="12" r="6" ${f("#f2b730")}/>` +
        `<path d="M50 16 C30 16 26 34 26 52 C26 66 18 72 12 78 L88 78 C82 72 74 66 74 52 C74 34 70 16 50 16 Z" ${f("#ffd84a")}/>` +
        `<circle cx="50" cy="86" r="8" ${f("#f2b730")}/>`,
    ),
  },
  clock: {
    name: "Будильник",
    group: "home",
    svg: svg(
      `<circle cx="22" cy="20" r="12" ${f("#e8463a")}/><circle cx="78" cy="20" r="12" ${f("#e8463a")}/>` +
        `<path d="M28 82 L18 94 M72 82 L82 94" fill="none" stroke="#3b2e25" stroke-width="6" stroke-linecap="round"/>` +
        `<circle cx="50" cy="54" r="36" ${f("#e8463a")}/><circle cx="50" cy="54" r="28" fill="#fff" ${O}/>` +
        `<path d="M50 54 L50 36 M50 54 L62 60" fill="none" ${O}/>`,
    ),
  },
  mitten: {
    name: "Варежка",
    group: "home",
    svg: svg(
      `<path d="M30 88 L30 30 C30 12 64 8 68 28 L70 50 L80 40 C90 34 96 46 88 54 L72 74 L72 88 Z" ${f("#4aa3df")}/>` +
        `<rect x="26" y="82" width="50" height="14" rx="4" ${f("#fff")}/>` + `<path d="M40 40 L46 46 L52 40 L58 46" fill="none" stroke="#fff" stroke-width="3"/>`,
    ),
  },
  boot: {
    name: "Сапожок",
    group: "home",
    svg: svg(
      `<path d="M30 6 L62 6 L62 58 L86 66 C96 70 96 92 86 92 L26 92 C22 92 22 84 24 78 L30 58 Z" ${f("#e8463a")}/>` +
        `<rect x="26" y="6" width="40" height="12" rx="3" ${f("#fff2c2")}/>` + `<path d="M22 84 L94 84" fill="none" ${O}/>`,
    ),
  },
  hat: {
    name: "Шапка с помпоном",
    group: "home",
    svg: svg(
      `<circle cx="50" cy="14" r="10" ${f("#fff")}/>` +
        `<path d="M14 72 C14 36 30 22 50 22 C70 22 86 36 86 72 Z" ${f("#9b8cf0")}/>` +
        `<rect x="8" y="68" width="84" height="18" rx="8" ${f("#fff")}/>`,
    ),
  },
  // ---------------------------------------------------------------- nature
  fir: { name: "Ёлочка", group: "nature", svg: fir(3) },
  fir2: { name: "Ёлочка поменьше веточек", group: "nature", svg: fir(2) },
  tree: {
    name: "Дерево",
    group: "nature",
    svg: svg(
      `<path d="M42 94 L44 60 L36 50 L44 52 L48 44 L52 52 L64 46 L56 60 L58 94 Z" ${f("#a8743f")}/>` +
        `<path d="M50 6 C34 6 26 18 28 28 C14 30 10 46 18 54 C14 66 30 72 40 64 C46 70 56 70 62 64 C72 72 88 66 84 54 C92 46 86 30 72 28 C74 18 66 6 50 6 Z" ${f("#6fbf4a")}/>`,
    ),
  },
  cactus: {
    name: "Кактус",
    group: "nature",
    svg: svg(
      `<path d="M30 60 C18 60 16 50 16 34 C16 28 26 28 26 34 L26 48 L34 48 Z" ${f("#6fbf4a")}/>` +
        `<path d="M66 50 C80 50 84 40 84 26 C84 20 74 20 74 26 L74 40 L66 40 Z" ${f("#6fbf4a")}/>` +
        `<path d="M36 76 L36 18 C36 6 64 6 64 18 L64 76 Z" ${f("#6fbf4a")}/>` +
        `<path d="M26 74 L74 74 L68 94 L32 94 Z" ${f("#e8873a")}/>` + `<circle cx="50" cy="8" r="5" ${f("#f27aa0")}/>`,
    ),
  },
  moon: {
    name: "Месяц",
    group: "nature",
    svg: svg(`<path d="M60 6 C30 10 14 34 18 58 C22 80 44 96 70 92 C50 84 38 66 40 46 C42 28 50 14 60 6 Z" ${f("#ffd84a")}/>` + eye(32, 52)),
  },
  cloud: {
    name: "Тучка",
    group: "nature",
    svg: svg(
      `<path d="M20 70 C6 70 6 50 20 48 C20 32 40 26 48 38 C56 22 82 26 80 46 C96 46 96 70 80 70 Z" ${f("#e3eef7")}/>` +
        rope("M30 80 L26 92 M50 80 L46 94 M70 80 L66 92", "#4aa3df", 4),
    ),
  },
  snowman: {
    name: "Снеговик",
    group: "nature",
    svg: svg(
      `<circle cx="50" cy="74" r="22" ${f("#fff")}/><circle cx="50" cy="40" r="16" ${f("#fff")}/>` +
        `<rect x="38" y="8" width="24" height="16" ${f("#3b2e25")}/><rect x="32" y="22" width="36" height="5" rx="2" ${f("#3b2e25")}/>` +
        `<path d="M50 42 L66 46 L50 48 Z" ${f("#f39a3d")}/>` + eye(44, 36, 2) + eye(56, 36, 2) +
        rope("M34 60 L12 48", "#a8743f", 3) + rope("M66 60 L88 48", "#a8743f", 3),
    ),
  },
};

/**
 * Pictures with almost the same outline. Used to count «look closely»
 * difficulty and to pick tricky extra shadows.
 */
export const TWINS: ReadonlyArray<readonly [string, string]> = [
  ["cat", "cat2"],
  ["rabbit", "rabbit2"],
  ["bird", "bird2"],
  ["icecream", "icecream2"],
  ["cake3", "cake1"],
  ["key", "key2"],
  ["fir", "fir2"],
  ["cup", "glass"],
  ["car", "truck"],
  ["truck", "bus"],
  ["apple", "pear"],
  ["apple", "cherry"],
  ["ball", "balloon"],
  ["char:mishka", "teddy"],
  ["char:mama", "char:papa"],
  ["char:belka", "char:ryzhik"],
  ["star", "flower"],
  ["sun", "flower"],
];
