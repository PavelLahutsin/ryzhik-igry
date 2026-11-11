import { useStyles } from "../../shared/style";
import { isParentUnlocked, renderGate } from "./screens/gate";
import { mountPicture } from "./screens/coloring";
import { renderAlbum } from "./screens/album";
import { renderAlbums } from "./screens/albums";
import { renderDrawings, renderExport } from "./screens/drawings";
import { renderLullabies } from "./screens/lullabies";
import { renderMenu } from "./screens/menu";
import { renderMissing } from "./screens/missing";
import { renderParent } from "./screens/parent";
import { renderReward } from "./screens/reward";
import { renderSound } from "./screens/sound";
import { navigate, startRouter, type Route } from "./router";
import { sound } from "./sound";
import { store } from "./storage";
import css from "./style.css?inline";
import "./platform";

/**
 * «Раскраска с Рыжиком», ported as is from the ryzhik-coloring site:
 * albums, pictures, brush tools, settings, parent section, lullabies.
 * Its storage keeps the "ryzhik:" prefix and IndexedDB name, so drawings
 * made on pavellahutsin.github.io/ryzhik-coloring/ show up here too.
 */
export function mount(root: HTMLElement): () => void {
  useStyles(css);
  let cleanup: (() => void) | null = null;
  let gone = false;

  function render(route: Route): void {
    cleanup?.();
    cleanup = null;
    root.replaceChildren();

    switch (route.name) {
      case "menu":
        cleanup = renderMenu(root);
        break;
      case "albums":
        cleanup = renderAlbums(root);
        break;
      case "album":
        cleanup = renderAlbum(root, route.albumId);
        break;
      case "picture":
        cleanup = mountPicture(root, route.pictureId, route.drawingId);
        break;
      case "reward":
        cleanup = renderReward(root, route.pictureId, route.drawingId, route.newStar === true);
        break;
      case "drawings":
        cleanup = renderDrawings(root);
        break;
      case "sound":
        cleanup = renderSound(root);
        break;
      case "lullabies":
        cleanup = renderLullabies(root);
        break;
      case "gate":
        cleanup = renderGate(root, route.next);
        break;
      case "parent":
        // The adult section is reachable only through the gate in this session.
        if (!isParentUnlocked()) {
          navigate("/gate/parent", { replace: true });
          return;
        }
        cleanup = renderParent(root);
        break;
      case "save":
      case "share":
        if (!isParentUnlocked()) {
          navigate(`/gate/${route.name}`, { replace: true });
          return;
        }
        cleanup = renderExport(root, route.name);
        break;
      default:
        cleanup = renderMissing(root);
    }
    document.body.dataset.route = route.name;
  }

  void store.settings().then((settings) => {
    if (gone) return;
    sound.configure(settings);
  });

  // First gesture unlocks audio (the tile tap that opened us came before load).
  const armAudio = (): void => sound.unlock();
  document.addEventListener("pointerdown", armAudio, { once: true });
  document.addEventListener("keydown", armAudio, { once: true });

  const stop = startRouter(render);
  return () => {
    gone = true;
    document.removeEventListener("pointerdown", armAudio);
    document.removeEventListener("keydown", armAudio);
    stop();
    cleanup?.();
    cleanup = null;
  };
}
