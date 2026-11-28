import { describe, expect, it } from "vitest";
import { DEFAULT_SKIN, SKINS, skinById, skinTier } from "./skins";
import { WIN_TIER } from "./logic";

describe("skins of «Удвоялка»", () => {
  it("has Цифры, Сад, Зима, Лес and one more", () => {
    const ids = SKINS.map((s) => s.id);
    expect(ids).toEqual(expect.arrayContaining(["cifry", "sad", "zima", "les"]));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThanOrEqual(5);
  });

  it("every skin has 11 distinct tiers, 2 … 2048", () => {
    for (const skin of SKINS) {
      expect(skin.tiers).toHaveLength(WIN_TIER + 1);
      expect(new Set(skin.tiers.map((t) => t.name)).size).toBe(11);
      if (skin.id === "cifry") continue;
      expect(new Set(skin.tiers.map((t) => t.art)).size).toBe(11);
    }
  });

  it("pictures are our own bundled paintings: a local <img>, no outside links", () => {
    for (const skin of SKINS) {
      skin.tiers.forEach((t, i) => {
        const art = t.art;
        if (!art) return;
        expect(art.startsWith("<img"), `${skin.id}:${i}`).toBe(true);
        expect(art).not.toMatch(/https?:/);
      });
    }
  });

  it("falls back to the default skin and repeats the last picture after 2048", () => {
    expect(skinById("nope").id).toBe(DEFAULT_SKIN);
    const sad = skinById("sad");
    expect(skinTier(sad, 14)).toBe(sad.tiers[WIN_TIER]);
  });
});
