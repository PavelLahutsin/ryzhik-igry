import type { ColorId, Piece } from "./logic";

/** Big toy blocks, drawn in code: 100 units per plan cell. */
const INK = "#3b2e25";

export const FILL: Record<ColorId, [string, string]> = {
  red: ["#e8463a", "#b9302a"],
  blue: ["#3a8fd4", "#276aa3"],
  yellow: ["#ffc94a", "#d9a21f"],
  green: ["#5fbf4e", "#3f8f34"],
  orange: ["#ff8a3d", "#d9662a"],
  purple: ["#9b6cd8", "#7149ad"],
  white: ["#f6f4ef", "#cfc8bb"],
  black: ["#3b3b42", "#1f1f24"],
};

const S = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;

function studs(w: number, color: string, top = 8): string {
  let out = "";
  for (let i = 0; i < w * 2; i++) {
    const cx = 25 + i * 50;
    out += `<rect x="${cx - 15}" y="${top - 14}" width="30" height="16" rx="5" fill="${color}" ${S}/>`;
  }
  return out;
}

/** SVG for one block; `ghost` draws the dashed place in the plan instead. */
export function pieceSvg(piece: Pick<Piece, "kind" | "color" | "w" | "h" | "n">, mode: boolean | "plain" = false): string {
  const ghost = mode !== false;
  const W = piece.w * 100;
  const H = piece.h * 100;
  // A plain (grey) place shows only the shape: the colour is on the sample
  // picture or on the built half.
  const [c, d] = mode === "plain" ? ["#8f7a63", "#8f7a63"] : FILL[piece.color];
  const body = ghost ? `fill="${c}" fill-opacity="${mode === "plain" ? ".08" : ".16"}" stroke="${d}" stroke-opacity=".7" stroke-width="5" stroke-dasharray="14 10"` : `fill="${c}" ${S}`;
  let art = "";
  switch (piece.kind) {
    case "brick":
    case "num":
      art = `${ghost ? "" : studs(piece.w, c)}<rect x="4" y="8" width="${W - 8}" height="${H - 12}" rx="12" ${body}/>`;
      if (!ghost) art += `<rect x="16" y="20" width="${W - 32}" height="12" rx="6" fill="#fff" opacity=".35"/>`;
      if (piece.kind === "num")
        art += `<circle cx="${W / 2}" cy="${H / 2 + 4}" r="30" fill="#fff" ${ghost ? 'fill-opacity=".7"' : S}/><text x="${W / 2}" y="${H / 2 + 6}" text-anchor="middle" dominant-baseline="central" font-family="system-ui, sans-serif" font-weight="800" font-size="44" fill="${INK}">${piece.n}</text>`;
      break;
    case "roof":
      art = `<path d="M6 ${H - 6} L${W / 2} 8 L${W - 6} ${H - 6} Z" ${body}/>`;
      if (!ghost) art += `<path d="M${W * 0.3} ${H * 0.7} L${W / 2} ${H * 0.3}" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".35"/>`;
      break;
    case "cone":
      art = `<path d="M6 ${H - 6} C6 ${H * 0.5} ${W * 0.3} ${H * 0.2} ${W / 2} 6 C${W * 0.7} ${H * 0.2} ${W - 6} ${H * 0.5} ${W - 6} ${H - 6} Z" ${body}/>`;
      break;
    case "wheel":
      art = `<circle cx="50" cy="50" r="44" ${body}/>${ghost ? "" : `<circle cx="50" cy="50" r="16" fill="#b0b8c0" ${S}/><path d="M50 14 V30 M50 70 V86 M14 50 H30 M70 50 H86" stroke="#6b6b75" stroke-width="6" stroke-linecap="round"/>`}`;
      break;
    case "window":
      art = `${ghost ? "" : studs(1, "#f6f4ef")}<rect x="4" y="8" width="92" height="88" rx="12" ${ghost ? body : `fill="#f6f4ef" ${S}`}/>${ghost ? "" : `<rect class="sk-glass" x="20" y="24" width="60" height="58" rx="6" fill="#9fd3ea" ${S}/><path d="M50 24 V82 M20 53 H80" stroke="${INK}" stroke-width="4"/>`}`;
      break;
    case "door":
      art = `<path d="M8 ${H - 4} V40 C8 12 92 12 92 40 V${H - 4} Z" ${body}/>${ghost ? "" : `<circle cx="74" cy="${H * 0.6}" r="7" fill="${INK}"/>`}`;
      break;
    case "chimney":
      art = `<path d="M24 96 L30 26 H70 L76 96 Z" ${body}/>${ghost ? "" : `<rect x="18" y="12" width="64" height="18" rx="5" fill="${d}" ${S}/>`}`;
      break;
    case "fin-l":
      art = `<path d="M96 6 V96 H6 C6 60 40 20 96 6 Z" ${body}/>`;
      break;
    case "fin-r":
      art = `<path d="M4 6 V96 H94 C94 60 60 20 4 6 Z" ${body}/>`;
      break;
    case "hull":
      art = `<path d="M4 8 H${W - 4} L${W - 70} ${H - 6} H70 Z" ${body}/>${ghost ? "" : `<path d="M30 30 H${W - 30}" stroke="#fff" stroke-width="10" opacity=".4" stroke-linecap="round"/>`}`;
      break;
    case "loco":
      art = `<rect x="4" y="60" width="${W - 8}" height="${H - 64}" rx="14" ${body}/><rect x="${W - 90}" y="8" width="80" height="70" rx="10" fill="${c}" ${S}/><rect class="sk-glass" x="${W - 74}" y="22" width="48" height="36" rx="6" fill="#9fd3ea" ${S}/><path d="M30 60 L36 10 H70 L76 60 Z" fill="#3b3b42" ${S}/><circle cx="20" cy="${H - 40}" r="14" fill="#ffd54a" ${S}/>`;
      break;
  }
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" overflow="visible">${art}</svg>`;
}
