import { describe, expect, it } from "vitest";
import { createRng } from "../shared/rng";
import { gateTask, gateWords } from "./gate";

describe("parent gate", () => {
  it("asks for three different digits as words", () => {
    const rand = createRng(9);
    for (let i = 0; i < 50; i++) {
      const task = gateTask(rand);
      expect(task).toHaveLength(3);
      expect(new Set(task).size).toBe(3);
      for (const n of task) expect(n).toBeGreaterThanOrEqual(1);
      expect(gateWords(task).every((w) => w.length > 0)).toBe(true);
    }
  });
});
