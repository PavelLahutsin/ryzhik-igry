import { audio } from "../../shared/audio";
import { character } from "../../shared/assets";
import { el } from "../../shared/dom";
import { draggable, type Point } from "../../shared/drag";
import { mountLevelGame, type PlayApi } from "../../shared/levelgame";
import { OBJECTS, type ObjectId } from "../../shared/objects";
import { reducedMotion, useStyles } from "../../shared/style";
import { svgNode } from "../../shared/ui";
import baseCss from "../../shared/base.css?inline";
import css from "./style.css?inline";
import {
  badgeOk,
  basketArt,
  catTreeScene,
  clinicScene,
  coinArt,
  forestFireScene,
  houseFireScene,
  kitchenScene,
  roomScene,
  tillArt,
  TOOLS,
} from "./art";
import { levels, worlds, type GuidedLevel, type SafetyLevel, type Scenario, type SceneId, type ShopLevel } from "./data";
import {
  addToCart,
  cartComplete,
  coinsNeeded,
  countWord,
  currentStep,
  dangersLeft,
  dropTool,
  remaining,
  rubProgress,
  rubTool,
  startGuided,
  startSafety,
  starsFor,
  tapThing,
  type Cart,
} from "./logic";

/** «Профессии»: doctor, firefighter, shop and a safe home — step by step, with Ryzhik's help. */
export function mount(root: HTMLElement): () => void {
  useStyles(baseCss, css);
  return mountLevelGame(
    {
      id: "professii",
      title: "Профессии",
      subtitle: "Поиграй в доктора, пожарного и магазин — Рыжик подскажет, что делать",
      levels,
      worlds,
      thumb: (level) => svgNode(thumbArt(level), "pr-thumb"),
      caption: (level) => level.title,
      play,
    },
    root,
  );
}

const WARN = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 12 L90 84 H10 Z" fill="#ffc94a" stroke="#3b2e25" stroke-width="5" stroke-linejoin="round"/><path d="M50 38 V60" stroke="#3b2e25" stroke-width="8" stroke-linecap="round"/><circle cx="50" cy="72" r="5" fill="#3b2e25"/></svg>`;

function thumbArt(level: Scenario): string {
  if (level.kind === "shop") return OBJECTS[level.icon as ObjectId]?.svg ?? WARN;
  if (level.kind === "safety") return WARN;
  return TOOLS[level.icon]?.art ?? WARN;
}

const SCENES: Record<SceneId, () => string> = {
  zayka: () => clinicScene("zayka"),
  kotik: () => clinicScene("kotik"),
  mishka: () => clinicScene("mishka"),
  "house-fire": houseFireScene,
  "cat-tree": catTreeScene,
  "forest-fire": forestFireScene,
};

type Ctx = {
  stage: HTMLElement;
  api: PlayApi;
  later: (fn: () => void, ms: number) => void;
  cleanups: (() => void)[];
};

function play(stage: HTMLElement, level: Scenario, _index: number, api: PlayApi): () => void {
  const timers = new Set<number>();
  const cleanups: (() => void)[] = [];
  const later = (fn: () => void, ms: number): void => {
    const t = window.setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
  };
  const ctx: Ctx = { stage, api, later, cleanups };
  stage.classList.add("pr-stage");
  if (level.kind === "steps") playSteps(ctx, level);
  else if (level.kind === "shop") playShop(ctx, level);
  else playSafety(ctx, level);
  return () => {
    for (const t of timers) clearTimeout(t);
    for (const c of cleanups) c();
    stage.classList.remove("pr-stage");
  };
}

// ---------------------------------------------------------------- shared bits

function guideBar(text: string): { node: HTMLElement; say: (t: string) => void; dots: (done: number, total: number) => void } {
  const bubble = el("p", { class: "pr-guide__text", attrs: { "aria-live": "polite" }, text });
  const dotRow = el("div", { class: "pr-guide__dots" });
  const node = el("div", { class: "pr-guide" }, [
    el("img", { class: "pr-guide__fig", attrs: { src: character("ryzhik"), alt: "", draggable: "false" } }),
    el("div", { class: "pr-guide__bubble" }, [bubble, dotRow]),
  ]);
  return {
    node,
    say: (t) => {
      if (bubble.textContent === t) return;
      bubble.textContent = t;
      bubble.classList.remove("is-new");
      void bubble.offsetWidth;
      bubble.classList.add("is-new");
    },
    dots: (done, total) => {
      dotRow.replaceChildren(...Array.from({ length: total }, (_, i) => el("i", { class: i < done ? "is-done" : i === done ? "is-now" : "" })));
    },
  };
}

