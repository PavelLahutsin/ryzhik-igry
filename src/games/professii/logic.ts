import { rateBy, STARS, type Score } from "../../shared/stars";
/**
 * Rules for «Профессии»: guided step-by-step role play (doctor, firefighter),
 * a shop with a picture list, and «find the danger at home». Pure functions.
 */

export type StepKind = "use" | "rub";

export type Step = {
  /** Tool to take from the tray. */
  tool: string;
  /** Where to put it (or rub it) in the scene. */
  zone: string;
  kind: StepKind;
  /** What Ryzhik says for this step. */
  say: string;
  /** Said when the step is done (optional). */
  done?: string;
  /** Effects to show / hide in the scene when the step is done. */
  show?: string[];
  hide?: string[];
  /** Patient mood classes after the step ("is-happy", "is-open" …). */
  mood?: string;
  /** For rub steps: how much rubbing (scene units) finishes it. */
  amount?: number;
};

export const RUB_AMOUNT = 520;

export type Guided = { step: number; misses: number; rub: number };

export type StepResult = "next" | "finish" | "wrong-tool" | "wrong-place" | "rubbing" | "none";

export function startGuided(): Guided {
  return { step: 0, misses: 0, rub: 0 };
}

export function currentStep(steps: readonly Step[], g: Guided): Step | null {
  return steps[g.step] ?? null;
}

function advanceStep(steps: readonly Step[], g: Guided): StepResult {
  g.step++;
  g.rub = 0;
  return g.step >= steps.length ? "finish" : "next";
}

/**
 * A tool was dropped. `zones` are the scene zones under the drop point
 * (any order); empty means it was dropped on nothing (no blame then).
 */
export function dropTool(steps: readonly Step[], g: Guided, tool: string, zones: readonly string[]): StepResult {
  const cur = currentStep(steps, g);
  if (!cur || zones.length === 0) return "none";
  if (tool !== cur.tool) {
    g.misses++;
    return "wrong-tool";
  }
  if (cur.kind === "rub") return zones.includes(cur.zone) ? "rubbing" : "none";
  if (!zones.includes(cur.zone)) return "wrong-place";
  return advanceStep(steps, g);
}

/** The tool moved by `dist` (scene units) while over `zones`. */
export function rubTool(steps: readonly Step[], g: Guided, tool: string, zones: readonly string[], dist: number): StepResult {
  const cur = currentStep(steps, g);
  if (!cur || cur.kind !== "rub" || tool !== cur.tool || !zones.includes(cur.zone)) return "none";
  g.rub += Math.max(0, dist);
  if (g.rub >= (cur.amount ?? RUB_AMOUNT)) return advanceStep(steps, g);
  return "rubbing";
}

/**
 * Tools that have done all their jobs: used in a finished step and not
 * needed by any step still ahead. They leave the tray (the thermometer is
 * not offered again once the temperature is taken). Tools that were never
 * needed (the extra choices) stay.
 */
export function usedUp(steps: readonly Step[], g: Guided): string[] {
  const done = new Set(steps.slice(0, g.step).map((s) => s.tool));
  const ahead = new Set(steps.slice(g.step).map((s) => s.tool));
  return [...done].filter((t) => !ahead.has(t));
}

/** 0 … 1: how far the current rub step is. */
export function rubProgress(steps: readonly Step[], g: Guided): number {
  const cur = currentStep(steps, g);
  if (!cur || cur.kind !== "rub") return 0;
  return Math.min(1, g.rub / (cur.amount ?? RUB_AMOUNT));
}

/** Stars for any profession game: a slip costs 1, a hint 2 «points». */
export function starsFor(misses: number, hints: number): Score {
  return rateBy(STARS.professii, misses, hints);
}

// ---------------------------------------------------------------- shop

export type ListLine = { id: string; n: number };
export type Cart = Record<string, number>;
export type CartResult = "ok" | "line-done" | "enough" | "not-on-list";

export function needOf(list: readonly ListLine[], id: string): number {
  return list.find((l) => l.id === id)?.n ?? 0;
}

export function remaining(list: readonly ListLine[], cart: Cart, id: string): number {
  return Math.max(0, needOf(list, id) - (cart[id] ?? 0));
}

/** Put one `id` into the basket, if the list still wants it. */
export function addToCart(list: readonly ListLine[], cart: Cart, id: string): CartResult {
  const need = needOf(list, id);
  if (need === 0) return "not-on-list";
  const have = cart[id] ?? 0;
  if (have >= need) return "enough";
  cart[id] = have + 1;
  return cart[id] === need ? "line-done" : "ok";
}

export function cartComplete(list: readonly ListLine[], cart: Cart): boolean {
  return list.every((l) => (cart[l.id] ?? 0) >= l.n);
}

/** One coin for each thing bought. */
export function coinsNeeded(list: readonly ListLine[]): number {
  return list.reduce((s, l) => s + l.n, 0);
}

// ---------------------------------------------------------------- safety

export type Thing = { id: string; danger: boolean; say: string };
export type Safety = { found: string[]; safeTaps: string[] };
export type TapResult = "found" | "again" | "safe" | "safe-again";

export function startSafety(): Safety {
  return { found: [], safeTaps: [] };
}

export function tapThing(things: readonly Thing[], s: Safety, id: string): TapResult | null {
  const t = things.find((x) => x.id === id);
  if (!t) return null;
  if (t.danger) {
    if (s.found.includes(id)) return "again";
    s.found.push(id);
    return "found";
  }
  if (s.safeTaps.includes(id)) return "safe-again";
  s.safeTaps.push(id);
  return "safe";
}

export function dangersLeft(things: readonly Thing[], s: Safety): Thing[] {
  return things.filter((t) => t.danger && !s.found.includes(t.id));
}

// ---------------------------------------------------------------- words

const WORDS = ["", "Один", "Два", "Три", "Четыре", "Пять", "Шесть", "Семь", "Восемь", "Девять", "Десять"];

export function countWord(n: number): string {
  return WORDS[n] ?? String(n);
}

/**
 * How a 1000 × 800 scene fits a w × h box. Wide box: keep the shape
 * (letterbox at the sides). Tall box: fill it and show more of the scene
 * above (60%) and below (40%) — the wall/sky and floor continue there.
 */
export function sceneFit(w: number, h: number): { width: number; height: number; viewBox: string } {
  if (w / h >= 1.25) return { width: Math.floor(h * 1.25), height: h, viewBox: "0 0 1000 800" };
  const H = Math.min(2000, (1000 * h) / w);
  return { width: w, height: h, viewBox: `0 ${(-(H - 800) * 0.6).toFixed(1)} 1000 ${H.toFixed(1)}` };
}
