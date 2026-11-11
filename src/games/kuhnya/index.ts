import { audio } from "../../shared/audio";
import { character } from "../../shared/assets";
import { el } from "../../shared/dom";
import { draggable, type Point } from "../../shared/drag";
import { gameFinds } from "../../shared/finds";
import { goHome } from "../../shared/router";
import { reducedMotion, useStyles } from "../../shared/style";
import { hint, svgNode, toolbar } from "../../shared/ui";
import { centre, showDrag, showTap, whenIdle } from "../../shared/guide";
import baseCss from "../../shared/base.css?inline";
import css from "./style.css?inline";
import { BIN, BOWL, faceArt, GLASS, INGREDIENT_ART, KITCHEN, PLATE, TABLE, TOOL_ART } from "./art";
import {
  addToTool,
  allFinds,
  BITES_TO_FULL,
  cook,
  dishName,
  GUEST_IDS,
  GUESTS,
  INGREDIENT_IDS,
  INGREDIENTS,
  mixColor,
  SAY,
  taste,
  type Dish,
  type GuestId,
  type Op,
  type Reaction,
} from "./logic";

const TOOLS: Array<{ op: Op; name: string; ask: string }> = [
  { op: "cut", name: "Доска", ask: "Стучи по доске — режем!" },
  { op: "fry", name: "Сковородка", ask: "Жарим!" },
  { op: "boil", name: "Кастрюля", ask: "Варим!" },
  { op: "blend", name: "Блендер", ask: "Нажми на блендер!" },
];

const SOUND: Record<Reaction, Parameters<typeof audio.play>[0]> = {
  love: "win",
  yum: "yum",
  ok: "tap",
  yuck: "yuck",
  raw: "yuck",
  sour: "boing",
  spicy: "whoosh",
  burnt: "chop",
};

