/**
 * Play-through QA: completes every level of every level game from a fresh
 * profile (so unlocking is tested too), checks layout on each level, and
 * reports problems. Runs against the dev server (it imports level data).
 *
 *   npx vite &                        # http://127.0.0.1:5173/
 *   QA_GAMES=mozaika,teni QA_VIEWPORTS=390x844 node scripts/qa.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const BASE = process.env.QA_BASE ?? "http://127.0.0.1:5173/";
const OUT = process.env.QA_DIR ?? "/tmp/qa";
const VIEWPORTS = (process.env.QA_VIEWPORTS ?? "390x844,844x390r").split(",");
const ONLY = (process.env.QA_GAMES ?? "").split(",").filter(Boolean);
await mkdir(OUT, { recursive: true });

const MODULES = {
  mozaika: "levels", "najdi-paru": "levels", teni: "levels", odezhda: "levels", sortirovka: "levels",
  labirint: "levels", sliyanie: "levels", risovalka: "pictures", tochki: "levels", professii: "data",
  stroyka: "levels", formy: "levels", bukvy: "letters",
};

// ------------------------------------------------------------ input helpers
async function trace(p, points) {
  await p.mouse.move(points[0][0], points[0][1]);
  await p.mouse.down();
  for (const [x, y] of points) await p.mouse.move(x, y);
  await p.mouse.up();
}
const line = (a, b, n = 8) => Array.from({ length: n + 1 }, (_, i) => [a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n]);
async function mid(p, sel) {
  return p.evaluate((s) => {
    const n = document.querySelector(s);
    if (!n) return null;
    const r = n.getBoundingClientRect();
    return [r.x + r.width / 2, r.y + r.height / 2];
  }, sel);
}
async function dragSel(p, from, to) {
  const a = await mid(p, from);
  const b = await mid(p, to);
  if (!a || !b) return false;
  await trace(p, line(a, b));
  await p.waitForTimeout(120);
  return true;
}
const won = (p) => p.locator(".praise").count().then((n) => n > 0);

// ------------------------------------------------------------ solvers
const SOLVE = {
  async mozaika(p) {
    const n = await p.locator(".mz-piece").count();
    for (let i = 0; i < n; i++) await dragSel(p, `.mz-piece[data-index="${i}"]`, `.mz-slot[data-index="${i}"]`);
  },
  async "najdi-paru"(p) {
    await p.waitForTimeout(400);
    for (let k = 0; k < 40 && !(await won(p)); k++) {
      const pair = await p.evaluate(() => {
        const cards = [...document.querySelectorAll(".np-card")];
        const i = cards.findIndex((c) => !c.classList.contains("is-matched") && !c.classList.contains("is-open"));
        if (i < 0) return null;
        const j = cards.findIndex((c, n) => n !== i && c.dataset.face === cards[i].dataset.face);
        return [i, j];
      });
      if (!pair) {
        await p.waitForTimeout(300);
        continue;
      }
      await p.locator(".np-card").nth(pair[0]).click();
      await p.locator(".np-card").nth(pair[1]).click();
      await p.waitForTimeout(700);
    }
  },
  async teni(p) {
    // Big scenes have several rounds: when a round is done the next one comes after a pause.
    for (let k = 0, idle = 0; k < 80 && idle < 12 && !(await won(p)); k++) {
      const id = await p.evaluate(() => document.querySelector(".tn-item:not(.is-placed)")?.dataset.id ?? null);
      if (!id) {
        idle++;
        await p.waitForTimeout(250);
        continue;
      }
      idle = 0;
      await dragSel(p, `.tn-item[data-id="${id}"]`, `.tn-shadow[data-id="${id}"]`);
      await p.waitForTimeout(150);
    }
  },
  async odezhda(p) {
    for (let k = 0; k < 30 && !(await won(p)); k++) {
      const good = p.locator('.od-item[data-good="1"]:not(.is-placed)').first();
      if ((await good.count()) === 0) break;
      const id = await good.getAttribute("data-id");
      const slot = await good.getAttribute("data-slot");
      await dragSel(p, `.od-item[data-id="${id}"]`, `.od-anchor[data-slot="${slot}"]`);
      await p.waitForTimeout(200);
    }
  },
  async sortirovka(p, level) {
    for (let k = 0; k < 40 && !(await won(p)); k++) {
      const id = await p.evaluate(() => document.querySelector(".so-item:not(.is-placed)")?.dataset.id ?? null);
      if (!id) break;
      const basket = level.baskets.find((b) => b.items.includes(id)).id;
      await dragSel(p, `.so-item[data-id="${id}"]`, `.so-basket[data-id="${basket}"]`);
      await p.waitForTimeout(150);
    }
  },
  async labirint(p) {
    const pos = () => p.evaluate(() => { const f = document.querySelector(".lb-fox"); return `${f.style.left}|${f.style.top}`; });
    const DIRS = [["ArrowRight", "ArrowLeft"], ["ArrowDown", "ArrowUp"], ["ArrowLeft", "ArrowRight"], ["ArrowUp", "ArrowDown"]];
    const seen = new Set([await pos()]);
    const parent = new Map();
    const goalKey = await p.evaluate(() => { const f = document.querySelector(".lb-friend"); return `${f.style.left}|${f.style.top}`; });
    async function dfs(here) {
      for (const [go, back] of DIRS) {
        if (await won(p)) return;
        await p.keyboard.press(go);
        const now = await pos();
        if (now === here) continue;
        if (seen.has(now)) { await p.keyboard.press(back); continue; }
        seen.add(now);
        parent.set(now, [here, go]);
        await dfs(now);
        if (await won(p)) return;
        await p.keyboard.press(back);
      }
    }
    await dfs(await pos());
    if (await won(p)) return;
    // Walk the tree from the start to the friend.
    const path = [];
    for (let k = goalKey; parent.has(k); k = parent.get(k)[0]) path.unshift(parent.get(k)[1]);
    for (const key of path) await p.keyboard.press(key);
  },
  async sliyanie(p) {
    const order = ["ArrowDown", "ArrowLeft", "ArrowDown", "ArrowRight", "ArrowDown", "ArrowLeft"];
    for (let k = 0; k < 3000 && !(await won(p)); k++) {
      const before = await p.evaluate(() => [...document.querySelectorAll(".sl-tile")].map((n) => n.style.cssText).join());
      await p.keyboard.press(order[k % order.length]);
      await p.waitForTimeout(150);
      const after = await p.evaluate(() => [...document.querySelectorAll(".sl-tile")].map((n) => n.style.cssText).join());
      if (before === after) {
        for (const key of ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]) {
          await p.keyboard.press(key);
          await p.waitForTimeout(150);
          const now = await p.evaluate(() => [...document.querySelectorAll(".sl-tile")].map((n) => n.style.cssText).join());
          if (now !== before) break;
        }
      }
      if (await p.locator(".sl-help:not([hidden])").count()) await p.locator(".sl-help").click();
    }
  },
  async risovalka(p) {
    for (let round = 0; round < 12 && !(await won(p)); round++) {
      const strokes = await p.evaluate(() =>
        [...document.querySelectorAll(".rv-guide.is-now")].map((g) => {
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
      for (const s of strokes) {
        await trace(p, s);
        await p.waitForTimeout(60);
      }
      await p.waitForTimeout(150);
    }
  },
  async tochki(p) {
    const pts = await p.evaluate(() => [...document.querySelectorAll(".td-dot__core")].map((n) => { const r = n.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }));
    const path = [];
    for (let i = 1; i < pts.length; i++) path.push(...line(pts[i - 1], pts[i], 6));
    await trace(p, path);
  },
  async professii(p, level) {
    if (level.kind === "steps") {
      for (const step of level.steps) {
        await p.waitForTimeout(500);
        const a = await mid(p, `[data-tool="${step.tool}"]`);
        const box = await p.locator(`[data-zone="${step.zone}"]`).first().boundingBox();
        if (!a || !box) throw new Error(`no tool/zone ${step.tool}/${step.zone}`);
        const b = [box.x + box.width / 2, box.y + box.height / 2];
        const path = line(a, b);
        if (step.kind === "rub") for (let j = 0; j < 16; j++) for (let i = 0; i <= 6; i++) path.push([b[0] - box.width * 0.35 + (box.width * 0.7 * (j % 2 ? 6 - i : i)) / 6, b[1] + (i % 2) * 6]);
        await trace(p, path);
        await p.waitForTimeout(700);
      }
    } else if (level.kind === "shop") {
      for (const l of level.list) for (let i = 0; i < l.n; i++) {
        await p.locator(`.pr-shelf__item[data-id="${l.id}"]`).first().click();
        await p.waitForTimeout(350);
      }
      await p.waitForTimeout(1500);
      for (let k = 0; k < 20 && !(await won(p)); k++) {
        if (!(await dragSel(p, ".pr-coin:not(.is-placed)", ".pr-till"))) break;
        await p.waitForTimeout(300);
      }
    } else {
      for (const t of level.things.filter((t) => t.danger)) {
        await p.locator(`[data-thing="${t.id}"] .pr-thing__hit`).first().click({ force: true });
        await p.waitForTimeout(400);
      }
    }
  },
  async stroyka(p) {
    for (let k = 0; k < 40 && !(await won(p)); k++) {
      const pair = await p.evaluate(() => {
        for (const g of document.querySelectorAll(".sk-ghost:not(.is-filled):not(.is-fixed)")) {
          const b = [...document.querySelectorAll(`.sk-block[data-key="${g.dataset.key}"]`)].find((n) => !n.classList.contains("is-placed"));
          if (!b) continue;
          const r1 = b.getBoundingClientRect();
          const r2 = g.getBoundingClientRect();
          return [[r1.x + r1.width / 2, r1.y + r1.height / 2], [r2.x + r2.width / 2, r2.y + r2.height / 2]];
        }
        return null;
      });
      if (!pair) break;
      await trace(p, line(pair[0], pair[1]));
      await p.waitForTimeout(150);
    }
  },
  async formy(p, level) {
    if (level.mode === "pick") {
      for (let k = 0; k < level.rounds + 2 && !(await won(p)); k++) {
        await p.waitForSelector(".fm-opt[data-ok]:not(.is-right)", { timeout: 4000 }).catch(() => null);
        const ok = p.locator(".fm-opt[data-ok]:not(.is-right)").first();
        if (!(await ok.count())) break;
        await ok.click();
        await p.waitForTimeout(1700);
      }
      return;
    }
    for (let k = 0; k < 40 && !(await won(p)); k++) {
      const pair = await p.evaluate(([pyr, order]) => {
        let items = [...document.querySelectorAll(".fm-tray [data-key]:not(.is-placed)")];
        if (!items.length) return null;
        if (pyr || order === "down") items = items.sort((a, b) => Number(b.dataset.key) - Number(a.dataset.key));
        else if (order === "up") items = items.sort((a, b) => Number(a.dataset.key) - Number(b.dataset.key));
        const it = items[0];
        const tg = document.querySelector(".fm-pole") ?? document.querySelector(".fm-shelf") ?? document.querySelector(`.fm-layout > :nth-child(2) [data-key="${it.dataset.key}"]`);
        const r1 = it.getBoundingClientRect();
        const r2 = tg.getBoundingClientRect();
        return [[r1.x + r1.width / 2, r1.y + r1.height / 2], [r2.x + r2.width / 2, r2.y + r2.height / 2]];
      }, [level.mode === "pyramid", level.mode === "order" ? level.dir : ""]);
      if (!pair) break;
      await trace(p, line(pair[0], pair[1]));
      await p.waitForTimeout(250);
    }
  },
};

// ------------------------------------------------------------ layout checks
const TOUCH = ".fm-opt,.mz-piece,.tn-item,.od-item,.so-item,[data-tool],.pr-shelf__item,.pr-coin,.sk-block,.fm-tray [data-key],.np-card,.btn,.level-card,.sl-pad__btn,.kt-food,.kt-tool,.kt-picker__btn";
async function layoutCheck(p) {
  return p.evaluate((TOUCH) => {
    const out = [];
    const W = innerWidth, H = innerHeight;
    if (document.documentElement.scrollWidth > W + 1) out.push(`page wider than screen (${document.documentElement.scrollWidth}px)`);
    if (document.documentElement.scrollHeight > H + 1 && document.body.dataset.route === "play") out.push(`play screen scrolls (${document.documentElement.scrollHeight}px)`);
    const small = new Map();
    for (const n of document.querySelectorAll(TOUCH)) {
      if (n.closest("[hidden]") || n.classList.contains("is-placed")) continue;
      const r = n.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const cs = getComputedStyle(n);
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      const cls = n.className.baseVal ?? n.className;
      const key = String(cls).split(" ")[0] || n.tagName;
      const after = getComputedStyle(n, "::after");
      const grip = after.content !== "none" && after.position === "absolute" ? 12 : 0;
      if (Math.min(r.width, r.height) + grip < 44) small.set(key, Math.round(Math.min(r.width, r.height)));
      if (document.body.dataset.route === "play" && !n.closest(".praise") && !n.classList.contains("level-card") && (r.right > W + 2 || r.bottom > H + 2 || r.left < -2 || r.top < -2)) out.push(`off-screen: ${key} (${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}×${Math.round(r.height)})`);
    }
    for (const [k, v] of small) out.push(`small touch target: ${k} ${v}px`);
    for (const n of document.querySelectorAll(".screen *")) {
      if (!n.childNodes.length || ![...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())) continue;
      const cs = getComputedStyle(n);
      if ((n.scrollWidth > n.clientWidth + 2 && cs.overflowX !== "visible") || (n.scrollHeight > n.clientHeight + 2 && cs.overflowY !== "visible" && cs.overflowY !== "auto")) {
        out.push(`text cut: "${n.textContent.trim().slice(0, 30)}"`);
      }
    }
    return [...new Set(out)];
  }, TOUCH);
}

// ------------------------------------------------------------ run
const browser = await chromium.launch();
const report = [];
const note = (game, vp, where, msg) => {
  report.push({ game, vp, where, msg });
  console.log(`  ! ${game} ${vp} ${where}: ${msg}`);
};

async function playGame(game, vpTag) {
  const reduce = vpTag.endsWith("r");
  const [width, height] = vpTag.replace("r", "").split("x").map(Number);
  const touch = width < 900;
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, hasTouch: touch, isMobile: touch && Math.min(width, height) < 500, reducedMotion: reduce ? "reduce" : "no-preference" });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => note(game, vpTag, "page", `JS error: ${e.message}`));
  p.on("console", (m) => { if (m.type() === "error") note(game, vpTag, "console", m.text()); });
  await p.goto(`${BASE}#/${game}/`, { waitUntil: "networkidle" });
  const { levels } = await p.evaluate(async ([g, m]) => {
    const mod = await import(`/src/games/${g}/${m}.ts`);
    return { levels: JSON.parse(JSON.stringify(mod.levels)) };
  }, [game, MODULES[game]]);
  console.log(`${game} ${vpTag}: ${levels.length} levels`);
  // First launch: the «Как играть» card must show; then it is closed.
  try {
    await p.waitForSelector(".ht-ok", { timeout: 4000 });
    const htFit = await p.evaluate(() => {
      const c = document.querySelector(".ht-card").getBoundingClientRect();
      const ok = document.querySelector(".ht-ok").getBoundingClientRect();
      return { fits: c.top >= 0 && c.bottom <= innerHeight + 1, okVisible: ok.bottom <= innerHeight && ok.top >= 0, okH: ok.height };
    });
    if (!htFit.okVisible) note(game, vpTag, "howto", `«Понятно!» off screen`);
    await p.screenshot({ path: `${OUT}/${game}--${vpTag}--howto.png` });
    await p.click(".ht-ok");
    await p.waitForSelector(".ht", { state: "detached", timeout: 3000 });
  } catch {
    note(game, vpTag, "howto", "no «Как играть» card on first launch");
  }
  if (!(await p.locator(".btn--howto").count())) note(game, vpTag, "howto", "no «?» button");
  // «Вырасти сад» opens on the 2048 picker; the levels are «Тренировка для малышей».
  if (game === "sliyanie") {
    if (!(await p.locator(".sb-skin").count())) note(game, vpTag, "list", "first screen is not the 2048 picker");
    await p.click(".sl-train");
  }
  // Start from the list: the first card must be open, the second locked.
  await p.waitForSelector(".level-card");
  const locked = await p.locator(".level-card.is-locked").count();
  // «Цифры и буквы» (3) and «Размер и форма» (5): each world starts open.
  const open = game === "bukvy" ? 3 : game === "formy" ? 5 : 1;
  if (locked !== levels.length - open) note(game, vpTag, "list", `fresh list: ${locked} locked of ${levels.length}`);
  (await layoutCheck(p)).forEach((m) => note(game, vpTag, "list", m));
  await p.locator(".level-card.is-next").first().click({ force: true });
  const stars = {};
  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    const where = `${i + 1} ${level.id}`;
    try {
      await p.waitForFunction((n) => location.hash.endsWith(`/play/${n}`), i + 1, { timeout: 5000 });
      await p.waitForTimeout(700);
      (await layoutCheck(p)).forEach((m) => note(game, vpTag, where, m));
      await p.screenshot({ path: `${OUT}/${game}--${vpTag}--${String(i + 1).padStart(2, "0")}.png` });
      const t0 = Date.now();
      await SOLVE[game](p, level);
      // QA_DONESHOTS=1: the finished scene (before the card) and the card of every level.
      if (process.env.QA_DONESHOTS) {
        await p.waitForTimeout(1100);
        await p.screenshot({ path: `${OUT}/${game}--${vpTag}--${String(i + 1).padStart(2, "0")}-done.png` });
      }
      await p.waitForSelector(".praise", { timeout: 20000 });
      if (process.env.QA_DONESHOTS) {
        await p.waitForTimeout(700);
        await p.screenshot({ path: `${OUT}/${game}--${vpTag}--${String(i + 1).padStart(2, "0")}-win.png` });
      }
      const got = await p.locator(".praise .star.is-on").count();
      stars[level.id] = got;
      if (got < 3 && game !== "labirint") note(game, vpTag, where, `only ${got} stars on a perfect play`);
      if (i === levels.length - 1) {
        await p.waitForTimeout(600);
        await p.screenshot({ path: `${OUT}/${game}--${vpTag}--win.png` });
        (await layoutCheck(p)).forEach((m) => note(game, vpTag, `${where} praise`, m));
      }
      console.log(`  ${where} ✓ ${got}★ ${((Date.now() - t0) / 1000).toFixed(1)}s`);
      await p.waitForTimeout(400);
      if (i < levels.length - 1) await p.evaluate(() => document.querySelector(".praise .btn--play").click());
    } catch (e) {
      note(game, vpTag, where, `STUCK: ${String(e.message).split("\n")[0]}`);
      await p.screenshot({ path: `${OUT}/${game}--${vpTag}--${String(i + 1).padStart(2, "0")}-stuck.png` });
      // Carry on: unlock the next level by hand.
      await p.evaluate(([g, id]) => {
        const k = `ryzhik-igry:${g}:progress`;
        const v = JSON.parse(localStorage.getItem(k) ?? '{"completed":[],"stars":{}}');
        v.completed.push(id);
        localStorage.setItem(k, JSON.stringify(v));
      }, [game, level.id]);
      if (i < levels.length - 1) await p.goto(`${BASE}#/${game}/play/${i + 2}`);
      await p.reload();
    }
  }
  // Progress saved: back on the list every card is done with the stars shown.
  await p.goto(`${BASE}#/${game}/${game === "sliyanie" ? "levels" : ""}`);
  await p.reload();
  await p.waitForSelector(".level-card");
  const doneCards = await p.locator(".level-card.is-done").count();
  if (doneCards !== levels.length) note(game, vpTag, "list", `after playing: ${doneCards}/${levels.length} done`);
  const saved = await p.evaluate((g) => JSON.parse(localStorage.getItem(`ryzhik-igry:${g}:progress`) ?? "{}"), game);
  for (const [id, n] of Object.entries(stars)) if ((saved.stars?.[id] ?? 0) !== n) note(game, vpTag, id, `saved ${saved.stars?.[id]}★, shown ${n}★`);
  await ctx.close();
}

SOLVE.bukvy = SOLVE.risovalka;
const games = ONLY.length ? ONLY : Object.keys(SOLVE);
await Promise.all(
  VIEWPORTS.map(async (vp) => {
    for (const g of games) {
      try {
        await playGame(g, vp);
      } catch (e) {
        note(g, vp, "run", `harness: ${e.message}`);
      }
    }
  }),
);
await browser.close();
await writeFile(`${OUT}/report-${games.join("_").slice(0, 60)}.json`, JSON.stringify(report, null, 1));
console.log(`\n${report.length} findings`);
