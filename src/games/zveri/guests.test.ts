import { describe, expect, it } from "vitest";
import { levels as paraLevels } from "../najdi-paru/levels";
import { animalArt } from "./animals";
import { NEW_LEVELS, NEW_WORLDS } from "./guests-data";
import { arrivals } from "./guests-play";

describe("Кто новенький?", () => {
  it("levels are valid", () => {
    const old = new Set(paraLevels.map((l) => l.id));
    const ids = new Set<string>();
    for (const l of NEW_LEVELS) {
      expect(old.has(l.id) || ids.has(l.id), l.id).toBe(false);
      ids.add(l.id);
      expect(NEW_WORLDS.some((w) => w.id === l.world)).toBe(true);
      expect(l.pool, l.id).not.toContain("fox");
      expect(new Set(l.pool).size, l.id).toBe(l.pool.length);
      expect(l.pool.length, l.id).toBeGreaterThanOrEqual(l.start + l.steps);
      expect(l.start).toBeGreaterThanOrEqual(1);
      for (const a of l.pool) expect(animalArt(a)?.svg, `${l.id} ${a}`).toMatch(/^<(svg|img)/);
      // the sheep and the lamb look alike: never together
      expect(l.pool.includes("sheep") && l.pool.includes("lamb"), l.id).toBe(false);
    }
  });
  it("gets harder: more animals, then shuffling", () => {
    const sizes = NEW_LEVELS.map((l) => l.start + l.steps);
    for (let i = 1; i < sizes.length; i++) expect(sizes[i]!).toBeGreaterThanOrEqual(sizes[i - 1]!);
    expect(NEW_LEVELS.filter((l) => l.world !== "nw-hard").every((l) => !l.shuffle)).toBe(true);
  });
  it("arrivals have no repeats", () => {
    for (const l of NEW_LEVELS) {
      const a = arrivals(l);
      expect(a).toHaveLength(l.start + l.steps);
      expect(new Set(a).size).toBe(a.length);
    }
  });
});
