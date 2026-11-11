import { audio } from "../../shared/audio";
import { el } from "../../shared/dom";
import { mountLevelGame, type PlayApi } from "../../shared/levelgame";
import { reducedMotion, useStyles } from "../../shared/style";
import { hint, svgNode } from "../../shared/ui";
import baseCss from "../../shared/base.css?inline";
import css from "./style.css?inline";
import { FACE_COLORS, face, levels, pairsOf, type ParaLevel } from "./levels";
import { closeMiss, deal, flip, solved, starsFor } from "./logic";

/** «Найди пару»: memory cards with Ryzhik, family and friends. No clock. */
export function mount(root: HTMLElement): () => void {
  useStyles(baseCss, css);
  return mountLevelGame(
    {
      id: "najdi-paru",
      title: "Найди пару",
      subtitle: "Открой две одинаковые карточки",
      levels,
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
  const timers: number[] = [];
  const grid = el("div", {
    class: "np-grid",
    style: { "--cols": String(level.cols), "--rows": String(level.rows) },
  });
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

  function show(i: number, open: boolean): void {
    const card = cards[i]!;
    card.classList.toggle("is-open", open);
    card.setAttribute("aria-label", open ? card.dataset.name ?? "" : "Карточка, закрыта");
  }

  function tap(i: number): void {
    audio.unlock();
    const result = flip(state, i);
    if (result === "ignored") return;
    show(i, true);
    audio.play("pick");
    if (result === "match") {
      const [a, b] = [...state.matched].slice(-2) as [number, number];
      timers.push(
        window.setTimeout(() => {
          cards[a]!.classList.add("is-matched");
          cards[b]!.classList.add("is-matched");
          audio.play("snap");
          if (solved(state)) api.win(starsFor(state.misses, pairs));
        }, reducedMotion() ? 0 : 320),
      );
    }
    if (result === "miss") {
      if (state.misses === pairs * 2) hint(stage, "Запоминай, где какая картинка!");
      timers.push(
        window.setTimeout(() => {
          for (const j of closeMiss(state)) show(j, false);
        }, 1000),
      );
    }
  }

  return () => {
    for (const t of timers) clearTimeout(t);
  };
}
