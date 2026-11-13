import { describe, expect, it } from "vitest";
import { isWinter, seasonOpen, WINTER } from "./season";

describe("winter pack", () => {
  it("is on from November to February", () => {
    expect(isWinter(new Date(2026, 10, 1))).toBe(true);
    expect(isWinter(new Date(2027, 1, 28))).toBe(true);
    expect(isWinter(new Date(2027, 2, 1))).toBe(false);
    expect(isWinter(new Date(2026, 6, 15))).toBe(false);
  });
  it("opens only its own levels, only in winter", () => {
    expect(seasonOpen("odezhda", "o3", new Date(2026, 11, 1))).toBe(true);
    expect(seasonOpen("odezhda", "o3", new Date(2026, 5, 1))).toBe(false);
    expect(seasonOpen("odezhda", "o1", new Date(2026, 11, 1))).toBe(false);
  });
  it("points at levels that exist", async () => {
    const mods: Record<string, () => Promise<{ levels: ReadonlyArray<{ id: string }> }>> = {
      sliyanie: () => import("../games/sliyanie/levels"),
      odezhda: () => import("../games/odezhda/levels"),
      sortirovka: () => import("../games/sortirovka/levels"),
      tochki: () => import("../games/tochki/levels"),
      risovalka: () => import("../games/risovalka/pictures"),
      mozaika: () => import("../games/mozaika/levels"),
      formy: () => import("../games/formy/levels"),
    };
    for (const w of WINTER) {
      const { levels } = await mods[w.game]!();
      expect(levels.map((l) => l.id), `${w.game}:${w.level}`).toContain(w.level);
    }
  });
});
