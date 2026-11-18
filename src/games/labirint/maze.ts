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

const origin: Cell = { c: 0, r: 0 };
const distance = (a: Cell, b: Cell) => Math.abs(a.c - b.c) + Math.abs(a.r - b.r);
const isLeaf = (mask: number) => mask > 0 && (mask & (mask - 1)) === 0;
const inside = ({ cols, rows }: Maze, { c, r }: Cell) =>
  Number.isInteger(c) && Number.isInteger(r) && c >= 0 && r >= 0 && c < cols && r < rows;

/** DFS can start with a pre-carved path. Never expand the exit: the remaining
 * rectangle minus that corner is connected, so no repair pass is necessary. */
function grow(cols: number, rows: number, rand: () => number, path: Cell[]): Maze {
  const open = new Array<number>(cols * rows).fill(0);
  const seen = new Uint8Array(open.length);
  const goal = open.length - 1;
  const stack: number[] = [];
  for (const [k, cell] of path.entries()) {
    const i = cell.r * cols + cell.c;
    seen[i] = 1;
    if (i !== goal) stack.push(i);
    if (k > 0) {
      const prev = path[k - 1]!;
      const [bit, , , back] = STEPS.find(([, dc, dr]) => prev.c + dc === cell.c && prev.r + dr === cell.r)!;
      open[prev.r * cols + prev.c]! |= bit;
      open[i]! |= back;
    }
  }
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
    const [bit, dc, dr, back] = next[Math.min(next.length - 1, Math.floor(rand() * next.length))]!;
    const j = (r + dr) * cols + (c + dc);
    open[i]! |= bit;
    open[j]! |= back;
    seen[j] = 1;
    if (j !== goal) stack.push(j);
  }
  return { cols, rows, open };
}

