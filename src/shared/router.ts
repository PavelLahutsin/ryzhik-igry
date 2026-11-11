/**
 * Hash routing for the games shell, no library.
 *
 *   #/                      home menu with game tiles
 *   #/<gameId>/<sub/path>   one game; the game parses its own sub path
 *
 * A hash keeps the app working from any base path (GitHub Pages, a VK Mini
 * App iframe, a Capacitor webview).
 */
export function segments(hash: string): string[] {
  return hash.replace(/^#/, "").split("/").filter(Boolean);
}

/** First path segment: the game id, or null for the home menu. */
export function gameOf(hash: string): string | null {
  return segments(hash)[0] ?? null;
}

/** Segments after the game id, e.g. "#/mozaika/play/3" -> ["play", "3"]. */
export function subSegments(hash: string, gameId: string): string[] {
  const all = segments(hash);
  return all[0] === gameId ? all.slice(1) : [];
}

/** Hash for an absolute shell path, e.g. "/mozaika/play/3". */
export function href(path: string): string {
  return `#${path.startsWith("/") ? path : `/${path}`}`;
}

/** Hash for a path inside one game, e.g. gameHref("mozaika", "/play/3"). */
export function gameHref(gameId: string, path: string): string {
  const sub = path.replace(/^\/+/, "");
  return href(`/${gameId}/${sub}`);
}

function go(next: string, replace?: boolean): void {
  if (window.location.hash === next) {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    return;
  }
  if (replace) {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${next}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    return;
  }
  window.location.hash = next;
}

export function navigate(path: string, options?: { replace?: boolean }): void {
  go(href(path), options?.replace);
}

export function navigateGame(gameId: string, path: string, options?: { replace?: boolean }): void {
  go(gameHref(gameId, path), options?.replace);
}

/** Back to the home menu with all game tiles. */
export function goHome(): void {
  navigate("/");
}

/**
 * Listen to hash changes that stay inside one game. Returns a stop function.
 * The shell unmounts the game (and so this listener) when the game id changes.
 */
export function listenGame(gameId: string, onSub: (sub: string[]) => void): () => void {
  const handler = (): void => {
    if (gameOf(window.location.hash) !== gameId) return;
    onSub(subSegments(window.location.hash, gameId));
  };
  window.addEventListener("hashchange", handler);
  handler();
  return () => window.removeEventListener("hashchange", handler);
}
