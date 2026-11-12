import { rateBy, STARS, type Score } from "../../shared/stars";
/** Rules for «По точкам»: connect numbered dots 1 → N, then the picture appears. */
export type Pt = { x: number; y: number };

/** How close (picture units, 200 × 200) a finger must come to a dot. */
export const REACH = 17;
/** Dots are never closer than this, so every touch zone stays big enough. */
export const MIN_GAP = 22;

/**
 * Each dot's touch zone: REACH, or less where dots sit close together —
 * half the way to the nearest dot, so two zones never overlap and a touch
 * always means one dot.
 */
export function zones(dots: readonly Pt[]): number[] {
  return dots.map((a, i) => {
    let near = Infinity;
    dots.forEach((b, j) => {
      if (j !== i) near = Math.min(near, Math.hypot(a.x - b.x, a.y - b.y));
    });
    return Math.min(REACH, near / 2);
  });
}
const zoneCache = new WeakMap<readonly Pt[], number[]>();
const zonesOf = (dots: readonly Pt[]): number[] => {
  let z = zoneCache.get(dots);
  if (!z) zoneCache.set(dots, (z = zones(dots)));
  return z;
};

export type DotsState = { next: number; misses: number };

export function startDots(): DotsState {
  return { next: 0, misses: 0 };
}

/**
 * The finger is at `p`. Returns the dot index it connects (the next one in
 * order) or null. `tapped` = a fresh touch, which counts a miss when it lands
 * on a different, not yet joined dot (sliding over other dots does not).
 * That is the only mistake: a tap on empty paper or on a joined dot is not.
 */
export function touch(dots: readonly Pt[], state: DotsState, p: Pt, tapped: boolean): number | null {
  if (state.next >= dots.length) return null;
  const zone = zonesOf(dots);
  const want = dots[state.next]!;
  if (Math.hypot(want.x - p.x, want.y - p.y) <= zone[state.next]!) {
    state.next++;
    return state.next - 1;
  }
  if (tapped) {
    for (let i = state.next + 1; i < dots.length; i++) {
      const d = dots[i]!;
      if (Math.hypot(d.x - p.x, d.y - p.y) <= zone[i]! * 0.8) {
        state.misses++;
        break;
      }
    }
  }
  return null;
}

export function allJoined(dots: readonly Pt[], state: DotsState): boolean {
  return state.next >= dots.length;
}

export function starsFor(misses: number, hints: number): Score {
  return rateBy(STARS.tochki, misses, hints);
}

export function centroid(dots: readonly Pt[]): Pt {
  const n = Math.max(1, dots.length);
  return { x: dots.reduce((s, d) => s + d.x, 0) / n, y: dots.reduce((s, d) => s + d.y, 0) / n };
}

/** Where to put a dot's number: a little outside the shape, away from the middle. */
export function labelAt(dot: Pt, middle: Pt, gap = 13): Pt {
  const dx = dot.x - middle.x;
  const dy = dot.y - middle.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: Math.round(dot.x + (dx / len) * gap), y: Math.round(dot.y + (dy / len) * gap) };
}

/** The smallest distance between any two dots (tests keep it tappable). */
export function closestPair(dots: readonly Pt[]): number {
  let best = Infinity;
  for (let i = 0; i < dots.length; i++)
    for (let j = i + 1; j < dots.length; j++) best = Math.min(best, Math.hypot(dots[i]!.x - dots[j]!.x, dots[i]!.y - dots[j]!.y));
  return best;
}

/** Points on a curve from a function of t ∈ [0, 1), rounded. */
export function curve(n: number, f: (t: number) => Pt): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const p = f(i / n);
    return { x: Math.round(p.x), y: Math.round(p.y) };
  });
}

export const ALPHABET = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";

/** How dots are labelled (see levels.ts `Count`). */
export type CountRule = "up" | "down" | 2 | 5 | 10 | "abc";

/** The label on dot `i` of `n`: 1, 2, 3… / N … 1 / 2, 4, 6… / 5, 10… / А, Б, В… */
export function labelOf(rule: CountRule | undefined, i: number, n: number): string {
  if (rule === "down") return String(n - i);
  if (rule === "abc") return ALPHABET[i] ?? "?";
  if (typeof rule === "number") return String((i + 1) * rule);
  return String(i + 1);
}

/**
 * How hard a picture is: more dots, and a harder way of counting
 * (backwards < by twos < letters < by fives < by tens).
 */
export function difficulty(dots: number, rule: CountRule | undefined): number {
  const extra = rule === "down" ? 3 : rule === 2 ? 5 : rule === "abc" ? 6 : rule === 5 ? 7 : rule === 10 ? 8 : 0;
  return dots + extra;
}

/**
 * Where to put every dot's label: outside the outline (along the vertex's
 * outward normal, so dents get it right too), turned a little if that spot
 * is too close to another dot or label.
 */
export function labelSpots(dots: readonly Pt[], gap = 14): Pt[] {
  const n = dots.length;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const a = dots[i]!;
    const b = dots[(i + 1) % n]!;
    area += a.x * b.y - b.x * a.y;
  }
  const turn = area > 0 ? 1 : -1;
  const out: Pt[] = [];
  const free = (p: Pt, own: number): number => {
    let d = Infinity;
    dots.forEach((q, j) => {
      if (j !== own) d = Math.min(d, Math.hypot(q.x - p.x, q.y - p.y));
    });
    for (const q of out) d = Math.min(d, Math.hypot(q.x - p.x, q.y - p.y) - 5);
    return d;
  };
  dots.forEach((d, i) => {
    const prev = dots[(i - 1 + n) % n]!;
    const next = dots[(i + 1) % n]!;
    // Outward normal of the edge prev → next (screen y grows downwards).
    let nx = (next.y - prev.y) * turn;
    let ny = -(next.x - prev.x) * turn;
    const len = Math.hypot(nx, ny) || 1;
    nx /= len;
    ny /= len;
    const base = Math.atan2(ny, nx);
    let best: Pt = { x: d.x + nx * gap, y: d.y + ny * gap };
    let bestFree = -1;
    for (const k of [0, 1, -1, 2, -2, 3, -3, 4, -4]) {
      const a = base + (k * Math.PI) / 8;
      const p = { x: d.x + Math.cos(a) * gap, y: d.y + Math.sin(a) * gap };
      const f = free(p, i);
      if (f >= 13) {
        best = p;
        bestFree = f;
        break;
      }
      if (f > bestFree) {
        best = p;
        bestFree = f;
      }
    }
    out.push({ x: Math.round(best.x), y: Math.round(best.y) });
  });
  return out;
}
