import { describe, expect, it, vi } from "vitest";
import { coalesced, pointerTrack } from "./drag";

function fakeNode() {
  const target = new EventTarget() as EventTarget & { style: { touchAction: string }; setPointerCapture: (id: number) => void };
  target.style = { touchAction: "" };
  target.setPointerCapture = vi.fn();
  return target;
}
const ev = (type: string, pointerId: number): PointerEvent => Object.assign(new Event(type, { cancelable: true }), { pointerId }) as unknown as PointerEvent;

describe("pointerTrack", () => {
  it("follows the finger that went down and ignores others", () => {
    const node = fakeNode();
    const move = vi.fn();
    const up = vi.fn();
    pointerTrack(node as unknown as HTMLElement, { down: () => undefined, move, up });
    expect(node.style.touchAction).toBe("none");
    node.dispatchEvent(ev("pointermove", 1));
    expect(move).not.toHaveBeenCalled();
    const d = ev("pointerdown", 1);
    node.dispatchEvent(d);
    expect(d.defaultPrevented).toBe(true);
    expect(node.setPointerCapture).toHaveBeenCalledWith(1);
    node.dispatchEvent(ev("pointermove", 2));
    node.dispatchEvent(ev("pointermove", 1));
    expect(move).toHaveBeenCalledOnce();
    node.dispatchEvent(ev("pointerup", 2));
    expect(up).not.toHaveBeenCalled();
    node.dispatchEvent(ev("pointercancel", 1));
    expect(up).toHaveBeenCalledOnce();
    node.dispatchEvent(ev("pointermove", 1));
    expect(move).toHaveBeenCalledOnce();
  });

  it("lets down() refuse a touch", () => {
    const node = fakeNode();
    const move = vi.fn();
    pointerTrack(node as unknown as HTMLElement, { down: () => false, move });
    const d = ev("pointerdown", 1);
    node.dispatchEvent(d);
    node.dispatchEvent(ev("pointermove", 1));
    expect(d.defaultPrevented).toBe(false);
    expect(move).not.toHaveBeenCalled();
  });

  it("stops listening", () => {
    const node = fakeNode();
    const down = vi.fn();
    const stop = pointerTrack(node as unknown as HTMLElement, { down, move: () => {} });
    stop();
    node.dispatchEvent(ev("pointerdown", 1));
    expect(down).not.toHaveBeenCalled();
  });
});

describe("coalesced", () => {
  it("falls back to the event itself", () => {
    const e = ev("pointermove", 1);
    expect(coalesced(e)).toEqual([e]);
    const withEmpty = Object.assign(e, { getCoalescedEvents: () => [] });
    expect(coalesced(withEmpty)).toEqual([withEmpty]);
  });
});
