import { describe, expect, it } from "vitest";
import { BREAK_EVERY, countWin } from "./toys";

describe("«Потрогай» break", () => {
  it("is offered after every few won levels, not after each", () => {
    const offers = Array.from({ length: BREAK_EVERY * 2 }, () => countWin());
    expect(offers.filter(Boolean)).toHaveLength(2);
    expect(offers[BREAK_EVERY - 1]).toBe(true);
    expect(offers[0]).toBe(false);
  });
});
