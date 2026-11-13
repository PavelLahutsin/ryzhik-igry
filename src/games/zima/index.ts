import { audio } from "../../shared/audio";
import { el } from "../../shared/dom";
import { gameProgress } from "../../shared/progress";
import { goHome, navigate } from "../../shared/router";
import { WINTER } from "../../shared/season";
import { useStyles } from "../../shared/style";
import { starRow, toolbar } from "../../shared/ui";
import baseCss from "../../shared/base.css?inline";
import { games } from "../registry";
import css from "./style.css?inline";

type Levels = { levels: ReadonlyArray<{ id: string; title: string }> };
const LEVELS: Record<string, () => Promise<Levels>> = {
  sliyanie: () => import("../sliyanie/levels"),
  odezhda: () => import("../odezhda/levels"),
  sortirovka: () => import("../sortirovka/levels"),
  tochki: () => import("../tochki/levels"),
  risovalka: () => import("../risovalka/pictures"),
  mozaika: () => import("../mozaika/levels"),
  formy: () => import("../formy/levels"),
};

/** «Зима»: the winter levels of other games in one place, open all winter. */
export function mount(root: HTMLElement): () => void {
  useStyles(baseCss, css);
  const grid = el("div", { class: "zm-grid" });
  const view = el("div", { class: "screen screen--list game--zima" }, [
    toolbar("Зима", goHome),
    el("p", { class: "zm-note", text: "Снеговики, ёлочки, санки и варежки — зимние уровни из разных игр. Зимой они открыты сразу." }),
    grid,
  ]);
  root.append(view);

  const card = (opts: { game: string; title: string; path: string; stars?: number }): HTMLElement => {
    const g = games.find((x) => x.id === opts.game);
    return el(
      "button",
      {
        class: "zm-card",
        attrs: { type: "button", "aria-label": `${opts.title} — ${g?.title ?? ""}` },
        on: {
          click: () => {
            audio.unlock();
            audio.play("tap");
            navigate(opts.path);
          },
        },
      },
      [
        el("span", { class: "zm-card__art", style: { background: g?.color ?? "#6db3d4" } }, g ? [el("img", { attrs: { src: g.art.src, alt: "", draggable: "false" } })] : []),
        el("span", { class: "zm-card__title", text: opts.title }),
        el("span", { class: "zm-card__game", text: g?.title ?? "" }),
        opts.stars !== undefined ? starRow(opts.stars, "stars zm-card__stars") : el("span", { class: "zm-card__free", text: "Без звёзд, просто играть" }),
      ],
    );
  };

  void (async () => {
    const cards: HTMLElement[] = [];
    for (const w of WINTER) {
      const load = LEVELS[w.game];
      if (!load) continue;
      const [{ levels }, progress] = await Promise.all([load(), gameProgress(w.game).load()]);
      const index = levels.findIndex((l) => l.id === w.level);
      if (index < 0) continue;
      cards.push(card({ game: w.game, title: levels[index]!.title, path: `/${w.game}/play/${index + 1}`, stars: progress.stars[w.level] ?? 0 }));
    }
    cards.push(card({ game: "stikery", title: "Зимняя картинка", path: "/stikery/zima" }));
    cards.push(card({ game: "raskraska", title: "Рыжик лепит снеговика", path: "/raskraska" }));
    if (view.isConnected) grid.replaceChildren(...cards);
  })();

  return () => view.remove();
}
