import { audio } from "../../shared/audio";
import { el, replayClass } from "../../shared/dom";
import { draggable } from "../../shared/drag";
import { centre, showDrag } from "../../shared/guide";
import { type PlayApi } from "../../shared/levelgame";
import { createScope } from "../../shared/lifecycle";
import { shuffle } from "../../shared/rng";
import { speakButton } from "../../shared/speak";
import { rateBy, STARS } from "../../shared/stars";
import { hint, svgNode } from "../../shared/ui";
import { animalArt } from "./animals";
import { eaterOf, FOODS, type FeedLevel } from "./feed-data";

const sayIf = (id: string): void => {
  if (audio.hasVoice(id)) audio.say(id);
};

/** «Кто что ест?»: drag every treat to the animal that eats it; extra treats stay on the table. */
export function playFeed(stage: HTMLElement, level: FeedLevel, _index: number, api: PlayApi): () => void {
  const scope = createScope();
  let misses = 0;
  let hints = 0;
  const fed = new Set<number>();

  const animals = new Map<string, HTMLElement>();
  const row = el("div", {
    class: `zv-animals zv-animals--${level.animals.length}`,
  });
  for (const id of level.animals) {
    const a = animalArt(id);
    const node = el(
      "div",
      {
        class: "zv-animal",
        attrs: { "data-id": id, role: "group", "aria-label": a.name },
      },
      [svgNode(a.svg, "zv-animal__art"), el("span", { class: "zv-animal__plate" }), el("span", { class: "zv-animal__name", text: a.name })],
    );
    animals.set(id, node);
    row.append(node);
  }

  const order = shuffle([...level.foods, ...level.extra]);
  const table = el("div", { class: "zv-table" });
  const items = order.map((food, n) => {
    const f = FOODS[food]!;
    const node = el(
      "div",
      {
        class: "zv-food",
        attrs: { "data-id": food, role: "img", "aria-label": f.name },
      },
      [svgNode(f.svg, "zv-food__art")],
    );
    table.append(node);
    scope.add(
      draggable(node, {
        onStart: () => {
          audio.unlock();
          audio.play("pick");
        },
        onMove: (c) => {
          const hit = hitAnimal(c);
          for (const [id, a] of animals) a.classList.toggle("is-over", id === hit);
        },
        onDrop: (c) => {
          for (const a of animals.values()) a.classList.remove("is-over");
          const target = hitAnimal(c);
          if (!target) return "none";
          const animal = animals.get(target)!;
          if (eaterOf(level, food) === target) {
            fed.add(n);
            node.classList.add("is-placed");
            animal.querySelector(".zv-animal__plate")!.append(svgNode(f.svg, "zv-animal__food"));
            replayClass(animal, "is-yum");
            audio.play("munch");
            if (fed.size === level.foods.length) {
              row.classList.add("is-done");
              sayIf("v26");
              api.win(rateBy(STARS.sortirovka, misses, hints, level.foods.length), level.done);
            } else if (fed.size === 1) sayIf("v141");
            return true;
          }
          misses++;
          audio.play("yuck");
          replayClass(animal, "is-no");
          if (audio.hasVoice("v142") && !audio.saidRecently("v142", 6000)) audio.say("v142");
          else hint(stage, `${animalArt(target).name} такое не ест. Дай другое!`, 2000);
          return false;
        },
      }),
    );
    return node;
  });

  function hitAnimal(c: { x: number; y: number }): string | null {
    for (const [id, node] of animals) {
      const r = node.getBoundingClientRect();
      if (c.x >= r.left && c.x <= r.right && c.y >= r.top && c.y <= r.bottom) return id;
    }
    return null;
  }

  /** The next treat still on the table that someone eats, and who. */
  const next = (): { n: number; who: string } | null => {
    for (let n = 0; n < order.length; n++) {
      const who = eaterOf(level, order[n]!);
      if (!fed.has(n) && who) return { n, who };
    }
    return null;
  };

  const speak = speakButton("v138");
  stage.append(el("div", { class: "zv-ask" }, [el("p", { class: "zv-ask__text", text: level.ask }), speak.node]), row, table);
  sayIf("v138");

  api.setDemo(() => {
    const t = next();
    if (t) showDrag(centre(items[t.n]!), centre(animals.get(t.who)!));
  });
  api.setHint(() => {
    const t = next();
    if (!t) return;
    hints++;
    replayClass(items[t.n]!, "is-hinted");
    replayClass(animals.get(t.who)!, "is-hinted");
  });
  return scope.dispose;
}

/** Level list picture: the animals of the level, side by side. */
export function feedThumb(level: FeedLevel): HTMLElement {
  const box = el("span", { class: "zv-thumb" });
  for (const id of level.animals) box.append(svgNode(animalArt(id).svg, "zv-thumb__art"));
  return box;
}
