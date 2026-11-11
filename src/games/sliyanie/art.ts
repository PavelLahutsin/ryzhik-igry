/**
 * Flat, rounded art for the chain, drawn in code (viewBox 0 0 100 100).
 * The last step uses the real Ryzhik cutout over a little garden.
 */
const SOIL = `<ellipse cx="50" cy="84" rx="34" ry="9" fill="#a8743f"/><ellipse cx="50" cy="81" rx="30" ry="6" fill="#c08a52"/>`;
const OUT = `stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

const leaf = (x: number, y: number, rot: number, s = 1): string =>
  `<path transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" d="M0 0 C 6 -12 20 -14 26 -8 C 20 2 8 6 0 0 Z" fill="#6fbf4a" ${OUT}/>`;

const flowerHead = (x: number, y: number, r: number, petal: string): string => {
  const line = r < 6 ? `stroke="#3b2e25" stroke-width="1.2"` : OUT;
  let out = "";
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    out += `<circle cx="${(x + Math.cos(a) * r).toFixed(1)}" cy="${(y + Math.sin(a) * r).toFixed(1)}" r="${(r * 0.72).toFixed(1)}" fill="${petal}" ${line}/>`;
  }
  return out + `<circle cx="${x}" cy="${y}" r="${(r * 0.62).toFixed(1)}" fill="#ffc94a" ${line}/>`;
};

const crown = (cx: number, cy: number, r: number): string =>
  `<circle cx="${cx - r * 0.55}" cy="${cy + r * 0.15}" r="${r * 0.62}" fill="#5aac3e" ${OUT}/>` +
  `<circle cx="${cx + r * 0.55}" cy="${cy + r * 0.15}" r="${r * 0.62}" fill="#5aac3e" ${OUT}/>` +
  `<circle cx="${cx}" cy="${cy - r * 0.25}" r="${r * 0.72}" fill="#6fbf4a" ${OUT}/>` +
  `<path d="M${cx - r * 0.9} ${cy + r * 0.2} Q ${cx} ${cy + r * 0.75} ${cx + r * 0.9} ${cy + r * 0.2}" fill="#5aac3e"/>`;

const apple = (x: number, y: number): string =>
  `<circle cx="${x}" cy="${y}" r="5.5" fill="#e8463a" stroke="#3b2e25" stroke-width="2"/><circle cx="${x - 1.8}" cy="${y - 2}" r="1.6" fill="#fff" opacity=".7"/>`;

const svg = (body: string): string =>
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

export const CHAIN_ART: string[] = [
  // Семечко
  svg(
    SOIL +
      `<path d="M50 44 C 64 50 66 72 50 78 C 34 72 36 50 50 44 Z" fill="#8a5a2b" ${OUT}/>` +
      `<path d="M50 52 C 56 58 56 68 50 72" fill="none" stroke="#c99a62" stroke-width="3" stroke-linecap="round"/>`,
  ),
  // Росток
  svg(
    SOIL +
      `<path d="M50 80 C 50 66 49 56 50 46" fill="none" stroke="#3f8f2c" stroke-width="5" stroke-linecap="round"/>` +
      leaf(50, 54, -150, 1.05) +
      leaf(50, 50, -30, 1.05),
  ),
  // Цветок
  svg(
    SOIL +
      `<path d="M50 80 L 50 42" stroke="#3f8f2c" stroke-width="5" stroke-linecap="round"/>` +
      leaf(50, 68, -160, 0.95) +
      leaf(50, 62, -25, 0.95) +
      flowerHead(50, 32, 11, "#f58fb4"),
  ),
  // Кустик
  svg(
    SOIL +
      crown(50, 58, 26) +
      flowerHead(36, 54, 4.5, "#f58fb4") +
      flowerHead(60, 46, 4.5, "#ffffff") +
      flowerHead(62, 66, 4.5, "#f58fb4"),
  ),
  // Яблонька
  svg(
    SOIL +
      `<path d="M46 82 L 47 56 L 53 56 L 54 82 Z" fill="#9b6a3c" ${OUT}/>` +
      crown(50, 40, 24),
  ),
  // Яблоня с яблоками
  svg(
    SOIL +
      `<path d="M44 84 L 45 58 L 55 58 L 56 84 Z" fill="#9b6a3c" ${OUT}/>` +
      crown(50, 36, 30) +
      apple(34, 42) +
      apple(52, 28) +
      apple(66, 44) +
      apple(46, 50) +
      apple(62, 22),
  ),
];

/** Garden backdrop behind the Ryzhik picture for the last step. */
export const GARDEN_BACK = svg(
  `<rect width="100" height="100" fill="#cfeefc"/>` +
    `<circle cx="84" cy="16" r="10" fill="#ffd54a"/>` +
    `<path d="M0 70 Q 30 58 60 66 T 100 62 V 100 H 0 Z" fill="#8fd46a"/>` +
    `<g transform="translate(-18 6) scale(.62)">${CHAIN_ART[5]!.replace(/<\/?svg[^>]*>/g, "")}</g>` +
    `<g transform="translate(70 30) scale(.4)">${CHAIN_ART[3]!.replace(/<\/?svg[^>]*>/g, "")}</g>`,
);
