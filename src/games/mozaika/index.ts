import { audio } from "../../shared/audio";
import { centre, showDrag, showTap } from "../../shared/guide";
import { el, replayClass } from "../../shared/dom";
import { draggable } from "../../shared/drag";
import { createScope } from "../../shared/lifecycle";
import { mountLevelGame, type PlayApi } from "../../shared/levelgame";
import { useStyles } from "../../shared/style";
import { shuffle } from "../../shared/rng";
import { hint, svgNode } from "../../shared/ui";
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

/** The basket for extra pieces (v12): drawn, sits in a corner of the tray. */
const BASKET =
  '<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg"><path d="M22 30 C22 8 78 8 78 30" fill="none" stroke="#a5642c" stroke-width="7" stroke-linecap="round"/><path d="M8 30 H92 L82 74 H18 Z" fill="#e3a35a" stroke="#3b2e25" stroke-width="3.5" stroke-linejoin="round"/><path d="M14 44 H86 M17 58 H83 M34 30 L38 74 M50 30 V74 M66 30 L62 74" stroke="#a5642c" stroke-width="3" fill="none"/><path d="M6 30 H94" stroke="#3b2e25" stroke-width="5" stroke-linecap="round"/></svg>';

function play(stage: HTMLElement, level: MozaikaLevel, _index: number, api: PlayApi): () => void {
  const url = pictureUrl(level);
  const pieces = makePieces(level.cols, level.rows);
  const count = pieces.length;
  const extras = level.extra ? pickExtra(level.cols, level.rows, level.extra.count, Math.random) : [];
  const extraUrl = level.extra ? scene(level.extra.from) : "";
  const total = count + extras.length;
  const flipped = pickFlipped(count, level.flip ?? 0, Math.random);
  const placed = new Set<number>();
  /** Extra pieces put in the basket. */
  const binned = new Set<number>();
  let misses = 0;
  let hints = 0;
  let geo: Layout | null = null;
  const loose = new Map<number, { x: number; y: number }>();
  const tilt = Array.from({ length: total }, () => Math.round((Math.random() - 0.5) * 12));
  // Tray order; on a small landscape tray only the first few lie there and
  // the next one slides in after each placement (Layout.visible).
  const order = shuffle(Array.from({ length: total }, (_, i) => i));
  const waiting = new Set<number>();
  const isDone = (i: number): boolean => placed.has(i) || binned.has(i);

  const area = el("div", { class: "mz-area" });
  const board = el("div", { class: `mz-board${level.ghost ? " has-ghost" : ""}` });
  board.style.setProperty("--pic", `url("${url}")`);
  area.append(board);
  const basket = extras.length
    ? el("div", { class: "mz-basket", attrs: { role: "img", "aria-label": "Корзинка для лишних кусочков" } }, [svgNode(BASKET, "mz-basket__art")])
    : null;
  if (basket) area.append(basket);
  stage.append(area);

  const slots = pieces.map((piece) => {
    const slot = el("span", { class: "mz-slot", attrs: { "data-index": piece.index } });
    board.append(slot);
    return slot;
  });

  const scope = createScope();
  const say = (text: string): void => hint(stage, text);
  let saidFlip = false;

  const inBasket = (p: { x: number; y: number }): boolean => {
    if (!basket) return false;
    const r = basket.getBoundingClientRect();
    const pad = 12;
    return p.x > r.left - pad && p.x < r.right + pad && p.y > r.top - pad && p.y < r.bottom + pad;
  };

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
          // Already home (the lamp may have flown it while a finger held it).
          if (!geo || isDone(index)) return isDone(index);
          if (inBasket(center)) {
            if (extra) {
              bin(index);
              return true;
            }
            say("Этот кусочек — из нашей картинки! Ищи ему место");
            return "none";
          }
          const areaBox = area.getBoundingClientRect();
          const local = { x: center.x - areaBox.left, y: center.y - areaBox.top };
          const b = geo.board;
          const onBoard = local.x > b.x && local.x < b.x + b.w && local.y > b.y && local.y < b.y + b.h;
          // Off the board, or on a seam between two places: no mistake.
          if (!onBoard || !onCell(local, geo.board, geo.piece)) return "none";
          if (extra) {
            // An extra piece on the board: a gentle «not here», no mistake.
            say("Этот кусочек из другой картинки! Положи его в корзинку");
            return "none";
          }
          const home = slotOf(pieces[index]!, geo.board, geo.piece);
          if (snaps(local, home, geo.piece)) {
            if (flipped.has(index)) {
              // Right place, upside down: it turns over by itself and goes in.
              flipped.delete(index);
              node.classList.remove("is-flipped");
              audio.play("pop");
            }
            place(index);
            return true;
          }
          misses++;
          audio.play("miss");
          if (misses % 3 === 0) say("Посмотри на картинку внимательно!");
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
    if (placed.has(index)) return;
    placed.add(index);
    const node = nodes[index]!;
    node.classList.add("is-placed");
    position(index);
    audio.play("snap");
    next(index);
    if (placed.size === count) {
      board.classList.add("is-done");
      area.classList.add("is-done");
      api.win(starsFor(misses, count, hints), `${level.title}!`);
    }
  }

  /** An extra piece goes into the basket: praise, no penalty. */
  function bin(index: number): void {
    if (binned.has(index)) return;
    binned.add(index);
    const node = nodes[index]!;
    node.classList.add("is-placed", "is-binned");
    if (basket) Object.assign(node.style, { left: basket.style.left, top: basket.style.top, rotate: "" });
    if (basket) replayClass(basket, "is-got");
    audio.play("sparkle");
    say("Молодец, лишний кусочек найден!");
    next(index);
  }

  /** The tray spot `index` left is taken by the next waiting piece. */
  function next(index: number): void {
    if (waiting.delete(index)) return;
    const spot = loose.get(index);
    const n = order.find((i) => waiting.has(i));
    if (n === undefined || !spot) return;
    waiting.delete(n);
    loose.set(n, spot);
    const node = nodes[n]!;
    node.classList.remove("is-waiting");
    replayClass(node, "is-new");
    position(n);
  }

  function position(index: number): void {
    if (!geo) return;
    const node = nodes[index]!;
    const home = placed.has(index);
    const at = home ? slotOf(pieces[index]!, geo.board, geo.piece) : loose.get(index);
    if (!at) return;
    node.style.left = `${at.x}px`;
    node.style.top = `${at.y}px`;
    // Loose pieces lie a little crooked, like on a table; some upside down.
    node.style.rotate = home ? "" : `${tilt[index]! + (flipped.has(index) ? 180 : 0)}deg`;
  }

  function relayout(): void {
    const box = area.getBoundingClientRect();
    if (box.width < 10 || box.height < 10) return;
    geo = layout(box.width, box.height, level.cols, level.rows, 16 / 9, extras.length, basket ? 1 : 0);
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
    // The first `visible` loose pieces of the order lie in the tray.
    const left = order.filter((i) => !isDone(i));
    const shown = left.slice(0, geo.visible);
    waiting.clear();
    for (const i of left.slice(geo.visible)) waiting.add(i);
    const spots = scatter(shown.length + (basket ? 1 : 0), geo.tray, size, Math.random);
    if (basket) {
      // The basket takes the bottom-right spot.
      spots.sort((p, q) => p.y - q.y || p.x - q.x);
      const at = spots.pop()!;
      Object.assign(basket.style, { left: `${at.x}px`, top: `${at.y}px`, width: `${size.w}px`, height: `${size.h}px` });
      spots.sort(() => Math.random() - 0.5);
    }
    shown.forEach((i, k) => loose.set(i, spots[k]!));
    nodes.forEach((node, i) => {
      node.classList.toggle("is-waiting", waiting.has(i));
      position(i);
    });
  }

  const free = (i: number): boolean => !isDone(i) && !waiting.has(i) && !nodes[i]!.classList.contains("is-dragging");
  // The hand: first how to turn a piece over (a tap), then a piece going home.
  api.setDemo(() => {
    const up = [...flipped].find((i) => free(i));
    if (up !== undefined) {
      showTap(centre(nodes[up]!));
      if (!saidFlip) {
        saidFlip = true;
        say("Нажми на кусочек вверх ногами — он перевернётся");
      }
      return;
    }
    const i = pieces.findIndex((p) => free(p.index));
    if (i >= 0) showDrag(centre(nodes[i]!), centre(slots[i]!));
  });
  // Hint: one loose piece (on the tray, not in a finger) turns over if needed and flies to its place.
  api.setHint(() => {
    const real = pieces.map((p) => p.index);
    const onTray = real.filter((i) => free(i) || isDone(i));
    let index = hintPiece(onTray, placed, Math.random);
    if (index < 0) index = hintPiece(real.filter((i) => !nodes[i]!.classList.contains("is-dragging")), placed, Math.random);
    if (index < 0) return;
    hints++;
    if (flipped.has(index)) flipped.delete(index);
    const node = nodes[index]!;
    node.classList.remove("is-flipped", "is-waiting");
    node.classList.add("is-hinted");
    place(index);
  });

  const observer = new ResizeObserver(() => relayout());
  observer.observe(area);
  scope.add(() => observer.disconnect());
  requestAnimationFrame(relayout);

  return scope.dispose;
}
