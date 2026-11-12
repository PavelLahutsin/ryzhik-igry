import { audio } from "../../shared/audio";
import { centre, showDrag, showTap } from "../../shared/guide";
import { el, replayClass } from "../../shared/dom";
import { draggable } from "../../shared/drag";
import { createScope } from "../../shared/lifecycle";
import { mountLevelGame, type PlayApi } from "../../shared/levelgame";
import { useStyles } from "../../shared/style";
import { hint } from "../../shared/ui";
import baseCss from "../../shared/base.css?inline";
import css from "./style.css?inline";
import { levels, pictureUrl, pieceWord, worlds, type MozaikaLevel } from "./levels";
import { scene } from "../../shared/assets";
import { hintPiece, layout, makePieces, onCell, pickExtra, pickFlipped, scatter, slotOf, snaps, starsFor, type Layout } from "./logic";

/**
 * «Мозаика»: a picture cut into big rectangles; drag each one home. Later
 * worlds: some pieces lie upside down (tap to turn), and pieces of another
 * picture are mixed in (they fit nowhere).
 */
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
      caption: (level) => pieceWord(level.cols * level.rows) + (level.flip ? " · вверх ногами" : "") + (level.extra ? " · лишние" : ""),
      play,
    },
    root,
  );
}

function play(stage: HTMLElement, level: MozaikaLevel, _index: number, api: PlayApi): () => void {
  const url = pictureUrl(level);
  const pieces = makePieces(level.cols, level.rows);
  const count = pieces.length;
  const extras = level.extra ? pickExtra(level.cols, level.rows, level.extra.count, Math.random) : [];
  const extraUrl = level.extra ? scene(level.extra.from) : "";
  const total = count + extras.length;
  const flipped = pickFlipped(count, level.flip ?? 0, Math.random);
  const placed = new Set<number>();
  let misses = 0;
  let hints = 0;
  let geo: Layout | null = null;
  const loose = new Map<number, { x: number; y: number }>();
  const tilt = Array.from({ length: total }, () => Math.round((Math.random() - 0.5) * 12));

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
  const say = (text: string): void => hint(stage, text);
  let saidFlip = false;

  /** A loose piece: a real one (index < count) or an extra one. */
  const makeNode = (index: number): HTMLElement => {
    const extra = index >= count;
    const node = el("div", {
      class: `mz-piece${extra ? " is-extra" : ""}${flipped.has(index) ? " is-flipped" : ""}`,
      attrs: { "data-index": index, role: "img", "aria-label": `Кусочек ${index + 1}` },
    });
    node.style.backgroundImage = `url("${extra ? extraUrl : url}")`;
    area.append(node);
    scope.add(
      draggable(node, {
        onStart: () => {
          audio.unlock();
          audio.play("pick");
          node.style.zIndex = "20";
        },
        // A tap: an upside-down piece turns over; any other piece is picked for tap-tap.
        onTap: () => {
          node.style.zIndex = "";
          if (!flipped.has(index)) return false;
          turn(index);
          return true;
        },
        onDrop: (center) => {
          node.style.zIndex = "";
          if (!geo) return false;
          const areaBox = area.getBoundingClientRect();
          const local = { x: center.x - areaBox.left, y: center.y - areaBox.top };
          const b = geo.board;
          const onBoard = local.x > b.x && local.x < b.x + b.w && local.y > b.y && local.y < b.y + b.h;
          // Off the board, or on a seam between two places: no mistake.
          if (!onBoard || !onCell(local, geo.board, geo.piece)) return "none";
          if (extra) {
            if (onBoard) {
              misses++;
              audio.play("miss");
              replayClass(node, "is-shake");
              say("Этот кусочек из другой картинки! Ему здесь нет места");
            }
            return false;
          }
          const home = slotOf(pieces[index]!, geo.board, geo.piece);
          if (snaps(local, home, geo.piece)) {
            if (flipped.has(index)) {
              // Right place, but upside down: not a mistake, just turn it.
              audio.play("miss");
              replayClass(node, "is-shake");
              say("Кусочек вверх ногами! Нажми на него — он перевернётся");
              return false;
            }
            place(index);
            return true;
          }
          if (onBoard) {
            misses++;
            audio.play("miss");
            if (misses % 3 === 0) say("Посмотри на картинку внимательно!");
          }
          return false;
        },
      }),
    );
    return node;
  };
  const nodes = Array.from({ length: total }, (_, i) => makeNode(i));

  function turn(index: number): void {
    flipped.delete(index);
    audio.play("tap");
    const node = nodes[index]!;
    node.classList.remove("is-flipped");
    // After the drag code has reset the node's transition.
    scope.later(() => {
      node.style.transition = "rotate 360ms cubic-bezier(.3,1.4,.5,1)";
      position(index);
    }, 0);
  }

  function place(index: number): void {
    placed.add(index);
    const node = nodes[index]!;
    node.classList.add("is-placed");
    position(index);
    audio.play("snap");
    if (placed.size === count) {
      board.classList.add("is-done");
      area.classList.add("is-done");
      api.win(starsFor(misses, count, hints), `${level.title}!`);
    }
  }

  function position(index: number): void {
    if (!geo) return;
    const node = nodes[index]!;
    const home = placed.has(index);
    const at = home ? slotOf(pieces[index]!, geo.board, geo.piece) : loose.get(index)!;
    node.style.left = `${at.x}px`;
    node.style.top = `${at.y}px`;
    // Loose pieces lie a little crooked, like on a table; some upside down.
    node.style.rotate = home ? "" : `${tilt[index]! + (flipped.has(index) ? 180 : 0)}deg`;
  }

  function relayout(): void {
    const box = area.getBoundingClientRect();
    if (box.width < 10 || box.height < 10) return;
    geo = layout(box.width, box.height, level.cols, level.rows, 16 / 9, extras.length);
    const { board: b, piece: size } = geo;
    Object.assign(board.style, { left: `${b.x}px`, top: `${b.y}px`, width: `${b.w}px`, height: `${b.h}px` });
    pieces.forEach((piece, i) => {
      Object.assign(slots[i]!.style, {
        left: `${piece.col * size.w}px`,
        top: `${piece.row * size.h}px`,
        width: `${size.w}px`,
        height: `${size.h}px`,
      });
    });
    nodes.forEach((node, i) => {
      const cell = i < count ? pieces[i]! : extras[i - count]!;
      Object.assign(node.style, {
        width: `${size.w}px`,
        height: `${size.h}px`,
        backgroundSize: `${b.w}px ${b.h}px`,
        backgroundPosition: `${-cell.col * size.w}px ${-cell.row * size.h}px`,
      });
    });
    const spots = scatter(total, geo.tray, size, Math.random);
    nodes.forEach((_, i) => {
      if (!placed.has(i)) loose.set(i, spots[i]!);
      position(i);
    });
  }

  // The hand: first how to turn a piece over (a tap), then a piece going home.
  api.setDemo(() => {
    const up = [...flipped].find((i) => !placed.has(i));
    if (up !== undefined) {
      showTap(centre(nodes[up]!));
      if (!saidFlip) {
        saidFlip = true;
        say("Нажми на кусочек вверх ногами — он перевернётся");
      }
      return;
    }
    const i = pieces.findIndex((p) => !placed.has(p.index));
    if (i >= 0) showDrag(centre(nodes[i]!), centre(slots[i]!));
  });
  // Hint: one loose piece turns over if needed and flies to its place.
  api.setHint(() => {
    const index = hintPiece(
      pieces.map((p) => p.index),
      placed,
      Math.random,
    );
    if (index < 0) return;
    hints++;
    if (flipped.has(index)) flipped.delete(index);
    const node = nodes[index]!;
    node.classList.remove("is-flipped");
    node.classList.add("is-hinted");
    place(index);
  });

  const observer = new ResizeObserver(() => relayout());
  observer.observe(area);
  scope.add(() => observer.disconnect());
  requestAnimationFrame(relayout);

  return scope.dispose;
}
