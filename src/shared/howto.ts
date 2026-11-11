import { audio } from "./audio";
import { character } from "./assets";
import { el } from "./dom";
import { HOWTO, type Art, type Step } from "./howto-data";
import { OBJECTS } from "./objects";
import { loadSeen, markSeen } from "./seen";
import { reducedMotion } from "./style";
import { HOWTO_VOICE } from "./voice-lines";

/**
 * «Как играть»: a picture-first card shown the first time a game opens and
 * again from the «?» button in the game's top bar.
 */

const HAND =
  '<svg viewBox="0 0 64 72" aria-hidden="true"><path d="M14 4 C10 4 8 7 8 11 V40 L4 35 C1 32 -2 35 1 39 L15 60 C19 66 25 69 33 69 H40 C51 69 58 61 58 50 V33 C58 29 55 27 52 27 C49 27 47 29 47 32 V30 C47 26 44 24 41 24 C38 24 36 26 36 29 V27 C36 23 33 21 30 21 C27 21 25 23 25 26 V11 C25 7 22 4 18 4 Z" fill="#fff7ec" stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round"/></svg>';

const MARKS: Record<string, string> = {
  dots: '<svg viewBox="0 0 100 60"><path d="M10 50 C 30 0, 70 0, 90 50" fill="none" stroke="#8a6f5c" stroke-width="5" stroke-dasharray="1 9" stroke-linecap="round"/><circle cx="10" cy="50" r="7" fill="#3fae6a"/><path class="ht-ink" d="M10 50 C 30 0, 70 0, 90 50" fill="none" stroke="#ff8a3d" stroke-width="6" stroke-linecap="round" pathLength="100"/></svg>',
  grid: '<svg viewBox="0 0 90 90"><rect x="3" y="3" width="84" height="84" rx="10" fill="#d8ecf5" stroke="#3b2e25" stroke-width="3"/><rect x="12" y="12" width="30" height="30" rx="6" fill="#ffd27a"/><rect x="48" y="48" width="30" height="30" rx="6" fill="#9ed36a"/></svg>',
  maze: '<svg viewBox="0 0 90 90"><rect x="3" y="3" width="84" height="84" rx="10" fill="#e9f7dc" stroke="#3b2e25" stroke-width="3"/><path d="M30 3 V60 M60 30 V87" stroke="#3b2e25" stroke-width="5" stroke-linecap="round"/><path class="ht-ink" d="M15 15 V75 H45 V15 H75 V75" fill="none" stroke="#ff8a3d" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" pathLength="100"/></svg>',
  piece: '<svg viewBox="0 0 90 70"><rect x="4" y="4" width="82" height="62" rx="8" fill="#ffe1c9" stroke="#fff" stroke-width="4"/><circle cx="58" cy="30" r="14" fill="#ff8a3d"/><path d="M4 66 L40 36 L86 66" fill="#9ed36a"/></svg>',
  slot: '<svg viewBox="0 0 90 70"><rect x="4" y="4" width="82" height="62" rx="8" fill="#fff" stroke="#8a6f5c" stroke-width="3" stroke-dasharray="7 6"/></svg>',
  basket: '<svg viewBox="0 0 90 70"><path d="M8 26 H82 L72 64 H18 Z" fill="#e8463a" stroke="#3b2e25" stroke-width="3" stroke-linejoin="round"/><path d="M24 26 C24 6 66 6 66 26" fill="none" stroke="#3b2e25" stroke-width="4"/></svg>',
  lamp: '<svg viewBox="0 0 32 32"><path d="M16 3a9 9 0 0 0-5 16.5V23h10v-3.5A9 9 0 0 0 16 3z" fill="#ffc94a" stroke="#3b2e25" stroke-width="2"/><path d="M12 26h8M13 29h6" stroke="#3b2e25" stroke-width="2.4" stroke-linecap="round"/></svg>',
  plate: '<svg viewBox="0 0 90 50"><ellipse cx="45" cy="30" rx="40" ry="14" fill="#fff" stroke="#3b2e25" stroke-width="3"/><circle cx="38" cy="22" r="9" fill="#ff8a3d"/><circle cx="52" cy="22" r="8" fill="#9ed36a"/></svg>',
  pyramid: '<svg viewBox="0 0 90 80"><rect x="42" y="4" width="6" height="70" fill="#a3490d"/><rect x="12" y="58" width="66" height="16" rx="8" fill="#e8463a" stroke="#3b2e25" stroke-width="3"/><rect x="20" y="40" width="50" height="16" rx="8" fill="#ffb23f" stroke="#3b2e25" stroke-width="3"/><rect x="28" y="22" width="34" height="16" rx="8" fill="#9ed36a" stroke="#3b2e25" stroke-width="3"/></svg>',
  block: '<svg viewBox="0 0 90 60"><rect x="6" y="16" width="78" height="40" rx="6" fill="#3a8fd4" stroke="#3b2e25" stroke-width="3"/><rect x="14" y="6" width="16" height="12" rx="3" fill="#3a8fd4" stroke="#3b2e25" stroke-width="3"/><rect x="60" y="6" width="16" height="12" rx="3" fill="#3a8fd4" stroke="#3b2e25" stroke-width="3"/></svg>',
  ghost: '<svg viewBox="0 0 90 60"><rect x="6" y="16" width="78" height="40" rx="6" fill="#cfe4f6" stroke="#3a8fd4" stroke-width="3" stroke-dasharray="7 5"/></svg>',
  number: '<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="16" fill="#3fae6a"/><text x="30" y="37" text-anchor="middle" font-size="22" font-weight="800" fill="#fff" font-family="sans-serif">1</text></svg>',
  pot: '<svg viewBox="0 0 90 70"><rect x="14" y="22" width="62" height="40" rx="8" fill="#6db3d4" stroke="#3b2e25" stroke-width="3"/><rect x="8" y="16" width="74" height="10" rx="5" fill="#9fcbe2" stroke="#3b2e25" stroke-width="3"/><path d="M34 10 q4 -6 0 -10 M48 10 q4 -6 0 -10" stroke="#c9b8a8" stroke-width="3" fill="none"/></svg>',
  coin: '<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="22" fill="#ffc94a" stroke="#3b2e25" stroke-width="3"/><circle cx="30" cy="30" r="13" fill="none" stroke="#c98a12" stroke-width="3"/></svg>',
  till: '<svg viewBox="0 0 90 70"><rect x="8" y="24" width="74" height="40" rx="8" fill="#9b6cd8" stroke="#3b2e25" stroke-width="3"/><rect x="22" y="8" width="46" height="20" rx="4" fill="#e8f6ee" stroke="#3b2e25" stroke-width="3"/></svg>',
  brush: '<svg viewBox="0 0 90 70"><circle cx="22" cy="35" r="14" fill="#e8463a"/><circle cx="46" cy="35" r="14" fill="#ffc94a"/><circle cx="70" cy="35" r="14" fill="#3a8fd4" stroke="#3b2e25" stroke-width="4"/></svg>',
  heart: '<svg viewBox="0 0 60 56"><path d="M30 52 C10 38 4 28 4 18 C4 9 11 4 18 4 C24 4 28 8 30 12 C32 8 36 4 42 4 C49 4 56 9 56 18 C56 28 50 38 30 52 Z" fill="#f05a6e" stroke="#3b2e25" stroke-width="3"/></svg>',
  star: '<svg viewBox="0 0 32 32"><path d="M16 2.5l4.1 8.6 9.4 1.2-6.9 6.5 1.8 9.3L16 23.6l-8.4 4.5 1.8-9.3-6.9-6.5 9.4-1.2z" fill="#ffc94a" stroke="#3b2e25" stroke-width="2"/></svg>',
};

