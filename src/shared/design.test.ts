import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/** v13 design checks that are cheap to make without a browser. */
const base = readFileSync("src/shared/base.css", "utf8");
const overlays = readFileSync("src/shared/overlays.css", "utf8");

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

describe("assets", () => {
  it("no image is shipped twice (v13: three byte-identical copies of Ryzhik were one)", async () => {
    const { readdirSync, statSync } = await import("node:fs");
    const { join } = await import("node:path");
    const { createHash } = await import("node:crypto");
    const walk = (d: string): string[] =>
      readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : /\.(webp|png|jpe?g)$/i.test(f) ? [join(d, f)] : []));
    const seen = new Map<string, string>();
    const dup: string[] = [];
    for (const f of walk("src")) {
      const h = createHash("md5").update(readFileSync(f)).digest("hex");
      if (seen.has(h)) dup.push(`${seen.get(h)} = ${f}`);
      else seen.set(h, f);
    }
    expect(dup).toEqual([]);
  });
});

describe("touch target tokens", () => {
  const uncomment = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, "");

  function tokenValues(css: string, token: "--icon" | "--tap", inScope: (blocks: string[]) => boolean): number[] {
    const blocks: string[] = [];
    const values: number[] = [];
    for (const [, text, delimiter] of uncomment(css).matchAll(/([^{};]*)([{};])/g)) {
      if (delimiter === "{") {
        blocks.push(text.trim());
        continue;
      }
      if (inScope(blocks) && text.trimStart().startsWith(`${token}:`)) {
        const match = text.trim().match(/^--[\w-]+:\s*(\d+(?:\.\d+)?)px$/);
        expect(match, text.trim()).not.toBeNull();
        values.push(Number(match![1]));
      }
      if (delimiter === "}") blocks.pop();
    }
    return values;
  }

  const root = (blocks: string[]): boolean => blocks.length === 1 && blocks[0] === ":root";
  const media = (blocks: string[], ...conditions: RegExp[]): boolean =>
    blocks.some((block) => /^@media\b/i.test(block) && conditions.every((re) => re.test(block)));
  const atLeast = (values: number[], minimum: number): void => {
    expect(values.length).toBeGreaterThan(0);
    expect(Math.min(...values)).toBeGreaterThanOrEqual(minimum);
  };

  it("keeps --icon and --tap at the preschool minimum for each screen size", () => {
    atLeast(tokenValues(base, "--icon", root), 72);
    atLeast(tokenValues(base, "--tap", root), 72);
    for (const css of [base, overlays]) {
      atLeast(tokenValues(css, "--icon", (blocks) => media(blocks, /\(\s*max-width\s*:\s*380px\s*\)/i)), 64);
      expect(css).not.toMatch(/--icon\s*:\s*(?:48|52)px\b/i);
      expect(css).not.toMatch(/--tap\s*:\s*50px\b/i);
    }
    atLeast(
      tokenValues(base, "--tap", (blocks) =>
        media(blocks, /\(\s*orientation\s*:\s*landscape\s*\)/i, /\(\s*max-height\s*:\s*560px\s*\)/i),
      ),
      64,
    );
  });
});
