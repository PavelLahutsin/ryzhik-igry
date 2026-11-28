import { audio } from "./audio";
import { el } from "./dom";
import { artImg } from "./art";
import { svgNode } from "./ui";

/**
 * v23: a reward that grows inside a level instead of progress dots — a flower
 * in a pot (or a block tower) gets one stage richer with every right answer
 * (learn-digits: «каждый верный ответ растит растение»). Art (v29): soft painted pictures, src/shared/assets/art/grow-*.webp.
 */
export const GROW_FLOWER: string[] = [0, 1, 2, 3, 4, 5].map((i) => artImg(`grow-flower-${i}`));

export const GROW_TOWER: string[] = [0, 1, 2, 3, 4, 5].map((i) => artImg(`grow-tower-${i}`));

/** Ryzhik's words when the flower reaches a stage (when recorded). */
const FLOWER_VOICE: Record<number, string> = { 1: "v157", 2: "v158", 3: "v159", 5: "v160" };

export function growth(kind: "flower" | "tower" = "flower"): { node: HTMLElement; set: (done: number, total: number) => void } {
  const frames = kind === "flower" ? GROW_FLOWER : GROW_TOWER;
  const node = el("div", { class: `grow grow--${kind}`, attrs: { "aria-hidden": "true" } });
  let stage = -1;
  const set = (done: number, total: number): void => {
    const next = total <= 0 ? 0 : Math.max(0, Math.min(5, Math.round((done / total) * 5)));
    if (next === stage) return;
    const grew = stage >= 0 && next > stage;
    stage = next;
    node.replaceChildren(svgNode(frames[stage]!, "grow__art"));
    if (grew) {
      node.classList.remove("is-new");
      void node.offsetWidth;
      node.classList.add("is-new");
      const line = kind === "flower" ? FLOWER_VOICE[stage] : undefined;
      if (line && audio.hasVoice(line)) audio.say(line, { after: true });
    }
  };
  set(0, 1);
  return { node, set };
}
