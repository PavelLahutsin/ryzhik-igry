import { describe, expect, it } from "vitest";
import { SOUND_KINDS } from "../../shared/sounds";
import { allFinds, SCENES, TOYS } from "./scenes";

describe("«Тапни и послушай»", () => {
  it("has the forest, the kitchen and the yard, 8 things each, all drawn and with a sound", () => {
    expect(SCENES.map((s) => s.title)).toEqual(["Лес", "Кухня", "Двор"]);
    for (const s of SCENES) {
      expect(s.spots).toHaveLength(8);
      expect(new Set(s.spots.map((p) => p.id)).size).toBe(8);
    }
    for (const p of [...SCENES.flatMap((s) => s.spots), ...TOYS]) {
      expect(p.svg, p.id).toContain("<svg");
      expect(SOUND_KINDS, p.id).toContain(p.sound);
      expect(p.word.length, p.id).toBeLessThan(16);
      expect(p.name.length, p.id).toBeGreaterThan(2);
    }
  });
  it("spots do not overlap and stay inside the scene", () => {
    for (const s of SCENES) {
      for (const p of s.spots) {
        expect(p.x).toBeGreaterThanOrEqual(15);
        expect(p.x).toBeLessThanOrEqual(85);
        expect(p.y).toBeGreaterThanOrEqual(15);
        expect(p.y).toBeLessThanOrEqual(85);
      }
      for (const a of s.spots) for (const b of s.spots) if (a !== b) expect(Math.hypot(a.x - b.x, a.y - b.y), `${s.id} ${a.id}/${b.id}`).toBeGreaterThan(20);
    }
  });
  it("counts every thing once for the home tile", () => {
    const all = allFinds();
    expect(new Set(all).size).toBe(all.length);
    expect(all.length).toBe(3 * 8 + TOYS.length);
  });
});
