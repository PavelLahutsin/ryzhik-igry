import { audio } from "../../shared/audio";
import { centre, showDrag } from "../../shared/guide";
import { el, replayClass } from "../../shared/dom";
import { centerOf, draggable, nearestWithin } from "../../shared/drag";
import { createScope } from "../../shared/lifecycle";
import { mountLevelGame, type PlayApi } from "../../shared/levelgame";
import { OBJECTS, type ObjectId } from "../../shared/objects";
import { shuffle } from "../../shared/rng";
import { useStyles } from "../../shared/style";
import { plural } from "../../shared/words";
import { hint, svgNode } from "../../shared/ui";
import baseCss from "../../shared/base.css?inline";
import css from "./style.css?inline";
import { basketSvg } from "./art";
import { itemCount, levels, worlds, type Basket, type SortLevel } from "./levels";
import { basketOf, hintFor, judge, starsFor } from "./logic";

/** «Разложи по корзинкам»: sort things by colour, then by kind. */
export function mount(root: HTMLElement): () => void {
  useStyles(baseCss, css);
  return mountLevelGame(
    {
      id: "sortirovka",
      title: "По корзинкам",
      subtitle: "Разложи картинки по корзинкам",
      levels,
      worlds,
      thumb: (level) => {
        const box = el("span", { class: "so-thumb" });
        for (const basket of level.baskets.slice(0, 4)) box.append(svgNode(basketSvg(basket.color), "so-thumb__basket"));
        return box;
      },
      caption: (level) => plural(itemCount(level), ["картинка", "картинки", "картинок"]),
      play,
    },
    root,
  );
}

function basketNode(basket: Basket): HTMLElement {
  const label = basket.label
    ? svgNode(OBJECTS[basket.label].svg, "so-basket__label")
    : el("span", { class: "so-basket__label so-basket__swatch", style: { background: basket.color } });
  return el("div", { class: "so-basket", attrs: { "data-id": basket.id, role: "group", "aria-label": `Корзинка: ${basket.name}` } }, [
    el("span", { class: "so-basket__in" }),
    svgNode(basketSvg(basket.color), "so-basket__art"),
    el("span", { class: "so-basket__name" }, [label, el("span", { text: basket.name })]),
  ]);
}

function play(stage: HTMLElement, level: SortLevel, _index: number, api: PlayApi): () => void {
  const count = itemCount(level);
  const sorted = new Set<ObjectId>();
  let misses = 0;

  const baskets = new Map<string, HTMLElement>();
  const row = el("div", { class: `so-baskets so-baskets--${level.baskets.length}` });
  for (const basket of level.baskets) {
    const node = basketNode(basket);
    baskets.set(basket.id, node);
    row.append(node);
  }

  const order = shuffle(level.baskets.flatMap((b) => b.items));
  const table = el("div", { class: "so-table" });
  const scope = createScope();
  const items = new Map<ObjectId, HTMLElement>();
  for (const id of order) {
    const obj = OBJECTS[id];
    const node = el("div", { class: "so-item", attrs: { "data-id": id, role: "img", "aria-label": obj.name } }, [svgNode(obj.svg, "so-item__art")]);
    items.set(id, node);
    table.append(node);
    scope.add(
      draggable(node, {
        onStart: () => {
          audio.unlock();
          audio.play("pick");
        },
        onMove: (center) => {
          const hit = hitBasket(center);
          for (const [bid, b] of baskets) b.classList.toggle("is-over", bid === hit);
        },
        onDrop: (center) => {
          for (const b of baskets.values()) b.classList.remove("is-over");
          const target = hitBasket(center);
          const result = judge(level, id, target);
          if (result === "placed") {
            sorted.add(id);
            const basket = target ? baskets.get(target) : undefined;
            basket?.querySelector(".so-basket__in")?.append(svgNode(obj.svg, "so-basket__thing"));
            if (basket) replayClass(basket, "is-got");
            node.classList.add("is-placed");
            audio.play("snap");
            if (sorted.size === count) {
              row.classList.add("is-done");
              api.win(starsFor(misses, count), "Всё разложено по местам!");
            }
            return true;
          }
          if (result === "wrong") {
            misses++;
            audio.play("miss");
            const basket = target ? baskets.get(target) : undefined;
            if (basket) replayClass(basket, "is-wrong");
            const own = level.baskets.find((b) => b.id === basketOf(level, id));
            hint(stage, own ? `${obj.name} — не сюда. Ищи корзинку «${own.name}»!` : `${obj.name} — не сюда.`, 2200);
          }
          return false;
        },
      }),
    );
  }

  function hitBasket(center: { x: number; y: number }): string | null {
    const list = [...baskets.entries()];
    const reach = Math.max(80, (list[0]?.[1].getBoundingClientRect().width ?? 100) * 0.75);
    const i = nearestWithin(center, list.map(([, node]) => centerOf(node)), reach);
    return i >= 0 ? list[i]![0] : null;
  }

  stage.append(el("p", { class: "so-ask", text: level.ask }), row, table);

  // Hint: one thing and its basket glow together.
  // The hand carries a thing to its basket.
  api.setDemo(() => {
    const id = hintFor(order, sorted);
    const item = id && items.get(id);
    const basket = id && baskets.get(basketOf(level, id)!);
    if (item && basket) showDrag(centre(item), centre(basket));
  });
  api.setHint(() => {
    const id = hintFor(order, sorted);
    if (!id) return;
    misses++;
    for (const node of [items.get(id), baskets.get(basketOf(level, id)!)]) {
      if (!node) continue;
      replayClass(node, "is-hinted");
    }
  });

  return scope.dispose;
}
