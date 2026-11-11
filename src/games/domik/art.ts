/**
 * «Домик Рыжика»: all scenery drawn in code. Scenes are 1600 × 1000 world
 * units; each prop has its own small viewBox. Thick brown outline and flat
 * colours, like the rest of the app.
 */
const INK = "#3b2e25";
export const O = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
const o3 = `stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"`;

export const svg = (w: number, h: number, body: string): string =>
  `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">${body}</svg>`;

/** Deterministic little scatter (stars, grass) without Math.random in art. */
function scatter(n: number, seed: number, fn: (x: number, y: number, i: number) => string, w = 1600, h = 1000): string {
  let s = seed;
  const r = (): number => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  let out = "";
  for (let i = 0; i < n; i++) out += fn(r() * w, r() * h, i);
  return out;
}

const starsSky = (h: number): string =>
  scatter(40, 7, (x, y, i) => `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${2 + (i % 3)}" fill="#fff7c9" class="dm-twinkle" style="animation-delay:${(i % 7) * 0.4}s"/>`, 1600, h);

function sky(night: boolean, h: number): string {
  return night
    ? `<defs><linearGradient id="skyN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16214a"/><stop offset="1" stop-color="#3a4c8f"/></linearGradient></defs><rect width="1600" height="${h}" fill="url(#skyN)"/>${starsSky(h * 0.8)}`
    : `<defs><linearGradient id="skyD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd8fb"/><stop offset="1" stop-color="#e3f5ff"/></linearGradient></defs><rect width="1600" height="${h}" fill="url(#skyD)"/>`;
}

const grassTufts = (y0: number, color: string): string =>
  scatter(26, 3, (x, y) => `<path d="M${x.toFixed(0)} ${(y0 + y * 0.18).toFixed(0)} l6 -18 l6 18 l6 -14 l6 14" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`);

// ---------- Backgrounds ----------

export function roomBack(): string {
  return svg(
    1600,
    1000,
    `<rect width="1600" height="740" fill="#ffe7c4"/>` +
      scatter(60, 11, (x, y) => `<circle cx="${x.toFixed(0)}" cy="${(y * 0.7).toFixed(0)}" r="7" fill="#ffd6a0" opacity=".8"/>`) +
      `<rect y="700" width="1600" height="40" fill="#e7b882" ${o3}/>` +
      `<rect y="740" width="1600" height="260" fill="#d39a5e"/>` +
      [0, 1, 2, 3].map((i) => `<path d="M0 ${790 + i * 60} H1600" stroke="#b97e45" stroke-width="4"/>`).join("") +
      scatter(18, 5, (x, y) => `<path d="M${x.toFixed(0)} ${(760 + y * 0.22).toFixed(0)} v40" stroke="#b97e45" stroke-width="4"/>`) +
      `<ellipse cx="760" cy="880" rx="420" ry="90" fill="#f27aa0" ${O}/>` +
      `<ellipse cx="760" cy="880" rx="330" ry="62" fill="none" stroke="#fff3f7" stroke-width="10" stroke-dasharray="26 18"/>`,
  );
}

export function gardenBack(night: boolean): string {
  return svg(
    1600,
    1000,
    sky(night, 1000) +
      `<path d="M0 620 Q 300 470 640 590 T 1250 560 T 1600 600 V1000 H0 Z" fill="${night ? "#2f6b4a" : "#9fd986"}"/>` +
      `<path d="M0 700 Q 400 640 800 690 T 1600 680 V1000 H0 Z" fill="${night ? "#3d7d4f" : "#7cc46a"}"/>` +
      grassTufts(720, night ? "#2f6b40" : "#5aa64a") +
      `<path d="M700 1000 C 760 880 860 800 980 700 L 1040 700 C 960 800 900 900 900 1000 Z" fill="${night ? "#a88f6f" : "#efd7a8"}"/>` +
      // fence
      [...Array(9)].map((_, i) => `<path d="M${40 + i * 70} 690 v-110 l18 -20 l18 20 v110 Z" fill="${night ? "#c9b49a" : "#fff4e0"}" ${o3}/>`).join("") +
      `<rect x="30" y="610" width="640" height="16" rx="6" fill="${night ? "#c9b49a" : "#fff4e0"}" ${o3}/><rect x="30" y="650" width="640" height="16" rx="6" fill="${night ? "#c9b49a" : "#fff4e0"}" ${o3}/>`,
  );
}

