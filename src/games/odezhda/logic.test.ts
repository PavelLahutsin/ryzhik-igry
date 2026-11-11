import { describe, expect, it } from "vitest";
import { ITEMS } from "./items";
import { hintItem, levels } from "./levels";
import { dressed, starsFor, tryWear } from "./logic";

describe("odezhda", () => {
  it("levels are consistent with the weather", () => {
    for (const level of levels) {
      const slots = level.wear.map((id) => ITEMS[id]!.slot);
      expect(new Set(slots).size, level.id).toBe(slots.length);
      for (const id of level.wear) expect(ITEMS[id]!.weathers, `${level.id} ${id}`).toContain(level.weather);
      for (const id of level.extra) expect(ITEMS[id]!.weathers, `${level.id} ${id}`).not.toContain(level.weather);
    }
  });
  it("covers sun, rain, snow and wind", () => {
    expect(new Set(levels.map((l) => l.weather))).toEqual(new Set(["sun", "rain", "snow", "wind"]));
  });
  it("puts on only what fits", () => {
    expect(tryWear("raincoat", "rain", [])).toBe("wear");
    expect(tryWear("mittens", "sun", [])).toBe("wrong");
    expect(tryWear("hat", "snow", ["hat"])).toBe("taken");
  });
  it("knows when Ryzhik is dressed", () => {
    expect(dressed(["hat", "scarf"], ["scarf"])).toBe(false);
    expect(dressed(["hat", "scarf"], ["scarf", "hat"])).toBe(true);
  });
  it("gives stars kindly", () => {
    expect([starsFor(0), starsFor(2), starsFor(5)]).toEqual([3, 2, 1]);
  });
  it("has 15 levels with at most 8 things in the tray", () => {
    expect(levels).toHaveLength(15);
    for (const level of levels) {
      expect(level.wear.length + level.extra.length, level.id).toBeLessThanOrEqual(8);
      for (const id of [...level.wear, ...level.extra]) expect(ITEMS[id], id).toBeDefined();
    }
  });
  it("hints at a thing not worn yet", () => {
    const level = levels[0]!;
    expect(hintItem(level, [level.wear[0]!])).toBe(level.wear[1]);
    expect(hintItem(level, level.wear)).toBeNull();
  });
});
