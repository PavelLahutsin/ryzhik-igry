import { useStyles } from "../../shared/style";
import { startRouter, type Route } from "./router";
import { renderCollection } from "./screens/collection";
import { renderGame } from "./screens/game";
import { renderLevels } from "./screens/levels";
import { renderStart } from "./screens/start";
import { renderWin } from "./screens/win";
import css from "./style.css?inline";

/** «Тайная картинка»: the Xonix-like game, ported as is from its own site. */
export function mount(root: HTMLElement): () => void {
  useStyles(css);
  let cleanup: (() => void) | null = null;

  function render(route: Route): void {
    cleanup?.();
    cleanup = null;
    root.replaceChildren();
    switch (route.name) {
      case "start":
        cleanup = renderStart(root);
        break;
      case "levels":
        cleanup = renderLevels(root);
        break;
      case "game":
        cleanup = renderGame(root, route.levelId);
        break;
      case "win":
        cleanup = renderWin(root, route.levelId);
        break;
      case "collection":
        cleanup = renderCollection(root);
        break;
    }
    document.body.dataset.route = route.name;
  }

  const stop = startRouter(render);
  return () => {
    stop();
    cleanup?.();
    cleanup = null;
  };
}
