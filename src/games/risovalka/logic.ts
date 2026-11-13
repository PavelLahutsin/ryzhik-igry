import { rateBy, STARS, type Score } from "../../shared/stars";
/** Tracing rules for «Обводилка» (id "risovalka"). Pure functions over sampled points. */
export type Pt = { x: number; y: number };

/** Finger thickness around the dotted line, in picture units (200 × 200). */
export const TOLERANCE = 16;
/** How far ahead along the line one finger move may jump (samples). */
export const LOOKAHEAD = 14;

/**
 * Move the traced position forward when the finger is on the line just
 * ahead. Never goes back, so lifting the finger keeps what is drawn.
 */
export function advance(samples: readonly Pt[], index: number, p: Pt, tol = TOLERANCE): number {
  let best = index;
  const end = Math.min(samples.length - 1, index + LOOKAHEAD);
  for (let j = index; j <= end; j++) {
    const s = samples[j]!;
    if (Math.hypot(s.x - p.x, s.y - p.y) <= tol) best = j;
  }
  return best;
}

/** Is the finger far away from the line near the current position (a slip)? */
export function offTrack(samples: readonly Pt[], index: number, p: Pt, tol = TOLERANCE): boolean {
  const from = Math.max(0, index - LOOKAHEAD);
  const to = Math.min(samples.length - 1, index + LOOKAHEAD * 2);
  for (let j = from; j <= to; j++) {
    const s = samples[j]!;
    if (Math.hypot(s.x - p.x, s.y - p.y) <= tol * 2.2) return false;
  }
  return true;
}

export function strokeDone(samples: readonly Pt[], index: number): boolean {
  return index >= samples.length - 2;
}

/** Points every `step` units along a polyline of points (used by tests and as a fallback). */
export function resample(points: readonly Pt[], step = 3): Pt[] {
  if (points.length === 0) return [];
  const out: Pt[] = [points[0]!];
  let carry = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    let d = step - carry;
    while (d <= len) {
      const t = d / len;
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
      d += step;
    }
    carry = len - (d - step);
  }
  const last = points[points.length - 1]!;
  const tail = out[out.length - 1]!;
  if (tail.x !== last.x || tail.y !== last.y) out.push(last);
  return out;
}

/** Slips off the line: a couple are free, the lamp counts as a hint. */
export function starsFor(slips: number, hints: number): Score {
  return rateBy(STARS.risovalka, slips, hints);
}

/** v13: in «Первые рисунки» a slip is only «Попробуй ещё раз» — it never costs a star. */
export function countedSlips(world: string | undefined, slips: number): number {
  return world === "first" ? 0 : slips;
}

const WORDS = ["Ноль", "Один", "Два", "Три", "Четыре", "Пять", "Шесть", "Семь", "Восемь", "Девять"];
export function numberWord(n: number): string {
  return WORDS[n] ?? String(n);
}

/**
 * v14: one line to trace per subpath. A stroke like "M… M…" (both wings of
 * «Сова») used to be one line with a jump in it: after the first part the
 * finger had to leap to the second, which a real finger can't — it was a
 * slip, and the second part could not be drawn. Only absolute "M" splits
 * (a relative "m" depends on where the previous part ended).
 */
export function splitSubpaths(d: string): string[] {
  return d
    .split(/(?=M)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
