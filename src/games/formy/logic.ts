/** Rules for «Размер и форма». Pure functions. */

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

export const SIZE_NAME: Record<Size, string> = { big: "Большое", mid: "Среднее", small: "Маленькое" };

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

export function starsFor(misses: number, hints: number, count: number): number {
  const n = misses + hints * 2;
  if (n <= Math.max(1, Math.floor(count / 4))) return 3;
  if (n <= Math.max(3, Math.floor(count / 2))) return 2;
  return 1;
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
