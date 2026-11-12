import { describe, expect, it } from "vitest";
import { inWorldOrder } from "./order";
import { levels as tochki } from "../games/tochki/levels";
import { levels as teni } from "../games/teni/levels";
import { difficulty as teniDifficulty } from "../games/teni/logic";
import { levels as labirint } from "../games/labirint/levels";
import { levels as pary, pairsOf } from "../games/najdi-paru/levels";
import { levels as sortirovka, itemCount } from "../games/sortirovka/levels";
import { levels as stroyka } from "../games/stroyka/levels";

describe("levels keep getting harder", () => {
  it("orders by world, stable inside a world", () => {
    const l = [{ id: "a", world: "x" }, { id: "b", world: "y" }, { id: "c", world: "x" }];
    expect(inWorldOrder(l, ["y", "x"]).map((x) => x.id)).toEqual(["b", "a", "c"]);
  });
  it("the last world is the hardest one", () => {
    const lastWorldIsTop = <L extends { world?: string }>(levels: readonly L[], size: (l: L) => number): void => {
      const last = levels[levels.length - 1]!.world;
      const top = Math.max(...levels.map(size));
      expect(levels.filter((l) => l.world === last).some((l) => size(l) === top), String(last)).toBe(true);
    };
    lastWorldIsTop(tochki, (l) => l.dots.length);
    lastWorldIsTop(teni, teniDifficulty);
    lastWorldIsTop(labirint, (l) => l.cols * l.rows);
    lastWorldIsTop(pary, pairsOf);
    lastWorldIsTop(sortirovka, (l) => l.baskets.length * 10 + itemCount(l));
  });
  it("worlds stay together on the list", () => {
    for (const levels of [tochki, teni, labirint, pary, sortirovka] as ReadonlyArray<ReadonlyArray<{ world?: string }>>) {
      const seen: string[] = [];
      for (const l of levels) if (seen[seen.length - 1] !== l.world) seen.push(l.world!);
      expect(new Set(seen).size).toBe(seen.length);
    }
  });
  it("«Стройка» goes from fewer blocks to more, every level once", () => {
    const n = stroyka.map((l) => l.pieces.length + l.extra.length);
    for (let i = 1; i < n.length; i++) expect(n[i]!).toBeGreaterThanOrEqual(n[i - 1]!);
    expect(new Set(stroyka.map((l) => l.id)).size).toBe(11);
  });
});
