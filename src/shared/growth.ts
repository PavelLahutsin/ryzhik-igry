import { audio } from "./audio";
import { el } from "./dom";
import { svgNode } from "./ui";

/**
 * v23: a reward that grows inside a level instead of progress dots — a flower
 * in a pot (or a block tower) gets one stage richer with every right answer
 * (learn-digits: «каждый верный ответ растит растение»). Art: Astra, brief 26-1.
 */
export const GROW_FLOWER: string[] = [
  '<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#e08b4a" d="M27 107H73L67 129Q66 133 62 133H38Q34 133 33 129Z"/><rect x="22" y="101" width="56" height="11" rx="5" fill="#e08b4a"/><ellipse cx="50" cy="102" rx="25" ry="5" fill="#8b5a2b"/></g></svg>',
  '<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#e08b4a" d="M27 107H73L67 129Q66 133 62 133H38Q34 133 33 129Z"/><rect x="22" y="101" width="56" height="11" rx="5" fill="#e08b4a"/><ellipse cx="50" cy="102" rx="25" ry="5" fill="#8b5a2b"/><g fill="#5fbf4e"><path d="M50 102V87"/><path d="M50 91Q34 94 30 78Q46 76 50 91Z"/><path d="M50 87Q53 71 69 73Q66 88 50 87Z"/></g></g></svg>',
  '<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#e08b4a" d="M27 107H73L67 129Q66 133 62 133H38Q34 133 33 129Z"/><rect x="22" y="101" width="56" height="11" rx="5" fill="#e08b4a"/><ellipse cx="50" cy="102" rx="25" ry="5" fill="#8b5a2b"/><g fill="#5fbf4e"><path d="M50 102V87"/><path d="M50 91Q34 94 30 78Q46 76 50 91Z"/><path d="M50 87Q53 71 69 73Q66 88 50 87Z"/><path d="M50 87V56"/><path d="M50 72Q35 73 32 58Q47 58 50 72Z"/><path d="M50 64Q55 51 68 52Q66 66 50 64Z"/></g></g></svg>',
  '<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#e08b4a" d="M27 107H73L67 129Q66 133 62 133H38Q34 133 33 129Z"/><rect x="22" y="101" width="56" height="11" rx="5" fill="#e08b4a"/><ellipse cx="50" cy="102" rx="25" ry="5" fill="#8b5a2b"/><g fill="#5fbf4e"><path d="M50 102V87"/><path d="M50 91Q34 94 30 78Q46 76 50 91Z"/><path d="M50 87Q53 71 69 73Q66 88 50 87Z"/><path d="M50 87V56"/><path d="M50 72Q35 73 32 58Q47 58 50 72Z"/><path d="M50 64Q55 51 68 52Q66 66 50 64Z"/><path d="M50 56V41"/></g><path fill="#f58fb4" d="M50 43C39 43 39 28 50 21C61 28 61 43 50 43Z"/></g></svg>',
  '<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#e08b4a" d="M27 107H73L67 129Q66 133 62 133H38Q34 133 33 129Z"/><rect x="22" y="101" width="56" height="11" rx="5" fill="#e08b4a"/><ellipse cx="50" cy="102" rx="25" ry="5" fill="#8b5a2b"/><g fill="#5fbf4e"><path d="M50 102V87"/><path d="M50 91Q34 94 30 78Q46 76 50 91Z"/><path d="M50 87Q53 71 69 73Q66 88 50 87Z"/><path d="M50 87V56"/><path d="M50 72Q35 73 32 58Q47 58 50 72Z"/><path d="M50 64Q55 51 68 52Q66 66 50 64Z"/><path d="M50 56V41"/></g><g fill="#f58fb4"><path d="M50 43C39 43 39 28 50 21C61 28 61 43 50 43Z"/><path d="M50 40C39 47 29 35 31 25C41 23 49 29 50 40Z"/><path d="M50 40C61 47 71 35 69 25C59 23 51 29 50 40Z"/></g></g></svg>',
  '<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#e08b4a" d="M27 107H73L67 129Q66 133 62 133H38Q34 133 33 129Z"/><rect x="22" y="101" width="56" height="11" rx="5" fill="#e08b4a"/><ellipse cx="50" cy="102" rx="25" ry="5" fill="#8b5a2b"/><g fill="#5fbf4e"><path d="M50 102V87"/><path d="M50 91Q34 94 30 78Q46 76 50 91Z"/><path d="M50 87Q53 71 69 73Q66 88 50 87Z"/><path d="M50 87V56"/><path d="M50 72Q35 73 32 58Q47 58 50 72Z"/><path d="M50 64Q55 51 68 52Q66 66 50 64Z"/><path d="M50 56V41"/></g><g fill="#f58fb4"><path d="M50 43C39 43 39 28 50 21C61 28 61 43 50 43Z"/><path d="M50 40C39 47 29 35 31 25C41 23 49 29 50 40Z"/><path d="M50 40C61 47 71 35 69 25C59 23 51 29 50 40Z"/><path d="M50 39C42 32 26 34 22 41C23 51 41 54 50 39Z"/><path d="M50 39C58 32 74 34 78 41C77 51 59 54 50 39Z"/><path d="M50 39C64 44 59 55 50 57C41 55 36 44 50 39Z"/></g><circle cx="50" cy="39" r="7" fill="#ffc94a"/><path fill="#ffc94a" d="M48 14L50 4L52 14Z M25 19L18 11L22 21Z M75 19L82 11L78 21Z M16 37L7 34L15 40Z M84 37L93 34L85 40Z"/></g></svg>',
];

