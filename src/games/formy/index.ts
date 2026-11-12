import { audio, NOTES } from "../../shared/audio";
import { centre, showDrag, showTap } from "../../shared/guide";
import { character } from "../../shared/assets";
import { el, replayClass } from "../../shared/dom";
import { draggable, type Point } from "../../shared/drag";
import { createScope } from "../../shared/lifecycle";
import { mountLevelGame, type PlayApi } from "../../shared/levelgame";
import { OBJECT_GENDER, OBJECTS, type Gender } from "../../shared/objects";
import { shuffle } from "../../shared/rng";
import { reducedMotion, useStyles } from "../../shared/style";
import { svgNode } from "../../shared/ui";
import baseCss from "../../shared/base.css?inline";
import css from "./style.css?inline";
import { blockSvg, bookSvg, cornersSvg, figHoleSvg, figSvg, firSvg, holeSvg, numberSvg, pencilSvg, PLATE, POLE, RING_COLORS, shapeIcon, TABLE, THINGS } from "./art";
import {
  levels,
  worlds,
  type FamilyLevel,
  type FormLevel,
  type OrderLevel,
  type PickLevel,
  type PyramidLevel,
  type Sort2Level,
  type SorterLevel,
  type ThingId,
  type ThingsLevel,
} from "./levels";
import {
  canStack,
  compareAsk,
  figName,
  makeRounds,
  matches,
  nextInOrder,
  nextRing,
  pickTarget,
  SHAPE_NAME,
  sizedName,
  starsFor,
  whoFits,
  type Dim,
  type Round,
  type Shape,
  type Size,
} from "./logic";

/** «Размер и форма»: big and small for the family, a ring pyramid, a shape sorter. */
export function mount(root: HTMLElement): () => void {
  useStyles(baseCss, css);
  return mountLevelGame(
    {
      id: "formy",
      title: "Размер и форма",
      subtitle: "Большое и маленькое, длинное и короткое, фигуры, узоры и углы",
      levels,
      worlds,
      // Five kinds of tasks: a child may start any world.
      openWorlds: true,
      thumb: (level) => thumb(level),
      caption: (level) => level.title,
      play,
    },
    root,
  );
}

function thumb(level: FormLevel): HTMLElement {
  const box = el("span", { class: "fm-thumb" });
  if (level.mode === "family") for (const s of level.sizes) box.append(svgNode(OBJECTS[level.objects[0]!].svg, `fm-thumb__i fm-size--${s}`));
  else if (level.mode === "pyramid") box.append(svgNode(pyramidThumb(level.rings), "fm-thumb__pyr"));
  else if (level.mode === "sorter") for (const s of level.shapes.slice(0, 4)) box.append(svgNode(blockSvg(s), "fm-thumb__i"));
  else if (level.mode === "things") for (const s of level.baskets) box.append(svgNode(shapeIcon(s), "fm-thumb__i"));
  else if (level.mode === "order") for (let v = 1; v <= 3; v++) box.append(measureNode(level.dim, v, 3, "fm-thumb__m", level.object));
  else if (level.mode === "sort2") for (const b of level.bins.slice(0, 4)) box.append(svgNode(figSvg({ ...b, size: 3 }), "fm-thumb__i"));
  else box.append(...pickThumb(level));
  return box;
}

