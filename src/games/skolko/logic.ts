import type { CountLevel, MoreLevel } from "./levels";

type Rand = () => number;
const pick = <T>(r: Rand, list: readonly T[]): T => list[Math.floor(r() * list.length)]!;
function shuffled<T>(r: Rand, list: readonly T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** «Раз!» … «Десять!» (v114–v119, v161–v164). */
export function countVoice(n: number): string | undefined {
  if (n >= 1 && n <= 6) return `v${113 + n}`;
  if (n >= 7 && n <= 10) return `v${154 + n}`;
  return undefined;
}

export type CountRound = { n: number; things: string[]; options: number[]; answer: number; spots: [number, number][] };

/** The rounds of a count level: no number twice in a row; every kind on the field. */
export function countRounds(l: CountLevel, r: Rand): CountRound[] {
  const out: CountRound[] = [];
  let prev = -1;
  for (let k = 0; k < l.rounds; k++) {
    const range = Array.from({ length: l.max - l.min + 1 }, (_, i) => l.min + i);
    const can = range.length > 1 ? range.filter((x) => x !== prev) : range;
    const n = pick(r, can);
    prev = n;
    const kinds = l.mixKinds ? l.things : [pick(r, l.things)];
    const things = shuffled(r, Array.from({ length: n }, (_, i) => (i < kinds.length ? kinds[i]! : pick(r, kinds)) as string));
    // Wrong numbers: the nearest ones first, so the child really counts.
    const others = range.filter((x) => x !== n).sort((a, b) => Math.abs(a - n) - Math.abs(b - n) || r() - 0.5);
    const options = [n, ...others.slice(0, l.options - 1)].sort((a, b) => a - b);
    out.push({ n, things, options, answer: options.indexOf(n), spots: spotsFor(l.layout, n, r) });
  }
  return out;
}

/** Dice faces 1–6 in a 100 box. */
const DICE: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[28, 22], [72, 22], [28, 50], [72, 50], [28, 78], [72, 78]],
};

/**
 * Where the things lie, centres in a 100 × 100 field. «row»: one or two even
 * rows; «dice»: like a die (7–10: a five and the rest, side by side);
 * «scatter»: anywhere, never touching.
 */
export function spotsFor(layout: CountLevel["layout"], n: number, r: Rand): [number, number][] {
  if (layout === "row") {
    const rows = n <= 5 ? [n] : [Math.ceil(n / 2), Math.floor(n / 2)];
    return rows.flatMap((k, row) => Array.from({ length: k }, (_, i): [number, number] => [((i + 0.5) / k) * 100, rows.length === 1 ? 50 : 30 + row * 40]));
  }
  if (layout === "dice") {
    if (n <= 6) return DICE[n]!.map(([x, y]) => [15 + x * 0.7, 15 + y * 0.7]);
    const a = DICE[5]!.map(([x, y]): [number, number] => [4 + x * 0.44, 22 + y * 0.56]);
    const b = DICE[n - 5]!.map(([x, y]): [number, number] => [52 + x * 0.44, 22 + y * 0.56]);
    return [...a, ...b];
  }
  const gap = n <= 5 ? 28 : n <= 8 ? 23 : 20;
  for (let tries = 0; tries < 60; tries++) {
    const pts: [number, number][] = [];
    for (let k = 0; k < 400 && pts.length < n; k++) {
      const p: [number, number] = [10 + r() * 80, 12 + r() * 76];
      if (pts.every(([x, y]) => Math.hypot(x - p[0], y - p[1]) >= gap)) pts.push(p);
    }
    if (pts.length === n) return pts;
  }
  return spotsFor("row", n, r);
}

export type MoreRound = { left: number; right: number; answer: "left" | "right" };
export function moreRounds(l: MoreLevel): MoreRound[] {
  return l.pairs.map(([left, right]) => ({ left, right, answer: (l.want === "more") === left > right ? "left" : "right" }));
}

/** Size of the things in a pile: with «bigFew» the smaller pile has bigger things (don't trust the look). */
export function pileScale(l: MoreLevel, round: MoreRound, side: "left" | "right"): number {
  if (!l.bigFew) return 1;
  const mine = side === "left" ? round.left : round.right;
  const other = side === "left" ? round.right : round.left;
  return mine < other ? 1.35 : 0.8;
}
