import { describe, expect, it } from "vitest";
import { createRng } from "../../shared/rng";
import { difficulty, face, groupsFor, levels, pairsOf } from "./levels";
import { closeMiss, deal, dealGroups, fitGrid, flip, peekable, solved, starsFor } from "./logic";

describe("najdi-paru", () => {
  it("has 2×2, 2×3, 3×4 and 4×4 boards with enough faces", () => {
    const sizes = new Set(levels.map((l) => `${l.cols}x${l.rows}`));
    for (const s of ["2x2", "2x3", "3x4", "4x4"]) expect(sizes.has(s)).toBe(true);
    for (const level of levels) {
      expect(level.faces.length, level.id).toBeGreaterThanOrEqual(pairsOf(level));
      expect(new Set(level.faces).size, level.id).toBe(level.faces.length);
      for (const key of level.faces) expect(() => face(key), key).not.toThrow();
    }
  });
  it("deals every face twice", () => {
    const m = deal(["a", "b", "c"], 3, createRng(2));
    expect(m.deck.sort()).toEqual(["a", "a", "b", "b", "c", "c"]);
  });
  it("matches pairs and closes misses", () => {
    const m = deal(["a", "b"], 2, createRng(1));
    m.deck = ["a", "b", "a", "b"];
    m.group = [...m.deck];
    expect(flip(m, 0)).toBe("first");
    expect(flip(m, 0)).toBe("ignored");
    expect(flip(m, 1)).toBe("miss");
    expect(flip(m, 2)).toBe("ignored");
    expect(closeMiss(m)).toEqual([0, 1]);
    expect(flip(m, 0)).toBe("first");
    expect(flip(m, 2)).toBe("match");
    expect(flip(m, 1)).toBe("first");
    expect(flip(m, 3)).toBe("match");
    expect(solved(m)).toBe(true);
    expect(m.misses).toBe(1);
  });
  it("is kind with stars", () => {
    expect(starsFor(2, 2).stars).toBe(3);
    expect(starsFor(4, 2).stars).toBe(2);
    expect(starsFor(9, 2).stars).toBe(2);
    expect(starsFor(5, 2, 2).stars).toBe(1);
  });
  it("has 24 levels up to 20 cards, old ids kept", () => {
    expect(levels).toHaveLength(24);
    for (const id of ["p1", "p2", "p3", "p4", "p5", "p6"]) expect(levels.some((l) => l.id === id)).toBe(true);
    expect(Math.max(...levels.map((l) => l.cols * l.rows))).toBe(20);
  });
  it("picks a random set when there are more faces than pairs", () => {
    const m = deal(["a", "b", "c", "d", "e"], 2, createRng(4));
    expect(m.deck).toHaveLength(4);
    expect(new Set(m.deck).size).toBe(2);
  });
  it("peeks only at closed cards", () => {
    const m = deal(["a", "b"], 2, createRng(1));
    const a = m.deck.indexOf("a");
    const a2 = m.deck.lastIndexOf("a");
    flip(m, a);
    flip(m, a2);
    expect(peekable(m).sort()).toEqual([0, 1, 2, 3].filter((i) => i !== a && i !== a2).sort());
  });
  it("turns the grid with the screen", () => {
    expect(fitGrid(4, 5, true)).toEqual({ cols: 5, rows: 4 });
    expect(fitGrid(4, 5, false)).toEqual({ cols: 4, rows: 5 });
  });
  it("v10: worlds get harder — number and things, thing and shadow, three alike", () => {
    const order = [...new Set(levels.map((l) => l.world))];
    expect(order).toEqual(["family", "fun", "things", "big", "count", "shadow", "three"]);
    const mean = (w: string): number => {
      const ls = levels.filter((l) => l.world === w);
      return ls.reduce((s, l) => s + difficulty(l), 0) / ls.length;
    };
    for (let i = 1; i < order.length; i++) expect(mean(order[i]!), order[i]).toBeGreaterThan(mean(order[i - 1]!));
    for (const w of ["count", "shadow", "three"]) {
      const ls = levels.filter((l) => l.world === w);
      for (let i = 1; i < ls.length; i++) expect(difficulty(ls[i]!)).toBeGreaterThanOrEqual(difficulty(ls[i - 1]!));
    }
  });
  it("deals every level into whole groups of real cards", () => {
    for (const l of levels) {
      for (let seed = 1; seed < 6; seed++) {
        const groups = groupsFor(l, createRng(seed));
        expect(groups.length * groups[0]!.length, l.id).toBe(l.cols * l.rows);
        for (const g of groups) for (const key of g) expect(() => face(key), key).not.toThrow();
        if (l.mode === "count")
          for (const [num, many] of groups) expect(face(num!).kind === "number" && face(many!).kind === "many" && (face(num!) as { n: number }).n === (face(many!) as { n: number }).n).toBe(true);
        if (l.mode === "shadow") for (const [a, b] of groups) expect(b).toBe(`shadow:${a}`);
        // Different groups never look the same (so every board can be solved by looking).
        expect(new Set(groups.map((g) => g.join("|"))).size).toBe(groups.length);
      }
    }
  });
  it("plays a full board of every level without a mistake when you know the cards", () => {
    for (const l of levels) {
      const m = dealGroups(groupsFor(l, createRng(7)), createRng(8));
      const byGroup = new Map<string, number[]>();
      m.group.forEach((g, i) => byGroup.set(g, [...(byGroup.get(g) ?? []), i]));
      for (const ids of byGroup.values()) {
        const res = ids.map((i) => flip(m, i));
        expect(res.at(-1), l.id).toBe("match");
      }
      expect(solved(m)).toBe(true);
      expect(m.misses).toBe(0);
    }
  });
  it("three alike: a wrong second or third card is a miss, closes, and the board goes on", () => {
    const m = dealGroups([["a", "a", "a"], ["b", "b", "b"]], createRng(1));
    m.deck = ["a", "a", "b", "a", "b", "b"];
    m.group = ["0", "0", "1", "0", "1", "1"];
    expect(flip(m, 0)).toBe("first");
    expect(flip(m, 1)).toBe("more");
    expect(flip(m, 2)).toBe("miss");
    expect(flip(m, 3)).toBe("ignored");
    expect(closeMiss(m)).toEqual([0, 1, 2]);
    expect([flip(m, 0), flip(m, 1), flip(m, 3)]).toEqual(["first", "more", "match"]);
    expect([flip(m, 2), flip(m, 4), flip(m, 5)]).toEqual(["first", "more", "match"]);
    expect(solved(m)).toBe(true);
    expect(m.misses).toBe(1);
  });
});
