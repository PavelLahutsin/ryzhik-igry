import { audio } from "../shared/audio";
import { character } from "../shared/assets";
import { el } from "../shared/dom";
import { navigate } from "../shared/router";
import { tipOnce } from "../shared/tips";
import { dailyButton } from "./daily";
import { svgNode } from "../shared/ui";
import { OBJECTS } from "../shared/objects";
import { freshKey, games, type GameEntry, type Summary } from "../games/registry";
import { loadPlayed, pickToday, type Played } from "../shared/played";

let greeted = false;

/** Home menu: one big tile per game with its progress. No ads, no store, no timers. */
export function renderHome(root: HTMLElement): () => void {
  let gone = false;
  // v13: a seasonal entry («Зима») shows only in its season.
  const shown = games.filter((g) => !g.season || g.season());
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
  const gift = dailyButton((overlay) => view.append(overlay));
  const total = el("span", { class: "home__chip", attrs: { hidden: true } });
  // v13: «Во что поиграем сегодня?» and «Недавно играли» fill in once the progress is read.
  const today = el("section", { class: "home__today", attrs: { hidden: true, "aria-label": "Во что поиграем сегодня?" } });
  const recentRow = el("section", { class: "home__recent", attrs: { hidden: true, "aria-label": "Недавно играли" } });
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
      el("div", { class: "home__tools" }, [gift, soundBtn]),
    ]),
    today,
    recentRow,
    el("main", { class: "home__grid" }, shown.map((game) => tile(game))),
    el("footer", { class: "home__foot" }, [
      el("span", { text: "Без рекламы и интернета. Прогресс хранится только на этом устройстве." }),
      el(
        "button",
        { class: "btn btn--play home__album", attrs: { type: "button" }, on: { click: () => navigate("/albom") } },
        [svgNode(OBJECTS.star.svg, "home__album-icon"), el("span", { text: "Мои наклейки" })],
      ),
      el("button", {
        class: "btn btn--parent",
        attrs: { type: "button" },
        text: "Для родителей",
        on: { click: () => navigate("/roditelyam") },
      }),
    ]),
  ]);
  root.append(view);
  // Ryzhik greets (when his voice is recorded): hello first, then «Выбирай игру!».
  audio.say(greeted ? "v11" : "v01");
  greeted = true;
  const tipTimer = window.setTimeout(() => tipOnce("sound-button", soundBtn, "Здесь звук: включить или выключить"), 1500);

  let stars = 0;
  const sums = new Map<string, Summary>();
  const playedP = loadPlayed();
  void playedP.then((played) => {
    if (gone) return;
    fillRecent(recentRow, played);
    for (const game of shown) {
      const key = freshKey(game);
      if (key && !played.opened.includes(key)) {
        view.querySelector(`[data-game="${game.id}"] .game-tile__art`)?.append(el("span", { class: "game-tile__new", text: game.fresh!.text }));
      }
    }
  });
  const sumP = shown.map((game) => game.summary());
  const summaries = shown.map((game, i) => sumP[i]!.then((s) => void sums.set(game.id, s)).catch(() => undefined));
  void Promise.all([playedP, ...summaries]).then(([played]) => {
    if (gone) return;
    const list = shown.filter((g) => sums.has(g.id)).map((g) => ({ id: g.id, got: sums.get(g.id)!.got, max: sums.get(g.id)!.max }));
    const pick = pickToday(list, played as Played, Math.floor(Date.now() / 86_400_000));
    const game = pick && shown.find((g) => g.id === pick.id);
    if (!game || !pick) return;
    const s = sums.get(game.id)!;
    today.replaceChildren(
      el("p", { class: "home__today-ask", text: "Во что поиграем сегодня?" }),
      el("button", { class: "home__today-card", style: { "--tile": game.color }, attrs: { type: "button" }, on: { click: () => open(game) } }, [
        el("img", { class: game.art.figure ? "is-figure" : "", attrs: { src: game.art.src, alt: "", draggable: "false" } }),
        el("span", { class: "home__today-text" }, [
          el("b", { text: game.title }),
          el("span", { text: pick.why === "new" ? "Ещё не играли — попробуем?" : `${unitLine(s)} — продолжим?` }),
        ]),
        el("span", { class: "home__today-go", attrs: { "aria-hidden": "true" }, text: "▶" }),
      ]),
    );
    today.hidden = false;
  });
  for (const [i, game] of shown.entries()) {
    void sumP[i]!
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
    clearTimeout(tipTimer);
    view.remove();
  };
}

function fillProgress(node: HTMLElement, summary: Summary): void {
  if (summary.unit === "free") {
    node.replaceChildren();
    return;
  }
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

function open(game: GameEntry): void {
  audio.unlock();
  audio.play("tap");
  navigate(`/${game.id}/`);
}

function unitLine(s: Summary): string {
  return s.unit === "stars" ? `★ ${s.got} из ${s.max}` : s.unit === "finds" ? `Найдено ${s.got} из ${s.max}` : `Готово ${s.got} из ${s.max}`;
}

/** «Недавно играли»: the last games, small, one tap back in. */
function fillRecent(row: HTMLElement, played: Played): void {
  const list = played.recent.map((id) => games.find((g) => g.id === id)).filter((g): g is GameEntry => !!g);
  if (list.length < 2) return;
  row.replaceChildren(
    el("p", { class: "home__recent-title", text: "Недавно играли" }),
    el(
      "div",
      { class: "home__recent-list" },
      list.map((game) =>
        el("button", { class: "home__recent-item", style: { "--tile": game.color }, attrs: { type: "button", "data-recent": game.id }, on: { click: () => open(game) } }, [
          el("img", { class: game.art.figure ? "is-figure" : "", attrs: { src: game.art.src, alt: "", draggable: "false" } }),
          el("span", { text: game.title }),
        ]),
      ),
    ),
  );
  row.hidden = false;
}

function tile(game: GameEntry): HTMLElement {
  return el(
    "button",
    {
      class: `game-tile${game.wide ? " game-tile--wide" : ""}`,
      style: { "--tile": game.color },
      attrs: { type: "button", "data-game": game.id, "aria-label": `${game.title}. ${game.note}` },
      on: {
        click: () => open(game),
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
