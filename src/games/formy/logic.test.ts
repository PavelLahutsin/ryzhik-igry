import { describe, expect, it } from "vitest";
import { OBJECTS } from "../../shared/objects";
import { THINGS } from "./art";
import { levels, worlds } from "./levels";
import { canStack, matches, nextRing, pickTarget, shapePath, starsFor, type Shape } from "./logic";

describe("formy rules", () => {
  it("matches keys", () => {
    expect(matches("big", "big")).toBe("ok");
    expect(matches("big", "small")).toBe("wrong");
    expect(matches("big", null)).toBe("none");
  });

  it("stacks pyramid rings biggest first", () => {
    const pole: number[] = [];
    expect(nextRing(pole, 4)).toBe(4);
    expect(canStack(pole, 4, 3)).toBe(false);
    expect(canStack(pole, 4, 4)).toBe(true);
    pole.push(4, 3, 2);
    expect(canStack(pole, 4, 1)).toBe(true);
    pole.push(1);
    expect(nextRing(pole, 4)).toBe(0);
  });

  it("gives stars by slips for the level size", () => {
    expect(starsFor(0, 0, 6)).toBe(3);
    expect(starsFor(1, 0, 6)).toBe(3);
    expect(starsFor(3, 0, 6)).toBe(2);
    expect(starsFor(2, 2, 6)).toBe(1);
  });

  it("draws every shape as a closed path", () => {
    for (const s of ["circle", "square", "triangle", "star", "heart", "rhombus"] as Shape[]) {
      const d = shapePath(s, 50, 50, 40);
      expect(d.startsWith("M")).toBe(true);
      expect(d.trim().endsWith("Z")).toBe(true);
      expect(d).not.toContain("NaN");
    }
  });
});

describe("formy levels", () => {
  it("are well formed", () => {
    expect(new Set(levels.map((l) => l.id)).size).toBe(levels.length);
    for (const l of levels) {
      expect(worlds.some((w) => w.id === l.world)).toBe(true);
      if (l.mode === "family") {
        expect(l.sizes.length).toBeGreaterThanOrEqual(2);
        for (const o of l.objects) expect(OBJECTS[o]).toBeTruthy();
      }
      if (l.mode === "pyramid") expect(l.rings).toBeGreaterThanOrEqual(3);
      if (l.mode === "sorter") expect(new Set(l.shapes).size).toBe(l.shapes.length);
      if (l.mode === "things")
        for (const t of l.things) {
          expect(l.baskets).toContain(t.shape);
          expect(t.id === "ball" || t.id === "cube" || t.id in THINGS).toBe(true);
        }
    }
  });
});

describe("pickTarget", () => {
  it("picks the nearest of overlapping family members", () => {
    const papa = { left: 0, top: 0, width: 160, height: 400 };
    const mama = { left: 130, top: 100, width: 130, height: 300 };
    expect(pickTarget({ x: 150, y: 380 }, [papa, mama])).toBe(1);
    expect(pickTarget({ x: 60, y: 380 }, [papa, mama])).toBe(0);
    expect(pickTarget({ x: 500, y: 380 }, [papa, mama])).toBe(-1);
  });
});
