import { describe, expect, it } from "vitest";
import { OBJECTS } from "../../shared/objects";
import { catTreeScene, clinicScene, forestFireScene, houseFireScene, kitchenScene, roomScene, TOOLS } from "./art";
import { levels, worlds, type SceneId } from "./data";
import {
  addToCart,
  cartComplete,
  coinsNeeded,
  countWord,
  dangersLeft,
  dropTool,
  remaining,
  rubProgress,
  rubTool,
  startGuided,
  startSafety,
  starsFor,
  tapThing,
  type Step,
  sceneFit,
  usedUp,
} from "./logic";

const steps: Step[] = [
  { tool: "thermo", zone: "mouth", kind: "use", say: "" },
  { tool: "cotton", zone: "paw", kind: "rub", say: "", amount: 100 },
];

describe("guided steps", () => {
  it("needs the right tool in the right place", () => {
    const g = startGuided();
    expect(dropTool(steps, g, "thermo", [])).toBe("none");
    expect(dropTool(steps, g, "cotton", ["mouth"])).toBe("wrong-tool");
    expect(g.misses).toBe(1);
    expect(dropTool(steps, g, "thermo", ["paw"])).toBe("wrong-place");
    expect(dropTool(steps, g, "thermo", ["body", "mouth"])).toBe("next");
    expect(g.step).toBe(1);
  });

  it("finishes a rub step after enough rubbing over the zone", () => {
    const g = startGuided();
    g.step = 1;
    expect(rubTool(steps, g, "cotton", ["mouth"], 80)).toBe("none");
    expect(rubTool(steps, g, "cotton", ["paw"], 60)).toBe("rubbing");
    expect(rubProgress(steps, g)).toBeCloseTo(0.6);
    expect(dropTool(steps, g, "cotton", ["paw"])).toBe("rubbing");
    expect(rubTool(steps, g, "cotton", ["paw"], 50)).toBe("finish");
    expect(rubTool(steps, g, "cotton", ["paw"], 50)).toBe("none");
  });

  it("gives stars for few slips and hints", () => {
    expect(starsFor(0, 0).stars).toBe(3);
    expect(starsFor(1, 0).stars).toBe(3);
    expect(starsFor(0, 1).stars).toBe(2);
    expect(starsFor(3, 2).stars).toBe(1);
  });
});

describe("shop", () => {
  const list = [
    { id: "apple", n: 2 },
    { id: "fish", n: 1 },
  ];
  it("takes only what the list wants", () => {
    const cart = {};
    expect(addToCart(list, cart, "pear")).toBe("not-on-list");
    expect(addToCart(list, cart, "apple")).toBe("ok");
    expect(remaining(list, cart, "apple")).toBe(1);
    expect(addToCart(list, cart, "apple")).toBe("line-done");
    expect(addToCart(list, cart, "apple")).toBe("enough");
    expect(cartComplete(list, cart)).toBe(false);
    expect(addToCart(list, cart, "fish")).toBe("line-done");
    expect(cartComplete(list, cart)).toBe(true);
    expect(coinsNeeded(list)).toBe(3);
    expect(countWord(3)).toBe("Три");
  });
});

describe("safety", () => {
  it("counts dangers once and safe taps apart", () => {
    const things = [
      { id: "a", danger: true, say: "" },
      { id: "b", danger: false, say: "" },
    ];
    const s = startSafety();
    expect(tapThing(things, s, "b")).toBe("safe");
    expect(tapThing(things, s, "b")).toBe("safe-again");
    expect(tapThing(things, s, "a")).toBe("found");
    expect(tapThing(things, s, "a")).toBe("again");
    expect(tapThing(things, s, "zzz")).toBeNull();
    expect(dangersLeft(things, s)).toEqual([]);
  });
});

const SCENE: Record<SceneId, string> = {
  zayka: clinicScene("zayka"),
  kotik: clinicScene("kotik"),
  mishka: clinicScene("mishka"),
  "house-fire": houseFireScene(),
  "cat-tree": catTreeScene(),
  "forest-fire": forestFireScene(),
};
/** Effects done with a class on the scene, not a [data-fx] node. */
const CLASS_FX = ["catdown", "cathappy", "sand"];

