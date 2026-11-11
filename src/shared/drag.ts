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

export type DragOptions = {
  onStart?: () => void;
  /** Centre of the dragged node in client coordinates. */
  onMove?: (center: Point) => void;
  /**
   * Called on release with the dragged node's centre. Return true when the
   * game took the piece (it places the node itself); false bounces it back.
   */
  onDrop: (center: Point) => boolean;
};

/**
 * Pointer drag for big touch pieces. The node follows the finger with a
 * transform, so the game layout stays untouched until a drop is accepted.
 */
export function draggable(node: HTMLElement, options: DragOptions): () => void {
  let pointer: number | null = null;
  let startX = 0;
  let startY = 0;
  let base: Point = { x: 0, y: 0 };
  let dx = 0;
  let dy = 0;

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
    node.style.transform = `translate(${dx}px, ${dy}px) scale(1.08)`;
    options.onMove?.({ x: base.x + dx, y: base.y + dy });
  };
  const up = (event: PointerEvent): void => {
    if (event.pointerId !== pointer) return;
    pointer = null;
    node.classList.remove("is-dragging");
    const accepted = options.onDrop({ x: base.x + dx, y: base.y + dy });
    if (accepted) {
      node.style.transition = "none";
      node.style.transform = "";
      return;
    }
    node.style.transition = reducedMotion() ? "none" : "transform 280ms cubic-bezier(.3,1.4,.5,1)";
    node.style.transform = "";
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
