import { describe, expect, it } from "vitest";
import { OBJECTS } from "../../shared/objects";
import { difficulty, itemCount, levels, objOf, sizeOf } from "./levels";
import { basketOf, hintFor, judge, starsFor, targetFor } from "./logic";

describe("sortirovka", () => {
  it("has 24 levels, each thing in exactly one basket (counting baskets: any)", () => {
    expect(levels).toHaveLength(24);
    for (const level of levels) {
      const all = level.baskets.flatMap((b) => b.items);
      if (level.world !== "count") expect(new Set(all).size, level.id).toBe(all.length);
      else for (const b of level.baskets) expect(b.items.length, level.id).toBe(b.need);
      expect(level.baskets.length).toBeGreaterThanOrEqual(2);
      expect(level.baskets.length).toBeLessThanOrEqual(4);
      expect(itemCount(level)).toBeLessThanOrEqual(10);
      for (const id of all) expect(OBJECTS[objOf(id)], id).toBeDefined();
      expect(new Set(level.baskets.map((b) => b.id)).size, level.id).toBe(level.baskets.length);
    }
  });
  it("v10: size, counting and two-feature worlds come last and get harder", () => {
    const order = [...new Set(levels.map((l) => l.world))];
    expect(order.slice(-3)).toEqual(["size", "count", "cross"]);
    const mean = (w: string): number => {
      const ls = levels.filter((l) => l.world === w);
      return ls.reduce((s, l) => s + difficulty(l), 0) / ls.length;
    };
    expect(mean("count")).toBeGreaterThan(mean("size"));
    expect(mean("cross")).toBeGreaterThan(mean("count"));
    expect(mean("size")).toBeGreaterThan(mean("colors"));
    for (const w of ["size", "count", "cross"]) {
      const ls = levels.filter((l) => l.world === w);
      for (let i = 1; i < ls.length; i++) expect(difficulty(ls[i]!)).toBeGreaterThanOrEqual(difficulty(ls[i - 1]!));
    }
  });
  it("size baskets hold only things of their size; size worlds show each thing big and small", () => {
    for (const level of levels)
      for (const b of level.baskets) if (b.size) for (const id of b.items) expect(sizeOf(id), `${level.id} ${id}`).toBe(b.size);
    for (const level of levels.filter((l) => l.world === "size")) {
      const all = level.baskets.flatMap((b) => b.items as string[]);
      for (const id of all) expect(all).toContain(`${objOf(id)}:${sizeOf(id) === "big" ? "small" : "big"}`);
    }
  });
  it("counting baskets take any thing until full", () => {
    const level = levels.find((l) => l.id === "n1")!;
    expect(judge(level, "apple", "n1", 0)).toBe("placed");
    expect(judge(level, "apple", "n1", 1)).toBe("full");
    expect(judge(level, "apple", "n3", 2)).toBe("placed");
    expect(targetFor(level, "apple", new Map([["n1", 1]]))).toBe("n3");
    // A full play of every level: each thing to its basket (or the first that still needs one).
    for (const l of levels) {
      const fills = new Map<string, number>();
      for (const id of l.baskets.flatMap((b) => b.items as string[])) {
        const t = targetFor(l, id, fills)!;
        expect(judge(l, id, t, fills.get(t) ?? 0), `${l.id} ${id}`).toBe("placed");
        fills.set(t, (fills.get(t) ?? 0) + 1);
      }
    }
  });
  it("colour baskets hold only things of their colour", () => {
    for (const level of levels) {
      for (const basket of level.baskets) {
        if (!basket.sorts) continue;
        for (const id of basket.items) expect(OBJECTS[objOf(id)].color, `${level.id} ${id}`).toBe(basket.sorts);
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
    expect([starsFor(0, 4).stars, starsFor(1, 4).stars, starsFor(3, 4).stars, starsFor(5, 4).stars, starsFor(4, 4, 2).stars]).toEqual([3, 3, 2, 2, 1]);
  });
});
