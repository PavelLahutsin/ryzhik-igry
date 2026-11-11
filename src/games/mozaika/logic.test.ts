import { describe, expect, it } from "vitest";
import { createRng } from "../../shared/rng";
import { levels } from "./levels";
import { hintPiece, layout, makePieces, scatter, slotOf, snaps, starsFor } from "./logic";

describe("mozaika", () => {
  it("has 15 levels of 4, 6, 9, 12 and 16 pieces in growing order", () => {
    expect(levels).toHaveLength(15);
    expect(new Set(levels.map((l) => l.picture)).size).toBe(15);
    const counts = levels.map((l) => l.cols * l.rows);
    expect(new Set(counts)).toEqual(new Set([4, 6, 9, 12, 16]));
    expect([...counts].sort((a, b) => a - b)).toEqual(counts);
  });
  it("cuts the picture into a full grid", () => {
    const pieces = makePieces(4, 3);
    expect(pieces).toHaveLength(12);
    expect(pieces[5]).toEqual({ index: 5, col: 1, row: 1 });
  });
  it("fits board and tray into a phone screen", () => {
    const l = layout(358, 740, 4, 3);
    expect(l.board.w).toBeLessThanOrEqual(358);
    expect(l.tray.y).toBeGreaterThan(l.board.h);
    expect(l.tray.y + l.tray.h).toBeLessThanOrEqual(740);
    const wide = layout(1000, 500, 3, 3);
    expect(wide.tray.x).toBeGreaterThan(wide.board.w);
  });
  it("scatters pieces inside the tray", () => {
    const l = layout(358, 740, 4, 3);
    const spots = scatter(12, l.tray, l.piece, createRng(3));
    for (const s of spots) {
      expect(s.x).toBeGreaterThanOrEqual(l.tray.x);
      expect(s.x + l.piece.w).toBeLessThanOrEqual(l.tray.x + l.tray.w + 0.01);
      expect(s.y).toBeGreaterThanOrEqual(l.tray.y);
      expect(s.y + l.piece.h).toBeLessThanOrEqual(l.tray.y + l.tray.h + 0.01);
    }
  });
  it("snaps near home and not far away", () => {
    const l = layout(358, 740, 2, 2);
    const home = slotOf({ index: 3, col: 1, row: 1 }, l.board, l.piece);
    const c = { x: home.x + l.piece.w / 2, y: home.y + l.piece.h / 2 };
    expect(snaps({ x: c.x + 20, y: c.y - 10 }, home, l.piece)).toBe(true);
    expect(snaps({ x: c.x - l.piece.w, y: c.y }, home, l.piece)).toBe(false);
  });
  it("places a hinted piece among the loose ones only", () => {
    expect(hintPiece([0, 1, 2, 3], new Set([0, 2]), () => 0)).toBe(1);
    expect(hintPiece([0, 1], new Set([0, 1]), () => 0)).toBe(-1);
  });
  it("gives stars kindly", () => {
    expect(starsFor(0, 4)).toBe(3);
    expect(starsFor(4, 4)).toBe(3);
    expect(starsFor(7, 4)).toBe(2);
    expect(starsFor(20, 4)).toBe(1);
  });
});
