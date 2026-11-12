import { audio, NOTES } from "../../shared/audio";
import { el, svgEl, svgLocal, replayClass } from "../../shared/dom";
import { coalesced, pointerTrack } from "../../shared/drag";
import { createScope } from "../../shared/lifecycle";
import { mountLevelGame, type PlayApi } from "../../shared/levelgame";
import { reducedMotion, useStyles } from "../../shared/style";
import { svgNode } from "../../shared/ui";
import { centre, showDrag, showTap } from "../../shared/guide";
import baseCss from "../../shared/base.css?inline";
import css from "./style.css?inline";
import { allJoined, labelOf, labelSpots, startDots, starsFor, touch, type Pt } from "./logic";
import { levels, worlds, type DotPicture } from "./levels";
import { introSeen, modeOf, NEEDS_INTRO, showIntro } from "./intro";

/** «По точкам»: join the numbered dots in order, and the picture appears. */
export function mount(root: HTMLElement): () => void {
  useStyles(baseCss, css);
  return mountLevelGame(
    {
      id: "tochki",
      title: "По точкам",
      subtitle: "Соедини точки по порядку — и увидишь, что получится",
      levels,
      worlds,
      thumb: (level) => svgNode(thumbArt(level), "td-thumb"),
      caption: (level) => `${level.title} · ${range(level)}`,
      play,
    },
    root,
  );
}

/** «1–10», «10→1», «2, 4…20», «А–К». */
function range(l: DotPicture): string {
  const n = l.dots.length;
  const first = labelOf(l.count, 0, n);
  const last = labelOf(l.count, n - 1, n);
  if (l.count === "down") return `${first}→${last}`;
  if (typeof l.count === "number") return `${first}, ${labelOf(l.count, 1, n)}…${last}`;
  return `${first}–${last}`;
}

/** What the child hears/reads before the first dot. */
function startLine(l: DotPicture): string {
  const first = `<b>${labelOf(l.count, 0, l.dots.length)}</b>`;
  if (l.count === "down") return `Считаем назад: начни с ${first}`;
  if (l.count === "abc") return `По алфавиту: начни с буквы ${first}`;
  if (l.count === 2) return `Через одну: начни с ${first}`;
  if (l.count === 5) return `Пятёрками: начни с ${first}`;
  if (l.count === 10) return `Десятками: начни с ${first}`;
  return `Начни с цифры ${first}`;
}

const pts = (dots: readonly Pt[]): string => dots.map((d) => `${d.x},${d.y}`).join(" ");

