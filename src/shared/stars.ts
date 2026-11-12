/**
 * One star rule for every level game, so a child (and a parent) can tell why
 * the card shows 1, 2 or 3 stars. Nothing is ever lost — a finished level
 * always gives at least one star, and a replay can only raise it.
 *
 *  ★★★ — no lamp hints, and no more than `free` mistakes;
 *  ★★  — at most one hint, and no more than `free + more` mistakes;
 *  ★   — the level is done with more help.
 */
export type Score = { stars: 1 | 2 | 3; why: string };

export type StarRule = {
  /** Mistakes still worth three stars (default 1). */
  free?: number;
  /** Extra mistakes still worth two stars (default 2). */
  more?: number;
};

export function rate(mistakes: number, hints: number, rule: StarRule = {}): Score {
  const free = Math.max(0, Math.floor(rule.free ?? 1));
  const more = Math.max(1, Math.floor(rule.more ?? 2));
  const m = Math.max(0, Math.floor(mistakes));
  const h = Math.max(0, Math.floor(hints));
  if (h === 0 && m <= free) {
    return { stars: 3, why: m === 0 ? "3 звезды — без ошибок и без подсказок!" : "3 звезды — без подсказок!" };
  }
  const wrong = m > free;
  const reason = h > 0 && wrong ? "были подсказки и ошибки" : h > 1 ? "было много подсказок" : h === 1 ? "была подсказка" : "было много ошибок";
  if (h <= 1 && m <= free + more) {
    return { stars: 2, why: `2 звезды — ${reason}. Без ${h > 0 ? "подсказок" : "ошибок"} будет 3!` };
  }
  return { stars: 1, why: `1 звезда — ${reason}. Попробуй ещё раз сам — будет больше!` };
}

/** The same rule in words, for «Как играть» and «Родителям». */
export const STAR_RULES =
  "Звёзды: ★★★ — без подсказок-лампочек и почти без ошибок; ★★ — была одна подсказка или несколько ошибок; ★ — уровень пройден с помощью. Проиграть нельзя, а лучший результат сохраняется — уровень можно переиграть.";

export function isScore(value: unknown): value is Score {
  return !!value && typeof value === "object" && "stars" in value && "why" in value;
}
