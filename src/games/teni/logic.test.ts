import { describe, expect, it } from "vitest";
import { levels, thing } from "./levels";
import { judge, rowsOf, starsFor } from "./logic";

describe("teni", () => {
  it("has 3 to 5 known things per level", () => {
    for (const level of levels) {
      expect(level.items.length).toBeGreaterThanOrEqual(3);
      expect(level.items.length).toBeLessThanOrEqual(5);
      expect(new Set(level.items).size).toBe(level.items.length);
      for (const id of level.items) expect(() => thing(id)).not.toThrow();
    }
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
  });
  it("gives stars kindly", () => {
    expect([starsFor(0), starsFor(1), starsFor(3), starsFor(8)]).toEqual([3, 3, 2, 1]);
  });
});
