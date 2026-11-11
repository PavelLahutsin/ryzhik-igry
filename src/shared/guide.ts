import type { Point } from "./drag";
import { reducedMotion } from "./style";

/**
 * Visual guidance for children who cannot read yet: a cartoon hand that shows
 * the next action (drag from → to, or a tap), and a timer that calls for help
 * when the child has not touched the screen for a while.
 */

const HAND = `<svg viewBox="0 0 64 72" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<path d="M14 4 C10 4 8 7 8 11 V40 L4 35 C1 32 -2 35 1 39 L15 60 C19 66 25 69 33 69 H40 C51 69 58 61 58 50 V33 C58 29 55 27 52 27 C49 27 47 29 47 32 V30 C47 26 44 24 41 24 C38 24 36 26 36 29 V27 C36 23 33 21 30 21 C27 21 25 23 25 26 V11 C25 7 22 4 18 4 Z" fill="#fff7ec" stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round"/>
<path d="M25 30 V40 M36 30 V40 M47 33 V42" stroke="#3b2e25" stroke-width="2.5" stroke-linecap="round" opacity=".5"/>
</svg>`;

/** Fingertip position inside the hand picture (px at 56 px width). */
const TIP = { x: 14, y: 4 };
const SIZE = 56;

function handNode(): HTMLElement {
  const n = document.createElement("span");
  n.className = "guide-hand";
  n.innerHTML = HAND;
  Object.assign(n.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: `${SIZE}px`,
    height: `${SIZE * 1.125}px`,
    pointerEvents: "none",
    zIndex: "80",
    filter: "drop-shadow(0 4px 6px rgba(59,46,37,.3))",
  });
  return n;
}

const at = (p: Point, scale = 1): string => `translate(${p.x - TIP.x}px, ${p.y - TIP.y}px) scale(${scale})`;

/** Show the hand dragging something from one point to another (client coordinates). */
export function showDrag(from: Point, to: Point, parent: HTMLElement = document.body): void {
  if (reducedMotion()) return;
  const hand = handNode();
  hand.style.transformOrigin = `${TIP.x}px ${TIP.y}px`;
  parent.append(hand);
  const anim = hand.animate(
    [
      { transform: at(from, 1.2), opacity: 0 },
      { transform: at(from, 1.2), opacity: 1, offset: 0.12 },
      { transform: at(from, 0.9), opacity: 1, offset: 0.22 },
      { transform: at(to, 0.9), opacity: 1, offset: 0.72 },
      { transform: at(to, 1.15), opacity: 1, offset: 0.82 },
      { transform: at(to, 1.15), opacity: 0 },
    ],
    { duration: 2000, easing: "ease-in-out" },
  );
  anim.onfinish = () => hand.remove();
}

/** Show the hand tapping a point (twice). */
export function showTap(p: Point, parent: HTMLElement = document.body): void {
  if (reducedMotion()) return;
  const hand = handNode();
  hand.style.transformOrigin = `${TIP.x}px ${TIP.y}px`;
  parent.append(hand);
  const anim = hand.animate(
    [
      { transform: at(p, 1.2), opacity: 0 },
      { transform: at(p, 1.2), opacity: 1, offset: 0.15 },
      { transform: at(p, 0.85), offset: 0.3 },
      { transform: at(p, 1.1), offset: 0.45 },
      { transform: at(p, 0.85), offset: 0.6 },
      { transform: at(p, 1.1), opacity: 1, offset: 0.8 },
      { transform: at(p, 1.1), opacity: 0 },
    ],
    { duration: 1700, easing: "ease-in-out" },
  );
  anim.onfinish = () => hand.remove();
}

export const centre = (n: Element): Point => {
  const r = n.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

/**
 * Calls `onIdle` after `ms` without any touch on the page, then again every
 * `ms * 1.5` while the child still waits. Returns a stop function.
 */
export function whenIdle(onIdle: () => void, ms = 5000): () => void {
  let last = performance.now();
  let next = ms;
  const touch = (): void => {
    last = performance.now();
    next = ms;
  };
  window.addEventListener("pointerdown", touch, true);
  const timer = window.setInterval(() => {
    if (document.hidden) return;
    if (performance.now() - last >= next) {
      last = performance.now();
      next = ms * 1.5;
      onIdle();
    }
  }, 500);
  return () => {
    window.removeEventListener("pointerdown", touch, true);
    clearInterval(timer);
  };
}
