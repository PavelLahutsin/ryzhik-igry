import { audio } from "../../shared/audio";
import { character } from "../../shared/assets";
import { el } from "../../shared/dom";
import { draggable, type Point } from "../../shared/drag";
import { createScope } from "../../shared/lifecycle";
import { mountLevelGame, type PlayApi } from "../../shared/levelgame";
import { reducedMotion, useStyles } from "../../shared/style";
import { svgNode } from "../../shared/ui";
import { centre, showDrag } from "../../shared/guide";
import baseCss from "../../shared/base.css?inline";
import css from "./style.css?inline";
import { pieceSvg } from "./art";
import { levels, type Plan } from "./levels";
import { COLOR_NAME, countWord, doneAll, findSlot, starsFor, toPlace, type Piece } from "./logic";

/** «Стройка»: snap big blocks into the plan — and the model comes alive. */
export function mount(root: HTMLElement): () => void {
  useStyles(baseCss, css);
  return mountLevelGame(
    {
      id: "stroyka",
      title: "Стройка",
      subtitle: "Ставь большие кубики по плану — и постройка оживёт",
      levels,
      thumb: (level) => thumb(level),
      caption: (level) => `${level.title} · ${toPlace(level.pieces)}`,
      play,
    },
    root,
  );
}

function place(node: HTMLElement, plan: Plan, s: Pick<Piece, "x" | "y" | "w" | "h">): void {
  node.style.left = `${(s.x / plan.cols) * 100}%`;
  node.style.top = `${(s.y / plan.rows) * 100}%`;
  node.style.width = `${(s.w / plan.cols) * 100}%`;
  node.style.height = `${(s.h / plan.rows) * 100}%`;
}

function thumb(plan: Plan): HTMLElement {
  const box = el("div", { class: "sk-thumb" });
  const inner = el("div", { class: "sk-thumb__in", style: { aspectRatio: `${plan.cols} / ${plan.rows}` } });
  for (const s of plan.pieces) {
    const n = svgNode(pieceSvg(s), `sk-piece sk-piece--${s.kind}`);
    place(n, plan, s);
    inner.append(n);
  }
  box.append(inner);
  return box;
}

const keyOf = (p: Pick<Piece, "kind" | "color" | "w" | "h" | "n">): string => `${p.kind}-${p.color}-${p.w}x${p.h}-${p.n ?? 0}`;

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

