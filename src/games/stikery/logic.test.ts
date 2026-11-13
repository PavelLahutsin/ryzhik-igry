import { describe, expect, it } from "vitest";
import { MAX_ON_PICTURE, moveTo, normalizePicture, place, takeOff, toPercent } from "./logic";

describe("«Картинка из наклеек»", () => {
  it("reads any stored value safely", () => {
    expect(normalizePicture(null)).toEqual({ bg: "lug", items: [] });
    expect(normalizePicture({ bg: "zima", items: [{ id: "sun", x: 150, y: -3 }, { id: 3 }] })).toEqual({ bg: "zima", items: [{ id: "sun", x: 96, y: 4 }] });
    expect(normalizePicture({ bg: "space" }).bg).toBe("lug");
  });
  it("places, moves and takes off stickers, keeping them inside", () => {
    let items = place([], "sun", 50, 20);
    items = place(items, "fish", 120, 80);
    expect(items).toEqual([{ id: "sun", x: 50, y: 20 }, { id: "fish", x: 96, y: 80 }]);
    items = moveTo(items, 0, 10, 10);
    expect(items[0]).toEqual({ id: "sun", x: 10, y: 10 });
    expect(takeOff(items, 0)).toEqual([{ id: "fish", x: 96, y: 80 }]);
  });
  it("keeps at most a set number, the oldest goes first", () => {
    let items = place([], "first", 1, 1);
    for (let i = 0; i < MAX_ON_PICTURE; i++) items = place(items, `s${i}`, 50, 50);
    expect(items).toHaveLength(MAX_ON_PICTURE);
    expect(items.some((p) => p.id === "first")).toBe(false);
  });
  it("converts a finger point to percent of the picture", () => {
    const box = { left: 100, top: 50, width: 200, height: 100 };
    expect(toPercent({ x: 200, y: 100 }, box)).toEqual({ x: 50, y: 50 });
    expect(toPercent({ x: 99, y: 100 }, box)).toBeNull();
  });
});
