import "@fontsource/comfortaa/cyrillic-700.css";
import "@fontsource/comfortaa/latin-700.css";
import "@fontsource/nunito/cyrillic-400.css";
import "@fontsource/nunito/cyrillic-700.css";
import "@fontsource/nunito/cyrillic-800.css";
import "@fontsource/nunito/latin-400.css";
import "@fontsource/nunito/latin-700.css";
import "@fontsource/nunito/latin-800.css";

import { findGame, freshKey, type GameEntry } from "./games/registry";
import { markOpened } from "./shared/played";
import { TITLE_VOICE } from "./shared/voice-lines";
import { firstOpenGift } from "./shared/gift";
import { renderHome } from "./home/home";
import { renderParents } from "./home/parents";
import { renderAlbum } from "./home/album";
import { platform } from "./shared/platform";
import { gameOf } from "./shared/router";
import { reducedMotion, useStyles } from "./shared/style";
import { el } from "./shared/dom";
import { audio } from "./shared/audio";
import { dragFeedback } from "./shared/drag";
import { attachHowToButton, closeHowTo, howToSeen, showHowTo } from "./shared/howto";
import { clearTips } from "./shared/tips";
import baseCss from "./shared/base.css?inline";
import overlaysCss from "./shared/overlays.css?inline";

dragFeedback.none = () => audio.play("drop");

/** v13: remember the game (recent row, badges); the very first time a small gift opens. */
async function opened(game: GameEntry): Promise<void> {
  const key = freshKey(game);
  if (key) await markOpened(key, false);
  if (await markOpened(game.id)) firstOpenGift(root);
}

const node = document.getElementById("app");
if (!node) throw new Error("Нет #app");
const root: HTMLElement = node;
document.head.append(el("style", { attrs: { id: "overlay-style" }, text: overlaysCss }));

let current: { id: string | null; cleanup: (() => void) | null } | null = null;
let token = 0;

/**
 * The shell owns the first path segment: "#/" is the home menu,
 * "#/<gameId>/..." mounts that game, which then routes inside itself.
 * Changes inside the same game are left to the game.
 */
function onHash(): void {
  const first = gameOf(window.location.hash);
  const game = findGame(first);
  const id = game?.id ?? (first === "roditelyam" || first === "albom" ? first : null);
  if (current && current.id === id) return;

  current?.cleanup?.();
  closeHowTo();
  clearTips();
  document.body.classList.remove("is-tutorial");
  root.replaceChildren();
  const mine = ++token;
  current = { id, cleanup: null };
  audio.setTheme(id ?? "home");

  if (id === "roditelyam") {
    useStyles(baseCss);
    document.body.dataset.route = "parents";
    current.cleanup = renderParents(root);
    return;
  }

  if (id === "albom") {
    useStyles(baseCss);
    document.body.dataset.route = "album";
    current.cleanup = renderAlbum(root);
    return;
  }

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
      const stop = module.mount(root);
      void opened(game);
      const stopHelp = attachHowToButton(game.id, root);
      current.cleanup = () => {
        stopHelp();
        stop();
      };
      // First time in this game: show «Как играть».
      void howToSeen(game.id).then((seen) => {
        if (mine !== token) return;
        if (!seen) void showHowTo(game.id);
        // v13: Ryzhik says the game's name (when recorded) unless «Как играть» speaks.
        else if (TITLE_VOICE[game.id]) audio.say(TITLE_VOICE[game.id]!);
      });
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
