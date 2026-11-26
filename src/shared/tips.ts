import { audio } from "./audio";
import { el } from "./dom";
import { loadSeen, markSeen } from "./seen";
import { reducedMotion } from "./style";

/**
 * «Новое!» bubbles: the first time something new appears (the hint lamp, a
 * new tool or kind of level) a short bubble points at it. Shown once per tip
 * id, never blocks: it goes away by itself or on any touch.
 */

type Tip = { id: string; target: Element; text: string; ms: number };
const queue: Tip[] = [];
let showing = false;
/** Closes the bubble on screen right away (set while one is shown). */
let closeNow: (() => void) | null = null;
/** Bumped by clearTips(), so a fading old bubble does not start the next one. */
let generation = 0;

export function tipOnce(id: string, target: Element | null, text: string, ms = 4200): void {
  if (!target) return;
  void loadSeen().then((s) => {
    if (s.tips.includes(id) || queue.some((t) => t.id === id)) return;
    queue.push({ id, target, text, ms });
    next();
  });
}

function next(): void {
  if (showing) return;
  const tip = queue.shift();
  if (!tip) return;
  const target = tip.target;
  // Never over a win card or «Как играть»: the tip waits for another time.
  if (!tip.target.isConnected || document.querySelector(".praise, .ht")) {
    next();
    return;
  }
  const r = tip.target.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) {
    next();
    return;
  }
  showing = true;
  void markSeen("tips", tip.id);
  audio.play("sparkle");
  audio.say("v08");
  const ring = el("span", { class: "tip-ring", attrs: { "aria-hidden": "true" } });
  Object.assign(ring.style, { left: `${r.left - 6}px`, top: `${r.top - 6}px`, width: `${r.width + 12}px`, height: `${r.height + 12}px` });
  const below = r.top + r.height / 2 < window.innerHeight / 2;
  const bubble = el("div", { class: `tip ${below ? "tip--below" : "tip--above"}`, attrs: { role: "status" } }, [
    el("b", { class: "tip__new", text: "Новое!" }),
    el("span", { class: "tip__text", text: tip.text }),
  ]);
  document.body.append(ring, bubble);
  const bw = Math.min(300, window.innerWidth - 24);
  bubble.style.width = `${bw}px`;
  const cx = Math.max(12 + bw / 2, Math.min(window.innerWidth - 12 - bw / 2, r.left + r.width / 2));
  bubble.style.left = `${cx - bw / 2}px`;
  bubble.style.setProperty("--arrow", `${r.left + r.width / 2 - (cx - bw / 2)}px`);
  if (below) bubble.style.top = `${r.bottom + 14}px`;
  else bubble.style.bottom = `${window.innerHeight - r.top + 14}px`;
  // If the bubble covers the task text (the hint lamp sits above `.fm-say` /
  // `.tn-note`), park it to the left of the target instead.
  const coversAsk = (): boolean => {
    const b = bubble.getBoundingClientRect();
    for (const n of document.querySelectorAll(".fm-say, .tn-note, .lb-ask, .so-ask")) {
      const q = n.getBoundingClientRect();
      if (q.width < 8 || q.height < 8) continue;
      if (b.right > q.left && b.left < q.right && b.bottom > q.top && b.top < q.bottom) return true;
    }
    return false;
  };
  if (coversAsk()) {
    const sideW = Math.min(bw, Math.max(160, r.left - 24));
    bubble.classList.remove("tip--below", "tip--above");
    bubble.classList.add("tip--side");
    bubble.style.width = `${sideW}px`;
    bubble.style.left = `${Math.max(12, r.left - 12 - sideW)}px`;
    bubble.style.bottom = "";
    bubble.style.removeProperty("--arrow");
    const mid = r.top + r.height / 2;
    bubble.style.top = `${Math.max(8, mid - bubble.getBoundingClientRect().height / 2)}px`;
  }
  if (!reducedMotion()) requestAnimationFrame(() => bubble.classList.add("is-open"));
  else bubble.classList.add("is-open", "is-still");
  let gone = false;
  const timers: Array<ReturnType<typeof setTimeout>> = [];
  const finish = (): void => {
    gone = true;
    window.removeEventListener("pointerdown", done, true);
    for (const t of timers) clearTimeout(t);
    ring.remove();
    if (closeNow === cut) closeNow = null;
  };
  // A new screen: remove at once, and don't let this tip's timers run later.
  const cut = (): void => {
    if (gone) return;
    finish();
    bubble.remove();
  };
  function done(ev?: Event): void {
    if (gone) return;
    // The ring and bubble have pointer-events: none, so a tap meant to close
    // the tip would also press the highlighted control — for the menu's 🎵
    // that turned the music off the first time everyone saw the new tip.
    // Do not stop pointerdown: the document still needs that gesture to
    // unlock audio. Only the following click is swallowed, so the button
    // is not pressed.
    if (ev && ev.target instanceof Node && target.contains(ev.target)) {
      const blockClick = (e: Event): void => {
        if (target.contains(e.target as Node)) {
          e.stopPropagation();
          e.preventDefault();
        }
      };
      window.addEventListener("click", blockClick, true);
      setTimeout(() => window.removeEventListener("click", blockClick, true), 0);
    }
    finish();
    bubble.classList.remove("is-open");
    setTimeout(() => {
      bubble.remove();
      if (gen !== generation) return;
      showing = false;
      setTimeout(next, 400);
    }, 200);
  }
  const gen = generation;
  closeNow = cut;
  timers.push(setTimeout(() => window.addEventListener("pointerdown", done, true), 300));
  timers.push(setTimeout(() => done(), tip.ms));
}

/** Drop tips that wait (the screen changed). */
export function clearTips(): void {
  queue.length = 0;
  generation++;
  closeNow?.();
  document.querySelectorAll(".tip, .tip-ring").forEach((n) => n.remove());
  showing = false;
}
