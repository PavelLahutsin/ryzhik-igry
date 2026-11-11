/**
 * One <style> element holds the CSS of whatever is on screen. Each game
 * brings its own stylesheet as an inline string (`?inline`), so the two
 * ported apps keep their CSS untouched without clashing with each other.
 */
let node: HTMLStyleElement | null = null;

export function useStyles(...sheets: string[]): void {
  if (!node) {
    node = document.createElement("style");
    node.id = "screen-style";
    document.head.append(node);
  }
  const next = sheets.join("\n");
  if (node.textContent !== next) node.textContent = next;
}

export function reducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}
