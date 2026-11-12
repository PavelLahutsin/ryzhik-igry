import { rate, type Score } from "../../shared/stars";
/** Rules for «Размер и форма». Pure functions. */
import type { Gender } from "../../shared/objects";

export type Shape = "circle" | "square" | "triangle" | "star" | "heart" | "rhombus";
export type Size = "big" | "mid" | "small";

export const SHAPE_NAME: Record<Shape, string> = {
  circle: "Круг",
  square: "Квадрат",
  triangle: "Треугольник",
  star: "Звезда",
  heart: "Сердечко",
  rhombus: "Ромб",
};

const SIZE_FORMS: Record<Size, Record<Gender, string>> = {
  big: { m: "Большой", f: "Большая", n: "Большое", pl: "Большие" },
  mid: { m: "Средний", f: "Средняя", n: "Среднее", pl: "Средние" },
  small: { m: "Маленький", f: "Маленькая", n: "Маленькое", pl: "Маленькие" },
};

/** «Кому оно подойдёт?» agreeing with the thing: он / она / оно / они. */
export function whoFits(gender: Gender): string {
  const who = { m: "он", f: "она", n: "оно", pl: "они" }[gender];
  return `Кому ${who} ${gender === "pl" ? "подойдут" : "подойдёт"}?`;
}

/** «Маленькая чашка», «Большое яблоко», «Средние вишенки». */
export function sizedName(size: Size, name: string, gender: Gender): string {
  return `${SIZE_FORMS[size][gender]} ${name.toLowerCase()}`;
}

/** Matching games: does the thing's key fit the target's key? */
export function matches(itemKey: string, targetKey: string | null): "ok" | "wrong" | "none" {
  if (targetKey === null) return "none";
  return itemKey === targetKey ? "ok" : "wrong";
}

/**
 * Pyramid: rings have ranks 1 (smallest) … n (biggest) and go on the pole
 * biggest first. Returns the rank that must come next, or 0 when done.
 */
export function nextRing(onPole: readonly number[], total: number): number {
  return Math.max(0, total - onPole.length);
}

export function canStack(onPole: readonly number[], total: number, rank: number): boolean {
  return rank === nextRing(onPole, total);
}

export function starsFor(misses: number, hints: number, count: number): Score {
  const free = Math.max(1, Math.floor(count / 4));
  return rate(misses, hints, { free, more: Math.max(2, free + 1) });
}

/** SVG path of a shape centred at (cx, cy) fitting a circle of radius r. */
export function shapePath(shape: Shape, cx: number, cy: number, r: number): string {
  const f = (n: number): string => n.toFixed(1);
  switch (shape) {
    case "circle":
      return `M${f(cx - r)} ${f(cy)} a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0 a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0 Z`;
    case "square": {
      const s = r * 0.86;
      return `M${f(cx - s)} ${f(cy - s)} H${f(cx + s)} V${f(cy + s)} H${f(cx - s)} Z`;
    }
    case "triangle":
      return `M${f(cx)} ${f(cy - r)} L${f(cx + r * 0.95)} ${f(cy + r * 0.75)} H${f(cx - r * 0.95)} Z`;
    case "rhombus":
      return `M${f(cx)} ${f(cy - r)} L${f(cx + r * 0.75)} ${f(cy)} L${f(cx)} ${f(cy + r)} L${f(cx - r * 0.75)} ${f(cy)} Z`;
    case "star": {
      let d = "";
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const rr = i % 2 ? r * 0.45 : r;
        d += `${i ? "L" : "M"}${f(cx + rr * Math.cos(a))} ${f(cy + rr * Math.sin(a))} `;
      }
      return `${d}Z`;
    }
    case "heart":
      return `M${f(cx)} ${f(cy + r * 0.85)} C${f(cx - r * 1.3)} ${f(cy)} ${f(cx - r * 0.9)} ${f(cy - r * 1.05)} ${f(cx)} ${f(cy - r * 0.45)} C${f(cx + r * 0.9)} ${f(cy - r * 1.05)} ${f(cx + r * 1.3)} ${f(cy)} ${f(cx)} ${f(cy + r * 0.85)} Z`;
  }
}

type Box = { left: number; top: number; width: number; height: number };

/**
 * Which drop box the finger is over. Family members stand close and their
 * boxes overlap a little, so among the boxes that contain the point the one
 * whose centre is nearest across wins (QA v4: a drop on Mama landed on Papa).
 */
export function pickTarget(p: { x: number; y: number }, boxes: readonly Box[], pad = 0): number {
  let best = -1;
  let bestD = Infinity;
  boxes.forEach((r, i) => {
    if (p.x < r.left - pad || p.x > r.left + r.width + pad || p.y < r.top - pad || p.y > r.top + r.height + pad) return;
    const d = Math.abs(p.x - (r.left + r.width / 2)) + 0.3 * Math.abs(p.y - (r.top + r.height / 2));
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}
