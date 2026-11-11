import type { PlatformAdapter, PlatformStorage } from "./types";

export const SHELL_PREFIX = "ryzhik-igry:";

export function localStorageWith(prefix: string): PlatformStorage {
  return {
    async get<T>(key: string): Promise<T | null> {
      try {
        const raw = localStorage.getItem(prefix + key);
        return raw ? (JSON.parse(raw) as T) : null;
      } catch {
        return null;
      }
    },
    async set<T>(key: string, value: T): Promise<void> {
      try {
        localStorage.setItem(prefix + key, JSON.stringify(value));
      } catch {
        /* Quota exceeded: progress is nice to have, never worth a crash. */
      }
    },
    async remove(key: string): Promise<void> {
      try {
        localStorage.removeItem(prefix + key);
      } catch {
        /* ignore */
      }
    },
  };
}

export const webStorage: PlatformStorage = localStorageWith(SHELL_PREFIX);

export const webAdapter: PlatformAdapter = {
  id: "web",
  storage: webStorage,
  scoped: localStorageWith,
};
