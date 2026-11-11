import { audio, NOTES } from "../../shared/audio";
import { el } from "../../shared/dom";
import { mountLevelGame, type PlayApi } from "../../shared/levelgame";
import { reducedMotion, useStyles } from "../../shared/style";
import { svgNode } from "../../shared/ui";
import { centre, showDrag, showTap } from "../../shared/guide";
import baseCss from "../../shared/base.css?inline";
import css from "./style.css?inline";
import { allJoined, centroid, labelAt, startDots, starsFor, touch, type Pt } from "./logic";
import { levels, worlds, type DotPicture } from "./levels";

const NS = "http://www.w3.org/2000/svg";

/** «По точкам»: join the numbered dots in order, and the picture appears. */
export function mount(root: HTMLElement): () => void {
  useStyles(baseCss, css);
  return mountLevelGame(
    {
      id: "tochki",
      title: "По точкам",
      subtitle: "Соедини точки по порядку — 1, 2, 3… и увидишь, что получится",
      levels,
      worlds,
      thumb: (level) => svgNode(thumbArt(level), "td-thumb"),
      caption: (level) => `${level.title} · ${level.dots.length}`,
      play,
    },
    root,
  );
}

const pts = (dots: readonly Pt[]): string => dots.map((d) => `${d.x},${d.y}`).join(" ");

