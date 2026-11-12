/**
 * 2048 without numbers: tiles are steps of a picture chain (tier 0, 1, 2…).
 * Two equal tiles that meet merge into the next step. Pure functions only.
 */
export type Dir = "left" | "right" | "up" | "down";

export type Tile = {
  id: number;
  tier: number;
  r: number;
  c: number;
  /** Just made by a merge (for the pop animation). */
  merged?: boolean;
  /** Just appeared. */
  fresh?: boolean;
};

export type Board = { size: number; tiles: Tile[]; nextId: number };

export type MoveResult = { board: Board; moved: boolean; mergedTiers: number[] };

export function emptyBoard(size: number): Board {
  return { size, tiles: [], nextId: 1 };
}

export function emptyCells(board: Board): Array<{ r: number; c: number }> {
  const taken = new Set(board.tiles.map((t) => t.r * board.size + t.c));
  const out: Array<{ r: number; c: number }> = [];
  for (let r = 0; r < board.size; r++) {
    for (let c = 0; c < board.size; c++) if (!taken.has(r * board.size + c)) out.push({ r, c });
  }
  return out;
}

/** Drop a new tile on a free cell: mostly tier 0, sometimes tier 1. */
export function spawn(board: Board, rand: () => number, chanceOfTwo = 0.1): Board {
  const free = emptyCells(board);
  if (free.length === 0) return board;
  const cell = free[Math.floor(rand() * free.length)]!;
  const tier = rand() < chanceOfTwo ? 1 : 0;
  return {
    size: board.size,
    nextId: board.nextId + 1,
    tiles: [...board.tiles.map(clean), { id: board.nextId, tier, r: cell.r, c: cell.c, fresh: true }],
  };
}

function clean(tile: Tile): Tile {
  return { id: tile.id, tier: tile.tier, r: tile.r, c: tile.c };
}

/**
 * Slide every tile toward `dir`. Equal neighbours merge once per move into
 * tier + 1, never past `maxTier`.
 */
export function move(board: Board, dir: Dir, maxTier: number): MoveResult {
  const { size } = board;
  let nextId = board.nextId;
  const out: Tile[] = [];
  const mergedTiers: number[] = [];
  let moved = false;
  const horizontal = dir === "left" || dir === "right";
  const toStart = dir === "left" || dir === "up";

  for (let line = 0; line < size; line++) {
    const inLine = board.tiles
      .filter((t) => (horizontal ? t.r === line : t.c === line))
      .sort((a, b) => {
        const pa = horizontal ? a.c : a.r;
        const pb = horizontal ? b.c : b.r;
        return toStart ? pa - pb : pb - pa;
      });
    let slot = 0;
    let last: Tile | null = null;
    let lastMerged = false;
    for (const tile of inLine) {
      if (last && !lastMerged && last.tier === tile.tier && tile.tier < maxTier) {
        // Merge into the tile already placed in this line.
        const made: Tile = { id: nextId++, tier: tile.tier + 1, r: last.r, c: last.c, merged: true };
        out[out.indexOf(last)] = made;
        mergedTiers.push(made.tier);
        moved = true;
        last = made;
        lastMerged = true;
        continue;
      }
      const pos = toStart ? slot : size - 1 - slot;
      const r = horizontal ? line : pos;
      const c = horizontal ? pos : line;
      if (r !== tile.r || c !== tile.c) moved = true;
      const placed: Tile = { id: tile.id, tier: tile.tier, r, c };
      out.push(placed);
      last = placed;
      lastMerged = false;
      slot++;
    }
  }
  return { board: { size, tiles: out, nextId }, moved, mergedTiers };
}

export function canMove(board: Board, maxTier: number): boolean {
  if (emptyCells(board).length > 0) return true;
  return (["left", "right", "up", "down"] as Dir[]).some((dir) => move(board, dir, maxTier).moved);
}

export function bestTier(board: Board): number {
  return board.tiles.reduce((best, t) => Math.max(best, t.tier), -1);
}

/**
 * Gentle help when stuck: shuffle the tiles until a move exists; if no
 * shuffle helps, take away the smallest tiles until there is room.
 */
export function unstick(board: Board, maxTier: number, rand: () => number): Board {
  const cells: Array<{ r: number; c: number }> = [];
  for (let r = 0; r < board.size; r++) for (let c = 0; c < board.size; c++) cells.push({ r, c });
  for (let attempt = 0; attempt < 30; attempt++) {
    const order = [...cells].sort(() => rand() - 0.5);
    const tiles = board.tiles.map((t, i) => ({ ...clean(t), r: order[i]!.r, c: order[i]!.c }));
    const next = { ...board, tiles };
    if (["left", "right", "up", "down"].some((dir) => move(next, dir as Dir, maxTier).moved)) return next;
  }
  const sorted = [...board.tiles].sort((a, b) => a.tier - b.tier);
  return { ...board, tiles: sorted.slice(2).map(clean) };
}

