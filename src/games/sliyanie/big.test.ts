import { describe, expect, it } from "vitest";
import { createRng } from "../../shared/rng";
import {
  BIG_SIZE,
  WIN_TIER,
  bigMove,
  bigUndo,
  hasMoves,
  newBigGame,
  restoreBigGame,
  spawn,
  tileValue,
  type BigGame,
  type Board,
  type Tile,
} from "./logic";

/** Board from numbers (2, 4, 8 …), 0 = empty. */
function fromValues(rows: number[][]): Board {
  const tiles: Tile[] = [];
  let id = 1;
  rows.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v) tiles.push({ id: id++, tier: Math.log2(v) - 1, r, c });
    }),
  );
  return { size: rows.length, tiles, nextId: id };
}

function values(b: Board): number[][] {
  const out = Array.from({ length: b.size }, () => Array<number>(b.size).fill(0));
  for (const t of b.tiles) out[t.r]![t.c] = tileValue(t.tier);
  return out;
}

const game = (rows: number[][], extra: Partial<BigGame> = {}): BigGame => ({ board: fromValues(rows), score: 0, won: false, prev: null, ...extra });
/** rand that always picks the first free cell and a 2. */

const ROW = [
  [2, 2, 4, 4],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

describe("Большая игра 2048", () => {
  it("numbers double by tier: 2 … 2048", () => {
    expect([0, 1, 2, WIN_TIER].map(tileValue)).toEqual([2, 4, 8, 2048]);
  });

  it("starts with two tiles of 2 or 4 on a 4×4 board", () => {
    const g = newBigGame(createRng(7));
    expect(g.board.size).toBe(BIG_SIZE);
    expect(g.board.tiles).toHaveLength(2);
    for (const t of g.board.tiles) expect([2, 4]).toContain(tileValue(t.tier));
    expect(g.score).toBe(0);
  });

  it("moves and merges left", () => {
    const res = bigMove(game(ROW), "left", () => 0.99);
    expect(values(res.game.board)[0]).toEqual([4, 8, 0, 0]);
    expect(res.gained).toBe(12);
    expect(res.game.score).toBe(12);
  });

  it("moves and merges right", () => {
    const res = bigMove(game(ROW), "right", () => 0.99);
    expect(values(res.game.board)[0]).toEqual([0, 0, 4, 8]);
  });

  it("moves and merges up and down", () => {
    const col = [
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [8, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const up = bigMove(game(col), "up", () => 0.99);
    expect(values(up.game.board).map((r) => r[0])).toEqual([4, 8, 0, 0]);
    const down = bigMove(game(col), "down", () => 0.99);
    expect(values(down.game.board).map((r) => r[0])).toEqual([0, 0, 4, 8]);
  });

  it("merges each tile once per move: 2 2 2 2 → 4 4, 4 4 8 → 8 8", () => {
    const a = bigMove(game([[2, 2, 2, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]), "left", () => 0.99);
    expect(values(a.game.board)[0]).toEqual([4, 4, 0, 0]);
    const b = bigMove(game([[4, 4, 8, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]), "left", () => 0.99);
    expect(values(b.game.board)[0]).toEqual([8, 8, 0, 0]);
    const c = bigMove(game([[2, 2, 2, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]), "right", () => 0.99);
    expect(values(c.game.board)[0]).toEqual([0, 0, 2, 4]);
  });

  it("a move that changes nothing spawns nothing and keeps the undo", () => {
    const g = game([[2, 4, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], { prev: { board: fromValues([[2, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]), score: 0 } });
    const res = bigMove(g, "left", () => 0);
    expect(res.moved).toBe(false);
    expect(res.game).toBe(g);
  });

  it("drops one new tile after a move: 2 most of the time, 4 at 10%", () => {
    const res = bigMove(game(ROW), "left", () => 0);
    expect(res.game.board.tiles).toHaveLength(3);
    const empty = fromValues([[0, 0], [0, 0]]);
    let fours = 0;
    const rng = createRng(42);
    for (let i = 0; i < 2000; i++) {
      const t = spawn(empty, rng).tiles[0]!;
      if (tileValue(t.tier) === 4) fours++;
      else expect(tileValue(t.tier)).toBe(2);
    }
    expect(fours / 2000).toBeGreaterThan(0.06);
    expect(fours / 2000).toBeLessThan(0.14);
    // rand < 0.1 → a 4.
    expect(tileValue(spawn(empty, () => 0.05).tiles[0]!.tier)).toBe(4);
  });

  it("wins once when 2048 appears, and play goes on", () => {
    const g = game([[1024, 1024, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
    const res = bigMove(g, "left", () => 0.99);
    expect(res.justWon).toBe(true);
    expect(res.game.won).toBe(true);
    expect(values(res.game.board)[0]![0]).toBe(2048);
    const again = bigMove(res.game, "right", () => 0.99);
    expect(again.moved).toBe(true);
    expect(again.justWon).toBe(false);
    expect(again.game.won).toBe(true);
  });

  it("2048 + 2048 still merges after the win", () => {
    const res = bigMove(game([[2048, 2048, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], { won: true }), "left", () => 0.99);
    expect(values(res.game.board)[0]![0]).toBe(4096);
  });

  it("knows when no moves are left", () => {
    const full = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ];
    expect(hasMoves(game(full))).toBe(false);
    const pair = full.map((r) => [...r]);
    pair[3]![3] = 4;
    expect(hasMoves(game(pair))).toBe(true);
    const gap = full.map((r) => [...r]);
    gap[0]![0] = 0;
    expect(hasMoves(game(gap))).toBe(true);
  });

  it("undoes one move: board and score come back, only once", () => {
    const g = game(ROW, { score: 10 });
    const res = bigMove(g, "left", () => 0.99);
    const back = bigUndo(res.game);
    expect(values(back.board)).toEqual(values(g.board));
    expect(back.score).toBe(10);
    expect(back.prev).toBeNull();
    expect(bigUndo(back)).toBe(back);
  });

  it("restores a saved game and rejects broken data", () => {
    const res = bigMove(game(ROW), "left", () => 0.99);
    const saved = JSON.parse(JSON.stringify(res.game));
    const back = restoreBigGame(saved)!;
    expect(values(back.board)).toEqual(values(res.game.board));
    expect(back.score).toBe(12);
    expect(back.prev).not.toBeNull();
    const ids = new Set(back.board.tiles.map((t) => t.id));
    expect(ids.has(back.board.nextId)).toBe(false);
    expect(restoreBigGame(null)).toBeNull();
    expect(restoreBigGame({ board: { size: 3, tiles: [], nextId: 1 }, score: 0 })).toBeNull();
    expect(restoreBigGame({ ...saved, score: "x" })).toBeNull();
    const twice = JSON.parse(JSON.stringify(saved));
    twice.board.tiles[1].r = twice.board.tiles[0].r;
    twice.board.tiles[1].c = twice.board.tiles[0].c;
    expect(restoreBigGame(twice)).toBeNull();
  });

  it("a random game reaches a full board without errors and keeps the score honest", () => {
    const rng = createRng(3);
    let g = newBigGame(rng);
    const dirs = ["left", "down", "right", "up"] as const;
    for (let i = 0; i < 400 && hasMoves(g); i++) {
      const before = g.board.tiles.reduce((s, t) => s + tileValue(t.tier), 0);
      const res = bigMove(g, dirs[i % 4]!, rng);
      if (!res.moved) continue;
      const after = res.game.board.tiles.reduce((s, t) => s + tileValue(t.tier), 0);
      // Merges keep the sum; the new tile adds 2 or 4.
      expect([2, 4]).toContain(after - before);
      expect(res.game.score - g.score).toBe(res.gained);
      g = res.game;
    }
    expect(g.score).toBeGreaterThan(0);
  });
});
