/**
 * Routes inside the game. In the games shell they live under
 * "#/tajnaya-kartinka/...", so paths here stay as they were ("/levels").
 */
import { gameHref, listenGame, subSegments } from "../../shared/router";

export const GAME_ID = "tajnaya-kartinka";
export type Route =
  | { name: "start" }
  | { name: "levels" }
  | { name: "game"; levelId: string }
  | { name: "win"; levelId: string }
  | { name: "collection" };

function segments(hash: string): string[] {
  return subSegments(hash, GAME_ID);
}

export function parseRoute(hash: string): Route {
  const [head, ...rest] = segments(hash);
  switch (head) {
    case undefined:
    case "":
    case "start":
      return { name: "start" };
    case "levels":
      return { name: "levels" };
    case "game":
      return rest[0] ? { name: "game", levelId: rest[0] } : { name: "levels" };
    case "win":
      return rest[0] ? { name: "win", levelId: rest[0] } : { name: "levels" };
    case "collection":
      return { name: "collection" };
    default:
      return { name: "start" };
  }
}

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
