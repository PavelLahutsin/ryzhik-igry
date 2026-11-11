import { describe, expect, it } from "vitest";
import { replayClass } from "./dom";

describe("replayClass", () => {
  it("removes, reflows, then adds the class", () => {
    const calls: string[] = [];
    const node = {
      classList: { remove: (c: string) => calls.push(`-${c}`), add: (c: string) => calls.push(`+${c}`) },
      getBoundingClientRect: () => calls.push("reflow"),
    } as unknown as Element;
    replayClass(node, "is-bump");
    expect(calls).toEqual(["-is-bump", "reflow", "+is-bump"]);
  });
});
