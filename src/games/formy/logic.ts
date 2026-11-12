import { rateBy, STARS, type Score } from "../../shared/stars";
/** Rules for «Размер и форма». Pure functions. */
import type { Gender } from "../../shared/objects";

export type Shape = "circle" | "square" | "triangle" | "star" | "heart" | "rhombus" | "oval" | "rect" | "pentagon" | "hexagon";
export type Size = "big" | "mid" | "small";

export const SHAPE_NAME: Record<Shape, string> = {
  circle: "Круг",
  square: "Квадрат",
  triangle: "Треугольник",
  star: "Звезда",
  heart: "Сердечко",
  rhombus: "Ромб",
  oval: "Овал",
  rect: "Прямоугольник",
  pentagon: "Пятиугольник",
  hexagon: "Шестиугольник",
};

/** Grammatical gender of the shape names (for «красный круг», «красная звезда»). */
export const SHAPE_GENDER: Record<Shape, Gender> = {
  circle: "m", square: "m", triangle: "m", star: "f", heart: "n", rhombus: "m", oval: "m", rect: "m", pentagon: "m", hexagon: "m",
};

/** Corners of the shapes that have them. */
export const CORNERS: Partial<Record<Shape, number>> = { triangle: 3, square: 4, rect: 4, rhombus: 4, pentagon: 5, hexagon: 6 };

const SIZE_FORMS: Record<Size, Record<Gender, string>> = {
  big: { m: "Большой", f: "Большая", n: "Большое", pl: "Большие" },
  mid: { m: "Средний", f: "Средняя", n: "Среднее", pl: "Средние" },
  small: { m: "Маленький", f: "Маленькая", n: "Маленькое", pl: "Маленькие" },
};

/** «Кому оно подойдёт?» agreeing with the thing: он / она / оно / они. */
export function whoFits(gender: Gender): string {
  const who = { m: "он", f: "она", n: "оно", pl: "они" }[gender];
  return `Кому ${who} ${gender === "pl" ? "подойдут" : "подойдёт"}?`;
}

/** «Маленькая чашка», «Большое яблоко», «Средние вишенки». */
export function sizedName(size: Size, name: string, gender: Gender): string {
  return `${SIZE_FORMS[size][gender]} ${name.toLowerCase()}`;
}

/** Matching games: does the thing's key fit the target's key? */
export function matches(itemKey: string, targetKey: string | null): "ok" | "wrong" | "none" {
  if (targetKey === null) return "none";
  return itemKey === targetKey ? "ok" : "wrong";
}

/**
 * Pyramid: rings have ranks 1 (smallest) … n (biggest) and go on the pole
 * biggest first. Returns the rank that must come next, or 0 when done.
 */
export function nextRing(onPole: readonly number[], total: number): number {
  return Math.max(0, total - onPole.length);
}

export function canStack(onPole: readonly number[], total: number, rank: number): boolean {
  return rank === nextRing(onPole, total);
}

export function starsFor(misses: number, hints: number, count: number): Score {
  return rateBy(STARS.formy, misses, hints, count);
}

/** SVG path of a shape centred at (cx, cy) fitting a circle of radius r. */
export function shapePath(shape: Shape, cx: number, cy: number, r: number): string {
  const f = (n: number): string => n.toFixed(1);
  switch (shape) {
    case "circle":
      return `M${f(cx - r)} ${f(cy)} a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0 a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0 Z`;
    case "square": {
      const s = r * 0.86;
      return `M${f(cx - s)} ${f(cy - s)} H${f(cx + s)} V${f(cy + s)} H${f(cx - s)} Z`;
    }
    case "triangle":
      return `M${f(cx)} ${f(cy - r)} L${f(cx + r * 0.95)} ${f(cy + r * 0.75)} H${f(cx - r * 0.95)} Z`;
    case "rhombus":
      return `M${f(cx)} ${f(cy - r)} L${f(cx + r * 0.75)} ${f(cy)} L${f(cx)} ${f(cy + r)} L${f(cx - r * 0.75)} ${f(cy)} Z`;
    case "star": {
      let d = "";
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const rr = i % 2 ? r * 0.45 : r;
        d += `${i ? "L" : "M"}${f(cx + rr * Math.cos(a))} ${f(cy + rr * Math.sin(a))} `;
      }
      return `${d}Z`;
    }
    case "oval":
      return `M${f(cx - r)} ${f(cy)} a${f(r)} ${f(r * 0.62)} 0 1 0 ${f(2 * r)} 0 a${f(r)} ${f(r * 0.62)} 0 1 0 ${f(-2 * r)} 0 Z`;
    case "rect":
      return `M${f(cx - r)} ${f(cy - r * 0.56)} H${f(cx + r)} V${f(cy + r * 0.56)} H${f(cx - r)} Z`;
    case "pentagon":
    case "hexagon": {
      const n = shape === "pentagon" ? 5 : 6;
      let d = "";
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        d += `${i ? "L" : "M"}${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a))} `;
      }
      return `${d}Z`;
    }
    case "heart":
      return `M${f(cx)} ${f(cy + r * 0.85)} C${f(cx - r * 1.3)} ${f(cy)} ${f(cx - r * 0.9)} ${f(cy - r * 1.05)} ${f(cx)} ${f(cy - r * 0.45)} C${f(cx + r * 0.9)} ${f(cy - r * 1.05)} ${f(cx + r * 1.3)} ${f(cy)} ${f(cx)} ${f(cy + r * 0.85)} Z`;
  }
}

