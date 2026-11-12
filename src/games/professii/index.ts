import { audio } from "../../shared/audio";
import { character } from "../../shared/assets";
import { el, svgEl, replayClass } from "../../shared/dom";
import { draggable, type Point } from "../../shared/drag";
import { createScope, type Scope } from "../../shared/lifecycle";
import { mountLevelGame, type PlayApi } from "../../shared/levelgame";
import { OBJECTS, type ObjectId } from "../../shared/objects";
import { reducedMotion, useStyles } from "../../shared/style";
import { svgNode } from "../../shared/ui";
import { showDrag, showTap } from "../../shared/guide";
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
  sceneFit,
  usedUp,
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
  scope: Scope;
};

function play(stage: HTMLElement, level: Scenario, _index: number, api: PlayApi): () => void {
  const scope = createScope();
  const { later } = scope;
  const ctx: Ctx = { stage, api, later, scope };
  stage.classList.add("pr-stage");
  if (level.kind === "steps") playSteps(ctx, level);
  else if (level.kind === "shop") playShop(ctx, level);
  else playSafety(ctx, level);
  return () => {
    scope.dispose();
    stage.classList.remove("pr-stage");
  };
}

// ---------------------------------------------------------------- shared bits

function guideBar(text: string): { node: HTMLElement; say: (t: string) => void; dots: (done: number, total: number) => void } {
  const bubble = el("p", { class: "pr-guide__text", attrs: { "aria-live": "polite" }, text });
  const dotRow = el("div", { class: "pr-guide__dots" });
  const node = el("div", { class: "pr-guide" }, [
    el("div", { class: "pr-guide__bubble" }, [bubble, dotRow]),
  ]);
  return {
    node,
    say: (t) => {
      if (bubble.textContent === t) return;
      bubble.textContent = t;
      replayClass(bubble, "is-new");
    },
    dots: (done, total) => {
      dotRow.replaceChildren(...Array.from({ length: total }, (_, i) => el("i", { class: i < done ? "is-done" : i === done ? "is-now" : "" })));
    },
  };
}

/** Wall/sky above and floor/grass below each scene, so a tall phone screen is filled. */
const BLEED: Record<string, [string, string]> = {
  zayka: ["#e6f3f6", "#e2cfb2"],
  kotik: ["#e6f3f6", "#e2cfb2"],
  mishka: ["#e6f3f6", "#e2cfb2"],
  "house-fire": ["#9fd8f2", "#8fd06f"],
  "cat-tree": ["#9fd8f2", "#8fd06f"],
  "forest-fire": ["#9fd8f2", "#7cc46a"],
  kitchen: ["#fff4e0", "#d9c3a5"],
  room: ["#eef0fa", "#d9c3a5"],
};

/**
 * The scene is drawn in a 1000 × 800 box. On a wide screen it keeps that
 * shape; on a tall one the picture grows taller (more wall/sky above, more
 * floor below) instead of leaving empty space.
 */
/** What each tool sounds like when it does its job. */
const TOOL_SOUND: Partial<Record<string, Parameters<typeof audio.play>[0]>> = {
  thermo: "beep",
  medicine: "pour",
  blanket: "rustle",
  tea: "pour",
  honey: "pour",
  cotton: "rustle",
  cream: "pop",
  bandage: "plaster",
  sticker: "plaster",
  light: "click",
  spray: "spray",
  scarf: "rustle",
  stethoscope: "thump",
  hose: "clack",
  ladder: "clack",
  glove: "pop",
  milk: "pour",
  bucket: "splash",
  water: "spray",
  shovel: "rustle",
};

