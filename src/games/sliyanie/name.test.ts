import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { HOWTO } from "../../shared/howto-data";

const read = (f: string): string => readFileSync(new URL(f, import.meta.url), "utf8");

describe("«Вырасти сад» is one game", () => {
  it("has no second name; 2048 is only the goal number", () => {
    for (const f of ["./big.ts", "./index.ts", "./skins.ts", "./logic.ts", "../../shared/howto-data.ts", "../../shared/tips-data.ts", "../registry.ts"]) {
      expect(read(f), f).not.toMatch(/Удвоялк|Большая игра 2048/);
    }
    expect(HOWTO.sliyanie!.title).toBe("Вырасти сад");
    expect(HOWTO.sliyanie!.rules).not.toMatch(/игра 2048/);
  });
  it("opens on the 2048 picker; the short levels are «Тренировка для малышей»", () => {
    const index = read("./index.ts");
    expect(index).toContain("home: (root) => bigHome(root, trainingCard)");
    expect(index).toContain('"Тренировка для малышей"');
    expect(index).not.toContain("listTop");
    expect(HOWTO.sliyanie!.rules).toContain("«Тренировка для малышей»");
    expect(read("./big.ts")).toContain('toolbar("Вырасти сад"');
  });
});
