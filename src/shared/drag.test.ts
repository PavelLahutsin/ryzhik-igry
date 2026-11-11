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
