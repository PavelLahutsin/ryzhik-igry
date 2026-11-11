import type { Plugin } from "vite";
import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Recorded voice and music are optional files in public/audio/{voice,music}.
 * This lists the ones that exist when the app is built, so the game never
 * asks the network for a file that is not there.
 */
export function audioFiles(): Plugin {
  const id = "virtual:audio-files";
  const list = (dir: string): string[] => {
    const full = resolve(process.cwd(), "public/audio", dir);
    return existsSync(full) ? readdirSync(full).filter((f) => /^[vm]\d\d\.mp3$/.test(f)).map((f) => f.slice(0, 3)).sort() : [];
  };
  return {
    name: "audio-files",
    resolveId: (source) => (source === id ? `\0${id}` : null),
    load: (key) => (key === `\0${id}` ? `export default ${JSON.stringify({ voice: list("voice"), music: list("music") })};` : null),
  };
}
