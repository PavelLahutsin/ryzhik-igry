import "@fontsource/comfortaa/cyrillic-700.css";
import "@fontsource/comfortaa/latin-700.css";
import "@fontsource/nunito/cyrillic-400.css";
import "@fontsource/nunito/cyrillic-700.css";
import "@fontsource/nunito/cyrillic-800.css";
import "@fontsource/nunito/latin-400.css";
import "@fontsource/nunito/latin-700.css";
import "@fontsource/nunito/latin-800.css";

import { findGame } from "./games/registry";
import { renderHome } from "./home/home";
import { platform } from "./shared/platform";
import { gameOf } from "./shared/router";
import { reducedMotion, useStyles } from "./shared/style";
import { el } from "./shared/dom";
import baseCss from "./shared/base.css?inline";

const node = document.getElementById("app");
if (!node) throw new Error("Нет #app");
const root: HTMLElement = node;

let current: { id: string | null; cleanup: (() => void) | null } | null = null;
let token = 0;

/**
 * The shell owns the first path segment: "#/" is the home menu,
 * "#/<gameId>/..." mounts that game, which then routes inside itself.
 * Changes inside the same game are left to the game.
 */
function onHash(): void {
  const game = findGame(gameOf(window.location.hash));
  const id = game?.id ?? null;
  if (current && current.id === id) return;

  current?.cleanup?.();
  root.replaceChildren();
  const mine = ++token;
  current = { id, cleanup: null };

  if (!game) {
    if (gameOf(window.location.hash)) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#/`);
    }
    useStyles(baseCss);
    document.body.dataset.route = "home";
    current.cleanup = renderHome(root);
    return;
  }

  useStyles(baseCss);
  root.append(el("p", { class: "loading", text: "Загружаем…" }));
  game
    .load()
    .then((module) => {
      if (mine !== token || !current) return;
      root.replaceChildren();
      current.cleanup = module.mount(root);
    })
    .catch(() => {
      if (mine !== token) return;
      root.replaceChildren(el("p", { class: "loading", text: "Не получилось открыть игру. Обновите страницу." }));
    });
}

document.documentElement.dataset.motion = reducedMotion() ? "reduced" : "full";
document.documentElement.lang = "ru";
document.addEventListener("dblclick", (event) => event.preventDefault(), { passive: false });
document.addEventListener("contextmenu", (event) => event.preventDefault());

if (!window.location.hash) {
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#/`);
}
window.addEventListener("hashchange", onHash);
onHash();

// Exposed for the future VK/Capacitor shells.
void platform;
