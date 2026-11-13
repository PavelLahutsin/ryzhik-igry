import { audio } from "../../shared/audio";
import { showDrag } from "../../shared/guide";
import { el, svgEl, svgLocal, replayClass } from "../../shared/dom";
import { coalesced, pointerTrack } from "../../shared/drag";
import { createScope } from "../../shared/lifecycle";
import type { PlayApi } from "../../shared/levelgame";
import { OBJECTS } from "../../shared/objects";
import { reducedMotion } from "../../shared/style";
import { svgNode } from "../../shared/ui";
import { advance, countedSlips, numberWord, offTrack, starsFor, strokeDone, TOLERANCE, type Pt } from "./logic";
import type { Picture } from "./pictures";

/** A letter level also shows its word (and a picture when there is one). */
type Traceable = Picture & { word?: string; art?: string; letter?: string };

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

export function play(stage: HTMLElement, level: Traceable, _index: number, api: PlayApi): () => void {
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

  const svg = svgEl("svg", { viewBox: "0 0 200 200", class: `rv-svg${level.help ? ` rv-svg--${level.help}` : ""}`, role: "img", "aria-label": `Обведи: ${level.title}` });
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
  const retry = svgEl("g", { class: "rv-retry", "aria-hidden": "true" });
  svg.append(pic, extras, retry, marker, finger);
  // v13: the youngest pictures («Первые рисунки») never lose a star for a slip.
  const gentle = level.world === "first";

  for (const s of strokes) guides.append(svgEl("path", { d: s.d, class: "rv-guide" }));
  // Digits and letters: little numbers show which line comes first.
  const order = svgEl("g", { class: "rv-order", "aria-hidden": "true" });
  if (level.order && strokes.length > 1)
    strokes.forEach((s, i) => {
      const a = s.samples[0]!;
      const b = s.samples[Math.min(s.samples.length - 1, 6)]!;
      // Put the number beside the start, away from where the line goes.
      const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const x = Math.min(188, Math.max(12, a.x - ((b.x - a.x) / len) * 18 - ((b.y - a.y) / len) * 8));
      const y = Math.min(188, Math.max(12, a.y - ((b.y - a.y) / len) * 18 + ((b.x - a.x) / len) * 8));
      const g = svgEl("g", { class: "rv-order__n", transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` });
      g.append(svgEl("circle", { r: 9 }));
      const t = svgEl("text", { y: 4.5, "text-anchor": "middle" });
      t.textContent = String(i + 1);
      g.append(t);
      order.append(g);
    });
  svg.insertBefore(order, marker);

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
    order.querySelectorAll(".rv-order__n").forEach((g, i) => {
      g.classList.toggle("is-now", !finished && i === current);
      g.classList.toggle("is-done", finished || i < current);
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
  const toScreen = (p: Pt): { x: number; y: number } => {
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const q = svg.createSVGPoint();
    q.x = p.x;
    q.y = p.y;
    const r = q.matrixTransform(m);
    return { x: r.x, y: r.y };
  };

  function step(p: Pt): void {
    const s = strokes[current]!;
    const before = index;
    index = advance(s.samples, index, p);
    if (index > before && index % 6 < (before % 6) + (index - before) && Math.random() < 0.35) audio.play("tap");
    if (!slipped && offTrack(s.samples, index, p)) {
      slipped = true;
      slips++;
      // A slip: the line stops, the green dot calls, the words say what to
      // do, and the hand goes from the finger back to the dot.
      drawing = false;
      replayClass(marker, "is-wobble");
      replayClass(marker, "is-call");
      replayClass(box, "is-slip");
      audio.play("boing");
      say.textContent = gentle ? "Попробуй ещё раз — от зелёной точки" : "Ой! Вернись к зелёной точке";
      const back = s.samples[index]!;
      // v13: the piece of line just ahead glows with «Попробуй ещё раз» on it.
      retry.replaceChildren();
      const ahead = s.samples.slice(index, Math.min(s.samples.length, index + 18));
      if (ahead.length > 1) {
        retry.append(svgEl("polyline", { class: "rv-retry__line", points: ahead.map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(" ") }));
        const tx = Math.min(150, Math.max(50, back.x));
        const ty = back.y > 40 ? back.y - 22 : back.y + 30;
        const tag = svgEl("g", { class: "rv-retry__tag", transform: `translate(${tx.toFixed(1)} ${ty.toFixed(1)})` });
        const t = svgEl("text", { "text-anchor": "middle", y: 4 });
        t.textContent = "Попробуй ещё раз";
        tag.append(svgEl("rect", { x: -50, y: -10, width: 100, height: 20, rx: 10 }), t);
        retry.append(tag);
      }
      replayClass(retry, "is-on");
      later(() => showDrag(toScreen(p), toScreen(back)), 250);
      return;
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
    retry.classList.remove("is-on");
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
    if (level.count !== undefined) {
      countUp(level.count);
      return;
    }
    if (level.word) {
      showWord();
      return;
    }
    if (!reducedMotion()) svg.classList.add("is-alive");
    addExtras();
    later(() => api.win(starsFor(countedSlips(level.world, slips), hints), level.done), 1600);
  }

  function showWord(): void {
    const card = el("div", { class: "rv-word" }, [
      level.art ? svgNode(level.art, "rv-word__pic") : null,
      el("span", { class: "rv-word__text" }, [el("b", { text: level.letter ?? "" }), ` — ${level.word ?? ""}`]),
    ]);
    later(() => {
      box.append(card);
      say.textContent = level.done;
      svg.classList.add("is-alive");
      audio.play("sparkle");
    }, 500);
    later(() => api.win(starsFor(countedSlips(level.world, slips), hints), level.done, level.art ? svgNode(level.art, "praise__word") : undefined), 1900);
  }

  function countUp(n: number): void {
    if (n === 0) {
      // Zero: an empty plate — nothing to count.
      later(() => {
        box.append(el("div", { class: "rv-count rv-count--zero" }, [el("span", { class: "rv-count__plate", text: "Пусто!" })]));
        say.textContent = "Ноль — ничего нет!";
        svg.classList.add("is-alive");
      }, 400);
      later(() => api.win(starsFor(countedSlips(level.world, slips), hints), "Ноль — ничего нет!"), 1800);
      return;
    }
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
      api.win(starsFor(countedSlips(level.world, slips), hints), `${numberWord(n)}!`);
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
