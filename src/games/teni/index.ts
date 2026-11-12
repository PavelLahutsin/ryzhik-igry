import { audio } from "../../shared/audio";
import type { SoundKind } from "../../shared/sounds";
import { centre, showDrag } from "../../shared/guide";
import { el, replayClass } from "../../shared/dom";
import { draggable, dropHits } from "../../shared/drag";
import { createScope } from "../../shared/lifecycle";
import { mountLevelGame, type PlayApi } from "../../shared/levelgame";
import { shuffle } from "../../shared/rng";
import { useStyles } from "../../shared/style";
import { hint, praiseWord, svgNode } from "../../shared/ui";
import baseCss from "../../shared/base.css?inline";
import css from "./style.css?inline";
import { levels, roundsOf, shadowCount, specOf, thing, worlds, SMALL, type Hide, type Round, type TeniLevel, type Thing } from "./levels";
import { hintTarget, judge, mainMechanic, NEW_IN, noteFor, rowsOf, shadowsWord, starsFor, type Mechanic } from "./logic";

/** Animals answer when they get their shadow (sounds from shared/sounds.ts). */
const VOICE_OF: Record<string, SoundKind> = {
  cat: "meow", cat2: "meow", dog: "woof", owl: "owl", frog: "frog", bird: "tweet", bird2: "tweet", duck: "tweet", hen: "tweet",
  "char:belka": "squirrel", "char:ezhik": "hedgehog", "char:mishka": "bear", butterfly: "bee",
};
/** Ryzhik's line at the start of a level (v12 slots, silent until recorded). */
const LINE_OF: Partial<Record<Mechanic, string>> = { extras: "v39", hidden: "v40", twins: "v41" };

/** «Тени»: drag each thing onto its own shadow. */
export function mount(root: HTMLElement): () => void {
  useStyles(baseCss, css);
  return mountLevelGame(
    {
      id: "teni",
      title: "Тени",
      subtitle: "Найди, чья это тень",
      levels,
      worlds,
      thumb: (level) => {
        const s = specOf(level.items[0]!);
        const t = thing(s.id);
        const shadow = art(t, "tn-thumb__shadow");
        shadow.style.transform = shapeTransform(t, s.turn, s.flip);
        return el("span", { class: "tn-thumb" }, [shadow, art(t, "tn-thumb__item")]);
      },
      caption: (level) => {
        const rounds = roundsOf(level).length;
        const n = shadowsWord(shadowCount(level));
        return rounds > 1 ? `${rounds} части · ${n}` : n;
      },
      play,
    },
    root,
  );
}

function art(t: Thing, className: string): HTMLElement {
  const node =
    t.kind === "svg"
      ? svgNode(t.svg, className)
      : el("span", { class: `svg-art ${className}`, attrs: { "aria-hidden": "true" } }, [
          el("img", { attrs: { src: t.src, alt: "", draggable: "false" } }),
        ]);
  if (t.small) node.style.transform = `scale(${SMALL})`;
  return node;
}

function shapeTransform(t: Thing, turn: number, flip: boolean): string {
  const parts: string[] = [];
  if (turn) parts.push(`rotate(${turn}deg)`);
  if (flip) parts.push("scaleX(-1)");
  if (t.small) parts.push(`scale(${SMALL})`);
  return parts.join(" ");
}

/** What a hidden shadow is behind: drawn in colour on top of the shadow. */
const COVERS: Record<Hide, string> = {
  bush:
    '<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg"><path d="M4 58 C-2 40 12 30 22 34 C22 16 42 10 50 24 C58 8 82 12 80 30 C94 28 104 46 96 58 Z" fill="#6fbf4a" stroke="#3b2e25" stroke-width="3" stroke-linejoin="round"/><circle cx="30" cy="40" r="3" fill="#e8463a"/><circle cx="62" cy="34" r="3" fill="#e8463a"/><circle cx="78" cy="46" r="3" fill="#e8463a"/></svg>',
  cloud:
    '<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg"><path d="M16 56 C2 56 2 36 16 34 C16 14 40 8 48 22 C58 4 88 10 84 32 C100 32 100 56 84 56 Z" fill="#f4f8fc" stroke="#3b2e25" stroke-width="3" stroke-linejoin="round"/></svg>',
  box:
    '<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="54" height="94" rx="4" fill="#d9a066" stroke="#3b2e25" stroke-width="3"/><path d="M3 30 L57 30 M30 3 L30 30" stroke="#3b2e25" stroke-width="3"/><rect x="18" y="52" width="24" height="10" rx="2" fill="#f5dfb8"/></svg>',
};

