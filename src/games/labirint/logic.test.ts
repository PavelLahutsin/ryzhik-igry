import { describe, expect, it } from "vitest";
import { createRng } from "../../shared/rng";
import { characters } from "../../shared/assets";
import { levels } from "./levels";
import { E, N, S, W, canStep, fitMaze, makeMaze, placeApples, solve, walkToward } from "./maze";

function opens(v: number): number {
  return [N, E, S, W].filter((b) => v & b).length;
}

describe("labirint", () => {
  it("makes a perfect maze: every cell reachable, no loops", () => {
    for (const seed of [1, 2, 3]) {
      const m = makeMaze(6, 7, createRng(seed));
      // A tree on n cells has n - 1 passages.
      const passages = m.open.reduce((sum, v) => sum + opens(v), 0) / 2;
      expect(passages).toBe(6 * 7 - 1);
      for (let r = 0; r < 7; r++) for (let c = 0; c < 6; c++) expect(solve(m, { c: 0, r: 0 }, { c, r }).length).toBeGreaterThan(0);
    }
  });
  it("keeps walls on both sides consistent and the border closed", () => {
    const m = makeMaze(5, 5, createRng(7));
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const v = m.open[r * 5 + c]!;
        if (c === 0) expect(v & W).toBe(0);
        if (r === 4) expect(v & S).toBe(0);
        if (c < 4) expect(Boolean(v & E)).toBe(Boolean(m.open[r * 5 + c + 1]! & W));
      }
    }
  });
  it("steps only through open sides and walks corridors", () => {
    const m = makeMaze(4, 4, createRng(3));
    const path = solve(m, { c: 0, r: 0 }, { c: 3, r: 3 });
    for (let i = 1; i < path.length; i++) expect(canStep(m, path[i - 1]!, path[i]!)).toBe(true);
    expect(canStep(m, { c: 0, r: 0 }, { c: 1, r: 1 })).toBe(false);
    const walk = walkToward(m, path[0]!, path[1]!);
    expect(walk).toEqual([path[1]]);
    expect(walkToward(m, { c: 0, r: 0 }, { c: 2, r: 2 })).toEqual([]);
  });
  it("puts apples apart, off the start and the goal", () => {
    const m = makeMaze(7, 8, createRng(5));
    const apples = placeApples(m, 4, { c: 0, r: 0 }, { c: 6, r: 7 }, createRng(9));
    expect(apples).toHaveLength(4);
    for (const a of apples) {
      expect(a.c === 0 && a.r === 0).toBe(false);
      expect(a.c === 6 && a.r === 7).toBe(false);
    }
  });
  it("has 12 growing levels with known characters", () => {
    expect(levels).toHaveLength(12);
    for (const level of levels) expect(characters[level.goal], level.goal).toBeDefined();
    const sizes = levels.map((l) => l.cols * l.rows);
    expect(sizes[0]).toBe(9);
    expect(sizes[11]).toBe(72);
  });
  it("shapes the maze like the screen", () => {
    const tall = fitMaze(7, 8, 390, 700);
    expect(tall.rows).toBeGreaterThan(tall.cols);
    const wide = fitMaze(7, 8, 800, 300);
    expect(wide.cols).toBeGreaterThan(wide.rows);
    expect(Math.abs(tall.cols * tall.rows - 56)).toBeLessThanOrEqual(6);
    expect(fitMaze(3, 3, 390, 700)).toEqual({ cols: 3, rows: 4 });
  });
});