export function forestBack(night: boolean): string {
  const far = night ? "#244a3a" : "#7fbf7a";
  const mid = night ? "#2d5d43" : "#5aa65a";
  const fir = (x: number, y: number, s: number, c: string): string =>
    `<path d="M${x} ${y} l${-60 * s} ${120 * s} h${30 * s} l${-50 * s} ${100 * s} h${40 * s} l${-50 * s} ${100 * s} h${180 * s} l${-50 * s} ${-100 * s} h${40 * s} l${-50 * s} ${-100 * s} h${30 * s} Z" fill="${c}"/>`;
  return svg(
    1600,
    1000,
    sky(night, 1000) +
      [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => fir(80 + i * 190, 260 + (i % 3) * 30, 1.2, far)).join("") +
      `<rect y="600" width="1600" height="400" fill="${mid}"/>` +
      `<path d="M0 640 Q 400 600 800 640 T 1600 630 V1000 H0 Z" fill="${night ? "#356b46" : "#6fbf4a"}"/>` +
      grassTufts(680, night ? "#285a3a" : "#4f9e34") +
      // pond
      `<ellipse cx="1290" cy="860" rx="270" ry="85" fill="${night ? "#2b5f8f" : "#5ab4ec"}" ${O}/>` +
      `<path d="M1120 850 q30 -14 60 0 M1300 890 q30 -14 60 0 M1380 830 q24 -10 48 0" fill="none" stroke="#e3f5ff" stroke-width="5" stroke-linecap="round" opacity=".8"/>` +
      `<ellipse cx="1150" cy="880" rx="40" ry="14" fill="#6fbf4a" ${o3}/>`,
  );
}

// ---------- House props ----------

export function windowArt(open: boolean, night: boolean): string {
  const sk = night
    ? `<rect x="22" y="22" width="256" height="236" fill="#1d2a5a"/><circle cx="200" cy="80" r="30" fill="#fff3b0"/><circle cx="214" cy="70" r="28" fill="#1d2a5a"/><circle cx="70" cy="60" r="4" fill="#fff"/><circle cx="120" cy="120" r="3" fill="#fff"/><circle cx="60" cy="170" r="3" fill="#fff"/>`
    : `<rect x="22" y="22" width="256" height="236" fill="#aee0ff"/><circle cx="210" cy="80" r="32" fill="#ffd54a"/><path d="M50 160 q20 -30 50 -10 q20 -20 46 0 q24 4 10 24 h-100 q-20 0 -6 -14z" fill="#fff"/><path d="M22 220 Q 120 180 278 214 V258 H22 Z" fill="#7cc46a"/>`;
  const curtain = (left: boolean): string =>
    open
      ? left
        ? `<path d="M0 0 H70 C 60 80 50 160 70 290 H0 Z" fill="#6db3d4" ${O}/>`
        : `<path d="M300 0 H230 C 240 80 250 160 230 290 H300 Z" fill="#6db3d4" ${O}/>`
      : left
        ? `<path d="M0 0 H152 C 146 100 146 200 152 290 H0 Z" fill="#6db3d4" ${O}/>`
        : `<path d="M300 0 H148 C 154 100 154 200 148 290 H300 Z" fill="#6db3d4" ${O}/>`;
  return svg(
    300,
    300,
    `<rect x="12" y="12" width="276" height="256" rx="10" fill="#fffcf7" ${O}/>` +
      sk +
      `<path d="M150 22 V258 M22 140 H278" stroke="#fffcf7" stroke-width="12"/>` +
      `<rect x="12" y="12" width="276" height="256" rx="10" fill="none" ${O}/>` +
      `<rect x="0" y="262" width="300" height="24" rx="8" fill="#e7b882" ${O}/>` +
      curtain(true) +
      curtain(false) +
      `<path d="M8 4 H292" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>`,
  );
}

