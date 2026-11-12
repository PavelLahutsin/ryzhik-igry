import { describe, expect, it } from "vitest";
import { allJoined, centroid, closestPair, difficulty, labelAt, labelOf, labelSpots, MIN_GAP, REACH, zones, startDots, starsFor, touch } from "./logic";
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
    expect(starsFor(8, 0).stars).toBe(2);
    expect(starsFor(5, 2).stars).toBe(1);
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
      expect(l.dots.length).toBeLessThanOrEqual(24);
      expect(closestPair(l.dots), l.title).toBeGreaterThanOrEqual(MIN_GAP);
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

  it("keep the old ids (progress is stored by id)", () => {
    const ids = new Set(levels.map((l) => l.id));
    for (let i = 1; i <= 14; i++) expect(ids.has(`t${i}`)).toBe(true);
  });

  it("label dots in a real counting order", () => {
    expect([0, 1, 2].map((i) => labelOf("down", i, 10))).toEqual(["10", "9", "8"]);
    expect([0, 1, 9].map((i) => labelOf(2, i, 10))).toEqual(["2", "4", "20"]);
    expect([0, 1].map((i) => labelOf(5, i, 12))).toEqual(["5", "10"]);
    expect([0, 9].map((i) => labelOf(10, i, 10))).toEqual(["10", "100"]);
    expect([0, 5, 6, 10].map((i) => labelOf("abc", i, 16))).toEqual(["А", "Е", "Ё", "Й"]);
    for (const l of levels) {
      const labels = l.dots.map((_, i) => labelOf(l.count, i, l.dots.length));
      expect(new Set(labels).size, l.title).toBe(labels.length);
      expect(labels.every((t) => t !== "?"), l.title).toBe(true);
    }
  });

  it("get harder world by world", () => {
    const order = [...new Set(levels.map((l) => l.world))];
    const mean = (w: string): number => {
      const ls = levels.filter((l) => l.world === w);
      return ls.reduce((s, l) => s + difficulty(l.dots.length, l.count), 0) / ls.length;
    };
    for (let i = 1; i < order.length; i++) expect(mean(order[i]!), order[i]).toBeGreaterThan(mean(order[i - 1]!));
    expect(levels.length).toBeGreaterThanOrEqual(29);
  });

  it("put every label clear of the other dots", () => {
    for (const l of levels) {
      const spots = labelSpots(l.dots);
      spots.forEach((t, i) => {
        const near = Math.min(...l.dots.filter((_, j) => j !== i).map((d) => Math.hypot(d.x - t.x, d.y - t.y)));
        expect(near, `${l.title} ${i + 1}`).toBeGreaterThanOrEqual(10);
      });
    }
  });
  it("touch zones never overlap, in every picture, and stay big enough", () => {
    for (const l of levels) {
      const z = zones(l.dots);
      for (let i = 0; i < l.dots.length; i++) {
        expect(z[i]!, `${l.title} ${i}`).toBeGreaterThanOrEqual(MIN_GAP / 2);
        expect(z[i]!).toBeLessThanOrEqual(REACH);
        for (let j = i + 1; j < l.dots.length; j++) {
          const d = Math.hypot(l.dots[i]!.x - l.dots[j]!.x, l.dots[i]!.y - l.dots[j]!.y);
          expect(z[i]! + z[j]!, `${l.title}: ${i}–${j}`).toBeLessThanOrEqual(d + 1e-9);
        }
      }
    }
  });
  it("a touch in a dot's zone is that dot only: the right one joins, a wrong tap is the only mistake", () => {
    for (const l of levels) {
      const st = startDots();
      // Tap each dot a little off-centre (inside its zone), in order: no mistakes.
      const z = zones(l.dots);
      l.dots.forEach((d, i) => expect(touch(l.dots, st, { x: d.x + z[i]! * 0.7, y: d.y }, true)).toBe(i));
      expect(st.misses).toBe(0);
    }
    const l = levels[0]!;
    const st = startDots();
    touch(l.dots, st, { x: -50, y: -50 }, true); // empty paper
    expect(st.misses).toBe(0);
    touch(l.dots, st, l.dots[2]!, true); // a wrong dot
    expect(st.misses).toBe(1);
  });
  it("keep the new pictures' numbers on the board", () => {
    for (const l of levels.filter((x) => ["f1", "f2", "g3"].includes(x.id)))
      for (const p of labelSpots(l.dots)) {
        expect(p.x, l.title).toBeGreaterThanOrEqual(4);
        expect(p.x, l.title).toBeLessThanOrEqual(196);
      }
  });
});
