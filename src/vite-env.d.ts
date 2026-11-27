/// <reference types="vite/client" />

declare module "virtual:audio-files" {
  /** Ids of recorded files found in public/audio at build time (e.g. "v02", "m01", "frog"). */
  const files: { voice: string[]; music: string[]; sfx: string[] };
  export default files;
}
