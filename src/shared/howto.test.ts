import { describe, expect, it } from "vitest";
import { putInCorner } from "./howto";

const fakeBtn = () => {
  const classes = new Set<string>();
  return { classes, classList: { add: (c: string) => classes.add(c) } } as unknown as Element & { classes: Set<string> };
};

describe("putInCorner", () => {
  it("puts «?» next to the corner back button (Тайная картинка start)", () => {
    const placed: Element[] = [];
    const back = { after: (n: Element) => placed.push(n) };
    const root = { querySelector: (s: string) => (s === ".home-back" ? back : null) } as unknown as ParentNode;
    const btn = fakeBtn();
    expect(putInCorner(root, btn)).toBe(true);
    expect(placed).toEqual([btn]);
    expect(btn.classes.has("howto-corner")).toBe(true);
  });

  it("does nothing on a screen without a corner back", () => {
    const root = { querySelector: () => null } as unknown as ParentNode;
    expect(putInCorner(root, fakeBtn())).toBe(false);
  });
});
