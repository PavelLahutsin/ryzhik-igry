import { describe, expect, it } from "vitest";
import { OBJECT_GENDER, OBJECTS } from "../../shared/objects";
import { THINGS } from "./art";
import { createRng } from "../../shared/rng";
import { difficulty, levels, worlds } from "./levels";
import {
  canStack,
  compareAsk,
  cornerPoints,
  CORNERS,
  figName,
  makeRounds,
  matches,
  nextInOrder,
  nextRing,
  orderAsk,
  pickTarget,
  shapePath,
  sizedName,
  solveRound,
  starsFor,
  whoFits,
  type Shape,
} from "./logic";

describe("formy rules", () => {
  it("matches keys", () => {
    expect(matches("big", "big")).toBe("ok");
    expect(matches("big", "small")).toBe("wrong");
    expect(matches("big", null)).toBe("none");
  });

  it("stacks pyramid rings biggest first", () => {
    const pole: number[] = [];
    expect(nextRing(pole, 4)).toBe(4);
    expect(canStack(pole, 4, 3)).toBe(false);
    expect(canStack(pole, 4, 4)).toBe(true);
    pole.push(4, 3, 2);
    expect(canStack(pole, 4, 1)).toBe(true);
    pole.push(1);
    expect(nextRing(pole, 4)).toBe(0);
  });

  it("gives stars by slips for the level size", () => {
    expect(starsFor(0, 0, 6).stars).toBe(3);
    expect(starsFor(1, 0, 6).stars).toBe(3);
    expect(starsFor(3, 0, 6).stars).toBe(2);
    expect(starsFor(2, 2, 6).stars).toBe(2);
    expect(starsFor(4, 2, 6).stars).toBe(1);
  });

  it("draws every shape as a closed path", () => {
    for (const s of ["circle", "square", "triangle", "star", "heart", "rhombus"] as Shape[]) {
      const d = shapePath(s, 50, 50, 40);
      expect(d.startsWith("M")).toBe(true);
      expect(d.trim().endsWith("Z")).toBe(true);
      expect(d).not.toContain("NaN");
    }
  });
});

describe("formy levels", () => {
  it("are well formed", () => {
    expect(new Set(levels.map((l) => l.id)).size).toBe(levels.length);
    for (const l of levels) {
      expect(worlds.some((w) => w.id === l.world)).toBe(true);
      if (l.mode === "family") {
        expect(l.sizes.length).toBeGreaterThanOrEqual(2);
        for (const o of l.objects) expect(OBJECTS[o]).toBeTruthy();
      }
      if (l.mode === "pyramid") expect(l.rings).toBeGreaterThanOrEqual(3);
      if (l.mode === "sorter") expect(new Set(l.shapes).size).toBe(l.shapes.length);
      if (l.mode === "things")
        for (const t of l.things) {
          expect(l.baskets).toContain(t.shape);
          expect(t.id === "ball" || t.id === "cube" || t.id in THINGS).toBe(true);
        }
    }
  });
});

describe("pickTarget", () => {
  it("picks the nearest of overlapping family members", () => {
    const papa = { left: 0, top: 0, width: 160, height: 400 };
    const mama = { left: 130, top: 100, width: 130, height: 300 };
    expect(pickTarget({ x: 150, y: 380 }, [papa, mama])).toBe(1);
    expect(pickTarget({ x: 60, y: 380 }, [papa, mama])).toBe(0);
    expect(pickTarget({ x: 500, y: 380 }, [papa, mama])).toBe(-1);
  });
});

describe("sizedName", () => {
  it("agrees the size word with the thing", () => {
    expect(sizedName("small", "Чашка", OBJECT_GENDER.cup)).toBe("Маленькая чашка");
    expect(sizedName("big", "Яблоко", OBJECT_GENDER.apple)).toBe("Большое яблоко");
    expect(sizedName("mid", "Мячик", OBJECT_GENDER.ball)).toBe("Средний мячик");
    expect(sizedName("big", "Вишенки", OBJECT_GENDER.cherry)).toBe("Большие вишенки");
  });
});

describe("whoFits", () => {
  it("agrees the pronoun", () => {
    expect(whoFits("f")).toBe("Кому она подойдёт?");
    expect(whoFits("n")).toBe("Кому оно подойдёт?");
    expect(whoFits("pl")).toBe("Кому они подойдут?");
  });
});

