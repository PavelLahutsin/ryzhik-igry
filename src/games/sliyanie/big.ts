/**
 * «Большая игра 2048»: the real 2048 inside «Вырасти сад». A skin picker
 * ("#/sliyanie/big") and the game ("#/sliyanie/big/play"). The numbers grow
 * by doubling, so the game gets harder by itself; the skin is only pictures.
 */
import { audio, type SoundKind } from "../../shared/audio";
import { character } from "../../shared/assets";
import { el, replayClass } from "../../shared/dom";
import { showDrag, whenIdle } from "../../shared/guide";
import { afterHowTo } from "../../shared/howto";
import { createScope } from "../../shared/lifecycle";
import { platform } from "../../shared/platform";
import { navigateGame } from "../../shared/router";
import { reducedMotion } from "../../shared/style";
import { tipOnce } from "../../shared/tips";
import { hint, praiseOverlay, svgNode, toolbar } from "../../shared/ui";
import { BIG_SIZE, WIN_TIER, bestTier, bigMove, bigUndo, hasMoves, newBigGame, restoreBigGame, tileValue, type BigGame, type Dir } from "./logic";
import { SKINS, skinById, skinTier, type Skin, type SkinId } from "./skins";

const GAME = "sliyanie";
/** Stored under "ryzhik-igry:sliyanie:…" (new keys; the levels keep ":progress"). */
export const KEYS = { best: `${GAME}:best`, game: `${GAME}:big`, skin: `${GAME}:skin` } as const;
const store = platform.storage;

export async function loadBest(): Promise<number> {
  const v = await store.get<unknown>(KEYS.best);
  return typeof v === "number" && v > 0 ? Math.floor(v) : 0;
}

/** One tile picture: the skin art (or a big number) and the number in a corner. */
export function tileFace(skin: Skin, tier: number, className = ""): HTMLElement {
  const t = skinTier(skin, tier);
  const value = tileValue(tier);
  const digits = String(value).length;
  const face = el("span", { class: `sb-face ${className}`.trim(), style: { background: t.color } });
  if (t.art) {
    face.append(svgNode(t.art, "sb-face__art"), el("b", { class: "sb-num", text: String(value) }));
  } else {
    face.classList.add("sb-face--num", `sb-d${digits}`);
    if (tier >= 3) face.classList.add("is-light");
    face.append(el("b", { class: "sb-big", text: String(value) }));
  }
  return face;
}

/** The card on the level list. */
export function bigCard(): HTMLElement {
  const best = el("span", { class: "sb-card__best" });
  void Promise.all([loadBest(), store.get<unknown>(KEYS.skin)]).then(([b, id]) => {
    best.textContent = b ? `Рекорд: ${b}` : "Настоящая 2048";
    const skin = skinById(id);
    preview.replaceChildren(...[0, 5, WIN_TIER].map((t) => tileFace(skin, t, "sb-card__tile")));
  });
  const preview = el("span", { class: "sb-card__tiles", attrs: { "aria-hidden": "true" } });
  return el(
    "button",
    {
      class: "sb-card",
      attrs: { type: "button" },
      on: {
        click: () => {
          audio.unlock();
          audio.play("tap");
          navigateGame(GAME, "/big");
        },
      },
    },
    [
      preview,
      el("span", { class: "sb-card__text" }, [
        el("span", { class: "sb-card__title", text: "Большая игра 2048" }),
        el("span", { class: "sb-card__note", text: "Соединяй пары: 2, 4, 8… до 2048!" }),
        best,
      ]),
    ],
  );
}

/** "#/sliyanie/big…": the picker or the game. */
export function bigRoute(root: HTMLElement, rest: string[]): () => void {
  return rest[0] === "play" ? renderPlay(root) : renderPicker(root);
}