function pyramidThumb(n: number): string {
  let rings = "";
  for (let r = n; r >= 1; r--) {
    const w = 30 + (r / n) * 60;
    const y = 86 - (n - r) * (70 / n);
    rings += `<rect x="${50 - w / 2}" y="${y - 70 / n}" width="${w}" height="${70 / n - 1}" rx="${35 / n}" fill="${RING_COLORS[(r - 1) % RING_COLORS.length]}" stroke="#3b2e25" stroke-width="2.5"/>`;
  }
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="47" y="8" width="6" height="80" rx="3" fill="#c48a4a"/>${rings}</svg>`;
}



/** Thumb of a pick level: a tiny picture of its question. */
function pickThumb(level: PickLevel): HTMLElement[] {
  const sp = level.spec;
  const fig = (shape: Shape, tint: "red" | "blue" | "yellow" | "green" | "purple", size: 1 | 2 | 3 = 3, turn = 0): HTMLElement =>
    svgNode(figSvg({ shape, tint, size, turn }), "fm-thumb__i");
  switch (sp.kind) {
    case "compare":
      return sp.dims[0] === "size" ? [measureNode("size", 1, 2, "fm-thumb__m", "apple"), measureNode("size", 2, 2, "fm-thumb__m", "apple")] : [1, 2, 3].slice(0, sp.count).map((v) => measureNode(sp.dims[0]!, v, sp.count, "fm-thumb__m"));
    case "same":
      return sp.variant === "turn" ? [fig("triangle", "blue"), fig("triangle", "red", 3, 90)] : [fig("star", "yellow"), fig("star", sp.variant === "tint" ? "yellow" : "yellow")];
    case "odd":
      return sp.by === "size" ? [fig("circle", "red"), fig("square", "blue"), fig("heart", "green", 1)] : sp.by === "tint" ? [fig("circle", "blue"), fig("square", "blue"), fig("star", "red")] : [fig("circle", "red"), fig("circle", "blue"), fig("square", "green")];
    case "pattern":
      return [fig("circle", "red"), fig("square", "blue"), fig("circle", "red"), svgNode(numberSvgQ(), "fm-thumb__i")];
    case "fit":
      return [svgNode(figHoleSvg({ shape: "star", tint: "purple", size: 3 }), "fm-thumb__i"), fig("star", "yellow")];
    case "corners":
      return [svgNode(cornersSvg(sp.options > 3 ? "pentagon" : "triangle", "green", true), "fm-thumb__i fm-thumb__big")];
  }
}

const numberSvgQ = (): string =>
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="80" rx="18" fill="#fff" stroke="#c9b8a6" stroke-width="5" stroke-dasharray="8 8"/><text x="50" y="70" font-family="Nunito,Arial,sans-serif" font-weight="900" font-size="54" fill="#c9b8a6" text-anchor="middle">?</text></svg>`;

/** A thing measured on `dim`: value `v` of `n` (1 = least). */
function measureNode(dim: Dim, v: number, n: number, className: string, object: string = "apple"): HTMLElement {
  if (dim === "length") return svgNode(pencilSvg(v, n, ["#3a8fd4", "#e8463a", "#5fbf4e", "#9b6cd8", "#ff8a3d"][v % 5]), `${className} fm-m--length`);
  if (dim === "height") return svgNode(firSvg(v, n), `${className} fm-m--height`);
  if (dim === "thick") return svgNode(bookSvg(v, n, ["#e8463a", "#3a8fd4", "#5fbf4e", "#9b6cd8", "#ff8a3d"][v % 5]), `${className} fm-m--thick`);
  const node = svgNode(OBJECTS[object as keyof typeof OBJECTS].svg, `${className} fm-m--size`);
  node.style.setProperty("--k", String(n <= 1 ? 1 : 0.42 + ((v - 1) / (n - 1)) * 0.58));
  return node;
}

type Target = { node: HTMLElement; key: string };

/** The target under the finger (see pickTarget). */
function targetAt<T extends { node: Element }>(p: Point, targets: readonly T[]): T | null {
  const i = pickTarget(p, targets.map((t) => t.node.getBoundingClientRect()), 10);
  return i < 0 ? null : targets[i]!;
}
type Item = { node: HTMLElement; key: string; name: string; gender?: Gender };

type Setup = {
  area: HTMLElement;
  targets: Target[];
  items: Item[];
  /** Custom rule (pyramid); default is key equality. */
  accept?: (item: Item, target: Target) => boolean;
  /** Show the thing in its place. */
  onPlaced: (item: Item, target: Target, count: number) => void;
  /** Said on a wrong drop. */
  wrongText: (item: Item, target: Target) => string;
  /** Hint: which item and target to show. */
  hintPair: () => [Item, Target] | null;
};

const SIZE_OWNER: Record<Size, { who: string; char: string; name: string }> = {
  big: { who: "папе", char: "papa", name: "Папа" },
  mid: { who: "маме", char: "mama", name: "Мама" },
  small: { who: "Рыжику", char: "ryzhik", name: "Рыжик" },
};

/** The task line on top: one clear instruction, and dots for the progress. */
function taskBar(text: string): { node: HTMLElement; say: (t: string) => void; dots: (done: number, total: number) => void } {
  const sayText = el("p", { class: "fm-say__text", attrs: { "aria-live": "polite" }, text });
  const dotRow = el("div", { class: "fm-say__dots", attrs: { "aria-hidden": "true" } });
  const node = el("div", { class: "fm-say" }, [el("div", { class: "fm-say__bubble" }, [sayText, dotRow])]);
  return {
    node,
    say: (t) => {
      sayText.textContent = t;
      replayClass(sayText, "is-new");
    },
    dots: (done, total) => dotRow.replaceChildren(...Array.from({ length: total }, (_, i) => el("i", { class: i < done ? "is-on" : "" }))),
  };
}

function play(stage: HTMLElement, level: FormLevel, index: number, api: PlayApi): () => void {
  if (level.mode === "pick") return playPick(stage, level, index, api);
  if (level.mode === "sorter" || level.mode === "things" || level.mode === "sort2") audio.say("v37");
  const scope = createScope();
  const { later } = scope;
  let misses = 0;
  let hints = 0;
  let placed = 0;

  const bar = taskBar(level.ask);
  const guide = bar.node;
  const say = bar.say;

  const setup =
    level.mode === "family"
      ? familySetup(level)
      : level.mode === "pyramid"
        ? pyramidSetup(level)
        : level.mode === "sorter"
          ? sorterSetup(level)
          : level.mode === "order"
            ? orderSetup(level)
            : level.mode === "sort2"
              ? sort2Setup(level)
              : thingsSetup(level);
  const tray = el("div", { class: `fm-tray fm-tray--${level.mode}` });
  for (const item of shuffle(setup.items)) tray.append(item.node);
  stage.append(el("div", { class: `fm-layout fm-layout--${level.mode}` }, [guide, setup.area, tray]));
  const total = setup.items.length;
  bar.dots(0, total);
  for (const item of setup.items) item.node.dataset.key = item.key;
  for (const t of setup.targets) t.node.dataset.key = t.key;

  for (const item of setup.items) {
    scope.add(
      draggable(item.node, {
        onStart: () => {
          audio.unlock();
          audio.play("pick");
        },
        onMove: (p) => {
          const over = targetAt(p, setup.targets);
          for (const t of setup.targets) t.node.classList.toggle("is-over", t === over);
        },
        onDrop: (p) => {
          for (const t of setup.targets) t.node.classList.remove("is-over");
          const target = targetAt(p, setup.targets);
          if (!target) return false;
          const ok = setup.accept ? setup.accept(item, target) : matches(item.key, target.key) === "ok";
          if (!ok) {
            misses++;
            audio.play("boing");
            replayClass(target.node, "is-wrong");
            say(setup.wrongText(item, target));
            return false;
          }
          placed++;
          bar.dots(placed, total);
          item.node.classList.add("is-placed");
          setup.onPlaced(item, target, placed);
          if (placed === total) {
            api.setHint(null);
            audio.play("magic");
            say(level.done);
            setup.area.classList.add("is-done");
            later(() => api.win(starsFor(misses, hints, total), level.done), 1600);
          }
          return true;
        },
      }),
    );
  }

  // The hand shows the next move (free, no penalty).
  api.setDemo(() => {
    const pair = setup.hintPair();
    if (pair) showDrag(centre(pair[0].node), centre(pair[1].node));
  });
  api.setHint(() => {
    const pair = setup.hintPair();
    if (!pair) return;
    hints++;
    replayClass(pair[0].node, "is-hint");
    replayClass(pair[1].node, "is-hint");
  });

  return scope.dispose;

  // ------------------------------------------------------------ modes

  function familySetup(l: FamilyLevel): Setup {
    // A kitchen table: the family sits behind it, each with a plate in front —
    // the plates are where the things go.
    const people = el("div", { class: "fm-family__people" });
    const area = el("div", { class: "fm-family" }, [people, svgNode(TABLE, "fm-table")]);
    const targets: Target[] = l.sizes.map((size) => {
      const owner = SIZE_OWNER[size];
      const plate = el("div", { class: "fm-plate" }, [svgNode(PLATE, "fm-plate__art"), el("div", { class: "fm-plate__in" })]);
      const node = el("div", { class: `fm-member fm-size--${size}`, attrs: { "aria-label": owner.name } }, [
        el("img", { class: "fm-member__fig", attrs: { src: character(owner.char), alt: "", draggable: "false" } }),
        plate,
        el("span", { class: "fm-member__name", text: owner.name }),
      ]);
      people.append(node);
      return { node, key: size };
    });
    const items: Item[] = [];
    for (const obj of l.objects)
      for (const size of l.sizes) {
        const node = el("div", { class: `fm-item fm-size--${size}` }, [svgNode(OBJECTS[obj].svg, "fm-item__art")]);
        items.push({ node, key: size, name: sizedName(size, OBJECTS[obj].name, OBJECT_GENDER[obj]), gender: OBJECT_GENDER[obj] });
      }
    return {
      area,
      targets,
      items,
      onPlaced: (item, target) => {
        const art = item.node.querySelector(".fm-item__art")!.cloneNode(true) as HTMLElement;
        art.className = `fm-plate__thing fm-size--${item.key}`;
        target.node.querySelector(".fm-plate__in")!.append(art);
        replayClass(target.node, "is-happy");
        audio.play("yum");
        say(`${item.name} — ${SIZE_OWNER[item.key as Size].who}! Спасибо!`);
      },
      wrongText: (item) => `${item.name}… ${whoFits(item.gender ?? "n")}`,
      hintPair: () => {
        const item = items.find((i) => !i.node.classList.contains("is-placed"));
        const target = item && targets.find((t) => t.key === item.key);
        return item && target ? [item, target] : null;
      },
    };
  }

  function pyramidSetup(l: PyramidLevel): Setup {
    const stack: number[] = [];
    const stackBox = el("div", { class: "fm-stack" });
    const pole = el("div", { class: "fm-pole" }, [svgNode(POLE, "fm-pole__art"), stackBox, el("i", { class: "fm-pole__cap" })]);
    const area = el("div", { class: "fm-pyramid" }, [pole]);
    const target: Target = { node: pole, key: "pole" };
    const width = (rank: number): number => 34 + (rank / l.rings) * 62;
    const items: Item[] = Array.from({ length: l.rings }, (_, i) => {
      const rank = i + 1;
      const node = el("div", {
        class: "fm-ring",
        style: { "--w": `${width(rank)}%`, "--wn": String(width(rank) / 100), "--c": RING_COLORS[(rank - 1) % RING_COLORS.length]! } as Record<string, string>,
      });
      return { node, key: String(rank), name: "колечко" };
    });
    return {
      area,
      targets: [target],
      items,
      accept: (item) => canStack(stack, l.rings, Number(item.key)),
      onPlaced: (item, _t, count) => {
        const rank = Number(item.key);
        stack.push(rank);
        const ring = el("div", {
          class: "fm-ring fm-ring--on",
          style: { "--w": `${width(rank)}%`, "--c": RING_COLORS[(rank - 1) % RING_COLORS.length]!, bottom: `${10 + (count - 1) * (78 / l.rings)}%`, height: `${78 / l.rings - 1}%` } as Record<string, string>,
        });
        stackBox.append(ring);
        audio.tone(NOTES[Math.min(count - 1, NOTES.length - 1)]!, 0.2);
        say(nextRing(stack, l.rings) ? "Дальше — колечко поменьше!" : "Готово!");
      },
      wrongText: () => (stack.length ? "Это колечко не подходит. Ищи самое большое из оставшихся!" : "Сначала самое большое колечко!"),
      hintPair: () => {
        const want = nextRing(stack, l.rings);
        const item = items.find((i) => Number(i.key) === want);
        return item ? [item, target] : null;
      },
    };
  }

  function sorterSetup(l: SorterLevel): Setup {
    const lid = el("div", { class: `fm-box__lid fm-box__lid--${l.shapes.length}` });
    const area = el("div", { class: "fm-box" }, [lid, el("div", { class: "fm-box__front" })]);
    const targets: Target[] = l.shapes.map((shape) => {
      const node = el("div", { class: "fm-hole", attrs: { "aria-label": SHAPE_NAME[shape] } }, [svgNode(holeSvg(shape), "fm-hole__art")]);
      lid.append(node);
      return { node, key: shape };
    });
    const items: Item[] = [];
    for (const shape of l.shapes)
      for (let k = 0; k < l.perShape; k++) items.push({ node: el("div", { class: "fm-block" }, [svgNode(blockSvg(shape), "fm-block__art")]), key: shape, name: SHAPE_NAME[shape] });
    return {
      area,
      targets,
      items,
      onPlaced: (item, target) => {
        if (!reducedMotion()) {
          const fall = svgNode(blockSvg(item.key as Shape), "fm-fall");
          target.node.append(fall);
          later(() => fall.remove(), 700);
        }
        replayClass(target.node, "is-got");
        audio.play("pop");
        say(`${item.name}!`);
      },
      wrongText: (item, target) => `Это ${item.name.toLowerCase()}, а окошко — ${SHAPE_NAME[target.key as Shape].toLowerCase()}.`,
      hintPair: () => {
        const item = items.find((i) => !i.node.classList.contains("is-placed"));
        const target = item && targets.find((t) => t.key === item.key);
        return item && target ? [item, target] : null;
      },
    };
  }

  function orderSetup(l: OrderLevel): Setup {
    // A shelf with numbered places; things go on it one by one, in order.
    const placedRanks: number[] = [];
    const slots = Array.from({ length: l.count }, (_, i) => el("div", { class: "fm-slot" }, [el("b", { class: "fm-slot__n", text: String(i + 1) })]));
    const shelf = el("div", { class: `fm-shelf fm-shelf--${l.dim}`, attrs: { "aria-label": "Полочка" } }, [el("div", { class: "fm-shelf__row" }, slots), el("i", { class: "fm-shelf__board" })]);
    const area = el("div", { class: "fm-order" }, [shelf]);
    const target: Target = { node: shelf, key: "shelf" };
    const items: Item[] = Array.from({ length: l.count }, (_, i) => {
      const v = i + 1;
      return { node: el("div", { class: `fm-item fm-item--m fm-item--${l.dim}` }, [measureNode(l.dim, v, l.count, "fm-item__art", l.object)]), key: String(v), name: "" };
    });
    const next = (): number => nextInOrder(placedRanks.length, l.count, l.dir);
    const first = l.dir === "up" ? FIRST_UP[l.dim] : FIRST_DOWN[l.dim];
    return {
      area,
      targets: [target],
      items,
      accept: (item) => Number(item.key) === next(),
      onPlaced: (item, _t, count) => {
        placedRanks.push(Number(item.key));
        const art = item.node.querySelector(".fm-item__art")!.cloneNode(true) as HTMLElement;
        art.className = `fm-slot__thing ${(item.node.querySelector(".fm-item__art") as HTMLElement).className.replace("fm-item__art", "")}`.trim();
        art.style.cssText = (item.node.querySelector(".fm-item__art") as HTMLElement).style.cssText;
        slots[count - 1]!.append(art);
        slots[count - 1]!.classList.add("is-full");
        audio.tone(NOTES[Math.min(count - 1, NOTES.length - 1)]!, 0.2);
        say(next() ? "Дальше — следующий по порядку!" : "Готово — всё по порядку!");
      },
      wrongText: () => (placedRanks.length ? "Не тот. Ищи следующий по порядку!" : `Сначала — ${first}!`),
      hintPair: () => {
        const item = items.find((i) => Number(i.key) === next());
        return item ? [item, target] : null;
      },
    };
  }

  function sort2Setup(l: Sort2Level): Setup {
    // Boxes with a picture of a coloured shape on the front.
    const area = el("div", { class: `fm-shelves fm-shelves--${l.bins.length}` });
    const targets: Target[] = l.bins.map((b) => {
      const name = figName(b);
      const node = el("div", { class: "fm-bin fm-bin--fig", attrs: { "aria-label": name } }, [svgNode(figSvg({ ...b, size: 3 }), "fm-bin__label"), el("div", { class: "fm-bin__in" })]);
      area.append(node);
      return { node, key: `${b.shape}:${b.tint}` };
    });
    const items: Item[] = [];
    for (const b of l.bins)
      for (let k = 0; k < l.per; k++) items.push({ node: el("div", { class: "fm-block" }, [svgNode(figSvg({ ...b, size: 3 }), "fm-block__art")]), key: `${b.shape}:${b.tint}`, name: figName(b) });
    return {
      area,
      targets,
      items,
      onPlaced: (item, target) => {
        const copy = item.node.querySelector(".fm-block__art")!.cloneNode(true) as HTMLElement;
        copy.className = "fm-bin__thing";
        target.node.querySelector(".fm-bin__in")!.append(copy);
        replayClass(target.node, "is-got");
        audio.play("snap");
        say(`${item.name}!`);
      },
      wrongText: (item, target) => {
        const [shape, tint] = item.key.split(":");
        const [ts, tt] = target.key.split(":");
        if (shape === ts) return `Форма та же, а цвет другой. ${item.name} — ищи коробку такого цвета.`;
        if (tint === tt) return `Цвет тот же, а форма другая. Ищи коробку с ${SHAPE_INSTR[shape as Shape]}.`;
        return `${item.name}? Посмотри на цвет и на форму.`;
      },
      hintPair: () => {
        const item = items.find((i) => !i.node.classList.contains("is-placed"));
        const target = item && targets.find((t) => t.key === item.key);
        return item && target ? [item, target] : null;
      },
    };
  }

  function thingsSetup(l: ThingsLevel): Setup {
    const area = el("div", { class: "fm-shelves" });
    const targets: Target[] = l.baskets.map((shape) => {
      const node = el("div", { class: "fm-bin", attrs: { "aria-label": SHAPE_NAME[shape] } }, [
        svgNode(shapeIcon(shape), "fm-bin__label"),
        el("span", { class: "fm-bin__name", text: SHAPE_NAME[shape] }),
        el("div", { class: "fm-bin__in" }),
      ]);
      area.append(node);
      return { node, key: shape };
    });
    const art = (id: ThingId): { name: string; art: string } =>
      id === "ball" || id === "cube" ? { name: OBJECTS[id].name, art: OBJECTS[id].svg } : THINGS[id];
    const items: Item[] = l.things.map((t) => {
      const a = art(t.id);
      return { node: el("div", { class: "fm-item fm-item--thing" }, [svgNode(a.art, "fm-item__art")]), key: t.shape, name: a.name };
    });
    return {
      area,
      targets,
      items,
      onPlaced: (item, target) => {
        const copy = item.node.querySelector(".fm-item__art")!.cloneNode(true) as HTMLElement;
        copy.className = "fm-bin__thing";
        target.node.querySelector(".fm-bin__in")!.append(copy);
        replayClass(target.node, "is-got");
        audio.play("snap");
        say(`${item.name} — похоже на ${SHAPE_NAME[item.key as Shape].toLowerCase()}!`);
      },
      wrongText: (item) => `${item.name}? Посмотри на форму ещё раз.`,
      hintPair: () => {
        const item = items.find((i) => !i.node.classList.contains("is-placed"));
        const target = item && targets.find((t) => t.key === item.key);
        return item && target ? [item, target] : null;
      },
    };
  }
}

/** Who goes first on the shelf. */
const FIRST_UP: Record<Dim, string> = { size: "самый маленький", length: "самый короткий", height: "самая низкая", thick: "самая тонкая" };
const FIRST_DOWN: Record<Dim, string> = { size: "самый большой", length: "самый длинный", height: "самая высокая", thick: "самая толстая" };

/** «с кругом», «со звездой» — for the hint lines. */
const SHAPE_INSTR: Record<Shape, string> = {
  circle: "кругом",
  square: "квадратом",
  triangle: "треугольником",
  star: "звездой",
  heart: "сердечком",
  rhombus: "ромбом",
  oval: "овалом",
  rect: "прямоугольником",
  pentagon: "пятиугольником",
  hexagon: "шестиугольником",
};

// ------------------------------------------------------------ one-tap levels

/** The question line for a round. */
function roundAsk(round: Round, level: PickLevel): string {
  switch (round.kind) {
    case "compare":
      return round.thing ? compareAsk("size", round.want, round.values.length, { name: OBJECTS[round.thing as keyof typeof OBJECTS].name, g: OBJECT_GENDER[round.thing as keyof typeof OBJECTS] }) : compareAsk(round.dim, round.want, round.values.length);
    case "same":
      return level.spec.kind === "same" && level.spec.variant === "turn" ? "Найди ту же форму — цвет и поворот не важны." : "Найди такую же фигуру.";
    case "odd":
      return round.by === "shape" ? "Какая фигура другой формы?" : round.by === "tint" ? "Какая фигура другого цвета?" : "Какая фигура другого размера?";
    case "pattern":
      return "Что будет дальше в узоре?";
    case "fit":
      return round.hole.size === 3 ? "Какая фигурка подойдёт к окошку?" : "Какая фигурка пролезет как раз?";
    case "corners":
      return "Сколько углов у этой фигуры?";
  }
}

function playPick(stage: HTMLElement, level: PickLevel, _index: number, api: PlayApi): () => void {
  const scope = createScope();
  const { later } = scope;
  const rounds = makeRounds(level.spec, level.rounds, Math.random);
  let at = 0;
  let misses = 0;
  let hints = 0;
  let busy = false;
  const bar = taskBar(level.ask);
  const question = el("div", { class: `fm-q fm-q--${level.spec.kind}` });
  const options = el("div", { class: `fm-opts fm-opts--${level.spec.kind}`, attrs: { role: "group" } });
  stage.append(el("div", { class: `fm-layout fm-layout--pick fm-layout--${level.spec.kind}` }, [bar.node, question, options]));
  let buttons: HTMLButtonElement[] = [];

  const optionArt = (round: Round, i: number): HTMLElement => {
    switch (round.kind) {
      case "compare":
        return round.thing ? measureNode("size", round.values[i]!, round.values.length, "fm-opt__art", round.thing) : measureNode(round.dim, round.values[i]!, round.values.length, "fm-opt__art");
      case "corners":
        return svgNode(numberSvg(round.options[i]!), "fm-opt__art");
      default:
        return svgNode(figSvg(round.options[i]!), "fm-opt__art");
    }
  };

  function show(): void {
    const round = rounds[at]!;
    busy = false;
    bar.say(at === 0 ? level.ask : roundAsk(round, level));
    if (at === 0) later(() => rounds[at] === round && bar.say(roundAsk(round, level)), 2600);
    bar.dots(at, rounds.length);
    question.replaceChildren();
    question.className = `fm-q fm-q--${round.kind}`;
    if (round.kind === "same") question.append(el("div", { class: "fm-sample" }, [svgNode(figSvg(round.sample), "fm-sample__art")]));
    if (round.kind === "pattern") {
      question.append(
        el("div", { class: "fm-row", style: { "--n": String(round.row.length + 1) } as Record<string, string> }, [...round.row.map((f) => svgNode(figSvg({ ...f, size: 3 }), "fm-row__i")), el("span", { class: "fm-row__gap", text: "?" })]),
      );
    }
    if (round.kind === "fit") question.append(el("div", { class: "fm-holebox" }, [svgNode(figHoleSvg(round.hole), "fm-holebox__art")]));
    if (round.kind === "corners") question.append(el("div", { class: "fm-cornerbox" }, [svgNode(cornersSvg(round.shape, round.tint, false), "fm-cornerbox__art")]));
    // Compare and odd one out: the things themselves are the answers, in the big panel.
    const inPanel = round.kind === "compare" || round.kind === "odd";
    const host = inPanel ? question : options;
    options.replaceChildren();
    options.hidden = inPanel;
    const count = round.kind === "compare" ? round.values.length : round.options.length;
    const row = el("div", { class: `fm-choice fm-choice--${round.kind}${round.kind === "compare" ? ` fm-choice--${round.dim}` : ""}`, style: { "--n": String(count) } as Record<string, string> });
    buttons = Array.from({ length: count }, (_, i) => {
      const b = el("button", { class: "fm-opt", attrs: { type: "button", "data-i": String(i) }, on: { click: () => choose(i) } }, [optionArt(round, i)]);
      row.append(b);
      return b;
    });
    host.append(row);
    replayClass(question, "is-new");
  }

  function choose(i: number): void {
    const round = rounds[at]!;
    const b = buttons[i]!;
    if (busy || b.disabled) return;
    audio.unlock();
    if (i !== round.answer) {
      misses++;
      audio.play("boing");
      replayClass(b, "is-wrong");
      // A wrong answer goes pale and can't be tapped again: the child always gets there.
      b.disabled = true;
      b.classList.add("is-off");
      bar.say(wrongLine(round));
      return;
    }
    busy = true;
    b.classList.add("is-right");
    audio.play("pop");
    if (round.kind === "pattern") {
      const gap = question.querySelector(".fm-row__gap");
      gap?.replaceWith(svgNode(figSvg({ ...round.options[i]!, size: 3 }), "fm-row__i fm-row__i--new"));
    }
    if (round.kind === "fit") question.querySelector(".fm-holebox")?.append(svgNode(figSvg(round.options[i]!), "fm-holebox__in"));
    if (round.kind === "corners") {
      question.querySelector(".fm-cornerbox")!.replaceChildren(svgNode(cornersSvg(round.shape, round.tint, true), "fm-cornerbox__art"));
      audio.tone(NOTES[2]!, 0.15);
    }
    if (round.kind === "same") question.querySelector(".fm-sample")?.classList.add("is-got");
    bar.say(rightLine(round));
    at++;
    bar.dots(at, rounds.length);
    if (at < rounds.length) {
      later(show, round.kind === "corners" ? 1500 : 1000);
      return;
    }
    api.setHint(null);
    later(() => {
      audio.play("magic");
      bar.say(level.done);
      question.classList.add("is-done");
    }, 600);
    later(() => api.win(starsFor(misses, hints, rounds.length), level.done), 1800);
  }

  function wrongLine(round: Round): string {
    switch (round.kind) {
      case "compare":
        return "Не этот. Сравни ещё раз!";
      case "same":
        return "Эта другой формы. Посмотри на уголки и бока.";
      case "odd":
        return "Эта как другие. Ищи ту, что отличается!";
      case "pattern":
        return "Посмотри, что повторяется в узоре.";
      case "fit":
        return "Не пролезет! Смотри на форму и на размер окошка.";
      case "corners":
        return "Посчитай уголки пальчиком: раз, два…";
    }
  }
  function rightLine(round: Round): string {
    switch (round.kind) {
      case "corners":
        return `Да! ${round.options[round.answer]} ${round.options[round.answer]! < 5 ? "угла" : "углов"}!`;
      case "fit":
        return "Пролезла! Как раз!";
      case "pattern":
        return "Да, узор продолжается!";
      default:
        return "Правильно!";
    }
  }

  api.setDemo(() => {
    const b = buttons[rounds[at]?.answer ?? -1];
    if (b) showTap(centre(b));
  });
  api.setHint(() => {
    const b = buttons[rounds[at]?.answer ?? -1];
    if (!b || busy) return;
    hints++;
    replayClass(b, "is-hint");
  });
  show();
  return scope.dispose;
}
