import { platform } from "./platform";
import type { PlatformStorage } from "./platform/types";

/**
 * «Находки»: a set of things a child has discovered in a free-play game
 * (surprises tapped, dishes tasted, pictures drawn). Stored under
 * "ryzhik-igry:<gameId>:found". Nothing is ever lost or locked by it.
 */
export function normalizeFinds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.filter((x): x is string => typeof x === "string"))];
}

export function addFind(list: readonly string[], id: string): { list: string[]; isNew: boolean } {
  if (list.includes(id)) return { list: [...list], isNew: false };
  return { list: [...list, id], isNew: true };
}

export function gameFinds(gameId: string, storage: PlatformStorage = platform.storage) {
  const key = `${gameId}:found`;
  let cache: string[] | null = null;
  return {
    async load(): Promise<string[]> {
      cache = normalizeFinds(await storage.get<unknown>(key));
      return cache;
    },
    /** Returns true when the find is new. */
    async add(id: string): Promise<boolean> {
      const base = cache ?? normalizeFinds(await storage.get<unknown>(key));
      const { list, isNew } = addFind(base, id);
      cache = list;
      if (isNew) await storage.set(key, list);
      return isNew;
    },
  };
}
