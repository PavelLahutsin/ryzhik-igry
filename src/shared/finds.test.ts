import { describe, expect, it } from "vitest";
import { addFind, normalizeFinds } from "./finds";

describe("finds", () => {
  it("keeps unique strings only", () => {
    expect(normalizeFinds(["a", 1, "a", null, "b"])).toEqual(["a", "b"]);
    expect(normalizeFinds("x")).toEqual([]);
  });
  it("adds once", () => {
    expect(addFind(["a"], "b")).toEqual({ list: ["a", "b"], isNew: true });
    expect(addFind(["a"], "a")).toEqual({ list: ["a"], isNew: false });
  });
});
