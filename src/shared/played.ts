import { platform } from "./platform";

/**
 * v13: what was played lately and what was ever opened, in one small record
 * under "ryzhik-igry:played". Feeds «Недавно играли», the «Новое» badges, the
 * first-open gift and «Во что поиграем сегодня?». Nothing leaves the device.
 */
export type Played = { recent: string[]; opened: string[] };
const KEY = "played";
export const RECENT_MAX = 4;
let cache: Played | null = null;

export function normalizePlayed(value: unknown): Played {
  const v = (value ?? {}) as Partial<Played>;
  const list = (x: unknown): string[] => (Array.isArray(x) ? x.filter((s): s is string => typeof s === "string") : []);
  return { recent: list(v.recent).slice(0, RECENT_MAX), opened: list(v.opened) };
}

/** The game goes first, without repeats, at most RECENT_MAX. */
export function pushRecent(recent: readonly string[], id: string, max = RECENT_MAX): string[] {
  return [id, ...recent.filter((x) => x !== id)].slice(0, max);
}

export async function loadPlayed(): Promise<Played> {
  cache ??= normalizePlayed(await platform.storage.get(KEY));
  return cache;
}

/** A game (or a world, «mozaika/flip») is opened. Returns true the very first time. */
export async function markOpened(id: string, recent = true): Promise<boolean> {
  const p = await loadPlayed();
  const first = !p.opened.includes(id);
  if (first) p.opened.push(id);
  if (recent) p.recent = pushRecent(p.recent, id);
  await platform.storage.set(KEY, p);
  return first;
}

export async function wasOpened(id: string): Promise<boolean> {
  return (await loadPlayed()).opened.includes(id);
}

/**
 * «Во что поиграем сегодня?»: one game a day — an unfinished one (not the
 * game played last), otherwise one never opened. Same pick all day.
 */
export function pickToday(
  games: ReadonlyArray<{ id: string; got: number; max: number }>,
  played: Played,
  day: number,
): { id: string; why: "continue" | "new" } | null {
  const last = played.recent[0];
  const unfinished = games.filter((g) => g.id !== last && g.max > 0 && g.got > 0 && g.got < g.max);
  if (unfinished.length) return { id: unfinished[day % unfinished.length]!.id, why: "continue" };
  const fresh = games.filter((g) => g.id !== last && !played.opened.includes(g.id));
  if (fresh.length) return { id: fresh[day % fresh.length]!.id, why: "new" };
  const any = games.filter((g) => g.id !== last && g.got < g.max);
  return any.length ? { id: any[day % any.length]!.id, why: "continue" } : null;
}

export async function resetPlayed(): Promise<void> {
  cache = { recent: [], opened: [] };
  await platform.storage.remove(KEY);
}
