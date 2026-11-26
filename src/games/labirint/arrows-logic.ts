import type { ArrowLevel, Dir } from "./arrows-data";

export type XY = [number, number];
export const DIRS: Record<Dir, XY> = { U: [0, -1], R: [1, 0], D: [0, 1], L: [-1, 0] };

const key = ([x, y]: XY): string => `${x},${y}`;
export const sameXY = (a: XY, b: XY): boolean => a[0] === b[0] && a[1] === b[1];

export function blocked(level: ArrowLevel, [x, y]: XY): "out" | "rock" | null {
  if (x < 0 || y < 0 || x >= level.cols || y >= level.rows) return "out";
  return level.rocks.some((r) => r[0] === x && r[1] === y) ? "rock" : null;
}

export type Walk = { cells: XY[]; stop: "goal" | "rock" | "out" | "end"; at: number };

/** Ryzhik walks the tape: the cells he visits, and why he stopped (at = arrow index). Reaching the goal ends the walk. */
export function walk(level: ArrowLevel, tape: readonly Dir[], from: XY = level.start): Walk {
  const cells: XY[] = [from];
  let at: XY = from;
  for (let i = 0; i < tape.length; i++) {
    const d = DIRS[tape[i]!];
    const next: XY = [at[0] + d[0], at[1] + d[1]];
    const b = blocked(level, next);
    if (b) return { cells, stop: b, at: i };
    at = next;
    cells.push(at);
    if (sameXY(at, level.goal)) return { cells, stop: "goal", at: i };
  }
  return { cells, stop: "end", at: tape.length };
}

/** Shortest way from a cell to the goal (BFS), as arrows; null when there is none. */
export function shortest(level: ArrowLevel, from: XY = level.start): Dir[] | null {
  const prev = new Map<string, { from: XY; dir: Dir } | null>([[key(from), null]]);
  const queue: XY[] = [from];
  while (queue.length) {
    const at = queue.shift()!;
    if (sameXY(at, level.goal)) {
      const out: Dir[] = [];
      for (let p = prev.get(key(at)); p; p = prev.get(key(p.from))) out.unshift(p.dir);
      return out;
    }
    for (const dir of ["U", "R", "D", "L"] as Dir[]) {
      const d = DIRS[dir];
      const next: XY = [at[0] + d[0], at[1] + d[1]];
      if (blocked(level, next) || prev.has(key(next))) continue;
      prev.set(key(next), { from: at, dir });
      queue.push(next);
    }
  }
  return null;
}

/** The arrow to add next for a hint: keeps a correct start of the tape, or null when the tape went wrong. */
export function nextArrow(level: ArrowLevel, tape: readonly Dir[]): Dir | null {
  const w = walk(level, tape);
  if (w.stop !== "end") return null;
  const rest = shortest(level, w.cells.at(-1)!);
  if (!rest || !rest.length || tape.length + rest.length > level.maxArrows) return null;
  return rest[0]!;
}

export const turns = (sol: readonly Dir[]): number => sol.reduce((n, d, i) => n + (i > 0 && d !== sol[i - 1] ? 1 : 0), 0);
