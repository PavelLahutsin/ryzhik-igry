import { audio } from "../../shared/audio";
import { character } from "../../shared/assets";
import { el } from "../../shared/dom";
import { mountLevelGame, type PlayApi } from "../../shared/levelgame";
import { reducedMotion, useStyles } from "../../shared/style";
import { hint, svgNode } from "../../shared/ui";
import baseCss from "../../shared/base.css?inline";
import css from "./style.css?inline";
import { CHAIN_ART, GARDEN_BACK } from "./art";
import { CHAIN, levels, type SliyanieLevel } from "./levels";
import { bestTier, canMove, emptyBoard, move, spawn, starsFor, unstick, type Board, type Dir } from "./logic";

const MAX = CHAIN.length - 1;

/** «Вырасти сад»: 2048 without numbers. */
export function mount(root: HTMLElement): () => void {
  useStyles(baseCss, css);
  return mountLevelGame(
    {
      id: "sliyanie",
      title: "Вырасти сад",
      subtitle: "Соедини две одинаковые картинки",
      levels,
      thumb: (level) => stepArt(level.goal, "sl-thumb"),
      caption: (level) => CHAIN[level.goal]!.name,
      play,
    },
    root,
  );
}

/** Picture of one chain step. */
export function stepArt(tier: number, className = ""): HTMLElement {
  if (tier < MAX) {
    const node = svgNode(CHAIN_ART[tier]!, className);
    node.style.background = CHAIN[tier]!.color;
    return node;
  }
  const wrap = el("span", { class: `sl-final ${className}`.trim(), attrs: { "aria-hidden": "true" } });
  wrap.append(
    svgNode(GARDEN_BACK, "sl-final__back"),
    el("img", { class: "sl-final__fox", attrs: { src: character("ryzhik"), alt: "", draggable: "false" } }),
  );
  return wrap;
}

function play(stage: HTMLElement, level: SliyanieLevel, _index: number, api: PlayApi): () => void {
  let board: Board = spawn(spawn(emptyBoard(level.size), Math.random, 0), Math.random, 0);
  let helps = 0;
  let busy = false;
  let done = false;
  let seen = bestTier(board);

  // Chain strip up to the goal, so the child sees what grows next.
  const strip = el("ol", { class: "sl-chain", attrs: { "aria-label": "Что вырастет" } });
  const stripItems = CHAIN.slice(0, level.goal + 1).map((step, tier) => {
    const item = el("li", { class: `sl-chain__item${tier === level.goal ? " is-goal" : ""}`, attrs: { title: step.name } }, [
      stepArt(tier, "sl-chain__art"),
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
          stepArt(tile.tier, "sl-tile__art"),
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
  }

  function go(dir: Dir): void {
    if (busy || done) return;
    audio.unlock();
    const res = move(board, dir, MAX);
    if (!res.moved) {
      grid.classList.remove("is-bump");
      void grid.offsetWidth;
      grid.classList.add("is-bump");
      return;
    }
    busy = true;
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
    setTimeout(
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
  window.addEventListener("pointerup", up);
  window.addEventListener("keydown", key);

  render();
  return () => {
    window.removeEventListener("pointerup", up);
    window.removeEventListener("keydown", key);
  };
}