function play(stage: HTMLElement, level: TeniLevel, _index: number, api: PlayApi): () => void {
  const rounds = roundsOf(level);
  const scope = createScope();
  let misses = 0;
  let hints = 0;
  let current = 0;
  // Live state of the round on screen (for the hint and the hand).
  let things: Thing[] = [];
  let filled = new Set<string>();
  let shadows = new Map<string, HTMLElement>();
  let tray: HTMLElement = el("div");
  let roundScope = createScope();
  scope.add(() => roundScope.dispose());
  const fresh = NEW_IN[level.world ?? ""];
  // Extra pictures tried once already: the first try is free (a safe probe).
  const probed = new Set<string>();
  // Ryzhik says what is new here (or just what to do, in the first worlds).
  const main = mainMechanic(rounds[0]!, fresh);
  const line = (main && LINE_OF[main]) ?? (level.world === "easy" || level.world === "friends" ? "v38" : null);
  if (line) scope.later(() => audio.say(line), 600);

  function showRound(round: Round): void {
    roundScope.dispose();
    roundScope = createScope();
    stage.replaceChildren();
    things = round.items.map((s) => thing(specOf(s).id));
    // Pictures with no shadow (they stay in the tray).
    const extras = (round.extra ?? []).map((s) => thing(specOf(s).id));
    filled = new Set();
    shadows = new Map();
    const specs = [...round.items, ...(round.decoys ?? [])].map(specOf);
    const look = new Map(specs.map((s) => [s.id, s]));

    // Silhouettes: the same art rendered black and see-through (CSS filter).
    const board = el("div", { class: "tn-board" });
    const order = shuffle(specs);
    const rows = rowsOf(order.length);
    board.style.setProperty("--cols", String(Math.max(...rows)));
    board.style.setProperty("--rows", String(rows.length));
    let at = 0;
    for (const count of rows) {
      const row = el("div", { class: "tn-row" });
      for (const s of order.slice(at, at + count)) {
        const t = thing(s.id);
        const shape = art(t, "tn-shadow__art");
        shape.style.transform = shapeTransform(t, s.turn, s.flip);
        const shadow = el("div", { class: "tn-shadow", attrs: { "data-id": s.id, "aria-label": "Тень", role: "img" } }, [shape]);
        if (s.hide) {
          shadow.classList.add("is-hidden");
          shadow.append(svgNode(COVERS[s.hide], `tn-cover tn-cover--${s.hide}`));
        }
        shadows.set(s.id, shadow);
        row.append(shadow);
      }
      at += count;
      board.append(row);
    }

    tray = el("div", { class: "tn-tray" });
    const inTray = things.length + extras.length;
    tray.style.setProperty("--per", String(inTray <= 3 ? inTray : Math.ceil(inTray / 2)));
    for (const t of shuffle([...things, ...extras])) {
      const isExtra = extras.includes(t);
      const item = el("div", { class: `tn-item${isExtra ? " is-extra" : ""}`, attrs: { "data-id": t.id, role: "img", "aria-label": t.name } }, [
        art(t, "tn-item__art"),
      ]);
      tray.append(item);
      roundScope.add(
        draggable(item, {
          onStart: () => {
            audio.unlock();
            audio.play("pick");
          },
          onDrop: (center) => {
            const open = [...shadows.entries()].filter(([id]) => !filled.has(id));
            // Its own shadow takes it anywhere on the tile; a wrong shadow counts
            // only on the tile itself (0.45 of its size) — beside it is no mistake.
            const hit = dropHits(center, open.map(([, node]) => node.getBoundingClientRect()));
            const own = hit.box >= 0 && open[hit.box]![0] === t.id;
            const target = own ? t.id : hit.zone >= 0 ? open[hit.zone]![0] : null;
            if (!target) return "none";
            const result = judge(t.id, target, filled);
            if (result === "placed") {
              filled.add(t.id);
              const shadow = shadows.get(t.id)!;
              const s = look.get(t.id)!;
              shadow.classList.add("is-filled");
              item.classList.add("is-placed");
              // The picture lands turned the way its shadow is.
              const pic = item.querySelector<HTMLElement>(".tn-item__art");
              if (pic) pic.style.transform = shapeTransform(t, s.turn, s.flip);
              shadow.append(item);
              audio.play("snap");
              const voice = VOICE_OF[t.id.replace(/@s$/, "")];
              if (voice) roundScope.later(() => audio.play(voice), 220);
              if (filled.size === things.length) roundDone(board);
              return true;
            }
            if (result === "wrong" && isExtra && !probed.has(t.id)) {
              // A safe probe: the first try of an extra picture is no mistake —
              // it wobbles, goes pale and stays in the tray.
              probed.add(t.id);
              item.classList.add("is-known");
              replayClass(item, "is-probe");
              audio.play("drop");
              audio.say("v39");
              hint(stage, "У этой картинки нет тени — оставь её!");
              return false;
            }
            if (result === "wrong") {
              misses++;
              audio.play("miss");
              const shadow = target ? shadows.get(target) : undefined;
              if (shadow) replayClass(shadow, "is-wrong");
              hint(stage, isExtra ? "У этой картинки нет тени — оставь её!" : `Это не тень: ${t.name.toLowerCase()}. Попробуй другую!`);
            }
            return false;
          },
        }),
      );
    }

    const note = el("p", { class: "tn-note", text: noteFor(round, fresh) });
    if (rounds.length > 1) {
      const dots = el(
        "span",
        { class: "tn-round", attrs: { "aria-label": `Часть ${current + 1} из ${rounds.length}` } },
        rounds.map((_, i) => el("i", { class: i < current ? "is-done" : i === current ? "is-now" : "" })),
      );
      note.prepend(dots);
    }
    stage.append(board, note, tray);
  }

  function roundDone(board: HTMLElement): void {
    board.classList.add("is-done");
    if (current === rounds.length - 1) {
      api.win(starsFor(misses, hints));
      return;
    }
    audio.play("sparkle");
    audio.say("v42");
    hint(stage, `${praiseWord()} Дальше — новые тени!`, 1200);
    current++;
    roundScope.later(() => showRound(rounds[current]!), 1300);
  }

  const nextId = (): string | null =>
    hintTarget(
      things.map((t) => t.id),
      filled,
    );

  // The hand (free, after a pause) shows only the move — a picture goes up
  // to the shadows — not which shadow is its own; that is the lamp's job.
  api.setDemo(() => {
    const id = nextId();
    const item = id && tray.querySelector<HTMLElement>(`.tn-item[data-id="${id}"]`);
    const board = stage.querySelector<HTMLElement>(".tn-board");
    if (!item || !board) return;
    const r = board.getBoundingClientRect();
    showDrag(centre(item), { x: r.left + r.width / 2, y: r.top + Math.min(24, r.height * 0.1) });
  });
  // Hint: one picture and its own shadow glow together.
  api.setHint(() => {
    const id = nextId();
    if (!id) return;
    hints++;
    const pair = [shadows.get(id), tray.querySelector<HTMLElement>(`.tn-item[data-id="${id}"]`)];
    for (const node of pair) if (node) replayClass(node, "is-hinted");
  });

  showRound(rounds[0]!);
  return scope.dispose;
}
