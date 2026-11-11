import { audio } from "../shared/audio";
import { el } from "../shared/dom";
import { OBJECTS, type ObjectId } from "../shared/objects";
import { platform } from "../shared/platform";
import { svgNode } from "../shared/ui";

/**
 * «Подарок дня»: once a day a gift box on the home screen. Inside: a drawn
 * thing and a short line for the season. Nothing to win or lose.
 */
export type Season = "winter" | "spring" | "summer" | "autumn";

export function seasonOf(d: Date): Season {
  const m = d.getMonth();
  if (m === 11 || m <= 1) return "winter";
  if (m <= 4) return "spring";
  if (m <= 7) return "summer";
  return "autumn";
}

const GIFTS: Record<Season, Array<[ObjectId, string]>> = {
  winter: [
    ["star", "Зимняя звёздочка — загадай желание!"],
    ["cup", "Тёплый чай с малиной — греет лапки!"],
    ["ball", "Снежок! Только он не тает."],
    ["balloon", "Праздничный шарик — скоро праздник!"],
  ],
  spring: [
    ["flower", "Первый весенний цветочек!"],
    ["drop", "Капель! Весна пришла!"],
    ["leaf", "Новый зелёный листик!"],
    ["boat", "Кораблик для весеннего ручейка!"],
  ],
  summer: [
    ["sun", "Солнышко светит — лето!"],
    ["kite", "Воздушный змей — запускай!"],
    ["cherry", "Сладкая вишенка из сада!"],
    ["ball", "Мячик — играем во дворе!"],
  ],
  autumn: [
    ["mushroom", "Грибок из осеннего леса!"],
    ["leaf", "Осенний листик — красивый!"],
    ["umbrella", "Зонтик от осеннего дождика!"],
    ["apple", "Яблочко с яблоньки!"],
  ],
};

export const dayKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** The same gift all day; changes from day to day. */
export function giftFor(d: Date): { obj: ObjectId; text: string; season: Season } {
  const season = seasonOf(d);
  const list = GIFTS[season];
  const n = Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86400000);
  const [obj, text] = list[((n % list.length) + list.length) % list.length]!;
  return { obj, text, season };
}

const KEY = "daily";

const BOX = `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="8" y="26" width="48" height="32" rx="5" fill="#f27aa0"/><rect x="5" y="18" width="54" height="12" rx="4" fill="#ff8fb4"/><rect x="28" y="18" width="8" height="40" fill="#ffc94a"/><path d="M32 18 C22 4 10 10 18 18 Z M32 18 C42 4 54 10 46 18 Z" fill="#ffc94a" stroke="#e0a520" stroke-width="2"/></svg>`;

/** A gift button for the home header; hidden once today's gift is opened. */
export function dailyButton(onOpen: (overlay: HTMLElement) => void): HTMLElement {
  const today = dayKey(new Date());
  const btn = el("button", { class: "btn btn--back home__gift", attrs: { type: "button", "aria-label": "Подарок дня", hidden: true } }, [svgNode(BOX, "home__gift-art")]);
  void platform.storage.get<string>(KEY).then((last) => {
    btn.hidden = last === today;
  });
  btn.addEventListener("click", () => {
    btn.hidden = true;
    void platform.storage.set(KEY, today);
    onOpen(giftOverlay(giftFor(new Date())));
  });
  return btn;
}

function giftOverlay(gift: { obj: ObjectId; text: string; season: Season }): HTMLElement {
  audio.play("reveal");
  audio.say("gift");
  const close = (): void => {
    audio.play("click");
    overlay.remove();
  };
  const overlay = el("div", { class: `gift gift--${gift.season}`, attrs: { role: "dialog", "aria-label": "Подарок дня" } }, [
    el("div", { class: "gift__card" }, [
      el("p", { class: "gift__title", text: "Подарок дня" }),
      svgNode(OBJECTS[gift.obj].svg, "gift__art"),
      el("p", { class: "gift__text", text: gift.text }),
      el("button", { class: "btn btn--play", attrs: { type: "button" }, on: { click: close } }, [el("span", { text: "Спасибо!" })]),
    ]),
  ]);
  requestAnimationFrame(() => overlay.classList.add("is-open"));
  return overlay;
}