export function lampArt(on: boolean): string {
  return svg(
    140,
    380,
    (on ? `<ellipse cx="70" cy="80" rx="70" ry="60" fill="#fff3b0" opacity=".7"/>` : "") +
      `<path d="M70 120 V350" stroke="${INK}" stroke-width="9"/>` +
      `<ellipse cx="70" cy="356" rx="46" ry="14" fill="#9b6a3c" ${O}/>` +
      `<path d="M28 120 L 46 34 H 94 L 112 120 Z" fill="${on ? "#ffd54a" : "#f5a623"}" ${O}/>` +
      `<path d="M70 120 v40" stroke="${INK}" stroke-width="3"/><circle cx="70" cy="164" r="6" fill="#f27aa0" ${o3}/>`,
  );
}

export function clockArt(): string {
  return svg(
    170,
    200,
    `<path d="M20 70 L 85 10 L 150 70 Z" fill="#e8463a" ${O}/>` +
      `<rect x="25" y="66" width="120" height="120" rx="20" fill="#9b6a3c" ${O}/>` +
      `<circle cx="85" cy="122" r="44" fill="#fffcf7" ${O}/>` +
      [0, 1, 2, 3].map((i) => `<circle cx="${85 + Math.cos((i * Math.PI) / 2) * 34}" cy="${122 + Math.sin((i * Math.PI) / 2) * 34}" r="4" fill="${INK}"/>`).join("") +
      `<g class="dm-hands" style="transform-origin:85px 122px"><path d="M85 122 V92" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M85 122 H108" stroke="${INK}" stroke-width="5" stroke-linecap="round"/></g>` +
      `<circle cx="85" cy="122" r="6" fill="#e8463a"/>`,
  );
}

export function radioArt(): string {
  return svg(
    240,
    250,
    `<rect x="20" y="150" width="200" height="20" rx="8" fill="#e7b882" ${O}/><path d="M40 170 V245 M200 170 V245" ${O}/>` +
      `<path d="M120 46 L 170 8" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><circle cx="172" cy="8" r="6" fill="#e8463a" ${o3}/>` +
      `<rect x="36" y="44" width="168" height="108" rx="24" fill="#3fae6a" ${O}/>` +
      `<circle cx="86" cy="98" r="34" fill="#fff4e0" ${O}/>` +
      [0, 1, 2].map((i) => `<path d="M62 ${84 + i * 14} H110" stroke="#c9a87a" stroke-width="5" stroke-linecap="round"/>`).join("") +
      `<rect x="138" y="70" width="48" height="26" rx="6" fill="#fff4e0" ${o3}/><path d="M150 76 v14" stroke="#e8463a" stroke-width="4"/>` +
      `<circle cx="150" cy="122" r="10" fill="#ffc94a" ${o3}/><circle cx="178" cy="122" r="10" fill="#ffc94a" ${o3}/>`,
  );
}

export function bedArt(): string {
  return svg(
    440,
    280,
    `<rect x="20" y="20" width="70" height="240" rx="16" fill="#9b6a3c" ${O}/>` +
      `<rect x="370" y="110" width="56" height="150" rx="14" fill="#9b6a3c" ${O}/>` +
      `<rect x="40" y="170" width="370" height="70" rx="12" fill="#c08a52" ${O}/>` +
      `<rect x="56" y="140" width="350" height="44" rx="18" fill="#fffcf7" ${O}/>` +
      `<path d="M70 150 C 70 110 160 100 170 140 C 160 160 80 168 70 150 Z" fill="#fffcf7" ${O}/>` +
      `<circle cx="55" cy="55" r="16" fill="#ffc94a" ${o3}/>`,
  );
}

