/**
 * Mazes for «Лабиринт»: a perfect maze (one way between any two cells) made
 * by a depth-first walk. Cells hold open sides as bits. Pure, no DOM.
 */
export const N = 1;
export const E = 2;
export const S = 4;
export const W = 8;

export type Cell = { c: number; r: number };
export type Maze = { cols: number; rows: number; open: number[] };

const STEPS: Array<[number, number, number, number]> = [
  [N, 0, -1, S],
  [E, 1, 0, W],
  [S, 0, 1, N],
  [W, -1, 0, E],
];

export function makeMaze(cols: number, rows: number, rand: () => number): Maze {
  const open = new Array<number>(cols * rows).fill(0);
  const seen = new Uint8Array(cols * rows);
  const stack: number[] = [0];
  seen[0] = 1;
  while (stack.length) {
    const i = stack[stack.length - 1]!;
    const c = i % cols;
    const r = Math.floor(i / cols);
    const next = STEPS.filter(([, dc, dr]) => {
      const nc = c + dc;
      const nr = r + dr;
      return nc >= 0 && nc < cols && nr >= 0 && nr < rows && !seen[nr * cols + nc];
    });
    if (next.length === 0) {
      stack.pop();
      continue;
    }
    const [bit, dc, dr, back] = next[Math.floor(rand() * next.length)]!;
    const j = (r + dr) * cols + (c + dc);
    open[i]! |= bit;
    open[j]! |= back;
    seen[j] = 1;
    stack.push(j);
  }
  return { cols, rows, open };
}

/** Can Ryzhik step from a cell to a neighbouring one (no wall between)? */
export function canStep(maze: Maze, from: Cell, to: Cell): boolean {
  const dc = to.c - from.c;
  const dr = to.r - from.r;
  if (Math.abs(dc) + Math.abs(dr) !== 1) return false;
  if (to.c < 0 || to.r < 0 || to.c >= maze.cols || to.r >= maze.rows) return false;
  const bit = dc === 1 ? E : dc === -1 ? W : dr === 1 ? S : N;
  return (maze.open[from.r * maze.cols + from.c]! & bit) !== 0;
}

/**
 * Cells to walk from `from` toward `to` when the finger is in the same row
 * or column with no wall on the way (so a long swipe walks a corridor).
 */
export function walkToward(maze: Maze, from: Cell, to: Cell): Cell[] {
  if (from.c !== to.c && from.r !== to.r) return [];
  const out: Cell[] = [];
  let at = from;
  while (at.c !== to.c || at.r !== to.r) {
    const next = { c: at.c + Math.sign(to.c - at.c), r: at.r + Math.sign(to.r - at.r) };
    if (!canStep(maze, at, next)) break;
    out.push(next);
    at = next;
  }
  return out;
}

/** Shortest way between two cells (BFS), both ends included. */
export function solve(maze: Maze, from: Cell, to: Cell): Cell[] {
  const { cols, rows } = maze;
  const prev = new Int32Array(cols * rows).fill(-1);
  const start = from.r * cols + from.c;
  const goal = to.r * cols + to.c;
  prev[start] = start;
  const queue = [start];
  while (queue.length) {
    const i = queue.shift()!;
    if (i === goal) break;
    const at = { c: i % cols, r: Math.floor(i / cols) };
    for (const [, dc, dr] of STEPS) {
      const next = { c: at.c + dc, r: at.r + dr };
      const j = next.r * cols + next.c;
      if (canStep(maze, at, next) && prev[j] === -1) {
        prev[j] = i;
        queue.push(j);
      }
    }
  }
  if (prev[goal] === -1) return [];
  const path: Cell[] = [];
  for (let i = goal; ; i = prev[i]!) {
    path.push({ c: i % cols, r: Math.floor(i / cols) });
    if (i === start) break;
  }
  return path.reverse();
}

/**
 * Cells for the apples: spread out, never on the start or the goal, and
 * preferring dead ends so the child explores the maze.
 */
export function placeApples(maze: Maze, count: number, start: Cell, goal: Cell, rand: () => number): Cell[] {
  const cells: Cell[] = [];
  for (let r = 0; r < maze.rows; r++) for (let c = 0; c < maze.cols; c++) cells.push({ c, r });
  const free = cells.filter((x) => !(x.c === start.c && x.r === start.r) && !(x.c === goal.c && x.r === goal.r));
  const bits = (x: Cell): number => {
    const v = maze.open[x.r * maze.cols + x.c]!;
    return (v & 1) + ((v >> 1) & 1) + ((v >> 2) & 1) + ((v >> 3) & 1);
  };
  const shuffled = free.map((x) => ({ x, k: (bits(x) === 1 ? 0 : 1) + rand() })).sort((a, b) => a.k - b.k);
  const out: Cell[] = [];
  for (const { x } of shuffled) {
    if (out.length >= count) break;
    if (out.some((o) => Math.abs(o.c - x.c) + Math.abs(o.r - x.r) < 2)) continue;
    out.push(x);
  }
  return out;
}

/**
 * Maze size for the stage: about the level's number of cells, shaped like
 * the stage (portrait phones get tall mazes, landscape wide ones).
 */
export function fitMaze(cols: number, rows: number, width: number, height: number): { cols: number; rows: number } {
  const cells = cols * rows;
  const aspect = Math.min(1.6, Math.max(1 / 1.6, height / Math.max(1, width)));
  const r = Math.max(3, Math.round(Math.sqrt(cells * aspect)));
  const c = Math.max(3, Math.round(cells / r));
  return { cols: c, rows: r };
}
