import { platform } from "../../shared/platform";

/** Same prefix as the standalone site, so earlier progress carries over. */
const store = platform.scoped("ryzhik-kartinka:");
import { normalizeProgress, recordWin, type Progress } from "./progress";

export type { Progress } from "./progress";

const KEY = "progress";
const LAST_KEY = "last-win";

export async function loadProgress(): Promise<Progress> {
  return normalizeProgress(await store.get<unknown>(KEY));
}

/** Save a win; returns the new progress. */
export async function markCompleted(id: string, stars = 1): Promise<Progress> {
  const progress = recordWin(await loadProgress(), id, stars);
  await store.set(KEY, progress);
  await store.set(LAST_KEY, { id, stars });
  return progress;
}

/** Stars from the most recent win, so the win screen can celebrate them. */
export async function lastWin(): Promise<{ id: string; stars: number } | null> {
  const value = await store.get<{ id?: unknown; stars?: unknown }>(LAST_KEY);
  if (!value || typeof value.id !== "string" || typeof value.stars !== "number") return null;
  return { id: value.id, stars: value.stars };
}

export async function clearLastWin(): Promise<void> {
  await store.remove(LAST_KEY);
}