export function blanketArt(): string {
  return svg(
    440,
    160,
    `<path d="M150 20 C 240 6 340 6 420 24 L 420 120 C 330 136 240 136 150 120 Z" fill="#6db3d4" ${O}/>` +
      [0, 1, 2].map((i) => `<path d="M${190 + i * 70} 26 V124" stroke="#fffcf7" stroke-width="10" opacity=".8"/>`).join("") +
      `<path d="M150 20 C 240 6 340 6 420 24 L 420 120 C 330 136 240 136 150 120 Z" fill="none" ${O}/>`,
  );
}

export function toyboxArt(open: boolean): string {
  return svg(
    240,
    210,
    `<rect x="20" y="80" width="200" height="120" rx="14" fill="#ffc94a" ${O}/>` +
      `<path d="M60 120 h40 M140 120 h40 M60 160 h120" stroke="#e8a521" stroke-width="8" stroke-linecap="round"/>` +
      `<circle cx="120" cy="140" r="16" fill="#e8463a" ${o3}/>` +
      (open
        ? `<path d="M22 82 L 40 10 L 236 30 L 218 84 Z" fill="#f5a623" ${O}/>`
        : `<rect x="12" y="62" width="216" height="30" rx="12" fill="#f5a623" ${O}/>`),
  );
}

export function plantArt(stage: number): string {
  const head = [
    `<circle cx="80" cy="70" r="12" fill="#7cc46a" ${o3}/>`,
    `<circle cx="80" cy="64" r="18" fill="#f58fb4" ${o3}/><circle cx="80" cy="64" r="8" fill="#ffc94a"/>`,
    [0, 1, 2, 3, 4].map((i) => `<circle cx="${80 + Math.cos((i * 2 * Math.PI) / 5) * 22}" cy="${56 + Math.sin((i * 2 * Math.PI) / 5) * 22}" r="16" fill="#f58fb4" ${o3}/>`).join("") + `<circle cx="80" cy="56" r="13" fill="#ffc94a" ${o3}/>`,
    [0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${80 + Math.cos((i * Math.PI) / 3) * 30}" cy="${48 + Math.sin((i * Math.PI) / 3) * 30}" r="20" fill="#e8463a" ${o3}/>`).join("") + `<circle cx="80" cy="48" r="17" fill="#ffc94a" ${o3}/>`,
  ][stage % 4]!;
  return svg(
    160,
    240,
    `<path d="M80 200 V${stage === 0 ? 80 : 60}" stroke="#3f8f2c" stroke-width="8" stroke-linecap="round"/>` +
      `<path d="M80 150 C 50 130 30 140 26 156 C 46 166 66 162 80 150 Z" fill="#6fbf4a" ${o3}/><path d="M80 130 C 110 110 130 118 134 134 C 114 144 94 140 80 130 Z" fill="#6fbf4a" ${o3}/>` +
      head +
      `<path d="M36 190 H124 L 112 236 H48 Z" fill="#d9774a" ${O}/><rect x="28" y="180" width="104" height="18" rx="6" fill="#e8925a" ${O}/>`,
  );
}

export function frameArt(href: string): string {
  return svg(
    250,
    180,
    `<rect x="6" y="6" width="238" height="168" rx="12" fill="#c08a52" ${O}/>` +
      `<image href="${href}" x="22" y="22" width="206" height="136" preserveAspectRatio="xMidYMid slice"/>` +
      `<rect x="22" y="22" width="206" height="136" fill="none" stroke="${INK}" stroke-width="3"/>`,
  );
}

// ---------- Garden props ----------

export function sunArt(night: boolean): string {
  if (night)
    return svg(
      200,
      200,
      `<circle cx="100" cy="100" r="60" fill="#fff3b0" ${O}/><circle cx="128" cy="84" r="54" fill="#2a3a78"/>` +
        `<circle cx="76" cy="96" r="5" fill="${INK}"/><path d="M66 120 q12 8 24 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`,
    );
  let rays = "";
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5;
    rays += `<path d="M${100 + Math.cos(a) * 62} ${100 + Math.sin(a) * 62} L${100 + Math.cos(a) * 92} ${100 + Math.sin(a) * 92}" stroke="#f5a623" stroke-width="12" stroke-linecap="round"/>`;
  }
  return svg(
    200,
    200,
    `<g class="dm-rays" style="transform-origin:100px 100px">${rays}</g><circle cx="100" cy="100" r="52" fill="#ffd54a" ${O}/>` +
      `<circle cx="82" cy="94" r="6" fill="${INK}"/><circle cx="118" cy="94" r="6" fill="${INK}"/><path d="M80 116 Q 100 134 120 116" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>` +
      `<circle cx="72" cy="112" r="8" fill="#f58fb4" opacity=".6"/><circle cx="128" cy="112" r="8" fill="#f58fb4" opacity=".6"/>`,
  );
}

