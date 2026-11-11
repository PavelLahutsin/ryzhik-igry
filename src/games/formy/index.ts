import { audio, NOTES } from "../../shared/audio";
import { centre, showDrag } from "../../shared/guide";
import { character } from "../../shared/assets";
import { el } from "../../shared/dom";
import { draggable, type Point } from "../../shared/drag";
import { createScope } from "../../shared/lifecycle";
import { mountLevelGame, type PlayApi } from "../../shared/levelgame";
import { OBJECTS } from "../../shared/objects";
import { reducedMotion, useStyles } from "../../shared/style";
import { svgNode } from "../../shared/ui";
import baseCss from "../../shared/base.css?inline";
import css from "./style.css?inline";
import { blockSvg, holeSvg, PLATE, POLE, RING_COLORS, shapeIcon, THINGS } from "./art";
import { levels, worlds, type FamilyLevel, type FormLevel, type PyramidLevel, type SorterLevel, type ThingId, type ThingsLevel } from "./levels";
import { canStack, matches, nextRing, pickTarget, SHAPE_NAME, SIZE_NAME, starsFor, type Shape, type Size } from "./logic";

/** «Размер и форма»: big and small for the family, a ring pyramid, a shape sorter. */
export function mount(root: HTMLElement): () => void {
  useStyles(baseCss, css);
  return mountLevelGame(
    {
      id: "formy",
      title: "Размер и форма",
      subtitle: "Большое и маленькое, круг и квадрат — разложи всё по местам",
      levels,
      worlds,
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
  else for (const s of level.baskets) box.append(svgNode(shapeIcon(s), "fm-thumb__i"));
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

function shuffle<T>(list: T[]): T[] {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function restart(node: Element, cls: string): void {
  node.classList.remove(cls);
  void (node as HTMLElement).getBoundingClientRect();
  node.classList.add(cls);
}


type Target = { node: HTMLElement; key: string };

/** The target under the finger (see pickTarget). */
function targetAt<T extends { node: Element }>(p: Point, targets: readonly T[]): T | null {
  const i = pickTarget(p, targets.map((t) => t.node.getBoundingClientRect()), 10);
  return i < 0 ? null : targets[i]!;
}
type Item = { node: HTMLElement; key: string; name: string };

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

function play(stage: HTMLElement, level: FormLevel, _index: number, api: PlayApi): () => void {
  if (level.mode === "sorter" || level.mode === "things") audio.say("v37");
  const scope = createScope();
  const { later } = scope;
  let misses = 0;
  let hints = 0;
  let placed = 0;

  const sayText = el("p", { class: "fm-say__text", attrs: { "aria-live": "polite" }, text: level.ask });
  const guide = el("div", { class: "fm-say" }, [
    el("img", { class: "fm-say__fig", attrs: { src: character("ryzhik"), alt: "", draggable: "false" } }),
    el("div", { class: "fm-say__bubble" }, [sayText]),
  ]);
  const say = (t: string): void => {
    sayText.textContent = t;
    restart(sayText, "is-new");
  };

  const setup =
    level.mode === "family" ? familySetup(level) : level.mode === "pyramid" ? pyramidSetup(level) : level.mode === "sorter" ? sorterSetup(level) : thingsSetup(level);
  const tray = el("div", { class: `fm-tray fm-tray--${level.mode}` });
  for (const item of shuffle(setup.items)) tray.append(item.node);
  stage.append(el("div", { class: `fm-layout fm-layout--${level.mode}` }, [guide, setup.area, tray]));
  const total = setup.items.length;
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
            restart(target.node, "is-wrong");
            say(setup.wrongText(item, target));
            return false;
          }
          placed++;
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
    restart(pair[0].node, "is-hint");
    restart(pair[1].node, "is-hint");
  });

  return scope.dispose;

  // ------------------------------------------------------------ modes

  function familySetup(l: FamilyLevel): Setup {
    const area = el("div", { class: "fm-family" });
    const targets: Target[] = l.sizes.map((size) => {
      const owner = SIZE_OWNER[size];
      const plate = el("div", { class: "fm-plate" }, [svgNode(PLATE, "fm-plate__art"), el("div", { class: "fm-plate__in" })]);
      const node = el("div", { class: `fm-member fm-size--${size}`, attrs: { "aria-label": owner.name } }, [
        el("img", { class: "fm-member__fig", attrs: { src: character(owner.char), alt: "", draggable: "false" } }),
        plate,
        el("span", { class: "fm-member__name", text: owner.name }),
      ]);
      area.append(node);
      return { node, key: size };
    });
    const items: Item[] = [];
    for (const obj of l.objects)
      for (const size of l.sizes) {
        const node = el("div", { class: `fm-item fm-size--${size}` }, [svgNode(OBJECTS[obj].svg, "fm-item__art")]);
        items.push({ node, key: size, name: `${SIZE_NAME[size]} ${OBJECTS[obj].name.toLowerCase()}` });
      }
    return {
      area,
      targets,
      items,
      onPlaced: (item, target) => {
        const art = item.node.querySelector(".fm-item__art")!.cloneNode(true) as HTMLElement;
        art.className = `fm-plate__thing fm-size--${item.key}`;
        target.node.querySelector(".fm-plate__in")!.append(art);
        restart(target.node, "is-happy");
        audio.play("yum");
        say(`${item.name} — ${SIZE_OWNER[item.key as Size].who}! Спасибо!`);
      },
      wrongText: (item) => `${item.name}… Кому оно подойдёт?`,
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
        restart(target.node, "is-got");
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
        restart(target.node, "is-got");
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