function play(stage: HTMLElement, plan: Plan, _index: number, api: PlayApi): () => void {
  const scope = createScope();
  const { later } = scope;
  const slots = plan.pieces;
  const filled = slots.map(() => false);
  let placed = 0;
  let misses = 0;
  let hints = 0;
  let finished = false;
  const total = toPlace(slots);

  // Guide bubble.
  const sayText = el("p", { class: "sk-say__text", attrs: { "aria-live": "polite" }, text: plan.intro });
  const counter = el("b", { class: "sk-say__count", text: `0 / ${total}` });
  const guide = el("div", { class: "sk-say" }, [
    el("img", { class: "sk-say__fig", attrs: { src: character("ryzhik"), alt: "", draggable: "false" } }),
    el("div", { class: "sk-say__bubble" }, [sayText, counter]),
  ]);
  const say = (t: string): void => {
    sayText.textContent = t;
    restart(sayText, "is-new");
  };

  // Plan board.
  const model = el("div", { class: "sk-model" });
  const ghosts = el("div", { class: "sk-ghosts" });
  const board = el("div", { class: `sk-board sk-board--${plan.alive}`, style: { aspectRatio: `${plan.cols} / ${plan.rows}`, "--ratio": String(plan.cols / plan.rows), "--cols": String(plan.cols), "--rows": String(plan.rows) } }, [ghosts, model]);
  const guest = el("img", { class: "sk-guest", attrs: { src: character(plan.guest), alt: "", draggable: "false" } });
  const site = el("div", { class: `sk-site sk-site--${plan.alive}`, style: { "--ratio": String(plan.cols / plan.rows) } as Record<string, string> }, [el("div", { class: "sk-site__in" }, [board, guest])]);
  const slotNodes = slots.map((s) => {
    const g = svgNode(pieceSvg(s, true), `sk-ghost sk-piece--${s.kind}`);
    place(g, plan, s);
    g.dataset.key = keyOf(s);
    ghosts.append(g);
    if (s.fixed) {
      const n = svgNode(pieceSvg(s), `sk-piece sk-piece--${s.kind}`);
      place(n, plan, s);
      model.append(n);
    }
    return g;
  });

  // Tray with the blocks (one for each place + a few extra), shuffled.
  const tray = el("div", { class: "sk-tray" });
  const blocks = shuffle([...slots.filter((s) => !s.fixed), ...plan.extra.map((e) => ({ ...e, x: 0, y: 0 }) as Piece)]);
  const blockNodes: { node: HTMLElement; block: Piece }[] = [];
  for (const block of blocks) {
    const node = el("div", { class: `sk-block sk-piece--${block.kind}`, style: { "--w": String(block.w), "--h": String(block.h) } as Record<string, string> }, [
      svgNode(pieceSvg(block), "sk-block__art"),
    ]);
    node.dataset.key = keyOf(block);
    node.setAttribute("aria-label", `${COLOR_NAME[block.color]} ${block.kind === "wheel" ? "колесо" : "кубик"}`);
    tray.append(node);
    blockNodes.push({ node, block });
    scope.add(
      draggable(node, {
        onStart: () => {
          audio.unlock();
          audio.play("pick");
        },
        onDrop: (c) => drop(node, block, c),
      }),
    );
  }

  stage.append(el("div", { class: "sk-layout" }, [guide, site, tray]));

  function drop(node: HTMLElement, block: Piece, c: Point): boolean {
    if (finished) return false;
    const r = board.getBoundingClientRect();
    if (c.x < r.left - 40 || c.x > r.right + 40 || c.y < r.top - 40 || c.y > r.bottom + 40) return false;
    const at = { x: ((c.x - r.left) / r.width) * plan.cols, y: ((c.y - r.top) / r.height) * plan.rows };
    const found = findSlot(slots, filled, block, at);
    if (!found) {
      audio.play("miss");
      return false;
    }
    const s = slots[found.index]!;
    if (found.fit === "color") {
      misses++;
      audio.play("boing");
      if (s.color === "blue") audio.say("v35");
      say(`Сюда нужен ${COLOR_NAME[s.color]}! А этот — ${COLOR_NAME[block.color]}.`);
      restart(slotNodes[found.index]!, "is-call");
      return false;
    }
    filled[found.index] = true;
    placed++;
    node.classList.add("is-placed");
    node.style.visibility = "hidden";
    const piece = svgNode(pieceSvg(s), `sk-piece sk-piece--${s.kind} is-new`);
    place(piece, plan, s);
    model.append(piece);
    slotNodes[found.index]!.classList.add("is-filled");
    audio.play("clack");
    audio.tone(392 * Math.pow(2, Math.min(placed, 14) / 12), 0.14);
    counter.textContent = `${placed} / ${total}`;
    say(`${countWord(placed)}!`);
    if (doneAll(slots, filled)) finish();
    return true;
  }

  function finish(): void {
    finished = true;
    api.setHint(null);
    audio.play("magic");
    say(plan.done);
    later(() => {
      site.classList.add("is-alive");
      if (plan.alive === "train") {
        audio.play("toot");
        later(() => audio.play("chug"), 500);
      }
      if (plan.alive === "boat") audio.play("honk");
      if (plan.alive === "rocket") audio.play("rocket");
      if (!reducedMotion()) puffs();
    }, 500);
    later(() => api.win(starsFor(misses, hints), plan.done), 3000);
  }

  function puffs(): void {
    slots.forEach((s) => {
      if (s.kind !== "chimney" && s.kind !== "loco") return;
      for (let i = 0; i < 3; i++) {
        const puff = el("i", { class: "sk-puff", style: { animationDelay: `${i * 0.45}s` } });
        puff.style.left = `${((s.x + (s.kind === "loco" ? 0.5 : 0.5)) / plan.cols) * 100}%`;
        puff.style.top = `${(s.y / plan.rows) * 100}%`;
        model.append(puff);
      }
    });
    if (plan.alive === "rocket") model.append(el("i", { class: "sk-flame" }));
  }

  // After a pause the hand shows which block goes where (no penalty).
  api.setDemo(() => {
    if (finished) return;
    const pair = nextPair();
    if (pair) showDrag(centre(pair[0]), centre(pair[1]));
  });

  function nextPair(): [HTMLElement, HTMLElement] | null {
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i]!;
      if (filled[i] || s.fixed) continue;
      const b = blockNodes.find(({ node, block }) => !node.classList.contains("is-placed") && keyOf(block) === keyOf(s));
      if (b) return [b.node, slotNodes[i]!];
    }
    return null;
  }

  api.setHint(() => {
    if (finished) return;
    const i = slots.findIndex((s, k) => !filled[k] && !s.fixed);
    const s = slots[i];
    if (!s) return;
    const b = blockNodes.find(({ node, block }) => !node.classList.contains("is-placed") && block.kind === s.kind && block.color === s.color && block.w === s.w && block.h === s.h && (block.n ?? 0) === (s.n ?? 0));
    hints++;
    restart(slotNodes[i]!, "is-call");
    if (b) restart(b.node, "is-call");
    say(`Найди ${COLOR_NAME[s.color]} ${s.kind === "wheel" ? "колесо" : s.kind === "window" ? "окошко" : "блок"} — вот для этого места.`);
  });

  return () => {
    scope.dispose();
  };
}