function thumbArt(l: DotPicture): string {
  const m = centroid(l.dots);
  const nums = l.dots
    .map((d, i) => {
      const t = labelAt(d, m, 14);
      return `<circle cx="${d.x}" cy="${d.y}" r="6" fill="#3b2e25"/><text x="${t.x}" y="${t.y}" font-size="15" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="#8f7a63">${i + 1}</text>`;
    })
    .join("");
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><polygon points="${pts(l.dots)}" fill="${l.color}" opacity=".18"/>${nums}</svg>`;
}

function node<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>): SVGElementTagNameMap[K] {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  return n;
}

function play(stage: HTMLElement, level: DotPicture, _index: number, api: PlayApi): () => void {
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const t = window.setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
  };
  const dots = level.dots;
  const state = startDots();
  let hints = 0;
  let pressed = false;

  const svg = node("svg", { viewBox: "0 0 200 200", class: "td-svg", role: "img", "aria-label": `Соедини точки: ${level.title}` });
  const pic = node("g", { class: `td-pic td-alive--${level.alive}` });
  const shape = node("polygon", { points: pts(dots), fill: level.color, stroke: "#3b2e25", "stroke-width": 4, "stroke-linejoin": "round", class: "td-shape" });
  const details = node("g", { class: "td-details" });
  details.innerHTML = level.details;
  const lines = node("polyline", { points: "", class: "td-lines" });
  const rubber = node("line", { class: "td-rubber", x1: 0, y1: 0, x2: 0, y2: 0 });
  const dotLayer = node("g", { class: "td-dots" });
  const extras = node("g", { class: "td-extras" });
  pic.append(shape, details);
  svg.append(pic, lines, rubber, dotLayer, extras);

  const middle = centroid(dots);
  const dotNodes = dots.map((d, i) => {
    const g = node("g", { class: "td-dot", transform: `translate(${d.x} ${d.y})` });
    const t = labelAt(d, middle, 14);
    g.append(node("circle", { r: 13, class: "td-dot__halo" }), node("circle", { r: 6.5, class: "td-dot__core" }));
    const label = node("text", { x: t.x - d.x, y: t.y - d.y, class: "td-dot__num" });
    label.textContent = String(i + 1);
    g.append(label);
    dotLayer.append(g);
    return g;
  });

  const board = el("div", { class: "td-board" });
  board.append(svg);
  const say = el("p", { class: "td-say", attrs: { "aria-live": "polite" } });
  stage.append(el("div", { class: "td-wrap" }, [board, say]));

  function paint(): void {
    dotNodes.forEach((g, i) => {
      g.classList.toggle("is-done", i < state.next);
      g.classList.toggle("is-next", i === state.next);
    });
    lines.setAttribute("points", pts(dots.slice(0, state.next)));
    if (!allJoined(dots, state)) say.innerHTML = state.next === 0 ? `Начни с цифры <b>1</b>` : `Теперь <b>${state.next + 1}</b>`;
  }

  function toLocal(e: PointerEvent): Pt {
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }

  function at(p: Pt, tapped: boolean): void {
    const before = state.misses;
    const joined = touch(dots, state, p, tapped);
    if (joined !== null) {
      audio.tone(NOTES[joined % NOTES.length]! * (joined >= NOTES.length ? 2 : 1), 0.18);
      const g = dotNodes[joined]!;
      g.classList.remove("is-pop");
      void g.getBoundingClientRect();
      g.classList.add("is-pop");
      paint();
      if (allJoined(dots, state)) finish();
    } else if (state.misses > before) {
      audio.play("miss");
      const next = dotNodes[state.next]!;
      next.classList.remove("is-call");
      void next.getBoundingClientRect();
      next.classList.add("is-call");
      say.innerHTML = `Ищи цифру <b>${state.next + 1}</b>`;
    }
  }

  const down = (e: PointerEvent): void => {
    if (allJoined(dots, state)) return;
    audio.unlock();
    pressed = true;
    svg.setPointerCapture?.(e.pointerId);
    e.preventDefault();
    at(toLocal(e), true);
    stretch(toLocal(e));
  };
  const move = (e: PointerEvent): void => {
    if (!pressed) return;
    for (const ev of e.getCoalescedEvents?.() ?? [e]) at(toLocal(ev), false);
    stretch(toLocal(e));
  };
  const up = (): void => {
    pressed = false;
    rubber.style.opacity = "0";
  };

  function stretch(p: Pt): void {
    const last = dots[state.next - 1];
    if (!pressed || !last || allJoined(dots, state)) {
      rubber.style.opacity = "0";
      return;
    }
    rubber.setAttribute("x1", String(last.x));
    rubber.setAttribute("y1", String(last.y));
    rubber.setAttribute("x2", p.x.toFixed(1));
    rubber.setAttribute("y2", p.y.toFixed(1));
    rubber.style.opacity = "1";
  }

  svg.addEventListener("pointerdown", down);
  svg.addEventListener("pointermove", move);
  svg.addEventListener("pointerup", up);
  svg.addEventListener("pointercancel", up);
  svg.style.touchAction = "none";

  // When the child waits: the next dot wiggles and the hand draws the next line.
  api.setDemo(() => {
    if (allJoined(dots, state)) return;
    const next = dotNodes[state.next]!;
    restart(next, "is-call");
    const prev = dotNodes[state.next - 1];
    const core = (g: SVGGElement): Element => g.querySelector(".td-dot__core")!;
    if (prev) showDrag(centre(core(prev)), centre(core(next)));
    else showTap(centre(core(next)));
  });
  const restart = (n: Element, cls: string): void => {
    n.classList.remove(cls);
    void (n as HTMLElement).getBoundingClientRect();
    n.classList.add(cls);
  };

  api.setHint(() => {
    if (allJoined(dots, state)) return;
    hints++;
    const next = dotNodes[state.next]!;
    next.classList.add("is-hint");
    later(() => next.classList.remove("is-hint"), 2400);
  });

  function finish(): void {
    api.setHint(null);
    up();
    lines.setAttribute("points", pts([...dots, dots[0]!]));
    say.textContent = level.title + "!";
    audio.play("magic");
    later(() => {
      svg.classList.add("is-finished");
      if (!reducedMotion()) {
        svg.classList.add("is-alive");
        addExtras();
      }
    }, 350);
    later(() => api.win(starsFor(state.misses, hints), level.done), 2100);
  }

  function addExtras(): void {
    if (level.alive === "smoke")
      for (let i = 0; i < 3; i++) extras.append(node("circle", { cx: 133, cy: 36, r: 8, class: "td-smoke", style: `animation-delay:${i * 0.5}s` }));
    if (level.alive === "swim")
      for (let i = 0; i < 3; i++) extras.append(node("circle", { cx: 26, cy: 90, r: 5, class: "td-bubble", style: `animation-delay:${i * 0.4}s` }));
    if (level.alive === "spin" || level.alive === "flutter" || level.alive === "beat" || level.alive === "sway")
      for (let i = 0; i < 7; i++)
        extras.append(node("path", { d: "M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z", transform: `translate(${20 + ((i * 53) % 160)} ${20 + ((i * 89) % 160)})`, class: "td-spark", style: `animation-delay:${i * 0.18}s` }));
  }

  paint();
  return () => {
    for (const t of timers) clearTimeout(t);
    svg.removeEventListener("pointerdown", down);
    svg.removeEventListener("pointermove", move);
    svg.removeEventListener("pointerup", up);
    svg.removeEventListener("pointercancel", up);
  };
}
