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
  scatter(28, 7, (x, y, i) => `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${2 + (i % 3)}" fill="#fff7c9" ${i % 5 === 0 ? `class="dm-twinkle" style="animation-delay:${i * .1}s"` : ""}/>`, 1600, h);

function sky(night: boolean, h: number): string {
  return night
    ? `<defs><linearGradient id="skyN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16214a"/><stop offset="1" stop-color="#3a4c8f"/></linearGradient></defs><rect width="1600" height="${h}" fill="url(#skyN)"/>${starsSky(h * 0.8)}`
    : `<defs><linearGradient id="skyD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd8fb"/><stop offset="1" stop-color="#e3f5ff"/></linearGradient></defs><rect width="1600" height="${h}" fill="url(#skyD)"/>`;
}

const grassTufts = (y0: number, color: string): string =>
  scatter(26, 3, (x, y) => `<path d="M${x.toFixed(0)} ${(y0 + y * 0.18).toFixed(0)} l6 -18 l6 18 l6 -14 l6 14" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`);

// ---------- Backgrounds ----------

export function roomBack(night: boolean): string {
  return svg(
    1600,
    1000,
    `<rect width="1600" height="740" fill="${night ? "#aa8d91" : "#ffe7c4"}"/>` +
      `<defs><pattern id="dm-wall" width="94" height="98" patternUnits="userSpaceOnUse"><path d="M47 26q15 12 0 25q-14 -13 0 -25Zm-5 29q-15 1 -15 -12q12 0 15 12Z" fill="#ca8b65" opacity=".24"/></pattern></defs><rect width="1600" height="700" fill="url(#dm-wall)"/>` +
      plank(505, 485, 320, 19, '#c38d64') +
      [coral, teal, honey].map((c,i) => plank(726+i*24, 434-i*6, 23, 51+i*6, c) + line(`M${731+i*24} 475h12`, cream, 3)).join('') +
      `<rect y="700" width="1600" height="40" fill="#e7b882" ${o3}/>` +
      `<rect y="740" width="1600" height="260" fill="#d39a5e"/>` +
      [0, 1, 2, 3].map((i) => `<path d="M0 ${790 + i * 60} H1600" stroke="#b97e45" stroke-width="4"/>`).join("") +
      [0,1,2,3].map(i => line(`M${165+i%2*255} ${790+i*60}v60m560 -60v60m560 -60v60`, "#b97e45")).join("") +
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
      flecks(night) +
      scatter(13, 51, (x, y, i) => at(Math.round(x), 730 + Math.round(y), .9, line('M0 0l3 -15', '#54865c', 3) +
        [-1, 0, 1].map(j => oval(3+j*5, -16-Math.abs(j)*3, 4, 5, night ? '#a99eac' : i%2 ? '#ffded0' : '#fff2ac')).join('')), 1590, 216) +
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
      (night ? moon(1330, 125) : cloudBank(1040, 100)) +
      [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => fir(80 + i * 190, 260 + (i % 3) * 30, 1.2, far)).join("") +
      `<rect y="600" width="1600" height="400" fill="${mid}"/>` +
      `<path d="M0 640 Q 400 600 800 640 T 1600 630 V1000 H0 Z" fill="${night ? "#356b46" : "#6fbf4a"}"/>` +
      grassTufts(680, night ? "#285a3a" : "#4f9e34") +
      flecks(night) +
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
      (night && open ? plank(78, 197, 32, 26, "#596179") + oval(89, 211, 5, 7, "#ffe191") + oval(101, 211, 4, 7, "#ffe191") : "") +
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
      line("M54 47l-12 57 M86 46l10 58", "#ffe29a", 5) +
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

export function frameArt(): string {
  return svg(
    250,
    180,
    `<rect x="6" y="6" width="238" height="168" rx="12" fill="#c08a52" ${O}/>` +
      plank(21, 21, 208, 138, "#abd9d8") + oval(168, 60, 20, 20, honey) +
      path("M23 113q52 -53 106 -14t97 -10v68H23Z", teal) +
      path("M23 141q70 -45 122 -20t81 -11v47H23Z", "#8ba579") +
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
    `<path d="M212 640 Q 230 530 232 430 Q 195 375 150 330 L 172 312 Q 214 350 250 392 Q 285 345 320 305 L 340 322 Q 302 370 274 430 Q 276 530 304 640 Z" fill="#9b6a3c" ${O}/>` +
      `<circle cx="160" cy="250" r="110" fill="#5aac3e" ${O}/><circle cx="360" cy="240" r="120" fill="#5aac3e" ${O}/><circle cx="260" cy="160" r="130" fill="#6fbf4a" ${O}/>` +
      `<path d="M80 290 Q 260 400 460 290" fill="#5aac3e"/>` +
      line("M248 603q18 -40 9 -66t9 -68 M282 615q-8 -36 1 -52", "#795439", 6) +
      line("M160 174q10 -54 67 -78 M340 185q40 -12 60 17", "#96d777", 9) +
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
    `<path d="M96 620 Q 124 600 126 560 L 132 300 L 188 300 L 194 560 Q 196 600 224 620 Z" fill="#8a5a2b" ${O}/>` + line("M148 470q-6 -30 2 -60 M174 540q6 -24 -2 -44", "#6b4421", 5) +
      `<ellipse cx="160" cy="390" rx="26" ry="36" fill="#3b2e25"/>` +
      (night
        ? `<g class="dm-owl"><ellipse cx="160" cy="392" rx="22" ry="30" fill="#c08a52" ${o3}/><circle cx="150" cy="384" r="8" fill="#fff3b0"/><circle cx="170" cy="384" r="8" fill="#fff3b0"/><circle cx="150" cy="384" r="3.5" fill="${INK}"/><circle cx="170" cy="384" r="3.5" fill="${INK}"/><path d="M156 396 l4 6 l4 -6 Z" fill="#f5a623"/></g>`
        : "") +
      `<circle cx="92" cy="225" r="82" fill="${night ? "#2f6b40" : "#4f9e34"}" ${O}/><circle cx="228" cy="225" r="82" fill="${night ? "#2f6b40" : "#4f9e34"}" ${O}/><circle cx="160" cy="135" r="112" fill="${night ? "#356b46" : "#5aac3e"}" ${O}/>` +
      `<path d="M22 250 Q 160 330 298 250" fill="${night ? "#2f6b40" : "#4f9e34"}"/>`,
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

// Small shapes share a pen, not a bitmap; all coordinates are local to the prop.
const path = (d: string, fill: string): string => `<path d="${d}" fill="${fill}" ${o3}/>`;
const line = (d: string, colour: string, width = 4): string => `<path d="${d}" fill="none" stroke="${colour}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const oval = (x: number, y: number, rx: number, ry: number, fill: string): string => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
const plank = (x: number, y: number, w: number, h: number, fill: string): string => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${fill}" ${o3}/>`;
const honey = "#efbb77", coral = "#e28a75", teal = "#72b6ab", cream = "#fff0c6";
const at = (x: number, y: number, scale: number, body: string): string => `<g transform="translate(${x} ${y}) scale(${scale})">${body}</g>`;
const cloudBank = (x: number, y: number): string => at(x, y, 1,
  `<path d="M0 34q-11 -24 20 -29q12 -40 50 -21q30 -51 76 -17q16 9 19 32q50 -9 57 31q-88 18 -222 4Z" fill="#fff7e9"/><path d="M8 34q105 8 204 -8q-16 20 -103 18T8 34Z" fill="#dee9e3"/>`);
const moon = (x: number, y: number): string => at(x, y, 1, `<path d="M0 -52 A52 52 0 1 0 48 26 A54 54 0 0 1 0 -52Z" fill="#ffedb0"/>`);
const flecks = (night: boolean): string => scatter(18, 41, (x, y, i) => at(Math.round(x), 808 + Math.round(y), 1,
  i % 3 ? oval(0, 0, 11, 5, night ? "#667975" : "#bca990") + oval(-3, -2, 5, 2, night ? "#879695" : cream)
    : line('M0 2q-8 -16 -16 -13 M0 2q6 -20 15 -22', night ? '#526f66' : '#639a58')), 1600, 184);

export function riverBack(night: boolean): string {
  return svg(1600, 1000, sky(night, 1000) + (night ? moon(1270, 140) : cloudBank(1110, 130)) +
    path('M-8 385Q200 160 490 328T1020 300T1610 286V520H-8Z', night ? '#374c60' : '#b8cfa9') +
    path('M-8 440Q280 340 590 415T1200 378T1610 384V530H-8Z', night ? '#365850' : '#85b68c') +
    `<path d="M0 458Q350 405 780 450T1600 408V840H0Z" fill="${night ? '#355b7a' : '#82cbd1'}"/>` +
    // Low grassy banks anchor both ends of the footbridge over the inlet.
    path('M-8 515q100 -22 183 20q45 16 31 46q-76 41 -214 35Z', night ? '#4a6657' : '#a1be82') +
    path('M475 548q6 -30 55 -42q51 -15 90 -82l144 -3q-62 102 -167 143q-100 37 -122 -16Z', night ? '#4a6657' : '#a1be82') +
    scatter(24, 42, (x,y) => at(Math.round(x), 480 + Math.round(y), 1, line('M0 0q24 6 52 -1', night ? '#8096ae' : '#d2f1e7', 5)), 1540, 245) +
    path('M-10 722Q280 742 490 714T1020 738T1610 720V1010H-10Z', night ? '#556c5d' : '#aaca85') +
    grassTufts(760, night ? '#445d4e' : '#88b36f') + flecks(night));
}

export function bookArt(n: number): string {
  const pictures = [path('M70 63l16 -26 15 26Z', teal), oval(84, 49, 12, 12, coral) + line('M85 38l6 -9', '#709c66'), at(84, 51, .29, moon(0, 0))];
  return svg(140, 100, path('M8 26Q38 15 68 31Q99 14 130 24V78Q96 71 68 89Q38 75 8 81Z', coral) +
    path('M14 19Q37 12 68 26Q99 10 125 17V71Q97 65 68 81Q38 65 14 73Z', cream) +
    line('M68 27v49 M24 35q13 -2 27 3 M24 47l26 4 M24 60l16 2', '#bb946c', 3) + pictures[n % 3]);
}

export function chimesArt(): string {
  return svg(140, 140, line('M13 38L70 8l57 30 M30 41v36 M69 41v53 M109 41v24', INK, 3) + plank(12, 35, 116, 10, honey) +
    [teal, coral, honey].map((c, i) => at(30 + i * 39, [72, 88, 61][i]!, 1,
      oval(0, 35, 6, 7, INK) + path('M-17 31Q-11 24 -10 10Q-9 -4 0 -4Q11 -4 11 12Q11 23 18 31Z', c) + line('M-4 5l-2 9', cream, 3))).join(''));
}

export function wheelArt(n: number): string {
  return svg(140, 180, plank(65, 58, 10, 117, honey) + `<g transform="rotate(${n * 30} 70 60)">` + [teal, honey, coral, '#a999c2'].map((c,i) => `<g transform="rotate(${i*90} 70 60)">${path('M70 60L15 44 39 8Z', c)}${line('M39 12l15 29', cream, 3)}</g>`).join('') + '</g>' + oval(70, 60, 8, 8, INK));
}

export function canArt(): string {
  return svg(150, 110, line('M108 51q46 -26 34 9q-6 17 -31 14', INK, 10) + line('M108 51q46 -26 34 9q-6 17 -31 14', honey, 5) +
    path('M49 61L20 39 14 45l34 45Z', teal) + path('M50 43q33 -14 65 0l4 49q-36 20 -76 0Z', teal) + oval(82, 43, 31, 8, '#507d74') + plank(5, 29, 24, 16, honey) + line('M58 55l-2 26', '#bee3cf', 6));
}

export function snailArt(n: number): string {
  return svg(145, 90, oval(71, 78, 62, 7, '#729468') + path('M8 71q25 -10 58 -7l35 -13q0 -25 18 -23q21 4 11 30q-12 25 -60 23Z', honey) +
    line('M111 36l-3 -14 M124 35l8 -17', INK, 3) + oval(108, 21, 3, 3, INK) + oval(132, 17, 3, 3, INK) +
    `<g transform="translate(${n * 3} 0)">${path('M29 65Q17 31 44 17Q76 3 88 37Q98 68 69 71Z', coral)}${line('M40 56q-12 -29 13 -29q23 0 19 23q-3 15 -17 10q-12 -5 -5 -15q5 -5 10 0', '#a55c50')}</g>`);
}

export function fernArt(n: number): string {
  const frond = (angle: number) => `<g transform="rotate(${angle} 74 116)">${line('M74 116q-5 -57 4 -98', '#536f44', 4)}${[0,1,2,3].map(i => at(74, 85-i*17, 1-i*.15,
    path('M0 0q-28 -2 -30 -27q23 1 30 27Zm0 1q24 -2 29 -26q-24 1 -29 26Z', '#89b977'))).join('')}</g>`;
  return svg(150, 125, oval(74, 116, 49, 6, '#638d62') + frond(-28-n*6) + frond(32+n*5) + frond(0));
}

export function bridgeArt(): string {
  const posts = [16, 66, 120, 174, 224];
  return svg(240, 150, posts.map((x,i) => plank(x-4, 45-Math.sin(i*Math.PI/4)*22, 10, 84, honey)).join('') +
    path('M5 65Q120 -4 235 65V75Q120 9 5 75Z', honey) + path('M4 115Q120 58 236 115V136Q120 80 4 136Z', '#bd8558') + line('M10 116Q120 65 230 116', cream, 4) +
    posts.map((x,i) => oval(x, 123-Math.sin(i*Math.PI/4)*27, 3, 3, INK)).join(''));
}

export function boatArt(n: number): string {
  return svg(200, 150, line('M100 106V13', INK, 5) + path('M95 21L31 90Q62 83 95 91Z', cream) +
    path('M106 26Q141 51 157 88l-51 -3Z', [coral, teal, honey][n % 3]!) + path('M8 99Q95 116 191 92Q174 133 146 137H54Q30 134 8 99Z', honey) + line('M38 117q62 14 125 -2', '#a56a48') + line('M30 144q34 4 65 0m21 0q23 3 44 -2', '#d4eee6'));
}

export function ducksArt(n: number): string {
  const duck = path('M12 44q16 11 33 0q-2 -24 16 -24q14 0 15 15l10 4l-11 7q-4 24 -35 24q-23 0 -28 -26Z', honey) +
    path('M72 36l16 4l-15 5Z', coral) + oval(66, 33, 2.8, 2.8, INK) + line('M31 51q8 12 24 2', '#bc824f', 3);
  return svg(210, 94, at(100, -7, 1.18, duck) + Array.from({length: n % 3 + 1}, (_,i) => at(67-i*32, 39+(i%2)*7, .48, duck)).join('') + line('M8 83q49 4 83 -2m20 0q37 4 69 -2', '#d0ece5', 3));
}

export function reedsArt(): string {
  return svg(130, 170, [0,1,2].map(i => `<g transform="rotate(${(i-1)*15} 65 158)">${line(`M65 158V${43+i*9}`, '#697e48', 5)}${plank(57, 14+i*9, 16, 40, '#b08058')}</g>`).join('') + path('M65 160Q29 142 12 83Q51 98 65 160Q83 90 119 76Q105 133 65 160Z', '#88aa68'));
}

export function lilyArt(n: number): string {
  return svg(140, 92, path('M70 70L12 61C-1 28 122 24 132 55C144 86 53 89 25 75Z', teal) +
    [-32,0,32].map(a => `<g transform="rotate(${a*(1+n*.35)} 78 58)">${path('M78 58q-22 -12 0 -43q23 29 0 43Z', '#f3afa8')}</g>`).join('') + oval(78, 57, 9, 5, honey));
}

export function nurseryBack(night: boolean): string {
  const pane = night ? '#33446d' : '#b6e3e4';
  return svg(1600, 1000, `<rect width="1600" height="735" fill="${night ? '#777388' : '#f7d9bb'}"/>` +
    `<defs><pattern id="dm-quilt" width="110" height="110" patternUnits="userSpaceOnUse"><path d="M55 22l8 11 -8 11 -8 -11Z" fill="#fff0d9" opacity=".32"/></pattern></defs><rect width="1600" height="720" fill="url(#dm-quilt)"/>` +
    plank(550, 98, 358, 246, honey) + plank(568, 116, 322, 205, pane) + (night ? moon(785, 193) + oval(633, 177, 5, 5, cream) : oval(790, 186, 41, 41, '#ffda91')) +
    path('M570 271q83 -61 162 -12t155 -30v89H570Z', night ? '#4e6267' : '#99c293') + line('M726 118v199 M568 224h320', honey, 12) + plank(532, 325, 395, 19, honey) + plank(948, 516, 236, 19, honey) +
    `<rect y="734" width="1600" height="266" fill="${night ? '#987d77' : '#dfb58f'}"/>` + plank(-5, 706, 1610, 28, honey) +
    line('M0 796h1600 M0 888h1600 M0 977h1600 M275 735v61 M930 796v92 M570 888v89', night ? '#806a65' : '#c39873', 4) +
    oval(840, 872, 545, 95, night ? '#727a7f' : '#9bc5bd') + `<ellipse cx="840" cy="872" rx="512" ry="77" fill="none" stroke="#e2ece0" stroke-width="6" stroke-dasharray="20 12"/>`);
}

export function tentArt(on: boolean): string {
  return svg(240, 210, oval(120, 194, 116, 13, '#ae9481') + line('M12 191L125 9 M231 193L113 8', '#956748', 8) +
    path('M13 186L118 20l112 169q-68 16 -117 3q-53 7 -100 -6Z', '#f2c285') + path('M112 58l53 134q-51 -9 -86 -1Z', '#97685e') +
    path(on ? 'M112 58L83 192l-49 -2q58 -43 78 -132Z' : 'M112 58l44 134q-46 -4 -82 0Z', coral) +
    line('M34 161l65 -105 M144 72l57 95', cream, 5) + oval(120, 22, 8, 6, teal));
}

export function rockerArt(): string {
  return svg(210, 160, path('M18 126Q105 165 193 120l6 9q-94 52 -185 9Z', honey) +
    line('M62 136l14 -40 M152 135l-15 -39', '#936f54', 10) + path('M38 76q25 6 61 0l21 -49l14 8l11 -22l8 23l28 22q9 9 -2 21l-23 -7q-5 26 -20 38H64q-25 -1 -26 -34Z', honey) +
    path('M41 78q-24 -20 -30 12q17 -12 29 6Z', '#ba7b60') + path('M65 77h43l-6 19H74Z', teal) + oval(151, 48, 4, 4, INK) + line('M124 40l-13 27', coral, 6));
}

export function blocksArt(n: number): string {
  const block = (x: number,y: number,c: string) => plank(x,y,44,41,c) + line(`M${x+7} ${y+29}v-21h29`, cream, 3);
  return svg(160, 145, oval(80,136,73,7,'#aa9984') + block(9,92,teal) + block(54,92,honey) + block(99,92,coral) +
    (n > 0 ? block(34,50,coral) + block(80,50,teal) : '') + (n > 1 ? path('M52 48l26 -37l26 37Z', honey) : ''));
}

export function drumArt(): string {
  return svg(150, 125, path('M16 48q57 18 118 0v52q-58 27 -118 0Z', coral) + line('M18 56l15 43l19 -35l19 42l23 -41l16 33l21 -42', cream, 4) +
    `<ellipse cx="75" cy="48" rx="60" ry="18" fill="${cream}" ${o3}/>` + line('M11 9l58 33 M140 8L87 40', '#916f55', 6) + oval(68,41,7,6,honey) + oval(87,40,7,6,honey));
}

export function nightlightArt(on: boolean): string {
  return svg(160, 150, (on ? oval(80,71,75,65,'#fff0ad') : '') + plank(37,117,86,18,honey) +
    path('M80 16l17 35l38 7l-27 28l5 38l-33 -17l-34 17l6 -38l-28 -28l39 -7Z', on ? '#ffdd78' : '#d6b2a3') +
    line('M60 75q5 5 10 0m20 0q5 5 10 0 M74 89q6 6 13 0', INK, 3));
}

export function shoalArt(n: number): string {
  const fish = (colour: string) => path('M17 27L2 15v24Z', coral) + path('M16 27q16 -24 43 -1q-18 23 -43 1Z', colour) + oval(49,25,2,2,INK);
  return svg(160, 96, at(60, 30, 1.4, fish(honey)) + at(10, 37, .8, fish(teal)) +
    (n > 0 ? at(28, 0, .76, fish(coral)) : '') + (n > 1 ? at(0, 66, .56, fish(honey)) : ''));
}
