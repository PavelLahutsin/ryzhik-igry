import { audio } from "../../shared/audio";
import { character, CHARACTER_NAMES } from "../../shared/assets";
import { el, replayClass } from "../../shared/dom";
import { centre, showTap } from "../../shared/guide";
import { type PlayApi } from "../../shared/levelgame";
import { createScope } from "../../shared/lifecycle";
import { OBJECTS } from "../../shared/objects";
import { speakButton } from "../../shared/speak";
import { rateBy, STARS } from "../../shared/stars";
import { reducedMotion } from "../../shared/style";
import { hint, svgNode } from "../../shared/ui";
import type { ArrowLevel, Dir } from "./arrows-data";
import { nextArrow, walk, type XY } from "./arrows-logic";

const sayIf = (id: string): boolean => {
  if (!audio.hasVoice(id)) return false;
  audio.say(id);
  return true;
};

const ROT: Record<Dir, number> = { U: 0, R: 90, D: 180, L: 270 };
const NAMES: Record<Dir, string> = { U: "вверх", R: "вправо", D: "вниз", L: "влево" };
const ARROW = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 12 84 50H62v38H38V50H16Z" fill="#3a8fd4" stroke="#3b2e25" stroke-width="5" stroke-linejoin="round"/></svg>`;
const PLAY = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M30 18 82 50 30 82Z" fill="#7cc46a" stroke="#3b2e25" stroke-width="5" stroke-linejoin="round"/></svg>`;
const BACK = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M40 22H84V78H40L14 50Z" fill="#ffe3b8" stroke="#3b2e25" stroke-width="5" stroke-linejoin="round"/><path d="M50 38 70 62M70 38 50 62" stroke="#3b2e25" stroke-width="6" stroke-linecap="round"/></svg>`;
const BUSH = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round"><path d="M14 80c-8-14 2-30 16-28 0-16 18-24 30-14 12-8 30 2 26 18 12 4 12 20 4 24Z" fill="#5fae4a"/><path d="M30 60c4-4 10-4 14 0M56 52c4-4 10-4 14 0" fill="none" stroke="#3f8a35"/></g></svg>`;

function arrowSvg(d: Dir): string {
  return ARROW.replace("<path", `<path transform="rotate(${ROT[d]} 50 50)"`);
}

