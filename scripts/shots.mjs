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
  if (process.env.SHOTS_FROM && parseInt(name, 10) < Number(process.env.SHOTS_FROM)) return;
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
  // «Как играть» and the first tips were seen, except in the v4 shots of them.
  if (!/howto|tutorial|tip-/.test(name)) {
    await context.addInitScript((games) => {
      if (!localStorage.getItem("ryzhik-igry:seen")) localStorage.setItem("ryzhik-igry:seen", JSON.stringify({ howto: games, tips: ["hint-lamp", "sound-button", "sliyanie:big", ...games.map((g) => `tutorial:${g}`)] }));
    }, ["domik", "kuhnya", "risovalka", "tochki", "professii", "stroyka", "formy", "tajnaya-kartinka", "mozaika", "sliyanie", "najdi-paru", "teni", "odezhda", "sortirovka", "labirint", "raskraska"]);
  }
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

// ---------------------------------------------------------------- v3 games

/** Drag along a list of client points with the mouse held down. */
async function trace(p, points) {
  await p.mouse.move(points[0][0], points[0][1]);
  await p.mouse.down();
  for (const [x, y] of points) await p.mouse.move(x, y);
  await p.mouse.up();
}

/** Drag the centre of one element onto the centre of another. */
async function dragTo(p, fromSel, toSel) {
  const a = await centre(p.locator(fromSel).first());
  const b = await centre(p.locator(toSel).first());
  await trace(p, Array.from({ length: 9 }, (_, i) => [a.x + ((b.x - a.x) * i) / 8, a.y + ((b.y - a.y) * i) / 8]));
  await p.waitForTimeout(200);
}

await page("39-domik", "#/domik", async (p) => {
  await p.locator(".dm-prop--radio").first().click({ force: true }).catch(() => {});
  await p.waitForTimeout(600);
});
await page("40-domik-night-sad", "#/domik", async (p) => {
  await p.locator('.dm-tab[aria-label="Сад"]').click().catch(() => {});
  await p.waitForTimeout(400);
  await p.locator(".dm-night-btn").click().catch(() => {});
  await p.waitForTimeout(900);
});
await page("41-kuhnya", "#/kuhnya", async (p) => {
  await dragTo(p, '.kt-food[aria-label="Яблоко"]', ".kt-tool--cut");
  await p.waitForTimeout(400);
});

const RISOVALKA = ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "r9", "r10", "r11", "r12", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8"];
async function traceGuides(p, limit = 99) {
  const strokes = await p.evaluate(() =>
    [...document.querySelectorAll(".rv-guide")].map((g) => {
      const m = g.getScreenCTM();
      const L = g.getTotalLength();
      const pts = [];
      for (let s = 0; s <= L + 4; s += 4) {
        const q = g.getPointAtLength(Math.min(s, L));
        pts.push([m.a * q.x + m.c * q.y + m.e, m.b * q.x + m.d * q.y + m.f]);
      }
      return pts;
    }),
  );
  for (const s of strokes.slice(0, limit)) {
    await trace(p, s);
    await p.waitForTimeout(80);
  }
}
await page("42-risovalka-levels", "#/risovalka/");
await page("43-risovalka-trace", "#/risovalka/play/7", (p) => traceGuides(p, 1), ["risovalka", RISOVALKA]);
await page("44-risovalka-alive", "#/risovalka/play/5", async (p) => {
  await traceGuides(p);
  await p.waitForTimeout(900);
}, ["risovalka", RISOVALKA]);
await page("45-risovalka-digit", "#/risovalka/play/21", async (p) => {
  await traceGuides(p);
  await p.waitForTimeout(3800);
}, ["risovalka", RISOVALKA]);

const TOCHKI = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10", "t11"];
async function joinDots(p, limit = 99) {
  const pts = await p.evaluate(() =>
    [...document.querySelectorAll(".td-dot__core")].map((n) => {
      const r = n.getBoundingClientRect();
      return [r.x + r.width / 2, r.y + r.height / 2];
    }),
  );
  const path = [];
  for (let i = 1; i < Math.min(pts.length, limit); i++)
    for (let k = 0; k <= 6; k++) path.push([pts[i - 1][0] + ((pts[i][0] - pts[i - 1][0]) * k) / 6, pts[i - 1][1] + ((pts[i][1] - pts[i - 1][1]) * k) / 6]);
  await trace(p, path);
}
await page("46-tochki-levels", "#/tochki/");
await page("47-tochki-play", "#/tochki/play/12", (p) => joinDots(p, 8), ["tochki", TOCHKI]);
await page("48-tochki-alive", "#/tochki/play/4", async (p) => {
  await joinDots(p);
  await p.waitForTimeout(1300);
}, ["tochki", TOCHKI]);

