// Hint lamp check: in every level game, level 1 (guided start already seen), the lamp centre must hit the lamp itself.
//   node scripts/qa-lamp.mjs [base] [games,comma] [viewports]   — prints one line per game; "ok":false is a bug.
// During the very first guided start of level 1 the lamp is hidden on purpose (visibility) until two moves.
import { chromium } from "playwright";
const base = process.argv[2] || "http://127.0.0.1:5173/";
const games = (process.argv[3] || "risovalka,bukvy,tochki,professii,stroyka,formy,mozaika,najdi-paru,teni,odezhda,sortirovka,labirint").split(",");
const vps = (process.argv[4] || "390x844").split(",");
const b = await chromium.launch();
for (const vp of vps) for (const g of games) {
  const [w, h] = vp.split("x").map(Number);
  const c = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: w < 500 });
  await c.addInitScript((g) => localStorage.setItem("ryzhik-igry:seen", JSON.stringify({ howto: [g], tips: ["tutorial:" + g, "hint-lamp", "sound-button"] })), g);
  const p = await c.newPage();
  await p.goto(`${base}#/${g}/play/1`, { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
  const r = await p.evaluate(() => {
    const btn = [...document.querySelectorAll("button.btn--hint")].find((x) => !x.hidden);
    if (!btn) return { none: true };
    const b = btn.getBoundingClientRect();
    const hit = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2);
    return { box: [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)], ok: !!hit && btn.contains(hit), hit: hit ? hit.tagName + "." + hit.className : null, vw: innerWidth };
  });
  console.log(vp, g, JSON.stringify(r));
  await c.close();
}
await b.close();
