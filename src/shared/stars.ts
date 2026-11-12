/**
 * One star rule for every level game, so a child (and a parent) can tell why
 * the card shows 1, 2 or 3 stars. Nothing is ever lost — a finished level
 * always gives at least one star, and a replay can only raise it.
 *
 * A hint never drops the score straight to one star:
 *  ★★★ — no lamp hints, and no more than `free` mistakes;
 *  ★★  — at most one hint, OR no more than `two` mistakes;
 *  ★   — more than one hint AND more than `two` mistakes.
 *
 * Games where there are no mistakes (only the lamp) use `rateHints`.
 * Every game's numbers live in STARS below, and «Как играть» / «Родителям»
 * print them with `starLine()` — so the text is the code (stars.test.ts).
 */
export type Score = { stars: 1 | 2 | 3; why: string };

export type StarRule = {
  /** Mistakes still worth three stars (default 1). */
  free?: number;
  /** Mistakes still worth two stars even with many hints (default 3). */
  two?: number;
};

export function rate(mistakes: number, hints: number, rule: StarRule = {}): Score {
  const free = Math.max(0, Math.floor(rule.free ?? 1));
  const two = Math.max(free + 1, Math.floor(rule.two ?? 3));
  const m = Math.max(0, Math.floor(mistakes));
  const h = Math.max(0, Math.floor(hints));
  if (h === 0 && m <= free) {
    return { stars: 3, why: m === 0 ? "3 звезды — без ошибок и без подсказок!" : "3 звезды — без подсказок!" };
  }
  if (h <= 1 || m <= two) {
    const wrong = m > free;
    const reason = h > 0 && wrong ? "были подсказки и ошибки" : h > 1 ? "было несколько подсказок" : h === 1 ? "была подсказка" : "было много ошибок";
    return { stars: 2, why: `2 звезды — ${reason}. Без ${h > 0 ? "подсказок" : "ошибок"} будет 3!` };
  }
  return { stars: 1, why: "1 звезда — было много подсказок и ошибок. Попробуй ещё раз без подсказки — будет больше!" };
}

/** Lamp-only games: 0 hints ★★★, 1–2 hints ★★, more ★. */
export const HINTS_TWO = 2;
export function rateHints(hints: number): Score {
  const h = Math.max(0, Math.floor(hints));
  if (h === 0) return { stars: 3, why: "3 звезды — без подсказок!" };
  if (h <= HINTS_TWO) return { stars: 2, why: `2 звезды — ${h === 1 ? "была подсказка" : "было две подсказки"}. Без подсказок будет 3!` };
  return { stars: 1, why: "1 звезда — было много подсказок. Попробуй ещё раз без подсказки — будет больше!" };
}

/**
 * How many mistakes are allowed: a fixed number, or a part of the level size
 * (things, pieces, pairs) with a minimum. `say` is the words for the card and
 * must name the same part (checked in stars.test.ts).
 */
export type Amount = number | { part: number; min: number; say: string };
export type StarSpec =
  | { kind: "mistakes"; free: Amount; two: Amount; /** «ошибки», «ошибок» */ unit: [string, string] }
  | { kind: "hints" };

export const amount = (a: Amount, size = 0): number => (typeof a === "number" ? a : Math.max(a.min, Math.floor(a.part * size)));

/** Stars by a game's spec; `size` is the level size for part-of-size rules. */
export function rateBy(spec: StarSpec, mistakes: number, hints: number, size = 0): Score {
  if (spec.kind === "hints") return rateHints(hints);
  return rate(mistakes, hints, { free: amount(spec.free, size), two: amount(spec.two, size) });
}

const MIST = { kind: "mistakes" } as const;
const ERR: [string, string] = ["ошибки", "ошибок"];
/** The numbers of every level game (by game id). */
export const STARS = {
  teni: { ...MIST, free: 1, two: 3, unit: ERR },
  odezhda: { ...MIST, free: 1, two: 3, unit: ERR },
  professii: { ...MIST, free: 1, two: 4, unit: ERR },
  stroyka: { ...MIST, free: 1, two: 4, unit: ERR },
  tochki: { ...MIST, free: 1, two: 4, unit: ["неверной точки", "неверных точек"] },
  risovalka: { ...MIST, free: 2, two: 6, unit: ["съезда с линии", "съездов с линии"] },
  bukvy: { ...MIST, free: 2, two: 6, unit: ["съезда с линии", "съездов с линии"] },
  sortirovka: {
    ...MIST,
    free: { part: 0.25, min: 1, say: "ошибок не больше четверти предметов (1 можно всегда)" },
    two: { part: 0.5, min: 3, say: "ошибок не больше половины предметов (3 можно всегда)" },
    unit: ERR,
  },
  formy: {
    ...MIST,
    free: { part: 0.25, min: 1, say: "ошибок не больше четверти шагов (1 можно всегда)" },
    two: { part: 0.5, min: 3, say: "ошибок не больше половины шагов (3 можно всегда)" },
    unit: ERR,
  },
  mozaika: {
    ...MIST,
    free: { part: 0.5, min: 1, say: "ошибок не больше половины кусочков" },
    two: { part: 1, min: 1, say: "ошибок не больше, чем кусочков" },
    unit: ERR,
  },
  "najdi-paru": {
    ...MIST,
    free: { part: 1, min: 1, say: "промахов не больше, чем пар (троек) на поле" },
    two: { part: 2, min: 1, say: "промахов не больше двух на каждую пару (тройку)" },
    unit: ["промаха", "промахов"],
  },
  sliyanie: { kind: "hints" },
  labirint: { kind: "hints" },
} satisfies Record<string, StarSpec>;

function mistakesText(a: Amount, unit: [string, string]): string {
  if (typeof a !== "number") return a.say;
  return a === 0 ? `без ${unit[1]}` : `не больше ${a} ${a === 1 ? unit[0] : unit[1]}`;
}

/** The rule in words, for «Как играть» (one line, « · » between stars). */
export function starLine(spec: StarSpec): string {
  if (spec.kind === "hints") return `★★★ — без лампочки · ★★ — одна или две лампочки · ★ — больше ${HINTS_TWO} лампочек`;
  return [
    `★★★ — без лампочки и ${mistakesText(spec.free, spec.unit)}`,
    `★★ — не больше одной лампочки или ${mistakesText(spec.two, spec.unit)}`,
    `★ — больше одной лампочки и больше ${spec.unit[1]}`,
  ].join(" · ");
}

/** The same rule in words, for «Родителям». */
export const STAR_RULES =
  "Звёзды: ★★★ — без подсказок-лампочек и почти без ошибок; ★★ — не больше одной лампочки или немного ошибок; ★ — только если было больше одной лампочки и много ошибок. Сколько ошибок можно — написано у каждой игры в «Как играть». Одна лампочка никогда не опускает до одной звезды. Проиграть нельзя, а лучший результат сохраняется — уровень можно переиграть.";

export function isScore(value: unknown): value is Score {
  return !!value && typeof value === "object" && "stars" in value && "why" in value;
}
