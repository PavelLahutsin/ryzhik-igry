import { audio } from "../../shared/audio";
import { character } from "../../shared/assets";
import { el } from "../../shared/dom";
import { mountLevelGame, type PlayApi } from "../../shared/levelgame";
import { OBJECTS } from "../../shared/objects";
import { useStyles } from "../../shared/style";
import { hint, svgNode } from "../../shared/ui";
import baseCss from "../../shared/base.css?inline";
import css from "./style.css?inline";
import { levels, worlds, type LabLevel } from "./levels";
import { E, S, canStep, fitMaze, makeMaze, placeApples, solve, walkToward, type Cell, type Maze } from "./maze";

/** «Лабиринт»: lead Ryzhik through the maze, picking up apples on the way. */
export function mount(root: HTMLElement): () => void {
  useStyles(baseCss, css);
  return mountLevelGame(
    {
      id: "labirint",
      title: "Лабиринт",
      subtitle: "Проведи Рыжика пальцем по дорожке",
      levels,
      worlds,
      thumb: (level) =>
        el("span", { class: "lb-thumb" }, [
          el("img", { attrs: { src: character(level.goal), alt: "", draggable: "false" } }),
          ...(level.apples ? [svgNode(OBJECTS.apple.svg, "lb-thumb__apple")] : []),
        ]),
      caption: (level) => `${level.cols}×${level.rows}${level.apples ? ` · яблок: ${level.apples}` : ""}`,
      play,
    },
    root,
  );
}

const same = (a: Cell, b: Cell): boolean => a.c === b.c && a.r === b.r;

/** Walls as one SVG path, in cell units ×10. */
function wallsPath(maze: Maze): string {
  const { cols, rows, open } = maze;
  let d = `M0 0 H${cols * 10} V${rows * 10} H0 Z`;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = open[r * cols + c]!;
      if (c < cols - 1 && !(v & E)) d += ` M${(c + 1) * 10} ${r * 10} V${(r + 1) * 10}`;
      if (r < rows - 1 && !(v & S)) d += ` M${c * 10} ${(r + 1) * 10} H${(c + 1) * 10}`;
    }
  }
  return d;
}

