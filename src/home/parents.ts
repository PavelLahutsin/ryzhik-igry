import { STAR_RULES } from "../shared/stars";
import { audio } from "../shared/audio";
import { el } from "../shared/dom";
import { goHome } from "../shared/router";
import { toolbar } from "../shared/ui";
import { games } from "../games/registry";
import { gateTask, gateWords } from "./gate";
import { HOWTO } from "../shared/howto-data";
import { removeSaved } from "../shared/reset";
import { resetSeen } from "../shared/seen";
import { resetPlayed } from "../shared/played";

let unlocked = false;

/**
 * «Родителям»: a simple grown-up gate (tap three digits written as words),
 * then settings: sound and per-game progress reset. Nothing leaves the device.
 */
export function renderParents(root: HTMLElement): () => void {
  const view = el("div", { class: "screen screen--parent" });
  root.append(view);
  if (unlocked) settings(view);
  else gate(view, () => {
    unlocked = true;
    view.replaceChildren();
    settings(view);
  });
  return () => view.remove();
}

function gate(view: HTMLElement, onPass: () => void): void {
  let task = gateTask(Math.random);
  let typed: number[] = [];
  const ask = el("p", { class: "gate__ask" });
  const dots = el("div", { class: "gate__dots", attrs: { "aria-hidden": "true" } });
  const paint = (): void => {
    ask.textContent = `Нажмите по порядку: ${gateWords(task).join(", ")}`;
    dots.replaceChildren(...task.map((_, i) => el("i", { class: i < typed.length ? "is-on" : "" })));
  };
  const keys = el(
    "div",
    { class: "gate__keys" },
    [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) =>
      el("button", {
        class: "btn",
        attrs: { type: "button" },
        text: String(n),
        on: {
          click: () => {
            typed.push(n);
            if (typed[typed.length - 1] !== task[typed.length - 1]) {
              task = gateTask(Math.random);
              typed = [];
            } else if (typed.length === task.length) {
              onPass();
              return;
            }
            paint();
          },
        },
      }),
    ),
  );
  view.append(
    toolbar("Для взрослых", goHome),
    el("section", { class: "panel" }, [
      el("p", { text: "Этот раздел для родителей. Чтобы войти, нажмите цифры, написанные словами." }),
      ask,
      dots,
      keys,
    ]),
  );
  paint();
}

function settings(view: HTMLElement): void {
  const soundBtn = el("button", { class: "btn", attrs: { type: "button" } });
  const paintSound = (): void => {
    soundBtn.textContent = audio.enabled ? "Включён" : "Выключен";
    soundBtn.classList.toggle("is-on", audio.enabled);
  };
  soundBtn.addEventListener("click", () => {
    audio.setEnabled(!audio.enabled);
    paintSound();
  });
  paintSound();

  const musicBtn = el("button", { class: "btn", attrs: { type: "button" } });
  const paintMusic = (): void => {
    musicBtn.textContent = audio.music ? "Включена" : "Выключена";
    musicBtn.classList.toggle("is-on", audio.music);
  };
  musicBtn.addEventListener("click", () => {
    audio.setMusic(!audio.music);
    paintMusic();
  });
  paintMusic();

  const tipsBtn = el("button", { class: "btn", attrs: { type: "button" }, text: "Показать снова" });
  tipsBtn.addEventListener("click", () => {
    void resetSeen();
    void resetPlayed();
    tipsBtn.textContent = "Готово";
    tipsBtn.disabled = true;
  });

  const rules = games
    .filter((game) => HOWTO[game.id])
    .map((game) => {
      const h = HOWTO[game.id]!;
      return el("details", { class: "rules" }, [
        el("summary", { text: game.title }),
        ...h.rules.split("\n").map((t) => el("p", { text: t })),
        h.stars ? el("p", { class: "rules__dev" }, [el("b", { text: "Звёзды: " }), h.stars.replace(/ · /g, "; ")]) : null,
        el("p", { class: "rules__dev" }, [el("b", { text: "Развивает: " }), h.develops]),
      ]);
    });

  const resets = games
    .filter((game) => game.resetKeys?.length)
    .map((game) => {
      const btn = el("button", { class: "btn", attrs: { type: "button" }, text: "Сбросить" });
      let armed = false;
      btn.addEventListener("click", () => {
        if (!armed) {
          armed = true;
          btn.textContent = "Точно?";
          btn.classList.add("is-armed");
          return;
        }
        for (const key of game.resetKeys ?? []) void removeSaved(key);
        btn.textContent = "Сброшено";
        btn.classList.remove("is-armed");
        btn.disabled = true;
      });
      return el("div", { class: "setting" }, [el("span", { text: game.title }), btn]);
    });

  view.append(
    toolbar("Родителям", goHome),
    el("section", { class: "panel" }, [
      el("h2", { text: "Звук" }),
      el("div", { class: "setting" }, [el("span", { text: "Звуки в играх" }), soundBtn]),
      el("div", { class: "setting" }, [el("span", { text: "Тихая музыка в играх" }), musicBtn]),
      el("p", { text: "Звук, голос и музыка раскраски настраиваются в самой раскраске." }),
    ]),
    el("section", { class: "panel" }, [
      el("h2", { text: "Подсказки" }),
      el("p", { text: "Карточки «Как играть» и пузырьки «Новое!» показываются один раз. Можно показать их снова." }),
      el("div", { class: "setting" }, [el("span", { text: "Показать подсказки снова" }), tipsBtn]),
    ]),
    el("section", { class: "panel" }, [
      el("h2", { text: "Как играть и что развивает" }),
      el("p", { text: STAR_RULES }),
      ...rules,
    ]),
    el("section", { class: "panel" }, [
      el("h2", { text: "Прогресс" }),
      el("p", { text: "Сброс закроет уровни игры заново и обнулит её звёзды. Рисунки раскраски здесь не стираются." }),
      ...resets,
    ]),
    el("section", { class: "panel" }, [
      el("h2", { text: "О приложении" }),
      el("p", {
        text: "Игры с лисёнком Рыжиком для детей 3–6 лет. Без рекламы, покупок и таймеров, проиграть нельзя. Приложение работает без интернета и ничего не отправляет: прогресс хранится только в браузере этого устройства.",
      }),
    ]),
  );
}
