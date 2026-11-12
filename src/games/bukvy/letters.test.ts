import { describe, expect, it } from "vitest";
import { levels, MOVED_DIGITS, worlds } from "./letters";

describe("«Цифры и буквы»", () => {
  it("has digits 0–9 and all 33 Russian letters", () => {
    const digits = levels.filter((l) => l.world === "digits");
    expect(digits.map((d) => d.count).sort()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const letters = levels.filter((l) => l.letter).map((l) => l.letter).join("");
    expect(letters).toBe("АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ");
    expect(new Set(levels.map((l) => l.id)).size).toBe(levels.length);
  });
  it("keeps the old digit ids from «Рисовалка»", () => {
    expect(MOVED_DIGITS).toEqual(["d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9"]);
    for (const id of MOVED_DIGITS) expect(levels.some((l) => l.id === id)).toBe(true);
  });
  it("every level shows the order of its lines, words for letters", () => {
    for (const l of levels) {
      expect(l.order).toBe(true);
      expect(worlds.some((w) => w.id === l.world)).toBe(true);
      for (const d of l.strokes) expect(d).toMatch(/^M[\d. ]+/);
      if (l.letter) expect(l.word).toBeTruthy();
    }
  });
});

describe("letter pictures", () => {
  it("every one of the 33 letters has its word and a whole vector picture", async () => {
    const { WORDS } = await import("./words");
    const letters = levels.filter((l) => l.letter);
    expect(letters).toHaveLength(33);
    expect(Object.keys(WORDS).join("")).toBe("АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ");
    const seen = new Set<string>();
    for (const l of letters) {
      expect(l.art, l.letter).toBeTruthy();
      expect(l.art!.startsWith('<svg viewBox="0 0 100 100"'), l.letter).toBe(true);
      expect(l.art!.endsWith("</svg>"), l.letter).toBe(true);
      expect(l.art).not.toMatch(/NaN|undefined|https?:\/\/(?!www\.w3\.org)/);
      expect(seen.has(l.art!), `${l.letter}: same picture as another letter`).toBe(false);
      seen.add(l.art!);
      expect(l.word, l.letter).toBe(WORDS[l.letter!]!.word);
      // The word starts with its letter; Ъ, Ы, Ь have it inside.
      if (l.inside) expect(l.word!.includes(l.letter!), l.letter).toBe(true);
      else expect(l.word![0], l.letter).toBe(l.letter);
      expect(l.done).toContain(l.word!);
    }
  });
});