/** «Кухня Рыжика»: cook anything, feed a guest, watch the reaction. Nothing to lose. */
export function mount(root: HTMLElement): () => void {
  useStyles(baseCss, css);
  const finds = gameFinds("kuhnya");
  const all = allFinds();
  let found = 0;
  let guest: GuestId = "ryzhik";
  let bites = 0;
  let busyEating = false;
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const t = window.setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
  };
  const stops: Array<() => void> = [];

  const score = el("span", { class: "list__score" });
  const paintScore = (): void => {
    score.textContent = `✦ ${found}/${all.length}`;
    score.setAttribute("aria-label", `Найдено реакций: ${found} из ${all.length}`);
  };
  void finds.load().then((list) => {
    found = list.filter((id) => all.includes(id)).length;
    paintScore();
    if (list.length === 0) hint(view, "Перетащи продукт на доску, сковородку, в кастрюлю или блендер — и угости гостя!", 3600);
  });

  // ------------------------------------------------ guest
  const fig = el("img", { class: "kt-guest__fig", attrs: { alt: "", draggable: "false" } });
  const face = el("span", { class: "kt-face", attrs: { "aria-hidden": "true" } });
  const bubble = el("p", { class: "kt-bubble", attrs: { role: "status" } });
  const meter = el("span", { class: "kt-meter", attrs: { "aria-hidden": "true" } });
  const picker = el(
    "div",
    { class: "kt-picker", attrs: { role: "group", "aria-label": "Кого угощаем" } },
    GUEST_IDS.map((id) =>
      el(
        "button",
        {
          class: "kt-picker__btn",
          attrs: { type: "button", "aria-label": GUESTS[id].name, "data-id": id },
          on: { click: () => pickGuest(id) },
        },
        [el("img", { attrs: { src: character(id), alt: "", draggable: "false" } })],
      ),
    ),
  );
  const guestBox = el("section", { class: "kt-guest", attrs: { "aria-label": "Гость" } }, [
    svgNode(KITCHEN, "kt-guest__back"),
    picker,
    el("div", { class: "kt-guest__stand" }, [fig, face, bubble]),
    el("div", { class: "kt-table" }, [svgNode(TABLE, "kt-table__art"), svgNode(PLATE, "kt-plate")]),
    meter,
  ]);

  function paintMeter(): void {
    meter.replaceChildren(...Array.from({ length: BITES_TO_FULL }, (_, i) => el("i", { class: i < bites ? "is-on" : "" })));
  }

  function pickGuest(id: GuestId): void {
    audio.unlock();
    audio.play("tap");
    guest = id;
    bites = 0;
    paintMeter();
    fig.src = character(id);
    fig.alt = GUESTS[id].name;
    for (const b of picker.querySelectorAll<HTMLElement>(".kt-picker__btn")) b.classList.toggle("is-on", b.dataset.id === id);
    face.classList.remove("is-on");
    restart(fig, "is-hop");
    say(id === "ryzhik" ? "Я голодный!" : id === "mama" ? "Что у нас на обед?" : id === "mishka" ? "Р-р-р, хочу кушать!" : "Фыр! Угостишь?");
  }

  function say(text: string, ms = 1800): void {
    bubble.textContent = text;
    restart(bubble, "is-open");
    later(() => bubble.classList.remove("is-open"), ms);
  }

  function restart(node: Element, cls: string): void {
    node.classList.remove(cls);
    void (node as HTMLElement).offsetWidth;
    node.classList.add(cls);
  }

  function puff(kind: "heart" | "steam" | "smoke" | "drop" | "star", count = 5): void {
    if (reducedMotion()) return;
    const stand = guestBox.querySelector(".kt-guest__stand")!;
    for (let i = 0; i < count; i++) {
      const p = el("i", { class: `kt-puff kt-puff--${kind}` });
      p.style.left = `${35 + Math.random() * 30}%`;
      p.style.top = `${20 + Math.random() * 15}%`;
      p.style.setProperty("--dx", `${(Math.random() - 0.5) * 120}px`);
      p.style.animationDelay = `${i * 90}ms`;
      stand.append(p);
      later(() => p.remove(), 1600 + i * 90);
    }
  }

  function feed(dish: Dish): void {
    if (busyEating) return;
    busyEating = true;
    const r = taste(guest, dish);
    audio.play("munch");
    later(() => audio.play("yum"), 380);
    restart(fig, "is-chew");
    later(() => {
      face.replaceChildren(svgNode(faceArt(r)));
      restart(face, "is-on");
      fig.className = "kt-guest__fig";
      restart(fig, `is-${r}`);
      audio.play(SOUND[r]);
      const list = SAY[r];
      say(list[Math.floor(Math.random() * list.length)]!);
      if (r === "love") puff("heart", 6);
      if (r === "spicy") puff("steam", 7);
      if (r === "burnt") puff("smoke", 6);
      if (r === "yuck" || r === "raw") puff("drop", 3);
      if (r === "yum") puff("star", 3);
      void finds.add(`${guest}:${r}`).then((isNew) => {
        if (!isNew) return;
        found++;
        paintScore();
        restart(score, "is-bump");
      });
      bites++;
      paintMeter();
      later(() => {
        busyEating = false;
        if (bites >= BITES_TO_FULL) {
          say("Я наелся! Спасибо!", 2200);
          restart(fig, "is-full");
          audio.play("magic");
          later(() => {
            bites = 0;
            paintMeter();
            say("Ой, опять проголодался!");
          }, 4200);
        }
      }, 1300);
    }, 900);
  }

  // ------------------------------------------------ tools
  type ToolRun = { op: Op; node: HTMLElement; slot: HTMLElement; contents: Dish[]; done: boolean; chops: number; timer: number };
  const tools: ToolRun[] = TOOLS.map(({ op, name }) => {
    const slot = el("span", { class: "kt-tool__slot" });
    const node = el(
      "div",
      { class: `kt-tool kt-tool--${op}`, attrs: { role: "button", tabindex: "0", "aria-label": name, "data-op": op } },
      [svgNode(TOOL_ART[op], "kt-tool__art"), slot, el("span", { class: "kt-tool__name", text: name })],
    );
    return { op, node, slot, contents: [], done: false, chops: 0, timer: 0 };
  });
  const bin = el("div", { class: "kt-bin", attrs: { role: "img", "aria-label": "Ведро: убрать" } }, [svgNode(BIN, "kt-bin__art")]);

  function paintTool(t: ToolRun): void {
    for (const n of t.slot.querySelectorAll(".kt-dish")) n.remove();
    t.contents.forEach((dish, i) => {
      const node = dishNode(dish);
      node.style.setProperty("--i", String(i));
      t.slot.append(node);
      stops.push(
        draggable(node, {
          onStart: () => audio.play("pick"),
          onDrop: (at) => {
            const target = targetAt(at);
            if (!target || (target.kind === "tool" && target.tool === t)) return false;
            if (target.kind === "bin") {
              t.contents.splice(i, 1);
              t.done = false;
              audio.play("whoosh");
              paintTool(t);
              return true;
            }
            if (target.kind === "guest") {
              if (busyEating) return false;
              t.contents.splice(i, 1);
              t.done = false;
              paintTool(t);
              feed(dish);
              return true;
            }
            if (put(target.tool, dish)) {
              t.contents.splice(i, 1);
              t.done = false;
              paintTool(t);
              return true;
            }
            return false;
          },
        }),
      );
    });
    t.node.classList.toggle("is-full", t.contents.length > 0);
  }

  function put(t: ToolRun, dish: Dish): boolean {
    if (t.done && t.op !== "boil") {
      // A finished dish is still there: make room first.
      hint(view, "Сначала забери готовое!", 1400);
      audio.play("miss");
      return false;
    }
    const next = addToTool(t.contents, dish, t.op);
    if (!next) {
      restart(t.node, "is-nope");
      audio.play("miss");
      return false;
    }
    t.contents = next;
    t.done = false;
    t.chops = 0;
    audio.play("pop");
    paintTool(t);
    if (t.op === "fry" || t.op === "boil") startCooking(t);
    if (t.op === "cut") say("Стучи по доске!", 1200);
    if (t.op === "blend" && t.contents.length === 1) say("Нажми на блендер!", 1200);
    return true;
  }

  function startCooking(t: ToolRun): void {
    window.clearTimeout(t.timer);
    t.node.classList.add("is-busy");
    audio.play(t.op === "fry" ? "sizzle" : "bubble");
    t.timer = window.setTimeout(() => finish(t), 1700);
  }

  function finish(t: ToolRun): void {
    t.node.classList.remove("is-busy");
    const dish = cook(t.contents, t.op);
    if (!dish) return;
    t.contents = [dish];
    t.done = true;
    paintTool(t);
    restart(t.node, "is-ready");
    audio.play("ding");
  }

  function useTool(t: ToolRun): void {
    audio.unlock();
    if (t.contents.length === 0) {
      restart(t.node, "is-nope");
      say("Положи сюда что-нибудь!", 1300);
      return;
    }
    if (t.op === "cut" && !t.done) {
      t.chops++;
      restart(t.node, "is-chop");
      audio.play("chop");
      if (t.chops >= 3) finish(t);
      return;
    }
    if (t.op === "blend" && !t.done && !t.node.classList.contains("is-busy")) {
      t.node.classList.add("is-busy");
      audio.play("blend");
      later(() => audio.play("blend"), 400);
      t.timer = window.setTimeout(() => finish(t), 1500);
      return;
    }
    restart(t.node, "is-wiggle");
  }

  for (const t of tools) {
    t.node.addEventListener("click", () => useTool(t));
    t.node.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        useTool(t);
      }
    });
  }

  // ------------------------------------------------ drop targets
  type Target = { kind: "tool"; tool: ToolRun } | { kind: "guest" } | { kind: "bin" };
  const inside = (node: Element, p: Point, pad = 0): boolean => {
    const r = node.getBoundingClientRect();
    return p.x > r.left - pad && p.x < r.right + pad && p.y > r.top - pad && p.y < r.bottom + pad;
  };
  function targetAt(p: Point): Target | null {
    for (const tool of tools) if (inside(tool.node, p, 6)) return { kind: "tool", tool };
    if (inside(bin, p, 6)) return { kind: "bin" };
    if (inside(guestBox, p)) return { kind: "guest" };
    return null;
  }

  // ------------------------------------------------ pantry
  const pantry = el("div", { class: "kt-pantry", attrs: { role: "list", "aria-label": "Продукты" } });
  for (const id of INGREDIENT_IDS) {
    const node = el("div", { class: "kt-food", attrs: { role: "listitem", "aria-label": INGREDIENTS[id].name } }, [
      svgNode(INGREDIENT_ART[id], "kt-food__art"),
    ]);
    pantry.append(node);
    stops.push(
      draggable(node, {
        onStart: () => {
          audio.unlock();
          audio.play("pick");
        },
        onMove: (p) => {
          for (const t of tools) t.node.classList.toggle("is-over", inside(t.node, p, 6));
          guestBox.classList.toggle("is-over", !tools.some((t) => inside(t.node, p, 6)) && inside(guestBox, p));
        },
        onDrop: (at) => {
          for (const t of tools) t.node.classList.remove("is-over");
          guestBox.classList.remove("is-over");
          const target = targetAt(at);
          const dish: Dish = { parts: [id], ops: [] };
          if (!target || target.kind === "bin") return false;
          if (target.kind === "guest") {
            if (busyEating) return false;
            feed(dish);
            return true;
          }
          return put(target.tool, dish);
        },
      }),
    );
  }

  // ------------------------------------------------ screen
  const view = el("div", { class: "screen screen--play game--kuhnya" }, [
    toolbar("Кухня Рыжика", goHome, el("span", { class: "toolbar__tools" }, [score])),
    el("div", { class: "kt-layout" }, [
      guestBox,
      el("div", { class: "kt-work" }, [el("div", { class: "kt-tools" }, [...tools.map((t) => t.node), bin]), pantry]),
    ]),
  ]);
  root.append(view);
  paintScore();
  pickGuest("ryzhik");

  // Nobody here reads yet: after a pause a hand shows the next thing to try.
  let demo = 0;
  stops.push(
    whenIdle(() => {
      const ready = tools.find((t) => t.done && t.contents.length > 0);
      const readyDish = ready?.slot.querySelector(".kt-dish");
      if (readyDish) return showDrag(centre(readyDish), centre(guestBox));
      const board = tools.find((t) => t.op === "cut" && t.contents.length > 0 && !t.done);
      if (board) return showTap(centre(board.node));
      const foods = [...pantry.querySelectorAll<HTMLElement>(".kt-food")];
      const loved = foods.find((f) => GUESTS[guest].loves.some((id) => INGREDIENTS[id].name === f.getAttribute("aria-label")));
      const food = loved ?? foods[0];
      if (!food) return;
      const cut = tools.find((t) => t.op === "cut")!;
      showDrag(centre(food), centre(demo++ % 2 === 0 ? guestBox : cut.node));
    }, 6000),
  );

  return () => {
    for (const t of timers) clearTimeout(t);
    for (const t of tools) window.clearTimeout(t.timer);
    for (const s of stops) s();
    view.remove();
  };
}

/** Picture of a dish: glass, soup bowl or the food itself, cut, boiled or fried. */
export function dishNode(dish: Dish): HTMLElement {
  const node = el("div", { class: "kt-dish", attrs: { role: "img", "aria-label": dishName(dish) } });
  if (dish.ops.includes("blend")) {
    node.append(svgNode(GLASS(mixColor(dish.parts)), "kt-dish__art"));
    return node;
  }
  if (dish.ops.includes("boil") && dish.parts.length > 1) {
    node.append(svgNode(BOWL(mixColor(dish.parts)), "kt-dish__art"));
    return node;
  }
  const art = INGREDIENT_ART[dish.parts[0]!];
  const fries = dish.ops.filter((o) => o === "fry").length;
  if (fries >= 2) node.classList.add("is-burnt");
  else if (fries) node.classList.add("is-fried");
  if (dish.ops.includes("boil")) node.classList.add("is-boiled");
  if (dish.ops.includes("cut")) {
    node.classList.add("is-cut");
    node.append(svgNode(art, "kt-dish__art kt-half kt-half--l"), svgNode(art, "kt-dish__art kt-half kt-half--r"));
  } else node.append(svgNode(art, "kt-dish__art"));
  return node;
}
