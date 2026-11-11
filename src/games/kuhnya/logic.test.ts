import { describe, expect, it } from "vitest";
import { addToTool, allFinds, cook, dishName, GUESTS, INGREDIENT_IDS, mixColor, REACTIONS, SAY, taste, type Dish } from "./logic";

const raw = (id: Dish["parts"][number]): Dish => ({ parts: [id], ops: [] });

describe("kuhnya", () => {
  it("guests love their favourites", () => {
    expect(taste("mishka", { parts: ["berries", "honey"], ops: ["blend"] })).toBe("love");
    expect(taste("ezhik", { parts: ["mushroom"], ops: ["cut"] })).toBe("love");
    expect(taste("ryzhik", raw("apple"))).toBe("yum");
  });
  it("some things must be cooked", () => {
    expect(taste("mama", raw("potato"))).toBe("raw");
    expect(taste("mama", { parts: ["potato"], ops: ["boil"] })).toBe("love");
  });
  it("frying twice burns", () => {
    const once = cook([raw("egg")], "fry")!;
    const twice = cook([once], "fry")!;
    expect(taste("mishka", once)).not.toBe("burnt");
    expect(taste("mishka", twice)).toBe("burnt");
  });
  it("funny reactions: sour, spicy, fish smoothie", () => {
    expect(taste("ryzhik", raw("lemon"))).toBe("sour");
    expect(taste("ryzhik", { parts: ["lemon", "banana"], ops: ["blend"] })).not.toBe("sour");
    expect(taste("mama", raw("pepper"))).toBe("spicy");
    expect(taste("ryzhik", { parts: ["fish", "banana"], ops: ["boil", "blend"] })).toBe("yuck");
  });
  it("tools take a limited number of things", () => {
    expect(addToTool([raw("apple")], raw("pear"), "cut")).toBeNull();
    expect(addToTool([raw("apple")], raw("pear"), "blend")).toHaveLength(2);
    const soup = cook([raw("carrot"), raw("potato")], "boil")!;
    expect(dishName(soup)).toBe("Суп");
    expect(soup.parts).toEqual(["carrot", "potato"]);
  });
  it("mixes colours and has words for everything", () => {
    expect(mixColor(["apple"])).toBe("#f2c14e");
    expect(mixColor(["apple", "berries"])).toMatch(/^#[0-9a-f]{6}$/);
    for (const r of REACTIONS) expect(SAY[r].length).toBeGreaterThan(0);
    expect(allFinds()).toHaveLength(Object.keys(GUESTS).length * REACTIONS.length);
    expect(INGREDIENT_IDS).toHaveLength(14);
  });
  it("every guest can reach every reaction", () => {
    for (const g of Object.keys(GUESTS) as Array<keyof typeof GUESTS>) {
      const seen = new Set<string>();
      const ops: Dish["ops"][] = [[], ["cut"], ["boil"], ["fry"], ["fry", "fry"], ["blend"], ["boil", "blend"]];
      for (const a of INGREDIENT_IDS)
        for (const b of [null, ...INGREDIENT_IDS])
          for (const o of ops) seen.add(taste(g, { parts: b ? [a, b] : [a], ops: o }));
      expect([...seen].sort(), g).toEqual([...REACTIONS].sort());
    }
  });
});
