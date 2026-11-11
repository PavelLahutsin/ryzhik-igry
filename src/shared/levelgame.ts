import { audio } from "./audio";
import { el } from "./dom";
import { gameProgress, isUnlocked, totalStars, type Progress } from "./progress";
import { goHome, listenGame, navigateGame } from "./router";
import { praiseOverlay, starRow, toolbar } from "./ui";

export type LevelInfo = {
  id: string;
  title: string;
};

export type PlayApi = {
  /** Call once when the level is solved; stars 1–3. */
  win: (stars: number, text?: string) => void;
  /** Put game-specific controls in the top bar (right side). */
  setTool: (node: HTMLElement | null) => void;
};

export type LevelGameDef<L extends LevelInfo> = {
  id: string;
  title: string;
  /** Under the title on the level list. */
  subtitle: string;
  levels: readonly L[];
  /** Small art for the level card. */
  thumb: (level: L, index: number) => Node;
  /** Short line under the card, e.g. "4 кусочка". */
  caption?: (level: L, index: number) => string;
  play: (stage: HTMLElement, level: L, index: number, api: PlayApi) => () => void;
};

/**
 * Common frame for the new games: level list -> play -> praise.
 * Routes inside the game: "#/<id>/" list, "#/<id>/play/<n>" level n (1-based).
 */
export function mountLevelGame<L extends LevelInfo>(def: LevelGameDef<L>, root: HTMLElement): () => void {
  const store = gameProgress(def.id);
  const ids = def.levels.map((level) => level.id);
  let cleanup: (() => void) | null = null;
  let token = 0;

  function show(sub: string[]): void {
    cleanup?.();
    cleanup = null;
    root.replaceChildren();
    const mine = ++token;
    if (sub[0] === "play") {
      const index = Number(sub[1]) - 1;
      const level = def.levels[index];
      if (!level) {
        navigateGame(def.id, "/", { replace: true });
        return;
      }
      void store.load().then((progress) => {
        if (mine !== token) return;
        if (!isUnlocked(ids, level.id, progress.completed)) {
          navigateGame(def.id, "/", { replace: true });
          return;
        }
        cleanup = renderPlay(level, index);
      });
      document.body.dataset.route = "play";
      return;
    }
    cleanup = renderList(() => mine !== token);
    document.body.dataset.route = "levels";
  }

  function renderList(stale: () => boolean): () => void {
    const grid = el("div", { class: "level-grid" });
    const score = el("span", { class: "world__stars" });
    const view = el("div", { class: `screen screen--list game--${def.id}` }, [
      toolbar(def.title, goHome),
      el("section", { class: "world" }, [
        el("header", { class: "world__head" }, [el("p", { class: "world__title", text: def.subtitle }), score]),
        grid,
      ]),
    ]);
    root.append(view);
    void store.load().then((progress) => {
      if (stale()) return;
      score.textContent = `★ ${totalStars(progress.stars, ids)} из ${ids.length * 3}`;
      let focus: HTMLElement | null = null;
      def.levels.forEach((level, index) => {
        const card = levelCard(level, index, progress);
        if (!focus && card.classList.contains("is-next")) focus = card;
        grid.append(card);
      });
      (focus as HTMLElement | null)?.scrollIntoView({ block: "nearest" });
    });
    return () => view.remove();
  }

  function levelCard(level: L, index: number, progress: Progress): HTMLElement {
    const open = isUnlocked(ids, level.id, progress.completed);
    const done = progress.completed.includes(level.id);
    const stars = progress.stars[level.id] ?? 0;
    const state = done ? " is-done" : open ? " is-next" : " is-locked";
    return el(
      "button",
      {
        class: `level-card${state}`,
        attrs: {
          type: "button",
          disabled: open ? null : true,
          "aria-label": open ? `Уровень ${index + 1}: ${level.title}` : `Уровень ${index + 1}, ещё закрыт`,
        },
        on: {
          click: () => {
            if (!open) return;
            audio.unlock();
            audio.play("tap");
            navigateGame(def.id, `/play/${index + 1}`);
          },
        },
      },
      [
        el("span", { class: "level-card__frame" }, [
          open
            ? el("span", { class: "level-card__art" }, [def.thumb(level, index)])
            : el("span", { class: "level-card__art level-card__mystery", text: "?" }),
          el("span", { class: "level-card__num", text: String(index + 1) }),
          done || !open ? null : el("span", { class: "level-card__play", attrs: { "aria-hidden": "true" } }),
        ]),
        el("span", { class: "level-card__foot" }, [
          el("span", {
            class: "level-card__name",
            text: open ? (def.caption?.(level, index) ?? level.title) : "Закрыт",
          }),
          done ? starRow(stars) : null,
        ]),
      ],
    );
  }

  function renderPlay(level: L, index: number): () => void {
    const tool = el("span", { class: "toolbar__spacer" });
    const bar = toolbar(`${index + 1}. ${level.title}`, () => navigateGame(def.id, "/"), tool);
    const stage = el("div", { class: "stage" });
    const view = el("div", { class: `screen screen--play game--${def.id}` }, [bar, stage]);
    root.append(view);
    let won = false;
    const api: PlayApi = {
      win: (stars, text) => {
        if (won) return;
        won = true;
        audio.play("win");
        void store.win(level.id, stars);
        const next = def.levels[index + 1];
        const actions = [
          next
            ? { label: "Дальше", primary: true, onClick: () => navigateGame(def.id, `/play/${index + 2}`) }
            : { label: "Все игры", primary: true, onClick: goHome },
          { label: "Ещё раз", onClick: () => navigateGame(def.id, `/play/${index + 1}`) },
          { label: "Уровни", onClick: () => navigateGame(def.id, "/") },
        ];
        // Let the finishing animation be seen before the card.
        setTimeout(() => {
          if (view.isConnected) view.append(praiseOverlay({ stars, text, actions }));
        }, 700);
      },
      setTool: (node) => {
        tool.replaceChildren();
        if (node) tool.append(node);
      },
    };
    const stop = def.play(stage, level, index, api);
    return () => {
      stop();
      view.remove();
    };
  }

  const stop = listenGame(def.id, show);
  return () => {
    token++;
    stop();
    cleanup?.();
    cleanup = null;
  };
}
