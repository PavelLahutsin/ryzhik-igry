import { describe, expect, it } from "vitest";
import { levels, roundShadows, roundsOf, specOf, thing, worlds } from "./levels";
import { difficulty, hintTarget, judge, noteFor, roundFeatures, rowsOf, shadowsWord, starsFor } from "./logic";
import { SHAPES, TWINS } from "./shapes";
import { OBJECTS } from "../../shared/objects";

const OLD_IDS = Array.from({ length: 15 }, (_, i) => `t${i + 1}`);

describe("teni levels", () => {
  it("has 36 levels with unique ids, the 15 old ids kept", () => {
    expect(levels).toHaveLength(36);
    const ids = levels.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of OLD_IDS) expect(ids).toContain(id);
    expect(ids[0]).toBe("t1");
  });

  it("every round is solvable: known pictures, one shadow each, decoys are nobody's", () => {
    for (const level of levels) {
      for (const round of roundsOf(level)) {
        const items = round.items.map((s) => specOf(s).id);
        const all = [...items, ...(round.decoys ?? []).map((s) => specOf(s).id)];
        expect(new Set(all).size, level.id).toBe(all.length);
        // Extra pictures have no shadow on the board, so they fit nowhere.
        const extra = (round.extra ?? []).map((s) => specOf(s).id);
        for (const id of extra) {
          expect(all, `${level.id} ${id}`).not.toContain(id);
          expect(() => thing(id), id).not.toThrow();
          for (const sh of all) expect(judge(id, sh, new Set())).toBe("wrong");
        }
        expect(items.length + extra.length, level.id).toBeLessThanOrEqual(8);
        expect(items.length, level.id).toBeGreaterThanOrEqual(2);
        expect(items.length, level.id).toBeLessThanOrEqual(6);
        expect(roundShadows(round), level.id).toBeLessThanOrEqual(8);
        for (const id of all) expect(() => thing(id), id).not.toThrow();
        // Each picture finds its own shadow and no other.
        for (const id of items) {
          expect(judge(id, id, new Set())).toBe("placed");
          for (const other of all) if (other !== id) expect(judge(id, other, new Set())).toBe("wrong");
        }
      }
    }
  });

  it("gets harder: within a world, and every world's easiest and hardest level beat the last world's", () => {
    const score = levels.map(difficulty);
    for (let i = 1; i < score.length; i++) expect(score[i]!, levels[i]!.id).toBeGreaterThanOrEqual(score[i - 1]!);
    const byWorld = worlds.map((w) => levels.filter((l) => l.world === w.id));
    for (const w of byWorld) expect(w.length).toBeGreaterThanOrEqual(3);
    for (let i = 1; i < byWorld.length; i++) {
      const prev = byWorld[i - 1]!.map(difficulty);
      const cur = byWorld[i]!.map(difficulty);
      expect(Math.min(...cur)).toBeGreaterThanOrEqual(Math.min(...prev));
      expect(Math.max(...cur)).toBeGreaterThan(Math.max(...prev));
    }
    expect(Math.max(...score)).toBe(score[score.length - 1]);
    expect(score[score.length - 1]! / score[0]!).toBeGreaterThan(10);
  });

  it("the board grows from 2 to 8 shadows; worlds in order, together", () => {
    const most = (id: string) => Math.max(...levels.filter((l) => l.world === id).flatMap((l) => roundsOf(l).map(roundShadows)));
    const peaks = worlds.map((w) => most(w.id));
    for (let i = 1; i < peaks.length; i++) expect(peaks[i]!).toBeGreaterThanOrEqual(peaks[i - 1]!);
    expect(roundShadows(levels[0]!)).toBe(2);
    expect(peaks[peaks.length - 1]).toBe(8);
    const seen: string[] = [];
    for (const l of levels) if (seen[seen.length - 1] !== l.world) seen.push(l.world!);
    expect(seen).toEqual(worlds.map((w) => w.id));
  });

  it("each new idea first shows up in its own world", () => {
    const first = (pick: (f: ReturnType<typeof roundFeatures>) => number) =>
      levels.find((l) => roundsOf(l).some((r) => pick(roundFeatures(r)) > 0))?.world;
    expect(first((f) => f.decoys)).toBe("friends");
    expect(first((f) => f.small + f.turned)).toBe("turn");
    expect(first((f) => f.hidden)).toBe("hide");
    expect(first((f) => f.extras)).toBe("odd");
    expect(levels.find((l) => roundsOf(l).length > 1)?.world).toBe("scene");
    expect(levels.filter((l) => l.world === "tricky").every((l) => roundFeatures(l).twins >= 2)).toBe(true);
  });

  it("uses many different pictures, few repeats", () => {
    const used = new Set(levels.flatMap((l) => roundsOf(l).flatMap((r) => [...r.items, ...(r.decoys ?? [])].map((s) => specOf(s).id.replace(/@s$/, "")))));
    expect(used.size).toBeGreaterThanOrEqual(80);
    const shapes = Object.keys(SHAPES);
    expect(shapes.length).toBeGreaterThanOrEqual(60);
    for (const id of shapes) expect(used.has(id), id).toBe(true);
  });

  it("every picture is a whole SVG with its own silhouette", () => {
    const seen = new Set<string>();
    for (const [id, s] of Object.entries(SHAPES)) {
      expect(id in OBJECTS, id).toBe(false);
      expect(s.svg.startsWith('<svg viewBox="0 0 100 100"'), id).toBe(true);
      expect(s.svg.endsWith("</svg>"), id).toBe(true);
      expect(s.svg).not.toMatch(/https?:\/\/(?!www\.w3\.org)/);
      expect(s.svg).not.toMatch(/NaN|undefined/);
      expect(seen.has(s.svg), id).toBe(false);
      seen.add(s.svg);
      expect(s.name.length).toBeGreaterThan(2);
    }
    for (const [a, b] of TWINS) {
      expect(() => thing(a)).not.toThrow();
      expect(() => thing(b)).not.toThrow();
    }
  });

  it("small copies are named and marked", () => {
    expect(thing("ball@s")).toMatchObject({ id: "ball@s", small: true, name: "Мячик (поменьше)" });
    expect(thing("ball").small).toBe(false);
  });
});

