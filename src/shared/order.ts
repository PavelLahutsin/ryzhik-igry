/**
 * Levels grouped by world in the given order, keeping their order inside a
 * world. Worlds added later (easier extras) can sit where their difficulty
 * fits, without touching level ids — progress is stored by id.
 */
export function inWorldOrder<L extends { world?: string }>(levels: readonly L[], order: readonly string[]): L[] {
  const rank = (l: L): number => {
    const i = order.indexOf(l.world ?? "");
    return i < 0 ? order.length : i;
  };
  return levels.map((l, i) => ({ l, i })).sort((a, b) => rank(a.l) - rank(b.l) || a.i - b.i).map((x) => x.l);
}
