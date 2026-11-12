import { audio } from "../../shared/audio";
import { centre, showTap } from "../../shared/guide";
import { el } from "../../shared/dom";
import { createScope } from "../../shared/lifecycle";
import { mountLevelGame, type PlayApi } from "../../shared/levelgame";
import { reducedMotion, useStyles } from "../../shared/style";
import { hint, svgNode } from "../../shared/ui";
import baseCss from "../../shared/base.css?inline";
import css from "./style.css?inline";
import { FACE_COLORS, face, levels, pairsOf, worlds, type ParaLevel } from "./levels";
import { closeMiss, deal, fitGrid, flip, peekable, solved, starsFor } from "./logic";

/** «Найди пару»: memory cards with Ryzhik, family and friends. No clock. */
export function mount(root: HTMLElement): () => void {
  useStyles(baseCss, css);
  return mountLevelGame(
    {
      id: "najdi-paru",
      title: "Найди пару",
      subtitle: "Открой две одинаковые карточки",
      levels,
      worlds,
      thumb: (level) => faceNode(level.faces[0]!, "np-thumb"),
      caption: (level) => (level.cols * level.rows === 4 ? "4 карточки" : `${level.cols * level.rows} карточек`),
      play,
    },
    root,
  );
}

function faceNode(key: string, className = "np-face"): HTMLElement {
  const f = face(key);
  const box = el("span", { class: `${className} is-${f.kind}` });
  box.style.background = FACE_COLORS[key] ?? "#fffcf7";
  if (f.kind === "character") {
    box.append(el("img", { attrs: { src: f.src, alt: "", draggable: "false" } }));
  } else {
    box.append(svgNode(f.svg));
  }
  return box;
}

function play(stage: HTMLElement, level: ParaLevel, _index: number, api: PlayApi): () => void {
  const pairs = pairsOf(level);
  const state = deal(level.faces, pairs);
  const scope = createScope();
  let peeks = 0;
  let peeking = false;
  const grid = el("div", { class: "np-grid" });
  const shape = (): void => {
    // The window, not the stage: the stage grows with the cards inside it.
    const fit = fitGrid(level.cols, level.rows, window.innerWidth > (window.innerHeight - 90) * 1.1);
    grid.style.setProperty("--cols", String(fit.cols));
    grid.style.setProperty("--rows", String(fit.rows));
  };
  const cards = state.deck.map((key, i) => {
    const name = face(key).name;
    const card = el(
      "button",
      {
        class: "np-card",
        attrs: { type: "button", "data-face": key, "aria-label": "Карточка, закрыта" },
        on: { click: () => tap(i) },
      },
      [
        el("span", { class: "np-card__inner" }, [
          el("span", { class: "np-card__back", attrs: { "aria-hidden": "true" } }),
          el("span", { class: "np-card__front" }, [faceNode(key)]),
        ]),
      ],
    );
    card.dataset.name = name;
    grid.append(card);
    return card;
  });
  stage.append(el("div", { class: "np-wrap" }, [grid]));
  shape();
  scope.listen(window, "resize", shape);

  // Hint: all closed cards peek for a moment.
  // The hand taps a card that is still closed.
  api.setDemo(() => {
    const card = cards.find((c) => !c.classList.contains("is-open") && !c.classList.contains("is-matched"));
    if (card && !peeking) showTap(centre(card));
  });
  api.setHint(() => {
    if (peeking) return;
    const ids = peekable(state);
    if (ids.length === 0) return;
    peeking = true;
    peeks++;
    audio.play("tap");
    for (const i of ids) cards[i]!.classList.add("is-open", "is-peek");
    scope.later(() => {
      for (const i of ids) {
        cards[i]!.classList.remove("is-peek");
        if (!state.open.includes(i) && !state.matched.has(i)) cards[i]!.classList.remove("is-open");
      }
      peeking = false;
    }, 1300);
  });

  function show(i: number, open: boolean): void {
    const card = cards[i]!;
    card.classList.toggle("is-open", open);
    card.setAttribute("aria-label", open ? card.dataset.name ?? "" : "Карточка, закрыта");
  }

  function tap(i: number): void {
    audio.unlock();
    if (peeking) return;
    const result = flip(state, i);
    if (result === "ignored") return;
    show(i, true);
    audio.play("pick");
    if (result === "match") {
      const [a, b] = [...state.matched].slice(-2) as [number, number];
      scope.later(() => {
        cards[a]!.classList.add("is-matched");
        cards[b]!.classList.add("is-matched");
        audio.play("snap");
        if (solved(state)) api.win(starsFor(state.misses, pairs, peeks));
      }, reducedMotion() ? 0 : 320);
    }
    if (result === "miss") {
      if (state.misses === pairs * 2) hint(stage, "Запоминай, где какая картинка!");
      scope.later(() => {
        for (const j of closeMiss(state)) show(j, false);
      }, 1000);
    }
  }

  return scope.dispose;
}
