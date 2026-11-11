import { describe, expect, it } from "vitest";
import { CHARACTER_NAMES, characters, pictures } from "./assets";

describe("shared pictures", () => {
  it("has the 15 scene pictures", () => {
    expect(Object.keys(pictures).length).toBe(15);
  });
  it("has a cutout for every named character", () => {
    for (const id of Object.keys(CHARACTER_NAMES)) expect(characters[id], id).toBeTruthy();
  });
});