/** «Дорожка стрелками»: arrows on the tape, ▶, and Ryzhik walks one cell per arrow. */
export function playArrows(stage: HTMLElement, level: ArrowLevel, _index: number, api: PlayApi): () => void {
  const scope = createScope();
  const tape: Dir[] = [];
  let misses = 0;
  let hints = 0;
  let running = false;
  let won = false;
  let toldPlay = false;
  const timers: number[] = [];
  scope.add(() => timers.forEach((t) => clearTimeout(t)));
  const later = (fn: () => void, ms: number): void => {
    timers.push(window.setTimeout(fn, ms));
  };
  const STEP = reducedMotion() ? 160 : 420;

  // Board
  const board = el("div", { class: "ar-board", style: { "--cols": String(level.cols), "--rows": String(level.rows) } });
  const cells: HTMLElement[] = [];
  for (let y = 0; y < level.rows; y++)
    for (let x = 0; x < level.cols; x++) {
      const cell = el("span", { class: "ar-cell" });
      cells.push(cell);
      board.append(cell);
    }
  const cellAt = ([x, y]: XY): HTMLElement => cells[y * level.cols + x]!;
  for (const r of level.rocks) cellAt(r).append(svgNode(BUSH, "ar-bush"));
  const apples = level.apples.map((a) => {
    const n = svgNode(OBJECTS.apple.svg, "ar-apple");
    cellAt(a).append(n);
    return { at: a, node: n };
  });
  const place = (node: HTMLElement, [x, y]: XY): void => {
    node.style.left = `${(x / level.cols) * 100}%`;
    node.style.top = `${(y / level.rows) * 100}%`;
  };
  const friend = el("span", { class: "ar-who ar-who--goal" }, [el("img", { attrs: { src: character(level.goalWho), alt: CHARACTER_NAMES[level.goalWho] ?? "", draggable: "false" } })]);
  const fox = el("span", { class: "ar-who ar-who--fox" }, [el("img", { attrs: { src: character("ryzhik"), alt: "Рыжик", draggable: "false" } })]);
  place(friend, level.goal);
  place(fox, level.start);
  board.append(friend, fox);
  const wrap = el("div", { class: "ar-wrap" }, [board]);

  // Tape
  const slots = Array.from({ length: level.maxArrows }, () => el("button", { class: "ar-slot", attrs: { type: "button", "aria-label": "Пустая клетка ленты" } }) as HTMLButtonElement);
  const tapeRow = el("div", { class: "ar-tape" }, slots);
  slots.forEach((s, i) =>
    s.addEventListener("click", () => {
      if (running || won || i >= tape.length) return;
      // Tap an arrow on the tape: it and the ones after it go away.
      tape.splice(i);
      audio.play("pop");
      drawTape();
    }),
  );
  function drawTape(): void {
    slots.forEach((s, i) => {
      const d = tape[i];
      s.replaceChildren(...(d ? [svgNode(arrowSvg(d), "ar-slot__arrow")] : []));
      s.classList.toggle("is-full", !!d);
      s.setAttribute("aria-label", d ? `Стрелка ${NAMES[d]}` : "Пустая клетка ленты");
    });
    go.disabled = !tape.length;
    back.disabled = !tape.length;
    go.classList.toggle("is-ready", walk(level, tape).stop === "goal");
  }

  // Pad
  const pad = el("div", { class: "ar-pad" });
  const dirButtons = new Map<Dir, HTMLButtonElement>();
  for (const d of ["L", "U", "D", "R"] as Dir[]) {
    const b = el("button", { class: "ar-key", attrs: { type: "button", "aria-label": `Стрелка ${NAMES[d]}` } }) as HTMLButtonElement;
    b.append(svgNode(arrowSvg(d)));
    b.addEventListener("click", () => add(d));
    dirButtons.set(d, b);
    pad.append(b);
  }
  const back = el("button", { class: "ar-key ar-key--back", attrs: { type: "button", "aria-label": "Убрать стрелку" } }) as HTMLButtonElement;
  back.append(svgNode(BACK));
  back.addEventListener("click", () => {
    if (running || won || !tape.length) return;
    tape.pop();
    audio.play("pop");
    drawTape();
  });
  const go = el("button", { class: "ar-key ar-key--go", attrs: { type: "button", "aria-label": "Идти!" } }) as HTMLButtonElement;
  go.append(svgNode(PLAY));
  go.addEventListener("click", run);
  pad.append(back, go);

  function add(d: Dir): void {
    audio.unlock();
    if (running || won) return;
    if (tape.length >= level.maxArrows) {
      replayClass(tapeRow, "is-full");
      audio.play("miss");
      return;
    }
    tape.push(d);
    audio.play("tap");
    drawTape();
    replayClass(slots[tape.length - 1]!, "is-new");
    if (!toldPlay && walk(level, tape).stop === "goal") {
      toldPlay = true;
      sayIf("v148");
    }
  }

  function reset(): void {
    place(fox, level.start);
    fox.classList.remove("is-bump");
    for (const a of apples) a.node.classList.remove("is-got");
    for (const s of slots) s.classList.remove("is-now", "is-bad");
    running = false;
  }

  function run(): void {
    audio.unlock();
    if (running || won || !tape.length) return;
    running = true;
    const w = walk(level, tape);
    w.cells.slice(1).forEach((c, i) => {
      later(() => {
        slots.forEach((s, j) => s.classList.toggle("is-now", j === i));
        place(fox, c);
        audio.play("boing");
        for (const a of apples) if (a.at[0] === c[0] && a.at[1] === c[1] && !a.node.classList.contains("is-got")) {
          a.node.classList.add("is-got");
          audio.play("pop");
        }
      }, STEP * (i + 1));
    });
    later(finish, STEP * w.cells.length + 120);

    function finish(): void {
      if (w.stop === "goal") {
        won = true;
        audio.play("win");
        friend.classList.add("is-happy");
        fox.classList.add("is-happy");
        sayIf("v150");
        api.win(rateBy(STARS.labirint, 0, hints), level.done);
        return;
      }
      misses++;
      const bad = slots[w.at];
      if (w.stop === "rock" || w.stop === "out") {
        fox.classList.add("is-bump");
        audio.play("miss");
        bad?.classList.add("is-bad");
        if (w.stop === "rock" && !sayIf("v149")) hint(stage, "Ой, тут кустик! Поверни стрелку.", 2200);
        if (w.stop === "out") hint(stage, "Туда дорожки нет.", 2000);
      } else if (!sayIf("v151")) hint(stage, "Давай ещё раз!", 1800);
      later(reset, 1400);
    }
  }

  const speak = speakButton("v146");
  stage.append(el("div", { class: "ar-ask" }, [el("p", { class: "ar-ask__text", text: `Проведи Рыжика к ${CHARACTER_NAMES[level.goalWho] ? dative(level.goalWho) : "другу"} стрелками!` }), speak.node]), wrap, tapeRow, pad);
  drawTape();
  sayIf("v146");

  /** Where to point: the arrow to add, ▶ when the tape reaches the goal, or the arrow to take away. */
  function nextTarget(): HTMLElement | null {
    if (running || won) return null;
    if (walk(level, tape).stop === "goal") return go;
    const d = nextArrow(level, tape);
    if (d) return dirButtons.get(d)!;
    return tape.length ? slots[tape.length - 1]! : null;
  }
  api.setDemo(() => {
    const t = nextTarget();
    if (t) showTap(centre(t));
  });
  api.setHint(() => {
    const t = nextTarget();
    if (!t) return;
    hints++;
    replayClass(t, "is-hinted");
  });
  return scope.dispose;
}

function dative(who: string): string {
  return ({ mama: "маме", papa: "папе", belka: "белочке", ezhik: "ёжику", mishka: "мишке" } as Record<string, string>)[who] ?? "другу";
}

export function arrowsThumb(level: ArrowLevel): HTMLElement {
  return el("span", { class: "ar-thumb" }, [svgNode(arrowSvg(level.solution[0]!), "ar-thumb__arrow"), el("img", { attrs: { src: character(level.goalWho), alt: "", draggable: "false" } })]);
}
