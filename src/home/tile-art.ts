/**
 * Home tile pictures drawn for each game (vector, in the games' own flat
 * style), instead of the same character cutouts on many tiles. A tile shows
 * what you do in the game; characters stay where they belong (Одень Рыжика,
 * scene pictures).
 */
const INK = "#3b2e25";
const S = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
/** Ink outline of a given width. */
const sw = (w: number): string => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const s3 = `stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"`;

/**
 * v13: the tiles are 4:3, so the frame is 4:3 too — the 200×200 scene sits in
 * the middle of a 266.67×200 viewBox, nothing is cropped (ground and tops stay).
 */
export const TILE_VIEWBOX = "-33.33 0 266.67 200";
const svg = (body: string): string => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${TILE_VIEWBOX}">${body}</svg>`;
/** A data URL usable as <img src>. */
export const svgUrl = (markup: string): string => `data:image/svg+xml,${encodeURIComponent(markup)}`;

const ground = (y = 186, rx = 80): string => `<ellipse cx="100" cy="${y}" rx="${rx}" ry="9" fill="${INK}" opacity=".14"/>`;

function star(cx: number, cy: number, r: number): string {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    d += `${i ? "L" : "M"}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)} `;
  }
  return `${d}Z`;
}

export const TILE_ART = {
  /** A pot on the stove with steam, a carrot and a tomato. */
  kuhnya: svg(
    `${ground(184, 86)}` +
      `<path d="M70 52 C62 40 78 34 70 22 M100 48 C92 36 108 30 100 18 M130 52 C122 40 138 34 130 22" fill="none" stroke="#c9b8a6" stroke-width="5" stroke-linecap="round"/>` +
      `<rect x="40" y="148" width="120" height="32" rx="8" fill="#9aa6b2" ${S}/><circle cx="66" cy="164" r="6" fill="#e8463a"/><circle cx="134" cy="164" r="6" fill="#e8463a"/>` +
      `<path d="M50 84 H150 V132 C150 144 140 148 128 148 H72 C60 148 50 144 50 132 Z" fill="#e8463a" ${S}/>` +
      `<rect x="44" y="72" width="112" height="16" rx="8" fill="#ff8a6a" ${S}/><path d="M50 80 H30 M150 80 H170" ${sw(8)}/>` +
      `<path d="M62 100 C70 96 76 104 84 100" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>` +
      `<path d="M14 176 L44 128 C48 122 56 126 54 132 L30 180 Z" fill="#ff8a3d" ${s3}/><path d="M48 124 L44 108 M52 126 L62 112 M46 126 L34 114" stroke="#5fbf4e" stroke-width="5" stroke-linecap="round"/>` +
      `<circle cx="172" cy="166" r="18" fill="#e8463a" ${s3}/><path d="M164 150 L172 156 L180 148 M172 156 V146" fill="none" stroke="#3f9b3a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
  ),
  /** A sheet with a dotted snail being traced: half drawn, a pencil at the end. */
  risovalka: (() => {
    const rays = Array.from({ length: 8 }, (_, i) => {
      const t = (i * Math.PI) / 4;
      const c = Math.cos(t);
      const n = Math.sin(t);
      const done = i < 5;
      return `<path d="M${(100 + 40 * c).toFixed(1)} ${(100 + 40 * n).toFixed(1)} L${(100 + 58 * c).toFixed(1)} ${(100 + 58 * n).toFixed(1)}" stroke="${done ? "#ff8a3d" : "#c9b8a6"}" stroke-width="${done ? 8 : 5}" ${done ? "" : 'stroke-dasharray="2 9"'} stroke-linecap="round"/>`;
    }).join("");
    return svg(
      `${ground(186, 78)}` +
        `<rect x="22" y="22" width="156" height="156" rx="10" fill="#fffdf6" ${S} transform="rotate(-4 100 100)"/>` +
        `<circle cx="100" cy="100" r="28" fill="none" stroke="#c9b8a6" stroke-width="5" stroke-dasharray="2 9" stroke-linecap="round"/>` +
        `<path d="M128 100 A28 28 0 1 1 100 72" fill="#ffe08a" stroke="#ff8a3d" stroke-width="8" stroke-linecap="round"/>` +
        rays +
        `<g transform="rotate(40 100 72)"><rect x="92" y="0" width="16" height="60" rx="3" fill="#9b6cd8" ${s3}/><path d="M92 60 L100 78 L108 60 Z" fill="#f6dfb8" ${s3}/><path d="M97 70 L100 78 L103 70 Z" fill="${INK}"/><rect x="92" y="-6" width="16" height="12" rx="3" fill="#f58fb4" ${s3}/></g>`,
    );
  })(),
  /** Numbered dots joined into a star; the last line still to draw. */
  tochki: (() => {
    const pts: [number, number][] = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 ? 34 : 76;
      pts.push([100 + r * Math.cos(a), 104 + r * Math.sin(a)]);
    }
    const drawn = pts.slice(0, 8).map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
    const dots = pts
      .map(([x, y], i) => {
        const dx = x - 100;
        const dy = y - 104;
        const k = 20 / Math.hypot(dx, dy);
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="${i < 8 ? "#3fae6a" : "#fff"}" ${s3}/><text x="${(x + dx * k).toFixed(1)}" y="${(y + dy * k + 6).toFixed(1)}" font-family="Nunito,Arial,sans-serif" font-weight="900" font-size="17" fill="${INK}" text-anchor="middle">${i + 1}</text>`;
      })
      .join("");
    const last = pts[7]!;
    const next = pts[8]!;
    return svg(
      `<path d="${drawn}" fill="none" stroke="#3fae6a" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>` +
        `<path d="M${last[0].toFixed(1)} ${last[1].toFixed(1)} L${next[0].toFixed(1)} ${next[1].toFixed(1)} L${pts[9]![0].toFixed(1)} ${pts[9]![1].toFixed(1)} L${pts[0]![0].toFixed(1)} ${pts[0]![1].toFixed(1)}" fill="none" stroke="#9cc9a8" stroke-width="5" stroke-dasharray="3 10" stroke-linecap="round"/>` +
        dots,
    );
  })(),
  /** A doctor's bag, a thermometer and a firefighter's helmet. */
  professii: svg(
    `${ground(184, 86)}` +
      `<path d="M66 76 V62 C66 54 72 50 80 50 H104 C112 50 118 54 118 62 V76" fill="none" ${sw(8)}/>` +
      `<rect x="26" y="74" width="132" height="106" rx="16" fill="#ffffff" ${S}/><rect x="26" y="96" width="132" height="10" fill="#e8463a"/>` +
      `<path d="M82 124 H102 V112 H112 V124 H124 V134 H112 V146 H102 V134 H82 Z" transform="translate(-10 4)" fill="#e8463a" ${s3}/>` +
      `<path d="M120 182 C120 150 140 132 166 132 C192 132 196 160 196 182 Z" fill="#ffc94a" ${S}/><path d="M112 182 H200" ${sw(8)}/><path d="M160 134 V176" ${s3}/><rect x="152" y="146" width="16" height="14" rx="3" fill="#e8463a" ${s3}/>` +
      `<g transform="rotate(-30 40 40)"><rect x="34" y="8" width="12" height="56" rx="6" fill="#fff" ${s3}/><rect x="37" y="30" width="6" height="30" rx="3" fill="#e8463a"/><circle cx="40" cy="64" r="9" fill="#e8463a" ${s3}/></g>`,
  ),
  /** A tower of big toy bricks with a roof, one brick on its way. */
  stroyka: (() => {
    const brick = (x: number, y: number, w: number, c: string): string => {
      let studs = "";
      for (let k = 0; k < w / 26; k++) studs += `<rect x="${x + 6 + k * 26}" y="${y - 8}" width="14" height="10" rx="3" fill="${c}" ${s3}/>`;
      return `${studs}<rect x="${x}" y="${y}" width="${w}" height="30" rx="5" fill="${c}" ${S}/>`;
    };
    return svg(
      `${ground(186, 80)}` +
        brick(36, 150, 104, "#e8463a") +
        brick(36, 112, 52, "#ffc94a") +
        brick(88, 112, 52, "#3a8fd4") +
        `<path d="M30 112 L88 62 L146 112 Z" fill="#5fbf4e" ${S}/>` +
        `<rect x="76" y="124" width="22" height="20" rx="3" fill="#bfe3f2" ${s3}/>` +
        `<g transform="rotate(14 160 60)">${brick(140, 44, 52, "#9b6cd8")}</g>` +
        `<path d="M166 98 C170 110 166 122 160 130" fill="none" stroke="#c9b8a6" stroke-width="4" stroke-dasharray="2 9" stroke-linecap="round"/>`,
    );
  })(),
  /** A shape sorter box and a ring pyramid. */
  formy: svg(
    `${ground(186, 86)}` +
      `<rect x="20" y="104" width="104" height="76" rx="8" fill="#ffc94a" ${S}/><path d="M20 104 L40 82 H144 L124 104 Z" fill="#ffe08a" ${S}/><path d="M144 82 V158 L124 180" fill="#e0a91a" ${S}/>` +
      `<circle cx="56" cy="93" r="8" fill="${INK}" opacity=".85"/><path d="M80 87 L88 99 H72 Z" fill="${INK}" opacity=".85"/><rect x="98" y="86" width="14" height="13" fill="${INK}" opacity=".85"/>` +
      `<circle cx="46" cy="58" r="17" fill="#e8463a" ${S}/><path d="M86 30 L106 64 H66 Z" fill="#3a8fd4" ${S}/>` +
      `<rect x="164" y="40" width="10" height="138" rx="5" fill="#c48a4a" ${s3}/>` +
      `<rect x="138" y="150" width="62" height="24" rx="12" fill="#9b6cd8" ${S}/><rect x="144" y="124" width="50" height="24" rx="12" fill="#3a8fd4" ${S}/><rect x="150" y="98" width="38" height="24" rx="12" fill="#5fbf4e" ${S}/><rect x="156" y="72" width="26" height="24" rx="12" fill="#ffc94a" ${S}/>` +
      `<circle cx="169" cy="48" r="10" fill="#e8463a" ${S}/>`,
  ),
  /** A pear and, next to it, a dark shadow of the same pear to find. */
  teni: svg(
    `${ground(184, 88)}` +
      `<path d="M66 70 C52 70 50 90 54 104 C40 120 36 150 52 166 C66 180 92 180 104 164 C116 148 110 118 92 104 C96 90 84 70 66 70 Z" fill="#a6cf4a" ${S}/><path d="M68 72 C68 60 72 52 80 46" fill="none" ${S}/><path d="M74 56 C86 44 100 48 104 54 C94 62 82 62 74 56 Z" fill="#5fbf4e" ${s3}/><ellipse cx="62" cy="126" rx="7" ry="14" fill="#fff" opacity=".5"/>` +
      `<g transform="translate(76 0)"><path d="M66 70 C52 70 50 90 54 104 C40 120 36 150 52 166 C66 180 92 180 104 164 C116 148 110 118 92 104 C96 90 84 70 66 70 Z" fill="#5a4e8c"/><path d="M68 72 C68 60 72 52 80 46" fill="none" stroke="#5a4e8c" stroke-width="5" stroke-linecap="round"/><path d="M74 56 C86 44 100 48 104 54 C94 62 82 62 74 56 Z" fill="#5a4e8c"/></g>` +
      `<path d="M100 30 C116 18 140 20 150 34" fill="none" stroke="#9b8cf0" stroke-width="5" stroke-dasharray="2 10" stroke-linecap="round"/><path d="M144 24 L152 36 L138 38" fill="none" stroke="#9b8cf0" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
  ),
  /** Two baskets: red apples in one, yellow pears going into the other. */
  sortirovka: (() => {
    const basket = (x: number, c: string): string =>
      `<path d="M${x} 118 H${x + 84} L${x + 74} 178 H${x + 10} Z" fill="${c}" ${S}/><path d="M${x + 6} 138 H${x + 78} M${x + 8} 158 H${x + 76}" stroke="${INK}" stroke-width="3" opacity=".35"/><path d="M${x + 12} 118 C${x + 12} 80 ${x + 72} 80 ${x + 72} 118" fill="none" ${S}/>`;
    const apple = (x: number, y: number): string =>
      `<path d="M${x} ${y - 12} C${x - 16} ${y - 20} ${x - 22} ${y} ${x - 14} ${y + 10} C${x - 8} ${y + 18} ${x + 8} ${y + 18} ${x + 14} ${y + 10} C${x + 22} ${y} ${x + 16} ${y - 20} ${x} ${y - 12} Z" fill="#e8463a" ${s3}/><path d="M${x} ${y - 12} L${x + 2} ${y - 20}" ${s3}/>`;
    const lemon = (x: number, y: number): string => `<ellipse cx="${x}" cy="${y}" rx="17" ry="13" fill="#ffd54a" ${s3}/>`;
    return svg(
      `${ground(184, 90)}` +
        apple(36, 112) + apple(62, 108) + basket(8, "#d9944a") +
        lemon(130, 110) + basket(108, "#c48a4a") +
        `<g transform="rotate(-12 170 50)">${lemon(170, 50)}</g><path d="M164 70 C160 82 156 90 150 96" fill="none" stroke="#c9b8a6" stroke-width="4" stroke-dasharray="2 9" stroke-linecap="round"/>`,
    );
  })(),
  /** A small maze with a dotted path to a house. */
  labirint: svg(
    `<rect x="16" y="16" width="168" height="168" rx="18" fill="#e9f6dc" ${S}/>` +
      `<path d="M16 60 H120 M60 100 H184 M16 140 H130" stroke="#5bb381" stroke-width="12" stroke-linecap="round"/>` +
      `<path d="M38 38 H150 V80 H40 V120 H160 V162 H150" fill="none" stroke="#ff8a3d" stroke-width="6" stroke-dasharray="1 12" stroke-linecap="round"/>` +
      `<circle cx="38" cy="38" r="10" fill="#ff8a3d" ${s3}/>` +
      `<path d="M136 176 V156 L154 140 L172 156 V176 Z" fill="#ffd27a" ${s3}/><path d="M130 158 L154 134 L178 158" fill="none" stroke="#e8463a" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><rect x="149" y="162" width="10" height="14" fill="#c48a4a"/>` +
      `<path d="${star(160, 42, 12)}" fill="#ffc94a" ${s3}/>`,
  ),
  /** Clothes for the weather: a sweater on a hanger, a hat, boots and an umbrella. */
  odezhda: svg(
    `${ground(186, 86)}` +
      `<path d="M100 20 C112 20 112 34 100 38 V46" fill="none" ${sw(4)}/><path d="M100 46 L48 66 H152 Z" fill="none" ${sw(5)}/>` +
      `<path d="M74 60 L44 72 L30 112 L50 120 L60 98 V150 H140 V98 L150 120 L170 112 L156 72 L126 60 C120 72 80 72 74 60 Z" fill="#5fbf4e" ${S}/>` +
      `<path d="${star(100, 108, 16)}" fill="#ffc94a" ${s3}/><path d="M60 138 H140" stroke="#3f9b3a" stroke-width="6"/>` +
      `<path d="M22 182 V160 C22 150 30 146 38 148 L42 150 V170 H58 C66 170 68 182 60 182 Z" fill="#e8463a" ${s3}/><path d="M46 182 V160 C46 150 54 146 62 148 L66 150 V170 H82 C90 170 92 182 84 182 Z" fill="#e8463a" ${s3}/>` +
      `<path d="M124 178 C124 150 142 140 160 140 C178 140 194 150 194 178 Z" fill="#3a8fd4" ${S}/><path d="M118 178 H198" ${sw(7)}/><circle cx="160" cy="134" r="9" fill="#fff" ${s3}/>`,
  ),
} as const;