function sceneBox(markup: string, cls = ""): { box: HTMLElement; svg: SVGSVGElement } {
  const holder = svgNode(markup, `pr-scene ${cls}`);
  const svg = holder.querySelector("svg")!;
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  const box = el("div", { class: "pr-scene-wrap" }, [holder]);
  return { box, svg };
}

function restart(node: Element, cls: string): void {
  node.classList.remove(cls);
  void (node as HTMLElement).getBoundingClientRect();
  node.classList.add(cls);
}

/** A little hand that travels from one place to another (guidance). */
function showHand(layer: HTMLElement, from: Point, to: Point): void {
  if (reducedMotion()) return;
  const base = layer.getBoundingClientRect();
  const hand = svgNode(
    `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="22" fill="rgba(255,138,61,.35)"/><circle cx="30" cy="30" r="12" fill="#ff8a3d" stroke="#fff" stroke-width="4"/></svg>`,
    "pr-hand",
  );
  layer.append(hand);
  const a = { x: from.x - base.left - 30, y: from.y - base.top - 30 };
  const b = { x: to.x - base.left - 30, y: to.y - base.top - 30 };
  const anim = hand.animate(
    [
      { transform: `translate(${a.x}px, ${a.y}px) scale(.6)`, opacity: 0 },
      { transform: `translate(${a.x}px, ${a.y}px) scale(1)`, opacity: 1, offset: 0.15 },
      { transform: `translate(${b.x}px, ${b.y}px) scale(1)`, opacity: 1, offset: 0.8 },
      { transform: `translate(${b.x}px, ${b.y}px) scale(.6)`, opacity: 0 },
    ],
    { duration: 1600, easing: "ease-in-out" },
  );
  anim.onfinish = () => hand.remove();
}

