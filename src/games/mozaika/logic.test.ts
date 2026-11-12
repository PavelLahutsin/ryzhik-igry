import { describe, expect, it } from "vitest";
import { createRng } from "../../shared/rng";
import { scenes } from "../../shared/assets";
import { difficulty, levels } from "./levels";
import { hintPiece, layout, makePieces, pickExtra, pickFlipped, scatter, slotOf, snaps, starsFor, trayFits } from "./logic";

describe("mozaika", () => {
  it("has 15 levels of 4, 6, 9, 12 and 16 pieces in growing order", () => {
    const first = levels.slice(0, 15);
    expect(first.map((l) => l.id)).toEqual(Array.from({ length: 15 }, (_, i) => `m${i + 1}`));
    expect(new Set(first.map((l) => l.picture)).size).toBe(15);
    const counts = first.map((l) => l.cols * l.rows);
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
  it("keeps loose pieces apart on a landscape phone (QA: they piled up)", () => {
    for (const [c, r] of [[2, 2], [3, 2], [3, 3], [4, 3], [4, 4]]) {
      const l = layout(816, 300, c, r);
      expect(trayFits(c * r, l.tray, l.piece)).toBe(true);
      expect(l.board.w).toBeGreaterThan(250);
    }
    // Plenty of room: the board keeps its full size.
    expect(layout(358, 740, 4, 3).board.w).toBe(358);
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
    expect(starsFor(0, 4).stars).toBe(3);
    expect(starsFor(2, 4).stars).toBe(3);
    expect(starsFor(6, 4).stars).toBe(2);
    expect(starsFor(0, 4, 1).stars).toBe(2);
    expect(starsFor(20, 4).stars).toBe(1);
  });
  it("v10: new worlds — upside-down and extra pieces — keep ids and get harder", () => {
    expect(levels.map((l) => l.id)).toEqual(Array.from({ length: 22 }, (_, i) => `m${i + 1}`));
    const order = [...new Set(levels.map((l) => l.world))];
    const mean = (w: string): number => {
      const ls = levels.filter((l) => l.world === w);
      return ls.reduce((s, l) => s + difficulty(l), 0) / ls.length;
    };
    for (let i = 1; i < order.length; i++) expect(mean(order[i]!), order[i]).toBeGreaterThan(mean(order[i - 1]!));
    for (const l of levels) {
      if (l.drawn) expect(scenes[l.picture], l.picture).toBeTruthy();
      if (l.extra) {
        expect(scenes[l.extra.from], l.extra.from).toBeTruthy();
        expect(l.extra.from).not.toBe(l.picture);
      }
      expect(l.flip ?? 0).toBeLessThan(l.cols * l.rows);
    }
    // Inside the new worlds the hint goes first, then the faded picture.
    for (const w of ["flip", "extra"]) {
      const ls = levels.filter((l) => l.world === w);
      for (let i = 1; i < ls.length; i++) expect(difficulty(ls[i]!)).toBeGreaterThan(difficulty(ls[i - 1]!));
    }
  });
  it("turns some pieces over and cuts extra pieces from another picture", () => {
    const rnd = createRng(5);
    const f = pickFlipped(12, 4, rnd);
    expect(f.size).toBe(4);
    for (const i of f) expect(i).toBeLessThan(12);
    expect(pickFlipped(4, 9, rnd).size).toBe(3);
    const e = pickExtra(4, 4, 3, rnd);
    expect(new Set(e.map((p) => p.index)).size).toBe(3);
  });
  it("finds room for the extra pieces too, on every phone", () => {
    for (const [w, h] of [[358, 700], [328, 500], [816, 300]] as const) {
      for (const l of levels.filter((x) => x.extra)) {
        const g = layout(w, h, l.cols, l.rows, 16 / 9, l.extra!.count);
        expect(trayFits(l.cols * l.rows + l.extra!.count, g.tray, g.piece), `${l.id} ${w}x${h}`).toBe(true);
      }
    }
  });
});
