import { artImg, hasArt } from "../../shared/art";
import { audio } from "../../shared/audio";
import { el, replayClass } from "../../shared/dom";
import { freeDrag } from "../../shared/drag";
import { createScope } from "../../shared/lifecycle";
import { platform } from "../../shared/platform";
import { goHome, subSegments } from "../../shared/router";
import { STICKERS, earned, stickerArt, totalStars, type Sticker } from "../../shared/stickers";
import { useStyles } from "../../shared/style";
import { confirmLeave, svgNode, toolbar } from "../../shared/ui";
import baseCss from "../../shared/base.css?inline";
import { SHAPES } from "../teni/shapes";
import css from "./style.css?inline";
import { BACKGROUNDS, moveTo, normalizePicture, place, takeOff, toPercent, type BgId, type Picture, type Placed } from "./logic";

const KEY = "stikery:picture";
/** Always there, even before the first star: scenery for any picture. */
const DECOR = ["cloud", "tree", "fir", "snowman", "moon", "bird", "butterfly"] as const;
/** Album stickers everyone has from the start. */
const STARTER = ["sun", "flower", "house"];
/** Always-available extra decor (v22), not in the star album. */
const EXTRA: Record<string, { name: string; art: string }> = {
  shell: { name: "Ракушка", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#ffac98" d="M40 79Q22 70 10 53Q4 42 15 37Q10 22 26 23Q29 10 42 17Q50 5 59 17Q73 10 77 24Q92 22 88 38Q100 44 89 57Q76 72 60 79L62 86Q50 92 38 86Z"/><path fill="none" stroke="#a75245" d="M44 74Q26 54 16 38M47 72Q35 43 27 25M50 71L44 20M53 71L59 20M56 72Q67 43 76 26M59 74Q77 54 87 40"/><path fill="none" d="M40 79Q50 75 60 79"/></g></svg>` },
  beacon: { name: "Маяк", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#fff1d6" d="M37 39H63L71 89H29Z"/><path fill="#ec7664" d="M34 58H66L68 71H32Z"/><rect x="35" y="24" width="30" height="16" fill="#ffdb7e"/><path fill="none" d="M45 25V38M55 25V38"/><path fill="#ed7965" d="M29 24L50 8L71 24Z"/><rect x="29" y="38" width="42" height="6" rx="2" fill="#658e99"/><path fill="#658e99" d="M44 89V81A6 6 0 0 1 56 81V89Z"/><rect x="23" y="88" width="54" height="6" rx="3" fill="#d7b582"/></g></svg>` },
  sandcastle: { name: "Песочный замок", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#eec17e" d="M35 70V19H43V27H48V19H55V27H60V19H67V70Z"/><path fill="#bd8651" d="M46 49V43A5 5 0 0 1 56 43V49Z"/><path fill="#ffda95" d="M10 84L14 56V41H22V48H28V41H36V55H65V41H73V48H79V41H87V56L91 84Q51 91 10 84Z"/><path fill="#bd8651" d="M40 86V74A11 11 0 0 1 62 74V86Q51 88 40 86Z"/><path fill="none" stroke="#cb985d" d="M15 56H34M67 56H85M22 72H27M73 67H78"/></g></svg>` },
  fence: { name: "Заборчик", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><rect x="5" y="40" width="90" height="10" rx="3" fill="#cb9768"/><rect x="5" y="65" width="90" height="10" rx="3" fill="#cb9768"/><path fill="#ffe0a1" d="M11 83V31L20 19L29 31V83ZM41 83V31L50 19L59 31V83ZM71 83V31L80 19L89 31V83Z"/></g><g fill="#ae754c"><circle cx="20" cy="45" r="2"/><circle cx="50" cy="45" r="2"/><circle cx="80" cy="45" r="2"/><circle cx="20" cy="70" r="2"/><circle cx="50" cy="70" r="2"/><circle cx="80" cy="70" r="2"/></g></svg>` },
  nestbox: { name: "Скворечник", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><rect x="45" y="71" width="10" height="23" rx="2" fill="#b78560"/><path fill="#f8cf84" d="M22 41L50 16L78 41V79H22Z"/><path fill="#74b9ad" d="M12 40L47 9Q50 6 53 9L88 40L82 47L50 20L18 47Z"/><circle cx="50" cy="46" r="12" fill="#634937"/><path d="M50 65L44 70" fill="none" stroke-width="7"/><path d="M50 65L44 70" fill="none" stroke="#d99b68" stroke-width="3"/></g></svg>` },
  swing: { name: "Качели", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#e6b27b" d="M22 19H29L15 89H8ZM71 19H78L92 89H85Z"/><path fill="none" d="M35 20L37 66M65 20L63 66"/><rect x="17" y="12" width="66" height="10" rx="5" fill="#7cc4b4"/><path fill="#f28c79" d="M33 64H67L71 69Q71 73 67 73H33Q29 73 29 69Z"/><path fill="none" d="M30 69H70"/></g></svg>` },
  basket: { name: "Корзинка", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path fill="#f3c286" d="M21 49C21 -3 79 -3 79 49H71C71 7 29 7 29 49Z"/><path fill="#edb371" d="M12 47H88L80 78Q78 87 68 87H32Q22 87 20 78Z"/><path fill="none" stroke="#a56942" d="M20 61Q50 67 80 61M23 73Q50 79 77 73M31 54L37 82M50 55V84M69 54L63 82"/><rect x="9" y="43" width="82" height="11" rx="5" fill="#ffda97"/></g></svg>` },
  pennant: { name: "Праздничный флажок", art: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#3b2e25" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><rect x="18" y="13" width="7" height="80" rx="3.5" fill="#e6b378"/><path fill="#f28377" d="M25 18Q40 11 57 19Q73 26 89 23Q70 40 53 45Q39 48 25 59Z"/><path fill="#ffdc81" d="M38 15Q42 15 47 16V47Q42 49 38 51Z"/><circle cx="21.5" cy="12" r="5.5" fill="#ffd77b"/></g></svg>` },
  // v23 (Astra)
  acorn: { name: "Жёлудь", art: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\"><path fill=\"#d5914f\" d=\"M24 43 Q21 71 42 82 Q49 86 50 91 Q54 84 61 81 Q82 68 76 43Z\"/><path fill=\"#916644\" d=\"M47 32 Q44 19 55 9 Q59 7 62 12 Q51 21 54 31Z\"/><path fill=\"#ac7853\" d=\"M18 47 Q19 25 46 24 Q76 20 82 44 Q83 50 76 51 Q47 45 24 53 Q18 54 18 47Z\"/></g><path fill=\"#efb979\" d=\"M31 56 Q36 53 37 58 Q38 68 44 74 Q32 71 31 56Z\"/></svg>" },
  flashlight: { name: "Фонарик", art: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g transform=\"rotate(35 50 50)\" stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\"><rect x=\"38\" y=\"38\" width=\"24\" height=\"53\" rx=\"8\" fill=\"#6bb6b4\"/><path fill=\"#edab50\" d=\"M26 21 H74 L70 36 L61 47 H39 L30 36Z\"/><ellipse cx=\"50\" cy=\"21\" rx=\"24\" ry=\"9\" fill=\"#fff0b3\"/><rect x=\"45\" y=\"52\" width=\"10\" height=\"15\" rx=\"5\" fill=\"#f5ce77\"/></g></svg>" },
  ladybug: { name: "Божья коровка", art: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"none\" stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linecap=\"round\"><path d=\"M40 25 Q39 15 32 12 M60 25 Q61 15 68 12 M24 44 L15 39 M23 56 H12 M27 69 L18 76 M76 44 L85 39 M77 56 H88 M73 69 L82 76\"/><ellipse cx=\"50\" cy=\"31\" rx=\"18\" ry=\"15\" fill=\"#59473d\"/><ellipse cx=\"50\" cy=\"57\" rx=\"31\" ry=\"32\" fill=\"#ef7763\"/><path d=\"M50 26 V88\"/></g><g fill=\"#493a32\"><circle cx=\"36\" cy=\"44\" r=\"6\"/><circle cx=\"64\" cy=\"44\" r=\"6\"/><circle cx=\"32\" cy=\"61\" r=\"5\"/><circle cx=\"68\" cy=\"61\" r=\"5\"/><circle cx=\"40\" cy=\"74\" r=\"4\"/><circle cx=\"60\" cy=\"74\" r=\"4\"/></g></svg>" },
  button: { name: "Пуговица", art: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\"><circle cx=\"50\" cy=\"50\" r=\"39\" fill=\"#b59aca\"/><circle cx=\"50\" cy=\"50\" r=\"29\" fill=\"#d7bde3\"/></g><g fill=\"#685270\"><circle cx=\"40\" cy=\"40\" r=\"6\"/><circle cx=\"60\" cy=\"40\" r=\"6\"/><circle cx=\"40\" cy=\"60\" r=\"6\"/><circle cx=\"60\" cy=\"60\" r=\"6\"/></g><path d=\"M40 40 L60 60 M60 40 L40 60\" fill=\"none\" stroke=\"#fff0c9\" stroke-width=\"5\" stroke-linecap=\"round\"/></svg>" },
  pumpkin: { name: "Тыква", art: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\"><path fill=\"#82905a\" d=\"M43 36 Q49 24 43 16 L53 11 Q61 23 54 36Z\"/><path fill=\"#eea04e\" d=\"M49 33 C26 19 7 35 8 56 C8 78 27 88 48 82 C68 89 91 80 92 57 C94 35 75 20 55 32Z\"/><ellipse cx=\"50\" cy=\"57\" rx=\"16\" ry=\"27\" fill=\"#f7b45d\"/></g><path d=\"M31 36 Q18 55 30 75 M70 36 Q82 55 71 75\" fill=\"none\" stroke=\"#ce803e\" stroke-width=\"3\" stroke-linecap=\"round\"/></svg>" },
  magnet: { name: "Магнит", art: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g transform=\"rotate(15 50 50)\" stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\"><path fill=\"#e98078\" d=\"M16 18 H37 V53 C37 72 63 72 63 53 V18 H84 V53 C84 100 16 100 16 53Z\"/><rect x=\"16\" y=\"18\" width=\"21\" height=\"17\" rx=\"2\" fill=\"#cadbe2\"/><rect x=\"63\" y=\"18\" width=\"21\" height=\"17\" rx=\"2\" fill=\"#cadbe2\"/></g></svg>" },
  binoculars: { name: "Бинокль", art: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\"><rect x=\"32\" y=\"39\" width=\"36\" height=\"16\" rx=\"6\" fill=\"#e7b55e\"/><path fill=\"#78aaa0\" d=\"M10 66 L24 26 Q31 18 41 26 L44 65Z M56 65 L59 26 Q69 18 76 26 L90 66Z\"/><ellipse cx=\"27\" cy=\"66\" rx=\"18\" ry=\"15\" fill=\"#b7e2df\"/><ellipse cx=\"73\" cy=\"66\" rx=\"18\" ry=\"15\" fill=\"#b7e2df\"/><circle cx=\"50\" cy=\"47\" r=\"6\" fill=\"#f3cb79\"/></g><g fill=\"#f4fffa\"><ellipse cx=\"22\" cy=\"62\" rx=\"5\" ry=\"3\"/><ellipse cx=\"68\" cy=\"62\" rx=\"5\" ry=\"3\"/></g></svg>" },
  envelope: { name: "Конверт", art: "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g transform=\"rotate(-9 50 50)\" stroke=\"#3b2e25\" stroke-width=\"3\" stroke-linejoin=\"round\"><rect x=\"10\" y=\"24\" width=\"80\" height=\"53\" rx=\"6\" fill=\"#f3ce95\"/><path d=\"M13 74 L39 51 M87 74 L61 51\" fill=\"none\"/><path fill=\"#ffe1ad\" d=\"M12 27 Q13 24 17 24 H83 Q87 24 88 27 L54 55 Q50 58 46 55Z\"/><path fill=\"#e68d84\" d=\"M50 62 L42 54 C37 47 46 43 50 49 C55 43 63 48 58 54Z\"/></g></svg>" },
};

// v29: painted pictures replace the flat SVG where there is one.
for (const [key, item] of Object.entries(EXTRA)) if (hasArt(key)) item.art = artImg(key);

const CLEAR_ICON = `<svg viewBox="0 0 40 40"><path d="M12 30 L26 10 L33 15 L20 33 H13 Z" fill="#f7a8c8" stroke="#3b2e25" stroke-width="2.5" stroke-linejoin="round"/><path d="M19 20 L26 25" stroke="#3b2e25" stroke-width="2.5"/><path d="M8 34 H32" stroke="#3b2e25" stroke-width="2.5" stroke-linecap="round"/></svg>`;
const UNDO_ICON = `<svg viewBox="0 0 40 40"><path d="M14 12 H24 C30 12 33 16 33 21 C33 26 30 30 24 30 H12" fill="none" stroke="#3b2e25" stroke-width="3.5" stroke-linecap="round"/><path d="M19 6 L12 12 L19 18" fill="none" stroke="#3b2e25" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

type Item = { id: string; name: string; art: () => Element };
const decorItem = (id: string): Item => ({ id: `d:${id}`, name: SHAPES[id]!.name, art: () => svgNode(SHAPES[id]!.svg, "sk-art") });
const extraItem = (id: string): Item => ({ id: `d:${id}`, name: EXTRA[id]!.name, art: () => svgNode(EXTRA[id]!.art, "sk-art") });
const albumItem = (s: Sticker): Item => ({ id: s.id, name: s.name, art: () => stickerArt(s, "sk-art") });

function itemFor(id: string): Item | null {
  if (id.startsWith("d:")) {
    const key = id.slice(2);
    if (EXTRA[key]) return extraItem(key);
    return SHAPES[key] ? decorItem(key) : null;
  }
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

  const bgBtn = el("button", { class: "btn btn--back sk-tool", attrs: { type: "button" } });
  const clearBtn = el("button", { class: "btn btn--back sk-tool", attrs: { type: "button" } });
  const tools = el("span", { class: "toolbar__tools sk-tools" }, [bgBtn, clearBtn]);
  const scene = el("div", { class: "sk-scene", attrs: { role: "group", "aria-label": "Картинка" } });
  const tray = el("div", { class: "sk-tray", attrs: { role: "list", "aria-label": "Наклейки" } });
  const note = el("p", { class: "sk-note", text: "" });
  const view = el("div", { class: "screen screen--play game--stikery" }, [toolbar("Картинка", () => confirmLeave(goHome), tools), el("div", { class: "stage sk-stage" }, [scene, el("div", { class: "sk-side" }, [tray, note])])]);
  root.append(view);

  const save = (): void => void platform.storage.set(KEY, pic);
  const box = (): DOMRect => scene.getBoundingClientRect();

  function paintTools(): void {
    const bg = BACKGROUNDS.find((b) => b.id === pic.bg)!;
    bgBtn.replaceChildren(el("span", { class: `sk-swatch sk-bg--${pic.bg}`, attrs: { "aria-hidden": "true" } }));
    bgBtn.setAttribute("aria-label", `Сменить фон, сейчас ${bg.name}`);
    clearBtn.replaceChildren(svgNode(undo ? UNDO_ICON : CLEAR_ICON, "sk-tool__icon"));
    clearBtn.setAttribute("aria-label", undo ? "Вернуть наклейки" : "Очистить картинку");
    clearBtn.classList.toggle("is-undo", !!undo);
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
    fillTray([...DECOR.map(decorItem), ...Object.keys(EXTRA).map(extraItem), ...album]);
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
