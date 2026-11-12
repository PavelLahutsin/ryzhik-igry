import { reducedMotion } from "./style";

export type Point = { x: number; y: number };

/** Index of the nearest target centre within maxDist, or -1. Pure, for tests. */
export function nearestWithin(point: Point, targets: readonly Point[], maxDist: number): number {
  let best = -1;
  let bestDist = maxDist;
  targets.forEach((t, i) => {
    const d = Math.hypot(t.x - point.x, t.y - point.y);
    if (d <= bestDist) {
      best = i;
      bestDist = d;
    }
  });
  return best;
}

export function centerOf(node: Element): Point {
  const r = node.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/**
 * What a game says about a drop: true — taken (the game places the node);
 * false — a wrong target (the game counts the mistake and explains);
 * "none" — no target there: never a mistake, the piece wobbles back softly.
 */
export type DropResult = boolean | "none";

export type DragOptions = {
  onStart?: () => void;
  /** Centre of the dragged node in client coordinates. */
  onMove?: (center: Point) => void;
  /**
   * Called on release with the dragged node's centre — or, for tap-tap, with
   * the point that was tapped while the node was picked. Return true when the
   * game took the piece (it places the node itself); false or "none" bounces it back.
   */
  onDrop: (center: Point) => DropResult;
  /** A tap on the node. Return true when the game used it (e.g. turned a piece); otherwise the node is picked for tap-tap. */
  onTap?: () => boolean;
};

/** Soft sound for a drop on empty space; main.ts plugs in the audio. */
export const dragFeedback = { none: (): void => {} };

/** Shrink, wobble and sound for «not here» (no mistake). */
export function nope(node: HTMLElement): void {
  dragFeedback.none();
  if (reducedMotion()) return;
  node.classList.remove("is-nope");
  void node.offsetWidth;
  node.classList.add("is-nope");
  setTimeout(() => node.classList.remove("is-nope"), 450);
}

/**
 * Tap-tap: a tap on a piece picks it (lifted, glowing); the next tap on the
 * screen drops it there through the same onDrop as a drag; a tap on the
 * picked piece puts it down again; a tap on another piece picks that one.
 * Buttons and cards stay buttons.
 */
type Picked = { node: HTMLElement; drop: (p: Point) => void };
let picked: Picked | null = null;
let tapDown: { id: number; x: number; y: number } | null = null;
const PASS = "button, a, input, [role=button], .ht, .praise, .topbar, [data-drag]";

function onDocDown(event: PointerEvent): void {
  tapDown = { id: event.pointerId, x: event.clientX, y: event.clientY };
}
function onDocUp(event: PointerEvent): void {
  const down = tapDown;
  tapDown = null;
  const p = picked;
  if (!p || !down || down.id !== event.pointerId) return;
  if (!isTap(event.clientX - down.x, event.clientY - down.y)) return;
  const target = event.target instanceof Element ? event.target : null;
  if (target?.closest(PASS)) return;
  if (!p.node.isConnected || p.node.classList.contains("is-placed")) return unpick();
  unpick();
  // This tap was the drop: the click that follows must not press what is there.
  const eat = (e: Event): void => {
    e.stopPropagation();
    e.preventDefault();
  };
  document.addEventListener("click", eat, { capture: true, once: true });
  setTimeout(() => document.removeEventListener("click", eat, true), 400);
  p.drop({ x: event.clientX, y: event.clientY });
}
export function unpick(): void {
  if (!picked) return;
  picked.node.classList.remove("is-selected");
  picked = null;
  document.removeEventListener("pointerdown", onDocDown, true);
  document.removeEventListener("pointerup", onDocUp, true);
}
function pick(entry: Picked): void {
  unpick();
  picked = entry;
  entry.node.classList.add("is-selected");
  document.addEventListener("pointerdown", onDocDown, true);
  document.addEventListener("pointerup", onDocUp, true);
}
/** The piece picked for tap-tap, if any (for tests and the QA script). */
export const pickedNode = (): HTMLElement | null => picked?.node ?? null;

/**
 * Pointer drag for big touch pieces. The node follows the finger with a
 * transform, so the game layout stays untouched until a drop is accepted.
 * A short tap instead picks the piece for tap-tap (see above).
 */
export function draggable(node: HTMLElement, options: DragOptions): () => void {
  let pointer: number | null = null;
  let startX = 0;
  let startY = 0;
  let base: Point = { x: 0, y: 0 };
  let dx = 0;
  let dy = 0;

  const settle = (result: DropResult): void => {
    if (result === true) {
      node.style.transition = "none";
      node.style.transform = "";
      return;
    }
    node.style.transition = reducedMotion() ? "none" : "transform 280ms cubic-bezier(.3,1.4,.5,1)";
    node.style.transform = "";
    if (result === "none") nope(node);
  };
  const entry: Picked = { node, drop: (p) => settle(options.onDrop(p)) };

  const down = (event: PointerEvent): void => {
    if (pointer !== null || node.classList.contains("is-placed")) return;
    pointer = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    dx = 0;
    dy = 0;
    base = centerOf(node);
    node.setPointerCapture?.(event.pointerId);
    node.style.transition = "none";
    node.classList.add("is-dragging");
    options.onStart?.();
    event.preventDefault();
  };
  const move = (event: PointerEvent): void => {
    if (event.pointerId !== pointer) return;
    dx = event.clientX - startX;
    dy = event.clientY - startY;
    if (picked?.node === node && isTap(dx, dy)) return;
    if (picked?.node === node) unpick();
    node.style.transform = `translate(${dx}px, ${dy}px) scale(1.08)`;
    options.onMove?.({ x: base.x + dx, y: base.y + dy });
  };
  const up = (event: PointerEvent): void => {
    if (event.pointerId !== pointer) return;
    pointer = null;
    node.classList.remove("is-dragging");
    // Placed meanwhile (the lamp flew it home): nothing to drop.
    if (node.classList.contains("is-placed")) {
      node.style.transition = "none";
      node.style.transform = "";
      return;
    }
    if (event.type === "pointerup" && isTap(dx, dy)) {
      node.style.transition = "none";
      node.style.transform = "";
      if (options.onTap?.()) return unpick();
      if (picked?.node === node) unpick();
      else pick(entry);
      return;
    }
    settle(options.onDrop({ x: base.x + dx, y: base.y + dy }));
  };

  node.dataset.drag = "";
  node.style.touchAction = "none";
  node.addEventListener("pointerdown", down);
  node.addEventListener("pointermove", move);
  node.addEventListener("pointerup", up);
  node.addEventListener("pointercancel", up);
  return () => {
    if (picked?.node === node) unpick();
    node.removeEventListener("pointerdown", down);
    node.removeEventListener("pointermove", move);
    node.removeEventListener("pointerup", up);
    node.removeEventListener("pointercancel", up);
  };
}

/** A rectangle in client coordinates. */
export type Box = { left: number; top: number; width: number; height: number };

/** The drop zone of a target: the ellipse inside its box, `ratio` of its size from the centre on each axis. */
export const DROP_RATIO = 0.45;

/**
 * Index of the target whose drop zone holds the point (the closest one,
 * measured in its own size), or -1. With ratio < 0.5 the zone stays inside
 * the box, so boxes that do not overlap never have overlapping zones.
 */
export function dropTarget(point: Point, boxes: readonly Box[], ratio = DROP_RATIO): number {
  let best = -1;
  let bestD = 1;
  boxes.forEach((b, i) => {
    if (b.width <= 0 || b.height <= 0) return;
    const nx = (point.x - (b.left + b.width / 2)) / (b.width * ratio);
    const ny = (point.y - (b.top + b.height / 2)) / (b.height * ratio);
    const d = Math.hypot(nx, ny);
    if (d <= bestD) {
      best = i;
      bestD = d;
    }
  });
  return best;
}

/**
 * Where a drop landed, two ways: `box` — the target whose box holds the point
 * (generous: a right answer anywhere on the target counts); `zone` — the
 * target whose 0.45 zone holds it (strict: only this may count a mistake).
 */
export function dropHits(point: Point, boxes: readonly Box[]): { box: number; zone: number } {
  return { box: dropTarget(point, boxes, 0.5 * Math.SQRT2), zone: dropTarget(point, boxes) };
}

/** True when two targets' drop zones share a point (checked on a grid; for tests and QA). */
export function zonesOverlap(a: Box, b: Box, ratio = DROP_RATIO): boolean {
  const inZone = (p: Point, z: Box): boolean => dropTarget(p, [z], ratio) === 0;
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps; j++) {
      const p = { x: a.left + (a.width * i) / steps, y: a.top + (a.height * j) / steps };
      if (inZone(p, a) && inZone(p, b)) return true;
    }
  }
  return false;
}

