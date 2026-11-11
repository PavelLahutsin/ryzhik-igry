import { describe, expect, it } from "vitest";
import type { PlatformStorage } from "./platform";
import { emptyProgress, gameProgress, isUnlocked, normalizeProgress, recordWin, totalStars } from "./progress";

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
