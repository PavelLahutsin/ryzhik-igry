import { audio } from "./audio";
import { praiseLine } from "./voice-lines";
import { artUrl } from "./art";
import { el } from "./dom";
import { reducedMotion } from "./style";

export function toolbar(title: string, onBack: () => void, extra?: HTMLElement | null): HTMLElement {
  return el("header", { class: "toolbar" }, [
    el(
      "button",
      {
        class: "btn btn--back",
        attrs: { type: "button", "aria-label": "Назад" },
        on: { click: onBack },
      },
      [el("span", { attrs: { "aria-hidden": "true" }, text: "←" })],
    ),
    // v13: long titles (level names) get a smaller size and a third line on phones, never cut.
    el("h1", { class: `toolbar__title${title.length > 20 ? " toolbar__title--long" : ""}`, text: title }),
    extra ?? el("span", { class: "toolbar__spacer" }),
  ]);
}

/** Row of three stars, `filled` of them lit. */
export function starRow(filled: number, className = "stars"): HTMLElement {
  const row = el("span", {
    class: className,
    attrs: { role: "img", "aria-label": `Звёзд: ${filled} из 3` },
  });
  for (let i = 0; i < 3; i++) {
    row.append(el("img", { class: i < filled ? "star is-on" : "star", attrs: { src: artUrl("starbadge"), alt: "", "aria-hidden": "true", draggable: "false" } }));
  }
  return row;
}

/** Inline SVG markup -> element (all art strings are ours, never user input). */
export function svgNode(markup: string, className = ""): HTMLElement {
  const wrap = el("span", { class: `svg-art ${className}`.trim(), attrs: { "aria-hidden": "true" } });
  wrap.innerHTML = markup;
  return wrap;
}

const PRAISE = ["Ура!", "Здорово!", "Красота!", "Отлично!", "Получилось!"];

export function praiseWord(index = Math.floor(Math.random() * PRAISE.length)): string {
  return PRAISE[index % PRAISE.length]!;
}

/** Falling paper confetti; skipped when the system asks for less motion. */
export function confetti(count = 26): HTMLElement {
  const box = el("div", { class: "confetti", attrs: { "aria-hidden": "true" } });
  if (reducedMotion()) return box;
  const colors = ["#ff8a3d", "#ffc94a", "#157a62", "#6db3d4", "#f27aa0"];
  for (let i = 0; i < count; i++) {
    box.append(
      el("i", {
        style: {
          left: `${Math.random() * 100}%`,
          background: colors[i % colors.length]!,
          animationDelay: `${Math.random() * 0.8}s`,
          animationDuration: `${2.2 + Math.random() * 1.6}s`,
        },
      }),
    );
  }
  return box;
}

export type PraiseAction = { label: string; primary?: boolean; onClick: () => void };

/** Win card over the game: praise, stars, big buttons. Never a "lose" screen. */
export function praiseOverlay(options: {
  title?: string;
  text?: string;
  stars?: number;
  /** Why this many stars, under the stars (e.g. «3 звезды — без подсказок!»). */
  why?: string;
  art?: Node | null;
  /** Extra line under the text (e.g. a new sticker). */
  extra?: Node | null;
  /** Recorded line to say (default: a random praise). */
  voice?: string;
  actions: PraiseAction[];
}): HTMLElement {
  let chosen = false;
  const title = options.title ?? praiseWord();
  const buttons = options.actions.map((action) =>
    el(
      "button",
      {
        class: `btn ${action.primary ? "btn--play" : "btn--ghost"}`,
        attrs: { type: "button" },
        on: {
          click: () => {
            // One choice only: a double tap must not open two levels.
            if (chosen) return;
            chosen = true;
            audio.play("click");
            action.onClick();
          },
        },
      },
      [el("span", { text: action.label })],
    ),
  );
  const card = el("div", { class: "praise__card", attrs: { role: "dialog", "aria-live": "polite" } }, [
    options.art ?? null,
    el("p", { class: "praise__title", text: title }),
    options.stars ? starRow(options.stars, "stars stars--big") : null,
    options.why ? el("p", { class: "praise__why", text: options.why }) : null,
    options.text ? el("p", { class: "praise__text", text: options.text }) : null,
    options.extra ?? null,
    el("div", { class: "praise__actions" }, buttons),
  ]);
  const overlay = el("div", { class: "praise" }, [confetti(), card]);
  requestAnimationFrame(() => overlay.classList.add("is-open"));
  // Ryzhik's voice, once recorded (see voice-lines.ts); silent until then.
  setTimeout(() => overlay.isConnected && audio.say(options.voice ?? praiseLine(Math.random, title)), 250);
  for (let i = 0; i < (options.stars ?? 0); i++) setTimeout(() => overlay.isConnected && audio.star(i), 350 + i * 260);
  setTimeout(() => (buttons[0] as HTMLButtonElement | undefined)?.focus({ preventScroll: true }), 50);
  return overlay;
}

/** Small toast for gentle hints ("Попробуй другую!"). */
export function hint(parent: HTMLElement, text: string, ms = 1800): void {
  parent.querySelector(".hint")?.remove();
  const node = el("p", { class: "hint", attrs: { role: "status" }, text });
  parent.append(node);
  requestAnimationFrame(() => node.classList.add("is-open"));
  setTimeout(() => {
    node.classList.remove("is-open");
    setTimeout(() => node.remove(), 300);
  }, ms);
}


/**
 * Confirm leaving a game in progress. «Играть дальше» stays; «В домик»
 * runs onLeave once. Does not touch history or the browser back button.
 */
export function confirmLeave(onLeave: () => void): void {
  if (document.querySelector("dialog.leave")) return;

  const back = document.querySelector<HTMLElement>(".btn--back");
  const returnFocus =
    document.activeElement instanceof HTMLElement && document.activeElement !== document.body
      ? document.activeElement
      : back;

  const stay = el(
    "button",
    { class: "btn btn--play", attrs: { type: "button" }, on: { click: () => choose(false) } },
    [el("span", { text: "Играть дальше" })],
  );
  const leave = el(
    "button",
    { class: "btn btn--ghost", attrs: { type: "button" }, on: { click: () => choose(true) } },
    [el("span", { text: "В домик" })],
  );
  const dialog = el("dialog", { class: "leave", attrs: { "aria-modal": "true", "aria-labelledby": "leave-title", "aria-describedby": "leave-text" } }, [
    el("h2", { attrs: { id: "leave-title" }, text: "Вернуться в домик?" }),
    el("p", { attrs: { id: "leave-text" }, text: "Игра остановится. Потом можно начать снова." }),
    el("div", { class: "leave__actions" }, [stay, leave]),
  ]) as HTMLDialogElement;

  let chosen = false;
  function choose(shouldLeave: boolean): void {
    if (chosen) return;
    chosen = true;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
    dialog.remove();
    if (shouldLeave) onLeave();
    else if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  }

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    choose(false);
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) choose(false);
  });

  const host = back?.closest(".screen") ?? back?.parentElement ?? document.body;
  host.append(dialog);
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
  stay.focus({ preventScroll: true });
}
