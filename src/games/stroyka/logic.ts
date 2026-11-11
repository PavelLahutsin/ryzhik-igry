/** Rules for «Стройка»: big blocks snap into a picture plan. Pure functions. */

export type Kind = "brick" | "roof" | "wheel" | "window" | "door" | "chimney" | "cone" | "fin-l" | "fin-r" | "hull" | "num" | "loco";
export type ColorId = "red" | "blue" | "yellow" | "green" | "orange" | "purple" | "white" | "black";

export type Piece = { kind: Kind; color: ColorId; x: number; y: number; w: number; h: number; n?: number; fixed?: boolean };

export const COLOR_NAME: Record<ColorId, string> = {
  red: "красный",
  blue: "синий",
  yellow: "жёлтый",
  green: "зелёный",
  orange: "оранжевый",
  purple: "фиолетовый",
  white: "белый",
  black: "чёрный",
};

export type Fit = "ok" | "color" | "shape";

/** Does a block (from the tray) fit a place in the plan? */
export function fits(block: Pick<Piece, "kind" | "w" | "h" | "color" | "n">, slot: Piece): Fit {
  if (block.kind !== slot.kind || block.w !== slot.w || block.h !== slot.h || (block.n ?? 0) !== (slot.n ?? 0)) return "shape";
  return block.color === slot.color ? "ok" : "color";
}

export type Found = { index: number; fit: Fit } | null;

/**
 * Where a block dropped at `at` (in plan cells) goes: the nearest empty
 * place within `reach` cells that fits, else the nearest same-shape place
 * (to say «нужен другой цвет»), else null.
 */
export function findSlot(slots: readonly Piece[], filled: readonly boolean[], block: Pick<Piece, "kind" | "w" | "h" | "color" | "n">, at: { x: number; y: number }, reach = 1.2): Found {
  let best: Found = null;
  let bestD = Infinity;
  let near: Found = null;
  let nearD = Infinity;
  slots.forEach((s, i) => {
    if (filled[i] || s.fixed) return;
    const d = Math.hypot(s.x + s.w / 2 - at.x, s.y + s.h / 2 - at.y);
    if (d > reach + Math.max(s.w, s.h) / 2) return;
    const f = fits(block, s);
    if (f === "ok" && d < bestD) {
      best = { index: i, fit: "ok" };
      bestD = d;
    } else if (f === "color" && d < nearD) {
      near = { index: i, fit: "color" };
      nearD = d;
    }
  });
  return best ?? near;
}

export function doneAll(slots: readonly Piece[], filled: readonly boolean[]): boolean {
  return slots.every((s, i) => s.fixed || filled[i]);
}

/** How many pieces a child places on a plan (fixed ones are already there). */
export function toPlace(slots: readonly Piece[]): number {
  return slots.filter((s) => !s.fixed).length;
}

/** Plans must not overlap: every cell belongs to at most one piece. */
export function overlaps(slots: readonly Piece[]): boolean {
  const seen = new Set<string>();
  for (const s of slots)
    for (let x = s.x; x < s.x + s.w; x++)
      for (let y = s.y; y < s.y + s.h; y++) {
        const k = `${x},${y}`;
        if (seen.has(k)) return true;
        seen.add(k);
      }
  return false;
}

export function starsFor(misses: number, hints: number): number {
  const n = misses + hints * 2;
  if (n <= 1) return 3;
  if (n <= 4) return 2;
  return 1;
}

const WORDS = ["", "Один", "Два", "Три", "Четыре", "Пять", "Шесть", "Семь", "Восемь", "Девять", "Десять", "Одиннадцать", "Двенадцать", "Тринадцать", "Четырнадцать", "Пятнадцать"];

export function countWord(n: number): string {
  return WORDS[n] ?? String(n);
}
