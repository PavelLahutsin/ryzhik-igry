import { audio } from "./audio";
import { el } from "./dom";

const SPEAKER = `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 12h5l7-6v20l-7-6H5z" fill="#fffcf7" stroke="#3b2e25" stroke-width="2.4" stroke-linejoin="round"/><path d="M21 11.5q3 4.5 0 9M24.5 8q6 8 0 16" fill="none" stroke="#3b2e25" stroke-width="2.4" stroke-linecap="round"/></svg>`;

/**
 * v23: «Повтори» — Ryzhik says the task again. Hidden while the line is not
 * recorded (the mp3 is not in public/audio/voice), so it never does nothing.
 */
export function speakButton(id: string | null = null): { node: HTMLButtonElement; set: (id: string | null) => void; say: () => void } {
  let line = id;
  const node = el("button", { class: "speak-btn", attrs: { type: "button", "aria-label": "Повтори задание" } });
  node.innerHTML = SPEAKER;
  const say = (): void => {
    if (line) audio.say(line);
  };
  node.addEventListener("click", (e) => {
    e.stopPropagation();
    audio.unlock();
    say();
    node.classList.remove("is-on");
    void node.offsetWidth;
    node.classList.add("is-on");
  });
  const set = (next: string | null): void => {
    line = next;
    node.hidden = !next || !audio.hasVoice(next);
  };
  set(id);
  return { node, set, say };
}
