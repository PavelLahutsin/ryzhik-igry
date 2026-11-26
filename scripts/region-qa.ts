/**
 * Stricter coloring-page QA. Used by `npm run regions` and the line-art importer.
 * Limits apply to the 1280-wide raster the game uses. A page may be listed in
 * region-qa-allowlist.json only if its artwork is already on the live site and
 * must not be redrawn yet; new pages have to pass with no entry.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Same cutoff as auditRegionLabels (area < 160 at 1280 px width). */
export const TINY_AREA = 160;

export const QA_LIMITS = {
  maxBeforeNecks: 0,
  maxTinyRegions: 0,
  /** After gap-closing, including the background. New pages aim for 12–30. */
  maxRegionCount: 50,
  /** Share of ink pixels. Live pages are 0.056–0.095; busy traces went to 0.16. */
  maxOutlineRatio: 0.12,
} as const;

export type AllowEntry = {
  reason: string;
  maxBeforeNecks?: number;
  maxTinyRegions?: number;
  maxRegionCount?: number;
  maxOutlineRatio?: number;
};

export type Allowlist = Record<string, AllowEntry>;

const allowlistPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "region-qa-allowlist.json");

export const REGION_QA_ALLOWLIST = JSON.parse(readFileSync(allowlistPath, "utf8")) as Allowlist;

export type PageQaInput = {
  id: string;
  regionCount: number;
  beforeNecks: number;
  tinyCount: number;
  outlineRatio: number;
};

export type QaFailure = {
  code: "raw_necks" | "tiny_regions" | "too_many_regions" | "too_much_outline";
  message: string;
  value: number;
  limit: number;
};

export type QaVerdict = {
  ok: boolean;
  allowed: boolean;
  failures: QaFailure[];
};

function cap(allow: AllowEntry | undefined, key: keyof typeof QA_LIMITS): number {
  if (!allow) return QA_LIMITS[key];
  const listed = allow[key];
  return listed === undefined ? QA_LIMITS[key] : listed;
}

export function evaluatePage(page: PageQaInput, allowlist: Allowlist = REGION_QA_ALLOWLIST): QaVerdict {
  const allow = allowlist[page.id];
  if (allow && !allow.reason.trim()) {
    throw new Error(`region-qa allowlist entry "${page.id}" needs a reason`);
  }
  const failures: QaFailure[] = [];
  const necksLimit = cap(allow, "maxBeforeNecks");
  if (page.beforeNecks > necksLimit) {
    failures.push({
      code: "raw_necks",
      message: `перешейки до закрытия щелей: ${page.beforeNecks} (больше ${necksLimit})`,
      value: page.beforeNecks,
      limit: necksLimit,
    });
  }
  const tinyLimit = cap(allow, "maxTinyRegions");
  if (page.tinyCount > tinyLimit) {
    failures.push({
      code: "tiny_regions",
      message: `мелких областей (<${TINY_AREA} px): ${page.tinyCount} (больше ${tinyLimit})`,
      value: page.tinyCount,
      limit: tinyLimit,
    });
  }
  const regionLimit = cap(allow, "maxRegionCount");
  if (page.regionCount > regionLimit) {
    failures.push({
      code: "too_many_regions",
      message: `областей: ${page.regionCount} (больше ${regionLimit})`,
      value: page.regionCount,
      limit: regionLimit,
    });
  }
  const outlineLimit = cap(allow, "maxOutlineRatio");
  if (page.outlineRatio > outlineLimit + 1e-9) {
    failures.push({
      code: "too_much_outline",
      message: `доля контура: ${page.outlineRatio.toFixed(4)} (больше ${outlineLimit})`,
      value: page.outlineRatio,
      limit: outlineLimit,
    });
  }
  return { ok: failures.length === 0, allowed: Boolean(allow), failures };
}

export function outlineRatio(alpha: Uint8Array, inkThreshold = 72): number {
  if (alpha.length === 0) return 0;
  let ink = 0;
  for (let i = 0; i < alpha.length; i++) if ((alpha[i] ?? 0) > inkThreshold) ink++;
  return ink / alpha.length;
}