const PROF = ["vrach-zayka", "vrach-kotik", "vrach-mishka", "pozhar-dom", "pozhar-kotik", "pozhar-les", "magazin-1", "magazin-2", "magazin-3", "magazin-4", "dom-kuhnya"];
async function useTools(p, steps) {
  for (const [tool, zone, rub] of steps) {
    const a = await centre(p.locator(`[data-tool="${tool}"]`));
    const box = await p.locator(`[data-zone="${zone}"]`).boundingBox();
    const b = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    const path = Array.from({ length: 9 }, (_, i) => [a.x + ((b.x - a.x) * i) / 8, a.y + ((b.y - a.y) * i) / 8]);
    if (rub) for (let j = 0; j < 14; j++) for (let i = 0; i <= 6; i++) path.push([b.x - box.width * 0.35 + (box.width * 0.7 * (j % 2 ? 6 - i : i)) / 6, b.y + (i % 2) * 6]);
    await trace(p, path);
    await p.waitForTimeout(700);
  }
}
await page("49-professii-levels", "#/professii/");
await page("50-professii-doctor", "#/professii/play/1", (p) => useTools(p, [["thermo", "mouth"]]));
await page("51-professii-doctor-done", "#/professii/play/1", (p) => useTools(p, [["thermo", "mouth"], ["medicine", "mouth"], ["blanket", "body"], ["tea", "mouth"]]));
await page("52-professii-fire", "#/professii/play/4", (p) => useTools(p, [["hose", "hydrant"], ["water", "fire-a", true]]), ["professii", PROF]);
await page("53-professii-cat", "#/professii/play/5", async (p) => {
  await useTools(p, [["ladder", "tree"], ["glove", "cat"]]);
  await p.waitForTimeout(800);
}, ["professii", PROF]);
await page("54-professii-shop", "#/professii/play/8", async (p) => {
  for (const id of ["apple", "apple", "mushroom"]) {
    await p.locator(`.pr-shelf__item[data-id="${id}"]`).click();
    await p.waitForTimeout(400);
  }
}, ["professii", PROF]);
await page("55-professii-pay", "#/professii/play/7", async (p) => {
  for (const id of ["apple", "banana", "carrot"]) {
    await p.locator(`.pr-shelf__item[data-id="${id}"]`).click();
    await p.waitForTimeout(400);
  }
  await p.waitForTimeout(1300);
  await dragTo(p, ".pr-coin", ".pr-till");
}, ["professii", PROF]);
await page("56-professii-safety", "#/professii/play/11", async (p) => {
  for (const id of ["plita", "nozh", "frukty"]) {
    await p.locator(`[data-thing="${id}"] .pr-thing__hit`).click({ force: true });
    await p.waitForTimeout(400);
  }
}, ["professii", PROF]);

const STROYKA = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"];
async function buildAll(p, limit = 99) {
  for (let k = 0; k < limit; k++) {
    const pair = await p.evaluate(() => {
      for (const g of document.querySelectorAll(".sk-ghost:not(.is-filled)")) {
        const b = [...document.querySelectorAll(`.sk-block[data-key="${g.dataset.key}"]`)].find((n) => !n.classList.contains("is-placed"));
        if (!b) continue;
        const r1 = b.getBoundingClientRect();
        const r2 = g.getBoundingClientRect();
        return [r1.x + r1.width / 2, r1.y + r1.height / 2, r2.x + r2.width / 2, r2.y + r2.height / 2];
      }
      return null;
    });
    if (!pair) break;
    await trace(p, Array.from({ length: 9 }, (_, i) => [pair[0] + ((pair[2] - pair[0]) * i) / 8, pair[1] + ((pair[3] - pair[1]) * i) / 8]));
    await p.waitForTimeout(150);
  }
}
await page("57-stroyka-levels", "#/stroyka/");
await page("58-stroyka-train", "#/stroyka/play/4", (p) => buildAll(p, 5), ["stroyka", STROYKA]);
await page("59-stroyka-house-alive", "#/stroyka/play/5", async (p) => {
  await buildAll(p);
  await p.waitForTimeout(1500);
}, ["stroyka", STROYKA]);
await page("60-stroyka-number-train", "#/stroyka/play/7", (p) => buildAll(p, 3), ["stroyka", STROYKA]);

