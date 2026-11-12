import { describe, expect, it } from "vitest";
import { difficulty, levels, worlds } from "./levels";
import { countWord, doneAll, findSlot, fits, overlaps, starsFor, toPlace, type Piece } from "./logic";

const slots: Piece[] = [
  { kind: "brick", color: "red", x: 0, y: 2, w: 2, h: 1 },
  { kind: "brick", color: "blue", x: 0, y: 1, w: 2, h: 1 },
  { kind: "wheel", color: "black", x: 3, y: 2, w: 1, h: 1 },
];

describe("stroyka rules", () => {
  it("matches shape first, then colour", () => {
    expect(fits({ kind: "brick", color: "red", w: 2, h: 1 }, slots[0]!)).toBe("ok");
    expect(fits({ kind: "brick", color: "blue", w: 2, h: 1 }, slots[0]!)).toBe("color");
    expect(fits({ kind: "brick", color: "red", w: 1, h: 1 }, slots[0]!)).toBe("shape");
    expect(fits({ kind: "num", color: "red", w: 2, h: 1, n: 2 }, { ...slots[0]!, kind: "num", n: 1 })).toBe("shape");
  });

  it("finds the nearest fitting place, or a same-shape place for a colour tip", () => {
    const filled = [false, false, false];
    expect(findSlot(slots, filled, { kind: "brick", color: "blue", w: 2, h: 1 }, { x: 1, y: 2.4 })).toEqual({ index: 1, fit: "ok" });
    expect(findSlot(slots, filled, { kind: "brick", color: "green", w: 2, h: 1 }, { x: 1, y: 2.5 })).toEqual({ index: 0, fit: "color" });
    expect(findSlot(slots, filled, { kind: "wheel", color: "black", w: 1, h: 1 }, { x: 0.5, y: 0 })).toBeNull();
    filled[1] = true;
    expect(findSlot(slots, filled, { kind: "brick", color: "blue", w: 2, h: 1 }, { x: 1, y: 1.5 })?.fit).toBe("color");
  });

  it("knows when the model is finished", () => {
    expect(doneAll(slots, [true, true, false])).toBe(false);
    expect(doneAll([...slots, { ...slots[0]!, fixed: true, y: 5 }], [true, true, true, false])).toBe(true);
    expect(starsFor(0, 0).stars).toBe(3);
    expect(starsFor(3, 1).stars).toBe(2);
    expect(starsFor(0, 2).stars).toBe(1);
    expect(countWord(6)).toBe("Шесть");
  });
});

describe("stroyka plans", () => {
  it("fit the grid, do not overlap and have a tray choice", () => {
    expect(new Set(levels.map((l) => l.id)).size).toBe(levels.length);
    for (const l of levels) {
      expect(overlaps(l.pieces.map((p) => ({ ...p, x: Math.floor(p.x) }))), l.title).toBe(false);
      for (const p of l.pieces) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.x + p.w).toBeLessThanOrEqual(l.cols);
        expect(p.y + p.h).toBeLessThanOrEqual(l.rows);
      }
      expect(toPlace(l.pieces)).toBeGreaterThanOrEqual(3);
      expect(toPlace(l.pieces)).toBeLessThanOrEqual(15);
      expect(worlds.some((w) => w.id === l.world), l.id).toBe(true);
    }
  });

  it("numbered wagons go 1…5 next to the engine", () => {
    const train = levels.find((l) => l.id === "s7")!;
    const nums = train.pieces.filter((p) => p.kind === "num").sort((a, b) => b.x - a.x);
    expect(nums.map((p) => p.n)).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("stroyka guests", () => {
  it("stand on the model or the ground, inside the board, only where the story needs them", async () => {
    const { levels } = await import("./levels");
    for (const plan of levels) {
      const g = plan.guest;
      if (!g) continue;
      expect(g.x).toBeGreaterThan(0);
      expect(g.x).toBeLessThan(plan.cols);
      expect(g.y).toBeLessThanOrEqual(plan.rows);
      expect(g.y - g.h).toBeGreaterThan(-0.5);
      if (g.ground) expect(g.y).toBe(plan.rows);
      else {
        // Feet on top of a block of the model.
        const under = plan.pieces.some((p) => p.y === g.y && g.x >= p.x && g.x <= p.x + p.w);
        expect(under, plan.id).toBe(true);
      }
    }
  });
});

describe("stroyka v10 worlds", () => {
  const key = (p: Piece): string => `${p.kind}-${p.w}x${p.h}-${p.n ?? 0}`;
  it("keep the 11 old plans and add new ones", () => {
    const ids = new Set(levels.map((l) => l.id));
    for (let i = 1; i <= 11; i++) expect(ids.has(`s${i}`)).toBe(true);
    expect(levels.length).toBeGreaterThanOrEqual(22);
  });

  it("«Дострой половинку»: every grey place mirrors a built one (same shape and colour)", () => {
    for (const l of levels.filter((l) => l.look === "half")) {
      const built = l.pieces.filter((s) => s.fixed);
      for (const s of l.pieces.filter((s) => !s.fixed)) {
        const kind = s.kind === "fin-r" ? "fin-l" : s.kind === "fin-l" ? "fin-r" : s.kind;
        const twin = built.find((b) => b.kind === kind && b.color === s.color && b.w === s.w && b.h === s.h && b.y === s.y && b.x === l.cols - s.x - s.w);
        expect(twin, `${l.id} ${s.kind} ${s.x},${s.y}`).toBeTruthy();
      }
    }
  });

  it("«По образцу»: the spare blocks look like needed ones but have a wrong colour (a real choice)", () => {
    for (const l of levels.filter((l) => l.look === "copy")) {
      const tricky = l.extra.filter((e) => l.pieces.some((s) => !s.fixed && key(s) === key({ ...e, x: 0, y: 0 } as Piece) && s.color !== e.color));
      expect(tricky.length, l.id).toBeGreaterThanOrEqual(1);
    }
  });

  it("every needed block is in the tray once the spares are added, so the plan can be finished", () => {
    for (const l of levels) {
      const tray = [...l.pieces.filter((s) => !s.fixed), ...l.extra.map((e) => ({ ...e, x: 0, y: 0 }) as Piece)];
      const filled = l.pieces.map(() => false);
      for (const b of tray) {
        const i = l.pieces.findIndex((s, k) => !filled[k] && !s.fixed && fits(b, s) === "ok");
        if (i >= 0) filled[i] = true;
      }
      expect(doneAll(l.pieces, filled), l.id).toBe(true);
    }
  });

  it("get harder world by world", () => {
    const order = [...new Set(levels.map((l) => l.world))];
    expect(order).toEqual(worlds.map((w) => w.id));
    const mean = (w: string): number => {
      const ls = levels.filter((l) => l.world === w);
      return ls.reduce((s, l) => s + difficulty(l), 0) / ls.length;
    };
    for (let i = 1; i < order.length; i++) expect(mean(order[i]!), order[i]).toBeGreaterThan(mean(order[i - 1]!));
  });
});
