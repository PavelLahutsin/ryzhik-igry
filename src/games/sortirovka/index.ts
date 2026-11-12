import { audio } from "../../shared/audio";
import { centre, showDrag } from "../../shared/guide";
import { el, replayClass } from "../../shared/dom";
import { draggable, dropHits } from "../../shared/drag";
import { createScope } from "../../shared/lifecycle";
import { mountLevelGame, type PlayApi } from "../../shared/levelgame";
import { OBJECTS } from "../../shared/objects";
import { shuffle } from "../../shared/rng";
import { useStyles } from "../../shared/style";
import { plural } from "../../shared/words";
import { hint, svgNode } from "../../shared/ui";
import baseCss from "../../shared/base.css?inline";
import css from "./style.css?inline";
import { basketSvg } from "./art";
import { itemCount, levels, objOf, sizeOf, worlds, type Basket, type SortLevel } from "./levels";
import { hintFor, judge, starsFor, targetFor } from "./logic";

/**
 * «Разложи по корзинкам»: sort things by colour, then by kind; later by
 * size, by a number (exactly that many), and by two features at once.
 */
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
  const size = basket.size ? ` is-${basket.size}` : "";
  const label =
    basket.need !== undefined
      ? el("span", { class: "so-basket__label so-basket__dots", attrs: { "aria-hidden": "true" } }, Array.from({ length: basket.need }, () => el("i")))
      : basket.label
        ? svgNode(OBJECTS[basket.label].svg, `so-basket__label${size}`)
        : el("span", { class: `so-basket__label so-basket__swatch${size}`, style: { background: basket.color } });
  const name = basket.need !== undefined ? el("b", { class: "so-basket__num", text: basket.name }) : el("span", { text: basket.name });
  return el("div", { class: `so-basket${basket.need !== undefined ? " so-basket--count" : ""}`, attrs: { "data-id": basket.id, role: "group", "aria-label": `Корзинка: ${basket.name}` } }, [
    el("span", { class: "so-basket__in" }),
    svgNode(basketSvg(basket.color), "so-basket__art"),
    el("span", { class: "so-basket__name" }, [label, name]),
  ]);
}

function play(stage: HTMLElement, level: SortLevel, _index: number, api: PlayApi): () => void {
  const count = itemCount(level);
  const sorted = new Set<number>();
  const fills = new Map<string, number>();
  let misses = 0;
  let hints = 0;

  const baskets = new Map<string, HTMLElement>();
  const row = el("div", { class: `so-baskets so-baskets--${level.baskets.length}` });
  for (const basket of level.baskets) {
    const node = basketNode(basket);
    baskets.set(basket.id, node);
    row.append(node);
  }

  // Things by index: the same thing can lie twice (three apples, big and small).
  const order = shuffle(level.baskets.flatMap((b) => b.items as string[]));
  const table = el("div", { class: "so-table" });
  const scope = createScope();
  const items = order.map((key, n) => {
    const obj = OBJECTS[objOf(key)];
    const size = sizeOf(key);
    const label = size ? `${obj.name}, ${size === "big" ? "большое" : "маленькое"}` : obj.name;
    const node = el("div", { class: `so-item${size ? ` so-item--${size}` : ""}`, attrs: { "data-id": key, "data-n": n, role: "img", "aria-label": label } }, [svgNode(obj.svg, "so-item__art")]);
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
          const target = hitBasket(center, (b) => judge(level, key, b, fills.get(b) ?? 0) === "placed");
          const result = judge(level, key, target, target ? fills.get(target) ?? 0 : 0);
          const basket = target ? baskets.get(target) : undefined;
          if (result === "placed") {
            sorted.add(n);
            if (target) fills.set(target, (fills.get(target) ?? 0) + 1);
            basket?.querySelector(".so-basket__in")?.append(svgNode(obj.svg, `so-basket__thing${size ? ` is-${size}` : ""}`));
            if (basket) {
              replayClass(basket, "is-got");
              const b = level.baskets.find((x) => x.id === target);
              if (b?.need !== undefined) basket.classList.toggle("is-full", fills.get(target!) === b.need);
            }
            node.classList.add("is-placed");
            audio.play("snap");
            if (sorted.size === count) {
              row.classList.add("is-done");
              api.win(starsFor(misses, count, hints), "Всё разложено по местам!");
            }
            return true;
          }
          if (result === "wrong" || result === "full") {
            misses++;
            audio.play("miss");
            if (basket) replayClass(basket, "is-wrong");
            if (result === "full") {
              hint(stage, `Тут уже ${level.baskets.find((b) => b.id === target)!.need} — хватит! Положи в другую`, 2200);
            } else {
              const own = level.baskets.find((b) => b.id === targetFor(level, key, fills));
              hint(stage, own ? `${label} — не сюда. Ищи корзинку «${own.name}»!` : `${obj.name} — не сюда.`, 2200);
            }
            return false;
          }
          return "none";
        },
      }),
    );
    return node;
  });

  function hitBasket(center: { x: number; y: number }, ok?: (basket: string) => boolean): string | null {
    const list = [...baskets.entries()];
    // A basket that takes the thing: anywhere on it; any other basket only on
    // the basket itself (0.45 of its size) — beside it is no mistake.
    const hit = dropHits(center, list.map(([, node]) => node.getBoundingClientRect()));
    const i = hit.box >= 0 && ok?.(list[hit.box]![0]) ? hit.box : hit.zone;
    return i >= 0 ? list[i]![0] : null;
  }

  stage.append(el("p", { class: "so-ask", text: level.ask }), row, table);

  // Hint: one thing and its basket glow together.
  // The hand carries a thing to its basket.
  const indexes = order.map((_, n) => n);
  api.setDemo(() => {
    const n = hintFor(indexes, sorted);
    if (n === null) return;
    const basket = baskets.get(targetFor(level, order[n]!, fills)!);
    if (basket) showDrag(centre(items[n]!), centre(basket));
  });
  api.setHint(() => {
    const n = hintFor(indexes, sorted);
    if (n === null) return;
    hints++;
    for (const node of [items[n], baskets.get(targetFor(level, order[n]!, fills)!)]) {
      if (!node) continue;
      replayClass(node, "is-hinted");
    }
  });

  return scope.dispose;
}