const FORMY = ["r1", "r2", "r3", "r4", "r5", "f1", "f2", "f3", "f4", "f5"];
async function sortAll(p, limit = 99) {
  for (let k = 0; k < limit; k++) {
    const pair = await p.evaluate(() => {
      const items = [...document.querySelectorAll(".fm-tray [data-key]:not(.is-placed)")];
      if (!items.length) return null;
      const pole = document.querySelector(".fm-pole");
      const it = pole ? items.sort((a, b) => Number(b.dataset.key) - Number(a.dataset.key))[0] : items[0];
      const tg = pole ?? document.querySelector(`.fm-layout > :nth-child(2) [data-key="${it.dataset.key}"]`);
      const r1 = it.getBoundingClientRect();
      const r2 = tg.getBoundingClientRect();
      return [r1.x + r1.width / 2, r1.y + r1.height / 2, r2.x + r2.width / 2, r2.y + r2.height / 2];
    });
    if (!pair) break;
    await trace(p, Array.from({ length: 9 }, (_, i) => [pair[0] + ((pair[2] - pair[0]) * i) / 8, pair[1] + ((pair[3] - pair[1]) * i) / 8]));
    await p.waitForTimeout(250);
  }
}
await page("61-formy-levels", "#/formy/");
await page("62-formy-family", "#/formy/play/2", (p) => sortAll(p, 3), ["formy", FORMY]);
await page("63-formy-pyramid", "#/formy/play/5", (p) => sortAll(p, 4), ["formy", FORMY]);
await page("64-formy-sorter", "#/formy/play/11", (p) => sortAll(p, 2), ["formy", FORMY]);
await page("65-formy-things", "#/formy/play/8", (p) => sortAll(p, 3), ["formy", FORMY]);
await page("66-stroyka-rocket", "#/stroyka/play/6", async (p) => {
  await buildAll(p);
  await p.waitForTimeout(900);
}, ["stroyka", STROYKA]);

// v3.1: after a pause a hand shows the next move (caught mid-way).
const waitHand = (p) => p.waitForSelector(".guide-hand", { timeout: 9000 }).then(() => p.waitForTimeout(900));
await page("67-idle-professii", "#/professii/play/1", waitHand);
await page("68-idle-stroyka", "#/stroyka/play/1", waitHand);
await page("69-idle-tochki", "#/tochki/play/1", async (p) => {
  await joinDots(p, 2);
  await waitHand(p);
});
await page("70-idle-kuhnya", "#/kuhnya", waitHand);

