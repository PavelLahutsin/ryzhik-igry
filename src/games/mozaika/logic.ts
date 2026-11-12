import { DROP_RATIO } from "../../shared/drag";
import { rateBy, STARS, type Score } from "../../shared/stars";
import { shuffle } from "../../shared/rng";

export type Rect = { x: number; y: number; w: number; h: number };

export type Piece = { index: number; col: number; row: number };

export function makePieces(cols: number, rows: number): Piece[] {
  const out: Piece[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) out.push({ index: row * cols + col, col, row });
  }
  return out;
}

export type Layout = {
  board: Rect;
  tray: Rect;
  piece: { w: number; h: number };
  /** Loose pieces on the tray at a time; the rest wait and slide in one by one. */
  visible: number;
};

/** The smallest side a piece should have (a 3-year-old's finger, v12). */
export const MIN_PIECE = 56;
/** When the tray streams pieces, at least this many lie there at a time. */
export const MIN_VISIBLE = 4;
/** Never smaller than a touch target. */
export const TOUCH_PX = 44;

/** How many pieces lie side by side in the tray. */
export function trayCapacity(tray: Rect, piece: { w: number; h: number }): number {
  return Math.floor(tray.w / (piece.w * 1.08)) * Math.floor(tray.h / (piece.h * 1.08));
}

/**
 * Board for a 16:9 picture plus a tray for the loose pieces. Portrait puts
 * the tray under the board, landscape puts it on the right. `slots` extra
 * cells in the tray (the basket for extra pieces).
 *
 * Preference: the biggest board where every loose piece fits and pieces are
 * at least MIN_PIECE; else the biggest board with MIN_PIECE pieces where the
 * tray streams (≥ MIN_VISIBLE at a time, the next slides in after a
 * placement — a landscape phone); else, as before, the biggest board where
 * all fit (a portrait phone, whose width limits a 16:9 board anyway).
 */
export function layout(width: number, height: number, cols: number, rows: number, aspect = 16 / 9, extra = 0, slots = 0): Layout {
  const loose = cols * rows + extra;
  const all: Layout[] = [];
  for (let scale = 1; scale >= 0.5 - 1e-9; scale -= 0.05) all.push(layoutAt(width, height, cols, rows, aspect, scale, loose));
  const side = (l: Layout): number => Math.min(l.piece.w, l.piece.h);
  const cap = (l: Layout): number => trayCapacity(l.tray, l.piece) - slots;
  const streamed = (l: Layout): Layout => ({ ...l, visible: Math.min(loose, cap(l)) });
  // Big pieces first, then at least a touch target (44 px), streaming if needed.
  for (const min of [MIN_PIECE, TOUCH_PX]) {
    const fitsAll = all.find((l) => side(l) >= min && cap(l) >= loose);
    if (fitsAll) return fitsAll;
    const stream = all.find((l) => side(l) >= min && cap(l) >= Math.min(loose, MIN_VISIBLE));
    if (stream) return streamed(stream);
  }
  return all.find((l) => cap(l) >= loose) ?? all[0]!;
}

/** Do `count` pieces fit in the tray without lying on top of each other? */
export function trayFits(count: number, tray: Rect, piece: { w: number; h: number }): boolean {
  const across = Math.floor(tray.w / (piece.w * 1.08));
  const down = Math.floor(tray.h / (piece.h * 1.08));
  return across * down >= count;
}

function layoutAt(width: number, height: number, cols: number, rows: number, aspect: number, scale: number, loose: number): Layout {
  const gap = 14;
  const portrait = height >= width * 0.9;
  let bw: number;
  if (portrait) {
    bw = Math.min(width, height * 0.48 * aspect);
  } else {
    bw = Math.min(width * 0.6, height * aspect);
  }
  bw = Math.floor(bw * scale);
  const bh = Math.floor(bw / aspect);
  const board: Rect = portrait
    ? { x: Math.floor((width - bw) / 2), y: 0, w: bw, h: bh }
    : { x: 0, y: Math.floor((height - bh) / 2), w: bw, h: bh };
  const tray: Rect = portrait
    ? { x: 0, y: bh + gap, w: width, h: Math.max(0, height - bh - gap) }
    : { x: bw + gap, y: 0, w: Math.max(0, width - bw - gap), h: height };
  return { board, tray, piece: { w: bw / cols, h: bh / rows }, visible: loose };
}