function renderPicker(root: HTMLElement): () => void {
  document.body.dataset.route = "levels";
  const cards = new Map<SkinId, HTMLElement>();
  const grid = el("div", { class: "sb-skins", attrs: { role: "radiogroup", "aria-label": "Картинки" } });
  const actions = el("div", { class: "sb-actions" });
  const info = el("p", { class: "sb-info" });
  const view = el("div", { class: `screen screen--list game--${GAME} sb-picker` }, [
    toolbar("Большая игра 2048", () => navigateGame(GAME, "/")),
    el("p", { class: "list__lead", text: "Выбери картинки — и в путь до 2048!" }),
    grid,
    info,
    actions,
  ]);
  root.append(view);

  const pick = (id: SkinId): void => {
    for (const [k, card] of cards) {
      card.classList.toggle("is-on", k === id);
      card.setAttribute("aria-checked", String(k === id));
    }
    void store.set(KEYS.skin, id);
  };
  for (const s of SKINS) {
    const card = el(
      "button",
      {
        class: "sb-skin",
        style: { "--skin": s.color },
        attrs: { type: "button", role: "radio", "aria-checked": "false", "aria-label": s.title },
        on: {
          click: () => {
            audio.unlock();
            audio.play("pick");
            pick(s.id);
          },
        },
      },
      [
        el("span", { class: "sb-skin__tiles", attrs: { "aria-hidden": "true" } }, [0, 3, 6, WIN_TIER].map((t) => tileFace(s, t, "sb-skin__tile"))),
        el("span", { class: "sb-skin__title", text: s.title }),
      ],
    );
    cards.set(s.id, card);
    grid.append(card);
  }

  let stale = false;
  void Promise.all([store.get<unknown>(KEYS.skin), store.get<unknown>(KEYS.game), loadBest()]).then(([id, saved, best]) => {
    if (stale) return;
    pick(skinById(id).id);
    const game = restoreBigGame(saved);
    const play = (fresh: boolean): void => {
      audio.unlock();
      audio.play("tap");
      if (fresh) void store.remove(KEYS.game).then(() => navigateGame(GAME, "/big/play"));
      else navigateGame(GAME, "/big/play");
    };
    info.textContent = [game ? `Начатая игра: ${game.score} очков` : "", best ? `Рекорд: ${best}` : ""].filter(Boolean).join(" · ");
    actions.replaceChildren(
      game
        ? el("button", { class: "btn btn--play", attrs: { type: "button" }, on: { click: () => play(false) } }, [el("span", { text: "Продолжить" })])
        : el("button", { class: "btn btn--play", attrs: { type: "button" }, on: { click: () => play(true) } }, [el("span", { text: "Играть!" })]),
      game ? el("button", { class: "btn btn--ghost", attrs: { type: "button" }, on: { click: () => play(true) } }, [el("span", { text: "Новая игра" })]) : "",
    );
  });
  return () => {
    stale = true;
    view.remove();
  };
}

/** A bigger chime for bigger numbers. */
function mergeSound(tiers: number[]): void {
  if (!tiers.length) return;
  audio.play("merge");
  const top = Math.max(...tiers);
  const extra: SoundKind | null = top >= 9 ? "magic" : top >= 7 ? "sparkle" : top >= 5 ? "ding" : null;
  if (extra) setTimeout(() => audio.play(extra), 90);
}