function artNode(a: Art, cls: string): HTMLElement {
  const box = el("span", { class: `ht-art ${cls}` });
  if ("o" in a) box.innerHTML = OBJECTS[a.o].svg;
  else if ("shadow" in a) {
    box.innerHTML = OBJECTS[a.shadow].svg;
    box.classList.add("is-shadow");
  } else if ("c" in a) box.append(el("img", { attrs: { src: character(a.c), alt: "", draggable: "false" } }));
  else box.innerHTML = MARKS[a.mark] ?? "";
  return box;
}

function stepNode(step: Step, i: number): HTMLElement {
  const pic = el("div", { class: `ht-pic ht-pic--${step.move}` });
  pic.append(artNode(step.from, "ht-from"));
  if (step.to) pic.append(el("span", { class: "ht-arrow", attrs: { "aria-hidden": "true" } }), artNode(step.to, "ht-to"));
  const hand = el("span", { class: "ht-hand", attrs: { "aria-hidden": "true" } });
  hand.innerHTML = HAND;
  pic.append(hand);
  pic.style.setProperty("--delay", `${i * 0.5}s`);
  return el("li", { class: "ht-step" }, [el("b", { class: "ht-num", text: String(i + 1) }), pic, el("p", { class: "ht-text", text: step.text })]);
}

