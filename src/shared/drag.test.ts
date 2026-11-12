import { describe, expect, it } from "vitest";
import { isTap, nearestWithin } from "./drag";

describe("nearestWithin", () => {
  const targets = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
  ];
  it("picks the closest target in reach", () => {
    expect(nearestWithin({ x: 80, y: 10 }, targets, 50)).toBe(1);
    expect(nearestWithin({ x: 10, y: 10 }, targets, 50)).toBe(0);
  });
  it("returns -1 when nothing is near", () => {
    expect(nearestWithin({ x: 50, y: 200 }, targets, 50)).toBe(-1);
  });
});

describe("isTap", () => {
  it("tells a tap from a drag", () => {
    expect(isTap(3, 4)).toBe(true);
    expect(isTap(12, 0)).toBe(false);
  });
});

import { dropHits, dropTarget, zonesOverlap, DROP_RATIO, type Box } from "./drag";

describe("v12 drop zones", () => {
  const tile = (left: number, top: number, s = 76): Box => ({ left, top, width: s, height: s });
  it("a drop counts on the tile itself (0.45 of its size), not beside it", () => {
    const row = [tile(0, 0), tile(87, 0)];
    expect(dropTarget({ x: 38, y: 38 }, row)).toBe(0);
    expect(dropTarget({ x: 125, y: 40 }, row)).toBe(1);
    // the tester's case: 50 px from a shadow's centre, on empty space
    expect(dropTarget({ x: 38 + 50, y: 38 }, row)).toBe(-1);
    expect(dropTarget({ x: 38, y: 38 + 50 }, row)).toBe(-1);
  });
  it("the right target is generous (its whole box), a wrong one strict", () => {
    const row = [tile(0, 0), tile(87, 0)];
    expect(dropHits({ x: 72, y: 70 }, row)).toEqual({ box: 0, zone: -1 });
  });
  it("zones of boxes that do not overlap never overlap (the old 0.7–0.79 reach did)", () => {
    const sizes = [44, 76, 100, 150];
    for (const s of sizes) {
      for (const gap of [0, 4, 11]) {
        const a = tile(0, 0, s);
        expect(zonesOverlap(a, tile(s + gap, 0, s)), `${s}/${gap}`).toBe(false);
        expect(zonesOverlap(a, tile(0, s + gap, s))).toBe(false);
        expect(zonesOverlap(a, { left: s + gap, top: 0, width: s * 2, height: s / 2 })).toBe(false);
      }
    }
    expect(zonesOverlap(tile(0, 0), tile(87, 0), 0.79)).toBe(true);
    expect(DROP_RATIO).toBeLessThan(0.5);
  });
});