function renderPlay(root: HTMLElement): () => void {
  document.body.dataset.route = "play";
  const scope = createScope();
  let skin = skinById(null);
  let game: BigGame | null = null;
  let best = 0;
  let bestAtStart = 0;
  let recordShown = false;
  let seenTier = 0;
  let overlay: HTMLElement | null = null;

  const scoreNum = el("b", { class: "sb-score__num", text: "0" });
  const bestNum = el("b", { class: "sb-score__num", text: "0" });
  const undoBtn = el(
    "button",
    { class: "btn sb-btn", attrs: { type: "button", "aria-label": "Шаг назад", disabled: true }, on: { click: () => undo() } },
    [el("span", { attrs: { "aria-hidden": "true" }, text: "↶" })],
  );
  const againBtn = el(
    "button",
    { class: "btn sb-btn sb-btn--new", attrs: { type: "button", "aria-label": "Новая игра" }, on: { click: () => askNew() } },
    [el("span", { text: "Заново" })],
  );
  const scoreRow = el("div", { class: "sb-score" }, [
    el("span", { class: "sb-score__box" }, [el("span", { class: "sb-score__label", text: "Очки" }), scoreNum]),
    el("span", { class: "sb-score__box" }, [el("span", { class: "sb-score__label", text: "Рекорд" }), bestNum]),
    undoBtn,
    againBtn,
  ]);
  const chain = el("ol", { class: "sb-chain", attrs: { "aria-label": "Что вырастет: от 2 до 2048" } });
  const grid = el("div", {
    class: "sl-board sb-board",
    style: { "--n": String(BIG_SIZE) },
    attrs: { role: "application", "aria-label": "Поле. Проведи пальцем, чтобы двигать плитки", tabindex: "0" },
  });
  for (let i = 0; i < BIG_SIZE * BIG_SIZE; i++) grid.append(el("span", { class: "sl-cell" }));
  const pad = el(
    "div",
    { class: "sl-pad" },
    (
      [
        ["left", "←", "Влево"],
        ["up", "↑", "Вверх"],
        ["down", "↓", "Вниз"],
        ["right", "→", "Вправо"],
      ] as Array<[Dir, string, string]>
    ).map(([dir, arrow, label]) =>
      el(
        "button",
        { class: "btn sl-pad__btn", attrs: { type: "button", "aria-label": label }, on: { click: () => go(dir) } },
        [el("span", { attrs: { "aria-hidden": "true" }, text: arrow })],
      ),
    ),
  );
  const stage = el("div", { class: "stage sb-stage" }, [chain, scoreRow, el("div", { class: "sl-wrap sb-wrap" }, [grid]), pad]);
  const view = el("div", { class: `screen screen--play game--${GAME} sb-play` }, [
    toolbar("Большая игра 2048", () => navigateGame(GAME, "/big")),
    stage,
  ]);
  root.append(view);

  const nodes = new Map<number, HTMLElement>();
  const chainItems: HTMLElement[] = [];

  function drawChain(): void {
    chain.replaceChildren();
    chainItems.length = 0;
    for (let t = 0; t <= WIN_TIER; t++) {
      const item = el("li", { class: `sb-chain__item${t === WIN_TIER ? " is-goal" : ""}`, attrs: { title: skinTier(skin, t).name } }, [
        tileFace(skin, t, "sb-chain__face"),
      ]);
      chainItems.push(item);
      chain.append(item);
    }
  }

  function render(): void {
    if (!game) return;
    const alive = new Set<number>();
    for (const tile of game.board.tiles) {
      alive.add(tile.id);
      let node = nodes.get(tile.id);
      if (!node) {
        const t = skinTier(skin, tile.tier);
        const value = tileValue(tile.tier);
        node = el("div", { class: "sl-tile sb-tile", attrs: { role: "img", "aria-label": t.art ? `${t.name}, ${value}` : String(value) } }, [
          tileFace(skin, tile.tier, "sl-tile__art"),
        ]);
        if (tile.merged) node.classList.add("is-merged");
        if (tile.fresh) node.classList.add("is-fresh");
        if (tile.tier >= WIN_TIER) node.classList.add("is-top");
        grid.append(node);
        nodes.set(tile.id, node);
      }
      node.style.setProperty("--r", String(tile.r));
      node.style.setProperty("--c", String(tile.c));
    }
    for (const [id, node] of nodes) {
      if (!alive.has(id)) {
        node.remove();
        nodes.delete(id);
      }
    }
    const top = bestTier(game.board);
    chainItems.forEach((item, t) => item.classList.toggle("is-reached", t <= top));
    scoreNum.textContent = String(game.score);
    bestNum.textContent = String(Math.max(best, game.score));
    undoBtn.disabled = !game.prev;
  }

  function redraw(): void {
    for (const node of nodes.values()) node.remove();
    nodes.clear();
    render();
  }

  function save(): void {
    if (!game) return;
    void store.set(KEYS.game, game);
    if (game.score > best) {
      best = game.score;
      void store.set(KEYS.best, best);
    }
  }

  function closeOverlay(): void {
    overlay?.remove();
    overlay = null;
  }

  function start(fresh: BigGame): void {
    closeOverlay();
    game = fresh;
    bestAtStart = best;
    recordShown = false;
    seenTier = bestTier(game.board);
    grid.classList.remove("is-done");
    redraw();
    save();
  }

  function go(dir: Dir): void {
    if (!game || overlay) return;
    audio.unlock();
    const res = bigMove(game, dir, Math.random);
    if (!res.moved) {
      replayClass(grid, "is-bump");
      return;
    }
    game = res.game;
    mergeSound(res.mergedTiers);
    render();
    save();
    const top = bestTier(game.board);
    if (top > seenTier) {
      seenTier = top;
      if (top >= 3 && top < WIN_TIER) {
        const t = skinTier(skin, top);
        hint(stage, t.art ? `Новое: ${t.name.toLowerCase()} — ${tileValue(top)}!` : `Новое: ${tileValue(top)}!`, 1400);
      }
    }
    if (!recordShown && bestAtStart > 0 && game.score > bestAtStart) {
      recordShown = true;
      scope.later(() => hint(stage, "Новый рекорд!", 1400), 300);
    }
    if (res.justWon) {
      scope.later(showWin, reducedMotion() ? 100 : 500);
      return;
    }
    if (!hasMoves(game)) scope.later(showStuck, 600);
  }

  function undo(): void {
    if (!game?.prev || overlay) return;
    audio.unlock();
    audio.play("tap");
    game = bigUndo(game);
    seenTier = bestTier(game.board);
    redraw();
    save();
    hint(stage, "Шаг назад!", 1000);
  }

  let armed = false;
  function askNew(): void {
    if (overlay) return;
    audio.unlock();
    audio.play("tap");
    if (!armed && game && game.score > 0) {
      armed = true;
      againBtn.firstElementChild!.textContent = "Точно?";
      againBtn.classList.add("is-armed");
      scope.later(() => {
        armed = false;
        againBtn.firstElementChild!.textContent = "Заново";
        againBtn.classList.remove("is-armed");
      }, 3000);
      return;
    }
    armed = false;
    againBtn.firstElementChild!.textContent = "Заново";
    againBtn.classList.remove("is-armed");
    start(newBigGame(Math.random));
  }

  function showWin(): void {
    if (!game || !view.isConnected) return;
    grid.classList.add("is-done");
    audio.play("win");
    const top = skinTier(skin, WIN_TIER);
    const art = el("span", { class: "sb-win__art" }, [
      tileFace(skin, WIN_TIER, "sb-win__tile"),
      el("img", { class: "sb-win__fox", attrs: { src: character("ryzhik"), alt: "", draggable: "false" } }),
    ]);
    overlay = praiseOverlay({
      title: "2048!",
      text: `${top.art ? `${top.name}! ` : ""}Ты дошёл до 2048. Очки: ${game.score}.`,
      art,
      voice: "v09",
      actions: [
        {
          label: "Играть дальше",
          primary: true,
          onClick: () => {
            closeOverlay();
            grid.classList.remove("is-done");
            grid.focus({ preventScroll: true });
            if (game && !hasMoves(game)) scope.later(showStuck, 300);
          },
        },
        { label: "Новая игра", onClick: () => start(newBigGame(Math.random)) },
        { label: "Картинки", onClick: () => navigateGame(GAME, "/big") },
      ],
    });
    view.append(overlay);
  }

  function showStuck(): void {
    if (!game || !view.isConnected || overlay || hasMoves(game)) return;
    const top = bestTier(game.board);
    const t = skinTier(skin, top);
    const record = game.score > bestAtStart && bestAtStart > 0;
    const actions = [
      { label: "Ещё раз", primary: true, onClick: () => start(newBigGame(Math.random)) },
      game.prev
        ? {
            label: "Шаг назад",
            onClick: () => {
              closeOverlay();
              undo();
            },
          }
        : null,
      { label: "Картинки", onClick: () => navigateGame(GAME, "/big") },
    ].filter((a): a is NonNullable<typeof a> => a !== null);
    overlay = praiseOverlay({
      title: "Ходов больше нет",
      text: `${record ? "Новый рекорд! " : ""}Ты собрал ${t.art ? `«${t.name}» — ` : ""}${tileValue(top)}. Очки: ${game.score}.`,
      art: tileFace(skin, top, "sb-win__tile"),
      actions,
    });
    view.append(overlay);
  }

  // Swipes and arrow keys.
  let from: { x: number; y: number; id: number } | null = null;
  grid.style.touchAction = "none";
  grid.addEventListener("pointerdown", (event) => {
    from = { x: event.clientX, y: event.clientY, id: event.pointerId };
  });
  scope.listen<PointerEvent>(window, "pointerup", (event) => {
    if (!from || event.pointerId !== from.id) return;
    const dx = event.clientX - from.x;
    const dy = event.clientY - from.y;
    from = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    go(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
  });
  const keys: Record<string, Dir> = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
  scope.listen<KeyboardEvent>(window, "keydown", (event) => {
    const dir = keys[event.key];
    if (!dir || document.querySelector(".ht")) return;
    event.preventDefault();
    go(dir);
  });

  // The hand shows a swipe until the first points.
  const stopIdle = whenIdle(() => {
    if (!game || game.score > 0 || overlay || !view.isConnected || document.querySelector(".ht")) return;
    const r = grid.getBoundingClientRect();
    const k = r.width * 0.28;
    showDrag({ x: r.left + r.width / 2 - k, y: r.top + r.height / 2 }, { x: r.left + r.width / 2 + k, y: r.top + r.height / 2 });
  }, 5000);
  scope.add(stopIdle);

  void Promise.all([store.get<unknown>(KEYS.skin), store.get<unknown>(KEYS.game), loadBest()]).then(([id, saved, b]) => {
    if (scope.disposed) return;
    skin = skinById(id);
    view.classList.add(`sb-skin--${skin.id}`);
    best = b;
    drawChain();
    const restored = restoreBigGame(saved);
    if (restored) {
      game = restored;
      bestAtStart = best;
      seenTier = bestTier(game.board);
      render();
      if (!hasMoves(game)) scope.later(showStuck, 400);
    } else start(newBigGame(Math.random));
    scope.later(() => afterHowTo(() => !scope.disposed && tipOnce("sliyanie:big", chain, "Две одинаковые плитки — одна вдвое больше. Дойди до 2048!")), 900);
  });

  return () => {
    scope.dispose();
    view.remove();
  };
}
