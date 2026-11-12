import { audio } from "../../shared/audio";
import { showDrag } from "../../shared/guide";
import { character } from "../../shared/assets";
import { el, replayClass } from "../../shared/dom";
import { createScope } from "../../shared/lifecycle";
import { mountLevelGame, type PlayApi } from "../../shared/levelgame";
import { reducedMotion, useStyles } from "../../shared/style";
import { hint, svgNode } from "../../shared/ui";
import baseCss from "../../shared/base.css?inline";
import css from "./style.css?inline";
import { CHAIN_ART, GARDEN_BACK, WINTER_ART, WINTER_BACK } from "./art";
import { CHAINS, levels, worlds, type ChainId, type SliyanieLevel } from "./levels";
import { bigHome, bigRoute } from "./big";
import { navigateGame } from "../../shared/router";
import { starSummary } from "../../shared/levelgame";
import { bestTier, canMove, emptyBoard, move, spawn, starsFor, unstick, type Board, type Dir } from "./logic";

const MAX = CHAINS.sad.length - 1;
const ART: Record<ChainId, { steps: string[]; back: string }> = {
  sad: { steps: CHAIN_ART, back: GARDEN_BACK },
  zima: { steps: WINTER_ART, back: WINTER_BACK },
};

/**
 * «Вырасти сад»: one game. The first screen is the 2048 mode with a picture
 * picker (big.ts); the short picture levels are a second section,
 * «Тренировка для малышей» ("#/sliyanie/levels").
 */
export function mount(root: HTMLElement): () => void {
  useStyles(baseCss, css);
  return mountLevelGame(
    {
      id: "sliyanie",
      title: "Вырасти сад",
      subtitle: "Короткие уровни с картинками: семечко → росток → цветок…",
      levels,
      worlds,
      thumb: (level) => stepArt(level.chain, level.goal, "sl-thumb"),
      caption: (level) => CHAINS[level.chain][level.goal]!.name,
      play,
      routes: { big: bigRoute },
      home: (root) => bigHome(root, trainingCard),
      listTitle: TRAINING,
    },
    root,
  );
}

const TRAINING = "Тренировка для малышей";

/** Under the 2048 picker: the way to the short levels. */
function trainingCard(): HTMLElement {
  const stars = el("span", { class: "sb-card__best" });
  void starSummary("sliyanie", levels.map((l) => l.id)).then((s) => {
    stars.textContent = `★ ${s.got} из ${s.max}`;
  });
  return el(
    "button",
    {
      class: "sb-card sl-train",
      attrs: { type: "button" },
      on: {
        click: () => {
          audio.unlock();
          audio.play("tap");
          navigateGame("sliyanie", "/levels");
        },
      },
    },
    [
      el("span", { class: "sb-card__tiles", attrs: { "aria-hidden": "true" } }, [0, 2, 4].map((t) => stepArt("sad", t, "sb-card__tile"))),
      el("span", { class: "sb-card__text" }, [
        el("span", { class: "sb-card__title", text: TRAINING }),
        el("span", { class: "sb-card__note", text: `${levels.length} коротких уровней: вырасти цветок, яблоню, снеговика` }),
        stars,
      ]),
    ],
  );
}

/** Picture of one chain step. */
export function stepArt(chain: ChainId, tier: number, className = ""): HTMLElement {
  if (tier < MAX) {
    const node = svgNode(ART[chain].steps[tier]!, className);
    node.style.background = CHAINS[chain][tier]!.color;
    return node;
  }
  const wrap = el("span", { class: `sl-final ${className}`.trim(), attrs: { "aria-hidden": "true" } });
  wrap.append(
    svgNode(ART[chain].back, "sl-final__back"),
    el("img", { class: "sl-final__fox", attrs: { src: character("ryzhik"), alt: "", draggable: "false" } }),
  );
  return wrap;
}

