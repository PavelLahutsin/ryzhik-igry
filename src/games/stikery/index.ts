import { audio } from "../../shared/audio";
import { el, replayClass } from "../../shared/dom";
import { freeDrag } from "../../shared/drag";
import { createScope } from "../../shared/lifecycle";
import { platform } from "../../shared/platform";
import { goHome, subSegments } from "../../shared/router";
import { STICKERS, earned, stickerArt, totalStars, type Sticker } from "../../shared/stickers";
import { useStyles } from "../../shared/style";
import { svgNode, toolbar } from "../../shared/ui";
import baseCss from "../../shared/base.css?inline";
import { SHAPES } from "../teni/shapes";
import css from "./style.css?inline";
import { BACKGROUNDS, moveTo, normalizePicture, place, takeOff, toPercent, type BgId, type Picture, type Placed } from "./logic";

const KEY = "stikery:picture";
/** Always there, even before the first star: scenery for any picture. */
const DECOR = ["cloud", "tree", "fir", "snowman", "moon", "bird", "butterfly"] as const;
/** Album stickers everyone has from the start. */
const STARTER = ["sun", "flower", "house"];

type Item = { id: string; name: string; art: () => Element };
const decorItem = (id: string): Item => ({ id: `d:${id}`, name: SHAPES[id]!.name, art: () => svgNode(SHAPES[id]!.svg, "sk-art") });
const albumItem = (s: Sticker): Item => ({ id: s.id, name: s.name, art: () => stickerArt(s, "sk-art") });

function itemFor(id: string): Item | null {
  if (id.startsWith("d:")) return SHAPES[id.slice(2)] ? decorItem(id.slice(2)) : null;
  const s = STICKERS.find((x) => x.id === id);
  return s ? albumItem(s) : null;
}

