import { describe, expect, it } from "vitest";
import { advance, countedSlips, numberWord, offTrack, resample, splitSubpaths, starsFor, strokeDone } from "./logic";
import { levels as letters } from "../bukvy/letters";
import { levels, worlds } from "./pictures";
import { levelOpen, orderAfter, playOrder } from "../../shared/progress";

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
  it("has 51 pictures, old ids first so progress keeps working (v17: r31–r51 added at the end)", () => {
    expect(levels).toHaveLength(51);
    expect(levels.map((l) => l.id)).toEqual(Array.from({ length: 51 }, (_, i) => `r${i + 1}`));
    expect(new Set(levels.map((l) => l.title)).size).toBe(levels.length);
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
    // v17: checked in the order the child plays (world by world), not the array order.
    const rank = { full: 0, next: 1, less: 2 } as const;
    const ranks = playOrder(levels).map((l) => rank[l.help ?? "full"]);
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
  it("v17: new pictures play inside their world: listed there, opened after its last level, «Дальше» goes on in that order", () => {
    const order = playOrder(levels);
    const worldIds = worlds.map((w) => w.id);
    // World by world, in the worlds' order; old pictures first inside a world.
    expect(order.map((l) => worldIds.indexOf(l.world!))).toEqual([...order.map((l) => worldIds.indexOf(l.world!))].sort((a, b) => a - b));
    const ids = order.map((l) => l.id);
    expect(ids.slice(4, 18)).toEqual(["r5", "r6", "r7", "r8", "r9", "r10", "r11", "r12", "r31", "r32", "r33", "r34", "r35", "r47"]);
    expect(ids.at(-1)).toBe("r30");
    const after = orderAfter(levels);
    expect(after).toEqual({ r31: "r12", r13: "r47", r36: "r18", r19: "r48", r42: "r24", r25: "r51", r47: "r35", r48: "r41", r49: "r46" });
    // Each level opens once the one before it in play order is won.
    for (let i = 1; i < order.length; i++) {
      const won = ids.slice(0, i);
      expect(levelOpen(levels, ids[i]!, won, { after }), ids[i]).toBe(true);
      expect(levelOpen(levels, ids[i]!, ids.slice(0, i - 1), { after }), ids[i]).toBe(false);
    }
    // A child who already won r1–r30 sees the new ones open in every world.
    const old = Array.from({ length: 30 }, (_, i) => `r${i + 1}`);
    for (const id of ["r31", "r36", "r42"]) expect(levelOpen(levels, id, old, { after })).toBe(true);
    // Stroke counts per world for the new pictures, all inside the 12–188 box.
    const lim: Record<string, [number, number]> = { animals: [2, 3], harder: [4, 5], master: [6, 7] };
    for (const l of levels.slice(30)) {
      const [lo, hi] = lim[l.world!]!;
      expect(l.strokes.length, l.title).toBeGreaterThanOrEqual(lo);
      expect(l.strokes.length, l.title).toBeLessThanOrEqual(hi);
      expect(l.done, l.title).toMatch(/!$/);
      expect(l.done, l.title).not.toMatch(/\bты\b|нарисовал/i);
      for (const d of l.strokes) {
        expect(d, l.title).not.toMatch(/[a-zZ]/);
        for (const n of d.match(/-?\d+(\.\d+)?/g)!.map(Number).filter((n) => n > 1)) {
          expect(n, `${l.title}: ${d}`).toBeGreaterThanOrEqual(12);
          expect(n, `${l.title}: ${d}`).toBeLessThanOrEqual(188);
        }
      }
    }
  });
});
