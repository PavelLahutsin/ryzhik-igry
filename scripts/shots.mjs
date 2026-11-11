/**
 * Headless check of every screen, with screenshots. Not part of the build.
 *
 *   npm run build && npx vite preview &
 *   npm i -D --no-save playwright && npx playwright install chromium
 *   SHOTS_DIR=shots node scripts/shots.mjs
 *
 * SHOTS_VIEWPORTS picks sizes (default phone portrait only), e.g.
 * SHOTS_VIEWPORTS=390x844,844x390,1280x800,768x1024. Widths under 900 run
 * as a touch phone or tablet. Fails (exit 1) on any console or page error.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.env.SHOTS_BASE ?? "http://127.0.0.1:4173/ryzhik-igry/";
const OUT = process.env.SHOTS_DIR ?? "shots";
const ONLY = process.env.SHOTS_ONLY ?? "";
const VIEWPORTS = (process.env.SHOTS_VIEWPORTS ?? "390x844").split(",").map((v) => {
  const [width, height] = v.split("x").map(Number);
  return { width, height, tag: v };
});
const MULTI = VIEWPORTS.length > 1;

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const errors = [];

/** `unlock`: [gameId, [level ids already won]] so a later level can open. */
async function page(name, hash, steps, unlock) {
  if (ONLY && !name.includes(ONLY)) return;
  for (const vp of VIEWPORTS) await pageAt(vp, MULTI ? `${name}--${vp.tag}` : name, hash, steps, unlock);
}

