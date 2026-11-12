import { rate, type Score } from "../../shared/stars";
import { shuffle } from "../../shared/rng";

/** Memory cards: pure state, no DOM. */
export type Memory = {
  deck: string[];
  matched: Set<number>;
  open: number[];
  misses: number;
};

export type FlipResult = "ignored" | "first" | "match" | "miss";

export function deal(faces: readonly string[], pairs: number, rand: () => number = Math.random): Memory {
  // More faces than pairs: a random set, so replays look different.
  const chosen = faces.length > pairs ? shuffle([...faces], rand).slice(0, pairs) : faces.slice(0, pairs);
  if (chosen.length < pairs) throw new Error("Мало картинок для пар");
  return { deck: shuffle([...chosen, ...chosen], rand), matched: new Set(), open: [], misses: 0 };
}

/** Turn card i. A miss stays open until `closeMiss` (the UI waits a moment). */
export function flip(state: Memory, i: number): FlipResult {
  if (i < 0 || i >= state.deck.length) return "ignored";
  if (state.matched.has(i) || state.open.includes(i) || state.open.length >= 2) return "ignored";
  state.open.push(i);
  if (state.open.length === 1) return "first";
  const [a, b] = state.open as [number, number];
  if (state.deck[a] === state.deck[b]) {
    state.matched.add(a);
    state.matched.add(b);
    state.open = [];
    return "match";
  }
  state.misses++;
  return "miss";
}

export function closeMiss(state: Memory): number[] {
  const closed = state.open;
  state.open = [];
  return closed;
}

export function solved(state: Memory): boolean {
  return state.matched.size === state.deck.length;
}

/** Cards the peek hint may show for a moment: closed and not matched. */
export function peekable(state: Memory): number[] {
  if (state.open.length >= 2) return [];
  return state.deck.map((_, i) => i).filter((i) => !state.matched.has(i) && !state.open.includes(i));
}

/** Grid shape for the screen: lie the long side along the long side of the stage. */
export function fitGrid(cols: number, rows: number, landscape: boolean): { cols: number; rows: number } {
  const long = Math.max(cols, rows);
  const short = Math.min(cols, rows);
  return landscape ? { cols: long, rows: short } : { cols: short, rows: long };
}

/** No clock. Stars only look at extra tries, and generously. */
/** Memory: an open pair that does not match is normal, so one per pair is free. */
export function starsFor(misses: number, pairs: number, peeks = 0): Score {
  return rate(misses, peeks, { free: pairs, more: pairs });
}
