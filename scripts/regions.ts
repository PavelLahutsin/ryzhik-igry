/**
 * Build region maps for every picture and write a QA report.
 *
 *   npm run regions
 *   npm run regions -- path/to/page.svg   # audit one already-built page
 *   npm run regions:import -- lineart.png # PNG line art → regions SVG+PNG
 *
 * Input: src/games/raskraska/assets/pictures/<id>.svg (or .png), or files given
 * on the command line. Same rules as the page:
 * grayscale/alpha ink is thresholded and closed before labelling.
 * Output: <id>.qa.json and <id>.regions.png.
 *
 * A page fails if, on the raw 1280-wide raster, it has necks before gap-closing,
 * leftover crumb regions, too many regions, or too much outline. Live pages that
 * already shipped may be listed in region-qa-allowlist.json; new pages may not.
 * REGION_CLOSING_RADIUS=0|1|2 overrides the default (2); 0 is a negative control.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { PNG } from "pngjs";
import { Resvg } from "@resvg/resvg-js";
import { REGION_OPTIONS, REGION_RASTER_WIDTH, auditRegions, buildRegionLabels } from "../src/games/raskraska/regions.ts";
import { QA_LIMITS, evaluatePage, outlineRatio } from "./region-qa.ts";

const picturesDir = path.resolve("src/games/raskraska/assets/pictures");
const closingRadius = Number(process.env.REGION_CLOSING_RADIUS ?? REGION_OPTIONS.closingRadius) as 0 | 1 | 2;
if (![0, 1, 2].includes(closingRadius)) throw new Error("REGION_CLOSING_RADIUS must be 0, 1 or 2");
const options = { ...REGION_OPTIONS, closingRadius };
let failed = false;

export async function raster(file: string, width: number): Promise<{ width: number; height: number; alpha: Uint8Array; png: PNG }> {
  const ext = path.extname(file).toLowerCase();
  const bytes = await readFile(file);
  const pngBytes = ext === ".svg"
    ? new Resvg(bytes, { fitTo: { mode: "width", value: width } }).render().asPng()
    : bytes;
  const png = PNG.sync.read(Buffer.from(pngBytes));
  const alpha = new Uint8Array(png.width * png.height);
  for (let i = 0, p = 0; i < alpha.length; i++, p += 4) {
    const shade = Math.min(png.data[p], png.data[p + 1], png.data[p + 2]);
    const ink = Math.round((255 - shade) * png.data[p + 3] / 255);
    alpha[i] = ink;
  }
  return { width: png.width, height: png.height, alpha, png };
}

export function writeRegionsPng(file: string, labels: Uint32Array, width: number, height: number): Promise<void> {
  const png = new PNG({ width, height });
  for (let i = 0; i < labels.length; i++) {
    const id = labels[i] ?? 0;
    const p = i * 4;
    png.data[p] = id & 255;
    png.data[p + 1] = (id >> 8) & 255;
    png.data[p + 2] = (id >> 16) & 255;
    png.data[p + 3] = 255;
  }
  return writeFile(file, PNG.sync.write(png));
}

export function scaleAlpha(src: Uint8Array, sw: number, sh: number, dw: number, dh: number): Uint8Array {
  const dst = new Uint8Array(dw * dh);
  for (let y = 0; y < dh; y++) {
    const sy = Math.min(sh - 1, Math.floor(y * sh / dh));
    for (let x = 0; x < dw; x++) {
      const sx = Math.min(sw - 1, Math.floor(x * sw / dw));
      dst[y * dw + x] = src[sy * sw + sx] ?? 0;
    }
  }
  return dst;
}

export async function auditPictureFile(source: string, id: string): Promise<{
  width: number;
  height: number;
  alpha: Uint8Array;
  labels: Uint32Array;
  report: Record<string, unknown>;
  verdict: ReturnType<typeof evaluatePage>;
}> {
  const image = await raster(source, REGION_RASTER_WIDTH);
  const scale = REGION_RASTER_WIDTH / image.width;
  const width = REGION_RASTER_WIDTH;
  const height = Math.max(1, Math.round(image.height * scale));
  const alpha = scale === 1 ? image.alpha : scaleAlpha(image.alpha, image.width, image.height, width, height);
  const labels = buildRegionLabels(alpha, width, height, options);
  const before = auditRegions(alpha, width, height, { ...options, closingRadius: 0 });
  const after = auditRegions(alpha, width, height, options);
  const inkShare = outlineRatio(alpha, options.inkThreshold ?? REGION_OPTIONS.inkThreshold);
  const page = {
    id,
    regionCount: after.regionCount,
    beforeNecks: before.suspectedLeaks.length,
    tinyCount: after.tinyRegions.length,
    outlineRatio: inkShare,
  };
  const verdict = evaluatePage(page);
  const report = {
    ...after,
    options,
    before: { regionCount: before.regionCount, neckCount: before.suspectedLeaks.length },
    neckCount: after.suspectedLeaks.length,
    outlineRatio: inkShare,
    limits: QA_LIMITS,
    allowed: verdict.allowed,
    failures: verdict.failures,
  };
  return { width, height, alpha, labels, report, verdict };
}

// run-regions.mjs imports this file after the tests; walk the pictures folder only then.
const runCli = path.basename(process.argv[1] ?? "").startsWith("run-regions")
  || process.env.REGION_QA_CLI === "1";

if (runCli) {
  const cliFiles = process.argv.slice(2).filter((arg) => {
    if (arg.startsWith("-")) return false;
    const ext = path.extname(arg).toLowerCase();
    return (ext === ".svg" || ext === ".png") && !arg.endsWith(".regions.png");
  });

  type Target = { id: string; source: string; outDir: string };
  const targets: Target[] = [];

  if (cliFiles.length > 0) {
    for (const file of cliFiles) {
      const source = path.resolve(file);
      if (!await fileExists(source)) {
        console.error(`Нет файла: ${source}`);
        failed = true;
        continue;
      }
      const id = path.basename(source, path.extname(source));
      targets.push({ id, source, outDir: path.dirname(source) });
    }
  } else {
    const names = new Set<string>();
    for (const file of await readdir(picturesDir)) {
      if (!file.endsWith(".svg") && !file.endsWith(".png")) continue;
      if (file.endsWith(".regions.png")) continue;
      names.add(path.basename(file, path.extname(file)));
    }
    for (const id of [...names].sort()) {
      const svg = path.join(picturesDir, `${id}.svg`);
      const png = path.join(picturesDir, `${id}.png`);
      const source = await fileExists(svg) ? svg : png;
      if (!await fileExists(source)) continue;
      targets.push({ id, source, outDir: picturesDir });
    }
  }

  if (targets.length === 0) {
    console.log("Нет картинок для проверки");
    if (failed) process.exitCode = 1;
  } else {
    for (const { id, source, outDir } of targets) {
      const { labels, width, height, report, verdict } = await auditPictureFile(source, id);
      const qaPath = path.join(outDir, `${id}.qa.json`);
      const mapPath = path.join(outDir, `${id}.regions.png`);
      await writeFile(qaPath, JSON.stringify(report, null, 2));
      await writeRegionsPng(mapPath, labels, width, height);
      const before = report.before as { regionCount: number; neckCount: number };
      const mark = verdict.ok ? (verdict.allowed ? "разрешено" : "ок") : "брак";
      console.log(
        `${id}: ${mark}; области ${before.regionCount} -> ${report.regionCount}; перешейки ${before.neckCount} -> ${report.neckCount}; мелочь ${ (report.tinyRegions as unknown[]).length }; контур ${Number(report.outlineRatio).toFixed(4)}`,
      );
      for (const failure of verdict.failures) console.log(`  ${failure.message}`);
      if (!verdict.ok) failed = true;
    }
  }

  if (failed) {
    console.error("Region QA failed: a page is over the limits (and not within its allowlist cap).");
    process.exitCode = 1;
  }
}

async function fileExists(file: string): Promise<boolean> {
  try {
    await readFile(file);
    return true;
  } catch {
    return false;
  }
}
