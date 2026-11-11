import { audio, NOTES } from "../../shared/audio";
import { character } from "../../shared/assets";
import { el, replayClass } from "../../shared/dom";
import { freeDrag } from "../../shared/drag";
import { gameFinds } from "../../shared/finds";
import { OBJECTS } from "../../shared/objects";
import { goHome } from "../../shared/router";
import { reducedMotion, useStyles } from "../../shared/style";
import { hint, svgNode, toolbar } from "../../shared/ui";
import baseCss from "../../shared/base.css?inline";
import { createScope } from "../../shared/lifecycle";
import css from "./style.css?inline";
import { BERRIES, CONE, FISH_JUMP, FX } from "./art";
import {
  CHAR_ASPECT,
  CHAR_HEIGHT,
  clampFoot,
  cycle,
  fitWorld,
  nearestSeat,
  react,
  WORLD_H,
  WORLD_W,
  type CarryId,
  type CharId,
  type Seat,
} from "./logic";
import { allFinds, PHRASES, SCENES, type PropDef, type PropState, type SceneDef } from "./scenes";

const CARRY_ART: Record<CarryId, string> = {
  apple: OBJECTS.apple.svg,
  carrot: OBJECTS.carrot.svg,
  mushroom: OBJECTS.mushroom.svg,
  cone: CONE,
  berries: BERRIES,
  ball: OBJECTS.ball.svg,
  cube: OBJECTS.cube.svg,
  car: OBJECTS.car.svg,
};
const CARRY_NAME: Record<CarryId, string> = {
  apple: "Яблоко",
  carrot: "Морковка",
  mushroom: "Грибок",
  cone: "Шишка",
  berries: "Черника",
  ball: "Мячик",
  cube: "Кубик",
  car: "Машинка",
};
const CARRY_SIZE = 110;
const MAX_CARRY = 8;

type CharState = { id: CharId; x: number; y: number; seat: string | null };
type SceneMemory = { chars: CharState[]; props: Record<string, { n: number; on: boolean }> };

const pct = (v: number, of: number): string => `${(v / of) * 100}%`;

/** «Домик Рыжика»: a free-play house, garden and forest. No tasks, nothing to lose. */
/** Each friend has a voice of their own when tapped. */
const CHAR_SOUND: Partial<Record<string, Parameters<typeof audio.play>[0]>> = {
  belka: "squirrel",
  ezhik: "hedgehog",
  mishka: "bear",
};