describe("professii levels", () => {
  it("have unique ids in known worlds", () => {
    expect(new Set(levels.map((l) => l.id)).size).toBe(levels.length);
    for (const l of levels) expect(worlds.some((w) => w.id === l.world)).toBe(true);
    for (const w of worlds) expect(levels.some((l) => l.world === w.id)).toBe(true);
  });

  it("guided levels only use tools, zones and effects that exist", () => {
    for (const l of levels) {
      if (l.kind !== "steps") continue;
      const scene = SCENE[l.scene];
      expect(l.steps.length).toBeGreaterThanOrEqual(3);
      for (const t of l.tools) expect(TOOLS[t], t).toBeTruthy();
      for (const s of l.steps) {
        expect(l.tools, `${l.id}: ${s.tool}`).toContain(s.tool);
        expect(scene, `${l.id}: zone ${s.zone}`).toContain(`data-zone="${s.zone}"`);
        for (const fx of [...(s.show ?? []), ...(s.hide ?? [])])
          expect(CLASS_FX.includes(fx) || scene.includes(`data-fx="${fx}"`), `${l.id}: fx ${fx}`).toBe(true);
      }
      // There is always at least one tool that is not needed, so it is a real choice.
      expect(l.tools.some((t) => !l.steps.some((s) => s.tool === t))).toBe(true);
    }
  });

  it("shop lists can be bought from the shelf", () => {
    for (const l of levels) {
      if (l.kind !== "shop") continue;
      for (const line of l.list) {
        expect(l.shelf).toContain(line.id);
        expect(OBJECTS[line.id as keyof typeof OBJECTS]).toBeTruthy();
      }
      for (const id of l.shelf) expect(OBJECTS[id as keyof typeof OBJECTS], id).toBeTruthy();
      expect(l.shelf.length).toBeGreaterThan(l.list.length);
    }
  });

  it("safety rooms draw every thing and have five dangers", () => {
    for (const l of levels) {
      if (l.kind !== "safety") continue;
      const scene = l.room === "kitchen" ? kitchenScene() : roomScene();
      expect(l.things.filter((t) => t.danger)).toHaveLength(5);
      for (const t of l.things) expect(scene, t.id).toContain(`data-thing="${t.id}"`);
    }
  });
});

describe("sceneFit", () => {
  it("keeps the 5:4 shape on a wide screen", () => {
    expect(sceneFit(1000, 500)).toEqual({ width: 625, height: 500, viewBox: "0 0 1000 800" });
  });
  it("fills a tall phone, showing more wall above than floor below", () => {
    const f = sceneFit(360, 576); // 1000 × 1600 in scene units
    expect(f).toMatchObject({ width: 360, height: 576 });
    expect(f.viewBox).toBe("0 -480.0 1000 1600.0");
  });
});

describe("tools get used up", () => {
  const steps: Step[] = [
    { tool: "thermo", zone: "mouth", kind: "use", say: "" },
    { tool: "water", zone: "a", kind: "use", say: "" },
    { tool: "water", zone: "b", kind: "use", say: "" },
  ];
  it("a tool leaves the tray after its last job, extra tools stay", () => {
    const g = startGuided();
    expect(usedUp(steps, g)).toEqual([]);
    g.step = 1;
    expect(usedUp(steps, g)).toEqual(["thermo"]);
    g.step = 2;
    expect(usedUp(steps, g)).toEqual(["thermo"]);
    g.step = 3;
    expect(usedUp(steps, g).sort()).toEqual(["thermo", "water"]);
  });
  it("in every scene all needed tools are used up at the end, the extra choices stay", () => {
    for (const l of levels) {
      if (l.kind !== "steps") continue;
      const g = startGuided();
      g.step = l.steps.length;
      const needed = new Set(l.steps.map((s) => s.tool));
      expect(new Set(usedUp(l.steps, g)), l.id).toEqual(needed);
      // There is always at least one extra tool to choose from, and the order makes sense:
      // every step's tool is in the tray.
      expect(l.tools.some((t) => !needed.has(t)), l.id).toBe(true);
      for (const t of needed) expect(l.tools, l.id).toContain(t);
    }
  });
});