/** «Картинка из наклеек»: stick, move, take off — a picture of your own. */
export function mount(root: HTMLElement): () => void {
  useStyles(baseCss, css);
  const scope = createScope();
  let pic: Picture = { bg: "lug", items: [] };
  let undo: Placed[] | null = null;
  let chosen: string | null = null;
  const wanted = subSegments(window.location.hash, "stikery")[0];

  const bgBtn = el("button", { class: "btn btn--ghost sk-tool", attrs: { type: "button" } });
  const clearBtn = el("button", { class: "btn btn--ghost sk-tool", attrs: { type: "button" } });
  const tools = el("span", { class: "toolbar__tools sk-tools" }, [bgBtn, clearBtn]);
  const scene = el("div", { class: "sk-scene", attrs: { role: "group", "aria-label": "Картинка" } });
  const tray = el("div", { class: "sk-tray", attrs: { role: "list", "aria-label": "Наклейки" } });
  const note = el("p", { class: "sk-note", text: "" });
  const view = el("div", { class: "screen screen--play game--stikery" }, [toolbar("Картинка из наклеек", goHome, tools), el("div", { class: "stage sk-stage" }, [scene, el("div", { class: "sk-side" }, [tray, note])])]);
  root.append(view);

  const save = (): void => void platform.storage.set(KEY, pic);
  const box = (): DOMRect => scene.getBoundingClientRect();

  function paintTools(): void {
    const bg = BACKGROUNDS.find((b) => b.id === pic.bg)!;
    bgBtn.replaceChildren(el("span", { text: `Фон: ${bg.name}` }));
    bgBtn.setAttribute("aria-label", `Сменить фон, сейчас ${bg.name}`);
    clearBtn.replaceChildren(el("span", { text: undo ? "Вернуть" : "Очистить" }));
    clearBtn.disabled = !undo && pic.items.length === 0;
    scene.className = `sk-scene sk-bg--${pic.bg}`;
  }

  function paintScene(): void {
    scene.replaceChildren(
      ...pic.items.map((p, i) => {
        const item = itemFor(p.id);
        const node = el("div", { class: "sk-on", attrs: { role: "img", "aria-label": item?.name ?? "Наклейка" }, style: { left: `${p.x}%`, top: `${p.y}%` } }, item ? [item.art()] : []);
        scope.add(
          freeDrag(node, {
            onTap: () => {
              audio.unlock();
              audio.play("pop");
              replayClass(node, "is-wobble");
            },
            onStart: () => audio.play("pick"),
            onDrop: (center) => {
              const at = toPercent(center, box());
              undo = null;
              if (!at) {
                audio.play("whoosh");
                pic = { ...pic, items: takeOff(pic.items, i) };
              } else {
                audio.play("drop");
                pic = { ...pic, items: moveTo(pic.items, i, at.x, at.y) };
              }
              save();
              paintAll();
            },
          }),
        );
        return node;
      }),
    );
  }

  function paintAll(): void {
    paintTools();
    paintScene();
  }

  function stick(id: string, at: { x: number; y: number }): void {
    undo = null;
    pic = { ...pic, items: place(pic.items, id, at.x, at.y) };
    audio.play("snap");
    save();
    paintAll();
    const last = scene.lastElementChild;
    if (last) replayClass(last as HTMLElement, "is-new");
  }

  function fillTray(items: Item[]): void {
    tray.replaceChildren(
      ...items.map((item) => {
        const node = el("button", { class: "sk-pick", attrs: { type: "button", role: "listitem", "aria-label": item.name, "data-id": item.id } }, [item.art()]);
        scope.add(
          freeDrag(node, {
            onTap: () => {
              audio.unlock();
              audio.play("tap");
              chosen = chosen === item.id ? null : item.id;
              tray.querySelectorAll(".sk-pick").forEach((b) => b.classList.toggle("is-chosen", (b as HTMLElement).dataset.id === chosen));
              note.textContent = chosen ? "Теперь нажми на картинку — наклейка встанет туда" : "";
            },
            onStart: () => {
              audio.unlock();
              audio.play("pick");
            },
            onDrop: (center) => {
              const at = toPercent(center, box());
              if (at) stick(item.id, at);
            },
          }),
        );
        return node;
      }),
    );
  }

  scene.addEventListener("click", (e) => {
    if (!chosen || e.target !== scene) return;
    const at = toPercent({ x: e.clientX, y: e.clientY }, box());
    if (at) stick(chosen, at);
  });
  bgBtn.addEventListener("click", () => {
    audio.unlock();
    audio.play("magic");
    const i = BACKGROUNDS.findIndex((b) => b.id === pic.bg);
    pic = { ...pic, bg: BACKGROUNDS[(i + 1) % BACKGROUNDS.length]!.id };
    save();
    paintTools();
  });
  clearBtn.addEventListener("click", () => {
    audio.unlock();
    if (undo) {
      pic = { ...pic, items: undo };
      undo = null;
      audio.play("sparkle");
    } else {
      undo = pic.items;
      pic = { ...pic, items: [] };
      audio.play("whoosh");
      scope.later(() => {
        undo = null;
        paintTools();
      }, 6000);
    }
    save();
    paintAll();
  });

  void Promise.all([platform.storage.get<unknown>(KEY), totalStars().catch(() => 0)]).then(([raw, stars]) => {
    if (!view.isConnected) return;
    pic = normalizePicture(raw);
    if (wanted && BACKGROUNDS.some((b) => b.id === wanted)) pic = { ...pic, bg: wanted as BgId };
    const have = new Set(STICKERS.slice(0, earned(stars)).map((s) => s.id));
    for (const id of STARTER) have.add(id);
    const album = STICKERS.filter((s) => have.has(s.id)).map(albumItem);
    fillTray([...DECOR.map(decorItem), ...album]);
    const more = STICKERS.length - album.length;
    note.textContent = more > 0 ? `Ещё ${more} наклеек откроются за звёздочки в играх` : "";
    paintAll();
  });
  paintTools();

  return () => {
    scope.dispose();
    view.remove();
  };
}