describe("teni rules", () => {
  it("hints at a thing still in the tray", () => {
    expect(hintTarget(["a", "b"], new Set(["a"]))).toBe("b");
    expect(hintTarget(["a"], new Set(["a"]))).toBeNull();
  });
  it("places only on the own silhouette", () => {
    const filled = new Set(["star"]);
    expect(judge("apple", "apple", filled)).toBe("placed");
    expect(judge("apple", "house", filled)).toBe("wrong");
    expect(judge("apple", "star", filled)).toBe("none");
    expect(judge("apple", null, filled)).toBe("none");
  });
  it("lays silhouettes out in short rows", () => {
    expect(rowsOf(2)).toEqual([2]);
    expect(rowsOf(3)).toEqual([3]);
    expect(rowsOf(4)).toEqual([2, 2]);
    expect(rowsOf(5)).toEqual([3, 2]);
    expect(rowsOf(6)).toEqual([3, 3]);
    expect(rowsOf(7)).toEqual([4, 3]);
    expect(rowsOf(8)).toEqual([4, 4]);
  });
  it("gives stars kindly (shared rule)", () => {
    expect([starsFor(0).stars, starsFor(1).stars, starsFor(3).stars, starsFor(8).stars]).toEqual([3, 3, 2, 1]);
    expect(starsFor(0, 1).stars).toBe(2);
  });
  it("says what is tricky in a round", () => {
    expect(noteFor({ items: ["apple", "star"] })).toBe("Перетащи картинку на её тень.");
    expect(noteFor({ items: ["apple"], decoys: ["star"] })).toContain("Одна тень лишняя!");
    expect(noteFor({ items: [{ id: "dog", flip: true }] })).toContain("перевернулись");
    expect(noteFor({ items: [{ id: "dog", hide: "bush" }] })).toContain("прячутся");
  });
  it("counts shadows in Russian", () => {
    expect([1, 2, 5, 11, 21, 22, 14].map(shadowsWord)).toEqual(["1 тень", "2 тени", "5 теней", "11 теней", "21 тень", "22 тени", "14 теней"]);
  });
});
