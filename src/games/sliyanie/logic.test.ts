import { describe, expect, it } from "vitest";
import { createRng } from "../../shared/rng";
import { CHAIN, CHAINS, WINTER, levels } from "./levels";
import { CHAIN_ART, WINTER_ART } from "./art";
import { bestTier, canMove, emptyBoard, move, spawn, starsFor, unstick, type Board, type Tile } from "./logic";

function board(size: number, rows: Array<Array<number | null>>): Board {
  const tiles: Tile[] = [];
  let id = 1;
  rows.forEach((row, r) =>
    row.forEach((tier, c) => {
      if (tier !== null) tiles.push({ id: id++, tier, r, c });
    }),
  );
  return { size, tiles, nextId: id };
}

function grid(b: Board): Array<Array<number | null>> {
  const out = Array.from({ length: b.size }, () => Array<number | null>(b.size).fill(null));
  for (const t of b.tiles) out[t.r]![t.c] = t.tier;
  return out;
}

describe("sliyanie", () => {
  it("merges two equal tiles into the next step", () => {
    const res = move(board(3, [[0, 0, null], [null, null, null], [null, null, null]]), "left", 6);
    expect(grid(res.board)[0]).toEqual([1, null, null]);
    expect(res.mergedTiers).toEqual([1]);
    expect(res.moved).toBe(true);
  });
  it("merges once per move, like 2048", () => {
    const res = move(board(4, [[0, 0, 0, 0], [1, 1, 2, null], [null, null, null, null], [null, null, null, null]]), "left", 6);
    expect(grid(res.board)[0]).toEqual([1, 1, null, null]);
    expect(grid(res.board)[1]).toEqual([2, 2, null, null]);
  });
  it("slides the right way in every direction", () => {
    const b = board(3, [[0, null, 1], [null, null, null], [null, 2, null]]);
    expect(grid(move(b, "right", 6).board)[0]).toEqual([null, 0, 1]);
    expect(grid(move(b, "down", 6).board)[2]).toEqual([0, 2, 1]);
    expect(grid(move(b, "up", 6).board)[0]).toEqual([0, 2, 1]);
  });
  it("does nothing when nothing can move", () => {
    const b = board(2, [[0, 1], [null, null]]);
    expect(move(b, "left", 6).moved).toBe(false);
  });
  it("never merges past the last step", () => {
    const res = move(board(2, [[6, 6], [null, null]]), "left", 6);
    expect(res.moved).toBe(false);
  });
  it("spawns on a free cell", () => {
    const rand = createRng(1);
    let b = emptyBoard(3);
    for (let i = 0; i < 9; i++) b = spawn(b, rand);
    expect(b.tiles).toHaveLength(9);
    expect(new Set(b.tiles.map((t) => `${t.r},${t.c}`)).size).toBe(9);
    expect(spawn(b, rand)).toBe(b);
  });
  it("finds a stuck board and helps out", () => {
    const stuck = board(2, [[0, 1], [1, 0]]);
    expect(canMove(stuck, 6)).toBe(false);
    const helped = unstick(stuck, 6, createRng(5));
    expect(canMove(helped, 6)).toBe(true);
  });
  it("can always reach every level goal in a random game", () => {
    for (const level of levels) {
      const rand = createRng(level.goal * 7 + level.size);
      let b = spawn(spawn(emptyBoard(level.size), rand), rand);
      const dirs = ["left", "down", "right", "down"] as const;
      for (let step = 0; step < 4000 && bestTier(b) < level.goal; step++) {
        if (!canMove(b, CHAIN.length - 1)) b = unstick(b, CHAIN.length - 1, rand);
        let res = move(b, dirs[step % 4]!, CHAIN.length - 1);
        if (!res.moved) res = move(b, "up", CHAIN.length - 1);
        b = res.moved ? spawn(res.board, rand) : b;
      }
      expect(bestTier(b), level.id).toBeGreaterThanOrEqual(level.goal);
    }
  });
  it("gives fewer stars only for help", () => {
    expect([starsFor(0).stars, starsFor(1).stars, starsFor(4).stars]).toEqual([3, 2, 1]);
  });
  it("has two equal chains with art for every step but the last", () => {
    expect(WINTER).toHaveLength(CHAIN.length);
    expect(CHAIN_ART).toHaveLength(CHAIN.length - 1);
    expect(WINTER_ART).toHaveLength(WINTER.length - 1);
  });
  it("has 12 levels in two worlds with reachable goals", () => {
    expect(levels).toHaveLength(12);
    expect(new Set(levels.map((l) => l.id)).size).toBe(12);
    for (const level of levels) {
      expect(level.goal).toBeLessThan(CHAINS[level.chain].length);
      expect(level.world).toBe(level.chain);
      expect(level.size).toBeGreaterThanOrEqual(3);
    }
  });
});
