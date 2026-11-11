import { audio } from "../../shared/audio";
import { centre, showDrag } from "../../shared/guide";
import { el } from "../../shared/dom";
import { draggable } from "../../shared/drag";
import { createScope } from "../../shared/lifecycle";
import { mountLevelGame, type PlayApi } from "../../shared/levelgame";
import { useStyles } from "../../shared/style";
import { hint } from "../../shared/ui";
import baseCss from "../../shared/base.css?inline";
import css from "./style.css?inline";
import { levels, pictureUrl, pieceWord, worlds, type MozaikaLevel } from "./levels";
import { hintPiece, layout, makePieces, scatter, slotOf, snaps, starsFor, type Layout } from "./logic";

/** «Мозаика»: a picture cut into big rectangles; drag each one home. */
export function mount(root: HTMLElement): () => void {
  useStyles(baseCss, css);
  return mountLevelGame(
    {
      id: "mozaika",
      title: "Мозаика",
      subtitle: "Собери картинку",
      levels,
      worlds,
      thumb: (level) => el("img", { attrs: { src: pictureUrl(level), alt: "", draggable: "false", loading: "lazy" } }),
      caption: (level) => pieceWord(level.cols * level.rows),
      play,
    },
    root,
  );
}

function play(stage: HTMLElement, level: MozaikaLevel, _index: number, api: PlayApi): () => void {
  const url = pictureUrl(level);
  const pieces = makePieces(level.cols, level.rows);
  const count = pieces.length;
  const placed = new Set<number>();
  let misses = 0;
  let hints = 0;
  let geo: Layout | null = null;
  const loose = new Map<number, { x: number; y: number }>();
  const tilt = pieces.map(() => Math.round((Math.random() - 0.5) * 12));

  const area = el("div", { class: "mz-area" });
  const board = el("div", { class: `mz-board${level.ghost ? " has-ghost" : ""}` });
  board.style.setProperty("--pic", `url("${url}")`);
  area.append(board);
  stage.append(area);

  const slots = pieces.map((piece) => {
    const slot = el("span", { class: "mz-slot", attrs: { "data-index": piece.index } });
    board.append(slot);
    return slot;
  });

  const scope = createScope();
  const nodes = pieces.map((piece) => {
    const node = el("div", {
      class: "mz-piece",
      attrs: { "data-index": piece.index, role: "img", "aria-label": `Кусочек ${piece.index + 1}` },
    });
    node.style.backgroundImage = `url("${url}")`;
    area.append(node);
    scope.add(
      draggable(node, {
        onStart: () => {
          audio.unlock();
          audio.play("pick");
          node.style.zIndex = "20";
        },
        onDrop: (center) => {
          node.style.zIndex = "";
          if (!geo) return false;
          const areaBox = area.getBoundingClientRect();
          const local = { x: center.x - areaBox.left, y: center.y - areaBox.top };
          const home = slotOf(piece, geo.board, geo.piece);
          if (snaps(local, home, geo.piece)) {
            place(piece.index);
            return true;
          }
          const b = geo.board;
          if (local.x > b.x && local.x < b.x + b.w && local.y > b.y && local.y < b.y + b.h) {
            misses++;
            audio.play("miss");
            if (misses % 3 === 0) hint(stage, "Посмотри на картинку внимательно!");
          }
          return false;
        },
      }),
    );
    return node;
  });

  function place(index: number): void {
    placed.add(index);
    const node = nodes[index]!;
    node.classList.add("is-placed");
    position(index);
    audio.play("snap");
    if (placed.size === count) {
      board.classList.add("is-done");
      area.classList.add("is-done");
      api.win(starsFor(misses + hints * Math.ceil(count / 3), count), `${level.title}!`);
    }
  }

  function position(index: number): void {
    if (!geo) return;
    const node = nodes[index]!;
    const piece = pieces[index]!;
    const home = placed.has(index);
    const at = home ? slotOf(piece, geo.board, geo.piece) : loose.get(index)!;
    node.style.left = `${at.x}px`;
    node.style.top = `${at.y}px`;
    // Loose pieces lie a little crooked, like on a table.
    node.style.rotate = home ? "" : `${tilt[index]}deg`;
  }

  function relayout(): void {
    const box = area.getBoundingClientRect();
    if (box.width < 10 || box.height < 10) return;
    geo = layout(box.width, box.height, level.cols, level.rows);
    const { board: b, piece: size } = geo;
    Object.assign(board.style, { left: `${b.x}px`, top: `${b.y}px`, width: `${b.w}px`, height: `${b.h}px` });
    pieces.forEach((piece, i) => {
      const slot = slots[i]!;
      Object.assign(slot.style, {
        left: `${piece.col * size.w}px`,
        top: `${piece.row * size.h}px`,
        width: `${size.w}px`,
        height: `${size.h}px`,
      });
      const node = nodes[i]!;
      Object.assign(node.style, {
        width: `${size.w}px`,
        height: `${size.h}px`,
        backgroundSize: `${b.w}px ${b.h}px`,
        backgroundPosition: `${-piece.col * size.w}px ${-piece.row * size.h}px`,
      });
    });
    const spots = scatter(count, geo.tray, size, Math.random);
    pieces.forEach((piece, i) => {
      if (!placed.has(piece.index)) loose.set(piece.index, spots[i]!);
      position(piece.index);
    });
  }

  // Hint: one loose piece flies to its place by itself.
  // The hand shows a piece going to its place (free, no penalty).
  api.setDemo(() => {
    const i = pieces.findIndex((p) => !placed.has(p.index));
    if (i >= 0) showDrag(centre(nodes[i]!), centre(slots[i]!));
  });
  api.setHint(() => {
    const index = hintPiece(
      pieces.map((p) => p.index),
      placed,
      Math.random,
    );
    if (index < 0) return;
    hints++;
    const node = nodes[index]!;
    node.classList.add("is-hinted");
    place(index);
  });

  const observer = new ResizeObserver(() => relayout());
  observer.observe(area);
  scope.add(() => observer.disconnect());
  requestAnimationFrame(relayout);

  return scope.dispose;
}
