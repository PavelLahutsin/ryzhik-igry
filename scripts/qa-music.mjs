/**
 * QA for recorded music on the built site: from a fresh profile, the first tap
 * on the menu starts m01; a game plays its own track; back on the menu m01
 * plays again; switching music off in «Родителям» stops it.
 *
 *   npm run build && npx vite preview --port 4173 &
 *   node scripts/qa-music.mjs        # QA_BASE=http://127.0.0.1:4173/ryzhik-igry/
 */
import { chromium } from "playwright";

const BASE = process.env.QA_BASE ?? "http://127.0.0.1:4173/ryzhik-igry/";
const browser = await chromium.launch(); // default autoplay policy: a gesture is needed
let bad = 0;
const check = (ok, msg) => {
  console.log(`${ok ? "✓" : "✗"} ${msg}`);
  if (!ok) bad++;
};
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
await page.addInitScript(() => {
  window.__media = new Set();
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    window.__media.add(this);
    return play.call(this);
  };
});
const playing = () =>
  page.evaluate(() => [...window.__media].filter((a) => !a.paused && !a.ended && a.loop).map((a) => a.src.split("/").pop()));
const settle = () => page.waitForTimeout(900);

await page.goto(BASE);
await page.waitForSelector(".game-tile");
await settle();
check((await playing()).length === 0, `nothing plays before a tap (${await playing()})`);
// A tap on an empty part of the menu (the heading), not a tile.
await page.mouse.click(195, 30);
await settle();
let now = await playing();
check(now.length === 1 && now[0] === "m01.mp3", `first tap on the menu starts m01 (${now})`);
const t1 = await page.evaluate(() => [...window.__media].find((a) => !a.paused && a.loop)?.currentTime ?? 0);
await page.waitForTimeout(700);
const t2 = await page.evaluate(() => [...window.__media].find((a) => !a.paused && a.loop)?.currentTime ?? 0);
check(t2 > t1, `m01 really runs (${t1.toFixed(2)} → ${t2.toFixed(2)} s)`);

await page.goto(`${BASE}#/mozaika/`);
await settle();
now = await playing();
check(now.length === 1 && now[0] === "m03.mp3", `«Мозаика» plays m03 (${now})`);
await page.goBack();
await page.waitForSelector(".game-tile");
await settle();
now = await playing();
check(now.length === 1 && now[0] === "m01.mp3", `back on the menu m01 again (${now})`);

// Opened straight on a game, then the first tap there.
const p2 = await browser.newPage({ viewport: { width: 390, height: 844 } });
await p2.addInitScript(() => {
  window.__media = new Set();
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    window.__media.add(this);
    return play.call(this);
  };
});
await p2.goto(`${BASE}#/tapni/`);
await p2.waitForTimeout(900);
await p2.mouse.click(195, 400);
await p2.waitForTimeout(900);
const p2now = await p2.evaluate(() => [...window.__media].filter((a) => !a.paused && a.loop).map((a) => a.src.split("/").pop()));
check(p2now.includes("m13.mp3"), `opened on «Нажми и послушай», the first tap starts m13 (${p2now})`);

// Music off in «Родителям» (stored as false): the menu stays quiet.
await page.evaluate(() => localStorage.setItem("ryzhik-igry:music", "false"));
await page.goto(BASE);
await page.reload();
await page.waitForSelector(".game-tile");
await page.mouse.click(195, 30);
await settle();
check((await playing()).length === 0, `music off in «Родителям» stays off (${await playing()})`);

await browser.close();
console.log(bad ? `${bad} problem(s)` : "music: all good");
process.exit(bad ? 1 : 0);
