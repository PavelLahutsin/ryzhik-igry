import { describe, expect, it } from "vitest";
import { TILE_ART } from "./tile-art";

describe("home tile pictures", () => {
  it("are well-formed SVG (no repeated attribute in a tag, no NaN)", () => {
    for (const [id, markup] of Object.entries(TILE_ART)) {
      expect(markup.startsWith("<svg"), id).toBe(true);
      expect(markup).not.toContain("NaN");
      for (const tag of markup.match(/<[a-z][^>]*>/g) ?? []) {
        const names = [...tag.matchAll(/\s([a-z-]+)="/g)].map((m) => m[1]);
        expect(new Set(names).size, `${id}: ${tag}`).toBe(names.length);
      }
    }
  });
});
