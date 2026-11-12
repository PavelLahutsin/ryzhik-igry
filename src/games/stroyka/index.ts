import { audio } from "../../shared/audio";
import { character } from "../../shared/assets";
import { el, replayClass } from "../../shared/dom";
import { draggable, type Point } from "../../shared/drag";
import { createScope } from "../../shared/lifecycle";
import { mountLevelGame, type PlayApi } from "../../shared/levelgame";
import { shuffle } from "../../shared/rng";
import { reducedMotion, useStyles } from "../../shared/style";
import { svgNode } from "../../shared/ui";
import { centre, showDrag } from "../../shared/guide";
import baseCss from "../../shared/base.css?inline";
import css from "./style.css?inline";
import { pieceSvg } from "./art";
import { levels, worlds, type Plan } from "./levels";
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
      worlds,
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
  const inner = el("div", { class: "sk-thumb__in", style: { aspectRatio: `${plan.cols} / ${plan.rows}`, "--r": String(plan.cols / plan.rows) } as Record<string, string> });
  for (const s of plan.pieces) {
    const n = svgNode(pieceSvg(s), `sk-piece sk-piece--${s.kind}`);
    place(n, plan, s);
    inner.append(n);
  }
  box.append(inner);
  return box;
}

const keyOf = (p: Pick<Piece, "kind" | "color" | "w" | "h" | "n">): string => `${p.kind}-${p.color}-${p.w}x${p.h}-${p.n ?? 0}`;


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
  // «По образцу»: the coloured sample sits in the bubble, the plan is grey.
  const look = plan.look ?? "plan";
  const bubble = el("div", { class: "sk-say__bubble" }, [sayText, counter]);
  if (look === "copy") {
    const sample = thumb(plan);
    sample.classList.add("sk-sample");
    sample.setAttribute("aria-label", "Образец");
    const box = el("figure", { class: "sk-sample__box", attrs: { role: "button", tabindex: "0", title: "Показать образец крупно" } }, [sample, el("figcaption", { text: "Образец" })]);
    // Tap the sample to see it big (tap again — back).
    const toggle = (): void => {
      box.classList.toggle("is-open");
      audio.play("pick");
    };
    box.addEventListener("click", toggle);
    scope.add(() => box.removeEventListener("click", toggle));
    bubble.prepend(box);
  }
  const guide = el("div", { class: "sk-say" }, [bubble]);
  const say = (t: string): void => {
    sayText.textContent = t;
    replayClass(sayText, "is-new");
  };

  // Plan board.
  const model = el("div", { class: "sk-model" });
  const ghosts = el("div", { class: "sk-ghosts" });
  const board = el("div", { class: `sk-board sk-board--${plan.alive}`, style: { aspectRatio: `${plan.cols} / ${plan.rows}`, "--ratio": String(plan.cols / plan.rows), "--cols": String(plan.cols), "--rows": String(plan.rows) } }, [ghosts, model]);
  // The guest stands in the model (on top, on the deck, on the bridge) and
  // moves with it, or outside at the door — at the scale of the blocks.
  const g = plan.guest;
  if (g) {
    const guest = el("span", {
      class: `sk-guest${g.x2 !== undefined ? " sk-guest--walk" : ""}`,
      style: {
        left: `${(g.x / plan.cols) * 100}%`,
        top: `${((g.y - g.h) / plan.rows) * 100}%`,
        height: `${(g.h / plan.rows) * 100}%`,
        "--from": `${(g.x / plan.cols) * 100}%`,
        "--to": `${((g.x2 ?? g.x) / plan.cols) * 100}%`,
      } as Record<string, string>,
    }, [el("img", { attrs: { src: character(g.id), alt: "", draggable: "false" } })]);
    (g.ground ? board : model).append(guest);
  }
  if (look === "half") board.append(el("i", { class: "sk-axis" }));
  const site = el("div", { class: `sk-site sk-site--${plan.alive}`, style: { "--ratio": String(plan.cols / plan.rows) } as Record<string, string> }, [el("div", { class: "sk-site__in" }, [board])]);
  const slotNodes = slots.map((s) => {
    const g = svgNode(pieceSvg(s, look === "plan" || s.fixed ? true : "plain"), `sk-ghost sk-piece--${s.kind}`);
    place(g, plan, s);
    g.dataset.key = keyOf(s);
    if (s.fixed) g.classList.add("is-fixed");
    ghosts.append(g);
    if (s.fixed) {
      const n = svgNode(pieceSvg(s), `sk-piece sk-piece--${s.kind}`);
      place(n, plan, s);
      model.append(n);
    }
    return g;
  });

  // Tray with the blocks (one for each place + a few extra), shuffled.
  // The same blocks lie in one pile with a number (×3), so a big model
  // still fits the tray on a small phone.
  const tray = el("div", { class: "sk-tray" });
  const blocks = shuffle([...slots.filter((s) => !s.fixed), ...plan.extra.map((e) => ({ ...e, x: 0, y: 0 }) as Piece)]);
  const piles = new Map<string, { block: Piece; left: number }>();
  for (const b of blocks) {
    const pile = piles.get(keyOf(b));
    if (pile) pile.left++;
    else piles.set(keyOf(b), { block: b, left: 1 });
  }
  const blockNodes: { node: HTMLElement; block: Piece; left: number; badge: HTMLElement }[] = [];
  for (const pile of piles.values()) {
    const block = pile.block;
    const badge = el("b", { class: "sk-block__n" });
    const node = el("div", { class: `sk-block sk-piece--${block.kind}`, style: { "--w": String(block.w), "--h": String(block.h) } as Record<string, string> }, [
      svgNode(pieceSvg(block), "sk-block__art"),
      badge,
    ]);
    node.dataset.key = keyOf(block);
    const entry = { node, block, left: pile.left, badge };
    const label = (): void => {
      badge.textContent = entry.left > 1 ? `×${entry.left}` : "";
      node.classList.toggle("is-pile", entry.left > 1);
      node.setAttribute("aria-label", `${COLOR_NAME[block.color]} ${block.kind === "wheel" ? "колесо" : "кубик"}${entry.left > 1 ? `, ${entry.left} штуки` : ""}`);
    };
    label();
    tray.append(node);
    blockNodes.push(entry);
    scope.add(
      draggable(node, {
        onStart: () => {
          audio.unlock();
          audio.play("pick");
        },
        onDrop: (c) => {
          const ok = drop(block, c);
          if (ok === "none") return "none";
          if (ok) {
            entry.left--;
            label();
            if (entry.left <= 0) {
              node.classList.add("is-placed");
              node.style.visibility = "hidden";
            }
          }
          return ok;
        },
      }),
    );
  }

  stage.append(el("div", { class: "sk-layout" }, [guide, site, tray]));

  // A big model on a small phone: shrink the blocks a little until the whole
  // tray is on screen (the CSS size stays when everything fits).
  const fitTray = (): void => {
    tray.style.removeProperty("--cell");
    site.style.removeProperty("height");
    // Measure a block still in the tray (placed ones live on the board).
    const first = blockNodes.find((b) => b.node.parentElement === tray);
    if (!first || first.node.offsetHeight === 0) return;
    let cell = first.node.offsetHeight / first.block.h;
    // The tray's own box may grow past the screen, so check both.
    const spills = (): boolean => tray.scrollHeight > tray.clientHeight + 1 || tray.getBoundingClientRect().bottom > window.innerHeight + 1;
    // Not below 32px (with the 6px touch margin still a 44px target).
    while (spills() && cell > 32) {
      cell = Math.max(32, cell - 2);
      tray.style.setProperty("--cell", `${cell}px`);
    }
    // Still too many blocks: the building site (a tall model) gives up a
    // little height, but stays at least a third of the screen.
    let h = site.getBoundingClientRect().height;
    while (spills() && h > window.innerHeight * 0.3 && window.innerWidth < window.innerHeight * 1.25) {
      h -= 8;
      site.style.height = `${h}px`;
    }
  };
  // Watch the stage (the screen), not the tray, whose size this changes.
  const trayObserver = new ResizeObserver(() => fitTray());
  trayObserver.observe(stage);
  scope.add(() => trayObserver.disconnect());

  function drop(block: Piece, c: Point): boolean | "none" {
    if (finished) return false;
    const r = board.getBoundingClientRect();
    // Off the board or where nothing fits: no mistake, the block wobbles back.
    if (c.x < r.left - 40 || c.x > r.right + 40 || c.y < r.top - 40 || c.y > r.bottom + 40) return "none";
    const at = { x: ((c.x - r.left) / r.width) * plan.cols, y: ((c.y - r.top) / r.height) * plan.rows };
    const found = findSlot(slots, filled, block, at);
    if (!found) return "none";
    const s = slots[found.index]!;
    if (found.fit === "color") {
      misses++;
      audio.play("boing");
      if (s.color === "blue") audio.say("v35");
      const where = look === "copy" ? "Посмотри на образец: сюда" : look === "half" ? "Посмотри на другую половинку: сюда" : "Сюда";
      say(`${where} нужен ${COLOR_NAME[s.color]}! А этот — ${COLOR_NAME[block.color]}.`);
      replayClass(slotNodes[found.index]!, "is-call");
      return false;
    }
    filled[found.index] = true;
    placed++;
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
    replayClass(slotNodes[i]!, "is-call");
    if (b) replayClass(b.node, "is-call");
    say(`Найди ${COLOR_NAME[s.color]} ${s.kind === "wheel" ? "колесо" : s.kind === "window" ? "окошко" : "блок"} — вот для этого места.`);
  });

  return scope.dispose;
}
