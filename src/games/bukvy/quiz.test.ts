import { describe, expect, it } from "vitest";
import { ABC, FIRST_LETTER_LEVELS } from "./abc";
import { allLevels, allWorlds } from "./all";
import { wordArt } from "./word-art";

const ALPHABET = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ".split("");
const LONG = new Set("МНЛРСЗШЖФВХАОУИЫЭ".split(""));

describe("«Азбука-картинки» v23", () => {
  it("has the 33 letters in order, each with pictures and its own file", () => {
    expect(ABC.map((l) => l.letter)).toEqual(ALPHABET);
    expect(new Set(ABC.map((l) => l.file)).size).toBe(33);
    for (const l of ABC) {
      expect(l.file).toMatch(/^bukva-[a-z-]+$/);
      expect(l.words.length, l.letter).toBeGreaterThanOrEqual(l.letter === "Й" || l.letter === "Ъ" ? 1 : 2);
      for (const w of l.words) {
        expect(wordArt(w.art), `${l.letter} ${w.word}`).toBeTruthy();
        if (w.art.startsWith("<svg")) expect(w.art).not.toMatch(/<text|<image|href|url\(|http(?!:\/\/www\.w3\.org)|`/);
        // The word has the letter: first (or, for Ъ Ы Ь, inside as the capital).
        expect(w.word.includes(l.letter), `${l.letter} ${w.word}`).toBe(true);
        if (!"ЪЫЬ".includes(l.letter)) expect(w.word[0]).toBe(l.letter);
      }
    }
  });
  it("says the sound and the word, as the speech therapist said", () => {
    for (const l of ABC) {
      if ("ЁЮЯЙВН".includes(l.letter)) expect(l.say, l.letter).toBe(`${l.words[0]!.word}!`);
      else if (l.letter === "Ь") expect(l.say).toBe("Мягкий знак. Делает звук мягким.");
      else if (l.letter === "Ъ") expect(l.say).toBe("Твёрдый знак. Разделяет звуки.");
      else {
        expect(l.say.startsWith(`${l.letter}! `), l.letter).toBe(true);
        const spoken = l.say.slice(3).toLowerCase();
        const word = l.words[0]!.word.toLowerCase();
        // Plosives are not stretched; the long sounds may be.
        if (!LONG.has(l.letter)) expect(spoken, l.letter).toBe(word);
        else expect(spoken.replace(/(.)\1+/g, "$1"), l.letter).toBe(word.replace(/(.)\1+/g, "$1"));
      }
      expect(l.say).not.toMatch(/молод|умни|мастер|сыщик|сынок/i);
    }
  });
});

describe("«На какую букву?» v23", () => {
  it("every answer is among the options and is the first letter, with a picture", () => {
    expect(FIRST_LETTER_LEVELS.length).toBe(24);
    for (const l of FIRST_LETTER_LEVELS)
      for (const r of l.rounds) {
        expect(r.options, `${l.id} ${r.word}`).toContain(r.answer);
        expect(r.word[0], `${l.id} ${r.word}`).toBe(r.answer);
        expect(new Set(r.options).size).toBe(r.options.length);
        expect(wordArt(r.word), r.word).toBeTruthy();
      }
    expect(new Set(FIRST_LETTER_LEVELS.map((l) => l.title)).size).toBe(24);
  });
  it("«Цифры и буквы» keeps every level id unique, and every world has levels", () => {
    expect(new Set(allLevels.map((l) => l.id)).size).toBe(allLevels.length);
    for (const w of allWorlds) expect(allLevels.some((l) => l.world === w.id), w.id).toBe(true);
    expect(allWorlds.map((w) => w.id)).toEqual(["digits", "schitaem", "skolko", "bolshe", "letters1", "letters2", "azbuka", "pervaya", "strochnye"]);
  });
});
