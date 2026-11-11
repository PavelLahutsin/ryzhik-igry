import { audio } from "../../shared/audio";
import { character } from "../../shared/assets";
import { el } from "../../shared/dom";
import { draggable } from "../../shared/drag";
import { mountLevelGame, type PlayApi } from "../../shared/levelgame";
import { shuffle } from "../../shared/rng";
import { useStyles } from "../../shared/style";
import { hint, svgNode } from "../../shared/ui";
import baseCss from "../../shared/base.css?inline";
import css from "./style.css?inline";
import { ANCHORS, ITEMS, iconSvg, overlaySvg, type Slot } from "./items";
import { WEATHER, levels, type OdezhdaLevel } from "./levels";
import { dressed, starsFor, tryWear } from "./logic";
import { WEATHER_ART, WEATHER_BG } from "./weather";

/** Drawing order on Ryzhik: coat under scarf, mittens over sleeves, etc. */
const LAYER: Record<Slot, number> = { body: 1, neck: 2, hands: 3, feet: 3, head: 4, eyes: 5, holds: 6 };

/** «Одень Рыжика»: dress him for the weather. */
export function mount(root: HTMLElement): () => void {
  useStyles(baseCss, css);
  return mountLevelGame(
    {
      id: "odezhda",
      title: "Одень Рыжика",
      subtitle: "Что надеть по погоде?",
      levels,
      thumb: (level) => {
        const box = svgNode(WEATHER_ART[level.weather], "od-thumb");
        box.style.background = WEATHER_BG[level.weather];
        return box;
      },
      caption: (level) => level.title,
      play,
    },
    root,
  );
}

function play(stage: HTMLElement, level: OdezhdaLevel, _index: number, api: PlayApi): () => void {
  const worn: string[] = [];
  let misses = 0;

  const banner = el("div", { class: "od-banner" }, [
    svgNode(WEATHER_ART[level.weather], "od-banner__art"),
    el("p", { class: "od-banner__text", text: WEATHER[level.weather].ask }),
  ]);
  banner.style.background = WEATHER_BG[level.weather];

  const figure = el("div", { class: "od-figure" }, [
    el("img", {
      class: "od-figure__fox",
      attrs: { src: character("ryzhik"), alt: "Лисёнок Рыжик", draggable: "false" },
    }),
  ]);
  // Invisible targets at each slot (also used by the headless check).
  for (const [slot, at] of Object.entries(ANCHORS)) {
    figure.append(
      el("span", {
        class: "od-anchor",
        attrs: { "data-slot": slot, "aria-hidden": "true" },
        style: { left: `${at.x}%`, top: `${(at.y / 140) * 100}%` },
      }),
    );
  }
  const scene = el("div", { class: `od-scene od-scene--${level.weather}` }, [figure]);
  scene.style.background = WEATHER_BG[level.weather];

  const tray = el("div", { class: "od-tray" });
  const stops: Array<() => void> = [];
  for (const id of shuffle([...level.wear, ...level.extra])) {
    const item = ITEMS[id]!;
    const good = level.wear.includes(id);
    const node = el(
      "div",
      {
        class: "od-item",
        attrs: { "data-id": id, "data-slot": item.slot, "data-good": good ? "1" : "0", role: "img", "aria-label": item.name },
      },
      [svgNode(iconSvg(item), "od-item__art"), el("span", { class: "od-item__name", text: item.name })],
    );
    tray.append(node);
    stops.push(
      draggable(node, {
        onStart: () => {
          audio.unlock();
          audio.play("pick");
        },
        onDrop: (center) => {
          const r = figure.getBoundingClientRect();
          const pad = 30;
          const onFox = center.x > r.left - pad && center.x < r.right + pad && center.y > r.top - pad && center.y < r.bottom + pad;
          if (!onFox) return false;
          const result = tryWear(id, level.weather, worn);
          if (result === "wear") {
            worn.push(id);
            const layer = svgNode(overlaySvg(item), "od-wear");
            layer.style.zIndex = String(LAYER[item.slot]);
            layer.dataset.id = id;
            figure.append(layer);
            node.classList.add("is-placed");
            audio.play("snap");
            if (dressed(level.wear, worn)) {
              figure.classList.add("is-done");
              api.win(starsFor(misses), "Рыжик готов к прогулке!");
            }
            return true;
          }
          if (result === "wrong") {
            misses++;
            audio.play("miss");
            node.classList.remove("is-wrong");
            void node.offsetWidth;
            node.classList.add("is-wrong");
            hint(stage, `${item.why} Сегодня ${WEATHER[level.weather].name.toLowerCase()}!`, 2400);
          }
          return false;
        },
      }),
    );
  }

  stage.append(banner, scene, tray);
  return () => {
    for (const stop of stops) stop();
  };
}
