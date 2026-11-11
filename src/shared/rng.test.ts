import { describe, expect, it } from "vitest";
import { createRng, shuffle } from "./rng";

describe("rng", () => {
  it("repeats with the same seed", () => {
    const a = createRng(7);
    const b = createRng(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("shuffle keeps every item and leaves the input alone", () => {
    const list = [1, 2, 3, 4, 5, 6, 7, 8];
    const out = shuffle(list, createRng(3));
    expect([...out].sort((x, y) => x - y)).toEqual(list);
    expect(list).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(shuffle(list, createRng(3))).toEqual(out);
  });
});
