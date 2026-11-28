import { artUrl } from "../../../shared/art";
import { drawIcon, type IconKind } from "../game/render";
import { el } from "./dom";

/** A small static canvas with one of the game icons, for HUD and cards. */
export function iconCanvas(kind: IconKind, size: number, className = "icon"): HTMLCanvasElement {
  const canvas = el("canvas", { class: className, attrs: { "aria-hidden": "true" } });
  const dpr = Math.min(2.5, window.devicePixelRatio || 1);
  canvas.width = Math.round(size * dpr);
  canvas.height = Math.round(size * dpr);
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawIcon(ctx, kind, size / 2, size / 2, size * 0.9, 0);
  }
  return canvas;
}

/** Row of three stars, `filled` of them lit. */
export function starRow(filled: number, className = "stars"): HTMLElement {
  const row = el("span", {
    class: className,
    attrs: { role: "img", "aria-label": `Звёзд: ${filled} из 3` },
  });
  for (let i = 0; i < 3; i++) {
    const img = document.createElement("img");
    img.src = artUrl("starbadge");
    img.alt = "";
    img.draggable = false;
    img.setAttribute("class", i < filled ? "star is-on" : "star");
    img.setAttribute("aria-hidden", "true");
    row.append(img);
  }
  return row;
}
