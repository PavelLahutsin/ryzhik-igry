import { describe, expect, it } from "vitest";
import { allJoined, centroid, closestPair, labelAt, REACH, startDots, starsFor, touch } from "./logic";
import { levels, worlds } from "./levels";

const dots = [
  { x: 10, y: 10 },
  { x: 100, y: 10 },
  { x: 100, y: 100 },
];

describe("tochki rules", () => {
  it("joins dots only in order", () => {
    const s = startDots();
    expect(touch(dots, s, { x: 100, y: 100 }, true)).toBeNull();
    expect(s.misses).toBe(1);
    expect(touch(dots, s, { x: 12, y: 8 }, true)).toBe(0);
    expect(touch(dots, s, { x: 98, y: 12 }, false)).toBe(1);
    expect(allJoined(dots, s)).toBe(false);
    expect(touch(dots, s, { x: 100, y: 100 }, false)).toBe(2);
    expect(allJoined(dots, s)).toBe(true);
    expect(touch(dots, s, { x: 10, y: 10 }, true)).toBeNull();
  });

  it("does not count sliding over other dots or empty taps as misses", () => {
    const s = startDots();
    touch(dots, s, { x: 100, y: 100 }, false);
    touch(dots, s, { x: 50, y: 60 }, true);
    expect(s.misses).toBe(0);
  });

  it("gives stars for few misses", () => {
    expect(starsFor(0, 0).stars).toBe(3);
    expect(starsFor(1, 0).stars).toBe(3);
    expect(starsFor(1, 1).stars).toBe(2);
    expect(starsFor(8, 0).stars).toBe(1);
  });

  it("puts numbers outside the shape", () => {
    const m = centroid(dots);
    const l = labelAt(dots[0]!, m);
    expect(Math.hypot(l.x - m.x, l.y - m.y)).toBeGreaterThan(Math.hypot(dots[0]!.x - m.x, dots[0]!.y - m.y));
  });
});

describe("tochki levels", () => {
  it("have unique ids, known worlds and tappable dots inside the box", () => {
    expect(new Set(levels.map((l) => l.id)).size).toBe(levels.length);
    for (const l of levels) {
      expect(worlds.some((w) => w.id === l.world)).toBe(true);
      expect(l.dots.length).toBeGreaterThanOrEqual(5);
      expect(l.dots.length).toBeLessThanOrEqual(20);
      expect(closestPair(l.dots), l.title).toBeGreaterThan(REACH * 0.9);
      for (const d of l.dots) {
        expect(d.x).toBeGreaterThanOrEqual(8);
        expect(d.x).toBeLessThanOrEqual(192);
        expect(d.y).toBeGreaterThanOrEqual(8);
        expect(d.y).toBeLessThanOrEqual(192);
      }
    }
  });

  it("count up to 10 first, then further", () => {
    for (const l of levels.filter((l) => l.world === "ten")) expect(l.dots.length).toBeLessThanOrEqual(10);
    expect(levels.filter((l) => l.world === "more").every((l) => l.dots.length > 10)).toBe(true);
  });
});