function sceneBox(markup: string, id: string, scope: Scope): { box: HTMLElement; svg: SVGSVGElement } {
  const holder = svgNode(markup, `pr-scene pr-scene--${id}`);
  const svg = holder.querySelector("svg")!;
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  const [top, bottom] = BLEED[id] ?? ["#fff", "#fff"];
  for (const [y, fill] of [
    [-3000, top],
    [800, bottom],
  ] as const) {
    svg.prepend(svgEl("rect", { x: -500, y, width: 2000, height: 3000, fill }));
  }
  const box = el("div", { class: "pr-scene-wrap" }, [holder]);
  const fit = (): void => {
    const w = box.clientWidth;
    const h = box.clientHeight;
    if (!w || !h) return;
    const f = sceneFit(w, h);
    holder.style.width = `${f.width}px`;
    holder.style.height = `${f.height}px`;
    svg.setAttribute("viewBox", f.viewBox);
  };
  const ro = new ResizeObserver(fit);
  ro.observe(box);
  scope.add(() => ro.disconnect());
  return { box, svg };
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
  let finished = false;

  const guide = guideBar(level.intro);
  if (level.id === "vrach-zayka") audio.say("v31");
  if (level.scene === "house-fire" || level.scene === "forest-fire") later(() => audio.say("v32"), 1400);
  // The fire engine arrives with its siren.
  if (level.scene === "house-fire" || level.scene === "forest-fire") later(() => audio.play("siren"), 400);
  const { box, svg } = sceneBox(SCENES[level.scene](), level.scene, ctx.scope);
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
        replayClass(n, "is-on");
        if (n.classList.contains("pr-fx--flash")) later(() => n.classList.remove("is-on"), 1800);
      });
    }
    if (step.kind === "rub") {
      svg.querySelectorAll(`[data-life="${step.zone}"]`).forEach((n) => n.classList.add("is-out"));
      svg.querySelectorAll(`[data-soot="${step.zone}"]`).forEach((n) => n.classList.add("is-on"));
    }
    if (patient && step.mood !== undefined) {
      patient.setAttribute("class", `pr-patient ${step.mood}`);
      replayClass(patient, "is-react");
    }
  }

  function stepDone(): void {
    const step = level.steps[g.step - 1]!;
    applyStep(step);
    tray.querySelectorAll(".pr-tool").forEach((t) => t.classList.remove("is-needed", "is-busy"));
    // A tool whose work is done leaves the tray (it is in the scene now).
    for (const id of usedUp(level.steps, g)) {
      const t = tray.querySelector<HTMLElement>(`[data-tool="${id}"]`);
      if (t && !t.classList.contains("is-used")) {
        t.classList.add("is-used");
        t.setAttribute("aria-hidden", "true");
        later(() => (t.hidden = true), reducedMotion() ? 0 : 450);
      }
    }
    if (g.step >= level.steps.length) {
      finished = true;
      api.setHint(null);
      guide.dots(level.steps.length, level.steps.length);
      guide.say(level.done);
      audio.play("magic");
      if (level.scene === "house-fire" || level.scene === "cat-tree" || level.scene === "forest-fire") later(() => audio.play("siren"), 500);
      later(() => api.win(starsFor(g.misses, hints), level.done), 2200);
      return;
    }
    audio.play(TOOL_SOUND[step.tool] ?? (step.kind === "rub" ? "pop" : "ding"));
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
    ctx.scope.add(
      draggable(node, {
        onStart: () => {
          audio.unlock();
          audio.play("pick");
          last = null;
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
              audio.play(id === "shovel" ? "rustle" : id === "cotton" ? "rustle" : id === "water" ? "spray" : "splash");
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
            replayClass(node, "is-wrong");
            later(() => !finished && sayStep(), 2600);
          } else if (res === "wrong-place" && cur) {
            audio.play("miss");
            guide.say("Почти! Попробуй вот сюда.");
            const z = svg.querySelector(`[data-zone="${cur.zone}"]`);
            if (z) replayClass(z, "is-show");
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
    replayClass(tool, "is-needed");
    showDrag(mid(tool), mid(z));
  }

  api.setHint(() => {
    if (finished) return;
    hints++;
    guideHand();
  });

  // A child who cannot read yet: after a pause the hand shows the next move (no penalty).
  api.setDemo(() => !finished && guideHand());

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
  audio.say("v33");
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
      replayClass(from, "is-wrong");
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
      // Enough of this one: the shelf shows it is taken.
      from.classList.add("is-taken");
      from.setAttribute("aria-disabled", "true");
    }
    replayClass(row, "is-bump");
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
    ctx.scope.add(
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
          if (cartComplete(level.list, cart) || item.classList.contains("is-taken")) return false;
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
      ctx.scope.add(
        draggable(coin, {
          onStart: () => audio.play("pick"),
          onDrop: (p) => {
            if (paid >= need || !inside(p, till)) return false;
            paid++;
            coin.classList.add("is-placed");
            coin.style.visibility = "hidden";
            counter.textContent = String(paid);
            replayClass(till, "is-bump");
            audio.play("coin");
            guide.dots(paid, need);
            guide.say(`${countWord(paid)}!`);
            if (paid === need) {
              audio.play("till");
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
      if (coin) showDrag(mid(coin), mid(till));
    });
  }

  function shopHand(): void {
    if (cartComplete(level.list, cart)) {
      const coin = layout.querySelector(".pr-coin:not(.is-placed)");
      const till = layout.querySelector(".pr-till");
      if (coin && till && paid < need) showDrag(mid(coin), mid(till));
      return;
    }
    const line = level.list.find((l) => remaining(level.list, cart, l.id) > 0);
    const item = line && shelf.querySelector(`[data-id="${line.id}"]`);
    if (item) {
      replayClass(item, "is-needed");
      showDrag(mid(item), mid(basket));
    }
  }
  api.setDemo(shopHand);

  api.setHint(() => {
    if (cartComplete(level.list, cart)) return;
    hints++;
    shopHand();
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
  const { box, svg } = sceneBox(level.room === "kitchen" ? kitchenScene() : roomScene(), level.room, ctx.scope);
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
      const badge = svgEl("g");
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
      replayClass(node, "is-wiggle");
      guide.say(thing.say);
    }
  };
  svg.addEventListener("click", onTap);
  ctx.scope.add(() => svg.removeEventListener("click", onTap));

  api.setDemo(() => {
    const left = dangersLeft(level.things, s)[0];
    const hit = left && svg.querySelector(`[data-thing="${left.id}"] .pr-thing__hit`);
    if (hit) showTap(mid(hit));
  });

  api.setHint(() => {
    const left = dangersLeft(level.things, s)[0];
    if (!left) return;
    hints++;
    const node = svg.querySelector(`[data-thing="${left.id}"]`);
    if (node) replayClass(node, "is-hint");
  });
}
