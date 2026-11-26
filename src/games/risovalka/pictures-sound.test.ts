import { expect, it } from "vitest";
import { SOUND_KINDS } from "../../shared/sounds";
import { pictures, SOUND_AFTER_MAGIC_MS } from "./pictures";

it("uses only existing sound recipes and gives at least 20 pictures a sound", () => {
  expect(SOUND_AFTER_MAGIC_MS).toBe(280);
  expect(
    pictures.every((p) => p.sound === undefined || SOUND_KINDS.includes(p.sound)),
  ).toBe(true);
  expect(pictures.filter((p) => p.sound).length).toBeGreaterThanOrEqual(20);
});

it("does not assign a picture sound to a digit or letter level", () => {
  for (const p of pictures) {
    if (p.sound) {
      expect(p.count, p.id).toBeUndefined();
      expect((p as { letter?: string }).letter, p.id).toBeUndefined();
      expect((p as { word?: string }).word, p.id).toBeUndefined();
    }
  }
});
