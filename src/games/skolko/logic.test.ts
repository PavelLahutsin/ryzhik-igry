import { describe, expect, it } from "vitest";
import { createRng } from "../../shared/rng";
import { VOICE_LINES } from "../../shared/voice-lines";
import { COUNT_LEVELS, MORE_LEVELS, SKOLKO_LEVELS } from "./levels";
import { countRounds, countVoice, moreRounds, spotsFor } from "./logic";
import { COUNT_THINGS, countArt } from "./things";
import { OBJECTS } from "../../shared/objects";

describe("«Сколько?» v23", () => {
  it("has 18 count levels and 15 compare levels with unique ids and titles", () => {
    expect(COUNT_LEVELS.length).toBe(18);
    expect(MORE_LEVELS.length).toBe(15);
    expect(new Set(SKOLKO_LEVELS.map((l) => l.id)).size).toBe(SKOLKO_LEVELS.length);
    expect(new Set(SKOLKO_LEVELS.map((l) => l.title)).size).toBe(SKOLKO_LEVELS.length);
    for (const l of SKOLKO_LEVELS) {
      expect(l.title.split(" ").length, l.id).toBeLessThanOrEqual(3);
      expect(l.title, l.id).not.toMatch(/\d/);
      for (const t of l.things) expect(countArt(t), `${l.id} ${t}`).toBeTruthy();
    }
  });
  it("count levels: numbers in range, options fit, the field never overlaps", () => {
    for (const l of COUNT_LEVELS) {
      expect(l.min).toBeLessThanOrEqual(l.max);
      expect(l.max).toBeLessThanOrEqual(10);
      expect(l.options).toBeLessThanOrEqual(l.max - l.min + 1);
      for (let seed = 1; seed <= 30; seed++) {
        const rounds = countRounds(l, createRng(seed));
        expect(rounds.length).toBe(l.rounds);
        rounds.forEach((r, i) => {
          expect(r.n).toBeGreaterThanOrEqual(l.min);
          expect(r.n).toBeLessThanOrEqual(l.max);
          expect(r.things.length).toBe(r.n);
          expect(r.options[r.answer]).toBe(r.n);
          expect(new Set(r.options).size).toBe(l.options);
          expect(r.spots.length).toBe(r.n);
          if (i > 0 && l.max > l.min) expect(r.n).not.toBe(rounds[i - 1]!.n);
          if (l.mixKinds && r.n >= l.things.length) for (const k of l.things) expect(r.things).toContain(k);
        });
      }
    }
    // The first two levels: only 1 and 2 (start with two numbers).
    expect(COUNT_LEVELS.slice(0, 2).every((l) => l.max === 2)).toBe(true);
  });
  it("lays out up to ten things without touching", () => {
    for (const layout of ["row", "dice", "scatter"] as const)
      for (let n = 1; n <= 10; n++) {
        const pts = spotsFor(layout, n, createRng(n * 13));
        expect(pts.length).toBe(n);
        for (const [x, y] of pts) {
          expect(x).toBeGreaterThanOrEqual(0);
          expect(x).toBeLessThanOrEqual(100);
          expect(y).toBeGreaterThanOrEqual(0);
          expect(y).toBeLessThanOrEqual(100);
        }
        for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) expect(Math.hypot(pts[i]![0] - pts[j]![0], pts[i]![1] - pts[j]![1]), `${layout} ${n}`).toBeGreaterThan(9);
      }
  });
  it("compare levels: one question each, the answer on both sides, differences shrink", () => {
    expect(MORE_LEVELS.slice(0, 10).every((l) => l.want === "more")).toBe(true);
    expect(MORE_LEVELS.slice(10).every((l) => l.want === "less")).toBe(true);
    for (const l of MORE_LEVELS) {
      const rounds = moreRounds(l);
      expect(rounds.length).toBeGreaterThanOrEqual(4);
      expect(rounds.some((r) => r.answer === "left") && rounds.some((r) => r.answer === "right"), l.id).toBe(true);
      for (const [a, b] of l.pairs) {
        expect(a).not.toBe(b);
        expect(Math.max(a, b)).toBeLessThanOrEqual(10);
      }
      if (l.bigFew) expect(l.same).toBe(false);
      expect(l.ask).toBe(VOICE_LINES[l.want === "more" ? "v131" : "v132"]);
    }
    const gap = (l: (typeof MORE_LEVELS)[number]): number => l.pairs.reduce((s, [a, b]) => s + Math.abs(a - b), 0) / l.pairs.length;
    for (const part of [MORE_LEVELS.slice(0, 10), MORE_LEVELS.slice(10)]) for (let i = 1; i < part.length; i++) expect(gap(part[i]!), part[i]!.id).toBeLessThanOrEqual(gap(part[i - 1]!));
  });
  it("counts aloud one to ten, and the new things are new", () => {
    for (let n = 1; n <= 10; n++) expect(VOICE_LINES[countVoice(n)!]).toBeTruthy();
    expect(VOICE_LINES[countVoice(7)!]).toBe("Семь!");
    for (const [k, v] of Object.entries(COUNT_THINGS)) {
      expect(k in OBJECTS, k).toBe(false);
      expect(v.svg).toMatch(/^<svg viewBox="0 0 100 100"/);
      expect(v.svg).not.toMatch(/<text|<image|href|url\(|http(?!:\/\/www\.w3\.org)/);
    }
  });
});
