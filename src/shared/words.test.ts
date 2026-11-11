import { describe, expect, it } from "vitest";
import { plural } from "./words";

describe("plural", () => {
  it("picks the Russian form", () => {
    const f = ["картинка", "картинки", "картинок"] as const;
    expect([1, 2, 5, 11, 12, 21, 24].map((n) => plural(n, f))).toEqual([
      "1 картинка",
      "2 картинки",
      "5 картинок",
      "11 картинок",
      "12 картинок",
      "21 картинка",
      "24 картинки",
    ]);
  });
});