function play(stage: HTMLElement, level: LabLevel, _index: number, api: PlayApi): () => void {
  // Lie the maze the long way along the screen.
  const box = stage.getBoundingClientRect();
  const { cols, rows } = fitMaze(level.cols, level.rows, box.width, box.height - 40);
  const maze = makeMaze(cols, rows, Math.random);
  const start: Cell = { c: 0, r: 0 };
  const goal: Cell = { c: cols - 1, r: rows - 1 };
  const apples = placeApples(maze, level.apples, start, goal, Math.random);
  const got = new Set<number>();
  let at = start;
  let hints = 0;
  let done = false;
  const trail: Cell[] = [start];

  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", `-2 -2 ${cols * 10 + 4} ${rows * 10 + 4}`);
  svg.setAttribute("class", "lb-svg");
  svg.innerHTML =
    `<rect x="0" y="0" width="${cols * 10}" height="${rows * 10}" rx="2" fill="#e9f7dc"/>` +
    `<polyline class="lb-hint" points="" fill="none"/>` +
    `<polyline class="lb-trail" points="" fill="none"/>` +
    `<path class="lb-walls" d="${wallsPath(maze)}" fill="none"/>`;
  const trailLine = svg.querySelector<SVGPolylineElement>(".lb-trail")!;
  const hintLine = svg.querySelector<SVGPolylineElement>(".lb-hint")!;

  const board = el("div", {
    class: "lb-board",
    style: { "--cols": String(cols), "--rows": String(rows) },
    attrs: { role: "application", "aria-label": "Лабиринт. Веди Рыжика пальцем или стрелками", tabindex: "0" },
  });
  board.append(svg);
  const place = (node: HTMLElement, cell: Cell): void => {
    node.style.left = `${((cell.c * 10 + 2) / (cols * 10 + 4)) * 100}%`;
    node.style.top = `${((cell.r * 10 + 2) / (rows * 10 + 4)) * 100}%`;
  };
  const cellW = `${(10 / (cols * 10 + 4)) * 100}%`;
  const cellH = `${(10 / (rows * 10 + 4)) * 100}%`;
  const sprite = (cls: string, child: Node, cell: Cell): HTMLElement => {
    const node = el("div", { class: `lb-sprite ${cls}`, style: { width: cellW, height: cellH } }, [child]);
    place(node, cell);
    board.append(node);
    return node;
  };
  const appleNodes = apples.map((cell) => sprite("lb-apple", svgNode(OBJECTS.apple.svg), cell));
  const friend = sprite(
    "lb-friend",
    el("img", { attrs: { src: character(level.goal), alt: "", draggable: "false" } }),
    goal,
  );
  const fox = sprite("lb-fox", el("img", { attrs: { src: character("ryzhik"), alt: "Рыжик", draggable: "false" } }), start);

  const counter = el("span", { class: "lb-count" });
  const paintCount = (): void => {
    counter.replaceChildren(svgNode(OBJECTS.apple.svg, "lb-count__apple"), document.createTextNode(` ${got.size} из ${apples.length}`));
  };
  const wrap = el("div", { class: "lb-wrap" }, [board]);
  const ask = el("p", { class: "lb-ask" }, [
    level.apples ? `Собери ${level.apples === 1 ? "яблоко" : "яблоки"} и иди к другу` : "Проведи Рыжика по дорожке к другу",
  ]);
  if (apples.length) {
    paintCount();
    ask.append(counter);
  }
  stage.append(ask, wrap);

  const pts = (cells: Cell[]): string => cells.map((x) => `${x.c * 10 + 5},${x.r * 10 + 5}`).join(" ");

  function stepTo(next: Cell): void {
    if (done) return;
    // Going back along the trail shortens it, so the line shows the way home.
    const prev = trail[trail.length - 2];
    if (prev && same(prev, next)) trail.pop();
    else trail.push(next);
    if (next.c !== at.c) fox.classList.toggle("is-left", next.c < at.c);
    at = next;
    place(fox, at);
    trailLine.setAttribute("points", pts(trail));
    audio.play("tap");
    apples.forEach((a, i) => {
      if (!got.has(i) && same(a, at)) {
        got.add(i);
        appleNodes[i]!.classList.add("is-got");
        audio.play("snap");
        paintCount();
      }
    });
    if (same(at, goal)) {
      if (got.size < apples.length) {
        hint(stage, `Сначала собери все яблоки! Осталось: ${apples.length - got.size}`, 2000);
        return;
      }
      done = true;
      friend.classList.add("is-met");
      fox.classList.add("is-met");
      api.setHint(null);
      api.win(Math.max(1, 3 - hints), level.done);
    }
  }

  function walk(target: Cell): void {
    if (done) return;
    for (const cell of walkToward(maze, at, target)) stepTo(cell);
  }

  function bump(): void {
    board.classList.remove("is-bump");
    void board.offsetWidth;
    board.classList.add("is-bump");
  }

  function cellAt(event: PointerEvent): Cell | null {
    const r = svg.getBoundingClientRect();
    const unitX = r.width / (cols * 10 + 4);
    const unitY = r.height / (rows * 10 + 4);
    const c = Math.floor((event.clientX - r.left - 2 * unitX) / (10 * unitX));
    const row = Math.floor((event.clientY - r.top - 2 * unitY) / (10 * unitY));
    if (c < 0 || row < 0 || c >= cols || row >= rows) return null;
    return { c, r: row };
  }

  // Finger: press anywhere and move; Ryzhik follows through open corridors.
  let pointer: number | null = null;
  const down = (event: PointerEvent): void => {
    audio.unlock();
    pointer = event.pointerId;
    board.setPointerCapture?.(event.pointerId);
    const cell = cellAt(event);
    if (cell && !same(cell, at)) {
      const before = at;
      walk(cell);
      if (same(before, at) && Math.abs(cell.c - at.c) + Math.abs(cell.r - at.r) === 1) bump();
    }
    event.preventDefault();
  };
  const move = (event: PointerEvent): void => {
    if (event.pointerId !== pointer) return;
    const cell = cellAt(event);
    if (cell && !same(cell, at)) walk(cell);
  };
  const up = (event: PointerEvent): void => {
    if (event.pointerId === pointer) pointer = null;
  };
  board.addEventListener("pointerdown", down);
  board.addEventListener("pointermove", move);
  board.addEventListener("pointerup", up);
  board.addEventListener("pointercancel", up);

  const keys: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  const key = (event: KeyboardEvent): void => {
    const d = keys[event.key];
    if (!d) return;
    event.preventDefault();
    const next = { c: at.c + d[0], r: at.r + d[1] };
    if (canStep(maze, at, next)) stepTo(next);
    else bump();
  };
  window.addEventListener("keydown", key);

  // Hint: the way to the next apple (or the friend) shows for a moment.
  let hintTimer = 0;
  api.setHint(() => {
    if (done) return;
    const targets = apples.filter((_, i) => !got.has(i));
    const target = targets.length
      ? targets.reduce((best, a) => (solve(maze, at, a).length < solve(maze, at, best).length ? a : best))
      : goal;
    hints++;
    hintLine.setAttribute("points", pts(solve(maze, at, target)));
    hintLine.classList.remove("is-on");
    void hintLine.getBoundingClientRect();
    hintLine.classList.add("is-on");
    clearTimeout(hintTimer);
    hintTimer = window.setTimeout(() => hintLine.classList.remove("is-on"), 2200);
  });

  return () => {
    clearTimeout(hintTimer);
    window.removeEventListener("keydown", key);
  };
}
