/**
 * Behaviour checks around the games: back button, locked links, reload and
 * rotate mid-level, rapid taps, two fingers at once, parents' reset and
 * sound toggle, plus smoke runs of the free-play games. Dev server needed.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.env.QA_BASE ?? "http://127.0.0.1:5173/";
const OUT = process.env.QA_DIR ?? "/tmp/qa";
await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const problems = [];
const bad = (what, msg) => {
  problems.push(`${what}: ${msg}`);
  console.log(`  ! ${what}: ${msg}`);
};
const ALL = ["domik", "kuhnya", "risovalka", "tochki", "professii", "stroyka", "formy", "tajnaya-kartinka", "mozaika", "sliyanie", "najdi-paru", "teni", "odezhda", "sortirovka", "labirint", "raskraska"];
async function open(hash, { width = 390, height = 844, reduce = false, seed, fresh = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: true, isMobile: width < 900 && Math.min(width, height) < 500, reducedMotion: reduce ? "reduce" : "no-preference" });
  // «Как играть» cards were seen already (they have their own check below).
  if (!fresh) await ctx.addInitScript((all) => { if (!localStorage.getItem("ryzhik-igry:seen")) localStorage.setItem("ryzhik-igry:seen", JSON.stringify({ howto: all, tips: [] })); }, ALL);
  if (seed) await ctx.addInitScript((s) => { if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); for (const [k, v] of Object.entries(s)) localStorage.setItem(k, JSON.stringify(v)); } }, seed);
  const p = await ctx.newPage();
  p.errors = [];
  p.on("pageerror", (e) => p.errors.push(e.message));
  p.on("console", (m) => { if (m.type() === "error") p.errors.push(m.text()); });
  await p.goto(`${BASE}${hash}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  return { p, ctx, done: async (what) => { for (const e of p.errors) bad(what, `JS: ${e}`); await ctx.close(); } };
}
const overflow = (p) => p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1 || (document.body.dataset.route === "play" && document.documentElement.scrollHeight > innerHeight + 1));

// 1. Back button and locked links.
{
  const { p, done } = await open("#/");
  await p.goto(`${BASE}#/mozaika/play/5`);
  await p.waitForTimeout(600);
  if (!(await p.evaluate(() => location.hash)).endsWith("#/mozaika/")) bad("locked link", `stays at ${await p.evaluate(() => location.hash)}`);
  await p.goto(`${BASE}#/mozaika/play/1`);
  await p.waitForTimeout(500);
  await p.goBack();
  await p.waitForTimeout(500);
  if (!(await p.locator(".level-card").count())) bad("back from level", "not on the level list");
  await p.goto(`${BASE}#/nesushchestvuet/`);
  await p.waitForTimeout(500);
  if ((await p.evaluate(() => location.hash)) !== "#/") bad("unknown game", "not sent home");
  await p.goto(`${BASE}#/mozaika/play/999`);
  await p.waitForTimeout(500);
  if (!(await p.evaluate(() => location.hash)).endsWith("#/mozaika/")) bad("level 999", "not sent to list");
  await done("routes");
}

// 2. Reload mid-level, rotate mid-level, rapid taps on hint and praise.
for (const [game, n, act] of [
  ["mozaika", 1, async (p) => { const a = await p.locator('.mz-piece[data-index="0"]').boundingBox(); const b = await p.locator('.mz-slot[data-index="0"]').boundingBox(); await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down(); await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 6 }); await p.mouse.up(); }],
  ["sortirovka", 1, null],
  ["stroyka", 1, null],
  ["formy", 1, null],
  ["professii", 1, null],
  ["tochki", 1, null],
  ["risovalka", 1, null],
  ["najdi-paru", 1, null],
  ["labirint", 1, null],
  ["sliyanie", 1, null],
  ["teni", 1, null],
  ["odezhda", 1, null],
]) {
  const { p, done } = await open(`#/${game}/play/${n}`);
  if (act) await act(p);
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  if (!(await p.locator(".stage").count())) bad(`${game} reload`, "level not shown after reload");
  for (const [w, h] of [[844, 390], [390, 844], [1280, 800]]) {
    await p.setViewportSize({ width: w, height: h });
    await p.waitForTimeout(500);
    if (await overflow(p)) bad(`${game} rotate ${w}x${h}`, "screen overflows after rotation");
  }
  await p.screenshot({ path: `${OUT}/extra-rotate-${game}.png` });
  const hint = p.locator(".btn--hint:not([hidden])");
  if (await hint.count()) for (let i = 0; i < 8; i++) await hint.click({ force: true, delay: 0 }).catch(() => {});
  await p.waitForTimeout(2500);
  await done(`${game} reload/rotate/hint`);
}

// 3. Praise card: double tap on «Дальше» opens the next level once.
{
  const { p, done } = await open("#/najdi-paru/play/1");
  const faces = await p.locator(".np-card").evaluateAll((ns) => ns.map((n) => n.dataset.face));
  const used = new Set();
  for (let i = 0; i < faces.length; i++) {
    if (used.has(i)) continue;
    const j = faces.findIndex((f, k) => k > i && f === faces[i]);
    used.add(i).add(j);
    await p.locator(".np-card").nth(i).click();
    await p.locator(".np-card").nth(j).click();
    await p.waitForTimeout(600);
  }
  await p.waitForSelector(".praise .btn--play");
  await p.waitForTimeout(500);
  const len0 = await p.evaluate(() => history.length);
  await p.evaluate(() => { const b = document.querySelector(".praise .btn--play"); b.click(); b.click(); b.click(); });
  await p.waitForTimeout(600);
  const len1 = await p.evaluate(() => history.length);
  if (len1 - len0 > 1) bad("praise double tap", `${len1 - len0} history entries`);
  // Rapid taps on cards: three cards at once must not leave three open.
  await p.evaluate(() => { const c = document.querySelectorAll(".np-card"); c[0].click(); c[1].click(); c[2].click(); c[3].click(); });
  await p.waitForTimeout(200);
  const open3 = await p.locator(".np-card.is-open:not(.is-matched)").count();
  if (open3 > 2) bad("najdi-paru rapid taps", `${open3} cards open at once`);
  await done("praise/rapid");
}

// 4. Two fingers at once (CDP touch): two pieces dragged together.
{
  const { p, done } = await open("#/mozaika/play/1");
  const cdp = await p.context().newCDPSession(p);
  const a = await p.locator('.mz-piece[data-index="0"]').boundingBox();
  const b = await p.locator('.mz-piece[data-index="1"]').boundingBox();
  const s0 = await p.locator('.mz-slot[data-index="0"]').boundingBox();
  const s1 = await p.locator('.mz-slot[data-index="1"]').boundingBox();
  const pt = (r, id) => ({ x: r.x + r.width / 2, y: r.y + r.height / 2, id });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [pt(a, 1), pt(b, 2)] });
  for (let i = 1; i <= 6; i++) {
    const mix = (r, s, id) => ({ x: r.x + r.width / 2 + ((s.x + s.width / 2) - (r.x + r.width / 2)) * i / 6, y: r.y + r.height / 2 + ((s.y + s.height / 2) - (r.y + r.height / 2)) * i / 6, id });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [mix(a, s0, 1), mix(b, s1, 2)] });
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await p.waitForTimeout(500);
  const placed = await p.locator(".mz-piece.is-placed").count();
  await p.screenshot({ path: `${OUT}/extra-multitouch.png` });
  console.log(`  multi-touch: ${placed} pieces placed`);
  const stray = await p.evaluate(() => [...document.querySelectorAll(".mz-piece:not(.is-placed)")].some((n) => n.classList.contains("is-dragging")));
  if (stray) bad("multi-touch", "a piece stays stuck in dragging state");
  await done("multi-touch");
}

// 5. Parents: sound toggle persists; reset clears a game.
{
  const { p, done } = await open("#/roditelyam", { seed: { "ryzhik-igry:mozaika:progress": { completed: ["m1"], stars: { m1: 3 } } } });
  const ask = await p.locator(".gate__ask").textContent();
  const words = ["один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"];
  for (const d of ask.split(":")[1].split(",").map((w) => words.indexOf(w.trim()) + 1)) await p.locator(".gate__keys button", { hasText: String(d) }).click();
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${OUT}/extra-parents.png`, fullPage: true });
  const sound = p.locator(".setting .btn").first();
  await sound.click();
  await p.reload();
  await p.waitForTimeout(500);
  const stored = await p.evaluate(() => localStorage.getItem("ryzhik-igry:sound"));
  if (stored !== "false") bad("sound toggle", `stored ${stored}`);
  await done("parents");
  const r = await open("#/roditelyam", { seed: { "ryzhik-igry:mozaika:progress": { completed: ["m1"], stars: { m1: 3 } } } });
  const ask2 = await r.p.locator(".gate__ask").textContent();
  for (const d of ask2.split(":")[1].split(",").map((w) => words.indexOf(w.trim()) + 1)) await r.p.locator(".gate__keys button", { hasText: String(d) }).click();
  const row = r.p.locator(".setting", { hasText: "Мозаика" });
  if (await row.count()) {
    await row.locator(".btn").click();
    await row.locator(".btn").click();
    if (await r.p.evaluate(() => localStorage.getItem("ryzhik-igry:mozaika:progress"))) bad("reset", "mozaika progress still stored");
    await r.p.goto(`${BASE}#/`);
    await r.p.waitForTimeout(800);
    await r.p.goto(`${BASE}#/mozaika/`);
    await r.p.waitForTimeout(800);
    if ((await r.p.locator(".level-card.is-done").count()) > 0) bad("reset", "list still shows the old win");
  } else bad("reset", "no Мозаика row");
  await r.done("reset");
}

// 6. Free-play games: smoke with taps everywhere.
for (const [hash, vp] of [["#/domik", [390, 844]], ["#/domik", [844, 390]], ["#/kuhnya", [390, 844]], ["#/kuhnya", [844, 390]], ["#/raskraska/", [390, 844]], ["#/tajnaya-kartinka/", [390, 844]], ["#/tajnaya-kartinka/", [844, 390]]]) {
  const { p, done } = await open(hash, { width: vp[0], height: vp[1] });
  const n = await p.locator("button:visible, [role=button]:visible").count();
  for (let i = 0; i < Math.min(n, 25); i++) {
    const h = await p.evaluate(() => location.hash);
    if (h !== hash) await p.goto(`${BASE}${hash}`).catch(() => {});
    const el = p.locator("button:visible, [role=button]:visible").nth(i);
    const label = (await el.getAttribute("aria-label").catch(() => "")) ?? (await el.textContent().catch(() => ""));
    if (/Назад|←|Сбросить|Удалить|Как играть/.test(label ?? "")) continue;
    await el.click({ timeout: 1500, force: true }).catch(() => {});
    await p.waitForTimeout(150);
  }
  if (await overflow(p)) bad(`${hash} ${vp}`, "overflow");
  await p.screenshot({ path: `${OUT}/extra-smoke-${hash.replace(/[#/]/g, "")}-${vp.join("x")}.png` });
  await done(`${hash} ${vp}`);
}

// 7. Tajnaya kartinka: play the first picture with arrows for a while.
{
  const { p, done } = await open("#/tajnaya-kartinka/game/ryzhik-stoit", { width: 844, height: 390 });
  await p.getByRole("button", { name: "Играть" }).click().catch(() => {});
  for (let i = 0; i < 40; i++) {
    await p.keyboard.press(["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"][i % 4]);
    await p.waitForTimeout(250);
  }
  await p.screenshot({ path: `${OUT}/extra-kartinka-play.png` });
  await done("kartinka play");
}

// 8. v4: «Как играть» everywhere, «?» reopens it, album, gift, parents' new settings.
for (const game of ALL) {
  const { p, done } = await open(`#/${game}/`, { fresh: true });
  if (!(await p.locator(".ht-ok").count())) bad(`howto ${game}`, "no card on first launch");
  else {
    const steps = await p.locator(".ht-step").count();
    if (steps < 2 || steps > 4) bad(`howto ${game}`, `${steps} steps`);
    await p.click(".ht-ok");
    await p.waitForTimeout(400);
    await p.reload();
    await p.waitForTimeout(900);
    if (await p.locator(".ht").count()) bad(`howto ${game}`, "shown again after «Понятно!»");
    if (!(await p.locator(".btn--howto").count())) bad(`howto ${game}`, "no «?» button");
    else {
      await p.click(".btn--howto");
      await p.waitForTimeout(400);
      if (!(await p.locator(".ht-ok").count())) bad(`howto ${game}`, "«?» does not open the card");
      else await p.click(".ht-ok");
    }
  }
  await done(`howto ${game}`);
}
{
  const { p, done } = await open("#/albom", { seed: { "ryzhik-igry:mozaika:progress": { completed: ["m1", "m2", "m3"], stars: { m1: 3, m2: 3, m3: 3 } } } });
  await p.waitForTimeout(500);
  const all = await p.locator(".album__grid .sticker").count();
  const open1 = await p.locator(".album__grid .sticker:not(.is-locked)").count();
  if (all !== 27 || open1 !== 2) bad("album", `${open1} of ${all} open (want 2 of 27 for 9 stars)`);
  await p.screenshot({ path: `${OUT}/extra-album.png` });
  await p.goto(`${BASE}#/`);
  await p.waitForTimeout(800);
  if (!(await p.locator(".home__gift:visible").count())) bad("gift", "no gift on a new day");
  else {
    await p.click(".home__gift");
    await p.waitForTimeout(600);
    await p.screenshot({ path: `${OUT}/extra-gift.png` });
    await p.click(".gift .btn");
    await p.reload();
    await p.waitForTimeout(800);
    if (await p.locator(".home__gift:visible").count()) bad("gift", "shown twice in one day");
  }
  await done("album+gift");
}
{
  const { p, done } = await open("#/roditelyam", { seed: { "ryzhik-igry:seen": { howto: ["mozaika"], tips: ["hint-lamp"] } } });
  const ask = await p.locator(".gate__ask").textContent();
  const words = ["один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"];
  for (const d of ask.split(":")[1].split(",").map((w) => words.indexOf(w.trim()) + 1)) await p.locator(".gate__keys button", { hasText: String(d) }).click();
  await p.locator(".setting", { hasText: "музыка" }).locator(".btn").click();
  if ((await p.evaluate(() => localStorage.getItem("ryzhik-igry:music"))) !== "true") bad("music toggle", "not stored");
  await p.locator(".setting", { hasText: "Показать подсказки" }).locator(".btn").click();
  await p.waitForTimeout(200);
  if (await p.evaluate(() => localStorage.getItem("ryzhik-igry:seen"))) bad("tips reset", "seen still stored");
  const rules = await p.locator("details.rules").count();
  if (rules !== 16) bad("rules", `${rules} games in «Как играть»`);
  await p.locator(".setting", { hasText: "музыка" }).locator(".btn").click();
  await done("parents v4");
}

await browser.close();
console.log(`\n${problems.length} problems`);
