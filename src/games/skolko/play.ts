import { audio } from "../../shared/audio";
import { el, replayClass } from "../../shared/dom";
import { centre, showTap } from "../../shared/guide";
import { growth } from "../../shared/growth";
import type { PlayApi } from "../../shared/levelgame";
import { createScope } from "../../shared/lifecycle";
import { speakButton } from "../../shared/speak";
import { rate } from "../../shared/stars";
import { createAutoHint } from "../../shared/autoHint";
import { svgNode } from "../../shared/ui";
import type { CountLevel, MoreLevel, SkolkoLevel } from "./levels";
import { countRounds, countVoice, moreRounds, pileScale, spotsFor } from "./logic";
import { countArt } from "./things";

const INK = "#3b2e25";
const sayIf = (id: string | undefined): void => {
  if (id && audio.hasVoice(id)) audio.say(id);
};

/** An answer: the number and as many dots (two rows of five at most). */
export function numberButtonSvg(n: number): string {
  let dots = "";
  for (let i = 0; i < n; i++) {
    const row = n > 5 ? Math.floor(i / 5) : 0;
    const inRow = n > 5 ? (row === 0 ? 5 : n - 5) : n;
    const k = n > 5 ? i % 5 : i;
    dots += `<circle cx="${50 + (k - (inRow - 1) / 2) * 15}" cy="${n > 5 ? 76 + row * 14 : 82}" r="5" fill="${INK}"/>`;
  }
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><text x="50" y="${n > 5 ? 58 : 62}" font-family="Nunito,Arial,sans-serif" font-weight="900" font-size="${n > 5 ? 50 : 56}" fill="${INK}" text-anchor="middle">${n}</text>${dots}</svg>`;
}

/** The card thumb: three things in a row, or two piles. */
export function skolkoThumb(level: SkolkoLevel): HTMLElement {
  const box = el("span", { class: "sk-thumb" });
  if (level.mode === "count") for (const id of [0, 1, 2].map((i) => level.things[i % level.things.length]!)) box.append(svgNode(countArt(id).svg, "sk-thumb__i"));
  else {
    box.append(svgNode(countArt(level.things[0]!).svg, "sk-thumb__i"), el("b", { class: "sk-thumb__vs", text: level.want === "more" ? ">" : "<" }), svgNode(countArt(level.things[level.things.length - 1]!).svg, "sk-thumb__i"));
  }
  return box;
}

function topBar(text: string, voice: string): { node: HTMLElement; grow: ReturnType<typeof growth>; say: (t: string) => void } {
  const line = el("p", { class: "sk-say__text", attrs: { "aria-live": "polite" }, text });
  const speak = speakButton(voice);
  const grow = growth("flower");
  return {
    node: el("div", { class: "sk-say" }, [el("div", { class: "sk-say__bubble" }, [line, speak.node]), grow.node]),
    grow,
    say: (t) => {
      line.textContent = t;
      replayClass(line, "is-new");
    },
  };
}

/** Put the things on a field; returns the nodes (a tap counts them aloud). */
function fieldOf(host: HTMLElement, things: string[], spots: [number, number][], scale = 1): HTMLElement[] {
  const n = things.length;
  const size = (n <= 3 ? 26 : n <= 5 ? 22 : n <= 8 ? 18 : 16) * scale;
  return things.map((id, i) => {
    const [x, y] = spots[i]!;
    const node = el("div", { class: "sk-thing", style: { left: `${x}%`, top: `${y}%`, "--s": `${size}` } as Record<string, string> }, [svgNode(countArt(id).svg, "sk-thing__art")]);
    host.append(node);
    return node;
  });
}

/** Number badges on the things, one by one (the child taps, or the game counts). */
function counter(nodes: HTMLElement[]): { tap: (node: HTMLElement) => void; all: (later: (fn: () => void, ms: number) => void, step?: number) => void; reset: () => void } {
  let n = 0;
  const mark = (node: HTMLElement): void => {
    if (node.querySelector(".sk-badge")) return;
    n++;
    node.append(el("b", { class: "sk-badge", text: String(n) }));
    replayClass(node, "is-counted");
    audio.tone(392 + n * 30, 0.12);
    sayIf(countVoice(n));
  };
  return {
    tap: mark,
    all: (later, step = 750) => {
      nodes.forEach((node, i) => later(() => mark(node), 300 + i * step));
    },
    reset: () => {
      n = 0;
      for (const node of nodes) node.querySelector(".sk-badge")?.remove();
    },
  };
}

export function playSkolko(stage: HTMLElement, level: SkolkoLevel, api: PlayApi): () => void {
  return level.mode === "count" ? playCount(stage, level, api) : playMore(stage, level, api);
}

function playCount(stage: HTMLElement, level: CountLevel, api: PlayApi): () => void {
  const scope = createScope();
  const { later } = scope;
  const rounds = countRounds(level, Math.random);
  const autoHint = createAutoHint();
  let at = 0;
  let misses = 0;
  let hints = 0;
  let busy = false;
  const bar = topBar("Сколько? Считай со мной!", "v134");
  const field = el("div", { class: "sk-field", attrs: { role: "group", "aria-label": "Посчитай" } });
  const opts = el("div", { class: "sk-opts", attrs: { role: "group" } });
  stage.append(el("div", { class: "sk-layout" }, [bar.node, field, opts]));
  audio.say("v134", { after: true });
  let buttons: HTMLButtonElement[] = [];
  let count: ReturnType<typeof counter>;

  function show(): void {
    const round = rounds[at]!;
    busy = false;
    bar.say(level.ask);
    field.replaceChildren();
    const nodes = fieldOf(field, round.things, round.spots);
    count = counter(nodes);
    for (const node of nodes)
      node.addEventListener("pointerdown", () => {
        audio.unlock();
        count.tap(node);
      });
    buttons = round.options.map((v, i) => {
      const b = el("button", { class: "sk-opt", attrs: { type: "button", "aria-label": String(v) }, on: { click: () => choose(i) } }, [svgNode(numberButtonSvg(v), "sk-opt__art")]);
      if (i === round.answer) b.dataset.ok = "";
      return b;
    });
    opts.replaceChildren(...buttons);
    replayClass(field, "is-new");
  }

  function choose(i: number): void {
    const round = rounds[at]!;
    const b = buttons[i]!;
    if (busy || b.disabled) return;
    audio.unlock();
    if (i !== round.answer) {
      misses++;
      audio.play("boing");
      replayClass(b, "is-wrong");
      b.disabled = true;
      b.classList.add("is-off");
      bar.say("Давай посчитаем ещё раз!");
      sayIf("v137");
      busy = true;
      count.reset();
      count.all(later);
      later(() => (busy = false), 300 + round.n * 750);
      if (autoHint.recordMiss()) showHint();
      return;
    }
    busy = true;
    autoHint.reset();
    b.classList.add("is-right");
    audio.play("pop");
    bar.say(`${round.n}! Получилось!`);
    sayIf(countVoice(round.n));
    at++;
    bar.grow.set(at, rounds.length);
    if (at < rounds.length) return void later(show, 1300);
    api.setHint(null);
    later(() => audio.play("magic"), 500);
    later(() => api.win(rate(misses, hints), level.done), 1500);
  }
  function showHint(): void {
    const b = buttons[rounds[at]?.answer ?? -1];
    if (!b || busy) return;
    if (autoHint.recordShown(b)) hints++;
    replayClass(b, "is-hint");
  }
  api.setHint(showHint);
  api.setDemo(() => {
    const b = buttons[rounds[at]?.answer ?? -1];
    if (b) showTap(centre(b));
  });
  show();
  return scope.dispose;
}

function playMore(stage: HTMLElement, level: MoreLevel, api: PlayApi): () => void {
  const scope = createScope();
  const { later } = scope;
  const rounds = moreRounds(level);
  const autoHint = createAutoHint();
  const voice = level.want === "more" ? "v131" : "v132";
  let at = 0;
  let misses = 0;
  let hints = 0;
  let busy = false;
  const bar = topBar(level.ask, voice);
  const piles = el("div", { class: "sk-piles" });
  stage.append(el("div", { class: "sk-layout sk-layout--more" }, [bar.node, piles]));
  audio.say(voice, { after: true });
  let sides: { node: HTMLButtonElement; count: ReturnType<typeof counter> }[] = [];

  function show(): void {
    const round = rounds[at]!;
    busy = false;
    bar.say(level.ask);
    sides = (["left", "right"] as const).map((side, k) => {
      const n = side === "left" ? round.left : round.right;
      const thing = level.same ? level.things[0]! : level.things[k % level.things.length]!;
      const node = el("button", { class: `sk-pile sk-pile--${side}`, attrs: { type: "button", "aria-label": side === "left" ? "Слева" : "Справа" }, on: { click: () => choose(side) } });
      if (side === round.answer) node.dataset.ok = "";
      const nodes = fieldOf(node, Array.from({ length: n }, () => thing), spotsFor("scatter", n, Math.random), pileScale(level, round, side) * 1.25);
      return { node, count: counter(nodes) };
    });
    piles.replaceChildren(...sides.map((s) => s.node));
    replayClass(piles, "is-new");
  }

  function choose(side: "left" | "right"): void {
    const round = rounds[at]!;
    const s = sides[side === "left" ? 0 : 1]!;
    if (busy) return;
    audio.unlock();
    if (side !== round.answer) {
      misses++;
      busy = true;
      audio.play("boing");
      replayClass(s.node, "is-wrong");
      bar.say("Давай посчитаем ещё раз!");
      sayIf("v137");
      // Count both piles aloud, one after the other, then try again.
      const [a, b] = sides;
      a!.count.all(later, 450);
      later(() => b!.count.all(later, 450), 300 + round.left * 450);
      later(() => {
        a!.count.reset();
        b!.count.reset();
        busy = false;
        bar.say(level.ask);
      }, 900 + (round.left + round.right) * 450 + 900);
      if (autoHint.recordMiss()) showHint();
      return;
    }
    busy = true;
    autoHint.reset();
    s.node.classList.add("is-right");
    audio.play("pop");
    bar.say(level.want === "more" ? "Да, тут больше!" : "Да, тут меньше!");
    at++;
    bar.grow.set(at, rounds.length);
    if (at < rounds.length) return void later(show, 1300);
    api.setHint(null);
    later(() => audio.play("magic"), 500);
    later(() => api.win(rate(misses, hints), level.done), 1500);
  }
  function showHint(): void {
    const round = rounds[at];
    if (!round || busy) return;
    const s = sides[round.answer === "left" ? 0 : 1]!;
    if (autoHint.recordShown(s.node)) hints++;
    replayClass(s.node, "is-hint");
  }
  api.setHint(showHint);
  api.setDemo(() => {
    const round = rounds[at];
    if (round) showTap(centre(sides[round.answer === "left" ? 0 : 1]!.node));
  });
  show();
  return scope.dispose;
}
