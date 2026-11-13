import { audio } from "../../shared/audio";
import { el, replayClass } from "../../shared/dom";
import { gameFinds } from "../../shared/finds";
import { createScope } from "../../shared/lifecycle";
import { goHome } from "../../shared/router";
import { useStyles } from "../../shared/style";
import { touchable } from "../../shared/toys";
import { svgNode, toolbar } from "../../shared/ui";
import baseCss from "../../shared/base.css?inline";
import css from "./style.css?inline";
import { allFinds, SCENES, TOYS } from "./scenes";

const TOYS_ICON = TOYS[0]!.svg;

/** «Тапни и послушай»: touch anything in the forest, the kitchen, the yard — or the toys. */
export function mount(root: HTMLElement): () => void {
  useStyles(baseCss, css);
  const scope = createScope();
  const finds = gameFinds("tapni");
  const total = allFinds().length;
  let found = 0;
  const score = el("span", { class: "list__score tp-score", text: "" });
  const paint = (): void => {
    score.textContent = `✦ ${found}/${total}`;
    score.setAttribute("aria-label", `Услышано: ${found} из ${total}`);
  };
  paint();
  void finds.load().then((list) => {
    found = list.filter((id) => allFinds().includes(id)).length;
    paint();
  });
  const heard = (key: string): void => {
    void finds.add(key).then((isNew) => {
      if (!isNew) return;
      found++;
      paint();
      replayClass(score, "is-bump");
    });
  };

  const stage = el("div", { class: "stage tp-stage" });
  const tabs = el("nav", { class: "tp-tabs", attrs: { "aria-label": "Где играть" } });
  const view = el("div", { class: "screen screen--play game--tapni" }, [toolbar("Тапни и послушай", goHome, score), stage, tabs]);
  root.append(view);

  const places = [...SCENES.map((s) => ({ id: s.id, title: s.title, icon: s.icon })), { id: "toys", title: "Потрогай", icon: TOYS_ICON }];
  const buttons = places.map((p, i) =>
    el(
      "button",
      {
        class: "tp-tab",
        attrs: { type: "button", "aria-label": p.title },
        on: {
          click: () => {
            audio.unlock();
            audio.play("tap");
            show(i);
          },
        },
      },
      [svgNode(p.icon, "tp-tab__icon"), el("span", { class: "tp-tab__name", text: p.title })],
    ),
  );
  tabs.append(...buttons);

  function show(i: number): void {
    buttons.forEach((b, j) => {
      b.classList.toggle("is-on", i === j);
      b.setAttribute("aria-pressed", String(i === j));
    });
    const scene = SCENES[i];
    if (!scene) {
      stage.replaceChildren(el("div", { class: "tp-toys" }, TOYS.map((toy) => touchable(toy, (id) => heard(`toys:${id}`), "toy toy--big"))));
      return;
    }
    const field = el("div", { class: `tp-scene tp-scene--${scene.id}`, attrs: { role: "group", "aria-label": scene.title } });
    for (const spot of scene.spots) {
      const node = touchable(spot, (id) => heard(`${scene.id}:${id}`), "toy tp-spot");
      node.style.left = `${spot.x}%`;
      node.style.top = `${spot.y}%`;
      field.append(node);
    }
    stage.replaceChildren(field);
  }
  show(0);
  return () => {
    scope.dispose();
    view.remove();
  };
}
