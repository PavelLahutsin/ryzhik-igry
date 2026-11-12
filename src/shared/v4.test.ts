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

import { HOWTO_VOICE, MUSIC_FILES, PRAISE_LINES, VOICE_LINES, VOICE_WHEN, WIN_JINGLE, praiseLine } from "./voice-lines";
describe("voice and music files", () => {
  it("has v01–v37 and m01–m12 as in the prompts, and the v12 slots v38–v42", () => {
    const ids = Object.keys(VOICE_LINES);
    expect(ids).toHaveLength(42);
    expect(ids[0]).toBe("v01");
    expect(ids[36]).toBe("v37");
    expect(ids.slice(37)).toEqual(["v38", "v39", "v40", "v41", "v42"]);
    for (const id of ids.slice(37)) expect(VOICE_WHEN[id], id).toBeTruthy();
    const music = new Set([...Object.values(MUSIC_FILES), WIN_JINGLE]);
    for (let i = 1; i <= 12; i++) expect(music.has(`m${String(i).padStart(2, "0")}`), `m${i}`).toBe(true);
  });
  it("only points at known lines", () => {
    for (const id of [...PRAISE_LINES, ...Object.values(HOWTO_VOICE), ...Object.keys(VOICE_WHEN)]) expect(VOICE_LINES[id], id).toBeTruthy();
    for (const g of games) if (g.id !== "raskraska") expect(HOWTO_VOICE[g.id], g.id).toBeTruthy();
    for (let i = 0; i < 20; i++) expect(PRAISE_LINES).toContain(praiseLine());
    expect(MUSIC_FILES.raskraska).toBeUndefined();
  });
});
