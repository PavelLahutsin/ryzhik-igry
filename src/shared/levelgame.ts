import { audio } from "./audio";
import { character } from "./assets";
import { el } from "./dom";
import { gameProgress, isUnlocked, totalStars, type Progress } from "./progress";
import { goHome, listenGame, navigateGame } from "./router";
import { praiseOverlay, starRow, toolbar } from "./ui";

export type LevelInfo = {
  id: string;
  title: string;
  /** World (group of levels) on the level list. */
  world?: string;
};

export type World = { id: string; title: string; color: string };

export type PlayApi = {
  /** Call once when the level is solved; stars 1–3. */
  win: (stars: number, text?: string) => void;
  /** Put game-specific controls in the top bar (right side). */
  setTool: (node: HTMLElement | null) => void;
  /**
   * Show the lamp button; `onHint` runs on tap. Games decide what a hint
   * does (show the place, peek the cards …) and may count it for stars.
   */
  setHint: (onHint: (() => void) | null) => void;
};

export type LevelGameDef<L extends LevelInfo> = {
  id: string;
  title: string;
  /** Under the title on the level list. */
  subtitle: string;
  levels: readonly L[];
  worlds?: readonly World[];
  /** Small art for the level card. */
  thumb: (level: L, index: number) => Node;
  /** Short line under the card, e.g. "4 кусочка". */
  caption?: (level: L, index: number) => string;
  play: (stage: HTMLElement, level: L, index: number, api: PlayApi) => () => void;
};

/** Ids of a game's levels and its stored stars, for the home menu. */
export async function starSummary(gameId: string, ids: readonly string[]): Promise<{ got: number; max: number; done: number }> {
  const progress = await gameProgress(gameId).load();
  return {
    got: totalStars(progress.stars, ids),
    max: ids.length * 3,
    done: ids.filter((id) => progress.completed.includes(id)).length,
  };
}

/** Lamp icon for the hint button. */
function lampIcon(): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 32 32");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML =
    '<path d="M16 3a9 9 0 0 0-5 16.5V23h10v-3.5A9 9 0 0 0 16 3z" fill="#ffc94a" stroke="#3b2e25" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M12 26h8M13 29h6" stroke="#3b2e25" stroke-width="2.4" stroke-linecap="round"/>' +
    '<path d="M13 12l3 4 3-4" fill="none" stroke="#a3490d" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';
  return svg;
}

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
    const score = el("span", { class: "list__score" });
    const sections = el("div", { class: "worlds" });
    const view = el("div", { class: `screen screen--list game--${def.id}` }, [
      toolbar(def.title, goHome, score),
      el("p", { class: "list__lead", text: def.subtitle }),
      sections,
    ]);
    root.append(view);
    void store.load().then((progress) => {
      if (stale()) return;
      score.textContent = `★ ${totalStars(progress.stars, ids)}/${ids.length * 3}`;
      const groups: Array<{ world: World | null; items: Array<{ level: L; index: number }> }> = [];
      def.levels.forEach((level, index) => {
        const world = def.worlds?.find((w) => w.id === level.world) ?? null;
        const last = groups[groups.length - 1];
        if (last && last.world?.id === world?.id) last.items.push({ level, index });
        else groups.push({ world, items: [{ level, index }] });
      });
      let focus: HTMLElement | null = null;
      for (const group of groups) {
        const grid = el("div", { class: "level-grid" });
        const groupIds = group.items.map((item) => item.level.id);
        const section = el(
          "section",
          { class: "world", style: group.world ? { "--world": group.world.color } : undefined },
          [
            group.world
              ? el("header", { class: "world__head" }, [
                  el("h2", { class: "world__title", text: group.world.title }),
                  el("span", {
                    class: "world__stars",
                    text: `★ ${totalStars(progress.stars, groupIds)} из ${groupIds.length * 3}`,
                  }),
                ])
              : null,
            grid,
          ],
        );
        for (const { level, index } of group.items) {
          const card = levelCard(level, index, progress);
          if (!focus && card.classList.contains("is-next")) focus = card;
          grid.append(card);
        }
        sections.append(section);
      }
      (focus as HTMLElement | null)?.scrollIntoView({ block: "center" });
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
            : el("span", { class: "level-card__art level-card__mystery" }, [lockIcon()]),
          el("span", { class: "level-card__num", text: String(index + 1) }),
          done || !open ? null : el("span", { class: "level-card__play", attrs: { "aria-hidden": "true" } }),
        ]),
        el("span", { class: "level-card__foot" }, [
          el("span", {
            class: "level-card__name",
            text: open ? (def.caption?.(level, index) ?? level.title) : "Закрыт",
          }),
          done ? starRow(stars) : open ? el("span", { class: "level-card__new", text: "Играть!" }) : null,
        ]),
      ],
    );
  }

  function renderPlay(level: L, index: number): () => void {
    const tool = el("span", { class: "toolbar__tools" });
    const hintBtn = el(
      "button",
      { class: "btn btn--back btn--hint", attrs: { type: "button", "aria-label": "Подсказка", hidden: true } },
      [lampIcon()],
    );
    tool.append(hintBtn);
    const bar = toolbar(`${index + 1}. ${level.title}`, () => navigateGame(def.id, "/"), tool);
    const stage = el("div", { class: "stage" });
    const view = el("div", { class: `screen screen--play game--${def.id}` }, [bar, stage]);
    root.append(view);
    let won = false;
    let onHint: (() => void) | null = null;
    hintBtn.addEventListener("click", () => {
      if (!onHint || won) return;
      audio.unlock();
      audio.play("tap");
      hintBtn.classList.remove("is-used");
      void hintBtn.offsetWidth;
      hintBtn.classList.add("is-used");
      onHint();
    });
    const api: PlayApi = {
      win: (stars, text) => {
        if (won) return;
        won = true;
        hintBtn.hidden = true;
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
        const art = el("img", {
          class: "praise__fox",
          attrs: { src: character("ryzhik"), alt: "", draggable: "false" },
        });
        // Let the finishing animation be seen before the card.
        setTimeout(() => {
          if (!view.isConnected) return;
          view.append(
            praiseOverlay({
              stars,
              text: next ? text : `${text ? `${text} ` : ""}Ты прошёл все уровни!`,
              art,
              actions,
            }),
          );
        }, 700);
      },
      setTool: (node) => {
        tool.querySelector(".toolbar__extra")?.remove();
        if (node) {
          node.classList.add("toolbar__extra");
          tool.prepend(node);
        }
      },
      setHint: (fn) => {
        onHint = fn;
        hintBtn.hidden = !fn;
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

function lockIcon(): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 32 32");
  svg.setAttribute("class", "lock-icon");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML =
    '<rect x="7" y="14" width="18" height="14" rx="4" fill="#fffcf7" stroke="#a3490d" stroke-width="2.4"/>' +
    '<path d="M11 14v-3a5 5 0 0 1 10 0v3" fill="none" stroke="#a3490d" stroke-width="2.4"/>' +
    '<circle cx="16" cy="21" r="2.2" fill="#a3490d"/>';
  return svg;
}
