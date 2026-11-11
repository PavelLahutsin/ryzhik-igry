/**
 * What a screen or level started and must stop when it goes away: timers,
 * listeners on window/document, observers, drag handlers. One `dispose()`
 * stops everything, so a sound or a callback never fires after the child
 * left the level.
 */
export type Scope = {
  /** setTimeout that is cancelled on dispose (and ignored after it). */
  later: (fn: () => void, ms: number) => void;
  /** setInterval that is cancelled on dispose. */
  every: (fn: () => void, ms: number) => void;
  /** Add an event listener and remove it on dispose. */
  listen: <E extends Event = Event>(
    target: EventTarget,
    type: string,
    fn: (event: E) => void,
    options?: boolean | AddEventListenerOptions,
  ) => void;
  /** Run `fn` on dispose (after timers are cleared), in the order added. */
  add: (fn: () => void) => void;
  readonly disposed: boolean;
  dispose: () => void;
};

type Timer = ReturnType<typeof setTimeout>;

export function createScope(): Scope {
  const timeouts = new Set<Timer>();
  const intervals = new Set<Timer>();
  let cleanups: Array<() => void> = [];
  let disposed = false;
  return {
    later(fn, ms) {
      if (disposed) return;
      const t = setTimeout(() => {
        timeouts.delete(t);
        fn();
      }, ms);
      timeouts.add(t);
    },
    every(fn, ms) {
      if (disposed) return;
      intervals.add(setInterval(fn, ms));
    },
    listen(target, type, fn, options) {
      if (disposed) return;
      const listener = fn as EventListener;
      target.addEventListener(type, listener, options);
      cleanups.push(() => target.removeEventListener(type, listener, options));
    },
    add(fn) {
      if (disposed) fn();
      else cleanups.push(fn);
    },
    get disposed() {
      return disposed;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const t of timeouts) clearTimeout(t);
      for (const t of intervals) clearInterval(t);
      timeouts.clear();
      intervals.clear();
      const list = cleanups;
      cleanups = [];
      for (const fn of list) fn();
    },
  };
}