/** Corner points of a shape drawn by `shapePath` (the same numbers). */
export function cornerPoints(shape: Shape, cx: number, cy: number, r: number): [number, number][] {
  switch (shape) {
    case "triangle":
      return [[cx, cy - r], [cx + r * 0.95, cy + r * 0.75], [cx - r * 0.95, cy + r * 0.75]];
    case "square": {
      const s = r * 0.86;
      return [[cx - s, cy - s], [cx + s, cy - s], [cx + s, cy + s], [cx - s, cy + s]];
    }
    case "rect":
      return [[cx - r, cy - r * 0.56], [cx + r, cy - r * 0.56], [cx + r, cy + r * 0.56], [cx - r, cy + r * 0.56]];
    case "rhombus":
      return [[cx, cy - r], [cx + r * 0.75, cy], [cx, cy + r], [cx - r * 0.75, cy]];
    case "pentagon":
    case "hexagon": {
      const n = shape === "pentagon" ? 5 : 6;
      return Array.from({ length: n }, (_, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number];
      });
    }
    default:
      return [];
  }
}

type Box = { left: number; top: number; width: number; height: number };

/**
 * Which drop box the finger is over. Family members stand close and their
 * boxes overlap a little, so among the boxes that contain the point the one
 * whose centre is nearest across wins (QA v4: a drop on Mama landed on Papa).
 */
