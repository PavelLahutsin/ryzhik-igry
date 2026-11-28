import { describe, expect, it } from "vitest";
import { levels as sortLevels } from "../sortirovka/levels";
import { ANIMALS, animalArt } from "./animals";
import { EATS, eaterOf, FEED_LEVELS, FEED_WORLDS, FOODS } from "./feed-data";

describe("Кто что ест?", () => {
  it("has art for every animal and food", () => {
    for (const a of Object.keys(EATS)) expect(animalArt(a)?.svg, a).toMatch(/^<(svg|img)/);
    for (const [a, foods] of Object.entries(EATS)) for (const f of foods) expect(FOODS[f]?.svg, `${a}:${f}`).toMatch(/^<(svg|img)/);
  });
  it("has no fox among the animals (the fox is Ryzhik)", () => {
    expect(Object.keys(ANIMALS)).not.toContain("fox");
  });
  it("levels are solvable and unambiguous", () => {
    const ids = new Set<string>();
    for (const l of FEED_LEVELS) {
      expect(ids.has(l.id), l.id).toBe(false);
      ids.add(l.id);
      expect(FEED_WORLDS.some((w) => w.id === l.world)).toBe(true);
      expect(l.foods.length).toBe(l.animals.length);
      for (const f of [...l.foods, ...l.extra]) expect(FOODS[f], f).toBeDefined();
      // every food fits exactly one animal there, every animal gets one food
      for (const f of l.foods)
        expect(
          l.animals.filter((a) => EATS[a]!.includes(f)),
          `${l.id} ${f}`,
        ).toHaveLength(1);
      expect(new Set(l.foods.map((f) => eaterOf(l, f))).size, l.id).toBe(l.animals.length);
      for (const f of l.extra) expect(eaterOf(l, f), `${l.id} extra ${f}`).toBeNull();
      expect(new Set([...l.foods, ...l.extra]).size).toBe(l.foods.length + l.extra.length);
    }
  });
  it("ids do not clash with the sorting levels", () => {
    const old = new Set(sortLevels.map((l) => l.id));
    for (const l of FEED_LEVELS) expect(old.has(l.id)).toBe(false);
  });
});
