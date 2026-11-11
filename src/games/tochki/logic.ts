/** Rules for «По точкам»: connect numbered dots 1 → N, then the picture appears. */
export type Pt = { x: number; y: number };

/** How close (picture units, 200 × 200) a finger must come to a dot. */
export const REACH = 17;

export type DotsState = { next: number; misses: number };

export function startDots(): DotsState {
  return { next: 0, misses: 0 };
}

/**
 * The finger is at `p`. Returns the dot index it connects (the next one in
 * order) or null. `tapped` = a fresh touch, which counts a miss when it lands
 * on a different, not yet joined dot (sliding over other dots does not).
 */
export function touch(dots: readonly Pt[], state: DotsState, p: Pt, tapped: boolean): number | null {
  if (state.next >= dots.length) return null;
  const want = dots[state.next]!;
  if (Math.hypot(want.x - p.x, want.y - p.y) <= REACH) {
    state.next++;
    return state.next - 1;
  }
  if (tapped) {
    for (let i = state.next + 1; i < dots.length; i++) {
      const d = dots[i]!;
      if (Math.hypot(d.x - p.x, d.y - p.y) <= REACH * 0.8) {
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

export function starsFor(misses: number, hints: number): number {
  const n = misses + hints * 2;
  if (n <= 1) return 3;
  if (n <= 5) return 2;
  return 1;
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
