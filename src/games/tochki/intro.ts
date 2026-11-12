/**
 * Before a new way of counting (backwards, by 2s, 5s, 10s, letters) a short
 * demo shows three dots being joined: 10 → 9 → 8, А → Б → В… The hand draws
 * the lines, «Покажи ещё раз» replays it (no penalty), a tap on «Играть!» or
 * anywhere else closes it. It opens by itself once per way of counting;
 * the «Как считать?» button on the level brings it back any time.
 */
import { audio, NOTES } from "../../shared/audio";
import { el, svgEl } from "../../shared/dom";
import { centre, showDrag } from "../../shared/guide";
import type { Scope } from "../../shared/lifecycle";
import { loadSeen, markSeen } from "../../shared/seen";
import type { CountRule } from "./logic";

export type Mode = "up" | "down" | "2" | "5" | "10" | "abc";

export const modeOf = (count: CountRule | undefined): Mode => (count === undefined ? "up" : (String(count) as Mode));

export const MODES: Record<Mode, { title: string; sample: [string, string, string]; next: string }> = {
  up: { title: "По порядку", sample: ["1", "2", "3"], next: "потом 4, 5…" },
  down: { title: "Считаем назад", sample: ["10", "9", "8"], next: "потом 7, 6… до 1" },
  "2": { title: "Через одну", sample: ["2", "4", "6"], next: "потом 8, 10…" },
  "5": { title: "Пятёрками", sample: ["5", "10", "15"], next: "потом 20, 25…" },
  "10": { title: "Десятками", sample: ["10", "20", "30"], next: "потом 40, 50… до 100" },
  abc: { title: "По алфавиту", sample: ["А", "Б", "В"], next: "потом Г, Д, Е…" },
};

/** The intro opens by itself on these modes (1, 2, 3 is in «Как играть»). */
export const NEEDS_INTRO: readonly Mode[] = ["down", "2", "5", "10", "abc"];

const seenId = (m: Mode): string => `tochki:mode:${m}`;

export async function introSeen(m: Mode): Promise<boolean> {
  return (await loadSeen()).tips.includes(seenId(m));
}

/** Show the demo over `host` (the play area). Returns a close function. */
export function showIntro(host: HTMLElement, mode: Mode, scope: Scope, onClose: () => void = () => {}): () => void {
  const m = MODES[mode];
  const X = [40, 120, 200];
  const svg = svgEl("svg", { viewBox: "0 0 240 96", class: "td-intro__svg", "aria-hidden": "true" });
  const lines = [0, 1].map((i) => svgEl("line", { x1: X[i]!, y1: 60, x2: X[i + 1]!, y2: 60, class: `td-intro__line td-intro__line--${i + 1}`, pathLength: 1 }));
  const dots = X.map((x, i) => {
    const g = svgEl("g", { class: `td-intro__dot td-intro__dot--${i + 1}`, transform: `translate(${x} 60)` });
    g.append(svgEl("circle", { r: 15, class: "td-intro__halo" }), svgEl("circle", { r: 8, class: "td-intro__core" }));
    const t = svgEl("text", { y: -26, class: "td-intro__num" });
    t.textContent = m.sample[i]!;
    g.append(t);
    return g;
  });
  svg.append(...lines, ...dots);
  const again = el("button", { class: "td-intro__again", attrs: { type: "button" }, text: "↻ Покажи ещё раз" });
  const go = el("button", { class: "td-intro__go btn btn--play", attrs: { type: "button" }, text: "Играть!" });
  const card = el("div", { class: "td-intro__card", attrs: { role: "dialog", "aria-label": `${m.title}: ${m.sample.join(", ")}` } }, [
    el("p", { class: "td-intro__title", text: m.title }),
    svg,
    el("p", { class: "td-intro__line-text" }, [el("b", { text: m.sample.join(" → ") }), document.createTextNode(` — ${m.next}`)]),
    el("p", { class: "td-intro__rule", text: "Ошибка — только если нажать не ту точку. Нажать мимо — не страшно." }),
    el("div", { class: "td-intro__buttons" }, [again, go]),
  ]);
  const box = el("div", { class: "td-intro" }, [card]);
  host.append(box);

  let timers: number[] = [];
  const clear = (): void => {
    timers.forEach((t) => clearTimeout(t));
    timers = [];
  };
  const run = (): void => {
    clear();
    svg.classList.remove("is-run");
    void svg.getBoundingClientRect();
    svg.classList.add("is-run");
    const core = (i: number): Element => dots[i]!.querySelector(".td-intro__core")!;
    const at = (ms: number, f: () => void): void => {
      timers.push(window.setTimeout(f, ms));
    };
    at(150, () => audio.tone(NOTES[0]!, 0.15));
    at(200, () => showDrag(centre(core(0)), centre(core(1))));
    at(1450, () => audio.tone(NOTES[1]!, 0.15));
    at(2000, () => showDrag(centre(core(1)), centre(core(2))));
    at(3250, () => audio.tone(NOTES[2]!, 0.15));
  };
  let open = true;
  // Seen = the child closed it (not when the level was left meanwhile).
  const done = (): void => {
    void markSeen("tips", seenId(mode));
    close();
  };
  const close = (): void => {
    if (!open) return;
    open = false;
    clear();
    box.remove();
    onClose();
  };
  const shownAt = performance.now();
  again.addEventListener("click", (e) => {
    e.stopPropagation();
    audio.play("tap");
    run();
  });
  go.addEventListener("click", (e) => {
    e.stopPropagation();
    audio.play("tap");
    done();
  });
  box.addEventListener("click", () => {
    if (performance.now() - shownAt > 450) done();
  });
  box.addEventListener("pointerdown", (e) => e.stopPropagation());
  scope.add(close);
  requestAnimationFrame(run);
  return close;
}