describe("formy v9: every kind of task", () => {
  const OLD = ["r1", "r2", "r3", "r4", "r5", "f1", "f2", "f3", "f4", "f5", "f6", "r6", "f7", "r7", "f8"];

  it("keeps the old level ids (stars are stored by id) and has ~40 levels in 5 worlds", () => {
    const ids = levels.map((l) => l.id);
    for (const id of OLD) expect(ids).toContain(id);
    expect(levels.length).toBeGreaterThanOrEqual(30);
    expect(worlds.length).toBe(5);
    for (const w of worlds) expect(levels.filter((l) => l.world === w.id).length).toBeGreaterThanOrEqual(5);
  });

  it("uses many task types", () => {
    const kinds = new Set(levels.map((l) => (l.mode === "pick" ? `pick:${l.spec.kind}` : l.mode)));
    for (const k of ["family", "pyramid", "sorter", "things", "order", "sort2", "pick:compare", "pick:same", "pick:odd", "pick:pattern", "pick:fit", "pick:corners"]) expect(kinds).toContain(k);
  });

  it("gets harder inside each world, and each world ends harder than it starts", () => {
    for (const w of worlds) {
      const d = levels.filter((l) => l.world === w.id).map(difficulty);
      for (let i = 1; i < d.length; i++) expect(d[i], `${w.id} #${i + 1}`).toBeGreaterThanOrEqual(d[i - 1]!);
      expect(d[d.length - 1]!).toBeGreaterThan(d[0]!);
    }
  });

  it("every one-tap round has exactly one right answer, the one the game expects", () => {
    for (const l of levels) {
      if (l.mode !== "pick") continue;
      for (let seed = 1; seed <= 60; seed++) {
        const rounds = makeRounds(l.spec, l.rounds, createRng(seed * 7 + l.id.length));
        expect(rounds.length).toBe(l.rounds);
        for (const r of rounds) {
          const right = solveRound(r);
          expect(right, `${l.id} seed ${seed}: ${JSON.stringify(r)}`).toEqual([r.answer]);
          const n = r.kind === "compare" ? r.values.length : r.options.length;
          expect(n).toBeGreaterThanOrEqual(2);
          if (r.kind !== "compare" && r.kind !== "corners") {
            // No two options look the same.
            const keys = r.options.map((f) => `${f.shape}:${f.tint}:${f.size}:${f.turn ?? 0}`);
            expect(new Set(keys).size, `${l.id}: ${keys}`).toBe(keys.length);
          }
        }
      }
    }
  });

  it("order levels and colour+shape boxes can be finished", () => {
    for (const l of levels) {
      if (l.mode === "order") {
        const seen: number[] = [];
        for (let k = 0; k < l.count; k++) seen.push(nextInOrder(k, l.count, l.dir));
        expect(new Set(seen).size).toBe(l.count);
        expect(nextInOrder(l.count, l.count, l.dir)).toBe(0);
        expect(seen[0]).toBe(l.dir === "up" ? 1 : l.count);
      }
      if (l.mode === "sort2") {
        const keys = l.bins.map((b) => `${b.shape}:${b.tint}`);
        expect(new Set(keys).size).toBe(keys.length);
        // Each box shares its shape with one box and its colour with another: both must be looked at.
        for (const b of l.bins) {
          expect(l.bins.some((o) => o !== b && o.shape === b.shape)).toBe(true);
          expect(l.bins.some((o) => o !== b && o.tint === b.tint)).toBe(true);
        }
      }
    }
  });

  it("speaks Russian correctly", () => {
    expect(compareAsk("length", "most", 2)).toBe("Где длинный карандаш?");
    expect(compareAsk("height", "least", 3)).toBe("Где самая низкая ёлка?");
    expect(compareAsk("thick", "most", 3)).toBe("Где самая толстая книга?");
    expect(compareAsk("size", "most", 2, { name: "Яблоко", g: "n" })).toBe("Где большое яблоко?");
    expect(compareAsk("size", "least", 3, { name: "Рыбка", g: "f" })).toBe("Где самая маленькая рыбка?");
    expect(orderAsk("length", "up")).toBe("Поставь по порядку: от короткого к длинному.");
    expect(orderAsk("height", "down")).toBe("Поставь по порядку: от высокой к низкой.");
    expect(figName({ shape: "star", tint: "blue" })).toBe("Синяя звезда");
    expect(figName({ shape: "circle", tint: "red" })).toBe("Красный круг");
    expect(figName({ shape: "heart", tint: "green" })).toBe("Зелёное сердечко");
  });

  it("draws the new shapes and their corners", () => {
    for (const s of ["oval", "rect", "pentagon", "hexagon"] as Shape[]) {
      const d = shapePath(s, 50, 50, 40);
      expect(d.trim().endsWith("Z")).toBe(true);
      expect(d).not.toContain("NaN");
    }
    for (const [s, n] of Object.entries(CORNERS)) expect(cornerPoints(s as Shape, 50, 50, 40).length).toBe(n);
  });
});
