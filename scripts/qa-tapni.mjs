/**
 * QA for «Нажми и послушай»: tab size and highlight, the «Игрушки» rows
 * (≥16 px apart, words not wider than their toy), the idle sway, and that a
 * first tap really plays a WebAudio sound and a fast second tap cuts the first.
 *
 *   npx vite &   # http://127.0.0.1:5173/
 *   node scripts/qa-tapni.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.QA_BASE ?? "http://127.0.0.1:5173/";
const VIEWPORTS = (process.env.QA_VIEWPORTS ?? "360x640,390x844,844x390,768x1024").split(",");
const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
let bad = 0;
const fail = (vp, msg) => {
  bad++;
  console.log(`✗ ${vp}: ${msg}`);
};
for (const vp of VIEWPORTS) {
  const [w, h] = vp.split("x").map(Number);
  const page = await browser.newPage({ viewport: { width: w, height: h }, hasTouch: true });
  await page.addInitScript(() => {
    const stats = { started: 0, cuts: 0, states: [] };
    window.__snd = stats;
    const Ctx = window.AudioContext;
    const os = OscillatorNode.prototype.start;
    OscillatorNode.prototype.start = function (...a) {
      stats.started++;
      return os.apply(this, a);
    };
    const bs = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...a) {
      stats.started++;
      return bs.apply(this, a);
    };
    const st = AudioParam.prototype.setTargetAtTime;
    AudioParam.prototype.setTargetAtTime = function (v, ...a) {
      if (v === 0) stats.cuts++;
      return st.call(this, v, ...a);
    };
    window.AudioContext = class extends Ctx {
      constructor(...a) {
        super(...a);
        window.__ctx = this;
      }
    };
  });
  await page.goto(`${BASE}#/tapni/`);
  await page.waitForSelector(".tp-tab");
  await page.waitForTimeout(400);
  // The «Как играть» card opens on the first visit.
  if (await page.$(".ht-ok")) {
    await page.click(".ht-ok");
    await page.waitForTimeout(400);
  }
  const tabs = await page.$$eval(".tp-tab", (ns) => ns.map((n) => ({ w: n.getBoundingClientRect().width, h: n.getBoundingClientRect().height, on: n.classList.contains("is-on"), bg: getComputedStyle(n).backgroundColor })));
  if (tabs.some((t) => Math.min(t.w, t.h) < 52)) fail(vp, `scene tab smaller than 52 px: ${JSON.stringify(tabs.map((t) => [Math.round(t.w), Math.round(t.h)]))}`);
  if (tabs.filter((t) => t.on).length !== 1 || tabs.find((t) => t.on).bg === tabs.find((t) => !t.on).bg) fail(vp, "active tab not highlighted");
  const idle = await page.$eval(".tp-spot .toy__art", (n) => getComputedStyle(n).animationName);
  if (idle !== "toy-idle") fail(vp, `no idle sway (${idle})`);
  // Sound: the very first tap plays, a quick second tap cuts the first.
  await page.locator(".tp-spot").first().tap();
  await page.waitForTimeout(300);
  const s1 = await page.evaluate(() => ({ state: window.__ctx?.state, started: window.__snd.started }));
  if (s1.state !== "running" || s1.started === 0) fail(vp, `first tap is silent (${JSON.stringify(s1)})`);
  const cutsBefore = await page.evaluate(() => window.__snd.cuts);
  await page.locator(".tp-spot").nth(1).tap();
  await page.locator(".tp-spot").nth(2).tap();
  await page.waitForTimeout(150);
  const cuts = (await page.evaluate(() => window.__snd.cuts)) - cutsBefore;
  if (cuts < 2) fail(vp, `fast taps do not cut the previous sound (cuts ${cuts})`);
  // «Игрушки»: rows apart, words inside their toy.
  await page.locator(".tp-tab").last().tap();
  await page.waitForSelector(".tp-toys .toy");
  const g = await page.$$eval(".tp-toys .toy", (ns) => {
    const rows = new Map();
    const words = [];
    for (const n of ns) {
      const r = n.getBoundingClientRect();
      const k = Math.round(r.top);
      rows.set(k, Math.max(rows.get(k) ?? 0, r.bottom));
      const wd = n.querySelector(".toy__word");
      wd.style.opacity = "1";
      words.push({ word: wd.textContent, w: wd.getBoundingClientRect().width, toy: r.width });
    }
    const tops = [...rows.keys()].sort((a, b) => a - b);
    const gaps = tops.slice(1).map((t, i) => t - rows.get(tops[i]));
    return { gaps, words };
  });
  if (g.gaps.some((x) => x < 16)) fail(vp, `rows only ${g.gaps.map(Math.round).join("/")} px apart`);
  for (const x of g.words) if (x.w > x.toy + 0.5) fail(vp, `word «${x.word}» ${Math.round(x.w)} px wider than its toy ${Math.round(x.toy)} px`);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  if (wide) fail(vp, "page wider than the screen");
  console.log(`${vp}: tabs ${tabs.map((t) => Math.round(t.h)).join("/")} px, rows ${g.gaps.map(Math.round).join("/")} px apart, sounds ${s1.started}, cuts ${cuts}`);
  await page.close();
}
await browser.close();
console.log(bad ? `${bad} problem(s)` : "tapni: all good");
process.exit(bad ? 1 : 0);