export function cloudArt(night: boolean): string {
  return svg(
    300,
    170,
    `<path d="M50 140 C 10 140 10 90 50 86 C 50 40 110 26 136 60 C 160 20 230 30 230 80 C 280 80 286 140 240 140 Z" fill="${night ? "#8e9cc8" : "#ffffff"}" ${O}/>` +
      `<circle cx="120" cy="104" r="5" fill="${INK}"/><circle cx="170" cy="104" r="5" fill="${INK}"/><path d="M134 116 q12 8 24 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`,
  );
}

export function appleTreeArt(apples: number): string {
  const spots = [
    [180, 200],
    [300, 150],
    [380, 240],
    [250, 290],
    [140, 300],
  ];
  return svg(
    520,
    640,
    `<path d="M220 640 L 232 380 C 200 340 180 330 150 330 M232 380 L 300 300 L 292 380 L 300 640 Z" fill="#9b6a3c" ${O}/>` +
      `<circle cx="160" cy="250" r="110" fill="#5aac3e" ${O}/><circle cx="360" cy="240" r="120" fill="#5aac3e" ${O}/><circle cx="260" cy="160" r="130" fill="#6fbf4a" ${O}/>` +
      `<path d="M80 290 Q 260 400 460 290" fill="#5aac3e"/>` +
      spots
        .slice(0, apples)
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="22" fill="#e8463a" ${o3}/><circle cx="${x! - 7}" cy="${y! - 7}" r="6" fill="#fff" opacity=".6"/>`)
        .join(""),
  );
}

export function swingArt(): string {
  return svg(
    300,
    460,
    `<path d="M20 460 L 70 20 L 230 20 L 280 460" fill="none" stroke="#9b6a3c" stroke-width="18" stroke-linecap="round"/>` +
      `<path d="M20 460 L 70 20 L 230 20 L 280 460" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" opacity=".5"/>` +
      `<g class="dm-swing__seat" style="transform-origin:150px 24px"><path d="M100 24 V330 M200 24 V330" stroke="${INK}" stroke-width="5"/><rect x="80" y="326" width="140" height="22" rx="8" fill="#e8463a" ${O}/></g>`,
  );
}

export function flowerbedArt(stage: number): string {
  const flower = (x: number, c: string): string =>
    stage === 0
      ? `<path d="M${x} 110 v-24" stroke="#3f8f2c" stroke-width="6" stroke-linecap="round"/><circle cx="${x}" cy="84" r="6" fill="#7cc46a"/>`
      : `<path d="M${x} 110 V${110 - 30 - stage * 22}" stroke="#3f8f2c" stroke-width="6" stroke-linecap="round"/>` +
        [0, 1, 2, 3, 4].map((i) => `<circle cx="${x + Math.cos((i * 2 * Math.PI) / 5) * (6 + stage * 4)}" cy="${110 - 30 - stage * 22 + Math.sin((i * 2 * Math.PI) / 5) * (6 + stage * 4)}" r="${5 + stage * 4}" fill="${c}" ${o3}/>`).join("") +
        `<circle cx="${x}" cy="${110 - 30 - stage * 22}" r="${4 + stage * 3}" fill="#ffc94a"/>`;
  return svg(
    440,
    200,
    `<g transform="translate(0 60)">` +
      `<ellipse cx="220" cy="118" rx="210" ry="26" fill="#a8743f" ${O}/>` +
      flower(70, "#f58fb4") +
      flower(150, "#ffffff") +
      flower(230, "#9b6cd8") +
      flower(310, "#e8463a") +
      flower(380, "#ffc94a") +
      `</g>`,
  );
}

