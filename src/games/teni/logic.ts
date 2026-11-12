import { rate, type Score } from "../../shared/stars";
import { roundsOf, specOf, type Round, type TeniLevel } from "./levels";
import { TWINS } from "./shapes";

/** Shadow matching rules, no DOM. */
export type DropResult = "placed" | "wrong" | "none";

/**
 * `target` is the id of the silhouette the piece was dropped on (or null
 * when it landed nowhere near one). Already filled silhouettes don't count.
 */
export function judge(itemId: string, target: string | null, filled: ReadonlySet<string>): DropResult {
  if (target === null || filled.has(target)) return "none";
  return target === itemId ? "placed" : "wrong";
}

export function starsFor(misses: number, hints = 0): Score {
  return rate(misses, hints, { free: 1, more: 2 });
}

/** Silhouette rows: up to 3 per row for six, 4 per row for seven or eight. */
export function rowsOf(count: number): number[] {
  if (count <= 3) return [count];
  if (count === 4) return [2, 2];
  if (count <= 6) return [3, count - 3];
  return [4, count - 4];
}

/** The thing the hint shows: the first one still in the tray. */
export function hintTarget(items: readonly string[], filled: ReadonlySet<string>): string | null {
  return items.find((id) => !filled.has(id)) ?? null;
}

const base = (id: string): string => (id.endsWith("@s") ? id.slice(0, -2) : id);

/** What makes one round hard, counted. */
export function roundFeatures(round: Round): {
  items: number;
  decoys: number;
  /** Pairs of almost the same outline on the board (incl. big and small). */
  twins: number;
  turned: number;
  hidden: number;
  small: number;
  /** Pictures with no shadow in the tray. */
  extras: number;
} {
  const all = [...round.items, ...(round.decoys ?? [])].map(specOf);
  const pics = [...all, ...(round.extra ?? []).map(specOf)];
  const ids = new Set(pics.map((s) => base(s.id)));
  let twins = TWINS.filter(([a, b]) => ids.has(a) && ids.has(b)).length;
  const bases = pics.map((s) => base(s.id));
  twins += bases.length - new Set(bases).size;
  return {
    items: round.items.length,
    decoys: round.decoys?.length ?? 0,
    twins,
    turned: all.filter((s) => s.flip || s.turn !== 0).length,
    hidden: all.filter((s) => s.hide).length,
    small: all.filter((s) => s.id.endsWith("@s")).length,
    extras: round.extra?.length ?? 0,
  };
}

/**
 * One number for how hard a level is: each picture 1, an extra shadow 1.5,
 * a pair of look-alikes 1, a turned or hidden shadow 1, a small copy 0.5,
 * an extra picture with no shadow 2 (every picture has to be checked),
 * and 1 for every round after the first.
 */
export function difficulty(level: TeniLevel): number {
  const rounds = roundsOf(level);
  let sum = rounds.length - 1;
  for (const r of rounds) {
    const f = roundFeatures(r);
    sum += f.items + 1.5 * f.decoys + f.twins + f.turned + f.hidden + 0.5 * f.small + 2 * f.extras;
  }
  return sum;
}

const EXTRA = ["", "Одна тень лишняя!", "Две тени лишние!", "Три тени лишние!"];

/** The line under the board: what to do and what is new or tricky here. */
export function noteFor(round: Round): string {
  const f = roundFeatures(round);
  const parts = ["Перетащи картинку на её тень."];
  if (f.extras) parts.push(f.extras === 1 ? "Одной картинке тени нет — оставь её!" : "Некоторым картинкам тени нет — оставь их!");
  else if (f.hidden) parts.push("Тени прячутся — узнай по кусочку!");
  else if (f.turned) parts.push("Некоторые тени перевернулись!");
  else if (f.small) parts.push("Смотри на размер!");
  else if (f.twins >= 2) parts.push("Тени похожи — смотри на мелочи!");
  if (f.decoys) parts.push(EXTRA[f.decoys] ?? `Лишних теней: ${f.decoys}!`);
  return parts.slice(0, 3).join(" ");
}

/** "1 тень", "3 тени", "7 теней". */
export function shadowsWord(n: number): string {
  const d = n % 10;
  const dd = n % 100;
  if (d === 1 && dd !== 11) return `${n} тень`;
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return `${n} тени`;
  return `${n} теней`;
}
