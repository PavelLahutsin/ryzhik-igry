/**
 * Thin platform boundary. Games talk only to this adapter.
 * Web is implemented now; VK Mini App and Capacitor are stubs for later.
 */
export interface PlatformStorage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}

export interface PlatformAdapter {
  readonly id: "web" | "vk" | "capacitor";
  /** Shared storage of the games shell (prefix "ryzhik-igry:"). */
  readonly storage: PlatformStorage;
  /**
   * Storage under its own key prefix. Ported games keep the prefix they had
   * as separate sites, so progress on pavellahutsin.github.io carries over.
   */
  scoped(prefix: string): PlatformStorage;
}
