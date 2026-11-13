import { audio } from "./audio";
import { el, svgEl } from "./dom";
import { reducedMotion } from "./style";

/**
 * v13: the first time a game is opened, a small gift box opens over it with
 * a few sparkles — 1.4 s, never blocks a tap (pointer-events: none).
 */
const BOX =
  '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">' +
  '<g class="gift-pop__lid"><rect x="18" y="34" width="84" height="22" rx="6" fill="#ff8a3d" stroke="#3b2e25" stroke-width="4"/>' +
  '<rect x="54" y="34" width="12" height="22" fill="#ffc94a" stroke="#3b2e25" stroke-width="4"/>' +
  '<path d="M60 34 C 44 14 30 26 44 34 M60 34 C 76 14 90 26 76 34" fill="#ffc94a" stroke="#3b2e25" stroke-width="4" stroke-linejoin="round"/></g>' +
  '<rect x="24" y="56" width="72" height="50" rx="6" fill="#e8463a" stroke="#3b2e25" stroke-width="4"/>' +
  '<rect x="54" y="56" width="12" height="50" fill="#ffc94a" stroke="#3b2e25" stroke-width="4"/>' +
  "</svg>";

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
