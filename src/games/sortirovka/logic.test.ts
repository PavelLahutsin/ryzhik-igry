import { describe, expect, it } from "vitest";
import { OBJECTS } from "../../shared/objects";
import { itemCount, levels } from "./levels";
import { basketOf, hintFor, judge, starsFor } from "./logic";

describe("sortirovka", () => {
  it("has 15 levels, each thing in exactly one basket", () => {
    expect(levels).toHaveLength(15);
    for (const level of levels) {
      const all = level.baskets.flatMap((b) => b.items);
      expect(new Set(all).size, level.id).toBe(all.length);
      expect(level.baskets.length).toBeGreaterThanOrEqual(2);
      expect(level.baskets.length).toBeLessThanOrEqual(4);
      expect(itemCount(level)).toBeLessThanOrEqual(10);
      for (const id of all) expect(OBJECTS[id], id).toBeDefined();
    }
  });
  it("colour baskets hold only things of their colour", () => {
    for (const level of levels) {
      for (const basket of level.baskets) {
        if (!basket.sorts) continue;
        for (const id of basket.items) expect(OBJECTS[id].color, `${level.id} ${id}`).toBe(basket.sorts);
      }
    }
  });
  it("judges drops", () => {
    const level = levels[0]!;
    expect(basketOf(level, "apple")).toBe("red");
    expect(judge(level, "apple", "red")).toBe("placed");
    expect(judge(level, "apple", "yellow")).toBe("wrong");
    expect(judge(level, "apple", null)).toBe("none");
  });
  it("hints at a thing still on the table", () => {
    expect(hintFor(["apple", "sun"], new Set(["apple"]))).toBe("sun");
    expect(hintFor(["apple"], new Set(["apple"]))).toBeNull();
  });
  it("gives stars kindly", () => {
    expect([starsFor(0, 4), starsFor(1, 4), starsFor(2, 4), starsFor(3, 4)]).toEqual([3, 3, 2, 1]);
  });
});
