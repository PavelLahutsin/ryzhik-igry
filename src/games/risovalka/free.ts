/**
 * «Свободное рисование» in «Обводилка» ("#/risovalka/free"): a blank page,
 * big colour buttons, a thick and a thin brush, an eraser and «Чистый лист».
 * No tasks, no stars — just drawing.
 */
import { audio } from "../../shared/audio";
import { el } from "../../shared/dom";
import { createScope } from "../../shared/lifecycle";
import { navigateGame } from "../../shared/router";
import { toolbar } from "../../shared/ui";

const GAME = "risovalka";

export const COLORS: ReadonlyArray<[string, string]> = [
  ["#e8463a", "Красный"],
  ["#ff8a3d", "Оранжевый"],
  ["#ffc93c", "Жёлтый"],
  ["#5fbf4e", "Зелёный"],
  ["#3a8fd4", "Синий"],
  ["#9b6cd8", "Фиолетовый"],
  ["#f27aa0", "Розовый"],
  ["#3b2e25", "Чёрный"],
];

/** Brush widths, in CSS pixels of the page (scaled to the canvas). */
export const BRUSH = { thin: 8, thick: 22, eraser: 34 } as const;

/** The card on top of the level list that opens the free mode. */
export function freeCard(): HTMLElement {
  return el(
    "button",
    {
      class: "rv-freecard",
      attrs: { type: "button" },
      on: {
        click: () => {
          audio.unlock();
          audio.play("tap");
          navigateGame(GAME, "/free");
        },
      },
    },
    [
      el("span", { class: "rv-freecard__dots", attrs: { "aria-hidden": "true" } }, COLORS.slice(0, 5).map(([c]) => el("i", { style: { background: c } }))),
      el("span", { class: "rv-freecard__text" }, [el("b", { text: "Свободное рисование" }), el("span", { text: "Рисуй что хочешь, любыми цветами" })]),
    ],
  );
}

export function freeRoute(root: HTMLElement): () => void {
  document.body.dataset.route = "play";
  const scope = createScope();
  let color = COLORS[0]![0];
  let width: number = BRUSH.thick;
  let erasing = false;

  const canvas = el("canvas", { class: "rv-free__canvas", attrs: { "aria-label": "Лист для рисования" } }) as HTMLCanvasElement;
  const paper = el("div", { class: "rv-free__paper" }, [canvas]);
  const colorBtns = COLORS.map(([c, name]) =>
    el("button", { class: "rv-free__color", style: { background: c }, attrs: { type: "button", "aria-label": name }, on: { click: () => pickColor(c) } }),
  );
  const thick = el("button", { class: "rv-free__tool rv-free__tool--thick", attrs: { type: "button", "aria-label": "Толстая кисть" }, on: { click: () => pickWidth(BRUSH.thick) } }, [el("i")]);
  const thin = el("button", { class: "rv-free__tool rv-free__tool--thin", attrs: { type: "button", "aria-label": "Тонкая кисть" }, on: { click: () => pickWidth(BRUSH.thin) } }, [el("i")]);
  const eraser = el("button", { class: "rv-free__tool rv-free__tool--eraser", attrs: { type: "button", "aria-label": "Ластик" }, on: { click: () => pickEraser() } }, [el("i")]);
  const clear = el("button", { class: "rv-free__tool rv-free__tool--clear", attrs: { type: "button", "aria-label": "Чистый лист" }, on: { click: () => wipe() } }, [el("span", { text: "Чистый лист" })]);
  const palette = el("div", { class: "rv-free__palette" }, [el("div", { class: "rv-free__colors" }, colorBtns), el("div", { class: "rv-free__tools" }, [thick, thin, eraser, clear])]);
  const view = el("div", { class: `screen screen--play game--${GAME} rv-free` }, [
    toolbar("Свободное рисование", () => navigateGame(GAME, "/")),
    el("div", { class: "stage rv-free__stage" }, [paper, palette]),
  ]);
  root.append(view);
  const ctx = canvas.getContext("2d")!;

  function paint(): void {
    colorBtns.forEach((b, i) => b.classList.toggle("is-on", !erasing && COLORS[i]![0] === color));
    thick.classList.toggle("is-on", !erasing && width === BRUSH.thick);
    thin.classList.toggle("is-on", !erasing && width === BRUSH.thin);
    eraser.classList.toggle("is-on", erasing);
    view.style.setProperty("--brush", color);
  }
  function pickColor(c: string): void {
    audio.unlock();
    audio.play("pick");
    color = c;
    erasing = false;
    if (width === BRUSH.eraser) width = BRUSH.thick;
    paint();
  }
  function pickWidth(w: number): void {
    audio.play("tap");
    width = w;
    erasing = false;
    paint();
  }
  function pickEraser(): void {
    audio.play("tap");
    erasing = true;
    paint();
  }
  function wipe(): void {
    audio.play("magic");
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#fffdf8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  // Keep the drawing when the screen turns: copy it into the new size.
  let scale = 1;
  const fit = (): void => {
    const r = paper.getBoundingClientRect();
    if (r.width < 10 || r.height < 10) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(r.width * dpr);
    const h = Math.round(r.height * dpr);
    if (w === canvas.width && h === canvas.height) return;
    const old = canvas.width > 0 && canvas.height > 0 ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null;
    const oldW = canvas.width;
    const oldH = canvas.height;
    canvas.width = w;
    canvas.height = h;
    scale = dpr;
    ctx.fillStyle = "#fffdf8";
    ctx.fillRect(0, 0, w, h);
    if (old) {
      const tmp = document.createElement("canvas");
      tmp.width = oldW;
      tmp.height = oldH;
      tmp.getContext("2d")!.putImageData(old, 0, 0);
      ctx.drawImage(tmp, 0, 0);
    }
  };
  const ro = new ResizeObserver(fit);
  ro.observe(paper);
  scope.add(() => ro.disconnect());
  fit();

  let last: { x: number; y: number } | null = null;
  let pointer: number | null = null;
  const at = (e: PointerEvent): { x: number; y: number } => {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * scale, y: (e.clientY - r.top) * scale };
  };
  const dot = (p: { x: number; y: number }): void => {
    ctx.fillStyle = erasing ? "#fffdf8" : color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, ((erasing ? BRUSH.eraser : width) * scale) / 2, 0, Math.PI * 2);
    ctx.fill();
  };
  const line = (a: { x: number; y: number }, b: { x: number; y: number }): void => {
    ctx.strokeStyle = erasing ? "#fffdf8" : color;
    ctx.lineWidth = (erasing ? BRUSH.eraser : width) * scale;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  };
  const down = (e: PointerEvent): void => {
    if (pointer !== null) return;
    audio.unlock();
    pointer = e.pointerId;
    canvas.setPointerCapture?.(e.pointerId);
    last = at(e);
    dot(last);
    e.preventDefault();
  };
  const move = (e: PointerEvent): void => {
    if (e.pointerId !== pointer || !last) return;
    const events = typeof e.getCoalescedEvents === "function" ? e.getCoalescedEvents() : [e];
    for (const ev of events.length ? events : [e]) {
      const p = at(ev);
      line(last, p);
      last = p;
    }
  };
  const up = (e: PointerEvent): void => {
    if (e.pointerId !== pointer) return;
    pointer = null;
    last = null;
  };
  canvas.style.touchAction = "none";
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  scope.add(() => {
    canvas.removeEventListener("pointerdown", down);
    canvas.removeEventListener("pointermove", move);
    canvas.removeEventListener("pointerup", up);
    canvas.removeEventListener("pointercancel", up);
  });

  paint();
  return scope.dispose;
}