export const GROW_TOWER: string[] = [
  '<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><rect x="18" y="124" width="64" height="9" rx="4" fill="#e08b4a"/></g></svg>',
  '<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><rect x="18" y="124" width="64" height="9" rx="4" fill="#e08b4a"/><rect x="39" y="102" width="22" height="22" rx="3" fill="#e8463a"/></g></svg>',
  '<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><rect x="18" y="124" width="64" height="9" rx="4" fill="#e08b4a"/><rect x="39" y="102" width="22" height="22" rx="3" fill="#e8463a"/><rect x="37" y="80" width="22" height="22" rx="3" fill="#3a8fd4"/></g></svg>',
  '<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><rect x="18" y="124" width="64" height="9" rx="4" fill="#e08b4a"/><rect x="39" y="102" width="22" height="22" rx="3" fill="#e8463a"/><rect x="37" y="80" width="22" height="22" rx="3" fill="#3a8fd4"/><rect x="40" y="58" width="22" height="22" rx="3" fill="#ffc94a"/></g></svg>',
  '<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><rect x="18" y="124" width="64" height="9" rx="4" fill="#e08b4a"/><rect x="39" y="102" width="22" height="22" rx="3" fill="#e8463a"/><rect x="37" y="80" width="22" height="22" rx="3" fill="#3a8fd4"/><rect x="40" y="58" width="22" height="22" rx="3" fill="#ffc94a"/><rect x="38" y="36" width="22" height="22" rx="3" fill="#5fbf4e"/></g></svg>',
  '<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><rect x="18" y="124" width="64" height="9" rx="4" fill="#e08b4a"/><rect x="39" y="102" width="22" height="22" rx="3" fill="#e8463a"/><rect x="37" y="80" width="22" height="22" rx="3" fill="#3a8fd4"/><rect x="40" y="58" width="22" height="22" rx="3" fill="#ffc94a"/><rect x="38" y="36" width="22" height="22" rx="3" fill="#5fbf4e"/><rect x="39" y="14" width="22" height="22" rx="3" fill="#9b6cd8"/><path d="M50 14V3"/><path fill="#ffc94a" d="M50 3L64 6L50 10Z"/></g></svg>',
];

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
