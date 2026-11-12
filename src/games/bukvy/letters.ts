import { WORDS } from "./words";
import type { Picture } from "../risovalka/pictures";

/**
 * «Цифры и буквы»: digits 0–9 and the 33 letters of the Russian alphabet,
 * printed capitals in a 200 × 200 box. Strokes go in the order a child
 * writes them (numbers on the picture show it); each starts at its green dot.
 * Digits keep their old ids d1…d9 from «Рисовалка», so stars carry over.
 */
export const worlds = [
  { id: "digits", title: "Цифры", color: "#6db3d4" },
  { id: "letters1", title: "Буквы А — П", color: "#f27aa0" },
  { id: "letters2", title: "Буквы Р — Я", color: "#9b6cd8" },
];

const DIGITS: Record<number, string[]> = {
  1: ["M78 62 L106 38 V164"],
  2: ["M64 70 C 64 36 136 36 136 74 C 136 106 66 138 64 162 H142"],
  3: ["M64 54 C 92 28 142 40 132 76 C 126 96 104 100 96 100 C 132 100 146 122 136 146 C 124 172 78 170 62 150"],
  4: ["M122 164 V38 L58 126 H148"],
  5: ["M138 42 H76 L70 96 C 96 84 142 90 140 126 C 138 162 90 170 64 150"],
  6: ["M132 48 C 100 32 64 58 64 110 C 64 150 88 164 104 164 C 130 164 142 144 142 126 C 142 104 126 92 104 92 C 84 92 70 104 66 118"],
  7: ["M62 42 H142 L94 164"],
  8: ["M100 100 C 68 90 68 42 100 42 C 132 42 132 90 100 100 C 64 110 64 162 100 162 C 136 162 136 110 100 100"],
  9: ["M136 84 C 132 102 116 110 100 110 C 80 110 64 96 64 76 C 64 56 82 42 100 42 C 122 42 138 58 136 92 C 134 132 116 162 74 160"],
  0: ["M100 38 C 56 38 56 162 100 162 C 144 162 144 38 100 38"],
};

type Letter = { ch: string; strokes: string[] };