async function pageAt(vp, name, hash, steps, unlock) {
  const touch = vp.width < 900;
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: touch ? 2 : 1,
    hasTouch: touch,
    isMobile: touch && Math.min(vp.width, vp.height) < 500,
  });
  if (unlock) {
    await context.addInitScript(([game, ids]) => {
      // Only before the first load, so a win during the steps is kept.
      const key = `ryzhik-igry:${game}:progress`;
      if (!sessionStorage.getItem("shots-seeded")) {
        sessionStorage.setItem("shots-seeded", "1");
        localStorage.setItem(key, JSON.stringify({ completed: ids, stars: Object.fromEntries(ids.map((id) => [id, 3])) }));
      }
    }, unlock);
  }
  const p = await context.newPage();
  p.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`${name}: ${msg.text()}`);
  });
  p.on("pageerror", (err) => errors.push(`${name}: ${err.message}`));
  await p.goto(`${BASE}${hash}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  if (steps) await steps(p);
  await p.screenshot({ path: `${OUT}/${name}.png` });
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  if (overflow) errors.push(`${name}: page is wider than the screen`);
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
  await p.waitForTimeout(800);
  await p.getByRole("button", { name: "Играть" }).click().catch(() => {});
  await p.waitForTimeout(800);
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
}, ["najdi-paru", ["p1", "p2"]]);
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
}, ["teni", ["t1", "t2", "t3"]]);

await page("18-odezhda-levels", "#/odezhda/");
await page("19-odezhda-play", "#/odezhda/play/3", async (p) => {
  const good = p.locator('.od-item[data-good="1"]').first();
  const slot = await good.getAttribute("data-slot");
  await drag(p, good, await centre(p.locator(`.od-anchor[data-slot="${slot}"]`)));
  const bad = p.locator('.od-item[data-good="0"]').first();
  await drag(p, bad, await centre(p.locator(".od-figure")));
  await p.waitForTimeout(300);
}, ["odezhda", ["o1", "o2"]]);
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

const all = (prefix, n) => Array.from({ length: n }, (_, i) => `${prefix}${i + 1}`);

await page("21-parents-gate", "#/roditelyam");
await page("22-parents-settings", "#/roditelyam", async (p) => {
  const ask = await p.locator(".gate__ask").textContent();
  const words = ["один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"];
  const digits = ask.split(":")[1].split(",").map((w) => words.indexOf(w.trim()) + 1);
  for (const d of digits) await p.locator(".gate__keys button", { hasText: String(d) }).click();
  await p.waitForTimeout(300);
});
await page("23-home-progress", "#/", null, ["mozaika", ["m1", "m2", "m3", "m4"]]);

await page("24-mozaika-16", "#/mozaika/play/13", async (p) => {
  await p.waitForTimeout(400);
}, ["mozaika", all("m", 12)]);
await page("25-mozaika-hint", "#/mozaika/play/7", async (p) => {
  await p.locator(".btn--hint").click();
  await p.locator(".btn--hint").click();
  await p.waitForTimeout(700);
}, ["mozaika", all("m", 6)]);
await page("26-sliyanie-zima", "#/sliyanie/play/9", async (p) => {
  for (const key of ["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight", "ArrowDown"]) {
    await p.keyboard.press(key);
    await p.waitForTimeout(160);
  }
}, ["sliyanie", ["s1", "s2", "s3", "s4", "s5", "s6", "z1", "z2"]]);
await page("27-najdi-paru-20", "#/najdi-paru/play/12", async (p) => {
  await p.locator(".btn--hint").click();
  await p.waitForTimeout(500);
}, ["najdi-paru", ["p1", "p2", "p3", "p4", "p7", "p5", "p8", "p9", "p6", "p10", "p11"]]);
await page("28-teni-six", "#/teni/play/11", async (p) => {
  await p.locator(".btn--hint").click();
  await p.waitForTimeout(400);
}, ["teni", ["t1", "t2", "t3", "t7", "t4", "t8", "t6", "t9", "t5", "t10"]]);
await page("29-odezhda-sled", "#/odezhda/play/8", async (p) => {
  for (;;) {
    const good = p.locator('.od-item[data-good="1"]:not(.is-placed)').first();
    if ((await good.count()) === 0) break;
    const slot = await good.getAttribute("data-slot");
    await drag(p, good, await centre(p.locator(`.od-anchor[data-slot="${slot}"]`)));
    await p.waitForTimeout(250);
  }
  await p.waitForTimeout(300);
  await p.locator(".praise").evaluate((n) => n.remove()).catch(() => {});
}, ["odezhda", ["o1", "o2", "o3", "o4", "o5", "o7", "o8"]]);
await page("30-odezhda-big-tray", "#/odezhda/play/12", async (p) => {
  await p.locator(".btn--hint").click();
  await p.waitForTimeout(400);
}, ["odezhda", ["o1", "o2", "o3", "o4", "o5", "o7", "o8", "o9", "o6", "o10", "o11"]]);

await page("31-sortirovka-levels", "#/sortirovka/");
await page("32-sortirovka-play", "#/sortirovka/play/6", async (p) => {
  const item = p.locator(".so-item").first();
  await drag(p, item, await centre(p.locator(".so-basket").first()));
  await p.waitForTimeout(300);
}, ["sortirovka", all("c", 5)]);
await page("33-sortirovka-kinds", "#/sortirovka/play/12", async (p) => {
  await p.locator(".btn--hint").click();
  await p.waitForTimeout(400);
}, ["sortirovka", [...all("c", 6), ...all("k", 5)]]);
await page("34-sortirovka-win", "#/sortirovka/play/1", async (p) => {
  const map = { apple: "red", car: "red", sun: "yellow", star: "yellow" };
  for (;;) {
    const item = p.locator(".so-item:not(.is-placed)").first();
    if ((await item.count()) === 0) break;
    const id = await item.getAttribute("data-id");
    await drag(p, item, await centre(p.locator(`.so-basket[data-id="${map[id]}"]`)));
    await p.waitForTimeout(200);
  }
  await p.waitForTimeout(1500);
});

await page("35-labirint-levels", "#/labirint/");
await page("36-labirint-apples", "#/labirint/play/10", async (p) => {
  for (const key of ["ArrowRight", "ArrowDown", "ArrowRight", "ArrowDown"]) await p.keyboard.press(key);
  await p.locator(".btn--hint").click();
  await p.waitForTimeout(500);
}, ["labirint", all("l", 9)]);
await page("37-labirint-win", "#/labirint/play/1", async (p) => {
  // Follow the hint line cell by cell.
  await p.locator(".btn--hint").click();
  const points = (await p.locator(".lb-hint").getAttribute("points")).trim().split(" ").map((xy) => xy.split(",").map(Number));
  for (let i = 1; i < points.length; i++) {
    const [dx, dy] = [points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]];
    await p.keyboard.press(dx > 0 ? "ArrowRight" : dx < 0 ? "ArrowLeft" : dy > 0 ? "ArrowDown" : "ArrowUp");
    await p.waitForTimeout(80);
  }
  await p.waitForTimeout(1500);
});
await page("38-tajnaya-kartinka-big", "#/", async (p) => {
  const done = ["ryzhik-stoit", "ryzhik-mashet", "ryzhik-zaryadka", "ryzhik-myachik", "ryzhik-zmey", "mama", "papa", "bratik", "sad", "piknik"];
  await p.evaluate((ids) => {
    localStorage.setItem("ryzhik-kartinka:progress", JSON.stringify({ completed: ids, stars: {} }));
  }, done);
  await p.goto(`${BASE}#/tajnaya-kartinka/game/belka`, { waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  await p.getByRole("button", { name: "Играть" }).click().catch(() => {});
  await p.waitForTimeout(800);
});

await browser.close();
if (errors.length) {
  console.error("Console errors:\n" + errors.join("\n"));
  process.exit(1);
}
console.log("No console errors.");
