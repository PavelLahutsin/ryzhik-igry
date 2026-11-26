/** After this many misses since the last success or hint, show the lamp hint. */
export const AUTO_HINT_AFTER = 2;

export function shouldAutoHint(missesSince: number): boolean {
  return missesSince >= AUTO_HINT_AFTER;
}

/**
 * Per-round miss streak for auto-hints. `hints++` only when recordShown()
 * returns true, so a lamp tap right after an auto-hint does not count twice
 * for the same target.
 */
export function createAutoHint(): {
  reset: () => void;
  recordMiss: () => boolean;
  recordShown: (target: string | Element) => boolean;
} {
  let missesSince = 0;
  let lastTarget: string | Element | undefined;

  function reset(): void {
    missesSince = 0;
    lastTarget = undefined;
  }

  function recordMiss(): boolean {
    lastTarget = undefined;
    return shouldAutoHint(++missesSince);
  }

  function recordShown(target: string | Element): boolean {
    const shouldCount = target !== lastTarget;
    lastTarget = target;
    missesSince = 0;
    return shouldCount;
  }

  return { reset, recordMiss, recordShown };
}
