import { describe, expect, it } from "vitest";
import { games } from "./registry";

describe("registry storage keys", () => {
  // Saved progress lives under these keys; renaming one would lose a child's stars.
  it("keeps every reset key unchanged", () => {
    const keys = Object.fromEntries(games.map((g) => [g.id, g.resetKeys ?? []]));
    expect(keys).toEqual({
      domik: ["ryzhik-igry:domik:found"],
      kuhnya: ["ryzhik-igry:kuhnya:found"],
      risovalka: ["ryzhik-igry:risovalka:progress"],
      tochki: ["ryzhik-igry:tochki:progress"],
      professii: ["ryzhik-igry:professii:progress"],
      stroyka: ["ryzhik-igry:stroyka:progress"],
      formy: ["ryzhik-igry:formy:progress"],
      "tajnaya-kartinka": ["ryzhik-kartinka:progress", "ryzhik-kartinka:last-win"],
      mozaika: ["ryzhik-igry:mozaika:progress"],
      sliyanie: ["ryzhik-igry:sliyanie:progress"],
      "najdi-paru": ["ryzhik-igry:najdi-paru:progress"],
      teni: ["ryzhik-igry:teni:progress"],
      odezhda: ["ryzhik-igry:odezhda:progress"],
      sortirovka: ["ryzhik-igry:sortirovka:progress"],
      labirint: ["ryzhik-igry:labirint:progress"],
      raskraska: [],
    });
  });

  it("has 16 games with unique ids", () => {
    expect(new Set(games.map((g) => g.id)).size).toBe(16);
  });
});
