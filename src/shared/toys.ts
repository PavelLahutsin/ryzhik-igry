import { audio } from "./audio";
import { el, replayClass } from "./dom";
import type { SoundKind } from "./sounds";
import { svgNode } from "./ui";

/**
 * v13 «Потрогай»: a toy you touch — it wobbles, bounces or spins, makes its
 * sound and says a short word. Nothing to win or lose. Used by «Тапни и
 * послушай» and by the short break between levels.
 */
export type Motion = "bounce" | "wobble" | "spin" | "hop" | "squash" | "float" | "swing" | "shake";
export type Touchable = { id: string; name: string; svg: string; sound: SoundKind; motion: Motion; word: string };

export function touchable(t: Touchable, onTouch?: (id: string) => void, cls = "toy"): HTMLElement {
  const word = el("span", { class: "toy__word", attrs: { "aria-hidden": "true" }, text: t.word });
  const node = el(
    "button",
    {
      class: `${cls} toy--${t.motion}`,
      attrs: { type: "button", "aria-label": t.name, "data-id": t.id },
      on: {
        click: () => {
          audio.unlock();
          audio.play(t.sound);
          replayClass(node, "is-on");
          replayClass(word, "is-on");
          onTouch?.(t.id);
        },
      },
    },
    [svgNode(t.svg, "toy__art"), word],
  );
  return node;
}

/** Wins in a row (this visit) after which a level game offers «Передохнуть». */
export const BREAK_EVERY = 5;
let wins = 0;
/** Counts a won level; true when it is time to offer the break. */
export function countWin(): boolean {
  wins++;
  return wins % BREAK_EVERY === 0;
}

/**
 * The break: a few toys to touch, then «Играем дальше». Closes on the
 * button (no timer, no score). Loads the toy pictures only when opened.
 */
export function showBreak(parent: HTMLElement): void {
  if (parent.querySelector(".toy-break")) return;
  const grid = el("div", { class: "toy-break__grid" });
  const close = (): void => box.remove();
  const box = el("div", { class: "toy-break", attrs: { role: "dialog", "aria-label": "Передохнём" } }, [
    el("div", { class: "toy-break__card" }, [
      el("h2", { class: "toy-break__title", text: "Передохнём! Потрогай игрушки" }),
      grid,
      el("button", { class: "btn btn--play toy-break__go", attrs: { type: "button" }, on: { click: close } }, [el("span", { text: "Играем дальше" })]),
    ]),
  ]);
  parent.append(box);
  audio.say("v66");
  void import("../games/tapni/scenes").then(({ TOYS }) => {
    if (!box.isConnected) return;
    grid.append(...TOYS.slice(0, 6).map((t) => touchable(t)));
  });
}