let open: HTMLElement | null = null;
let waiting: Array<() => void> = [];

/** Run `fn` once no «Как играть» card is on screen. */
export function afterHowTo(fn: () => void): void {
  if (open) waiting.push(fn);
  else fn();
}

/** Show the card for a game. Resolves when the child taps «Понятно!». */
export function showHowTo(gameId: string): Promise<void> {
  const h = HOWTO[gameId];
  if (!h || open) return Promise.resolve();
  return new Promise((resolve) => {
    const ok = el("button", { class: "btn btn--play ht-ok", attrs: { type: "button" } }, [el("span", { text: "Понятно!" })]);
    const card = el("div", { class: "ht-card", attrs: { role: "dialog", "aria-modal": "true", "aria-label": `Как играть: ${h.title}` } }, [
      el("p", { class: "ht-eyebrow", text: "Как играть" }),
      el("h2", { class: "ht-title", text: h.title }),
      el("ol", { class: `ht-steps ht-steps--${h.steps.length}` }, h.steps.map(stepNode)),
      ok,
    ]);
    const overlay = el("div", { class: `ht${reducedMotion() ? " is-still" : ""}` }, [card]);
    open = overlay;
    let closed = false;
    const close = (): void => {
      // A quick double tap must not close twice (and drop another card).
      if (closed) return;
      closed = true;
      audio.unlock();
      audio.play("click");
      overlay.classList.remove("is-open");
      setTimeout(() => overlay.remove(), 200);
      if (open === overlay) open = null;
      void markSeen("howto", gameId);
      const list = waiting;
      waiting = [];
      for (const fn of list) fn();
      resolve();
    };
    ok.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    document.body.append(overlay);
    const line = HOWTO_VOICE[gameId];
    if (line) audio.say(line);
    requestAnimationFrame(() => overlay.classList.add("is-open"));
    setTimeout(() => ok.focus({ preventScroll: true }), 60);
  });
}

export async function howToSeen(gameId: string): Promise<boolean> {
  return (await loadSeen()).howto.includes(gameId);
}

export function closeHowTo(): void {
  open?.remove();
  open = null;
  waiting = [];
}

/**
 * Put a «?» button in the game's top bar (and keep it there as the game
 * changes screens). Returns a stop function.
 */
export function attachHowToButton(gameId: string, root: HTMLElement): () => void {
  if (!HOWTO[gameId]) return () => {};
  const add = (): void => {
    const bar = root.querySelector<HTMLElement>(".toolbar, .menu__head");
    if (!bar || bar.querySelector(".btn--howto")) return;
    const btn = el(
      "button",
      { class: "btn btn--back btn--howto", attrs: { type: "button", "aria-label": "Как играть" }, on: { click: () => void showHowTo(gameId) } },
      [el("span", { attrs: { "aria-hidden": "true" }, text: "?" })],
    );
    if (bar.classList.contains("menu__head")) {
      bar.append(btn);
      return;
    }
    const last = bar.lastElementChild as HTMLElement | null;
    if (last?.classList.contains("toolbar__tools")) last.prepend(btn);
    else {
      const tools = el("span", { class: "toolbar__tools" }, [btn]);
      if (last) last.replaceWith(tools);
      else bar.append(tools);
      // Keep what was there (a score chip) next to the «?».
      if (last && !last.classList.contains("toolbar__spacer")) tools.append(last);
    }
  };
  let queued = false;
  const obs = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      add();
    });
  });
  obs.observe(root, { childList: true, subtree: true });
  add();
  return () => obs.disconnect();
}
