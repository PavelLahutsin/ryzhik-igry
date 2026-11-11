import { describe, expect, it } from "vitest";
import { SOUND_KINDS, recipe } from "./sounds";
import { MELODIES, SONGS, melodyFor, musicFor } from "./music";
import { HOWTO } from "./howto-data";
import { normalizeSeen } from "./seen";
import { STICKERS, earned, starsFor } from "./stickers";
import { LEVEL_TIPS } from "./tips-data";
import { games } from "../games/registry";

describe("sounds", () => {
  it("every sound kind has a recipe", () => {
    for (const k of SOUND_KINDS) expect(recipe(k).length, k).toBeGreaterThan(0);
  });
  it("music: a melody for every game, no music in the coloring book", () => {
    for (const g of games) expect(melodyFor(g.id).length).toBeGreaterThan(2);
    expect(musicFor("raskraska")).toBeNull();
    expect(musicFor("roditelyam")).toBeNull();
    expect(musicFor("mozaika")).not.toBeNull();
    expect(Object.keys(MELODIES).length).toBeGreaterThan(0);
    expect(Object.keys(SONGS)).toContain("default");
  });
});

describe("Как играть", () => {
  it("covers every game with 2–4 steps and parents' text", () => {
    for (const g of games) {
      const h = HOWTO[g.id];
      expect(h, g.id).toBeDefined();
      expect(h!.steps.length).toBeGreaterThanOrEqual(2);
      expect(h!.steps.length).toBeLessThanOrEqual(4);
      expect(h!.rules.length).toBeGreaterThan(10);
      expect(h!.develops.length).toBeGreaterThan(5);
      for (const s of h!.steps) expect(s.text.length).toBeLessThan(45);
    }
  });
  it("level tips point at real games and stay short", () => {
    const ids = new Set(games.map((g) => g.id));
    for (const [game, tips] of Object.entries(LEVEL_TIPS)) {
      expect(ids.has(game), game).toBe(true);
      for (const t of Object.values(tips)) expect(t.text.length).toBeLessThan(60);
    }
  });
});

describe("seen", () => {
  it("normalizes broken records", () => {
    expect(normalizeSeen(null)).toEqual({ howto: [], tips: [] });
    expect(normalizeSeen({ howto: ["a", 3], tips: "x" })).toEqual({ howto: ["a"], tips: [] });
  });
});

describe("stickers", () => {
  it("first sticker comes with the first 3 stars", () => {
    expect(earned(0)).toBe(0);
    expect(earned(2)).toBe(0);
    expect(earned(3)).toBe(1);
    expect(earned(starsFor(4))).toBe(5);
    expect(earned(starsFor(4) - 1)).toBe(4);
    expect(earned(100000)).toBe(STICKERS.length);
  });
  it("has unique ids", () => {
    expect(new Set(STICKERS.map((s) => s.id)).size).toBe(STICKERS.length);
    expect(STICKERS.length).toBe(27);
  });
});

import { dayKey, giftFor, seasonOf } from "../home/daily";
describe("daily gift", () => {
  it("knows the season", () => {
    expect(seasonOf(new Date(2026, 0, 5))).toBe("winter");
    expect(seasonOf(new Date(2026, 3, 5))).toBe("spring");
    expect(seasonOf(new Date(2026, 6, 5))).toBe("summer");
    expect(seasonOf(new Date(2026, 10, 11))).toBe("autumn");
    expect(seasonOf(new Date(2026, 11, 1))).toBe("winter");
  });
  it("is the same all day and changes from day to day", () => {
    const a = giftFor(new Date(2026, 10, 11, 8));
    expect(giftFor(new Date(2026, 10, 11, 20))).toEqual(a);
    expect(giftFor(new Date(2026, 10, 12)).obj).not.toBe(a.obj);
    expect(dayKey(new Date(2026, 0, 2))).toBe("2026-01-02");
  });
});

import { VOICE_LINES, praiseLine } from "./voice-lines";
describe("voice lines", () => {
  it("has a how-to line for every game and praise lines", () => {
    for (const g of games) expect(VOICE_LINES[`howto-${g.id}`], g.id).toBeTruthy();
    for (let i = 0; i < 20; i++) expect(VOICE_LINES[praiseLine()]).toBeTruthy();
    expect(praiseLine(() => 0.999)).toBe("praise-6");
  });
});
