import type { Weather } from "./items";

/** Small weather pictures for the banner (viewBox 0 0 120 80). */
const cloud = (x: number, y: number, s: number, fill: string): string =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M10 30 C 0 30 0 14 12 14 C 14 2 32 0 36 10 C 44 4 56 10 52 20 C 62 20 62 30 52 30 Z" fill="${fill}" stroke="#3b2e25" stroke-width="2.2" stroke-linejoin="round"/></g>`;

function rays(cx: number, cy: number): string {
  let out = "";
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    out += `<path d="M${(cx + Math.cos(a) * 20).toFixed(1)} ${(cy + Math.sin(a) * 20).toFixed(1)} L${(cx + Math.cos(a) * 29).toFixed(1)} ${(cy + Math.sin(a) * 29).toFixed(1)}" stroke="#f5a623" stroke-width="5" stroke-linecap="round"/>`;
  }
  return out;
}

export const WEATHER_ART: Record<Weather, string> = {
  sun:
    `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">${rays(60, 40)}` +
    `<circle cx="60" cy="40" r="16" fill="#ffd54a" stroke="#3b2e25" stroke-width="2.2"/>` +
    `<circle cx="55" cy="38" r="2" fill="#3b2e25"/><circle cx="65" cy="38" r="2" fill="#3b2e25"/>` +
    `<path d="M54 45 Q 60 50 66 45" fill="none" stroke="#3b2e25" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  rain:
    `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">${cloud(28, 6, 1.2, "#cdd8e6")}` +
    `<g class="od-drops" fill="#3a8fd4">` +
    [36, 52, 68, 84, 44, 60, 76]
      .map((x, i) => `<path d="M${x} ${50 + (i % 2) * 12} q 3 6 0 8 q -3 -2 0 -8 Z"/>`)
      .join("") +
    `</g></svg>`,
  snow:
    `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">${cloud(28, 4, 1.2, "#eef3f8")}` +
    `<g class="od-flakes" stroke="#6db3d4" stroke-width="2" stroke-linecap="round">` +
    [
      [38, 54],
      [56, 62],
      [74, 52],
      [90, 64],
      [48, 72],
      [82, 74],
    ]
      .map(([x, y]) => `<path d="M${x! - 4} ${y} h8 M${x} ${y! - 4} v8 M${x! - 3} ${y! - 3} l6 6 M${x! + 3} ${y! - 3} l-6 6"/>`)
      .join("") +
    `</g></svg>`,
  wind:
    `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg"><g class="od-gusts" fill="none" stroke="#6db3d4" stroke-width="4" stroke-linecap="round">` +
    `<path d="M14 30 H 70 C 82 30 82 14 72 14 C 66 14 64 20 66 22"/>` +
    `<path d="M24 46 H 92 C 104 46 104 62 94 62 C 88 62 86 56 88 54"/>` +
    `<path d="M10 62 H 50"/></g>` +
    `<path d="M96 22 C 104 16 112 22 106 28 C 102 30 98 28 96 22 Z" fill="#f5a623" stroke="#3b2e25" stroke-width="1.6"/>` +
    `<path d="M18 70 C 24 64 32 70 26 74 C 22 76 18 74 18 70 Z" fill="#6fbf4a" stroke="#3b2e25" stroke-width="1.6"/></svg>`,
};

export const WEATHER_BG: Record<Weather, string> = {
  sun: "linear-gradient(#bfe6ff, #fff4c9)",
  rain: "linear-gradient(#c3cfdc, #e6edf3)",
  snow: "linear-gradient(#dbe9f5, #ffffff)",
  wind: "linear-gradient(#cfeefc, #eaf7e3)",
};