export function starsFor(helps: number): number {
  return helps === 0 ? 3 : helps === 1 ? 2 : 1;
}

// ---------- «Большая игра 2048» ----------
// The same board, tier t is the number 2^(t+1): tier 0 = 2, tier 10 = 2048.

/** Tier of the 2048 tile (the win). */
export const WIN_TIER = 10;
/** After the win the child may play on up to 131072. */
export const BIG_MAX_TIER = 16;
export const BIG_SIZE = 4;

export const tileValue = (tier: number): number => 2 ** (tier + 1);

export type BigGame = {
  board: Board;
  score: number;
  /** 2048 was made in this game. */
  won: boolean;
  /** One step back (kid-friendly undo); null right after an undo. */
  prev: { board: Board; score: number } | null;
};

export function newBigGame(rand: () => number): BigGame {
  return { board: spawn(spawn(emptyBoard(BIG_SIZE), rand), rand), score: 0, won: false, prev: null };
}

export type BigMove = {
  game: BigGame;
  moved: boolean;
  /** Tiers made in this move. */
  mergedTiers: number[];
  /** Points for this move: the sum of the new numbers. */
  gained: number;
  /** 2048 appeared in this very move. */
  justWon: boolean;
};

/** Classic 2048 move: slide, merge once, add the numbers to the score, drop a 2 (90%) or a 4. */
export function bigMove(game: BigGame, dir: Dir, rand: () => number): BigMove {
  const res = move(game.board, dir, BIG_MAX_TIER);
  if (!res.moved) return { game, moved: false, mergedTiers: [], gained: 0, justWon: false };
  const gained = res.mergedTiers.reduce((sum, tier) => sum + tileValue(tier), 0);
  const justWon = !game.won && res.mergedTiers.some((tier) => tier >= WIN_TIER);
  return {
    game: {
      board: spawn(res.board, rand),
      score: game.score + gained,
      won: game.won || justWon,
      prev: { board: game.board, score: game.score },
    },
    moved: true,
    mergedTiers: res.mergedTiers,
    gained,
    justWon,
  };
}

/** Back one move (once). The win stays a win. */
export function bigUndo(game: BigGame): BigGame {
  if (!game.prev) return game;
  return { board: game.prev.board, score: game.prev.score, won: game.won, prev: null };
}

export function hasMoves(game: BigGame): boolean {
  return canMove(game.board, BIG_MAX_TIER);
}

function validBoard(value: unknown, size: number): Board | null {
  if (!value || typeof value !== "object") return null;
  const b = value as Partial<Board>;
  if (b.size !== size || !Array.isArray(b.tiles)) return null;
  const seen = new Set<number>();
  const tiles: Tile[] = [];
  let nextId = 1;
  for (const t of b.tiles as unknown[]) {
    const tile = t as Partial<Tile>;
    const ok = [tile.id, tile.tier, tile.r, tile.c].every((n) => Number.isInteger(n));
    if (!ok) return null;
    const { id, tier, r, c } = tile as Tile;
    if (tier < 0 || tier > BIG_MAX_TIER || r < 0 || r >= size || c < 0 || c >= size) return null;
    if (seen.has(r * size + c)) return null;
    seen.add(r * size + c);
    tiles.push({ id, tier, r, c });
    nextId = Math.max(nextId, id + 1);
  }
  return { size, tiles, nextId: Math.max(nextId, Number(b.nextId) || 0) };
}

/** A saved game from storage, or null when it is missing or broken. */
export function restoreBigGame(value: unknown): BigGame | null {
  if (!value || typeof value !== "object") return null;
  const g = value as Partial<BigGame>;
  const board = validBoard(g.board, BIG_SIZE);
  if (!board || !board.tiles.length || typeof g.score !== "number" || !(g.score >= 0)) return null;
  const prevBoard = g.prev ? validBoard(g.prev.board, BIG_SIZE) : null;
  const prev = prevBoard && typeof g.prev?.score === "number" ? { board: prevBoard, score: g.prev.score } : null;
  if (prev) board.nextId = Math.max(board.nextId, prev.board.nextId);
  return { board, score: Math.floor(g.score), won: g.won === true || bestTier(board) >= WIN_TIER, prev };
}
