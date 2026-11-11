import { describe, expect, it } from "vitest";
import { levels, shadowCount, thing } from "./levels";
import { hintTarget, judge, rowsOf, starsFor } from "./logic";

describe("teni", () => {
  it("has 12 levels of 3 to 6 known shadows", () => {
    expect(levels).toHaveLength(12);
    for (const level of levels) {
      const all = [...level.items, ...(level.decoys ?? [])];
      expect(shadowCount(level)).toBeGreaterThanOrEqual(3);
      expect(shadowCount(level)).toBeLessThanOrEqual(6);
      expect(new Set(all).size).toBe(all.length);
      for (const id of all) expect(() => thing(id)).not.toThrow();
    }
  });
  it("hints at a thing still in the tray", () => {
    expect(hintTarget(["a", "b"], new Set(["a"]))).toBe("b");
    expect(hintTarget(["a"], new Set(["a"]))).toBeNull();
  });
  it("places only on the own silhouette", () => {
    const filled = new Set(["star"]);
    expect(judge("apple", "apple", filled)).toBe("placed");
    expect(judge("apple", "house", filled)).toBe("wrong");
    expect(judge("apple", "star", filled)).toBe("none");
    expect(judge("apple", null, filled)).toBe("none");
  });
  it("lays silhouettes out in short rows", () => {
    expect(rowsOf(3)).toEqual([3]);
    expect(rowsOf(4)).toEqual([2, 2]);
    expect(rowsOf(5)).toEqual([3, 2]);
    expect(rowsOf(6)).toEqual([3, 3]);
  });
  it("gives stars kindly", () => {
    expect([starsFor(0), starsFor(1), starsFor(3), starsFor(8)]).toEqual([3, 3, 2, 1]);
  });
});
