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
    el("h1", { class: "toolbar__title", text: title }),
    extra ?? el("span", { class: "toolbar__spacer" }),
  ]);
}

const STAR_PATH =
  "M16 2.5l4.1 8.6 9.4 1.2-6.9 6.5 1.8 9.3L16 23.6l-8.4 4.5 1.8-9.3-6.9-6.5 9.4-1.2z";

/** Row of three stars, `filled` of them lit. */
export function starRow(filled: number, className = "stars"): HTMLElement {
  const row = el("span", {
    class: className,
    attrs: { role: "img", "aria-label": `Звёзд: ${filled} из 3` },
  });
  for (let i = 0; i < 3; i++) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 32 32");
    svg.setAttribute("class", i < filled ? "star is-on" : "star");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", STAR_PATH);
    svg.append(path);
    row.append(svg);
  }
  return row;
}

/** Inline SVG markup -> element (all art strings are ours, never user input). */
export function svgNode(markup: string, className = ""): HTMLElement {
  const wrap = el("span", { class: `svg-art ${className}`.trim(), attrs: { "aria-hidden": "true" } });
  wrap.innerHTML = markup;
  return wrap;
}

const PRAISE = ["Молодец!", "Ура!", "Здорово!", "Умница!", "Отлично!", "Получилось!"];

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
  art?: Node | null;
  actions: PraiseAction[];
}): HTMLElement {
  const buttons = options.actions.map((action) =>
    el(
      "button",
      {
        class: `btn ${action.primary ? "btn--play" : "btn--ghost"}`,
        attrs: { type: "button" },
        on: { click: action.onClick },
      },
      [el("span", { text: action.label })],
    ),
  );
  const card = el("div", { class: "praise__card", attrs: { role: "dialog", "aria-live": "polite" } }, [
    options.art ?? null,
    el("p", { class: "praise__title", text: options.title ?? praiseWord() }),
    options.stars ? starRow(options.stars, "stars stars--big") : null,
    options.text ? el("p", { class: "praise__text", text: options.text }) : null,
    el("div", { class: "praise__actions" }, buttons),
  ]);
  const overlay = el("div", { class: "praise" }, [confetti(), card]);
  requestAnimationFrame(() => overlay.classList.add("is-open"));
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
