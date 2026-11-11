/**
 * Pictures shared by several games, bundled by Vite (no network at runtime).
 *  - levels/*.webp: 16:9 scenes with Ryzhik, family and friends (1280×720),
 *    first made for «Тайная картинка».
 *  - characters/*.webp: transparent full-body cutouts. ryzhik.webp comes from
 *    the coloring app; the rest are cut from the master sheets by
 *    scripts/make-cutouts.py.
 */
const levelFiles = import.meta.glob<string>("./assets/levels/*.webp", { eager: true, import: "default" });
const characterFiles = import.meta.glob<string>("./assets/characters/*.webp", { eager: true, import: "default" });

function byName(files: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [path, url] of Object.entries(files)) {
    const name = path.split("/").pop()!.replace(/\.webp$/, "");
    out[name] = url;
  }
  return out;
}

export const pictures = byName(levelFiles);
export const characters = byName(characterFiles);

export type PictureId = keyof typeof pictures;

export function picture(id: string): string {
  const url = pictures[id];
  if (!url) throw new Error(`Нет картинки ${id}`);
  return url;
}

export function character(id: string): string {
  const url = characters[id];
  if (!url) throw new Error(`Нет героя ${id}`);
  return url;
}

/** Names for characters, used in aria labels and hints. */
export const CHARACTER_NAMES: Record<string, string> = {
  ryzhik: "Рыжик",
  mama: "Мама",
  papa: "Папа",
  ezhik: "Ёжик",
  belka: "Белочка",
  mishka: "Мишка",
};
