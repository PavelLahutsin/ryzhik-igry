import { describe, expect, it } from "vitest";
import { normalizePlayed, pickToday, pushRecent } from "./played";

describe("played (v13)", () => {
  it("recent: newest first, no repeats, at most 4", () => {
    let r: string[] = [];
    for (const id of ["a", "b", "a", "c", "d", "e"]) r = pushRecent(r, id);
    expect(r).toEqual(["e", "d", "c", "a"]);
  });
  it("normalizes junk", () => {
    expect(normalizePlayed({ recent: ["a", 1, "b"], opened: "x" })).toEqual({ recent: ["a", "b"], opened: [] });
    expect(normalizePlayed(null)).toEqual({ recent: [], opened: [] });
  });
  it("today: an unfinished game that is not the last one played, the same all day", () => {
    const games = [
      { id: "a", got: 3, max: 9 },
      { id: "b", got: 0, max: 9 },
      { id: "c", got: 9, max: 9 },
      { id: "d", got: 1, max: 9 },
    ];
    const played = { recent: ["a"], opened: ["a", "c", "d"] };
    expect(pickToday(games, played, 5)).toEqual({ id: "d", why: "continue" });
    expect(pickToday(games, played, 5)).toEqual(pickToday(games, played, 5));
    expect(pickToday(games.slice(1, 3), { recent: [], opened: ["c"] }, 0)).toEqual({ id: "b", why: "new" });
    expect(pickToday([{ id: "c", got: 9, max: 9 }], { recent: [], opened: ["c"] }, 0)).toBeNull();
  });
});
