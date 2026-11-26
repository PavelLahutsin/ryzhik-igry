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
  { id: "strochnye", title: "Строчные буквы", color: "#5aaa7a" },
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
  { ch: "А", strokes: ["M88 36 L56 164", "M112 36 L144 164", "M88 36 H112", "M67 120 H133"] },
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

/** Printed lowercase а–я (v22). Strokes share the 200×200 box with the capitals. */
const LOWER: Letter[] = [
  { ch: "а", strokes: [
        "M68 83 C77 73 89 70 101 70 C123 70 135 82 135 104 V164",
        "M135 107 C119 104 88 104 72 116 C55 129 59 153 77 161 C98 170 123 157 135 141"
      ] },
  { ch: "б", strokes: [
        "M136 36 C124 46 101 39 83 49 C63 60 60 86 60 119",
        "M60 119 C60 94 77 76 100 76 C124 76 140 94 140 120 C140 146 124 164 100 164 C75 164 60 146 60 119"
      ] },
  { ch: "в", strokes: [
        "M66 72 V164",
        "M66 72 H101 C143 72 145 114 102 114 H66",
        "M102 114 C150 114 150 164 103 164 H66"
      ] },
  { ch: "г", strokes: [
        "M68 72 V164",
        "M68 72 H136"
      ] },
  { ch: "д", strokes: [
        "M86 72 L78 124 Q74 147 61 160",
        "M86 72 H131 V160",
        "M49 181 V160 H151 V181"
      ] },
  { ch: "е", strokes: [
        "M59 115 H140 C140 89 125 70 102 70 C76 70 59 90 59 117 C59 145 76 164 103 164 Q125 164 139 150"
      ] },
  { ch: "ё", strokes: [
                "M59 121 H140 C140 96 125 78 102 78 C76 78 59 97 59 123 C59 150 76 168 103 168 Q125 168 139 154",
        "M81 44 A6 6 0 1 1 80.9 44",
        "M119 44 A6 6 0 1 1 118.9 44"
      ] },
  { ch: "ж", strokes: [
        "M45 72 L87 117 L43 164",
        "M100 72 V164",
        "M155 72 L113 117 L157 164",
        "M87 117 H113"
      ] },
  { ch: "з", strokes: [
        "M65 83 C78 70 97 67 114 73 C140 82 137 111 105 115 L93 116",
        "M93 116 C117 114 138 122 138 139 C138 156 121 164 100 164 Q77 164 62 150"
      ] },
  { ch: "и", strokes: [
        "M64 72 V164",
        "M64 164 L136 72",
        "M136 72 V164"
      ] },
  { ch: "й", strokes: [
        "M64 78 V168",
        "M64 168 L136 78",
        "M136 78 V168",
        "M79 41 C83 60 117 60 121 41"
      ] },
  { ch: "к", strokes: [
        "M65 72 V164",
        "M135 72 L91 116 H65",
        "M91 116 L139 164"
      ] },
  { ch: "л", strokes: [
        "M83 72 L76 132 Q72 164 51 164",
        "M83 72 H138 V164"
      ] },
  { ch: "м", strokes: [
        "M53 72 V164",
        "M53 72 L100 151 L147 72",
        "M147 72 V164"
      ] },
  { ch: "н", strokes: [
        "M64 72 V164",
        "M136 72 V164",
        "M64 117 H136"
      ] },
  { ch: "о", strokes: [
        "M100 70 C45 70 45 164 100 164 C155 164 155 70 100 70"
      ] },
  { ch: "п", strokes: [
                "M64 72 V164",
        "M64 72 H136",
        "M136 72 V164"
      ] },
  { ch: "р", strokes: [
        "M62 72 V188",
        "M62 95 C70 76 84 70 101 70 C126 70 142 90 142 116 C142 144 126 164 101 164 C82 164 69 153 62 140"
      ] },
  { ch: "с", strokes: [
        "M137 84 C128 74 116 70 103 70 C76 70 60 91 60 117 C60 144 77 164 103 164 Q124 164 138 150"
      ] },
  { ch: "т", strokes: [
        "M100 72 V164",
        "M57 72 H143"
      ] },
  { ch: "у", strokes: [
        "M57 72 L101 153",
        "M139 72 L91 174 Q83 190 64 186"
      ] },
  { ch: "ф", strokes: [
                "M100 39 V188",
        "M100 78 C48 78 48 156 100 156 C152 156 152 78 100 78"
      ] },
  { ch: "х", strokes: [
        "M60 72 L140 164",
        "M140 72 L60 164"
      ] },
  { ch: "ц", strokes: [
        "M60 72 V162",
        "M130 72 V162",
        "M60 162 H145 V185"
      ] },
  { ch: "ч", strokes: [
        "M64 72 V99 C64 125 88 133 135 113",
        "M135 72 V164"
      ] },
  { ch: "ш", strokes: [
        "M50 72 V164",
        "M100 72 V164",
        "M150 72 V164",
        "M50 164 H150"
      ] },
  { ch: "щ", strokes: [
        "M44 72 V162",
        "M94 72 V162",
        "M144 72 V162",
        "M44 162 H158 V185"
      ] },
  { ch: "ъ", strokes: [
        "M48 72 H80 V164",
        "M80 115 H109 C158 115 158 164 109 164 H80"
      ] },
  { ch: "ы", strokes: [
        "M48 72 V164",
        "M48 115 H78 C127 115 127 164 78 164 H48",
        "M151 72 V164"
      ] },
  { ch: "ь", strokes: [
        "M65 72 V164",
        "M65 115 H101 C150 115 150 164 101 164 H65"
      ] },
  { ch: "э", strokes: [
        "M62 84 C72 74 85 70 98 70 C124 70 141 91 141 117 C141 144 124 164 98 164 Q77 164 62 150",
        "M85 117 H141"
      ] },
  { ch: "ю", strokes: [
        "M42 72 V164",
        "M122 70 C100 70 86 90 86 117 C86 144 100 164 122 164 C144 164 158 144 158 117 C158 90 144 70 122 70",
        "M42 117 H86"
      ] },
  { ch: "я", strokes: [
        "M136 72 V164",
        "M136 72 H99 C51 72 51 119 99 119 H136",
        "M99 119 L62 164"
      ] },
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
  ...LOWER.map((l, i): LetterPicture => {
    const upper = l.ch.toUpperCase();
    const w = WORDS[upper];
    if (!w) throw new Error(`Нет слова для буквы ${l.ch}`);
    return {
      id: `c${i + 1}`,
      world: "strochnye",
      title: `Буква ${l.ch}`,
      ink: "#5aaa7a",
      alive: "glow",
      done: INSIDE.has(upper) ? `${l.ch} — ${w.word}` : `${l.ch} — ${w.word}!`,
      strokes: l.strokes,
      fill: "",
      order: true,
      help: "less",
      letter: l.ch,
      word: w.word,
      art: w.svg,
      inside: INSIDE.has(upper),
    };
  }),
];

/** Digit ids that used to live in «Рисовалка». */
export const MOVED_DIGITS = digitOrder.filter((n) => n > 0).map((n) => `d${n}`);