/** Top 36, bottom 164; Ё and Й sit a little lower for their marks. */
const LETTERS: Letter[] = [
  { ch: "А", strokes: ["M100 36 L56 164", "M100 36 L144 164", "M74 120 H126"] },
  { ch: "Б", strokes: ["M62 36 V164", "M62 36 H138", "M62 96 H104 C 150 96 150 164 104 164 H62"] },
  { ch: "В", strokes: ["M62 36 V164", "M62 36 H100 C 136 36 136 96 100 96 H62", "M62 96 H106 C 148 96 148 164 106 164 H62"] },
  { ch: "Г", strokes: ["M66 36 V164", "M66 36 H140"] },
  { ch: "Д", strokes: ["M84 36 C 84 96 76 124 60 140", "M84 36 H134 V140", "M46 166 V140 H154 V166"] },
  { ch: "Е", strokes: ["M64 36 V164", "M64 36 H138", "M64 100 H128", "M64 164 H140"] },
  { ch: "Ё", strokes: ["M64 50 V170", "M64 50 H138", "M64 110 H128", "M64 170 H140", "M82 22 A6 6 0 1 1 81.9 22", "M118 22 A6 6 0 1 1 117.9 22"] },
  { ch: "Ж", strokes: ["M100 36 V164", "M54 36 L100 100 L52 164", "M146 36 L100 100 L148 164"] },
  { ch: "З", strokes: ["M60 56 C 72 34 136 30 136 66 C 136 90 114 98 96 98 C 122 98 142 108 142 132 C 142 170 76 172 58 146"] },
  { ch: "И", strokes: ["M60 36 V164", "M60 164 L140 36", "M140 36 V164"] },
  { ch: "Й", strokes: ["M60 50 V170", "M60 170 L140 50", "M140 50 V170", "M80 18 Q 100 36 120 18"] },
  { ch: "К", strokes: ["M62 36 V164", "M140 36 L62 106", "M88 84 L144 164"] },
  { ch: "Л", strokes: ["M90 36 C 84 82 76 130 54 164", "M90 36 H140 V164"] },
  { ch: "М", strokes: ["M52 164 V36 L100 120 L148 36 V164"] },
  { ch: "Н", strokes: ["M60 36 V164", "M140 36 V164", "M60 100 H140"] },
  { ch: "О", strokes: ["M100 36 C 48 36 48 164 100 164 C 152 164 152 36 100 36"] },
  { ch: "П", strokes: ["M60 164 V36 H140 V164"] },
  { ch: "Р", strokes: ["M64 36 V164", "M64 36 H104 C 146 36 146 104 104 104 H64"] },
  { ch: "С", strokes: ["M142 60 C 132 42 116 36 100 36 C 66 36 52 70 52 100 C 52 136 72 164 100 164 C 120 164 134 154 142 140"] },
  { ch: "Т", strokes: ["M54 36 H146", "M100 36 V164"] },
  { ch: "У", strokes: ["M56 36 L100 116", "M146 36 L100 134 C 90 154 78 166 58 162"] },
  { ch: "Ф", strokes: ["M100 30 V170", "M100 62 C 40 62 40 132 100 132 C 160 132 160 62 100 62"] },
  { ch: "Х", strokes: ["M58 36 L142 164", "M142 36 L58 164"] },
  { ch: "Ц", strokes: ["M58 36 V150 H152 V176", "M136 36 V150"] },
  { ch: "Ч", strokes: ["M62 36 V76 C 62 104 84 112 138 104", "M140 36 V164"] },
  { ch: "Ш", strokes: ["M50 36 V164 H150 V36", "M100 36 V164"] },
  { ch: "Щ", strokes: ["M46 36 V150 H160 V176", "M98 36 V150", "M146 36 V150"] },
  { ch: "Ъ", strokes: ["M42 36 H74 V164 H110 C 152 164 152 100 110 100 H74"] },
  { ch: "Ы", strokes: ["M52 36 V164 H86 C 124 164 124 100 86 100 H52", "M148 36 V164"] },
  { ch: "Ь", strokes: ["M66 36 V164 H108 C 152 164 152 100 108 100 H66"] },
  { ch: "Э", strokes: ["M58 58 C 70 40 86 36 100 36 C 134 36 150 70 150 100 C 150 132 132 164 100 164 C 86 164 68 158 58 142", "M92 100 H150"] },
  { ch: "Ю", strokes: ["M46 36 V164", "M46 100 H82", "M120 36 C 80 36 80 164 120 164 C 160 164 160 36 120 36"] },
  { ch: "Я", strokes: ["M140 164 V36 H100 C 56 36 56 104 100 104 H140", "M104 104 L58 164"] },
];

/** Letters with no word that starts with them: the word shows where they live. */
const INSIDE = new Set(["Ъ", "Ы", "Ь"]);

/** `art`: the word's picture (SVG markup), on the letter card and the win card. */
export type LetterPicture = Picture & { letter?: string; word?: string; art?: string; inside?: boolean };

const digitOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

export const levels: LetterPicture[] = [
  ...digitOrder.map(
    (n): LetterPicture => ({
      id: `d${n}`,
      world: "digits",
      title: `Цифра ${n}`,
      ink: "#3a8fd4",
      alive: "count",
      count: n,
      done: "",
      strokes: DIGITS[n]!,
      fill: "",
      order: true,
    }),
  ),
  ...LETTERS.map((l, i): LetterPicture => {
    const w = WORDS[l.ch];
    if (!w) throw new Error(`Нет слова для буквы ${l.ch}`);
    return {
      id: `b${i + 1}`,
      world: i < 17 ? "letters1" : "letters2",
      title: `Буква ${l.ch}`,
      ink: i < 17 ? "#e0507f" : "#8256c8",
      alive: "glow",
      done: INSIDE.has(l.ch) ? `${l.ch} — ${w.word}` : `${l.ch} — ${w.word}!`,
      strokes: l.strokes,
      fill: "",
      order: true,
      letter: l.ch,
      word: w.word,
      art: w.svg,
      inside: INSIDE.has(l.ch),
    };
  }),
];

/** Digit ids that used to live in «Рисовалка». */
export const MOVED_DIGITS = digitOrder.filter((n) => n > 0).map((n) => `d${n}`);
