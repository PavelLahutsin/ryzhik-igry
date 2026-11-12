import { describe, expect, it } from "vitest";
import { rate } from "./stars";

describe("one star rule", () => {
  it("3 stars without hints and with few mistakes", () => {
    expect(rate(0, 0)).toEqual({ stars: 3, why: "3 звезды — без ошибок и без подсказок!" });
    expect(rate(1, 0).stars).toBe(3);
    expect(rate(1, 0).why).toBe("3 звезды — без подсказок!");
  });
  it("2 stars after one hint or a few mistakes, and says how to get 3", () => {
    expect(rate(0, 1)).toEqual({ stars: 2, why: "2 звезды — была подсказка. Без подсказок будет 3!" });
    expect(rate(3, 0)).toEqual({ stars: 2, why: "2 звезды — было много ошибок. Без ошибок будет 3!" });
    expect(rate(2, 1).why).toContain("были подсказки и ошибки");
  });
  it("1 star with more help, never 0", () => {
    expect(rate(0, 2).stars).toBe(1);
    expect(rate(4, 0).stars).toBe(1);
    expect(rate(99, 99).stars).toBe(1);
    expect(rate(0, 2).why).toMatch(/^1 звезда/);
  });
  it("games can allow more mistakes (memory, tracing)", () => {
    expect(rate(6, 0, { free: 6, more: 6 }).stars).toBe(3);
    expect(rate(12, 0, { free: 6, more: 6 }).stars).toBe(2);
    expect(rate(13, 0, { free: 6, more: 6 }).stars).toBe(1);
  });
  it("every star count is reachable", () => {
    const seen = new Set<number>();
    for (let m = 0; m < 8; m++) for (let h = 0; h < 3; h++) seen.add(rate(m, h).stars);
    expect([...seen].sort()).toEqual([1, 2, 3]);
  });
});

import { HOWTO } from "./howto-data";
import { games } from "../games/registry";

describe("stars are explained", () => {
  it("every game with stars says how to get them in «Как играть»", () => {
    for (const g of games) {
      if (["domik", "kuhnya", "raskraska"].includes(g.id)) continue;
      expect(HOWTO[g.id]?.stars, g.id).toBeTruthy();
    }
  });
});
