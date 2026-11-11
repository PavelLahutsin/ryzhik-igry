import { platform } from "./platform";

/**
 * What the child has already been shown: «Как играть» cards per game and
 * one-time «Новое!» tips. One small record under "ryzhik-igry:seen";
 * «Родителям → Показать подсказки снова» clears it.
 */
export type Seen = { howto: string[]; tips: string[] };
const KEY = "seen";
let cache: Seen | null = null;

export function normalizeSeen(value: unknown): Seen {
  const v = (value ?? {}) as Partial<Seen>;
  const list = (x: unknown): string[] => (Array.isArray(x) ? x.filter((s): s is string => typeof s === "string") : []);
  return { howto: list(v.howto), tips: list(v.tips) };
}

export async function loadSeen(): Promise<Seen> {
  cache ??= normalizeSeen(await platform.storage.get(KEY));
  return cache;
}

export async function markSeen(kind: keyof Seen, id: string): Promise<void> {
  const s = await loadSeen();
  if (s[kind].includes(id)) return;
  s[kind].push(id);
  await platform.storage.set(KEY, s);
}

export async function resetSeen(): Promise<void> {
  cache = { howto: [], tips: [] };
  await platform.storage.remove(KEY);
}
