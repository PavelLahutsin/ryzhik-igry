import { describe, expect, it } from "vitest";
import { splitKey } from "./reset";
import { games } from "../games/registry";

describe("splitKey", () => {
  it("splits shell and game keys", () => {
    expect(splitKey("ryzhik-igry:mozaika:progress")).toEqual(["ryzhik-igry:", "mozaika:progress"]);
    expect(splitKey("ryzhik-kartinka:last-win")).toEqual(["ryzhik-kartinka:", "last-win"]);
  });
  it("rebuilds every reset key", () => {
    for (const g of games) for (const k of g.resetKeys ?? []) expect(splitKey(k).join("")).toBe(k);
  });
});
