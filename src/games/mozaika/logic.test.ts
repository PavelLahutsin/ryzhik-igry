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
      expect(trayFits(l.visible, l.tray, l.piece)).toBe(true);
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
    expect(starsFor(20, 4).stars).toBe(2);
    expect(starsFor(5, 4, 2).stars).toBe(1);
  });
  it("v10: new worlds — upside-down and extra pieces — keep ids and get harder", () => {
    expect([...levels.map((l) => l.id)].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))).toEqual(Array.from({ length: 23 }, (_, i) => `m${i + 1}`));
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
        const g = layout(w, h, l.cols, l.rows, 16 / 9, l.extra!.count, 1);
        expect(trayFits(g.visible + 1, g.tray, g.piece), `${l.id} ${w}x${h}`).toBe(true);
      }
    }
  });
});

import { onCell } from "./logic";
describe("v12: drops between places", () => {
  it("a seam between two places is no place (no mistake)", () => {
    const board = { x: 0, y: 0, w: 300, h: 200 };
    const size = { w: 100, h: 100 };
    expect(onCell({ x: 50, y: 50 }, board, size)).toBe(true);
    expect(onCell({ x: 99, y: 50 }, board, size)).toBe(false);
    expect(onCell({ x: 250, y: 150 }, board, size)).toBe(true);
    expect(onCell({ x: 350, y: 150 }, board, size)).toBe(false);
    expect(snaps({ x: 140, y: 50 }, { x: 100, y: 0 }, { w: 100, h: 50 })).toBe(false);
  });
});

import { MIN_PIECE, MIN_VISIBLE, trayCapacity } from "./logic";
describe("v12 Мозаика", () => {
  // The play area (.mz-area) measured on the phones of the QA script.
  const AREAS: Record<string, [number, number]> = { "844x390": [812, 316], "390x844": [358, 738], "360x640": [328, 534] };
  it("pieces stay big: ≥ MIN_PIECE in landscape (the tray streams), and as big as a 16:9 board allows upright", () => {
    for (const l of levels) {
      const extra = l.extra?.count ?? 0;
      const basket = extra ? 1 : 0;
      for (const [vp, [w, h]] of Object.entries(AREAS)) {
        const g = layout(w, h, l.cols, l.rows, 16 / 9, extra, basket);
        const side = Math.min(g.piece.w, g.piece.h);
        const where = `${l.id} ${vp}`;
        // every loose piece that is shown has room, the basket too
        expect(trayCapacity(g.tray, g.piece) - basket, where).toBeGreaterThanOrEqual(g.visible);
        expect(g.visible, where).toBeGreaterThanOrEqual(Math.min(MIN_VISIBLE, l.cols * l.rows + extra));
        if (vp === "844x390") expect(side, where).toBeGreaterThanOrEqual(MIN_PIECE);
        else {
          // upright the board is as wide as the screen allows: 16:9 cut in `rows` rows
          const best = Math.min(w, h * 0.48 * (16 / 9)) / (16 / 9) / l.rows;
          expect(side, where).toBeGreaterThanOrEqual(Math.min(MIN_PIECE, best) - 1);
          expect(side, where).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });
  it("«Вверх ногами» starts gently: 6 pieces, one upside down", () => {
    const flip = levels.filter((l) => l.world === "flip");
    expect(flip[0]!.cols * flip[0]!.rows).toBe(6);
    expect(flip[0]!.flip).toBe(1);
  });
});
