import { describe, expect, it } from "vitest";
import { advance, countedSlips, numberWord, offTrack, resample, splitSubpaths, starsFor, strokeDone } from "./logic";
import { levels as letters } from "../bukvy/letters";
import { levels, worlds } from "./pictures";

const line = resample([
  { x: 0, y: 0 },
  { x: 100, y: 0 },
]);

describe("risovalka", () => {
  it("samples a line evenly", () => {
    expect(line[0]).toEqual({ x: 0, y: 0 });
    expect(line[line.length - 1]).toEqual({ x: 100, y: 0 });
    expect(line.length).toBeGreaterThan(30);
  });
  it("moves forward only when the finger is on the line just ahead", () => {
    let i = 0;
    i = advance(line, i, { x: 20, y: 5 });
    expect(i).toBeGreaterThan(3);
    const before = i;
    expect(advance(line, i, { x: 95, y: 0 })).toBe(before); // too far ahead: no jumping
    expect(advance(line, i, { x: 0, y: 0 })).toBe(before); // never goes back
    expect(advance(line, i, { x: 25, y: 40 })).toBe(before); // off the line
  });
  it("can trace the whole line and notices slips", () => {
    let i = 0;
    for (let x = 0; x <= 100; x += 5) i = advance(line, i, { x, y: 3 });
    expect(strokeDone(line, i)).toBe(true);
    expect(offTrack(line, 10, { x: 30, y: 80 })).toBe(true);
    expect(offTrack(line, 10, { x: 30, y: 4 })).toBe(false);
  });
  it("is kind with stars and knows number words", () => {
    expect(starsFor(0, 0).stars).toBe(3);
    expect(starsFor(5, 0).stars).toBe(2);
    expect(starsFor(3, 3).stars).toBe(2);
    expect(starsFor(7, 2).stars).toBe(1);
    expect(numberWord(3)).toBe("Три");
  });
  it("has 30 pictures, old ids first so progress keeps working", () => {
    expect(levels).toHaveLength(30);
    expect(levels.map((l) => l.id)).toEqual(Array.from({ length: 30 }, (_, i) => `r${i + 1}`));
    for (const l of levels) {
      expect(l.strokes.length).toBeGreaterThan(0);
      for (const d of l.strokes) expect(d).toMatch(/^M[\d. ]+/);
      expect(worlds.some((w) => w.id === l.world)).toBe(true);
    }
  });
  it("gets harder: more lines in later worlds, less help at the end", () => {
    const avg = (w: string): number => {
      const list = levels.filter((l) => l.world === w);
      return list.reduce((n, l) => n + l.strokes.length, 0) / list.length;
    };
    expect(avg("first")).toBeLessThan(avg("harder"));
    expect(avg("animals")).toBeLessThan(avg("harder"));
    expect(avg("harder")).toBeLessThan(avg("master"));
    // Help goes away step by step: full help → only the current line (arrow
    // kept) → only the current line, no arrow. It never comes back.
    const rank = { full: 0, next: 1, less: 2 } as const;
    const ranks = levels.map((l) => rank[l.help ?? "full"]);
    for (let i = 1; i < ranks.length; i++) expect(ranks[i]!).toBeGreaterThanOrEqual(ranks[i - 1]!);
    for (const l of levels) expect(l.help !== undefined).toBe(l.world === "master" || l.world === "paths");
    expect(levels.filter((l) => l.help === "next").map((l) => l.id)).toEqual(["r19", "r20", "r21"]);
    // «Длинные дорожки»: the longest lines of the game, drawn without lifting the finger.
    const len = (d: string): number => d.length;
    const longest = (w: string): number => Math.max(...levels.filter((l) => l.world === w).flatMap((l) => l.strokes.map(len)));
    expect(longest("paths")).toBeGreaterThan(longest("first"));
    for (const l of levels.filter((x) => x.world === "master")) expect(l.strokes.length).toBeGreaterThanOrEqual(5);
  });
  it("v13: slips in «Первые рисунки» cost no star", () => {
    expect(starsFor(countedSlips("first", 9), 0).stars).toBe(3);
    expect(starsFor(countedSlips("animals", 9), 0).stars).toBeLessThan(3);
    expect(countedSlips(undefined, 4)).toBe(4);
  });
  it("v14: every line to trace is one subpath (both wings of «Сова» are two lines)", () => {
    expect(splitSubpaths("M1 2 L3 4 M5 6 L7 8")).toEqual(["M1 2 L3 4", "M5 6 L7 8"]);
    expect(splitSubpaths("M1 2 L3 4")).toEqual(["M1 2 L3 4"]);
    for (const l of [...levels, ...letters])
      for (const d of l.strokes.flatMap(splitSubpaths)) {
        expect(d.startsWith("M"), `${l.id}: ${d}`).toBe(true);
        expect(/[Mm]/.test(d.slice(1)), `${l.id}: ${d}`).toBe(false);
      }
    const owl = levels.find((l) => l.title === "Сова")!;
    const lines = owl.strokes.flatMap(splitSubpaths);
    expect(lines).toHaveLength(7);
    expect(lines.slice(-2)).toEqual(["M44 120 C 30 130 32 150 48 156", "M156 120 C 170 130 168 150 152 156"]);
  });
});
