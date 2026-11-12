import { describe, expect, it } from "vitest";
import { levels } from "./levels";
import { countWord, doneAll, findSlot, fits, overlaps, starsFor, toPlace, type Piece } from "./logic";

const slots: Piece[] = [
  { kind: "brick", color: "red", x: 0, y: 2, w: 2, h: 1 },
  { kind: "brick", color: "blue", x: 0, y: 1, w: 2, h: 1 },
  { kind: "wheel", color: "black", x: 3, y: 2, w: 1, h: 1 },
];

describe("stroyka rules", () => {
  it("matches shape first, then colour", () => {
    expect(fits({ kind: "brick", color: "red", w: 2, h: 1 }, slots[0]!)).toBe("ok");
    expect(fits({ kind: "brick", color: "blue", w: 2, h: 1 }, slots[0]!)).toBe("color");
    expect(fits({ kind: "brick", color: "red", w: 1, h: 1 }, slots[0]!)).toBe("shape");
    expect(fits({ kind: "num", color: "red", w: 2, h: 1, n: 2 }, { ...slots[0]!, kind: "num", n: 1 })).toBe("shape");
  });

  it("finds the nearest fitting place, or a same-shape place for a colour tip", () => {
    const filled = [false, false, false];
    expect(findSlot(slots, filled, { kind: "brick", color: "blue", w: 2, h: 1 }, { x: 1, y: 2.4 })).toEqual({ index: 1, fit: "ok" });
    expect(findSlot(slots, filled, { kind: "brick", color: "green", w: 2, h: 1 }, { x: 1, y: 2.5 })).toEqual({ index: 0, fit: "color" });
    expect(findSlot(slots, filled, { kind: "wheel", color: "black", w: 1, h: 1 }, { x: 0.5, y: 0 })).toBeNull();
    filled[1] = true;
    expect(findSlot(slots, filled, { kind: "brick", color: "blue", w: 2, h: 1 }, { x: 1, y: 1.5 })?.fit).toBe("color");
  });

  it("knows when the model is finished", () => {
    expect(doneAll(slots, [true, true, false])).toBe(false);
    expect(doneAll([...slots, { ...slots[0]!, fixed: true, y: 5 }], [true, true, true, false])).toBe(true);
    expect(starsFor(0, 0).stars).toBe(3);
    expect(starsFor(3, 1).stars).toBe(2);
    expect(starsFor(0, 2).stars).toBe(1);
    expect(countWord(6)).toBe("Шесть");
  });
});

describe("stroyka plans", () => {
  it("fit the grid, do not overlap and have a tray choice", () => {
    expect(new Set(levels.map((l) => l.id)).size).toBe(levels.length);
    for (const l of levels) {
      expect(overlaps(l.pieces.map((p) => ({ ...p, x: Math.floor(p.x) }))), l.title).toBe(false);
      for (const p of l.pieces) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.x + p.w).toBeLessThanOrEqual(l.cols);
        expect(p.y + p.h).toBeLessThanOrEqual(l.rows);
      }
      expect(toPlace(l.pieces)).toBeGreaterThanOrEqual(3);
      expect(toPlace(l.pieces)).toBeLessThanOrEqual(15);
    }
  });

  it("numbered wagons go 1…5 next to the engine", () => {
    const train = levels.find((l) => l.id === "s7")!;
    const nums = train.pieces.filter((p) => p.kind === "num").sort((a, b) => b.x - a.x);
    expect(nums.map((p) => p.n)).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("stroyka guests", () => {
  it("stand on the model or the ground, inside the board, only where the story needs them", async () => {
    const { levels } = await import("./levels");
    for (const plan of levels) {
      const g = plan.guest;
      if (!g) continue;
      expect(g.x).toBeGreaterThan(0);
      expect(g.x).toBeLessThan(plan.cols);
      expect(g.y).toBeLessThanOrEqual(plan.rows);
      expect(g.y - g.h).toBeGreaterThan(-0.5);
      if (g.ground) expect(g.y).toBe(plan.rows);
      else {
        // Feet on top of a block of the model.
        const under = plan.pieces.some((p) => p.y === g.y && g.x >= p.x && g.x <= p.x + p.w);
        expect(under, plan.id).toBe(true);
      }
    }
  });
});
