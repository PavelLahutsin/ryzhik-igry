import { audio } from "../shared/audio";
import { character } from "../shared/assets";
import { el } from "../shared/dom";
import { navigate } from "../shared/router";
import { games, type GameEntry } from "../games/registry";

/** Home menu: one big tile per game. No ads, no store, no timers. */
export function renderHome(root: HTMLElement): () => void {
  const soundBtn = el(
    "button",
    {
      class: "btn btn--back home__sound",
      attrs: {
        type: "button",
        "aria-label": "Звук",
        "aria-pressed": audio.enabled ? "true" : "false",
      },
      on: {
        click: () => {
          audio.unlock();
          audio.setEnabled(!audio.enabled);
          soundBtn.setAttribute("aria-pressed", audio.enabled ? "true" : "false");
          soundBtn.firstElementChild!.textContent = audio.enabled ? "🔊" : "🔈";
          audio.play("tap");
        },
      },
    },
    [el("span", { attrs: { "aria-hidden": "true" }, text: audio.enabled ? "🔊" : "🔈" })],
  );
  const view = el("div", { class: "screen screen--home" }, [
    el("header", { class: "home__head" }, [
      el("img", {
        class: "home__hero",
        attrs: { src: character("ryzhik"), alt: "Лисёнок Рыжик машет лапкой", draggable: "false" },
      }),
      el("div", { class: "home__text" }, [
        el("p", { class: "eyebrow", text: "Лисёнок Рыжик" }),
        el("h1", { class: "title", text: "Игры с Рыжиком" }),
      ]),
      soundBtn,
    ]),
    el("main", { class: "home__grid" }, games.map(tile)),
    el("p", { class: "home__foot", text: "Без рекламы и интернета. Прогресс хранится только на этом устройстве." }),
  ]);
  root.append(view);
  return () => view.remove();
}

function tile(game: GameEntry): HTMLElement {
  return el(
    "button",
    {
      class: `game-tile${game.wide ? " game-tile--wide" : ""}`,
      style: { "--tile": game.color },
      attrs: { type: "button", "data-game": game.id, "aria-label": `${game.title}. ${game.note}` },
      on: {
        click: () => {
          audio.unlock();
          audio.play("tap");
          navigate(`/${game.id}/`);
        },
      },
    },
    [
      el("span", { class: "game-tile__art" }, [
        el("img", {
          class: game.art.figure ? "is-figure" : "",
          attrs: { src: game.art.src, alt: "", draggable: "false", loading: "lazy" },
        }),
      ]),
      el("span", { class: "game-tile__body" }, [
        el("span", { class: "game-tile__name", text: game.title }),
        el("span", { class: "game-tile__note", text: game.note }),
      ]),
    ],
  );
}
