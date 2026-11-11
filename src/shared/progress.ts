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
