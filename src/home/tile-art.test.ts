import { describe, expect, it } from "vitest";
import { TILE_ART, TILE_VIEWBOX } from "./tile-art";

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
  it("use a 4:3 frame (like the tile) that holds the whole 200×200 scene", () => {
    const [x, y, w, h] = TILE_VIEWBOX.split(" ").map(Number) as [number, number, number, number];
    expect(w / h).toBeCloseTo(4 / 3, 2);
    expect(x).toBeLessThanOrEqual(0);
    expect(y).toBeLessThanOrEqual(0);
    expect(x + w).toBeGreaterThanOrEqual(200);
    expect(y + h).toBeGreaterThanOrEqual(200);
    for (const markup of Object.values(TILE_ART)) expect(markup).toContain(`viewBox="${TILE_VIEWBOX}"`);
  });
});