export function birdhouseArt(bird: boolean): string {
  return svg(
    160,
    380,
    `<path d="M80 150 V380" stroke="#9b6a3c" stroke-width="16"/>` +
      `<rect x="30" y="60" width="100" height="100" rx="8" fill="#6db3d4" ${O}/>` +
      `<path d="M14 70 L 80 10 L 146 70 Z" fill="#e8463a" ${O}/>` +
      `<circle cx="80" cy="104" r="22" fill="${INK}"/>` +
      (bird
        ? `<g><circle cx="80" cy="96" r="20" fill="#ffc94a" ${o3}/><path d="M96 96 l16 4 l-16 6 Z" fill="#f5862b" ${o3}/><circle cx="86" cy="90" r="3.5" fill="${INK}"/></g>`
        : "") +
      `<path d="M60 140 h40" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`,
  );
}

export function butterflyArt(): string {
  return svg(
    120,
    100,
    `<g class="dm-wings"><path d="M60 50 C 30 0 0 20 14 46 C 0 70 30 90 60 56 Z" fill="#f58fb4" ${o3}/><path d="M60 50 C 90 0 120 20 106 46 C 120 70 90 90 60 56 Z" fill="#f58fb4" ${o3}/>` +
      `<circle cx="34" cy="38" r="7" fill="#fff"/><circle cx="86" cy="38" r="7" fill="#fff"/></g>` +
      `<rect x="55" y="30" width="10" height="44" rx="5" fill="${INK}"/><path d="M58 32 l-8 -14 M62 32 l8 -14" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
  );
}

export function carrotsArt(left: number): string {
  return svg(
    280,
    130,
    `<ellipse cx="140" cy="100" rx="134" ry="26" fill="#a8743f" ${O}/>` +
      [40, 100, 160, 220]
        .slice(0, left)
        .map((x) => `<path d="M${x} 92 c -10 -30 -26 -36 -30 -30 M${x} 92 c 0 -36 10 -44 14 -40 M${x} 92 c 12 -30 28 -34 30 -26" fill="none" stroke="#3f8f2c" stroke-width="7" stroke-linecap="round"/><path d="M${x - 14} 92 h28 l-6 14 h-16 Z" fill="#f5862b" ${o3}/>`)
        .join(""),
  );
}

// ---------- Forest props ----------

export function firArt(): string {
  return svg(
    300,
    580,
    `<rect x="130" y="470" width="40" height="110" fill="#9b6a3c" ${O}/>` +
      `<path d="M150 20 L 60 170 H 110 L 30 320 H 90 L 10 480 H 290 L 210 320 H 270 L 190 170 H 240 Z" fill="#3f8f2c" ${O}/>` +
      `<circle cx="120" cy="250" r="10" fill="#9b6a3c"/><circle cx="190" cy="380" r="10" fill="#9b6a3c"/><circle cx="100" cy="420" r="10" fill="#9b6a3c"/>`,
  );
}

export function mushroomsArt(): string {
  const m = (x: number, s: number, c: string): string =>
    `<g transform="translate(${x} ${150 - 100 * s}) scale(${s})"><path d="M38 56 L 36 98 C 36 102 64 102 64 98 L 62 56 Z" fill="#fff4e0" ${o3}/><path d="M6 58 C 6 24 30 8 50 8 C 70 8 94 24 94 58 C 70 64 30 64 6 58 Z" fill="${c}" ${o3}/><circle cx="34" cy="34" r="6" fill="#fff"/><circle cx="62" cy="26" r="5" fill="#fff"/><circle cx="70" cy="44" r="5" fill="#fff"/></g>`;
  return svg(220, 160, m(10, 1.1, "#e8463a") + m(110, 0.8, "#e8463a") + m(150, 0.55, "#c08a52"));
}

export function stumpArt(): string {
  return svg(
    240,
    170,
    `<path d="M30 60 V140 C 30 160 210 160 210 140 V60 Z" fill="#9b6a3c" ${O}/>` +
      `<ellipse cx="120" cy="60" rx="90" ry="26" fill="#e7b882" ${O}/>` +
      `<ellipse cx="120" cy="60" rx="56" ry="15" fill="none" stroke="#c08a52" stroke-width="5"/><ellipse cx="120" cy="60" rx="24" ry="7" fill="none" stroke="#c08a52" stroke-width="5"/>` +
      `<path d="M10 150 C 30 140 40 130 40 120 M230 150 C 210 140 200 130 200 120" fill="none" ${O}/>`,
  );
}

export function frogArt(): string {
  return svg(
    130,
    100,
    `<ellipse cx="65" cy="66" rx="50" ry="30" fill="#6fbf4a" ${O}/>` +
      `<circle cx="42" cy="34" r="16" fill="#6fbf4a" ${O}/><circle cx="88" cy="34" r="16" fill="#6fbf4a" ${O}/>` +
      `<circle cx="42" cy="32" r="8" fill="#fff"/><circle cx="88" cy="32" r="8" fill="#fff"/><circle cx="44" cy="33" r="4" fill="${INK}"/><circle cx="86" cy="33" r="4" fill="${INK}"/>` +
      `<path d="M44 66 Q 65 82 86 66" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>` +
      `<path d="M14 90 q14 -12 30 0 M86 90 q14 -12 30 0" fill="#4f9e34" ${o3}/>`,
  );
}

export function oakArt(night: boolean): string {
  return svg(
    320,
    620,
    `<path d="M120 620 L 130 300 L 190 300 L 200 620 Z" fill="#8a5a2b" ${O}/>` +
      `<ellipse cx="160" cy="390" rx="26" ry="36" fill="#3b2e25"/>` +
      (night
        ? `<g class="dm-owl"><ellipse cx="160" cy="392" rx="22" ry="30" fill="#c08a52" ${o3}/><circle cx="150" cy="384" r="8" fill="#fff3b0"/><circle cx="170" cy="384" r="8" fill="#fff3b0"/><circle cx="150" cy="384" r="3.5" fill="${INK}"/><circle cx="170" cy="384" r="3.5" fill="${INK}"/><path d="M156 396 l4 6 l4 -6 Z" fill="#f5a623"/></g>`
        : "") +
      `<circle cx="80" cy="220" r="90" fill="${night ? "#2f6b40" : "#4f9e34"}" ${O}/><circle cx="240" cy="220" r="90" fill="${night ? "#2f6b40" : "#4f9e34"}" ${O}/><circle cx="160" cy="130" r="120" fill="${night ? "#356b46" : "#5aac3e"}" ${O}/>` +
      `<path d="M10 250 Q 160 340 310 250" fill="${night ? "#2f6b40" : "#4f9e34"}"/>`,
  );
}