export type FreeDragOptions = {
  /** A short touch without moving. */
  onTap?: () => void;
  onStart?: () => void;
  onMove?: (center: Point) => void;
  /** Released after moving; the node stays where it was left (`left/top` are updated by the caller). */
  onDrop?: (center: Point, moved: Point) => void;
};

/** Below this many pixels a touch is a tap, not a drag. Pure, for tests. */
export function isTap(dx: number, dy: number, threshold = 10): boolean {
  return Math.hypot(dx, dy) < threshold;
}

/**
 * Drag that does not bounce back (sandbox toys, characters). While dragging
 * the node follows by transform; on release the caller gets the total move
 * and decides where the node lives now.
 */
export function freeDrag(node: HTMLElement, options: FreeDragOptions): () => void {
  let pointer: number | null = null;
  let startX = 0;
  let startY = 0;
  let base: Point = { x: 0, y: 0 };
  let dx = 0;
  let dy = 0;
  let dragging = false;

  const down = (event: PointerEvent): void => {
    if (pointer !== null) return;
    pointer = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    dx = 0;
    dy = 0;
    dragging = false;
    base = centerOf(node);
    node.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    event.stopPropagation();
  };
  const move = (event: PointerEvent): void => {
    if (event.pointerId !== pointer) return;
    dx = event.clientX - startX;
    dy = event.clientY - startY;
    if (!dragging && isTap(dx, dy)) return;
    if (!dragging) {
      dragging = true;
      node.classList.add("is-dragging");
      options.onStart?.();
    }
    node.style.transform = `translate(${dx}px, ${dy}px) scale(1.06)`;
    options.onMove?.({ x: base.x + dx, y: base.y + dy });
  };
  const up = (event: PointerEvent): void => {
    if (event.pointerId !== pointer) return;
    pointer = null;
    node.classList.remove("is-dragging");
    node.style.transform = "";
    if (!dragging) {
      options.onTap?.();
      return;
    }
    dragging = false;
    options.onDrop?.({ x: base.x + dx, y: base.y + dy }, { x: dx, y: dy });
  };

  node.style.touchAction = "none";
  node.addEventListener("pointerdown", down);
  node.addEventListener("pointermove", move);
  node.addEventListener("pointerup", up);
  node.addEventListener("pointercancel", up);
  return () => {
    node.removeEventListener("pointerdown", down);
    node.removeEventListener("pointermove", move);
    node.removeEventListener("pointerup", up);
    node.removeEventListener("pointercancel", up);
  };
}

