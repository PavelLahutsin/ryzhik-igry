/**
 * Headless check of every screen at phone size, with screenshots.
 * Not part of the build.
 *
 *   npm run build && npx vite preview &
 *   npm i -D --no-save playwright && npx playwright install chromium
 *   SHOTS_DIR=shots node scripts/shots.mjs
 *
 * Fails (exit 1) on any console error or page error.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.env.SHOTS_BASE ?? "http://127.0.0.1:4173/ryzhik-igry/";
const OUT = process.env.SHOTS_DIR ?? "shots";
const ONLY = process.env.SHOTS_ONLY ?? "";

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const errors = [];

async function page(name, hash, steps) {
  if (ONLY && !name.includes(ONLY)) return;
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
  });
  const p = await context.newPage();
  p.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`${name}: ${msg.text()}`);
  });
  p.on("pageerror", (err) => errors.push(`${name}: ${err.message}`));
  await p.goto(`${BASE}${hash}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  if (steps) await steps(p);
  await p.screenshot({ path: `${OUT}/${name}.png` });
  console.log("shot", name);
  await context.close();
}

/** Drag from one element's centre to a point. */
async function drag(p, from, to) {
  const box = await from.boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await p.mouse.move(x, y);
  await p.mouse.down();
  await p.mouse.move((x + to.x) / 2, (y + to.y) / 2, { steps: 4 });
  await p.mouse.move(to.x, to.y, { steps: 4 });
  await p.mouse.up();
  await p.waitForTimeout(120);
}

async function centre(locator) {
  const b = await locator.boundingBox();
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}

await page("01-home", "#/");
await page("02-tajnaya-kartinka-start", "#/tajnaya-kartinka/");
await page("03-tajnaya-kartinka-levels", "#/tajnaya-kartinka/levels");
await page("04-tajnaya-kartinka-game", "#/tajnaya-kartinka/game/ryzhik-mashet", async (p) => {
  await p.waitForTimeout(1200);
});
await page("05-raskraska-menu", "#/raskraska/");
await page("06-raskraska-albums", "#/raskraska/albums");
await page("07-raskraska-picture", "#/raskraska/picture/ryzhik_sharik", async (p) => {
  await p.waitForTimeout(1500);
  const canvas = p.locator("canvas").first();
  const b = await canvas.boundingBox();
  if (b) await p.mouse.click(b.x + b.width * 0.5, b.y + b.height * 0.5);
  await p.waitForTimeout(400);
});

await page("08-mozaika-levels", "#/mozaika/");
await page("09-mozaika-play", "#/mozaika/play/1", async (p) => {
  await p.waitForTimeout(400);
});
await page("10-mozaika-win", "#/mozaika/play/1", async (p) => {
  const pieces = p.locator(".mz-piece");
  const n = await pieces.count();
  for (let i = 0; i < n; i++) {
    const piece = p.locator(`.mz-piece[data-index="${i}"]`);
    const slot = p.locator(`.mz-slot[data-index="${i}"]`);
    await drag(p, piece, await centre(slot));
  }
  await p.waitForTimeout(1500);
});

await page("11-sliyanie-levels", "#/sliyanie/");
await page("12-sliyanie-play", "#/sliyanie/play/1", async (p) => {
  for (const key of ["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "ArrowDown"]) {
    await p.keyboard.press(key);
    await p.waitForTimeout(160);
  }
});

await page("13-najdi-paru-levels", "#/najdi-paru/");
await page("14-najdi-paru-play", "#/najdi-paru/play/3", async (p) => {
  const cards = p.locator(".np-card");
  await cards.nth(0).click();
  await cards.nth(1).click();
  await p.waitForTimeout(300);
});
await page("15-najdi-paru-win", "#/najdi-paru/play/1", async (p) => {
  const ids = await p.locator(".np-card").evaluateAll((nodes) => nodes.map((n) => n.dataset.face));
  const done = new Set();
  for (let i = 0; i < ids.length; i++) {
    if (done.has(i)) continue;
    const j = ids.findIndex((id, k) => k > i && id === ids[i]);
    await p.locator(".np-card").nth(i).click();
    await p.locator(".np-card").nth(j).click();
    done.add(i);
    done.add(j);
    await p.waitForTimeout(700);
  }
  await p.waitForTimeout(1500);
});

await page("16-teni-levels", "#/teni/");
await page("17-teni-play", "#/teni/play/4", async (p) => {
  const item = p.locator(".tn-item").first();
  const id = await item.getAttribute("data-id");
  await drag(p, item, await centre(p.locator(`.tn-shadow[data-id="${id}"]`)));
  await p.waitForTimeout(300);
});

await page("18-odezhda-levels", "#/odezhda/");
await page("19-odezhda-play", "#/odezhda/play/3", async (p) => {
  const good = p.locator('.od-item[data-good="1"]').first();
  const slot = await good.getAttribute("data-slot");
  await drag(p, good, await centre(p.locator(`.od-anchor[data-slot="${slot}"]`)));
  const bad = p.locator('.od-item[data-good="0"]').first();
  await drag(p, bad, await centre(p.locator(".od-figure")));
  await p.waitForTimeout(300);
});
await page("20-odezhda-win", "#/odezhda/play/1", async (p) => {
  for (;;) {
    const good = p.locator('.od-item[data-good="1"]:not(.is-placed)').first();
    if ((await good.count()) === 0) break;
    const slot = await good.getAttribute("data-slot");
    await drag(p, good, await centre(p.locator(`.od-anchor[data-slot="${slot}"]`)));
    await p.waitForTimeout(250);
  }
  await p.waitForTimeout(1500);
});

await browser.close();
if (errors.length) {
  console.error("Console errors:\n" + errors.join("\n"));
  process.exit(1);
}
console.log("No console errors.");