export function pickTarget(p: { x: number; y: number }, boxes: readonly Box[], pad = 0): number {
  let best = -1;
  let bestD = Infinity;
  boxes.forEach((r, i) => {
    if (p.x < r.left - pad || p.x > r.left + r.width + pad || p.y < r.top - pad || p.y > r.top + r.height + pad) return;
    const d = Math.abs(p.x - (r.left + r.width / 2)) + 0.3 * Math.abs(p.y - (r.top + r.height / 2));
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}

// ------------------------------------------------------------ colours and figures

export type Tint = "red" | "blue" | "yellow" | "green" | "purple" | "orange";
export const TINTS: readonly Tint[] = ["red", "blue", "yellow", "green", "purple", "orange"];

const TINT_FORMS: Record<Tint, Record<Gender, string>> = {
  red: { m: "красный", f: "красная", n: "красное", pl: "красные" },
  blue: { m: "синий", f: "синяя", n: "синее", pl: "синие" },
  yellow: { m: "жёлтый", f: "жёлтая", n: "жёлтое", pl: "жёлтые" },
  green: { m: "зелёный", f: "зелёная", n: "зелёное", pl: "зелёные" },
  purple: { m: "фиолетовый", f: "фиолетовая", n: "фиолетовое", pl: "фиолетовые" },
  orange: { m: "оранжевый", f: "оранжевая", n: "оранжевое", pl: "оранжевые" },
};

/** A drawn figure: a shape in a colour, small / middle / big, maybe turned. */
export type Fig = { shape: Shape; tint: Tint; size: 1 | 2 | 3; turn?: number };

export const sameFig = (a: Fig, b: Fig): boolean => a.shape === b.shape && a.tint === b.tint && a.size === b.size;

/** «Красный круг», «Синяя звезда». */
export function figName(f: Pick<Fig, "shape" | "tint">): string {
  const w = TINT_FORMS[f.tint][SHAPE_GENDER[f.shape]];
  return `${w[0]!.toUpperCase()}${w.slice(1)} ${SHAPE_NAME[f.shape].toLowerCase()}`;
}

// ------------------------------------------------------------ measuring (long / tall / thick)

/** What is compared: objects by size, pencils by length, fir trees by height, books by thickness. */
export type Dim = "size" | "length" | "height" | "thick";

type Words = { noun: string; nounAcc: string; g: Gender; more: Record<Gender, string>; less: Record<Gender, string>; up: string };
export const DIM_WORDS: Record<Exclude<Dim, "size">, Words> = {
  length: {
    noun: "карандаш",
    nounAcc: "карандаш",
    g: "m",
    more: { m: "длинный", f: "длинная", n: "длинное", pl: "длинные" },
    less: { m: "короткий", f: "короткая", n: "короткое", pl: "короткие" },
    up: "от короткого к длинному",
  },
  height: {
    noun: "ёлка",
    nounAcc: "ёлку",
    g: "f",
    more: { m: "высокий", f: "высокая", n: "высокое", pl: "высокие" },
    less: { m: "низкий", f: "низкая", n: "низкое", pl: "низкие" },
    up: "от низкой к высокой",
  },
  thick: {
    noun: "книга",
    nounAcc: "книгу",
    g: "f",
    more: { m: "толстый", f: "толстая", n: "толстое", pl: "толстые" },
    less: { m: "тонкий", f: "тонкая", n: "тонкое", pl: "тонкие" },
    up: "от тонкой к толстой",
  },
};

const MOST: Record<Gender, string> = { m: "самый", f: "самая", n: "самое", pl: "самые" };

/**
 * «Где длинный карандаш?» (two things) or «Где самая высокая ёлка?» (more).
 * For `size` the thing's own name and gender are given.
 */
export function compareAsk(dim: Dim, want: "most" | "least", count: number, thing?: { name: string; g: Gender }): string {
  const most = count > 2;
  if (dim === "size") {
    const g = thing?.g ?? "m";
    const adj = (want === "most" ? SIZE_FORMS.big : SIZE_FORMS.small)[g].toLowerCase();
    return `Где ${most ? `${MOST[g]} ` : ""}${adj} ${(thing?.name ?? "предмет").toLowerCase()}?`;
  }
  const w = DIM_WORDS[dim];
  return `Где ${most ? `${MOST[w.g]} ` : ""}${(want === "most" ? w.more : w.less)[w.g]} ${w.noun}?`;
}

const DOWN: Record<Dim, string> = {
  size: "от большого к маленькому",
  length: "от длинного к короткому",
  height: "от высокой к низкой",
  thick: "от толстой к тонкой",
};

/** «Поставь по порядку: от короткого к длинному.» */
export function orderAsk(dim: Dim, dir: "up" | "down"): string {
  const up = dim === "size" ? "от маленького к большому" : DIM_WORDS[dim].up;
  return `Поставь по порядку: ${dir === "up" ? up : DOWN[dim]}.`;
}

/**
 * Pyramid-like order: things have ranks 1 (least) … n (most). Going up the
 * least comes first; going down the most. Returns the rank wanted next.
 */
export function nextInOrder(placed: number, total: number, dir: "up" | "down"): number {
  if (placed >= total) return 0;
  return dir === "up" ? placed + 1 : total - placed;
}

// ------------------------------------------------------------ one-tap rounds

/** A one-tap question; exactly one option is right (checked by `checkRound`). */
export type Round =
  | { kind: "same"; sample: Fig; options: Fig[]; answer: number }
  | { kind: "odd"; options: Fig[]; answer: number; by: "shape" | "tint" | "size" }
  | { kind: "pattern"; row: Fig[]; options: Fig[]; answer: number }
  | { kind: "fit"; hole: Fig; options: Fig[]; answer: number }
  | { kind: "corners"; shape: Shape; tint: Tint; options: number[]; answer: number }
  | { kind: "compare"; dim: Dim; want: "most" | "least"; values: number[]; answer: number; thing?: string };

export type PickKind = Round["kind"];

/** How a pick level makes its rounds (see `makeRounds`). */
export type PickSpec =
  | { kind: "same"; options: number; shapes: Shape[]; variant: "plain" | "tint" | "turn" }
  | { kind: "odd"; options: number; shapes: Shape[]; by: "shape" | "tint" | "size" | "mix" }
  | { kind: "pattern"; shown: number; unit: "AB" | "AAB" | "ABB" | "ABC"; attr: "shape" | "tint" | "both"; options: number; shapes: Shape[] }
  | { kind: "fit"; options: number; shapes: Shape[]; sizes: boolean }
  | { kind: "corners"; shapes: Shape[]; options: number }
  | { kind: "compare"; dims: Dim[]; count: number; want: "most" | "least" | "mix"; things?: string[] };

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
/** Put `right` among `wrong` at a random place. */
function withAnswer<T>(r: Rand, right: T, wrong: T[]): { options: T[]; answer: number } {
  const options = shuffled(r, wrong);
  const answer = Math.floor(r() * (options.length + 1));
  options.splice(answer, 0, right);
  return { options, answer };
}

/** Rounds of a pick level; `prev` keeps two rounds in a row from being the same. */
export function makeRound(spec: PickSpec, r: Rand): Round {
  switch (spec.kind) {
    case "same": {
      const shapes = shuffled(r, spec.shapes).slice(0, spec.options);
      const sample: Fig = { shape: shapes[0]!, tint: pick(r, TINTS), size: 3 };
      const others = shapes.slice(1);
      const right: Fig =
        spec.variant === "turn"
          ? { ...sample, tint: pick(r, TINTS.filter((t) => t !== sample.tint)), turn: pick(r, [90, 180, 270, 45]) }
          : { ...sample };
      const wrong: Fig[] = others.map((shape) => ({
        shape,
        // «tint»: everything the sample's colour, so only the shape helps;
        // «turn»: the sample's colour is on a wrong shape, the right one is another colour.
        tint: spec.variant === "plain" ? pick(r, TINTS.filter((t) => t !== sample.tint)) : sample.tint,
        size: 3,
        turn: spec.variant === "turn" ? pick(r, [0, 90, 45]) : 0,
      }));
      return { kind: "same", sample, ...withAnswer(r, right, wrong) };
    }
    case "odd": {
      const by = spec.by === "mix" ? pick(r, ["shape", "tint", "size"] as const) : spec.by;
      const n = spec.options;
      const shapes = shuffled(r, spec.shapes);
      const tints = shuffled(r, TINTS);
      let common: Fig[];
      let odd: Fig;
      if (by === "shape") {
        // Same shape in different colours, one other shape.
        common = Array.from({ length: n - 1 }, (_, i) => ({ shape: shapes[0]!, tint: tints[i % tints.length]!, size: 3 }));
        odd = { shape: shapes[1]!, tint: tints[(n - 1) % tints.length]!, size: 3 };
      } else if (by === "tint") {
        // Same colour on different shapes, one other colour.
        common = Array.from({ length: n - 1 }, (_, i) => ({ shape: shapes[i % shapes.length]!, tint: tints[0]!, size: 3 }));
        odd = { shape: shapes[(n - 1) % shapes.length]!, tint: tints[1]!, size: 3 };
      } else {
        // Same size (big), different shapes and colours; one small.
        common = Array.from({ length: n - 1 }, (_, i) => ({ shape: shapes[i % shapes.length]!, tint: tints[i % tints.length]!, size: 3 }));
        odd = { shape: shapes[(n - 1) % shapes.length]!, tint: tints[(n - 1) % tints.length]!, size: 1 };
      }
      return { kind: "odd", by, ...withAnswer(r, odd, common) };
    }
    case "pattern": {
      const shapes = shuffled(r, spec.shapes);
      const tints = shuffled(r, TINTS);
      const base: Fig = { shape: shapes[0]!, tint: tints[0]!, size: 3 };
      const kinds = [...new Set(spec.unit.split(""))];
      const figOf = (k: number): Fig =>
        spec.attr === "shape"
          ? { ...base, shape: shapes[k]! }
          : spec.attr === "tint"
            ? { ...base, tint: tints[k]! }
            : { ...base, shape: shapes[k]!, tint: tints[k]! };
      const elems = kinds.map((_, k) => figOf(k));
      const seq = spec.unit.split("").map((c) => kinds.indexOf(c));
      const row = Array.from({ length: spec.shown }, (_, i) => elems[seq[i % seq.length]!]!);
      const right = elems[seq[spec.shown % seq.length]!]!;
      const wrong = [...elems.filter((e) => !sameFig(e, right)), figOf(kinds.length), figOf(kinds.length + 1)].slice(0, spec.options - 1);
      return { kind: "pattern", row, ...withAnswer(r, right, wrong) };
    }
    case "fit": {
      const shapes = shuffled(r, spec.shapes);
      const size = spec.sizes ? pick(r, [1, 2, 3] as const) : 3;
      const hole: Fig = { shape: shapes[0]!, tint: "purple", size };
      const right: Fig = { shape: hole.shape, tint: pick(r, TINTS), size };
      const wrong: Fig[] = [];
      if (spec.sizes) {
        const other = ([1, 2, 3] as const).filter((s) => s !== size);
        wrong.push({ shape: hole.shape, tint: pick(r, TINTS), size: pick(r, other) });
      }
      for (const shape of shapes.slice(1)) if (wrong.length < spec.options - 1) wrong.push({ shape, tint: pick(r, TINTS), size });
      return { kind: "fit", hole, ...withAnswer(r, right, wrong) };
    }
    case "corners": {
      const shape = pick(r, spec.shapes.filter((s) => CORNERS[s]));
      const n = CORNERS[shape]!;
      const nums = [3, 4, 5, 6].filter((k) => k !== n);
      const wrong = shuffled(r, nums).slice(0, spec.options - 1);
      return { kind: "corners", shape, tint: pick(r, TINTS), options: [...wrong, n].sort((a, b) => a - b), answer: [...wrong, n].sort((a, b) => a - b).indexOf(n) };
    }
    case "compare": {
      const dim = pick(r, spec.dims);
      const want = spec.want === "mix" ? pick(r, ["most", "least"] as const) : spec.want;
      // Clearly different measures: 1 … count steps, shuffled.
      const values = shuffled(r, Array.from({ length: spec.count }, (_, i) => i + 1));
      const target = want === "most" ? spec.count : 1;
      return { kind: "compare", dim, want, values, answer: values.indexOf(target), thing: dim === "size" ? pick(r, spec.things ?? ["apple"]) : undefined };
    }
  }
}

/** A level's rounds: no two equal rounds in a row. */
export function makeRounds(spec: PickSpec, count: number, r: Rand): Round[] {
  const out: Round[] = [];
  for (let i = 0; i < count; i++) {
    let next = makeRound(spec, r);
    for (let k = 0; k < 6 && out.length && JSON.stringify(next) === JSON.stringify(out[out.length - 1]); k++) next = makeRound(spec, r);
    out.push(next);
  }
  return out;
}

/** The option a child must tap, worked out from the pictures alone (tests). */
export function solveRound(round: Round): number[] {
  const idx = (pred: (i: number) => boolean, n: number): number[] => Array.from({ length: n }, (_, i) => i).filter(pred);
  switch (round.kind) {
    case "same":
      // The same shape (colour and turn may differ on the hardest levels).
      return idx((i) => round.options[i]!.shape === round.sample.shape, round.options.length);
    case "pattern":
      return idx((i) => sameFig(round.options[i]!, round.row[round.row.length - (period(round.row) ?? 0)] ?? round.row[0]!), round.options.length);
    case "fit":
      return idx((i) => round.options[i]!.shape === round.hole.shape && round.options[i]!.size === round.hole.size, round.options.length);
    case "corners":
      return idx((i) => round.options[i] === CORNERS[round.shape], round.options.length);
    case "compare": {
      const best = round.want === "most" ? Math.max(...round.values) : Math.min(...round.values);
      return idx((i) => round.values[i] === best, round.values.length);
    }
    case "odd": {
      const n = round.options.length;
      return idx((i) => {
        const rest = round.options.filter((_, j) => j !== i);
        return (["shape", "tint", "size"] as const).some((a) => rest.every((f) => f[a] === rest[0]![a]) && round.options[i]![a] !== rest[0]![a]);
      }, n);
    }
  }
}

/** Shortest period p with row[i] == row[i - p] for the whole row. */
function period(row: readonly Fig[]): number | null {
  for (let p = 1; p < row.length; p++) if (row.every((f, i) => i < p || sameFig(f, row[i - p]!))) return p;
  return null;
}
