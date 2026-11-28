import { readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ART, artImg, hasArt } from "./art";
import { OBJECTS } from "./objects";
import { SHAPES } from "../games/teni/shapes";
import { EXTRA, SCENES, TOYS } from "../games/tapni/scenes";
import { STICKERS } from "./stickers";
import { GROW_FLOWER, GROW_TOWER } from "./growth";

describe("v29 painted pictures", () => {
  const dir = resolve(__dirname, "assets/art");
  it("every file is a webp of at most 40 KB", () => {
    const files = readdirSync(dir);
    expect(files.length).toBeGreaterThan(150);
    for (const f of files) {
      expect(f, f).toMatch(/^[A-Za-z0-9-]+\.webp$/);
      expect(statSync(resolve(dir, f)).size, f).toBeLessThanOrEqual(40 * 1024);
    }
    expect(Object.keys(ART).length).toBe(files.length);
  });
  it("every shape, object and local picture has one", () => {
    for (const id of Object.keys(SHAPES)) expect(hasArt(id), `SHAPES.${id}`).toBe(true);
    for (const id of Object.keys(OBJECTS)) expect(hasArt(id), `OBJECTS.${id}`).toBe(true);
    for (const id of Object.keys(EXTRA)) expect(hasArt(id), `EXTRA.${id}`).toBe(true);
  });
  it("«Нажми и послушай»: tabs and things show pictures", () => {
    for (const s of SCENES) {
      expect(s.icon, s.id).toContain("<img");
      for (const p of s.spots) expect(p.svg, `${s.id}:${p.id}`).toContain("<img");
    }
    for (const t of TOYS) expect(t.svg, t.id).toContain("<img");
  });
  it("stickers and the growing reward use pictures", () => {
    expect(STICKERS.length).toBeGreaterThan(20);
    expect(GROW_FLOWER).toHaveLength(6);
    expect(GROW_TOWER).toHaveLength(6);
    for (const f of [...GROW_FLOWER, ...GROW_TOWER, artImg("giftbox"), artImg("starbadge")]) expect(f).toMatch(/^<img /);
  });
  it("never reaches for the network", () => {
    for (const url of Object.values(ART)) expect(url).not.toMatch(/^https?:/);
  });
});
