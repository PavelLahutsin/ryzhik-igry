/**
 * «Картинка из наклеек»: a free picture. Stickers are placed anywhere on a
 * background, moved, taken off; nothing to win or lose. Positions are kept
 * in percent of the picture so it looks the same on any screen.
 */
export const BACKGROUNDS = [
  { id: "lug", name: "Луг" },
  { id: "zima", name: "Зима" },
  { id: "komnata", name: "Комната" },
] as const;
export type BgId = (typeof BACKGROUNDS)[number]["id"];

export type Placed = { id: string; x: number; y: number };
export type Picture = { bg: BgId; items: Placed[] };

/** At most this many stickers on one picture (the screen stays light). */
export const MAX_ON_PICTURE = 30;

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));
/** Keeps a sticker centre inside the picture (in percent). */
export const inside = (v: number): number => Math.round(clamp(v, 4, 96) * 10) / 10;

export function normalizePicture(raw: unknown): Picture {
  const r = (raw ?? {}) as Partial<Picture>;
  const bg = BACKGROUNDS.some((b) => b.id === r.bg) ? (r.bg as BgId) : "lug";
  const items = Array.isArray(r.items)
    ? r.items
        .filter((p): p is Placed => !!p && typeof p.id === "string" && Number.isFinite(p.x) && Number.isFinite(p.y))
        .slice(-MAX_ON_PICTURE)
        .map((p) => ({ id: p.id, x: inside(p.x), y: inside(p.y) }))
    : [];
  return { bg, items };
}

/** Adds a sticker; when the picture is full, the oldest one goes. */
export function place(items: readonly Placed[], id: string, x: number, y: number): Placed[] {
  const next = [...items, { id, x: inside(x), y: inside(y) }];
  return next.slice(-MAX_ON_PICTURE);
}

export function moveTo(items: readonly Placed[], index: number, x: number, y: number): Placed[] {
  return items.map((p, i) => (i === index ? { ...p, x: inside(x), y: inside(y) } : p));
}

export function takeOff(items: readonly Placed[], index: number): Placed[] {
  return items.filter((_, i) => i !== index);
}

/** Point (client px) → percent inside a box; null when outside. */
export function toPercent(p: { x: number; y: number }, box: { left: number; top: number; width: number; height: number }): { x: number; y: number } | null {
  if (box.width <= 0 || box.height <= 0) return null;
  const x = ((p.x - box.left) / box.width) * 100;
  const y = ((p.y - box.top) / box.height) * 100;
  if (x < 0 || x > 100 || y < 0 || y > 100) return null;
  return { x, y };
}