/** Top-left of a piece's home cell inside the board. */
export function slotOf(piece: Piece, board: Rect, size: { w: number; h: number }): { x: number; y: number } {
  return { x: board.x + piece.col * size.w, y: board.y + piece.row * size.h };
}

/**
 * Spots for loose pieces in the tray: a loose grid with a little jitter, in
 * shuffled order, kept fully inside the tray when there is room.
 */
export function scatter(count: number, tray: Rect, size: { w: number; h: number }, rand: () => number): Array<{ x: number; y: number }> {
  const fitRows = Math.max(1, Math.floor(tray.h / (size.h * 1.08)));
  // At least two columns so the pieces look scattered, more if rows run out.
  const cols = Math.max(Math.min(2, count), Math.floor(tray.w / (size.w * 1.08)), Math.ceil(count / fitRows));
  const cellW = Math.min(size.w * 1.12, tray.w / cols);
  const cellH = size.h * 1.12;
  const rows = Math.max(1, Math.ceil(count / cols));
  // Rows spread over the tray (a bit looser than packed), centred vertically.
  const stepY = rows > 1 ? Math.min(cellH * 1.35, Math.max(0, (tray.h - size.h) / (rows - 1))) : 0;
  const top = tray.y + Math.max(0, (tray.h - (stepY * (rows - 1) + size.h)) / 2);
  const offsetX = Math.max(0, (tray.w - Math.min(count, cols) * cellW) / 2);
  const cells = shuffle(
    Array.from({ length: count }, (_, i) => i),
    rand,
  );
  return cells.map((cell) => {
    const col = cell % cols;
    const row = Math.floor(cell / cols);
    const jitterX = (rand() - 0.5) * Math.max(0, cellW - size.w);
    const jitterY = (rand() - 0.5) * Math.min(12, cellH - size.h);
    const x = tray.x + offsetX + col * cellW + (cellW - size.w) / 2 + jitterX;
    const y = top + row * stepY + jitterY;
    return {
      x: Math.max(tray.x, Math.min(tray.x + tray.w - size.w, x)),
      y: Math.max(tray.y, Math.min(tray.y + Math.max(0, tray.h - size.h), y)),
    };
  });
}

/** A piece snaps when its centre is within ~45% of a cell from home. */
export function snaps(center: { x: number; y: number }, home: { x: number; y: number }, size: { w: number; h: number }): boolean {
  const cx = home.x + size.w / 2;
  const cy = home.y + size.h / 2;
  return Math.hypot((center.x - cx) / (size.w * DROP_RATIO), (center.y - cy) / (size.h * DROP_RATIO)) <= 1;
}

/** The point is in the 0.45 zone of some place on the board (not on a seam), so a wrong drop there may count. */
export function onCell(p: { x: number; y: number }, board: { x: number; y: number; w: number; h: number }, size: { w: number; h: number }): boolean {
  const col = Math.floor((p.x - board.x) / size.w);
  const row = Math.floor((p.y - board.y) / size.h);
  if (col < 0 || row < 0 || p.x > board.x + board.w || p.y > board.y + board.h) return false;
  return snaps(p, { x: board.x + col * size.w, y: board.y + row * size.h }, size);
}

/** Stars are generous: a few wrong drops still give three. */
/** Pieces dropped in a wrong place; half the piece count is free. */
export function starsFor(misses: number, pieces: number, hints = 0): Score {
  return rateBy(STARS.mozaika, misses, hints, pieces);
}

/** A loose piece for the hint button to fly home, or -1 when all are placed. */
export function hintPiece(indices: readonly number[], placed: ReadonlySet<number>, rand: () => number): number {
  const loose = indices.filter((i) => !placed.has(i));
  if (loose.length === 0) return -1;
  return loose[Math.floor(rand() * loose.length)]!;
}

/** Which pieces start upside down: `n` different ones, never all of them. */
export function pickFlipped(count: number, n: number, rand: () => number): Set<number> {
  const k = Math.max(0, Math.min(n, count - 1));
  return new Set(shuffle(Array.from({ length: count }, (_, i) => i), rand).slice(0, k));
}

/** Cells of the other picture to cut the extra pieces from. */
export function pickExtra(cols: number, rows: number, n: number, rand: () => number): Piece[] {
  return shuffle(makePieces(cols, rows), rand).slice(0, Math.min(n, cols * rows));
}

/** Below this many pixels a release is a tap (turns an upside-down piece). */
export const TAP_PX = 10;
