/** Grown-up gate: three different digits 1–9, shown as words. Pure, for tests. */
const WORDS = ["", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"];

export function gateTask(rand: () => number): number[] {
  const out: number[] = [];
  while (out.length < 3) {
    const n = 1 + Math.floor(rand() * 9);
    if (!out.includes(n)) out.push(n);
  }
  return out;
}

export function gateWords(task: readonly number[]): string[] {
  return task.map((n) => WORDS[n]!);
}
