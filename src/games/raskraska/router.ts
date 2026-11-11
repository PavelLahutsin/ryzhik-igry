/**
 * Routes inside the coloring game. In the games shell they live under
 * "#/raskraska/...", so paths here stay as they were ("/albums").
 */
import { gameHref, listenGame, subSegments } from "../../shared/router";

export const GAME_ID = "raskraska";
export type Route =
  | { name: "menu" }
  | { name: "albums" }
  | { name: "album"; albumId: string }
  | { name: "picture"; pictureId: string; drawingId?: string }
  | { name: "reward"; pictureId: string; drawingId?: string; newStar?: boolean }
  | { name: "drawings" }
  | { name: "sound" }
  | { name: "lullabies" }
  | { name: "gate"; next: string }
  | { name: "parent" }
  | { name: "save" }
  | { name: "share" }
  | { name: "missing" };

function segments(hash: string): string[] {
  return subSegments(hash, GAME_ID);
}

export function parseRoute(hash: string): Route {
  const [head, ...rest] = segments(hash);
  switch (head) {
    case undefined:
    case "":
    case "menu":
      return { name: "menu" };
    case "albums":
      return { name: "albums" };
    case "album":
      return rest[0] ? { name: "album", albumId: rest[0] } : { name: "albums" };
    case "picture":
      return rest[0]
        ? { name: "picture", pictureId: rest[0], drawingId: rest[1] || undefined }
        : { name: "albums" };
    case "reward":
      return rest[0]
        ? { name: "reward", pictureId: rest[0], drawingId: rest[1] || undefined, newStar: rest[2] === "star" }
        : { name: "menu" };
    case "drawings":
      return { name: "drawings" };
    case "sound":
      return { name: "sound" };
    case "lullabies":
      return { name: "lullabies" };
    case "gate":
      return { name: "gate", next: rest[0] ?? "parent" };
    case "parent":
      return { name: "parent" };
    case "save":
      return { name: "save" };
    case "share":
      return { name: "share" };
    default:
      return { name: "missing" };
  }
}

/** Path without the leading hash, e.g. "/album/friends". */
export function href(path: string): string {
  return gameHref(GAME_ID, path);
}

export function navigate(path: string, options?: { replace?: boolean }): void {
  const next = href(path);
  if (window.location.hash === next) {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    return;
  }
  if (options?.replace) {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${next}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    return;
  }
  window.location.hash = next;
}

export function currentRoute(): Route {
  return parseRoute(window.location.hash);
}

export function startRouter(onRoute: (route: Route) => void): () => void {
  return listenGame(GAME_ID, () => onRoute(currentRoute()));
}
