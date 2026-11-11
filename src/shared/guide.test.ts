import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("whenIdle", () => {
  const listeners: Record<string, EventListener[]> = {};
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("window", {
      addEventListener: (t: string, f: EventListener) => (listeners[t] ??= []).push(f),
      removeEventListener: (t: string, f: EventListener) => (listeners[t] = (listeners[t] ?? []).filter((x) => x !== f)),
      setInterval: (f: () => void, ms: number) => setInterval(f, ms),
    });
    vi.stubGlobal("document", { hidden: false });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("calls for help after a pause and waits again after a touch", async () => {
    const { whenIdle } = await import("./guide");
    const onIdle = vi.fn();
    const stop = whenIdle(onIdle, 1000);
    vi.advanceTimersByTime(900);
    expect(onIdle).not.toHaveBeenCalled();
    vi.advanceTimersByTime(600);
    expect(onIdle).toHaveBeenCalledTimes(1);
    listeners.pointerdown![0]!(new Event("pointerdown"));
    vi.advanceTimersByTime(800);
    expect(onIdle).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(500);
    expect(onIdle).toHaveBeenCalledTimes(2);
    stop();
    vi.advanceTimersByTime(5000);
    expect(onIdle).toHaveBeenCalledTimes(2);
    expect(listeners.pointerdown).toHaveLength(0);
  });
});
