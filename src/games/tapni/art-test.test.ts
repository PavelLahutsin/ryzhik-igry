import { describe, expect, it } from "vitest";
import { SOUND_KINDS } from "../../shared/sounds";
import { artVariant, pictureUrl, TEST_ANIMALS } from "./art-test";

describe("«Нажми и послушай» — test pictures (?art=)", () => {
  it("is off without the parameter and for anything but a / b", () => {
    expect(artVariant("")).toBeNull();
    expect(artVariant("?art=c")).toBeNull();
    expect(artVariant("?art=a")).toBe("a");
    expect(artVariant("?x=1&art=b")).toBe("b");
  });
  it("has 8 animals with a picture in both variants", () => {
    expect(TEST_ANIMALS).toHaveLength(8);
    for (const a of TEST_ANIMALS) {
      expect(SOUND_KINDS, a.id).toContain(a.sound);
      expect(pictureUrl("a", a.id)).toBeTruthy();
      expect(pictureUrl("b", a.id)).toBeTruthy();
    }
  });
});
