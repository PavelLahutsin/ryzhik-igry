import { platform } from "./platform";
import { SHELL_PREFIX } from "./platform/web";

/** "ryzhik-igry:mozaika:progress" → ["ryzhik-igry:", "mozaika:progress"]. */
export function splitKey(full: string): [prefix: string, key: string] {
  if (full.startsWith(SHELL_PREFIX)) return [SHELL_PREFIX, full.slice(SHELL_PREFIX.length)];
  const i = full.indexOf(":");
  return i < 0 ? ["", full] : [full.slice(0, i + 1), full.slice(i + 1)];
}

/** Remove saved data by its full key, through the platform storage. */
export async function removeSaved(full: string): Promise<void> {
  const [prefix, key] = splitKey(full);
  await (prefix === SHELL_PREFIX ? platform.storage : platform.scoped(prefix)).remove(key);
}
