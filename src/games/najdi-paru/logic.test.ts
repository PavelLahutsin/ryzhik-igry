import { describe, expect, it } from "vitest";
import { createRng } from "../../shared/rng";
import { face, levels, pairsOf } from "./levels";
import { closeMiss, deal, flip, solved, starsFor } from "./logic";

describe("najdi-paru", () => {
  it("has 2×2, 2×3, 3×4 and 4×4 boards with enough faces", () => {
    const sizes = new Set(levels.map((l) => `${l.cols}x${l.rows}`));
    for (const s of ["2x2", "2x3", "3x4", "4x4"]) expect(sizes.has(s)).toBe(true);
    for (const level of levels) {
      expect(level.faces.length, level.id).toBe(pairsOf(level));
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
    expect(starsFor(2, 2)).toBe(3);
    expect(starsFor(4, 2)).toBe(2);
    expect(starsFor(9, 2)).toBe(1);
  });
});
