import { DROP_RATIO } from "../../shared/drag";
import { rateBy, STARS, type Score } from "../../shared/stars";
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

const NEUTER: Record<ColorId, string> = {
  red: "красное",
  blue: "синее",
  yellow: "жёлтое",
  green: "зелёное",
  orange: "оранжевое",
  purple: "фиолетовое",
  white: "белое",
  black: "чёрное",
};

/** «красный блок», «чёрное колесо», «жёлтое окошко». */
export function colorThing(color: ColorId, kind: string): string {
  const noun = kind === "wheel" ? "колесо" : kind === "window" ? "окошко" : "блок";
  return `${noun === "блок" ? COLOR_NAME[color] : NEUTER[color]} ${noun}`;
}

export type Found = { index: number; fit: Fit } | null;

/** The middle of a slot (not its edge): a tap here is about this slot, not a neighbour. */
function onSlot(s: Piece, at: { x: number; y: number }): boolean {
  const nx = (at.x - (s.x + s.w / 2)) / (s.w * DROP_RATIO);
  const ny = (at.y - (s.y + s.h / 2)) / (s.h * DROP_RATIO);
  return nx * nx + ny * ny <= 1;
}

/**
 * Where a block dropped at `at` (in plan cells) goes. A tap in the middle of
 * a slot stays on that slot: the right colour snaps, the wrong colour is a
 * gentle mistake, and it never jumps onto a neighbour. A tap on an edge or
 * in a gap still snaps to the nearest fitting place.
 */
export function findSlot(slots: readonly Piece[], filled: readonly boolean[], block: Pick<Piece, "kind" | "w" | "h" | "color" | "n">, at: { x: number; y: number }, reach = 1.2): Found {
  let covered = false;
  let inside: Found = null;
  let insideD = Infinity;
  slots.forEach((s, i) => {
    if (!onSlot(s, at)) return;
    covered = true;
    if (filled[i] || s.fixed) return;
    const f = fits(block, s);
    if (f === "shape") return;
    const d = Math.hypot(s.x + s.w / 2 - at.x, s.y + s.h / 2 - at.y);
    if (d < insideD) {
      inside = { index: i, fit: f };
      insideD = d;
    }
  });
  if (covered) return inside;
  let best: Found = null;
  let bestD = Infinity;
  slots.forEach((s, i) => {
    if (filled[i] || s.fixed) return;
    const d = Math.hypot(s.x + s.w / 2 - at.x, s.y + s.h / 2 - at.y);
    if (d > reach + Math.max(s.w, s.h) / 2) return;
    if (fits(block, s) === "ok" && d < bestD) {
      best = { index: i, fit: "ok" };
      bestD = d;
    }
  });
  return best;
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

export function starsFor(misses: number, hints: number): Score {
  return rateBy(STARS.stroyka, misses, hints);
}

const WORDS = ["", "Один", "Два", "Три", "Четыре", "Пять", "Шесть", "Семь", "Восемь", "Девять", "Десять", "Одиннадцать", "Двенадцать", "Тринадцать", "Четырнадцать", "Пятнадцать"];

export function countWord(n: number): string {
  return WORDS[n] ?? String(n);
}
