import { audio } from "../../shared/audio";
import { el, replayClass } from "../../shared/dom";
import { centre, showTap } from "../../shared/guide";
import { type PlayApi } from "../../shared/levelgame";
import { createScope } from "../../shared/lifecycle";
import { shuffle } from "../../shared/rng";
import { speakButton } from "../../shared/speak";
import { rateBy, STARS } from "../../shared/stars";
import { reducedMotion } from "../../shared/style";
import { hint, svgNode } from "../../shared/ui";
import { animalArt } from "./animals";
import type { NewLevel } from "./guests-data";

const sayIf = (id: string): void => {
  if (audio.hasVoice(id)) audio.say(id);
};

/** The animals in the order they come: the first `start` are there from the beginning. */
export function arrivals(level: NewLevel, rand: () => number = Math.random): string[] {
  return shuffle([...level.pool], rand).slice(0, level.start + level.steps);
}

/**
 * «Кто новенький?»: look at who is on the meadow; the curtain closes, one more
 * animal comes; tap the newcomer. On hard levels everyone changes places.
 */
export function playGuests(stage: HTMLElement, level: NewLevel, _index: number, api: PlayApi): () => void {
  const scope = createScope();
  const order = arrivals(level);
  const here: string[] = order.slice(0, level.start);
  let step = 0;
  let misses = 0;
  let hints = 0;
  let missesNow = 0;
  let newcomer: string | null = null;
  let busy = true;
  const nodes = new Map<string, HTMLButtonElement>();
  const timers: number[] = [];
  const later = (fn: () => void, ms: number): void => {
    timers.push(window.setTimeout(fn, reducedMotion() ? Math.min(ms, 300) : ms));
  };
  scope.add(() => timers.forEach((t) => clearTimeout(t)));

  const text = el("p", {
    class: "zv-ask__text",
    attrs: { "aria-live": "polite" },
    text: "Посмотри, кто здесь. Запомни!",
  });
  const speak = speakButton("v143");
  const steps = el("div", {
    class: "zv-steps",
    attrs: { "aria-hidden": "true" },
  });
  const guests = el("div", { class: "zv-guests" });
  const curtain = el("div", {
    class: "zv-curtain",
    attrs: { "aria-hidden": "true" },
  });
  const meadow = el("div", { class: "zv-meadow" }, [guests, curtain]);
  stage.append(el("div", { class: "zv-ask" }, [text, speak.node]), steps, meadow);

  const drawSteps = (): void => steps.replaceChildren(...Array.from({ length: level.steps }, (_, i) => el("i", { class: i < step ? "is-on" : "" })));

  function guestNode(id: string, quiet: boolean): HTMLButtonElement {
    const a = animalArt(id);
    const b = el("button", {
      class: "zv-guest",
      attrs: { type: "button", "aria-label": a.name, "data-id": id },
    }) as HTMLButtonElement;
    if (quiet) b.style.animation = "none";
    b.append(svgNode(a.svg));
    b.addEventListener("click", () => tap(id));
    nodes.set(id, b);
    return b;
  }

  function layout(): void {
    guests.replaceChildren(...here.map((id) => nodes.get(id)!));
  }

  function tap(id: string): void {
    audio.unlock();
    if (busy || !newcomer) return;
    const node = nodes.get(id)!;
    if (id !== newcomer) {
      misses++;
      missesNow++;
      audio.play("miss");
      replayClass(node, "is-wrong");
      if (audio.hasVoice("v145") && !audio.saidRecently("v145", 6000)) audio.say("v145");
      else hint(stage, "Этот уже был. Кого раньше не было?", 2000);
      if (missesNow >= 2) replayClass(nodes.get(newcomer)!, "is-hinted");
      return;
    }
    busy = true;
    audio.play("ding");
    replayClass(node, "is-right");
    step++;
    drawSteps();
    if (step === level.steps) {
      api.win(rateBy(STARS["najdi-paru"], misses, hints, level.steps), level.done);
      return;
    }
    if (step === 1 || step === level.steps - 1) sayIf("v144");
    later(next, 1300);
  }

  /** Curtain closes, one more animal comes (everyone moves on hard levels), curtain opens. */
  function next(): void {
    newcomer = null;
    curtain.classList.add("is-closed");
    audio.play("whoosh");
    later(() => {
      const id = order[level.start + step]!;
      guestNode(id, true);
      here.push(id);
      if (level.shuffle) {
        const mixed = shuffle([...here]);
        here.splice(0, here.length, ...mixed);
      } else {
        // Newcomers join anywhere, not always at the end.
        here.pop();
        here.splice(Math.floor(Math.random() * (here.length + 1)), 0, id);
      }
      for (const n of nodes.values()) n.classList.remove("is-right", "is-wrong", "is-hinted");
      layout();
      later(() => {
        curtain.classList.remove("is-closed");
        newcomer = id;
        missesNow = 0;
        busy = false;
        text.textContent = "Кто здесь новенький? Нажми!";
        speak.set("v133");
        if (!audio.saidRecently("v133", 15000)) sayIf("v133");
      }, 500);
    }, 700);
  }

  for (const id of here) guestNode(id, false);
  layout();
  drawSteps();
  sayIf("v143");
  later(next, 2600 + 700 * level.start);

  api.setDemo(() => {
    if (newcomer) showTap(centre(nodes.get(newcomer)!));
  });
  api.setHint(() => {
    if (!newcomer) return;
    hints++;
    replayClass(nodes.get(newcomer)!, "is-hinted");
  });
  return scope.dispose;
}

export function guestsThumb(level: NewLevel): HTMLElement {
  const box = el("span", { class: "zv-thumb" });
  for (const id of level.pool.slice(0, 4)) box.append(svgNode(animalArt(id).svg, "zv-thumb__art"));
  return box;
}