function play(stage: HTMLElement, level: SliyanieLevel, _index: number, api: PlayApi): () => void {
  const scope = createScope();
  let board: Board = spawn(spawn(emptyBoard(level.size), Math.random, 0), Math.random, 0);
  let helps = 0;
  let busy = false;
  let done = false;
  let seen = bestTier(board);
  const CHAIN = CHAINS[level.chain];
  const art = (tier: number, cls: string): HTMLElement => stepArt(level.chain, tier, cls);
  // One step back (the hint lamp), remembered before each move.
  let previous: Board | null = null;

  // Chain strip up to the goal, so the child sees what grows next.
  const strip = el("ol", { class: "sl-chain", attrs: { "aria-label": "Что вырастет" } });
  const stripItems = CHAIN.slice(0, level.goal + 1).map((step, tier) => {
    const item = el("li", { class: `sl-chain__item${tier === level.goal ? " is-goal" : ""}`, attrs: { title: step.name } }, [
      art(tier, "sl-chain__art"),
    ]);
    strip.append(item);
    return item;
  });
  const goalText = el("p", { class: "sl-goal" }, [
    "Вырасти: ",
    el("strong", { text: CHAIN[level.goal]!.name }),
  ]);

  const grid = el("div", {
    class: "sl-board",
    style: { "--n": String(level.size) },
    attrs: { role: "application", "aria-label": "Поле. Проведи пальцем, чтобы двигать картинки", tabindex: "0" },
  });
  for (let i = 0; i < level.size * level.size; i++) grid.append(el("span", { class: "sl-cell" }));
  const help = el(
    "button",
    { class: "btn btn--play sl-help", attrs: { type: "button", hidden: true }, on: { click: () => doHelp() } },
    [el("span", { text: "Перемешаем!" })],
  );
  const boardWrap = el("div", { class: "sl-wrap" }, [grid, help]);

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

  stage.append(el("div", { class: "sl-top" }, [strip, goalText]), boardWrap, pad);

  const nodes = new Map<number, HTMLElement>();

  function render(): void {
    const alive = new Set<number>();
    for (const tile of board.tiles) {
      alive.add(tile.id);
      let node = nodes.get(tile.id);
      if (!node) {
        node = el("div", { class: "sl-tile", attrs: { "aria-label": CHAIN[tile.tier]!.name, role: "img" } }, [
          art(tile.tier, "sl-tile__art"),
        ]);
        if (tile.merged) node.classList.add("is-merged");
        if (tile.fresh) node.classList.add("is-fresh");
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
    const best = bestTier(board);
    stripItems.forEach((item, tier) => item.classList.toggle("is-reached", tier <= best));
    help.hidden = done || canMove(board, MAX);
    api.setHint(previous && !done ? undo : null);
  }

  // The hand shows a swipe that joins two same pictures (or at least moves).
  api.setDemo(() => {
    if (busy || done) return;
    const dirs: Dir[] = ["left", "right", "up", "down"];
    const tries = dirs.map((d) => ({ d, r: move(board, d, level.goal) }));
    const pick = tries.find((t) => t.r.mergedTiers.length) ?? tries.find((t) => t.r.moved);
    if (!pick) return;
    const r = grid.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const k = r.width * 0.28;
    const v = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] }[pick.d];
    showDrag({ x: cx - v[0]! * k, y: cy - v[1]! * k }, { x: cx + v[0]! * k, y: cy + v[1]! * k });
  });

  function undo(): void {
    if (!previous || busy || done) return;
    helps++;
    audio.play("tap");
    audio.say("v17");
    board = previous;
    previous = null;
    for (const node of nodes.values()) node.remove();
    nodes.clear();
    render();
    hint(stage, "Шаг назад!", 1000);
  }

  function go(dir: Dir): void {
    if (busy || done) return;
    audio.unlock();
    const res = move(board, dir, MAX);
    if (!res.moved) {
      replayClass(grid, "is-bump");
      return;
    }
    busy = true;
    previous = board;
    board = res.board;
    if (res.mergedTiers.length) audio.play("merge");
    render();
    const best = bestTier(board);
    if (best > seen) {
      seen = best;
      if (best < level.goal) hint(stage, `Новое: ${CHAIN[best]!.name.toLowerCase()}!`, 1400);
    }
    if (best >= level.goal) {
      done = true;
      busy = false;
      grid.classList.add("is-done");
      help.hidden = true;
      api.win(starsFor(helps), level.done);
      return;
    }
    scope.later(
      () => {
        board = spawn(board, Math.random);
        render();
        busy = false;
      },
      reducedMotion() ? 0 : 130,
    );
  }

  function doHelp(): void {
    helps++;
    audio.play("tap");
    previous = null;
    board = unstick(board, MAX, Math.random);
    for (const node of nodes.values()) node.remove();
    nodes.clear();
    render();
  }

  // Swipes on the board.
  let start: { x: number; y: number; id: number } | null = null;
  const down = (event: PointerEvent): void => {
    start = { x: event.clientX, y: event.clientY, id: event.pointerId };
  };
  const up = (event: PointerEvent): void => {
    if (!start || event.pointerId !== start.id) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    start = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    go(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
  };
  const keys: Record<string, Dir> = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
  const key = (event: KeyboardEvent): void => {
    const dir = keys[event.key];
    if (!dir) return;
    event.preventDefault();
    go(dir);
  };
  grid.style.touchAction = "none";
  grid.addEventListener("pointerdown", down);
  scope.listen(window, "pointerup", up);
  scope.listen(window, "keydown", key);

  render();
  return scope.dispose;
}
