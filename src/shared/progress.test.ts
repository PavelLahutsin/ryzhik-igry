import { describe, expect, it } from "vitest";
import type { PlatformStorage } from "./platform";
import { adoptLevels, emptyProgress, gameProgress, isUnlocked, isUnlockedInWorld, levelOpen, normalizeProgress, recordWin, totalStars } from "./progress";

function memory(): PlatformStorage {
  const data = new Map<string, unknown>();
  return {
    async get<T>(key: string) {
      return (data.get(key) as T) ?? null;
    },
    async set<T>(key: string, value: T) {
      data.set(key, value);
    },
    async remove(key: string) {
      data.delete(key);
    },
  };
}

describe("shared progress", () => {
  it("normalizes junk", () => {
    expect(normalizeProgress(null)).toEqual(emptyProgress());
    expect(normalizeProgress({ completed: ["a", 3], stars: { a: 9, b: 0 } })).toEqual({
      completed: ["a"],
      stars: { a: 3 },
    });
  });
  it("keeps best stars", () => {
    let p = recordWin(emptyProgress(), "a", 3);
    p = recordWin(p, "a", 1);
    expect(p.stars.a).toBe(3);
    expect(p.completed).toEqual(["a"]);
  });
  it("unlocks levels in order", () => {
    const ids = ["a", "b", "c"];
    expect(isUnlocked(ids, "a", [])).toBe(true);
    expect(isUnlocked(ids, "b", [])).toBe(false);
    expect(isUnlocked(ids, "b", ["a"])).toBe(true);
    expect(isUnlocked(ids, "c", ["a"])).toBe(false);
    expect(isUnlocked(ids, "x", ["a"])).toBe(false);
    expect(totalStars({ a: 2, b: 3 }, ids)).toBe(5);
  });
  it("stores per game", async () => {
    const storage = memory();
    const one = gameProgress("mozaika", storage);
    await one.win("m1", 2);
    expect((await one.load()).stars).toEqual({ m1: 2 });
    expect((await gameProgress("teni", storage).load()).completed).toEqual([]);
  });
});

describe("levels moving to another game", () => {
  it("copies stars of the moved levels once, old key untouched", async () => {
    const st = memory();
    await st.set("risovalka:progress", { completed: ["r1", "d1", "d2"], stars: { r1: 3, d1: 2, d2: 3 } });
    await adoptLevels("risovalka", "bukvy", ["d1", "d2", "d3"], st);
    expect(await st.get("bukvy:progress")).toEqual({ completed: ["d1", "d2"], stars: { d1: 2, d2: 3 } });
    expect(await st.get("risovalka:progress")).toEqual({ completed: ["r1", "d1", "d2"], stars: { r1: 3, d1: 2, d2: 3 } });
    // Later wins in the new game are never overwritten.
    await st.set("bukvy:progress", { completed: ["d1", "d2", "d3"], stars: { d1: 3, d2: 3, d3: 1 } });
    await adoptLevels("risovalka", "bukvy", ["d1", "d2", "d3"], st);
    expect((await st.get<{ completed: string[] }>("bukvy:progress"))!.completed).toEqual(["d1", "d2", "d3"]);
  });
  it("starts every world open", () => {
    const levels = [{ id: "d1", world: "d" }, { id: "d2", world: "d" }, { id: "a", world: "l" }, { id: "b", world: "l" }];
    expect(isUnlockedInWorld(levels, "a", [])).toBe(true);
    expect(isUnlockedInWorld(levels, "b", [])).toBe(false);
    expect(isUnlockedInWorld(levels, "d2", ["d1"])).toBe(true);
  });
});

describe("v14 levelOpen: a winter level won early does not skip the one before it", () => {
  const L = Array.from({ length: 16 }, (_, i) => ({ id: `r${i + 1}`, world: i < 12 ? "a" : "b" }));
  const upTo = (n: number): string[] => L.slice(0, n).map((l) => l.id);
  const season = (id: string): boolean => id === "r14";
  it("12 → 14 (winter) does not open 15 while 13 is not won", () => {
    const done = [...upTo(12), "r14"];
    expect(levelOpen(L, "r13", done, { season })).toBe(true);
    expect(levelOpen(L, "r14", done, { season })).toBe(true);
    expect(levelOpen(L, "r15", done, { season })).toBe(false);
    expect(levelOpen(L, "r15", [...done, "r13"], { season })).toBe(true);
    expect(levelOpen(L, "r14", upTo(1), { season })).toBe(true);
  });
  it("same as before without a season: one by one, def.after, worlds, won levels stay open", () => {
    expect(levelOpen(L, "r1", [])).toBe(true);
    expect(levelOpen(L, "r2", [])).toBe(false);
    expect(levelOpen(L, "r15", upTo(14))).toBe(true);
    expect(levelOpen(L, "r16", ["r16"])).toBe(true);
    expect(levelOpen(L, "r13", [], { openWorlds: true })).toBe(true);
    expect(levelOpen(L, "r14", ["r13"], { openWorlds: true })).toBe(true);
    expect(levelOpen(L, "r13", [], { after: { r13: "r5" } })).toBe(false);
    expect(levelOpen(L, "r13", ["r5"], { after: { r13: "r5" } })).toBe(true);
    for (let n = 0; n < L.length; n++)
      for (const l of L) expect(levelOpen(L, l.id, upTo(n), { season })).toBe(L.indexOf(l) <= n || season(l.id));
  });
});
