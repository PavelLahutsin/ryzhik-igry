/**
 * v29: soft hand-painted pictures (transparent webp, 256 px, ≤ 40 KB each) for
 * the things the games used to draw as flat SVG. The file name is the picture
 * id (the same id the old SVG had in SHAPES, OBJECTS or EXTRA). All files are
 * bundled by Vite, so nothing comes from the network.
 */
const files = import.meta.glob<string>("./assets/art/*.webp", { eager: true, import: "default" });

export const ART: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) ART[path.split("/").pop()!.replace(/\.webp$/, "")] = url;

/** Some ids are the same thing under another name: one picture serves both. */
const ALIAS: Record<string, string> = {
  carrot: "farmCarrot",
  wateringcan: "farmWateringCan",
  bell: "farmBell",
  beacon: "lighthouse",
  hare: "rabbit",
  piglet: "pig",
  chicken: "hen",
};

const real = (id: string): string => (ART[id] ? id : (ALIAS[id] ?? id));

export function hasArt(id: string): boolean {
  return Boolean(ART[real(id)]);
}

export function artUrl(id: string): string {
  const url = ART[real(id)];
  if (!url) throw new Error(`Нет картинки ${id}`);
  return url;
}

/** `<img>` markup that goes where the old SVG markup went (svgNode, innerHTML). */
export function artImg(id: string): string {
  return `<img class="art-img" src="${artUrl(id)}" alt="" draggable="false" decoding="async">`;
}

/** Replaces the `svg` of every entry that has a picture; the others keep their SVG. */
export function withArt<T extends { svg: string }>(items: Record<string, T>): Record<string, T> {
  for (const id of Object.keys(items)) if (hasArt(id)) items[id]!.svg = artImg(id);
  return items;
}
