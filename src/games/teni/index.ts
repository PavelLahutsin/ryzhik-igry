import { audio } from "../../shared/audio";
import { centre, showDrag } from "../../shared/guide";
import { el } from "../../shared/dom";
import { centerOf, draggable, nearestWithin } from "../../shared/drag";
import { mountLevelGame, type PlayApi } from "../../shared/levelgame";
import { shuffle } from "../../shared/rng";
import { useStyles } from "../../shared/style";
import { hint, svgNode } from "../../shared/ui";
import baseCss from "../../shared/base.css?inline";
import css from "./style.css?inline";
import { levels, shadowCount, thing, worlds, type TeniLevel, type Thing } from "./levels";
import { hintTarget, judge, rowsOf, starsFor } from "./logic";

/** «Тени»: drag each thing onto its own shadow. */
export function mount(root: HTMLElement): () => void {
  useStyles(baseCss, css);
  return mountLevelGame(
    {
      id: "teni",
      title: "Тени",
      subtitle: "Найди, чья это тень",
      levels,
      worlds,
      thumb: (level) => {
        const t = thing(level.items[0]!);
        return el("span", { class: "tn-thumb" }, [art(t, "tn-thumb__shadow"), art(t, "tn-thumb__item")]);
      },
      caption: (level) => `${shadowCount(level)} ${shadowCount(level) < 5 ? "тени" : "теней"}`,
      play,
    },
    root,
  );
}

function art(t: Thing, className: string): HTMLElement {
  if (t.kind === "svg") return svgNode(t.svg, className);
  return el("span", { class: `svg-art ${className}`, attrs: { "aria-hidden": "true" } }, [
    el("img", { attrs: { src: t.src, alt: "", draggable: "false" } }),
  ]);
}

function play(stage: HTMLElement, level: TeniLevel, _index: number, api: PlayApi): () => void {
  const things = level.items.map(thing);
  const filled = new Set<string>();
  let misses = 0;

  // Silhouettes: the same art rendered black and see-through (CSS filter).
  const board = el("div", { class: "tn-board" });
  const order = shuffle([...things, ...(level.decoys ?? []).map(thing)]);
  const shadows = new Map<string, HTMLElement>();
  let at = 0;
  for (const count of rowsOf(order.length)) {
    const row = el("div", { class: "tn-row" });
    for (const t of order.slice(at, at + count)) {
      const shadow = el("div", { class: "tn-shadow", attrs: { "data-id": t.id, "aria-label": "Тень", role: "img" } }, [
        art(t, "tn-shadow__art"),
      ]);
      shadows.set(t.id, shadow);
      row.append(shadow);
    }
    at += count;
    board.append(row);
  }

  const tray = el("div", { class: "tn-tray" });
  const stops: Array<() => void> = [];
  for (const t of shuffle(things)) {
    const item = el("div", { class: "tn-item", attrs: { "data-id": t.id, role: "img", "aria-label": t.name } }, [
      art(t, "tn-item__art"),
    ]);
    tray.append(item);
    stops.push(
      draggable(item, {
        onStart: () => {
          audio.unlock();
          audio.play("pick");
        },
        onDrop: (center) => {
          const open = [...shadows.entries()].filter(([id]) => !filled.has(id));
          const reach = Math.max(70, (open[0]?.[1].getBoundingClientRect().width ?? 100) * 0.7);
          const hit = nearestWithin(center, open.map(([, node]) => centerOf(node)), reach);
          const target = hit >= 0 ? open[hit]![0] : null;
          const result = judge(t.id, target, filled);
          if (result === "placed") {
            filled.add(t.id);
            const shadow = shadows.get(t.id)!;
            shadow.classList.add("is-filled");
            item.classList.add("is-placed");
            shadow.append(item);
            audio.play("snap");
            if (filled.size === things.length) {
              board.classList.add("is-done");
              api.win(starsFor(misses));
            }
            return true;
          }
          if (result === "wrong") {
            misses++;
            audio.play("miss");
            const shadow = shadows.get(target!)!;
            shadow.classList.remove("is-wrong");
            void shadow.offsetWidth;
            shadow.classList.add("is-wrong");
            hint(stage, `Это не тень: ${t.name.toLowerCase()}. Попробуй другую!`);
          }
          return false;
        },
      }),
    );
  }

  const note = level.decoys?.length
    ? `Перетащи картинку на её тень. ${level.decoys.length === 1 ? "Одна тень лишняя!" : "Две тени лишние!"}`
    : "Перетащи картинку на её тень";
  stage.append(board, el("p", { class: "tn-note", text: note }), tray);

  // Hint: one picture and its own shadow glow together.
  // The hand carries a picture to its shadow.
  api.setDemo(() => {
    const id = hintTarget(
      things.map((t) => t.id),
      filled,
    );
    const item = id && tray.querySelector<HTMLElement>(`.tn-item[data-id="${id}"]`);
    if (id && item) showDrag(centre(item), centre(shadows.get(id)!));
  });
  api.setHint(() => {
    const id = hintTarget(
      things.map((t) => t.id),
      filled,
    );
    if (!id) return;
    misses++;
    const pair = [shadows.get(id)!, tray.querySelector<HTMLElement>(`.tn-item[data-id="${id}"]`)];
    for (const node of pair) {
      if (!node) continue;
      node.classList.remove("is-hinted");
      void node.offsetWidth;
      node.classList.add("is-hinted");
    }
  });
  return () => {
    for (const stop of stops) stop();
  };
}
