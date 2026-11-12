import { describe, expect, it } from "vitest";
import { createRng } from "../../shared/rng";
import { face, levels, pairsOf } from "./levels";
import { closeMiss, deal, fitGrid, flip, peekable, solved, starsFor } from "./logic";

describe("najdi-paru", () => {
  it("has 2×2, 2×3, 3×4 and 4×4 boards with enough faces", () => {
    const sizes = new Set(levels.map((l) => `${l.cols}x${l.rows}`));
    for (const s of ["2x2", "2x3", "3x4", "4x4"]) expect(sizes.has(s)).toBe(true);
    for (const level of levels) {
      expect(level.faces.length, level.id).toBeGreaterThanOrEqual(pairsOf(level));
      expect(new Set(level.faces).size, level.id).toBe(level.faces.length);
      for (const key of level.faces) expect(() => face(key), key).not.toThrow();
    }
  });
  it("deals every face twice", () => {
    const m = deal(["a", "b", "c"], 3, createRng(2));
    expect(m.deck.sort()).toEqual(["a", "a", "b", "b", "c", "c"]);
  });
  it("matches pairs and closes misses", () => {
    const m = deal(["a", "b"], 2, createRng(1));
    m.deck = ["a", "b", "a", "b"];
    expect(flip(m, 0)).toBe("first");
    expect(flip(m, 0)).toBe("ignored");
    expect(flip(m, 1)).toBe("miss");
    expect(flip(m, 2)).toBe("ignored");
    expect(closeMiss(m)).toEqual([0, 1]);
    expect(flip(m, 0)).toBe("first");
    expect(flip(m, 2)).toBe("match");
    expect(flip(m, 1)).toBe("first");
    expect(flip(m, 3)).toBe("match");
    expect(solved(m)).toBe(true);
    expect(m.misses).toBe(1);
  });
  it("is kind with stars", () => {
    expect(starsFor(2, 2).stars).toBe(3);
    expect(starsFor(4, 2).stars).toBe(2);
    expect(starsFor(9, 2).stars).toBe(1);
  });
  it("has 15 levels up to 20 cards, old ids kept", () => {
    expect(levels).toHaveLength(15);
    for (const id of ["p1", "p2", "p3", "p4", "p5", "p6"]) expect(levels.some((l) => l.id === id)).toBe(true);
    expect(Math.max(...levels.map((l) => l.cols * l.rows))).toBe(20);
  });
  it("picks a random set when there are more faces than pairs", () => {
    const m = deal(["a", "b", "c", "d", "e"], 2, createRng(4));
    expect(m.deck).toHaveLength(4);
    expect(new Set(m.deck).size).toBe(2);
  });
  it("peeks only at closed cards", () => {
    const m = deal(["a", "b"], 2, createRng(1));
    const a = m.deck.indexOf("a");
    const a2 = m.deck.lastIndexOf("a");
    flip(m, a);
    flip(m, a2);
    expect(peekable(m).sort()).toEqual([0, 1, 2, 3].filter((i) => i !== a && i !== a2).sort());
  });
  it("turns the grid with the screen", () => {
    expect(fitGrid(4, 5, true)).toEqual({ cols: 5, rows: 4 });
    expect(fitGrid(4, 5, false)).toEqual({ cols: 4, rows: 5 });
  });
});
