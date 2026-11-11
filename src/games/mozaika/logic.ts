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
};

/**
 * Board for a 16:9 picture plus a tray for the loose pieces. Portrait puts
 * the tray under the board, landscape puts it on the right.
 */
export function layout(width: number, height: number, cols: number, rows: number, aspect = 16 / 9): Layout {
  const gap = 14;
  const portrait = height >= width * 0.9;
  let bw: number;
  if (portrait) {
    bw = Math.min(width, (height * 0.48) * aspect);
  } else {
    bw = Math.min(width * 0.6, height * aspect);
  }
  bw = Math.floor(bw);
  const bh = Math.floor(bw / aspect);
  const board: Rect = portrait
    ? { x: Math.floor((width - bw) / 2), y: 0, w: bw, h: bh }
    : { x: 0, y: Math.floor((height - bh) / 2), w: bw, h: bh };
  const tray: Rect = portrait
    ? { x: 0, y: bh + gap, w: width, h: Math.max(0, height - bh - gap) }
    : { x: bw + gap, y: 0, w: Math.max(0, width - bw - gap), h: height };
  return { board, tray, piece: { w: bw / cols, h: bh / rows } };
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
  return Math.hypot(center.x - cx, center.y - cy) <= Math.max(size.w, size.h) * 0.45;
}

/** Stars are generous: a few wrong drops still give three. */
export function starsFor(misses: number, pieces: number): number {
  if (misses <= pieces) return 3;
  if (misses <= pieces * 2) return 2;
  return 1;
}