// ---------------- v4: how-to cards, tutorial, tips, album, gift, new rounds
const settle = (ms) => (p) => p.waitForTimeout(ms);
await page("71-howto-mozaika", "#/mozaika/", settle(1500));
await page("72-howto-domik", "#/domik", settle(1500));
await page("73-howto-professii", "#/professii/", settle(1500));
await page("74-tutorial-sortirovka", "#/sortirovka/play/1", async (p) => {
  await p.click(".ht-ok");
  await p.waitForSelector(".guide-hand", { timeout: 6000 });
  await p.waitForTimeout(700);
});
await page("75-tip-teni-decoy", "#/teni/play/8", async (p) => {
  await p.click(".ht-ok").catch(() => {});
  await p.waitForSelector(".tip", { timeout: 6000 });
  await p.waitForTimeout(500);
}, ["teni", ["t1", "t2", "t3", "t7", "t4", "t8", "t6"]]);
await page("76-album", "#/albom", settle(800), ["mozaika", ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9", "m10"]]);
await page("77-gift", "#/", async (p) => {
  await p.click(".home__gift");
  await p.waitForTimeout(900);
});
await page("78-parents-rules", "#/roditelyam", async (p) => {
  const ask = await p.locator(".gate__ask").textContent();
  const words = ["один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"];
  for (const d of ask.split(":")[1].split(",").map((w) => words.indexOf(w.trim()) + 1)) await p.locator(".gate__keys button", { hasText: String(d) }).click();
  await p.locator("details.rules").nth(8).locator("summary").click();
  await p.locator("details.rules").nth(8).scrollIntoViewIfNeeded();
  await p.waitForTimeout(300);
});
const done = (ids) => ids;
await page("79-new-teni-t13", "#/teni/play/13", settle(900), ["teni", done(["t1", "t2", "t3", "t7", "t4", "t8", "t6", "t9", "t5", "t10", "t11", "t12"])]);
await page("80-new-najdi-paru-p14", "#/najdi-paru/play/14", settle(900), ["najdi-paru", ["p1", "p2", "p3", "p4", "p7", "p5", "p8", "p9", "p6", "p10", "p11", "p12", "p13"]]);
await page("81-new-sortirovka-k7", "#/sortirovka/play/13", settle(900), ["sortirovka", ["c1", "c2", "c3", "c4", "c5", "c6", "k1", "k2", "k3", "k4", "k5", "k6"]]);
await page("82-new-odezhda-o13", "#/odezhda/play/13", settle(900), ["odezhda", ["o1", "o2", "o3", "o4", "o5", "o7", "o8", "o9", "o6", "o10", "o11", "o12"]]);
await page("83-new-labirint-l13", "#/labirint/play/13", settle(900), ["labirint", ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l9", "l10", "l11", "l12"]]);
await page("84-new-formy-f7", "#/formy/play/13", settle(900), ["formy", [...FORMY, "f6", "r6"]]);
await page("85-new-tochki-t13", "#/tochki/play/13", settle(900), ["tochki", [...TOCHKI, "t12"]]);
await page("86-new-stroyka-s11", "#/stroyka/play/11", settle(900), ["stroyka", [...STROYKA, "s9", "s10"]]);
await page("87-new-professii-magazin-4", "#/professii/play/10", settle(1200), ["professii", PROF.slice(0, 9)]);

// v6: «Большая игра 2048» in «Вырасти сад». Rows of numbers (0 = empty).
async function seedBig(p, skin, rows, score = 0) {
  await p.evaluate(([skin, rows, score]) => {
    const tiles = [];
    let id = 1;
    rows.forEach((row, r) => row.forEach((v, c) => v && tiles.push({ id: id++, tier: Math.log2(v) - 1, r, c })));
    localStorage.setItem("ryzhik-igry:sliyanie:skin", JSON.stringify(skin));
    localStorage.setItem("ryzhik-igry:sliyanie:best", JSON.stringify(Math.max(score, 1200)));
    localStorage.setItem("ryzhik-igry:sliyanie:big", JSON.stringify({ board: { size: 4, tiles, nextId: id }, score, won: false, prev: null }));
  }, [skin, rows, score]);
  await p.goto(`${BASE}#/sliyanie/big/play`, { waitUntil: "networkidle" });
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForTimeout(700);
  const bad = await p.evaluate(() => {
    const out = [];
    if (document.documentElement.scrollHeight > innerHeight + 1) out.push(`play screen scrolls (${document.documentElement.scrollHeight}px)`);
    for (const n of document.querySelectorAll(".sb-play .btn, .sb-tile, .sb-score__box")) {
      const r = n.getBoundingClientRect();
      if (r.bottom > innerHeight + 1 || r.right > innerWidth + 1 || r.left < -1) out.push(`off-screen: ${n.className}`);
      if (n.matches(".btn") && Math.min(r.width, r.height) < 44) out.push(`small: ${n.className} ${Math.round(Math.min(r.width, r.height))}`);
    }
    return [...new Set(out)];
  });
  if (bad.length) errors.push(`big ${p.viewportSize().width}x${p.viewportSize().height}: ${bad.join("; ")}`);
}
const MID = [
  [2, 4, 8, 16],
  [256, 128, 64, 32],
  [512, 1024, 0, 2],
  [0, 4, 0, 2048],
];
await page("90-sliyanie-big-list", "#/sliyanie/");
await page("91-sliyanie-big-picker", "#/sliyanie/big", async (p) => {
  await p.locator('.sb-skin[aria-label="Зима"]').click();
  await p.waitForTimeout(300);
});
await page("92-sliyanie-big-sad", "#/sliyanie/", (p) => seedBig(p, "sad", MID, 8204));
await page("93-sliyanie-big-zima", "#/sliyanie/", (p) => seedBig(p, "zima", MID, 8204));
await page("94-sliyanie-big-les", "#/sliyanie/", (p) => seedBig(p, "les", MID, 8204));
await page("95-sliyanie-big-kosmos", "#/sliyanie/", (p) => seedBig(p, "kosmos", MID, 8204));
await page("96-sliyanie-big-cifry", "#/sliyanie/", async (p) => {
  await seedBig(p, "cifry", [[2, 4, 8, 16], [256, 128, 64, 32], [512, 1024, 0, 2], [0, 4, 0, 0]], 7000);
  await p.keyboard.press("ArrowLeft");
  await p.waitForTimeout(400);
});
await page("97-sliyanie-big-win", "#/sliyanie/", async (p) => {
  await seedBig(p, "zima", [[1024, 1024, 0, 0], [4, 8, 16, 0], [0, 0, 0, 0], [0, 0, 0, 2]], 18000);
  await p.keyboard.press("ArrowLeft");
  await p.waitForTimeout(1800);
});
await page("98-sliyanie-big-stuck", "#/sliyanie/", async (p) => {
  await seedBig(p, "les", [[2, 4, 2, 4], [4, 2, 4, 2], [2, 4, 2, 4], [4, 2, 8, 2]], 300);
  await p.waitForTimeout(1500);
});

await browser.close();
if (errors.length) {
  console.error("Console errors:\n" + errors.join("\n"));
  process.exit(1);
}
console.log("No console errors.");
