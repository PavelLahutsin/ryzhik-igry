import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { HOWTO } from "../../shared/howto-data";

describe("big mode name", () => {
  it("is «Удвоялка», 2048 is only the goal number", () => {
    const src = readFileSync(new URL("./big.ts", import.meta.url), "utf8");
    expect(src).toContain('"Удвоялка"');
    expect(src).not.toMatch(/Большая игра 2048/);
    expect(HOWTO.sliyanie!.rules).toContain("«Удвоялка»");
    expect(HOWTO.sliyanie!.rules).not.toMatch(/игра 2048/);
  });
});
