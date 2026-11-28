import { artImg } from "./art";
import { audio } from "./audio";
import { el, svgEl } from "./dom";
import { reducedMotion } from "./style";

/**
 * v13: the first time a game is opened, a small gift box opens over it with
 * a few sparkles — 1.4 s, never blocks a tap (pointer-events: none).
 */
const BOX = artImg("giftbox");

export function firstOpenGift(root: HTMLElement): void {
  if (reducedMotion()) return;
  const pop = el("div", { class: "gift-pop", attrs: { "aria-hidden": "true" } });
  pop.innerHTML = BOX;
  for (let i = 0; i < 6; i++) {
    const s = svgEl("svg", { viewBox: "0 0 20 20", class: "gift-pop__spark" });
    s.innerHTML = '<path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="#ffc94a"/>';
    s.style.setProperty("--a", `${i * 60 - 90}deg`);
    pop.append(s);
  }
  root.append(pop);
  setTimeout(() => audio.play("sparkle"), 350);
  setTimeout(() => pop.remove(), 1500);
}
