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
  const chosen = faces.slice(0, pairs);
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

/** No clock. Stars only look at extra tries, and generously. */
export function starsFor(misses: number, pairs: number): number {
  if (misses <= pairs) return 3;
  if (misses <= pairs * 2) return 2;
  return 1;
}