export function bushArt(berries: number): string {
  const spots = [
    [70, 70],
    [120, 50],
    [170, 80],
    [100, 110],
    [200, 110],
    [60, 120],
  ];
  return svg(
    260,
    180,
    `<circle cx="80" cy="110" r="66" fill="#3f8f2c" ${O}/><circle cx="180" cy="110" r="66" fill="#3f8f2c" ${O}/><circle cx="130" cy="74" r="66" fill="#5aac3e" ${O}/>` +
      `<path d="M20 150 Q 130 200 240 150 V176 H20 Z" fill="#3f8f2c"/>` +
      spots
        .slice(0, berries)
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="#5b5bd6" ${o3}/><circle cx="${x! + 14}" cy="${y! + 6}" r="11" fill="#5b5bd6" ${o3}/>`)
        .join(""),
  );
}

export function pondSpotArt(): string {
  return svg(300, 120, `<rect width="300" height="120" fill="transparent"/>`);
}

// ---------- Small things that can be carried (food and toys) ----------

export const CONE = svg(
  100,
  100,
  `<path d="M50 10 C 76 18 82 56 50 92 C 18 56 24 18 50 10 Z" fill="#9b6a3c" ${o3}/>` +
    `<path d="M30 36 L 70 36 M 26 52 L 74 52 M 32 68 L 68 68 M50 14 V88" stroke="#6b4423" stroke-width="3.5"/>`,
);

export const BERRIES = svg(
  100,
  100,
  `<path d="M50 20 C 40 10 30 12 26 20" fill="none" stroke="#3f8f2c" stroke-width="5" stroke-linecap="round"/>` +
    `<circle cx="36" cy="52" r="16" fill="#5b5bd6" ${o3}/><circle cx="64" cy="52" r="16" fill="#5b5bd6" ${o3}/><circle cx="50" cy="76" r="16" fill="#5b5bd6" ${o3}/>` +
    `<circle cx="32" cy="46" r="4" fill="#fff" opacity=".7"/><circle cx="60" cy="46" r="4" fill="#fff" opacity=".7"/>`,
);

export const FISH_JUMP = svg(
  120,
  80,
  `<path d="M84 40 L 116 18 L 112 64 Z" fill="#f5a623" ${o3}/><path d="M6 40 C 24 10 66 8 88 40 C 66 72 24 70 6 40 Z" fill="#ffb347" ${o3}/><circle cx="28" cy="36" r="5" fill="${INK}"/>`,
);

// ---------- Particles ----------

export const FX: Record<string, string> = {
  note: svg(40, 50, `<path d="M14 40 V8 L 34 4 V32" fill="none" stroke="#9b6cd8" stroke-width="5" stroke-linecap="round"/><ellipse cx="10" cy="40" rx="9" ry="7" fill="#9b6cd8"/><ellipse cx="30" cy="34" rx="9" ry="7" fill="#9b6cd8"/>`),
  heart: svg(40, 40, `<path d="M20 36 C 4 24 0 14 6 8 C 12 2 20 6 20 12 C 20 6 28 2 34 8 C 40 14 36 24 20 36 Z" fill="#f27aa0" stroke="${INK}" stroke-width="2.5"/>`),
  star: svg(40, 40, `<path d="M20 2 L 25 15 L 38 15 L 27 23 L 31 37 L 20 29 L 9 37 L 13 23 L 2 15 L 15 15 Z" fill="#ffc94a" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`),
  drop: svg(30, 40, `<path d="M15 2 C 22 14 28 20 28 27 C 28 34 22 38 15 38 C 8 38 2 34 2 27 C 2 20 8 14 15 2 Z" fill="#5ab4ec"/>`),
  zzz: svg(40, 40, `<text x="6" y="32" font-family="Comfortaa, sans-serif" font-weight="700" font-size="30" fill="#6db3d4" stroke="#fff" stroke-width="1">z</text>`),
  leaf: svg(40, 40, `<path d="M6 34 C 2 16 16 4 36 4 C 36 24 24 38 6 34 Z" fill="#f5a623" stroke="${INK}" stroke-width="2.5"/>`),
  bubble: svg(40, 40, `<circle cx="20" cy="20" r="15" fill="#e3f5ff" fill-opacity=".6" stroke="#6db3d4" stroke-width="3"/><circle cx="14" cy="14" r="4" fill="#fff"/>`),
  spark: svg(30, 30, `<circle cx="15" cy="15" r="7" fill="#fff59a"/><circle cx="15" cy="15" r="13" fill="#fff59a" opacity=".35"/>`),
};
