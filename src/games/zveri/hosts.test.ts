import { describe, expect, it } from "vitest";
import { levelOpen, orderAfter, playOrder } from "../../shared/progress";
import * as sort from "../sortirovka/all";
import * as para from "../najdi-paru/all";
import * as lab from "../labirint/all";

/** v23: the new modes live inside older games; old players keep every world they had open. */
describe.each([
  ["sortirovka", sort, "colors", "more", "kf1"],
  ["najdi-paru", para, "family", "fun", "nw1"],
  ["labirint", lab, "home", "guests", "a1"],
] as const)("%s with its new mode", (_name, host, first, second, newFirst) => {
  const levels = host.levels as ReadonlyArray<{ id: string; world?: string }>;
  const after = { ...orderAfter(levels, host.WORLD_ORDER), ...host.ALL_AFTER };
  const firstWorld = levels.filter((l) => l.world === first).map((l) => l.id);
  const secondFirst = levels.find((l) => l.world === second)!.id;
  it("ids are unique and every level has a world", () => {
    expect(new Set(levels.map((l) => l.id)).size).toBe(levels.length);
    for (const l of levels) expect(host.worlds.some((w) => w.id === l.world), l.id).toBe(true);
  });
  it("lists the new mode right after the first world", () => {
    expect(playOrder(levels, host.WORLD_ORDER)[firstWorld.length]!.id).toBe(newFirst);
    expect(playOrder(levels, host.WORLD_ORDER)[0]!.id).toBe(firstWorld[0]);
  });
  it("the old second world and the new mode both open after the first world", () => {
    expect(levelOpen(levels, secondFirst, firstWorld, { after })).toBe(true);
    expect(levelOpen(levels, newFirst, firstWorld, { after })).toBe(true);
    expect(levelOpen(levels, secondFirst, firstWorld.slice(0, -1), { after })).toBe(false);
  });
});
