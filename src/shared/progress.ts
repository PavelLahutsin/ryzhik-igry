import { platform } from "./platform";
import type { PlatformStorage } from "./platform";

/** Pure progress helpers (no storage), so they are easy to test. */
export type Progress = {
  completed: string[];
  /** Best stars per level id, 1–3. */
  stars: Record<string, number>;
};

export function emptyProgress(): Progress {
  return { completed: [], stars: {} };
}

export function normalizeProgress(value: unknown): Progress {
  const out = emptyProgress();
  if (!value || typeof value !== "object") return out;
  const raw = value as { completed?: unknown; stars?: unknown };
  if (Array.isArray(raw.completed)) {
    out.completed = raw.completed.filter((id): id is string => typeof id === "string");
  }
  if (raw.stars && typeof raw.stars === "object") {
    for (const [id, n] of Object.entries(raw.stars as Record<string, unknown>)) {
      if (typeof n === "number" && n >= 1) out.stars[id] = Math.min(3, Math.floor(n));
    }
  }
  for (const id of out.completed) if (!out.stars[id]) out.stars[id] = 1;
  return out;
}

/** Record a win. Keeps the best star count; never lowers it. */
export function recordWin(progress: Progress, id: string, stars: number): Progress {
  const next: Progress = { completed: [...progress.completed], stars: { ...progress.stars } };
  if (!next.completed.includes(id)) next.completed.push(id);
  next.stars[id] = Math.max(next.stars[id] ?? 0, Math.min(3, Math.max(1, Math.floor(stars))));
  return next;
}

/** Levels open one by one: the first always, then each after the previous win. */
export function isUnlocked(ids: readonly string[], id: string, completed: readonly string[]): boolean {
  const index = ids.indexOf(id);
  if (index <= 0) return index === 0;
  return completed.includes(ids[index - 1]!) || completed.includes(id);
}

export function totalStars(stars: Record<string, number>, ids: readonly string[]): number {
  return ids.reduce((sum, id) => sum + (stars[id] ?? 0), 0);
}

/** Stored progress of one game under "ryzhik-igry:<gameId>:progress". */
export function gameProgress(gameId: string, storage: PlatformStorage = platform.storage) {
  const key = `${gameId}:progress`;
  return {
    async load(): Promise<Progress> {
      return normalizeProgress(await storage.get<unknown>(key));
    },
    async win(levelId: string, stars: number): Promise<Progress> {
      const next = recordWin(normalizeProgress(await storage.get<unknown>(key)), levelId, stars);
      await storage.set(key, next);
      return next;
    },
  };
}

/**
 * Levels that moved to another game keep their stars: the first time the new
 * game's progress is read (its key does not exist yet), the listed levels are
 * copied from the old game. The old key is left as it was.
 */
export async function adoptLevels(fromGame: string, toGame: string, ids: readonly string[], storage: PlatformStorage = platform.storage): Promise<void> {
  const toKey = `${toGame}:progress`;
  if ((await storage.get<unknown>(toKey)) != null) return;
  const from = normalizeProgress(await storage.get<unknown>(`${fromGame}:progress`));
  const next = emptyProgress();
  for (const id of ids) {
    if (from.completed.includes(id)) next.completed.push(id);
    if (from.stars[id]) next.stars[id] = from.stars[id]!;
  }
  await storage.set(toKey, next);
}

/** Unlocking inside each world: every world starts open (used by «Цифры и буквы»). */
export function isUnlockedInWorld(levels: ReadonlyArray<{ id: string; world?: string }>, id: string, completed: readonly string[]): boolean {
  const level = levels.find((l) => l.id === id);
  if (!level) return false;
  const same = levels.filter((l) => l.world === level.world).map((l) => l.id);
  return isUnlocked(same, id, completed);
}

/**
 * v14: is a level of a level game open? A winter level opens early (the
 * «Зима» pack), but winning it out of order must not open the level after it:
 * «Ёлочка» (14) won before «Грибок» (13) used to open 15, and the child went
 * 12 → 14 → 15…, never seeing 13. Now the level after a season-opened one
 * opens only when that one was also reached in order. Won levels stay open.
 */
export function levelOpen(
  levels: ReadonlyArray<{ id: string; world?: string }>,
  id: string,
  completed: readonly string[],
  opts: { after?: Record<string, string>; openWorlds?: boolean; season?: (id: string) => boolean } = {},
): boolean {
  const season = (lid: string): boolean => opts.season?.(lid) === true;
  const prevOf = (lid: string): string | undefined => {
    const after = opts.after?.[lid];
    if (after) return after;
    const level = levels.find((l) => l.id === lid);
    const list = opts.openWorlds && level ? levels.filter((l) => l.world === level.world) : levels;
    const i = list.findIndex((l) => l.id === lid);
    return i > 0 ? list[i - 1]!.id : undefined;
  };
  // Reached in order: its previous level was won and was itself reached in order.
  const byOrder = (lid: string, depth: number): boolean => {
    const prev = prevOf(lid);
    if (prev === undefined) return levels.some((l) => l.id === lid);
    if (!completed.includes(prev)) return false;
    return !season(prev) || depth > levels.length || byOrder(prev, depth + 1);
  };
  return season(id) || completed.includes(id) || byOrder(id, 0);
}
