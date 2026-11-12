import { rateBy, STARS, type Score } from "../../shared/stars";
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
  return rateBy(STARS.teni, misses, hints);
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

type Features = ReturnType<typeof roundFeatures>;
export type Mechanic = "extras" | "hidden" | "turned" | "small" | "twins";
/** The tricks of a round, in the order the note names them. */
const MECHANICS: ReadonlyArray<[Mechanic, (f: Features) => boolean, (f: Features) => string]> = [
  ["extras", (f) => f.extras > 0, (f) => (f.extras === 1 ? "У одной картинки нет тени — оставь её!" : "У некоторых картинок нет тени — оставь их!")],
  ["hidden", (f) => f.hidden > 0, () => "Тени прячутся — узнай по кусочку!"],
  ["turned", (f) => f.turned > 0, () => "Некоторые тени перевернулись!"],
  ["small", (f) => f.small > 0, () => "Смотри на размер!"],
  ["twins", (f) => f.twins >= 2, () => "Тени похожи — смотри на мелочи!"],
];
/** The trick a world brings first (its note names it first). */
export const NEW_IN: Readonly<Record<string, Mechanic>> = { tricky: "twins", turn: "turned", hide: "hidden", odd: "extras" };

/**
 * The line under the board: what to do and up to two tricks of this round —
 * the one that is new in this world first — then the extra shadows.
 */
export function noteFor(round: Round, fresh?: Mechanic): string {
  const f = roundFeatures(round);
  const on = MECHANICS.filter(([, has]) => has(f));
  on.sort((a, b) => Number(b[0] === fresh) - Number(a[0] === fresh));
  const parts = ["Перетащи картинку на её тень.", ...on.slice(0, 2).map(([, , say]) => say(f))];
  if (f.decoys) parts.push(EXTRA[f.decoys] ?? `Лишних теней: ${f.decoys}!`);
  return parts.join(" ");
}

/** The first trick the note names (for the voice line). */
export function mainMechanic(round: Round, fresh?: Mechanic): Mechanic | null {
  const f = roundFeatures(round);
  const on = MECHANICS.filter(([, has]) => has(f)).map(([m]) => m);
  return fresh && on.includes(fresh) ? fresh : on[0] ?? null;
}

/** "1 тень", "3 тени", "7 теней". */
export function shadowsWord(n: number): string {
  const d = n % 10;
  const dd = n % 100;
  if (d === 1 && dd !== 11) return `${n} тень`;
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return `${n} тени`;
  return `${n} теней`;
}
