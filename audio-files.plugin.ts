import type { Plugin } from "vite";
import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Recorded voice, music and object sounds are optional files in
 * public/audio/{voice,music,sfx}. This lists the ones that exist when the
 * app is built, so the game never asks the network for a file that is not there.
 */
export function audioFiles(): Plugin {
  const id = "virtual:audio-files";
  const list = (dir: string): string[] => {
    const full = resolve(process.cwd(), "public/audio", dir);
    return existsSync(full) ? readdirSync(full).filter((f) => /^[vm]\d{2,3}\.mp3$/.test(f)).map((f) => f.replace(/\.mp3$/, "")).sort() : [];
  };
  // v23: the letters of «Азбука-картинки» live in public/audio/voice/words/bukva-*.mp3.
  const words = (): string[] => {
    const full = resolve(process.cwd(), "public/audio/voice/words");
    return existsSync(full) ? readdirSync(full).filter((f) => /^[a-z0-9-]+\.mp3$/.test(f)).map((f) => `words/${f.replace(/\.mp3$/, "")}`).sort() : [];
  };
  const sfx = (): string[] => {
    const full = resolve(process.cwd(), "public/audio/sfx");
    return existsSync(full) ? readdirSync(full).filter((f) => /^[A-Za-z0-9-]+\.mp3$/.test(f)).map((f) => f.replace(/\.mp3$/, "")).sort() : [];
  };
  return {
    name: "audio-files",
    resolveId: (source) => (source === id ? `\0${id}` : null),
    load: (key) => (key === `\0${id}` ? `export default ${JSON.stringify({ voice: [...list("voice"), ...words()], music: list("music"), sfx: sfx() })};` : null),
  };
}
