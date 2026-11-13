import { describe, expect, it } from "vitest";
import { amount, rate, rateBy, rateHints, starLine, STARS, type StarSpec } from "./stars";
import { HOWTO } from "./howto-data";
import { games } from "../games/registry";
import { starsFor as teni } from "../games/teni/logic";
import { starsFor as odezhda } from "../games/odezhda/logic";
import { starsFor as tochki } from "../games/tochki/logic";
import { starsFor as professii } from "../games/professii/logic";
import { starsFor as stroyka } from "../games/stroyka/logic";
import { starsFor as risovalka } from "../games/risovalka/logic";
import { starsFor as sortirovka } from "../games/sortirovka/logic";
import { starsFor as formy } from "../games/formy/logic";
import { starsFor as mozaika } from "../games/mozaika/logic";
import { starsFor as pary } from "../games/najdi-paru/logic";
import { starsFor as sliyanie } from "../games/sliyanie/logic";

describe("one star rule (v12: a hint never drops straight to one star)", () => {
  it("3 stars without hints and with ≤1 mistake", () => {
    expect(rate(0, 0)).toEqual({ stars: 3, why: "3 звезды — без ошибок и без подсказок!" });
    expect(rate(1, 0)).toEqual({ stars: 3, why: "3 звезды — без подсказок!" });
  });
  it("2 stars with one hint, or with ≤3 mistakes", () => {
    expect(rate(0, 1)).toEqual({ stars: 2, why: "2 звезды — была подсказка. Без подсказок будет 3!" });
    expect(rate(3, 0)).toEqual({ stars: 2, why: "2 звезды — было много ошибок. Без ошибок будет 3!" });
    expect(rate(9, 1).stars).toBe(2);
    expect(rate(0, 2).stars).toBe(2);
    expect(rate(3, 5).stars).toBe(2);
    expect(rate(2, 1).why).toContain("были подсказки и ошибки");
  });
  it("1 star only with more than one hint and more than 3 mistakes, never 0", () => {
    expect(rate(4, 2).stars).toBe(1);
    expect(rate(99, 99).stars).toBe(1);
    expect(rate(4, 2).why).toBe("1 звезда — было много подсказок и ошибок. Попробуй ещё раз без подсказки — будет больше!");
  });
  it("lamp-only games: 0 → ★★★, 1–2 → ★★, more → ★", () => {
    expect([0, 1, 2, 3, 9].map((h) => rateHints(h).stars)).toEqual([3, 2, 2, 1, 1]);
  });
  it("every star count is reachable", () => {
    const seen = new Set<number>();
    for (let m = 0; m < 8; m++) for (let h = 0; h < 4; h++) seen.add(rate(m, h).stars);
    expect([...seen].sort()).toEqual([1, 2, 3]);
  });
  it("no star text is gendered", () => {
    for (let m = 0; m < 8; m++) for (let h = 0; h < 4; h++) expect(rate(m, h).why).not.toMatch(/\bсам\b|\bсама\b/);
  });
});

/** Each game's real starsFor(mistakes, hints, size) — must follow its spec. */
const CODE: Record<string, (m: number, h: number, size: number) => number> = {
  teni: (m, h) => teni(m, h).stars,
  odezhda: (m, h) => odezhda(m, h).stars,
  tochki: (m, h) => tochki(m, h).stars,
  professii: (m, h) => professii(m, h).stars,
  stroyka: (m, h) => stroyka(m, h).stars,
  risovalka: (m, h) => risovalka(m, h).stars,
  bukvy: (m, h) => risovalka(m, h).stars, // «Буквы» play through the same trace.ts
  sortirovka: (m, h, n) => sortirovka(m, n, h).stars,
  formy: (m, h, n) => formy(m, h, n).stars,
  mozaika: (m, h, n) => mozaika(m, n, h).stars,
  "najdi-paru": (m, h, n) => pary(m, n, h).stars,
  sliyanie: (_m, h) => sliyanie(h).stars,
  labirint: (_m, h) => rateBy(STARS.labirint, 0, h).stars, // labirint/index.ts calls rateBy(STARS.labirint, 0, hints)
};
const PART_WORD: Record<number, RegExp> = { 0.25: /четверти/, 0.5: /половины/, 1: /, чем /, 2: /двух на каждую/ };

describe("«Как играть» says exactly what the code does", () => {
  it("every level game has a spec, and its card prints that spec", () => {
    for (const g of games) {
      if (["domik", "kuhnya", "raskraska", "tajnaya-kartinka", "tapni", "stikery", "zima"].includes(g.id)) continue;
      expect(STARS, g.id).toHaveProperty(g.id);
    }
    for (const [id, spec] of Object.entries(STARS)) expect(HOWTO[id]?.stars, id).toBe(starLine(spec as StarSpec));
  });

  it("the numbers in the text are the thresholds of the game code", () => {
    for (const [id, raw] of Object.entries(STARS)) {
      const spec = raw as StarSpec;
      const code = CODE[id]!;
      const [three, two] = starLine(spec).split(" · ");
      if (spec.kind === "hints") {
        expect(three).toBe("★★★ — без лампочки");
        expect([0, 1, 2, 3].map((h) => code(0, h, 0)), id).toEqual([3, 2, 2, 1]);
        continue;
      }
      for (const size of [4, 6, 8, 12, 16]) {
        const free = typeof spec.free === "number" ? Number(three!.match(/не больше (\d+)/)?.[1] ?? 0) : amount(spec.free, size);
        const lim = typeof spec.two === "number" ? Number(two!.match(/не больше (\d+)/)?.[1]) : amount(spec.two, size);
        expect(code(free, 0, size), `${id} ${size}: ${free} mistakes`).toBe(3);
        expect(code(free + 1, 0, size), id).toBe(2);
        expect(code(0, 1, size), id).toBe(2);
        expect(code(50, 1, size), `${id}: one hint never gives ★`).toBe(2);
        expect(code(lim, 5, size), id).toBe(2);
        expect(code(lim + 1, 2, size), id).toBe(1);
      }
      for (const a of [spec.free, spec.two]) {
        if (typeof a === "number") continue;
        expect(a.say, id).toMatch(PART_WORD[a.part]!);
        const always = a.say.match(/\((\d+) можно всегда\)/);
        if (a.min > 1) expect(Number(always?.[1]), `${id}: say the minimum`).toBe(a.min);
        if (always) expect(Number(always[1]), id).toBe(a.min);
      }
    }
  });
});
