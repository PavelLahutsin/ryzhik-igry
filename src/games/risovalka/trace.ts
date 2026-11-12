import { audio } from "../../shared/audio";
import { showDrag } from "../../shared/guide";
import { el, svgEl, svgLocal, replayClass } from "../../shared/dom";
import { coalesced, pointerTrack } from "../../shared/drag";
import { createScope } from "../../shared/lifecycle";
import type { PlayApi } from "../../shared/levelgame";
import { OBJECTS } from "../../shared/objects";
import { reducedMotion } from "../../shared/style";
import { svgNode } from "../../shared/ui";
import { advance, numberWord, offTrack, starsFor, strokeDone, TOLERANCE, type Pt } from "./logic";
import type { Picture } from "./pictures";

/**
 * Tracing a picture, a digit or a letter: shared by «Рисовалка» and
 * «Цифры и буквы». Trace the dotted line, and the picture comes alive.
 */
export function thumbArt(p: Picture): string {
  const lines = p.strokes.map((d) => `<path d="${d}" fill="none" stroke="${p.ink}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`).join("");
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">${p.fill}${lines}</svg>`;
}

function sample(d: string, step = 3): Pt[] {
  const path = svgEl("path");
  path.setAttribute("d", d);
  const len = path.getTotalLength();
  const out: Pt[] = [];
  for (let s = 0; s <= len; s += step) {
    const p = path.getPointAtLength(s);
    out.push({ x: p.x, y: p.y });
  }
  const end = path.getPointAtLength(len);
  out.push({ x: end.x, y: end.y });
  return out;
}

