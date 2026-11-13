/**
 * v13 «Зима»: a seasonal pack on the home screen. It only groups winter
 * levels that already exist in other games; while it is winter they are
 * open from the pack (and in their own lists), with no locks.
 */
export type PackItem = { game: string; level: string };

export const WINTER: PackItem[] = [
  { game: "sliyanie", level: "z1" },
  { game: "sliyanie", level: "z3" },
  { game: "odezhda", level: "o3" },
  { game: "odezhda", level: "o9" },
  { game: "sortirovka", level: "p3" },
  { game: "tochki", level: "t10" },
  { game: "tochki", level: "d3" },
  { game: "risovalka", level: "r14" },
  { game: "mozaika", level: "m20" },
  { game: "formy", level: "m6" },
];

/** Winter for the pack: 1 November – end of February. */
export function isWinter(now: Date = new Date()): boolean {
  const m = now.getMonth();
  return m >= 10 || m <= 1;
}

/** Is this level opened by the winter pack right now? */
export function seasonOpen(game: string, level: string, now: Date = new Date()): boolean {
  return isWinter(now) && WINTER.some((w) => w.game === game && w.level === level);
}
