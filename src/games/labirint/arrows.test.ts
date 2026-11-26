import { describe, expect, it } from "vitest";
import { characters } from "../../shared/assets";
import { levels as labLevels } from "./levels";
import { ARROW_LEVELS, ARROW_WORLDS, type Dir } from "./arrows-data";
import { blocked, nextArrow, shortest, turns, walk } from "./arrows-logic";

describe("Дорожка стрелками", () => {
  it("has 20 levels: 6 short, 7 with turns, 7 long", () => {
    expect(ARROW_LEVELS).toHaveLength(20);
    expect(ARROW_WORLDS.map((w) => ARROW_LEVELS.filter((l) => l.world === w.id).length)).toEqual([6, 7, 7]);
    const ids = new Set(labLevels.map((l) => l.id));
    const titles = new Set<string>();
    for (const l of ARROW_LEVELS) {
      expect(ids.has(l.id), l.id).toBe(false);
      ids.add(l.id);
      expect(titles.has(l.title), l.title).toBe(false);
      titles.add(l.title);
      expect(characters[l.goalWho], l.goalWho).toBeDefined();
    }
  });
  it("every solution is a shortest way (BFS) and fits the tape", () => {
    for (const l of ARROW_LEVELS) {
      const w = walk(l, l.solution);
      expect(w.stop, l.id).toBe("goal");
      expect(w.at, l.id).toBe(l.solution.length - 1);
      expect(shortest(l)!.length, l.id).toBe(l.solution.length);
      expect(l.maxArrows, l.id).toBeGreaterThanOrEqual(l.solution.length);
      expect(l.maxArrows - l.solution.length, l.id).toBeLessThanOrEqual(l.world === "ar-short" ? 0 : 2);
    }
  });
  it("cells are in the field and never overlap", () => {
    for (const l of ARROW_LEVELS) {
      expect(blocked(l, l.start), l.id).toBeNull();
      expect(blocked(l, l.goal), l.id).toBeNull();
      const all = [l.start, l.goal, ...l.rocks, ...l.apples].map(([x, y]) => `${x},${y}`);
      expect(new Set(all).size, l.id).toBe(all.length);
      for (const [x, y] of [...l.rocks, ...l.apples]) {
        expect(x >= 0 && y >= 0 && x < l.cols && y < l.rows, `${l.id} ${x},${y}`).toBe(true);
      }
      // apples on the way or right next to it
      const way = walk(l, l.solution).cells;
      for (const [x, y] of l.apples) expect(way.some(([a, b]) => Math.abs(a - x) + Math.abs(b - y) <= 1), `${l.id} apple ${x},${y}`).toBe(true);
    }
  });
  it("short levels go one way; difficulty does not drop inside a world", () => {
    for (const l of ARROW_LEVELS) {
      const t = turns(l.solution);
      const [lo, hi] = l.world === "ar-short" ? [0, 0] : l.world === "ar-turn" ? [1, 2] : [2, 3];
      expect(t >= lo && t <= hi, `${l.id} turns ${t}`).toBe(true);
    }
    for (const w of ARROW_WORLDS) {
      const list = ARROW_LEVELS.filter((l) => l.world === w.id);
      for (let i = 1; i < list.length; i++) {
        expect(list[i]!.cols * list[i]!.rows, list[i]!.id).toBeGreaterThanOrEqual(list[i - 1]!.cols * list[i - 1]!.rows);
        expect(list[i]!.solution.length, list[i]!.id).toBeGreaterThanOrEqual(list[i - 1]!.solution.length);
      }
    }
  });
  it("hints lead along a shortest way", () => {
    for (const l of ARROW_LEVELS) {
      const tape: Dir[] = [];
      for (let n = 0; n < l.maxArrows; n++) {
        const d = nextArrow(l, tape);
        if (!d) break;
        tape.push(d);
      }
      expect(walk(l, tape).stop, l.id).toBe("goal");
      expect(tape.length, l.id).toBe(l.solution.length);
    }
    // a4: down, then right runs into the bush; no hint then (the arrow goes away instead)
    const a4 = ARROW_LEVELS.find((x) => x.id === "a4")!;
    expect(walk(a4, ["D", "R"]).stop).toBe("rock");
    expect(nextArrow(a4, ["D", "R"])).toBeNull();
    expect(nextArrow(a4, ["D"])).toBe("D");
  });
});