export function play(stage: HTMLElement, level: Picture, _index: number, api: PlayApi): () => void {
  const scope = createScope();
  const { later } = scope;
  const strokes = level.strokes.map((d) => ({ d, samples: sample(d) }));
  let current = 0;
  let index = 0;
  let slips = 0;
  let hints = 0;
  let drawing = false;
  let slipped = false;
  let finished = false;

  const svg = svgEl("svg", { viewBox: "0 0 200 200", class: `rv-svg${level.help === "less" ? " rv-svg--less" : ""}`, role: "img", "aria-label": `Обведи: ${level.title}` });
  const pic = svgEl("g", { class: `rv-pic rv-alive--${level.alive}` });
  const fill = svgEl("g", { class: "rv-fill" });
  fill.innerHTML = level.fill;
  const guides = svgEl("g", { class: "rv-guides" });
  const ink = svgEl("g", { class: "rv-ink" });
  const live = svgEl("polyline", { class: "rv-live", fill: "none", stroke: level.ink, "stroke-width": 9, "stroke-linecap": "round", "stroke-linejoin": "round", points: "" });
  const extras = svgEl("g", { class: "rv-extras" });
  const marker = svgEl("g", { class: "rv-marker" });
  marker.append(svgEl("circle", { r: 13, class: "rv-marker__halo" }), svgEl("circle", { r: 8, class: "rv-marker__dot" }));
  const arrow = svgEl("path", { d: "M-5 -6 L 6 0 L -5 6", class: "rv-marker__arrow" });
  marker.append(arrow);
  const finger = svgEl("circle", { r: 9, class: "rv-finger" });
  pic.append(fill, guides, ink, live);
  svg.append(pic, extras, marker, finger);

  for (const s of strokes) guides.append(svgEl("path", { d: s.d, class: "rv-guide" }));

  const box = el("div", { class: "rv-board" });
  box.append(svg);
  const say = el("p", { class: "rv-say", attrs: { "aria-live": "polite" } });
  stage.append(el("div", { class: "rv-wrap" }, [box, say]));

  function paint(): void {
    guides.querySelectorAll(".rv-guide").forEach((g, i) => {
      g.classList.toggle("is-now", i === current);
      g.classList.toggle("is-done", i < current);
      g.classList.toggle("is-later", i > current);
    });
    if (finished) {
      marker.style.display = "none";
      return;
    }
    const s = strokes[current]!;
    const at = s.samples[index]!;
    const next = s.samples[Math.min(s.samples.length - 1, index + 4)]!;
    const angle = (Math.atan2(next.y - at.y, next.x - at.x) * 180) / Math.PI;
    marker.setAttribute("transform", `translate(${at.x} ${at.y})`);
    arrow.setAttribute("transform", `rotate(${angle}) translate(16 0)`);
    marker.style.display = "";
    live.setAttribute("points", s.samples.slice(0, index + 1).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "));
  }

  const toLocal = (e: PointerEvent): Pt => svgLocal(svg, e);

  function step(p: Pt): void {
    const s = strokes[current]!;
    const before = index;
    index = advance(s.samples, index, p);
    if (index > before && index % 6 < (before % 6) + (index - before) && Math.random() < 0.35) audio.play("tap");
    if (!slipped && offTrack(s.samples, index, p)) {
      slipped = true;
      slips++;
      replayClass(marker, "is-wobble");
      audio.play("miss");
    }
    if (strokeDone(s.samples, index)) {
      ink.append(svgEl("path", { d: s.d, fill: "none", stroke: level.ink, "stroke-width": 9, "stroke-linecap": "round", "stroke-linejoin": "round", class: "rv-stroke" }));
      live.setAttribute("points", "");
      audio.play("snap");
      drawing = false;
      current++;
      index = 0;
      if (current >= strokes.length) {
        finish();
        return;
      }
    }
    paint();
  }

  const down = (e: PointerEvent): boolean | void => {
    if (finished) return false;
    audio.unlock();
    const p = toLocal(e);
    const s = strokes[current]!;
    const at = s.samples[index]!;
    if (Math.hypot(at.x - p.x, at.y - p.y) > TOLERANCE * 1.8) {
      say.textContent = "Начни с зелёной точки!";
      replayClass(marker, "is-call");
      return false;
    }
    say.textContent = "";
    drawing = true;
    slipped = false;
    step(p);
  };
  const move = (e: PointerEvent): void => {
    if (!drawing) return;
    for (const ev of coalesced(e)) {
      if (!drawing) break;
      step(toLocal(ev));
    }
  };
  const up = (): void => {
    drawing = false;
  };
  scope.add(pointerTrack(svg, { down, move, up }));

  // Hint: a dot runs along the rest of the line once.
  // The hand runs a little way along the line from the marker.
  api.setDemo(() => {
    if (finished) return;
    const s = strokes[current]!.samples;
    const m = svg.getScreenCTM();
    if (!m) return;
    const pt = (p: Pt): { x: number; y: number } => {
      const q = svg.createSVGPoint();
      q.x = p.x;
      q.y = p.y;
      const r = q.matrixTransform(m);
      return { x: r.x, y: r.y };
    };
    showDrag(pt(s[index]!), pt(s[Math.min(s.length - 1, index + 24)]!));
  });
  api.setHint(() => {
    if (finished) return;
    hints++;
    const s = strokes[current]!.samples;
    let i = index;
    finger.style.display = "block";
    const tick = (): void => {
      if (finished || i >= s.length) {
        finger.style.display = "none";
        return;
      }
      finger.setAttribute("cx", String(s[i]!.x));
      finger.setAttribute("cy", String(s[i]!.y));
      i += 3;
      later(tick, 30);
    };
    tick();
  });

  function finish(): void {
    finished = true;
    paint();
    api.setHint(null);
    svg.classList.add("is-finished");
    audio.play("magic");
    if (level.count) {
      countUp(level.count);
      return;
    }
    if (!reducedMotion()) svg.classList.add("is-alive");
    addExtras();
    later(() => api.win(starsFor(slips, hints), level.done), 1600);
  }

  function countUp(n: number): void {
    // Show n apples around the digit, one by one, and say the number.
    const ids = ["apple", "star", "ball", "flower", "pear", "cherry", "sun", "fish", "car"] as const;
    const art = OBJECTS[ids[(n - 1) % ids.length]!].svg;
    const row = el("div", { class: "rv-count" });
    box.append(row);
    for (let i = 0; i < n; i++) {
      later(() => {
        const item = svgNode(art, "rv-count__item");
        item.append(el("b", { text: String(i + 1) }));
        row.append(item);
        audio.tone(523 * Math.pow(2, i / 12), 0.15);
      }, 300 + i * 320);
    }
    later(() => {
      say.textContent = `${numberWord(n)}!`;
      svg.classList.add("is-alive");
      api.win(starsFor(slips, hints), `${numberWord(n)}!`);
    }, 600 + n * 320);
  }

  function addExtras(): void {
    if (reducedMotion()) return;
    if (level.alive === "rain")
      for (let i = 0; i < 9; i++) extras.append(svgEl("path", { d: `M${60 + (i % 5) * 20} 140 l-4 12`, class: "rv-drop", style: `animation-delay:${i * 0.15}s` }));
    if (level.alive === "smoke" || level.puff) {
      const [cx, cy] = level.puff ?? [135, 46];
      for (let i = 0; i < 3; i++) extras.append(svgEl("circle", { cx, cy, r: 8, class: "rv-smoke", style: `animation-delay:${i * 0.5}s` }));
    }
    if (level.alive === "swim")
      for (let i = 0; i < 3; i++) extras.append(svgEl("circle", { cx: 40, cy: 90, r: 5, class: "rv-bubble", style: `animation-delay:${i * 0.4}s` }));
    if (level.alive === "glow" || level.alive === "flutter")
      for (let i = 0; i < 6; i++)
        extras.append(svgEl("circle", { cx: 30 + Math.random() * 140, cy: 30 + Math.random() * 140, r: 4, class: "rv-spark", style: `animation-delay:${i * 0.2}s` }));
  }

  paint();
  return scope.dispose;
}
