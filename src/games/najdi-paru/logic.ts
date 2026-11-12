import { rate, type Score } from "../../shared/stars";
import { shuffle } from "../../shared/rng";

/**
 * Memory cards: pure state, no DOM. `deck` is what each card shows, `group`
 * what it belongs with: the same picture twice (classic), a thing and its
 * shadow, a number and that many things, or three alike (`size` 3).
 */
export type Memory = {
  deck: string[];
  group: string[];
  size: number;
  matched: Set<number>;
  open: number[];
  misses: number;
};

/** "more": right so far, open the next one of the three. */
export type FlipResult = "ignored" | "first" | "more" | "match" | "miss";

export function deal(faces: readonly string[], pairs: number, rand: () => number = Math.random): Memory {
  // More faces than pairs: a random set, so replays look different.
  const chosen = faces.length > pairs ? shuffle([...faces], rand).slice(0, pairs) : faces.slice(0, pairs);
  if (chosen.length < pairs) throw new Error("Мало картинок для пар");
  const deck = shuffle([...chosen, ...chosen], rand);
  return { deck, group: [...deck], size: 2, matched: new Set(), open: [], misses: 0 };
}

/** Deal cards that belong together: every inner list is one group (all the same length). */
export function dealGroups(groups: readonly (readonly string[])[], rand: () => number = Math.random): Memory {
  const size = groups[0]?.length ?? 2;
  if (groups.some((g) => g.length !== size) || size < 2) throw new Error("Группы разного размера");
  const cards = shuffle(
    groups.flatMap((g, k) => g.map((f) => ({ f, k: String(k) }))),
    rand,
  );
  return { deck: cards.map((c) => c.f), group: cards.map((c) => c.k), size, matched: new Set(), open: [], misses: 0 };
}

/** Open cards that do not belong together are waiting for `closeMiss`. */
const missOpen = (s: Memory): boolean => s.open.length >= 2 && s.open.some((j) => s.group[j] !== s.group[s.open[0]!]);

/** Turn card i. A miss stays open until `closeMiss` (the UI waits a moment). */
export function flip(state: Memory, i: number): FlipResult {
  if (i < 0 || i >= state.deck.length) return "ignored";
  if (state.matched.has(i) || state.open.includes(i) || missOpen(state) || state.open.length >= state.size) return "ignored";
  state.open.push(i);
  if (state.open.length === 1) return "first";
  if (state.group[i] !== state.group[state.open[0]!]) {
    state.misses++;
    return "miss";
  }
  if (state.open.length < state.size) return "more";
  for (const j of state.open) state.matched.add(j);
  state.open = [];
  return "match";
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
  if (missOpen(state)) return [];
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