const mid = (n: Element): Point => {
  const r = n.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

// ---------------------------------------------------------------- guided steps (doctor, firefighter)

function playSteps(ctx: Ctx, level: GuidedLevel): void {
  const { stage, api, later } = ctx;
  const g = startGuided();
  let hints = 0;
  let idle = 0;
  let finished = false;

  const guide = guideBar(level.intro);
  const { box, svg } = sceneBox(SCENES[level.scene](), `pr-scene--${level.scene}`);
  const patient = svg.querySelector<SVGGElement>(".pr-patient");
  if (patient && level.mood !== undefined) patient.setAttribute("class", `pr-patient ${level.mood}`);
  for (const id of level.start ?? []) svg.querySelector(`[data-fx="${id}"]`)?.classList.add("is-on");
  if (!reducedMotion()) svg.classList.add("is-live");

  const tray = el("div", { class: "pr-tray", attrs: { role: "list" } });
  const layout = el("div", { class: "pr-layout" }, [guide.node, box, tray]);
  stage.append(layout);

  const zonesAt = (p: Point): string[] =>
    document
      .elementsFromPoint(p.x, p.y)
      .map((n) => (n as SVGElement).dataset?.zone)
      .filter((z): z is string => !!z);
  const scale = (): number => svg.getBoundingClientRect().width / 1000 || 1;

  function sayStep(): void {
    const cur = currentStep(level.steps, g);
    guide.dots(g.step, level.steps.length);
    if (cur) guide.say(cur.say);
  }

  function applyStep(step: (typeof level.steps)[number]): void {
    for (const id of step.hide ?? []) svg.querySelector(`[data-fx="${id}"]`)?.classList.remove("is-on");
    for (const id of step.show ?? []) {
      svg.classList.add(`fx-${id}`);
      svg.querySelectorAll(`[data-fx="${id}"]`).forEach((n) => {
        restart(n, "is-on");
        if (n.classList.contains("pr-fx--flash")) later(() => n.classList.remove("is-on"), 1800);
      });
    }
    if (step.kind === "rub") {
      svg.querySelectorAll(`[data-life="${step.zone}"]`).forEach((n) => n.classList.add("is-out"));
      svg.querySelectorAll(`[data-soot="${step.zone}"]`).forEach((n) => n.classList.add("is-on"));
    }
    if (patient && step.mood !== undefined) {
      patient.setAttribute("class", `pr-patient ${step.mood}`);
      restart(patient, "is-react");
    }
  }

  function stepDone(): void {
    const step = level.steps[g.step - 1]!;
    applyStep(step);
    idle = 0;
    tray.querySelectorAll(".pr-tool").forEach((t) => t.classList.remove("is-needed", "is-busy"));
    if (g.step >= level.steps.length) {
      finished = true;
      api.setHint(null);
      guide.dots(level.steps.length, level.steps.length);
      guide.say(level.done);
      audio.play("magic");
      if (level.scene === "house-fire" || level.scene === "cat-tree") later(() => audio.play("honk"), 500);
      later(() => api.win(starsFor(g.misses, hints), level.done), 2200);
      return;
    }
    audio.play(step.kind === "rub" ? "pop" : "ding");
    if (step.done) {
      guide.say(step.done);
      later(() => !finished && sayStep(), 1500);
      guide.dots(g.step, level.steps.length);
    } else sayStep();
  }

  for (const id of level.tools) {
    const tool = TOOLS[id]!;
    const node = el("div", { class: "pr-tool", attrs: { role: "listitem", "aria-label": tool.name, "data-tool": id } }, [
      svgNode(tool.art, "pr-tool__art"),
      el("span", { class: "pr-tool__name", text: tool.name }),
    ]);
    tray.append(node);
    let last: Point | null = null;
    let soundAt = 0;
    ctx.cleanups.push(
      draggable(node, {
        onStart: () => {
          audio.unlock();
          audio.play("pick");
          last = null;
          idle = 0;
        },
        onMove: (p) => {
          if (finished) return;
          const cur = currentStep(level.steps, g);
          if (!cur || cur.kind !== "rub" || cur.tool !== id) return;
          const zones = zonesAt(p);
          const dist = last ? Math.hypot(p.x - last.x, p.y - last.y) / scale() : 0;
          last = p;
          const res = rubTool(level.steps, g, id, zones, dist);
          node.classList.toggle("is-busy", res === "rubbing");
          if (res === "rubbing") {
            const life = 1 - rubProgress(level.steps, g);
            svg.querySelectorAll<SVGElement>(`[data-life="${cur.zone}"]`).forEach((n) => n.style.setProperty("--life", life.toFixed(2)));
            const now = performance.now();
            if (now - soundAt > 260) {
              soundAt = now;
              audio.play(id === "shovel" ? "chop" : id === "cotton" ? "tap" : "drip");
            }
          } else if (res === "next" || res === "finish") stepDone();
        },
        onDrop: (p) => {
          node.classList.remove("is-busy");
          if (finished) return false;
          const zones = zonesAt(p);
          const cur = currentStep(level.steps, g);
          const res = dropTool(level.steps, g, id, zones);
          if (res === "next" || res === "finish") {
            stepDone();
          } else if (res === "wrong-tool" && cur) {
            audio.play("boing");
            guide.say(`Это ${tool.name.toLowerCase()}. А сейчас нужен другой предмет: ${TOOLS[cur.tool]!.name.toLowerCase()}.`);
            restart(node, "is-wrong");
            later(() => !finished && sayStep(), 2600);
          } else if (res === "wrong-place" && cur) {
            audio.play("miss");
            guide.say("Почти! Попробуй вот сюда.");
            const z = svg.querySelector(`[data-zone="${cur.zone}"]`);
            if (z) restart(z, "is-show");
            later(() => !finished && sayStep(), 2200);
          } else if (res === "rubbing") {
            guide.say("Води туда-сюда, не отпуская!");
          }
          return false;
        },
      }),
    );
  }

  function guideHand(): void {
    const cur = currentStep(level.steps, g);
    if (!cur) return;
    const tool = tray.querySelector(`[data-tool="${cur.tool}"]`);
    const z = svg.querySelector(`[data-zone="${cur.zone}"]`);
    if (!tool || !z) return;
    restart(tool, "is-needed");
    showHand(layout, mid(tool), mid(z));
  }

  api.setHint(() => {
    if (finished) return;
    hints++;
    guideHand();
  });

  // Gentle guidance when the child waits: the needed tool glows.
  const tick = window.setInterval(() => {
    if (finished) return;
    idle++;
    if (idle === 8) {
      const cur = currentStep(level.steps, g);
      const tool = cur && tray.querySelector(`[data-tool="${cur.tool}"]`);
      if (tool) restart(tool, "is-needed");
      idle = 0;
    }
  }, 1000);
  ctx.cleanups.push(() => clearInterval(tick));

  guide.dots(0, level.steps.length);
  later(() => !finished && sayStep(), 2200);
}

// ---------------------------------------------------------------- shop

function playShop(ctx: Ctx, level: ShopLevel): void {
  const { stage, api, later } = ctx;
  const cart: Cart = {};
  let misses = 0;
  let hints = 0;
  let paid = 0;
  const need = coinsNeeded(level.list);
  const guide = guideBar(level.intro);
  guide.dots(0, need);

  const listRows = level.list.map((line) =>
    el("div", { class: "pr-list__row", attrs: { "data-id": line.id } }, [
      svgNode(OBJECTS[line.id as ObjectId].svg, "pr-list__art"),
      el("b", { class: "pr-list__n", text: `× ${line.n}` }),
      el("span", { class: "pr-list__check", text: "✓" }),
    ]),
  );
  const list = el("div", { class: "pr-list" }, [el("p", { class: "pr-list__title", text: "Список" }), ...listRows]);
  const basketItems = el("div", { class: "pr-basket__items" });
  const basket = el("div", { class: "pr-basket" }, [svgNode(basketArt(), "pr-basket__art"), basketItems]);
  const shelf = el("div", { class: "pr-shelf" });
  const area = el("div", { class: "pr-shop" }, [shelf, basket]);
  const layout = el("div", { class: "pr-layout pr-layout--shop" }, [guide.node, area, list]);
  stage.append(layout);

  const inside = (p: Point, n: Element): boolean => {
    const r = n.getBoundingClientRect();
    return p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom;
  };
  const bought = (): number => Object.values(cart).reduce((s, n) => s + n, 0);

  function take(id: string, from: HTMLElement): boolean {
    const res = addToCart(level.list, cart, id);
    if (res === "not-on-list" || res === "enough") {
      misses++;
      audio.play("boing");
      restart(from, "is-wrong");
      guide.say(res === "enough" ? `${OBJECTS[id as ObjectId].name}: уже хватит!` : `${OBJECTS[id as ObjectId].name}? Этого нет в списке.`);
      return false;
    }
    audio.play("pop");
    const item = svgNode(OBJECTS[id as ObjectId].svg, "pr-basket__item");
    basketItems.append(item);
    if (!reducedMotion()) {
      const a = from.getBoundingClientRect();
      const b = item.getBoundingClientRect();
      item.animate([{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(1.6)` }, { transform: "none" }], {
        duration: 420,
        easing: "cubic-bezier(.3,1.3,.5,1)",
      });
    }
    const row = listRows.find((r) => r.dataset.id === id)!;
    const left = remaining(level.list, cart, id);
    row.querySelector(".pr-list__n")!.textContent = left === 0 ? "" : `× ${left}`;
    if (res === "line-done") {
      row.classList.add("is-done");
      audio.play("ding");
    }
    restart(row, "is-bump");
    guide.dots(bought(), need);
    guide.say(left > 0 ? `Ещё ${left}!` : "Отлично! Что дальше по списку?");
    if (cartComplete(level.list, cart)) later(pay, 900);
    return true;
  }

  for (const id of level.shelf) {
    const item = el("button", { class: "pr-shelf__item", attrs: { type: "button", "aria-label": OBJECTS[id as ObjectId].name, "data-id": id } }, [
      svgNode(OBJECTS[id as ObjectId].svg, "pr-shelf__art"),
    ]);
    shelf.append(item);
    let moved = false;
    let start: Point = { x: 0, y: 0 };
    ctx.cleanups.push(
      draggable(item, {
        onStart: () => {
          audio.unlock();
          moved = false;
          start = mid(item);
        },
        onMove: (p) => {
          if (Math.hypot(p.x - start.x, p.y - start.y) > 14) moved = true;
        },
        onDrop: (p) => {
          if (cartComplete(level.list, cart)) return false;
          if (!moved || inside(p, basket)) take(id, item);
          return false;
        },
      }),
    );
  }

  function pay(): void {
    guide.say(`Всё купили! Теперь заплати: положи в кассу ${need} ${need === 1 ? "монетку" : need < 5 ? "монетки" : "монеток"}.`);
    guide.dots(0, need);
    const counter = el("b", { class: "pr-till__count", text: "0" });
    const till = el("div", { class: "pr-till" }, [svgNode(tillArt(), "pr-till__art"), counter]);
    const cashier = el("img", { class: "pr-cashier", attrs: { src: character("mama"), alt: "", draggable: "false" } });
    const coins = el("div", { class: "pr-coins" });
    const counterArea = el("div", { class: "pr-pay" }, [el("div", { class: "pr-pay__desk" }, [cashier, till]), coins]);
    shelf.replaceWith(counterArea);
    basket.classList.add("is-paying");
    for (let i = 0; i < need + 2; i++) {
      const coin = el("div", { class: "pr-coin", attrs: { "aria-label": "Монетка" } }, [svgNode(coinArt(), "pr-coin__art")]);
      coins.append(coin);
      ctx.cleanups.push(
        draggable(coin, {
          onStart: () => audio.play("pick"),
          onDrop: (p) => {
            if (paid >= need || !inside(p, till)) return false;
            paid++;
            coin.classList.add("is-placed");
            coin.style.visibility = "hidden";
            counter.textContent = String(paid);
            restart(till, "is-bump");
            audio.tone(523 * Math.pow(2, (paid - 1) / 12), 0.16);
            guide.dots(paid, need);
            guide.say(`${countWord(paid)}!`);
            if (paid === need) {
              audio.play("ding");
              later(() => {
                guide.say("Спасибо за покупки! — говорит продавец.");
                audio.play("magic");
              }, 500);
              api.setHint(null);
              later(() => api.win(starsFor(misses, hints), level.done), 1900);
            }
            return true;
          },
        }),
      );
    }
    api.setHint(() => {
      hints++;
      const coin = coins.querySelector(".pr-coin:not(.is-placed)");
      if (coin) showHand(layout, mid(coin), mid(till));
    });
  }

  api.setHint(() => {
    if (cartComplete(level.list, cart)) return;
    hints++;
    const line = level.list.find((l) => remaining(level.list, cart, l.id) > 0);
    const item = line && shelf.querySelector(`[data-id="${line.id}"]`);
    if (item) {
      restart(item, "is-needed");
      showHand(layout, mid(item), mid(basket));
    }
  });
}

// ---------------------------------------------------------------- safety

function playSafety(ctx: Ctx, level: SafetyLevel): void {
  const { stage, api, later } = ctx;
  const s = startSafety();
  let hints = 0;
  const total = level.things.filter((t) => t.danger).length;
  const guide = guideBar(level.intro);
  guide.dots(0, total);
  const { box, svg } = sceneBox(level.room === "kitchen" ? kitchenScene() : roomScene(), `pr-scene--${level.room}`);
  if (!reducedMotion()) svg.classList.add("is-live");
  const layout = el("div", { class: "pr-layout pr-layout--safety" }, [guide.node, box]);
  stage.append(layout);

  const onTap = (e: Event): void => {
    const node = (e.target as Element).closest<SVGGElement>("[data-thing]");
    if (!node || dangersLeft(level.things, s).length === 0) return;
    audio.unlock();
    const id = node.dataset.thing!;
    const thing = level.things.find((t) => t.id === id)!;
    const res = tapThing(level.things, s, id);
    if (res === "found") {
      audio.play("ding");
      node.classList.add("is-found");
      const hit = node.querySelector<SVGGraphicsElement>(".pr-thing__hit")!;
      const b = hit.getBBox();
      const badge = document.createElementNS("http://www.w3.org/2000/svg", "g");
      badge.setAttribute("transform", `translate(${b.x + b.width - 10} ${b.y + 14})`);
      badge.innerHTML = badgeOk;
      svg.append(badge);
      guide.say(thing.say);
      guide.dots(s.found.length, total);
      if (dangersLeft(level.things, s).length === 0) {
        api.setHint(null);
        later(() => {
          guide.say(level.done);
          audio.play("magic");
        }, 2200);
        later(() => api.win(starsFor(Math.max(0, s.safeTaps.length - 1), hints), level.done), 3600);
      }
    } else if (res === "again") {
      guide.say(thing.say);
    } else {
      audio.play("boing");
      restart(node, "is-wiggle");
      guide.say(thing.say);
    }
  };
  svg.addEventListener("click", onTap);
  ctx.cleanups.push(() => svg.removeEventListener("click", onTap));

  api.setHint(() => {
    const left = dangersLeft(level.things, s)[0];
    if (!left) return;
    hints++;
    const node = svg.querySelector(`[data-thing="${left.id}"]`);
    if (node) restart(node, "is-hint");
  });
}
