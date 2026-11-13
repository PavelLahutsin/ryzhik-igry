import { audio } from "./audio";
import { el, svgEl, replayClass } from "./dom";
import { markOpened, wasOpened } from "./played";
import { seasonOpen } from "./season";
import { countWin, showBreak } from "./toys";
import { gameProgress, isUnlocked, isUnlockedInWorld, totalStars, type Progress } from "./progress";
import { goHome, listenGame, navigateGame } from "./router";
import { praiseOverlay, starRow, toolbar } from "./ui";
import { whenIdle } from "./guide";
import { createScope } from "./lifecycle";
import { afterHowTo } from "./howto";
import { LEVEL_TIPS } from "./tips-data";
import { clearTips, tipOnce } from "./tips";
import { loadSeen, markSeen } from "./seen";
import { newStickers, stickerArt, type Sticker } from "./stickers";
import { isScore, type Score } from "./stars";
import { reducedMotion } from "./style";

export type LevelInfo = {
  id: string;
  title: string;
  /** World (group of levels) on the level list. */
  world?: string;
};

export type World = { id: string; title: string; color: string };

export type PlayApi = {
  /**
   * Call once when the level is solved: a `rate()` score (stars and why,
   * shown on the card) or plain stars 1–3.
   */
  win: (score: Score | number, text?: string, art?: Node) => void;
  /** Put game-specific controls in the top bar (right side). */
  setTool: (node: HTMLElement | null) => void;
  /**
   * Show the lamp button; `onHint` runs on tap. Games decide what a hint
   * does (show the place, peek the cards …) and may count it for stars.
   */
  setHint: (onHint: (() => void) | null) => void;
  /**
   * The hand shows the next move (free, no penalty). Runs at the start of a
   * first-time level 1 and whenever the child waits.
   */
  setDemo: (demo: (() => void) | null) => void;
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
  /** Extra screens: "#/<id>/<name>/…" → render(root, rest); returns cleanup. */
  routes?: Record<string, (root: HTMLElement, rest: string[]) => () => void>;
  /** Shown above the worlds on the level list (e.g. a big mode card). */
  listTop?: () => Node | null;
  /** Every world starts open; levels open one by one inside it. */
  openWorlds?: boolean;
  /**
   * Level → the level that opens it, when not the one before it in the list
   * (a world added in the middle: the old next world still opens as before).
   */
  after?: Record<string, string>;
  /**
   * The game's own first screen at "#/<id>/" (e.g. a big mode). The level
   * list then lives at "#/<id>/levels" as a second section.
   */
  home?: (root: HTMLElement) => () => void;
  /** Title of the level list when it is not the first screen. */
  listTitle?: string;
  /** Runs once before progress is first read (e.g. levels moved from another game). */
  migrate?: () => Promise<void>;
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
  const svg = svgEl("svg", { viewBox: "0 0 32 32", "aria-hidden": "true" });
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
  const base = gameProgress(def.id);
  const ready = def.migrate ? def.migrate().catch(() => undefined) : Promise.resolve();
  const store = {
    load: () => ready.then(() => base.load()),
    win: (id: string, stars: number) => ready.then(() => base.win(id, stars)),
  };
  const ids = def.levels.map((level) => level.id);
  /** Where the level list is: the first screen, or "/levels" behind `home`. */
  const LIST = def.home ? "/levels" : "/";
  const unlocked = (id: string, completed: readonly string[]): boolean => {
    if (seasonOpen(def.id, id)) return true;
    const after = def.after?.[id];
    if (after) return completed.includes(after) || completed.includes(id);
    return def.openWorlds ? isUnlockedInWorld(def.levels, id, completed) : isUnlocked(ids, id, completed);
  };
  let cleanup: (() => void) | null = null;
  let token = 0;

  function show(sub: string[]): void {
    cleanup?.();
    cleanup = null;
    // A «Новое!» bubble belongs to the screen that showed it.
    clearTips();
    root.replaceChildren();
    const mine = ++token;
    if (def.home && !sub[0]) {
      cleanup = def.home(root);
      document.body.dataset.route = "levels";
      return;
    }
    const route = sub[0] ? def.routes?.[sub[0]] : undefined;
    if (route) {
      cleanup = route(root, sub.slice(1));
      return;
    }
    if (sub[0] === "play") {
      const index = Number(sub[1]) - 1;
      const level = def.levels[index];
      if (!level) {
        navigateGame(def.id, LIST, { replace: true });
        return;
      }
      void Promise.all([store.load(), loadSeen()]).then(([progress, seen]) => {
        if (mine !== token) return;
        if (!unlocked(level.id, progress.completed)) {
          navigateGame(def.id, LIST, { replace: true });
          return;
        }
        // The guided start runs once per game (again after «Показать подсказки снова»).
        const tutorial = index === 0 && !progress.completed.includes(level.id) && !seen.tips.includes(`tutorial:${def.id}`);
        cleanup = renderPlay(level, index, tutorial);
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
      toolbar(def.home ? (def.listTitle ?? def.title) : def.title, def.home ? () => navigateGame(def.id, "/") : goHome, score),
      el("p", { class: "list__lead", text: def.subtitle }),
      def.listTop?.() ?? null,
      sections,
    ]);
    root.append(view);
    let stopMark = (): void => {};
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
      // v12: a sticky strip of world chips to jump to a world (3+ worlds).
      const chips: Array<{ chip: HTMLElement; section: HTMLElement }> = [];
      const named = groups.filter((g) => g.world).length;
      const strip = named >= 3 ? el("nav", { class: "world-chips", attrs: { "aria-label": "Миры" } }) : null;
      if (strip) sections.before(strip);
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
        // v13: a world that just opened (its first level is playable) greets once with a soft glow.
        if (group.world && groups[0] !== group && !def.openWorlds && unlocked(groupIds[0]!, progress.completed)) {
          const key = `world:${def.id}:${group.world.id}`;
          void wasOpened(key).then((seen) => {
            if (seen || stale()) return;
            section.classList.add("is-fresh");
            section.querySelector(".world__head")?.append(el("span", { class: "world__new", text: "Новое!" }));
            void markOpened(key, false);
          });
        }
        if (strip && group.world) {
          const w = group.world;
          const got = totalStars(progress.stars, groupIds);
          const chip = el(
            "button",
            {
              class: "world-chip",
              style: { "--world": w.color },
              attrs: { type: "button", "aria-label": `${w.title}: ★ ${got} из ${groupIds.length * 3}` },
              on: {
                click: () => {
                  audio.unlock();
                  audio.play("tap");
                  section.scrollIntoView({ block: "start", behavior: reducedMotion() ? "auto" : "smooth" });
                },
              },
            },
            [el("span", { class: "world-chip__name", text: w.title }), el("span", { class: "world-chip__stars", text: `★${got}` })],
          );
          strip.append(chip);
          chips.push({ chip, section });
        }
      }
      if (strip) {
        // The chip of the world on screen lights up (and scrolls into the strip).
        let current: HTMLElement | null = null;
        const mark = (): void => {
          const line = strip.getBoundingClientRect().bottom + 24;
          let on = chips[0];
          for (const c of chips) if (c.section.getBoundingClientRect().top <= line) on = c;
          if (!on || on.chip === current) return;
          current?.classList.remove("is-on");
          current?.removeAttribute("aria-current");
          current = on.chip;
          current.classList.add("is-on");
          current.setAttribute("aria-current", "true");
          const sr = strip.getBoundingClientRect();
          const cr = current.getBoundingClientRect();
          if (cr.left < sr.left || cr.right > sr.right) strip.scrollTo({ left: strip.scrollLeft + cr.left - sr.left - 12, behavior: "auto" });
        };
        for (const c of chips) c.chip.addEventListener("click", () => c.chip.blur());
        // The list may scroll inside the screen or as the whole page.
        document.addEventListener("scroll", mark, { capture: true, passive: true });
        stopMark = () => document.removeEventListener("scroll", mark, { capture: true });
        requestAnimationFrame(mark);
      }
      (focus as HTMLElement | null)?.scrollIntoView({ block: "center" });
    });
    return () => {
      stopMark();
      view.remove();
    };
  }

  function levelCard(level: L, index: number, progress: Progress): HTMLElement {
    const open = unlocked(level.id, progress.completed);
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

  function renderPlay(level: L, index: number, tutorial: boolean): () => void {
    const tool = el("span", { class: "toolbar__tools" });
    const hintBtn = el(
      "button",
      { class: "btn btn--back btn--hint", attrs: { type: "button", "aria-label": "Подсказка", hidden: true } },
      [lampIcon()],
    );
    tool.append(hintBtn);
    const bar = toolbar(`${index + 1}. ${level.title}`, () => navigateGame(def.id, LIST), tool);
    const stage = el("div", { class: "stage" });
    const view = el("div", { class: `screen screen--play game--${def.id}` }, [bar, stage]);
    root.append(view);
    let won = false;
    let onHint: (() => void) | null = null;
    let demo: (() => void) | null = null;
    const scope = createScope();
    const runDemo = (): void => {
      if (!won && view.isConnected && !document.querySelector(".ht")) demo?.();
    };
    hintBtn.addEventListener("click", () => {
      if (!onHint || won) return;
      audio.unlock();
      audio.play("tap");
      replayClass(hintBtn, "is-used");
      audio.say("v06");
      onHint();
    });
    const api: PlayApi = {
      win: (score, text, picture) => {
        if (won) return;
        const stars = isScore(score) ? score.stars : score;
        const why = isScore(score) ? score.why : undefined;
        won = true;
        document.body.classList.remove("is-tutorial");
        clearTips();
        hintBtn.hidden = true;
        audio.play("win");
        const fresh = store
          .win(level.id, stars)
          .then(() => newStickers())
          .catch(() => [] as Sticker[]);
        const rest = countWin();
        const next = def.levels[index + 1];
        const actions = [
          next
            ? { label: "Дальше", primary: true, onClick: () => navigateGame(def.id, `/play/${index + 2}`) }
            : {
                label: "Все игры",
                primary: true,
                onClick: () => {
                  audio.say("v12");
                  goHome();
                },
              },
          { label: "Ещё раз", onClick: () => navigateGame(def.id, `/play/${index + 1}`) },
          { label: "Уровни", onClick: () => navigateGame(def.id, LIST) },
        ];
        // The level's own picture (e.g. a letter's word) or its card picture —
        // what was just made or solved, not the same Рыжик on every card.
        const art = picture ?? el("span", { class: "praise__word praise__thumb", attrs: { "aria-hidden": "true" } }, [def.thumb(level, index)]);
        // Let the finishing animation be seen before the card.
        scope.later(() => {
          if (!view.isConnected) return;
          const card = praiseOverlay({
            stars,
            why,
            text: next ? text : `${text ? `${text} ` : ""}Все уровни пройдены!`,
            art,
            actions,
            voice: next ? undefined : "v09",
          });
          view.append(card);
          // v13: after several levels in a row, a short «Потрогай» break is offered (never forced).
          if (rest) {
            card.querySelector(".praise__actions")?.before(
              el("button", { class: "btn btn--ghost praise__break", attrs: { type: "button" }, on: { click: () => showBreak(view) } }, [
                el("span", { text: "Передохнуть: потрогай игрушки" }),
              ]),
            );
          }
          // A new sticker for the album, if the stars opened one.
          void fresh.then((list) => {
            const s = list[list.length - 1];
            const actionsRow = card.querySelector(".praise__actions");
            if (!s || !actionsRow || !card.isConnected) return;
            actionsRow.before(
              el("a", { class: "praise__sticker", attrs: { href: "#/albom", "aria-label": `Новая наклейка: ${s.name}` } }, [
                el("span", { class: "sticker sticker--new" }, [stickerArt(s)]),
                el("span", { class: "praise__sticker-text", text: list.length > 1 ? `Новые наклейки: ${list.length}!` : "Новая наклейка!" }),
              ]),
            );
            scope.later(() => card.isConnected && audio.play("sparkle"), 1200);
          });
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
      setDemo: (fn) => {
        demo = fn;
      },
    };
    const stop = def.play(stage, level, index, api);

    // Level 1 the first time: a guided start. The hand shows the move right
    // away and again after short pauses; the lamp and extra buttons appear
    // after the child has made a couple of moves.
    let stopIdle: () => void;
    if (tutorial) {
      document.body.classList.add("is-tutorial");
      let moves = 0;
      const onUp = (): void => {
        if (++moves < 2) return;
        stage.removeEventListener("pointerup", onUp);
        document.body.classList.remove("is-tutorial");
        void markSeen("tips", `tutorial:${def.id}`);
        scope.later(() => !won && !hintBtn.hidden && tipOnce("hint-lamp", hintBtn, "Лампочка подскажет, если трудно"), 600);
      };
      stage.addEventListener("pointerup", onUp);
      scope.later(() => afterHowTo(() => {
        // The «Как играть» card may close after the child already left.
        if (scope.disposed) return;
        audio.say("v07");
        runDemo();
      }), 900);
      stopIdle = whenIdle(runDemo, 3500);
    } else {
      stopIdle = whenIdle(runDemo, 7000);
      scope.later(() => !hintBtn.hidden && tipOnce("hint-lamp", hintBtn, "Лампочка подскажет, если трудно"), 1500);
    }
    const tip = LEVEL_TIPS[def.id]?.[level.id];
    if (tip) scope.later(() => afterHowTo(() => tipOnce(`${def.id}:${level.id}`, stage.querySelector(tip.at) ?? stage, tip.text)), 1300);

    return () => {
      stopIdle();
      scope.dispose();
      document.body.classList.remove("is-tutorial");
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
  const svg = svgEl("svg", { viewBox: "0 0 32 32", class: "lock-icon", "aria-hidden": "true" });
  svg.innerHTML =
    '<rect x="7" y="14" width="18" height="14" rx="4" fill="#fffcf7" stroke="#a3490d" stroke-width="2.4"/>' +
    '<path d="M11 14v-3a5 5 0 0 1 10 0v3" fill="none" stroke="#a3490d" stroke-width="2.4"/>' +
    '<circle cx="16" cy="21" r="2.2" fill="#a3490d"/>';
  return svg;
}