export function makeMaze(cols: number, rows: number, rand: () => number): Maze {
  return grow(cols, rows, rand, [origin]);
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
  if (!inside(maze, from) || !inside(maze, to)) return [];
  const prev = new Int32Array(cols * rows).fill(-1);
  const start = from.r * cols + from.c;
  const goal = to.r * cols + to.c;
  prev[start] = start;
  const queue = [start];
  for (let head = 0; head < queue.length; head++) {
    const i = queue[head]!;
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

/** Multi-source BFS from the main path, with the exit removed. A positive
 * distance is exactly the number of extra steps into a reachable branch. */
function branchDepths(maze: Maze, path: Cell[], goal: Cell): Int32Array {
  const depth = new Int32Array(maze.open.length).fill(-1);
  const queue = path.filter(cell => distance(cell, goal) !== 0);
  for (const { c, r } of queue) depth[r * maze.cols + c] = 0;
  for (let head = 0; head < queue.length; head++) {
    const at = queue[head]!;
    for (const [, dc, dr] of STEPS) {
      const next = { c: at.c + dc, r: at.r + dr };
      const j = next.r * maze.cols + next.c;
      if (!canStep(maze, at, next) || depth[j] !== -1 || distance(next, goal) === 0) continue;
      depth[j] = depth[at.r * maze.cols + at.c]! + 1;
      queue.push(next);
    }
  }
  return depth;
}

type Site = { cell: Cell; depth: number; leaf: boolean };
function appleSites(maze: Maze, path: Cell[], start: Cell, goal: Cell): Site[] {
  const depths = branchDepths(maze, path, goal);
  const sites: Site[] = [];
  for (let i = 0; i < depths.length; i++) {
    const cell = { c: i % maze.cols, r: Math.floor(i / maze.cols) };
    const depth = depths[i]!;
    if (depth > 0 && depth <= 6 && distance(cell, start) > 1 && distance(cell, goal) > 1) {
      sites.push({ cell, depth, leaf: isLeaf(maze.open[i]!) });
    }
  }
  return sites;
}

// Search instead of greedily relaxing after an unlucky first pick (at most five apples).
const tiers = [[4, 3], [4, 2], [6, 2]] as const;
function pack(sites: Site[], count: number, depth: number, gap: number): Cell[] {
  const pool = sites.filter(s => s.depth <= depth);
  const chosen: Cell[] = [];
  let best: Cell[] = [];
  function search(first: number): boolean {
    if (chosen.length > best.length) best = chosen.slice();
    if (best.length >= count) return true;
    for (let i = first; i < pool.length && chosen.length + pool.length - i > best.length; i++) {
      const { cell } = pool[i]!;
      if (chosen.some(a => distance(a, cell) < gap)) continue;
      chosen.push(cell);
      if (search(i + 1)) return true;
      chosen.pop();
    }
    return false;
  }
  search(0);
  return best;
}

export function placeApples(maze: Maze, count: number, start: Cell, goal: Cell, rand: () => number): Cell[] {
  if (count <= 0) return [];
  const sites = appleSites(maze, solve(maze, start, goal), start, goal)
    .map(s => ({ ...s, key: rand() }))
    .sort((a, b) => Number(b.leaf) - Number(a.leaf) || a.key - b.key);
  let best: Cell[] = [];
  for (const [depth, gap] of tiers) {
    const cells = pack(sites, count, depth, gap);
    if (cells.length > best.length) best = cells;
    if (best.length >= count) break;
  }
  return best;
}

/**
 * Maze size for the stage: about the level's number of cells, shaped like
 * the stage (portrait phones get tall mazes, landscape wide ones).
 */
export function fitMaze(cols: number, rows: number, width: number, height: number, minCell = 0): { cols: number; rows: number } {
  const cells = cols * rows;
  const aspect = Math.min(1.6, Math.max(1 / 1.6, height / Math.max(1, width)));
  let r = Math.max(3, Math.round(Math.sqrt(cells * aspect)));
  let c = Math.max(3, Math.round(cells / r));
  // v13: cells stay big enough for a finger (a big level gets a little smaller instead).
  if (minCell > 0) {
    c = Math.max(3, Math.min(c, Math.floor(width / minCell)));
    r = Math.max(3, Math.min(Math.max(r, Math.round(cells / c)), Math.floor(height / minCell)));
  }
  return { cols: c, rows: r };
}

/** Longest way to the friend we accept: a little over the straight walk. */
export const maxWay = (cols: number, rows: number): number => Math.round((cols + rows - 1) * 2.2);

const minWay = (cols: number, rows: number) => Math.round((cols + rows - 1) * 1.3);
const nearExit = (path: Cell[], goal: Cell) => path.slice(1, 3).some(c => distance(c, goal) === 1);

/** Reserve the last attempt for a constructive candidate. Walk d steps along
 * the longer axis, across one lane, back d, then across to the third lane.
 * The rest is monotone: the U adds exactly 2*d cells to the shortest route. */
function detour(cols: number, rows: number, rand: () => number): Cell[] {
  const transpose = rows > cols || (rows === cols && rand() < 0.5);
  const width = transpose ? rows : cols, height = transpose ? cols : rows;
  const path: Cell[] = [];
  const add = (x: number, y: number) => path.push(transpose ? { c: y, r: x } : { c: x, r: y });
  const d = Math.ceil((minWay(cols, rows) - (cols + rows - 1)) / 2);
  for (let x = 0; x <= d; x++) add(x, 0);
  for (let x = d; x >= 0; x--) add(x, 1);
  for (let x = 0; x < width; x++) add(x, 2);
  for (let y = 3; y < height; y++) add(width - 1, y);
  return path;
}

export function pickMaze(cols: number, rows: number, rand: () => number, tries = 40): Maze {
  const goal = { c: cols - 1, r: rows - 1 };
  let best: Maze | undefined;
  let penalty = Infinity;
  const attempts = Math.max(1, Math.floor(tries));
  for (let i = 0; i < attempts; i++) {
    const maze = i + 1 === attempts && cols >= 3 && rows >= 3
      ? grow(cols, rows, rand, detour(cols, rows, rand)) : makeMaze(cols, rows, rand);
    const path = solve(maze, origin, goal);
    const score = Math.max(0, minWay(cols, rows) - path.length, path.length - maxWay(cols, rows))
      + Number(nearExit(path, goal));
    if (!score) return maze;
    if (score < penalty) { best = maze; penalty = score; }
  }
  return best!;
}

/**
 * v13: where a tap takes Ryzhik: along a straight open corridor, or by the
 * shortest way when the cell is close (a few steps); far taps do nothing.
 */
export function tapPath(maze: Maze, from: Cell, to: Cell, near = 4): Cell[] {
  const straight = walkToward(maze, from, to);
  const last = straight[straight.length - 1];
  if (last && last.c === to.c && last.r === to.r) return straight;
  const way = solve(maze, from, to).slice(1);
  return way.length > 0 && way.length <= near ? way : straight;
}

/** A word for the list instead of an exact size (the maze takes the screen's shape). */
export function sizeWord(cols: number, rows: number): string {
  const n = cols * rows;
  return n <= 16 ? "маленький" : n <= 36 ? "средний" : "большой";
}

/** Validate the actual passages and the strongest feasible apple tier for
 * the number returned (the originally requested count is not part of Maze). */
export function checkMaze(maze: Maze, apples: Cell[]): string[] {
  const { cols, rows, open } = maze;
  if (!Number.isSafeInteger(cols) || !Number.isSafeInteger(rows) || cols < 1 || rows < 1 || open.length !== cols * rows) {
    return ["invalid dimensions"];
  }
  const errors = new Set<string>();
  let edges = 0;
  for (let i = 0; i < open.length; i++) {
    const at = { c: i % cols, r: Math.floor(i / cols) };
    const mask = open[i]!;
    if (!Number.isInteger(mask) || mask < 0 || mask > 15) errors.add("invalid cell mask");
    for (const [bit, dc, dr, back] of STEPS) {
      if (!(mask & bit)) continue;
      const next = { c: at.c + dc, r: at.r + dr };
      if (!inside(maze, next) || !(open[next.r * cols + next.c]! & back)) errors.add("invalid passage");
      else if (bit === E || bit === S) edges++;
    }
  }
  if (edges !== open.length - 1) errors.add("not a tree: passage count");
  if (!isLeaf(open[open.length - 1]!)) errors.add("exit is not a leaf");
  if (branchDepths(maze, [origin], { c: -1, r: -1 }).includes(-1)) errors.add("disconnected maze");
  const goal = { c: cols - 1, r: rows - 1 };
  const path = solve(maze, origin, goal);
  if (path.length < minWay(cols, rows) || path.length > maxWay(cols, rows)) errors.add("path length");
  if (nearExit(path, goal)) errors.add("early step next to exit");
  if (apples.length) {
    const sites = appleSites(maze, path, origin, goal);
    let deepest = 0, closest = Infinity;
    for (const [i, cell] of apples.entries()) {
      const site = sites.find(s => distance(s.cell, cell) === 0);
      if (!site) errors.add("apple outside a permitted branch");
      else deepest = Math.max(deepest, site.depth);
      for (let j = 0; j < i; j++) closest = Math.min(closest, distance(apples[j]!, cell));
    }
    if (closest < 2) errors.add("apples too close");
    for (const [depth, gap] of tiers) {
      if (deepest <= depth && closest >= gap) break;
      if (pack(sites, apples.length, depth, gap).length === apples.length) {
        errors.add("unnecessary relaxation of apple rules");
        break;
      }
    }
  }
  return [...errors];
}
