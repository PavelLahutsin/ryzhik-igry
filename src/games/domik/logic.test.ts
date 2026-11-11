import { describe, expect, it } from "vitest";
import { clampFoot, cycle, fitWorld, nearestSeat, react, WORLD_H, WORLD_W } from "./logic";
import { allFinds, SCENES } from "./scenes";

describe("domik", () => {
  it("fits the whole scene on wide screens and scrolls on tall phones", () => {
    const wide = fitWorld(1280, 700);
    expect(wide.scroll).toBe(false);
    expect(wide.w / wide.h).toBeCloseTo(WORLD_W / WORLD_H);
    expect(fitWorld(390, 700).scroll).toBe(true);
    const side = fitWorld(800, 300);
    expect(side.h).toBeGreaterThan(300);
    expect(side.w).toBeLessThanOrEqual(800);
  });
  it("snaps to a free seat nearby only", () => {
    const seats = [{ id: "bed", x: 100, y: 100, pose: "sleep" as const }];
    expect(nearestSeat(seats, 150, 120, new Set())?.id).toBe("bed");
    expect(nearestSeat(seats, 150, 120, new Set(["bed"]))).toBeNull();
    expect(nearestSeat(seats, 600, 600, new Set())).toBeNull();
  });
  it("everyone eats, the favourite gets hearts, toys are for play", () => {
    expect(react("belka", "cone")).toBe("love");
    expect(react("belka", "apple")).toBe("yum");
    expect(react("mishka", "ball")).toBe("play");
  });
  it("keeps characters in the world and cycles counters", () => {
    expect(clampFoot(-50, 100, 600)).toEqual({ x: 60, y: 600 });
    expect(cycle(3, 4)).toBe(0);
  });
  it("has three scenes with unique props and a list of finds", () => {
    expect(SCENES.map((s) => s.id)).toEqual(["dom", "sad", "les"]);
    const finds = allFinds();
    expect(new Set(finds).size).toBe(finds.length);
    expect(finds.length).toBeGreaterThan(20);
    for (const scene of SCENES) {
      for (const p of scene.props) {
        expect(p.x + p.w, p.id).toBeLessThanOrEqual(WORLD_W);
        expect(p.art({ night: false, n: p.n ?? 0, on: false })).toContain("<svg");
        expect(p.art({ night: true, n: 0, on: true })).toContain("<svg");
      }
    }
  });
});
