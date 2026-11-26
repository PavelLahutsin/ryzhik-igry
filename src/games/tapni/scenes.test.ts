import { describe, expect, it } from "vitest";
import { SOUND_KINDS } from "../../shared/sounds";
import { allFinds, SCENES, TOYS } from "./scenes";

describe("«Нажми и послушай»", () => {
  it("has one theme per tab (animals, vehicles, kitchen, nature, sea, party), 8 things each, all drawn and with a sound", () => {
    expect(SCENES.map((s) => s.title)).toEqual(["Животные", "Транспорт", "Кухня", "Природа", "Море", "Праздник", "Лес", "Ферма", "Зима", "Цирк", "Забавы"]);
    expect(new Set(SCENES.map((s) => s.title)).size).toBe(SCENES.length);
    expect(SCENES.map((s) => s.title), "the toys tab is «Игрушки»").not.toContain("Игрушки");
    for (const s of SCENES) {
      expect(s.spots).toHaveLength(8);
      expect(new Set(s.spots.map((p) => p.id)).size).toBe(8);
    }
    for (const p of [...SCENES.flatMap((s) => s.spots), ...TOYS]) {
      expect(p.svg, p.id).toContain("<svg");
      expect(SOUND_KINDS, p.id).toContain(p.sound);
      expect(p.word.length, p.id).toBeLessThan(16);
      expect(p.name.length, p.id).toBeGreaterThan(2);
    }
  });
  it("spots do not overlap and stay inside the scene", () => {
    for (const s of SCENES) {
      for (const p of s.spots) {
        expect(p.x).toBeGreaterThanOrEqual(15);
        expect(p.x).toBeLessThanOrEqual(85);
        expect(p.y).toBeGreaterThanOrEqual(15);
        expect(p.y).toBeLessThanOrEqual(85);
      }
      for (const a of s.spots) for (const b of s.spots) if (a !== b) expect(Math.hypot(a.x - b.x, a.y - b.y), `${s.id} ${a.id}/${b.id}`).toBeGreaterThan(20);
    }
  });
  it("keeps each theme to its kind: every animal in «Животные», every vehicle in «Транспорт»", () => {
    const byId = Object.fromEntries(SCENES.map((s) => [s.id, s.spots.map((p) => p.id)]));
    for (const animal of ["cat", "dog", "bird", "owl", "frog", "rabbit"]) expect(byId.zhivotnye, animal).toContain(animal);
    for (const vehicle of ["car", "bus", "train", "tractor", "bicycle", "plane", "boat"]) expect(byId.transport, vehicle).toContain(vehicle);
    const animalSounds = ["meow", "woof", "owl", "frog"];
    for (const s of SCENES) if (s.id !== "zhivotnye") for (const p of s.spots) expect(animalSounds, `${s.id}:${p.id}`).not.toContain(p.sound);
    // v23: forest and winter birds sing in «Лес» and «Зима»; the pets stay in «Животные».
    for (const s of SCENES) if (!["zhivotnye", "les", "zima"].includes(s.id)) for (const p of s.spots) expect(p.sound, `${s.id}:${p.id}`).not.toBe("tweet");
    const pets = new Set(byId.zhivotnye);
    for (const s of SCENES) if (s.id !== "zhivotnye") for (const p of s.spots) expect(pets.has(p.id), `${s.id}:${p.id}`).toBe(false);
  });
  it("counts every thing once for the home tile", () => {
    const all = allFinds();
    expect(new Set(all).size).toBe(all.length);
    expect(all.length).toBe(SCENES.length * 8 + TOYS.length);
  });
});