export function mount(root: HTMLElement): () => void {
  useStyles(baseCss, css);
  const finds = gameFinds("domik");
  const findTotal = allFinds().length;
  let found = 0;
  let night = false;
  let current = 0;
  let stopScene: (() => void) | null = null;
  const memory = new Map<string, SceneMemory>();

  const score = el("span", { class: "list__score dm-score", text: "" });
  const nightBtn = el("button", { class: "btn btn--back dm-night-btn", attrs: { type: "button", "aria-label": "День или ночь" } });
  const paintNightBtn = (): void => {
    nightBtn.replaceChildren(
      svgNode(
        night
          ? `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="9" fill="#ffd54a" stroke="#3b2e25" stroke-width="2.5"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${20 + Math.cos((i * Math.PI) / 4) * 13} ${20 + Math.sin((i * Math.PI) / 4) * 13} L${20 + Math.cos((i * Math.PI) / 4) * 17} ${20 + Math.sin((i * Math.PI) / 4) * 17}" stroke="#f5a623" stroke-width="3" stroke-linecap="round"/>`).join("")}</svg>`
          : `<svg viewBox="0 0 40 40"><path d="M26 6 A 15 15 0 1 0 34 28 A 12 12 0 1 1 26 6 Z" fill="#fff3b0" stroke="#3b2e25" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
        "dm-night-btn__art",
      ),
    );
    nightBtn.setAttribute("aria-label", night ? "Сделать день" : "Сделать ночь");
  };
  paintNightBtn();
  const tools = el("span", { class: "toolbar__tools" }, [score, nightBtn]);

  const scroller = el("div", { class: "dm-scroll" });
  const tabs = el("nav", { class: "dm-tabs", attrs: { "aria-label": "Где играть" } });
  const view = el("div", { class: "screen screen--play game--domik" }, [toolbar("Домик Рыжика", goHome, tools), el("div", { class: "stage dm-stage" }, [scroller]), tabs]);
  root.append(view);

  const paintScore = (): void => {
    score.textContent = `✦ ${found}/${findTotal}`;
    score.setAttribute("aria-label", `Найдено сюрпризов: ${found} из ${findTotal}`);
  };
  void finds.load().then((list) => {
    found = list.filter((id) => allFinds().includes(id)).length;
    paintScore();
  });
  const discover = (id: string): void => {
    void finds.add(id).then((isNew) => {
      if (!isNew) return;
      found++;
      paintScore();
      replayClass(score, "is-bump");
    });
  };

  const tabButtons = SCENES.map((scene, i) =>
    el(
      "button",
      {
        class: "dm-tab",
        attrs: { type: "button", "aria-label": scene.title },
        on: {
          click: () => {
            audio.unlock();
            audio.play("tap");
            show(i);
          },
        },
      },
      [svgNode(scene.icon, "dm-tab__icon"), el("span", { class: "dm-tab__name", text: scene.title })],
    ),
  );
  tabs.append(...tabButtons);

  let repaintNight: (() => void) | null = null;
  nightBtn.addEventListener("click", () => {
    audio.unlock();
    audio.play("magic");
    night = !night;
    audio.setTheme(night ? "domik-night" : "domik");
    paintNightBtn();
    view.classList.toggle("is-night", night);
    repaintNight?.();
    if (night) discover("night");
  });

  function show(i: number): void {
    current = i;
    tabButtons.forEach((b, j) => {
      b.classList.toggle("is-on", j === i);
      b.setAttribute("aria-pressed", j === i ? "true" : "false");
    });
    stopScene?.();
    scroller.replaceChildren();
    const scene = SCENES[i]!;
    const mem =
      memory.get(scene.id) ??
      ({
        chars: scene.cast.map((c) => ({ ...c, seat: null })),
        props: Object.fromEntries(scene.props.map((p) => [p.id, { n: p.n ?? 0, on: p.tap === "curtains" }])),
      } satisfies SceneMemory);
    memory.set(scene.id, mem);
    const runtime = runScene(scene, mem);
    stopScene = runtime.stop;
    repaintNight = runtime.repaintNight;
  }

  // ---------------------------------------------------------------- scene
  function runScene(scene: SceneDef, mem: SceneMemory): { stop: () => void; repaintNight: () => void } {
    const scope = createScope();
    const { later } = scope;
    const world = el("div", { class: `dm-world dm-world--${scene.id}` });
    const back = el("div", { class: "dm-back" });
    const dark = el("div", { class: "dm-dark", attrs: { "aria-hidden": "true" } });
    const fxLayer = el("div", { class: "dm-fx-layer", attrs: { "aria-hidden": "true" } });
    world.append(back, dark, fxLayer);
    scroller.append(world);
    let unit = 1; // px per world unit

    const place = (node: HTMLElement, x: number, y: number, w: number, h: number): void => {
      node.style.left = pct(x, WORLD_W);
      node.style.top = pct(y, WORLD_H);
      node.style.width = pct(w, WORLD_W);
      node.style.height = pct(h, WORLD_H);
    };

    function fx(kind: keyof typeof FX, x: number, y: number, opts: { dx?: number; dy?: number; ms?: number; size?: number; delay?: number } = {}): void {
      if (reducedMotion() && kind !== "zzz") return;
      const size = opts.size ?? 44;
      const node = svgNode(FX[kind]!, "dm-fx");
      place(node, x - size / 2, y - size / 2, size, size);
      node.style.setProperty("--dx", `${(opts.dx ?? 0) * unit}px`);
      node.style.setProperty("--dy", `${(opts.dy ?? -120) * unit}px`);
      node.style.animationDuration = `${opts.ms ?? 1200}ms`;
      node.style.animationDelay = `${opts.delay ?? 0}ms`;
      fxLayer.append(node);
      later(() => node.remove(), (opts.ms ?? 1200) + (opts.delay ?? 0) + 50);
    }
    const burst = (kind: keyof typeof FX, x: number, y: number, count = 5, spread = 120): void => {
      for (let i = 0; i < count; i++) fx(kind, x + (Math.random() - 0.5) * spread * 0.5, y, { dx: (Math.random() - 0.5) * spread, dy: -80 - Math.random() * 120, delay: i * 70 });
    };
    const anim = (node: HTMLElement, cls: string, ms: number): void => {
      replayClass(node, cls);
      later(() => node.classList.remove(cls), ms);
    };

    // ---------------- props
    const propNodes = new Map<string, HTMLElement>();
    const stateOf = (prop: PropDef): PropState => ({ night, n: mem.props[prop.id]!.n, on: mem.props[prop.id]!.on });
    const paintProp = (prop: PropDef): void => {
      const node = propNodes.get(prop.id)!;
      const art = node.querySelector(".dm-prop__art");
      const next = svgNode(prop.art(stateOf(prop)), "dm-prop__art");
      if (art) art.replaceWith(next);
      else node.append(next);
    };
    for (const prop of scene.props) {
      const node = el("div", {
        class: `dm-prop dm-prop--${prop.id}${prop.tap === "none" ? " is-static" : ""}`,
        attrs: prop.tap === "none" ? { "aria-hidden": "true" } : { role: "button", tabindex: "0", "aria-label": prop.name },
      });
      place(node, prop.x, prop.y, prop.w, prop.h);
      node.style.zIndex = String(prop.z ?? 100 + Math.round((prop.y + prop.h) / 2));
      propNodes.set(prop.id, node);
      world.append(node);
      paintProp(prop);
      if (prop.tap !== "none") {
        const run = (): void => {
          audio.unlock();
          tapProp(prop, node);
          discover(`${scene.id}:${prop.id}`);
          node.classList.remove("is-calling");
          idle();
        };
        node.addEventListener("click", run);
        node.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            run();
          }
        });
      }
    }
    const propState = (id: string): { n: number; on: boolean } => mem.props[id]!;
    const centre = (prop: PropDef): { x: number; y: number } => ({ x: prop.x + prop.w / 2, y: prop.y + prop.h / 2 });

    let musicPlaying = false;
    let raining = false;

    function tapProp(prop: PropDef, node: HTMLElement): void {
      const st = propState(prop.id);
      const c = centre(prop);
      switch (prop.tap) {
        case "curtains":
          st.on = !st.on;
          paintProp(prop);
          audio.play("whoosh");
          break;
        case "lamp":
          st.on = !st.on;
          paintProp(prop);
          audio.play(st.on ? "ding" : "tap");
          paintDark();
          break;
        case "clock":
          anim(node, "is-spin", 1300);
          audio.play("ding");
          later(() => audio.play("ding"), 400);
          bubbleAt(c.x, prop.y, "Тик-так!");
          break;
        case "radio":
          if (musicPlaying) break;
          musicPlaying = true;
          anim(node, "is-shake", 3200);
          playTune();
          for (let i = 0; i < 8; i++) later(() => fx("note", c.x + 40, prop.y + 60, { dx: (Math.random() - 0.3) * 260, dy: -220, ms: 1500 }), i * 380);
          for (const ch of chars) if (!ch.state.seat) anim(ch.body, "is-dancing", 3200);
          later(() => (musicPlaying = false), 3300);
          break;
        case "toybox": {
          st.on = true;
          paintProp(prop);
          audio.play("pop");
          const toys: CarryId[] = ["ball", "cube", "car"];
          st.n = cycle(st.n, toys.length);
          spawnCarry(toys[st.n]!, c.x, prop.y + 60, c.x + (Math.random() > 0.5 ? 1 : -1) * (140 + Math.random() * 80), 900);
          later(() => {
            st.on = false;
            paintProp(prop);
          }, 1200);
          break;
        }
        case "plant":
          st.n = cycle(st.n, 4);
          paintProp(prop);
          audio.play(st.n === 0 ? "tap" : "magic");
          if (st.n) burst("star", c.x, prop.y + 40, 3);
          break;
        case "frame":
          anim(node, "is-wiggle", 600);
          burst("heart", c.x, prop.y + 20, 4);
          audio.play("yum");
          break;
        case "sun":
          if (night) {
            anim(node, "is-wiggle", 600);
            for (let i = 0; i < 8; i++) fx("star", 100 + Math.random() * 1400, 60 + Math.random() * 300, { dy: 0, ms: 1400, delay: i * 90 });
            audio.play("magic");
          } else {
            anim(node, "is-spin", 1300);
            audio.play("ding");
            bubbleAt(c.x - 120, prop.y + 150, "Тепло!");
          }
          break;
        case "cloud":
          anim(node, "is-wiggle", 600);
          if (raining) break;
          raining = true;
          for (let i = 0; i < 18; i++) later(() => fx("drop", prop.x + 40 + Math.random() * (prop.w - 80), prop.y + prop.h - 20, { dy: 520, ms: 900 }), i * 80);
          for (let i = 0; i < 5; i++) later(() => audio.play("drip"), i * 260);
          later(() => {
            raining = false;
            const bed = scene.props.find((p) => p.id === "flowerbed");
            if (bed) {
              const bs = propState("flowerbed");
              if (bs.n < 3) {
                bs.n++;
                paintProp(bed);
                anim(propNodes.get("flowerbed")!, "is-grow", 600);
                audio.play("magic");
                discover("sad:flowerbed");
              }
            }
          }, 1500);
          break;
        case "flowerbed":
          st.n = cycle(st.n, 4);
          paintProp(prop);
          anim(node, "is-grow", 600);
          audio.play(st.n ? "magic" : "pop");
          break;
        case "appletree":
          anim(node, "is-shake", 600);
          if (st.n > 0) {
            st.n--;
            paintProp(prop);
            audio.play("pop");
            spawnCarry("apple", prop.x + 180 + Math.random() * 200, prop.y + 220, prop.x + 120 + Math.random() * 300, 880 + Math.random() * 60);
          } else {
            st.n = 5;
            later(() => {
              paintProp(prop);
              audio.play("magic");
              burst("star", c.x, prop.y + 200, 5, 300);
            }, 500);
            bubbleAt(c.x, prop.y + 80, "Выросли новые яблоки!");
          }
          break;
        case "birdhouse":
          st.on = true;
          paintProp(prop);
          audio.play("tweet");
          later(() => audio.play("tweet"), 350);
          burst("note", c.x + 30, prop.y + 60, 3, 160);
          later(() => {
            st.on = false;
            paintProp(prop);
          }, 1800);
          break;
        case "butterfly":
          audio.play("sparkle");
          anim(node, "is-fly", 2600);
          audio.play("whoosh");
          break;
        case "carrots":
          if (st.n > 0) {
            st.n--;
            paintProp(prop);
            audio.play("pop");
            spawnCarry("carrot", prop.x + 40 + (3 - st.n) * 60, prop.y + 60, prop.x + 60 + Math.random() * 220, 930);
          } else {
            st.n = 4;
            paintProp(prop);
            audio.play("magic");
            bubbleAt(c.x, prop.y, "Морковка выросла!");
          }
          break;
        case "fir":
          anim(node, "is-shake", 600);
          audio.play("whoosh");
          spawnCarry("cone", prop.x + 100 + Math.random() * 100, prop.y + 260, prop.x + 60 + Math.random() * 200, 760 + Math.random() * 60);
          break;
        case "mushrooms":
          anim(node, "is-boing", 600);
          audio.play("boing");
          spawnCarry("mushroom", c.x, prop.y + 40, prop.x + Math.random() * 200, 930 + Math.random() * 40);
          break;
        case "frog":
          anim(node, "is-jump", 900);
          audio.play("frog");
          later(() => burst("bubble", prop.x + 40, prop.y + 80, 3, 80), 600);
          break;
        case "oak":
          if (night) {
            anim(node, "is-wiggle", 600);
            audio.play("owl");
            bubbleAt(prop.x + 160, prop.y + 300, "Уху-у!");
          } else {
            anim(node, "is-shake", 600);
            audio.play("whoosh");
            for (let i = 0; i < 7; i++) fx("leaf", prop.x + 40 + Math.random() * 240, prop.y + 120 + Math.random() * 120, { dx: (Math.random() - 0.5) * 160, dy: 260 + Math.random() * 120, ms: 1600, delay: i * 90 });
          }
          break;
        case "bush":
          anim(node, "is-shake", 600);
          if (st.n > 0) {
            st.n--;
            paintProp(prop);
            audio.play("pop");
            spawnCarry("berries", c.x, prop.y + 60, prop.x + Math.random() * 260, 820 + Math.random() * 60);
          } else {
            st.n = 6;
            later(() => paintProp(prop), 400);
            audio.play("magic");
            bubbleAt(c.x, prop.y, "Черника поспела!");
          }
          break;
        case "pond": {
          const fish = svgNode(FISH_JUMP, "dm-fish");
          const fx0 = prop.x + 40 + Math.random() * 160;
          place(fish, fx0, prop.y + 20, 120, 80);
          fxLayer.append(fish);
          later(() => fish.remove(), 1300);
          audio.play("drip");
          later(() => audio.play("splash"), 700);
          later(() => burst("bubble", fx0 + 100, prop.y + 70, 4, 100), 700);
          break;
        }
        case "stump":
          anim(node, "is-boing", 600);
          audio.play("chop");
          bubbleAt(c.x, prop.y, "Тук-тук!");
          break;
        case "none":
          break;
      }
    }

    function playTune(): void {
      const tune = [0, 2, 4, 0, 4, 5, 7, 7, 5, 4, 2, 0];
      tune.forEach((n, i) => later(() => audio.tone(NOTES[n]!, 0.2), i * 260));
    }

    function bubbleAt(x: number, y: number, text: string): void {
      const node = el("p", { class: "dm-bubble dm-bubble--free", text });
      node.style.left = pct(x, WORLD_W);
      node.style.top = pct(y, WORLD_H);
      fxLayer.append(node);
      later(() => node.remove(), 1700);
    }

    // ---------------- darkness
    function paintDark(): void {
      dark.className = "dm-dark";
      if (!night) return;
      if (scene.id === "dom") {
        const lamp = propState("lamp");
        dark.classList.add(lamp.on ? "is-lamp" : "is-dark");
      } else dark.classList.add("is-dusk");
    }

    // fireflies at night outdoors
    let flies: HTMLElement[] = [];
    function paintFlies(): void {
      for (const f of flies) f.remove();
      flies = [];
      if (!night || scene.id === "dom" || reducedMotion()) return;
      for (let i = 0; i < 10; i++) {
        const f = svgNode(FX.spark!, "dm-firefly");
        place(f, 100 + Math.random() * 1400, 300 + Math.random() * 450, 30, 30);
        f.style.animationDelay = `${-Math.random() * 4}s`;
        f.style.animationDuration = `${3 + Math.random() * 3}s`;
        fxLayer.append(f);
        flies.push(f);
      }
    }

    function repaintNight(): void {
      back.replaceChildren(svgNode(scene.back(night), "dm-back__art"));
      for (const prop of scene.props) paintProp(prop);
      paintDark();
      paintFlies();
      for (const ch of chars) if (ch.state.seat === "bed") sleepTick(ch);
    }

    // ---------------- characters
    type CharRun = { state: CharState; node: HTMLElement; body: HTMLElement; w: number; h: number };
    const chars: CharRun[] = [];
    const taken = (): Set<string> => new Set(chars.map((c) => c.state.seat).filter((s): s is string => !!s));
    const seatOf = (id: string | null): Seat | undefined => scene.seats.find((s) => s.id === id);

    const placeChar = (ch: CharRun): void => {
      const { x, y } = ch.state;
      place(ch.node, x - ch.w / 2, y - ch.h, ch.w, ch.h);
      const seat = seatOf(ch.state.seat);
      const z =
        seat?.pose === "sleep"
          ? 700
          : seat
            ? Number(propNodes.get(seat.id)?.style.zIndex ?? 300) + 1
            : 100 + Math.round(y / 2);
      ch.node.style.zIndex = String(z);
      ch.node.dataset.pose = seat?.pose ?? "stand";
      if (seat?.pose === "swing") {
        // Swing around the top bar of the swing.
        const swing = scene.props.find((p) => p.id === "swing")!;
        const pivotY = swing.y + 24;
        ch.body.style.transformOrigin = `50% ${((pivotY - (y - ch.h)) / ch.h) * 100}%`;
      } else ch.body.style.transformOrigin = "";
      propNodes.get("swing")?.classList.toggle("is-on", chars.some((c) => c.state.seat === "swing"));
    };

    function say(ch: CharRun, text: string): void {
      ch.node.querySelector(".dm-bubble")?.remove();
      const b = el("p", { class: "dm-bubble", text });
      ch.node.append(b);
      later(() => b.remove(), 1600);
    }

    function sleepTick(ch: CharRun): void {
      if (ch.state.seat !== "bed") return;
      fx("zzz", ch.state.x + 40, ch.state.y - ch.h * 0.7, { dx: 60, dy: -120, ms: 1800 });
    }
    const zzzTimer = window.setInterval(() => {
      for (const ch of chars) sleepTick(ch);
    }, 1400);

    for (const state of mem.chars) {
      const h = CHAR_HEIGHT[state.id];
      const w = h * CHAR_ASPECT[state.id];
      const body = el("img", { class: "dm-char__body", attrs: { src: character(state.id), alt: "", draggable: "false" } });
      const node = el("div", { class: "dm-char", attrs: { role: "button", tabindex: "0", "aria-label": nameOf(state.id) } }, [body]);
      const ch: CharRun = { state, node, body, w, h };
      chars.push(ch);
      world.append(node);
      placeChar(ch);
      body.style.animationDelay = `${-Math.random() * 3}s`;
      scope.add(
        freeDrag(node, {
          onTap: () => {
            audio.unlock();
            if (ch.state.seat === "bed") {
              say(ch, night ? "Спокойной ночи!" : "Ещё минуточку…");
              audio.play("note");
              return;
            }
            anim(body, "is-hop", 600);
            audio.play(CHAR_SOUND[ch.state.id] ?? "boing");
            const list = PHRASES[ch.state.id];
            say(ch, list[Math.floor(Math.random() * list.length)]!);
            idle();
          },
          onStart: () => {
            audio.unlock();
            audio.play("pick");
            ch.state.seat = null;
            ch.node.style.zIndex = "990";
            ch.node.dataset.pose = "stand";
            propNodes.get("swing")?.classList.toggle("is-on", chars.some((c) => c.state.seat === "swing"));
          },
          onDrop: (_c, moved) => {
            const fx0 = ch.state.x + moved.x / unit;
            const fy0 = ch.state.y + moved.y / unit;
            const seat = nearestSeat(scene.seats, fx0, fy0, taken());
            if (seat) {
              ch.state.x = seat.x;
              ch.state.y = seat.y;
              ch.state.seat = seat.id;
              audio.play("snap");
              discover(`seat:${seat.id}`);
              if (seat.pose === "sleep") say(ch, "Баю-бай…");
              if (seat.pose === "swing") say(ch, "Ух ты-ы!");
              if (seat.pose === "sit") say(ch, "Посижу немножко");
            } else {
              const p = clampFoot(fx0, fy0, scene.floor);
              ch.state.x = p.x;
              ch.state.y = p.y;
              audio.play("tap");
            }
            placeChar(ch);
            anim(body, "is-land", 400);
            idle();
          },
        }),
      );
    }

    function nameOf(id: CharId): string {
      return { ryzhik: "Рыжик", mama: "Мама", papa: "Папа", belka: "Белочка", ezhik: "Ёжик", mishka: "Мишка" }[id];
    }

    // ---------------- carried things (food, toys)
    type Carry = { id: CarryId; x: number; y: number; node: HTMLElement; stop: () => void };
    const carries: Carry[] = [];

    function placeCarry(item: Carry): void {
      place(item.node, item.x - CARRY_SIZE / 2, item.y - CARRY_SIZE, CARRY_SIZE, CARRY_SIZE);
      item.node.style.zIndex = String(100 + Math.round(item.y / 2) + 1);
    }

    function removeCarry(item: Carry): void {
      item.stop();
      item.node.remove();
      carries.splice(carries.indexOf(item), 1);
    }

    function spawnCarry(id: CarryId, fromX: number, fromY: number, toX: number, toY: number): void {
      if (carries.length >= MAX_CARRY) removeCarry(carries[0]!);
      const node = svgNode(CARRY_ART[id], "dm-carry");
      node.setAttribute("role", "img");
      node.setAttribute("aria-label", CARRY_NAME[id]);
      node.removeAttribute("aria-hidden");
      const item: Carry = { id, x: fromX, y: fromY, node, stop: () => undefined };
      carries.push(item);
      world.append(node);
      placeCarry(item);
      const land = clampFoot(toX, toY, scene.floor + 40);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          node.classList.add("is-falling");
          item.x = land.x;
          item.y = land.y;
          placeCarry(item);
          later(() => node.classList.remove("is-falling"), 700);
        }),
      );
      item.stop = freeDrag(node, {
        onTap: () => {
          audio.unlock();
          if (id === "car") {
            const dir = item.x > WORLD_W / 2 ? -1 : 1;
            node.classList.add("is-driving");
            node.style.setProperty("--flip", dir < 0 ? "-1" : "1");
            item.x = clampFoot(item.x + dir * 380, item.y, 0).x;
            placeCarry(item);
            audio.play("honk");
            later(() => node.classList.remove("is-driving"), 1100);
          } else if (id === "ball") {
            anim(node, "is-bounce", 900);
            audio.play("boing");
          } else {
            anim(node, "is-wiggle", 500);
            audio.play("pop");
          }
        },
        onStart: () => {
          audio.play("pick");
          node.style.zIndex = "995";
        },
        onDrop: (_c, moved) => {
          const x = item.x + moved.x / unit;
          const y = item.y + moved.y / unit - CARRY_SIZE / 2;
          const who = chars.find((ch) => Math.abs(ch.state.x - x) < ch.w * 0.55 && y < ch.state.y && y > ch.state.y - ch.h);
          if (who) {
            const r = react(who.state.id, id);
            if (r === "play") {
              anim(who.body, "is-hop", 600);
              say(who, "Давай играть!");
              audio.play("boing");
              item.x = clampFoot(who.state.x + (Math.random() > 0.5 ? 160 : -160), 0, 0).x;
              item.y = clampFoot(0, who.state.y + 20, scene.floor + 40).y;
              node.classList.add("is-falling");
              placeCarry(item);
              later(() => node.classList.remove("is-falling"), 700);
              return;
            }
            node.style.transition = "none";
            removeCarry(item);
            anim(who.body, "is-chew", 900);
            audio.play("yum");
            if (r === "love") {
              say(who, "Моё любимое!");
              burst("heart", who.state.x, who.state.y - who.h * 0.8, 5);
              discover(`fav:${who.state.id}`);
            } else say(who, "Ням-ням!");
            return;
          }
          const p = clampFoot(x, y + CARRY_SIZE / 2, scene.floor + 40);
          const fall = p.y > y + CARRY_SIZE / 2 + 5;
          item.x = p.x;
          item.y = p.y;
          if (fall) node.classList.add("is-falling");
          placeCarry(item);
          later(() => node.classList.remove("is-falling"), 700);
        },
      });
    }

    // ---------------- gentle guidance: after a pause, one undiscovered thing calls
    let idleTimer = 0;
    function idle(): void {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        void finds.load().then((list) => {
          const fresh = scene.props.filter((p) => p.tap !== "none" && !list.includes(`${scene.id}:${p.id}`));
          const pick = fresh[Math.floor(Math.random() * fresh.length)];
          if (pick) propNodes.get(pick.id)?.classList.add("is-calling");
        });
      }, 7000);
    }
    idle();

    // ---------------- layout
    const resize = (): void => {
      const box = scroller.getBoundingClientRect();
      if (box.width < 10 || box.height < 10) return;
      const fit = fitWorld(box.width, box.height);
      world.style.width = `${fit.w}px`;
      world.style.height = `${fit.h}px`;
      scroller.classList.toggle("is-scroll", fit.scroll);
      unit = fit.w / WORLD_W;
      world.style.setProperty("--u", String(unit));
    };
    const observer = new ResizeObserver(resize);
    observer.observe(scroller);
    resize();
    repaintNight();
    // Start with Ryzhik in view on a scrolling phone.
    requestAnimationFrame(() => {
      const rz = chars.find((c) => c.state.id === "ryzhik");
      if (rz && scroller.classList.contains("is-scroll")) scroller.scrollLeft = rz.state.x * unit - scroller.clientWidth / 2;
      // On a phone held sideways show the ground, where everyone stands.
      scroller.scrollTop = scroller.scrollHeight;
    });

    return {
      stop: () => {
        observer.disconnect();
        window.clearInterval(zzzTimer);
        window.clearTimeout(idleTimer);
        scope.dispose();
        for (const c of [...carries]) removeCarry(c);
        // remember where everyone is
        mem.chars = chars.map((c) => ({ ...c.state }));
      },
      repaintNight,
    };
  }

  show(current);
  void finds.load().then((list) => {
    if (list.length === 0) hint(view, "Нажимай на всё вокруг и перетаскивай героев!", 3200);
  });
  return () => {
    stopScene?.();
    view.remove();
  };
}
