import { audio } from "../shared/audio";
import { character } from "../shared/assets";
import { el } from "../shared/dom";
import { navigate } from "../shared/router";
import { games, type GameEntry, type Summary } from "../games/registry";

/** Home menu: one big tile per game with its progress. No ads, no store, no timers. */
export function renderHome(root: HTMLElement): () => void {
  let gone = false;
  const soundIcon = el("span", { attrs: { "aria-hidden": "true" }, text: audio.enabled ? "🔊" : "🔈" });
  const soundBtn = el(
    "button",
    {
      class: "btn btn--back home__sound",
      attrs: { type: "button", "aria-label": "Звук", "aria-pressed": audio.enabled ? "true" : "false" },
      on: {
        click: () => {
          audio.unlock();
          audio.setEnabled(!audio.enabled);
          soundBtn.setAttribute("aria-pressed", audio.enabled ? "true" : "false");
          soundIcon.textContent = audio.enabled ? "🔊" : "🔈";
          audio.play("tap");
        },
      },
    },
    [soundIcon],
  );
  const total = el("span", { class: "home__chip", attrs: { hidden: true } });
  const view = el("div", { class: "screen screen--home" }, [
    el("header", { class: "home__head" }, [
      el("img", {
        class: "home__hero",
        attrs: { src: character("ryzhik"), alt: "Лисёнок Рыжик машет лапкой", draggable: "false" },
      }),
      el("div", { class: "home__text" }, [
        el("p", { class: "eyebrow", text: "Лисёнок Рыжик" }),
        el("h1", { class: "title", text: "Игры с Рыжиком" }),
        total,
      ]),
      soundBtn,
    ]),
    el("main", { class: "home__grid" }, games.map((game) => tile(game))),
    el("footer", { class: "home__foot" }, [
      el("span", { text: "Без рекламы и интернета. Прогресс хранится только на этом устройстве." }),
      el("button", {
        class: "btn btn--parent",
        attrs: { type: "button" },
        text: "Для родителей",
        on: { click: () => navigate("/roditelyam") },
      }),
    ]),
  ]);
  root.append(view);

  let stars = 0;
  for (const game of games) {
    void game
      .summary()
      .then((summary) => {
        if (gone) return;
        if (summary.unit === "stars") {
          stars += summary.got;
          total.textContent = `★ ${stars}`;
          total.hidden = stars === 0;
        }
        const node = view.querySelector<HTMLElement>(`[data-game="${game.id}"] .game-tile__progress`);
        if (node) fillProgress(node, summary);
      })
      .catch(() => undefined);
  }
  return () => {
    gone = true;
    view.remove();
  };
}

function fillProgress(node: HTMLElement, summary: Summary): void {
  const share = summary.max > 0 ? Math.round((summary.got / summary.max) * 100) : 0;
  node.replaceChildren(
    el("span", { class: "game-tile__bar" }, [el("i", { style: { width: `${share}%` } })]),
    el("span", {
      class: "game-tile__stars",
      text:
        summary.unit === "stars"
          ? `★ ${summary.got}/${summary.max}`
          : summary.unit === "finds"
            ? `✦ ${summary.got}/${summary.max}`
            : `${summary.got}/${summary.max}`,
    }),
  );
  node.setAttribute(
    "aria-label",
    summary.unit === "stars"
      ? `Звёзд: ${summary.got} из ${summary.max}`
      : summary.unit === "finds"
        ? `Найдено: ${summary.got} из ${summary.max}`
        : `Готово картинок: ${summary.got} из ${summary.max}`,
  );
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
        el("span", { class: "game-tile__progress" }),
      ]),
    ],
  );
}
