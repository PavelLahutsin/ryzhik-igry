/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./audio", () => ({
  audio: { play: vi.fn(), say: vi.fn() },
}));

import { resetSeen } from "./seen";
import { clearTips, tipOnce } from "./tips";

function box(el: HTMLElement, w = 72, h = 72): void {
  el.getBoundingClientRect = () =>
    ({ x: 10, y: 10, width: w, height: h, top: 10, left: 10, bottom: 10 + h, right: 10 + w, toJSON: () => ({}) }) as DOMRect;
}

describe("tipOnce", () => {
  beforeEach(async () => {
    document.body.replaceChildren();
    localStorage.clear();
    await resetSeen();
    vi.useFakeTimers();
  });

  afterEach(() => {
    clearTips();
    vi.useRealTimers();
    document.body.replaceChildren();
  });

  async function show(btn: HTMLElement, text = "Здесь музыка: включить или выключить. Звуки игр остаются"): Promise<void> {
    tipOnce("music-button", btn, text);
    // loadSeen() then queue + next()
    await Promise.resolve();
    await Promise.resolve();
  }

  it("a tap on the highlighted button closes the tip and does not press the button", async () => {
    const btn = document.createElement("button");
    const click = vi.fn();
    btn.addEventListener("click", click);
    box(btn);
    document.body.append(btn);

    await show(btn);
    expect(document.querySelector(".tip")).not.toBeNull();

    // The dismiss listener is armed after a short delay, so the tip can be read.
    vi.advanceTimersByTime(300);
    btn.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    expect(click).not.toHaveBeenCalled();
  });

  it("after the tip is gone, the same button still receives a click", async () => {
    const btn = document.createElement("button");
    const click = vi.fn();
    btn.addEventListener("click", click);
    box(btn);
    document.body.append(btn);

    await show(btn, "Здесь музыка");
    vi.advanceTimersByTime(300);
    btn.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));
    // Finish the fade and drop the one-shot click blocker.
    await vi.advanceTimersByTimeAsync(400);

    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    expect(click).toHaveBeenCalledTimes(1);
  });
});
