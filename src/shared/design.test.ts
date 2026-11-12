import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/** v13 design checks that are cheap to make without a browser. */
const base = readFileSync("src/shared/base.css", "utf8");

const lum = (hex: string): number => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = c.map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a: string, b: string): number => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p) as [number, number];
  return (x + 0.05) / (y + 0.05);
};
const token = (name: string): string => {
  const m = base.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"));
  if (!m) throw new Error(`no --${name}`);
  return m[1]!;
};
const rule = (css: string, sel: string): string => {
  const at = css.indexOf(`\n${sel} {`);
  if (at < 0) throw new Error(`no ${sel}`);
  return css.slice(at, css.indexOf("}", at));
};
const hexes = (s: string): string[] =>
  [...s.replace(/var\(--([a-z-]+)\)/g, (_, n: string) => token(n)).matchAll(/#[0-9a-f]{6}/gi)].map((m) => m[0]);

describe("design tokens", () => {
  it("text on the orange play button is readable (≥ 4.5:1 on every stop of its gradient)", () => {
    for (const css of [base]) {
      const r = rule(css, ".btn--play");
      const ink = hexes(r.match(/\n\s*color:[^;]+/)![0])[0]!;
      const stops = hexes(r.match(/background:[^;]+/)![0]);
      expect(stops.length).toBeGreaterThan(0);
      for (const bg of stops) expect(contrast(ink, bg), `${ink} on ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
  });
  it("body inks are readable on the page and card colours", () => {
    for (const ink of ["ink", "ink-soft", "orange-deep"])
      for (const bg of ["bg", "surface"]) expect(contrast(token(ink), token(bg)), `${ink}/${bg}`).toBeGreaterThanOrEqual(4.5);
  });
});
