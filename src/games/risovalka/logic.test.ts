import { describe, expect, it } from "vitest";
import { advance, numberWord, offTrack, resample, starsFor, strokeDone } from "./logic";
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
    expect(starsFor(0, 0)).toBe(3);
    expect(starsFor(5, 0)).toBe(2);
    expect(starsFor(3, 3)).toBe(1);
    expect(numberWord(3)).toBe("Три");
  });
  it("has 12 pictures and 9 digits with strokes", () => {
    expect(levels).toHaveLength(21);
    expect(new Set(levels.map((l) => l.id)).size).toBe(21);
    for (const l of levels) {
      expect(l.strokes.length).toBeGreaterThan(0);
      for (const d of l.strokes) expect(d).toMatch(/^M[\d. ]+/);
      expect(worlds.some((w) => w.id === l.world)).toBe(true);
    }
  });
});