export type TrackHandlers = {
  /** A finger touched the node. Return false to ignore this touch. */
  down: (event: PointerEvent) => boolean | void;
  /** The same finger moved (once per event; see `coalesced`). */
  move: (event: PointerEvent) => void;
  /** The finger lifted or the browser took the touch away. */
  up?: (event: PointerEvent) => void;
};

/**
 * One-finger tracking for drawing and tracing (dots, lines, the maze): the
 * last finger that went down leads, other fingers are ignored, and the node
 * keeps getting moves outside its box (pointer capture). Returns a stop
 * function that removes the listeners.
 */
export function pointerTrack(node: HTMLElement | SVGSVGElement, handlers: TrackHandlers): () => void {
  let pointer: number | null = null;
  const down = (event: PointerEvent): void => {
    if (handlers.down(event) === false) return;
    pointer = event.pointerId;
    node.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  };
  const move = (event: PointerEvent): void => {
    if (event.pointerId === pointer) handlers.move(event);
  };
  const up = (event: PointerEvent): void => {
    if (event.pointerId !== pointer) return;
    pointer = null;
    handlers.up?.(event);
  };
  const on = [
    ["pointerdown", down],
    ["pointermove", move],
    ["pointerup", up],
    ["pointercancel", up],
  ] as const;
  node.style.touchAction = "none";
  for (const [type, fn] of on) node.addEventListener(type, fn as EventListener);
  return () => {
    for (const [type, fn] of on) node.removeEventListener(type, fn as EventListener);
  };
}

/** All positions of a fast move (the browser may batch them). */
export function coalesced(event: PointerEvent): PointerEvent[] {
  const list = event.getCoalescedEvents?.();
  return list && list.length > 0 ? list : [event];
}
