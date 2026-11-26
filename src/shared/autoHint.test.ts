import { describe, expect, it } from "vitest";
import { createAutoHint, shouldAutoHint } from "./autoHint";

describe("shouldAutoHint", () => {
  it("is false after 0 or 1 miss and true from the second", () => {
    expect([0, 1, 2, 3].map(shouldAutoHint)).toEqual([false, false, true, true]);
  });
});

describe("createAutoHint", () => {
  it("needs two fresh misses after a correct move", () => {
    const state = createAutoHint();
    expect(state.recordMiss()).toBe(false);
    state.reset();
    expect(state.recordMiss()).toBe(false);
    expect(state.recordMiss()).toBe(true);
  });

  it("a lamp hint after the first miss resets the streak", () => {
    const state = createAutoHint();
    expect(state.recordMiss()).toBe(false);
    expect(state.recordShown("pair-a")).toBe(true);
    expect(state.recordMiss()).toBe(false);
    expect(state.recordMiss()).toBe(true);
  });

  it("a lamp tap right after an auto-hint does not count the same target twice", () => {
    const state = createAutoHint();
    expect(state.recordMiss()).toBe(false);
    expect(state.recordMiss()).toBe(true);
    expect(state.recordShown("pair-a")).toBe(true);
    expect(state.recordShown("pair-a")).toBe(false);
    expect(state.recordMiss()).toBe(false);
    expect(state.recordMiss()).toBe(true);
    expect(state.recordShown("pair-a")).toBe(true);
  });

  it("the next question counts the same target again after reset", () => {
    const state = createAutoHint();
    expect(state.recordShown("answer")).toBe(true);
    state.reset();
    expect(state.recordShown("answer")).toBe(true);
  });
});
