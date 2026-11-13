// v14 QA: level numbers on every level list are 1, 2, 3… with no gap, and a
// winter level won early does not open the level after it (12 → 14 → 15 skipped 13).
// Usage: node scripts/qa-order.mjs [base]
import { chromium } from "playwright";
const base = process.argv[2] || "http://127.0.0.1:5173/";
const dev = process.env.QA_DEV || "http://127.0.0.1:5173/"; // level data is read from the dev server
const OPEN_WORLDS = ["formy", "bukvy"];
const games = ["mozaika", "najdi-paru", "teni", "odezhda", "sortirovka", "labirint", "risovalka", "tochki", "professii", "stroyka", "formy", "bukvy"];
const WINTER = { odezhda: ["o3", "o9"], sortirovka: ["p3"], tochki: ["t10", "d3"], risovalka: ["r14"], mozaika: ["m20"], formy: ["m6"] };
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
const src = await b.newPage();
await src.goto(dev);
await p.goto(base);
let bad = 0;
const cards = () => p.evaluate(() => [...document.querySelectorAll(".level-card")].map((c) => ({ n: Number(c.querySelector(".level-card__num")?.textContent), open: !c.classList.contains("is-locked"), id: c.dataset.id })));
for (const g of games) {
  await p.evaluate((g) => { localStorage.removeItem(`ryzhik-igry:${g}:progress`); localStorage.setItem("ryzhik-igry:seen", JSON.stringify({ howto: [g], tips: [`tutorial:${g}`] })); }, g);
  await p.goto(`${base}#/${g}/`); await p.reload(); await p.waitForTimeout(700);
  const list = await cards();
  const gap = list.findIndex((c, i) => c.n !== i + 1);
  if (gap >= 0) { bad++; console.log(`${g}: number ${list[gap].n} at place ${gap + 1}`); }
  const all = await src.evaluate(async (g) => { const m = await import(`/src/games/${g === "risovalka" ? "risovalka/pictures" : g === "bukvy" ? "bukvy/letters" : `${g}/levels`}.ts`); return m.levels.map((l) => ({ id: l.id, world: l.world })); }, g).catch(() => []);
  const ids = all.map((l) => l.id);
  for (const w of WINTER[g] ?? []) {
    const k = ids.indexOf(w);
    const own = OPEN_WORLDS.includes(g) ? all.filter((l) => l.world === all[k].world).map((l) => l.id) : ids;
    const j = own.indexOf(w);
    if (j < 2 || j + 1 >= own.length) continue;
    // Everything before the winter level's previous one is won (worlds before too), and the winter level.
    const done = [...ids.slice(0, ids.indexOf(own[j - 1])), w];
    if (ids.indexOf(own[j + 1]) !== k + 1) continue;
    await p.evaluate(({ g, done }) => localStorage.setItem(`ryzhik-igry:${g}:progress`, JSON.stringify({ completed: done, stars: {} })), { g, done });
    await p.reload(); await p.waitForTimeout(700);
    const after = (await cards())[k + 1];
    const winterNext = (WINTER[g] ?? []).includes(ids[k + 1]);
    if (after?.open && !winterNext) { bad++; console.log(`${g}: ${w} (${k + 1}) won before ${ids[k - 1]} (${k}) opens ${k + 2}`); }
  }
  console.log(g, list.length, "ok");
}
await b.close();
console.log(bad ? `FAIL ${bad}` : "qa-order: all sequential");
process.exit(bad ? 1 : 0);