function thumbArt(l: DotPicture): string {
  const spots = labelSpots(l.dots);
  const nums = l.dots
    .map((d, i) => {
      const t = spots[i]!;
      return `<circle cx="${d.x}" cy="${d.y}" r="6" fill="#3b2e25"/><text x="${t.x}" y="${t.y}" font-size="15" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="#8f7a63">${labelOf(l.count, i, l.dots.length)}</text>`;
    })
    .join("");
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><polygon points="${pts(l.dots)}" fill="${l.color}" opacity=".18"/>${nums}</svg>`;
}

function play(stage: HTMLElement, level: DotPicture, _index: number, api: PlayApi): () => void {
  const scope = createScope();
  const { later } = scope;
  const dots = level.dots;
  const state = startDots();
  let hints = 0;
  let pressed = false;

  const svg = svgEl("svg", { viewBox: "0 0 200 200", class: "td-svg", role: "img", "aria-label": `Соедини точки: ${level.title}` });
  const pic = svgEl("g", { class: `td-pic td-alive--${level.alive}` });
  const shape = svgEl("polygon", { points: pts(dots), fill: level.color, stroke: "#3b2e25", "stroke-width": 4, "stroke-linejoin": "round", class: "td-shape" });
  const details = svgEl("g", { class: "td-details" });
  details.innerHTML = level.details;
  const lines = svgEl("polyline", { points: "", class: "td-lines" });
  const rubber = svgEl("line", { class: "td-rubber", x1: 0, y1: 0, x2: 0, y2: 0 });
  const dotLayer = svgEl("g", { class: "td-dots" });
  const extras = svgEl("g", { class: "td-extras" });
  pic.append(shape, details);
  svg.append(pic, lines, rubber, dotLayer, extras);

  const spots = labelSpots(dots);
  const dotNodes = dots.map((d, i) => {
    const g = svgEl("g", { class: "td-dot", transform: `translate(${d.x} ${d.y})` });
    const t = spots[i]!;
    g.append(svgEl("circle", { r: 13, class: "td-dot__halo" }), svgEl("circle", { r: 6.5, class: "td-dot__core" }));
    const label = svgEl("text", { x: t.x - d.x, y: t.y - d.y, class: "td-dot__num" });
    label.textContent = labelOf(level.count, i, dots.length);
    g.append(label);
    dotLayer.append(g);
    return g;
  });

  const board = el("div", { class: "td-board" });
  board.append(svg);
  const say = el("p", { class: "td-say", attrs: { "aria-live": "polite" } });
  const sayRow = el("div", { class: "td-sayrow" }, [say]);
  const wrap = el("div", { class: "td-wrap" }, [board, sayRow]);
  stage.append(wrap);

  // A new way of counting: a short demo (10 → 9 → 8, А → Б → В) the first
  // time, and «Как считать?» to see it again. Watching it costs nothing.
  const mode = modeOf(level.count);
  if (NEEDS_INTRO.includes(mode)) {
    const how = el("button", {
      class: "td-how",
      attrs: { type: "button" },
      text: "Как считать?",
      on: {
        click: () => {
          audio.unlock();
          showIntro(wrap, mode, scope);
        },
      },
    });
    sayRow.append(how);
    void introSeen(mode).then((seen) => {
      if (!seen && !scope.disposed && state.next === 0) showIntro(wrap, mode, scope);
    });
  }

  function paint(): void {
    dotNodes.forEach((g, i) => {
      g.classList.toggle("is-done", i < state.next);
      g.classList.toggle("is-next", i === state.next);
    });
    lines.setAttribute("points", pts(dots.slice(0, state.next)));
    if (!allJoined(dots, state)) say.innerHTML = state.next === 0 ? startLine(level) : `Теперь <b>${labelOf(level.count, state.next, dots.length)}</b>`;
  }

  const toLocal = (e: PointerEvent): Pt => svgLocal(svg, e);

  function at(p: Pt, tapped: boolean): void {
    const before = state.misses;
    const joined = touch(dots, state, p, tapped);
    if (joined !== null) {
      // Counting down sounds like going down the scale.
      const step = level.count === "down" ? dots.length - 1 - joined : joined;
      audio.tone(NOTES[step % NOTES.length]! * (step >= NOTES.length ? 2 : 1), 0.18);
      const g = dotNodes[joined]!;
      replayClass(g, "is-pop");
      paint();
      if (allJoined(dots, state)) finish();
    } else if (state.misses > before) {
      audio.play("miss");
      const next = dotNodes[state.next]!;
      replayClass(next, "is-call");
      say.innerHTML = `Ищи ${level.count === "abc" ? "букву" : "число"} <b>${labelOf(level.count, state.next, dots.length)}</b>`;
    }
  }

  const down = (e: PointerEvent): boolean | void => {
    if (allJoined(dots, state)) return false;
    audio.unlock();
    pressed = true;
    at(toLocal(e), true);
    stretch(toLocal(e));
  };
  const move = (e: PointerEvent): void => {
    if (!pressed) return;
    for (const ev of coalesced(e)) at(toLocal(ev), false);
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

  scope.add(pointerTrack(svg, { down, move, up }));

  // When the child waits: the next dot wiggles and the hand draws the next line.
  api.setDemo(() => {
    if (allJoined(dots, state)) return;
    const next = dotNodes[state.next]!;
    replayClass(next, "is-call");
    const prev = dotNodes[state.next - 1];
    const core = (g: SVGGElement): Element => g.querySelector(".td-dot__core")!;
    if (prev) showDrag(centre(core(prev)), centre(core(next)));
    else showTap(centre(core(next)));
  });

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
      for (let i = 0; i < 3; i++) extras.append(svgEl("circle", { cx: 133, cy: 36, r: 8, class: "td-smoke", style: `animation-delay:${i * 0.5}s` }));
    if (level.alive === "swim")
      for (let i = 0; i < 3; i++) extras.append(svgEl("circle", { cx: 26, cy: 90, r: 5, class: "td-bubble", style: `animation-delay:${i * 0.4}s` }));
    if (level.alive === "spin" || level.alive === "flutter" || level.alive === "beat" || level.alive === "sway")
      for (let i = 0; i < 7; i++)
        extras.append(svgEl("path", { d: "M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z", transform: `translate(${20 + ((i * 53) % 160)} ${20 + ((i * 89) % 160)})`, class: "td-spark", style: `animation-delay:${i * 0.18}s` }));
  }

  paint();
  return scope.dispose;
}
