import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createScope } from "./lifecycle";

describe("createScope", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("runs timers until disposed, then never", () => {
    const s = createScope();
    const a = vi.fn();
    const b = vi.fn();
    s.later(a, 100);
    s.later(b, 300);
    vi.advanceTimersByTime(150);
    expect(a).toHaveBeenCalledOnce();
    s.dispose();
    vi.advanceTimersByTime(1000);
    expect(b).not.toHaveBeenCalled();
  });

  it("ignores timers scheduled after dispose", () => {
    const s = createScope();
    s.dispose();
    const a = vi.fn();
    s.later(a, 10);
    s.every(a, 10);
    vi.advanceTimersByTime(100);
    expect(a).not.toHaveBeenCalled();
  });

  it("stops intervals", () => {
    const s = createScope();
    const tick = vi.fn();
    s.every(tick, 100);
    vi.advanceTimersByTime(350);
    expect(tick).toHaveBeenCalledTimes(3);
    s.dispose();
    vi.advanceTimersByTime(500);
    expect(tick).toHaveBeenCalledTimes(3);
  });

  it("removes listeners and runs cleanups once, in order", () => {
    const s = createScope();
    const target = new EventTarget();
    const heard = vi.fn();
    const order: string[] = [];
    s.listen(target, "ping", heard);
    s.add(() => order.push("a"));
    s.add(() => order.push("b"));
    target.dispatchEvent(new Event("ping"));
    s.dispose();
    s.dispose();
    target.dispatchEvent(new Event("ping"));
    expect(heard).toHaveBeenCalledOnce();
    expect(order).toEqual(["a", "b"]);
    expect(s.disposed).toBe(true);
  });

  it("runs a cleanup added after dispose right away", () => {
    const s = createScope();
    s.dispose();
    const late = vi.fn();
    s.add(late);
    expect(late).toHaveBeenCalledOnce();
  });
});
