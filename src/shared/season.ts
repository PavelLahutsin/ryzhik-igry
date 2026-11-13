/**
 * v13 «Зима»: a seasonal pack on the home screen. It only groups winter
 * levels that already exist in other games; while it is winter they are
 * open from the pack (and in their own lists), with no locks.
 */
/** `icon`: a «Тени» picture for the card (the winter thing of that level). */
export type PackItem = { game: string; level: string; icon: string };

export const WINTER: PackItem[] = [
  { game: "sliyanie", level: "z1", icon: "snowman" },
  { game: "sliyanie", level: "z3", icon: "snowman" },
  { game: "odezhda", level: "o3", icon: "mitten" },
  { game: "odezhda", level: "o9", icon: "hat" },
  { game: "sortirovka", level: "p3", icon: "boot" },
  { game: "tochki", level: "t10", icon: "fir" },
  { game: "tochki", level: "d3", icon: "snowman" },
  { game: "risovalka", level: "r14", icon: "fir" },
  { game: "mozaika", level: "m20", icon: "snowman" },
  { game: "formy", level: "m6", icon: "fir" },
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
