/**
 * Audit one or more already-built coloring pages (SVG or PNG) without
 * re-running the unit tests. Used by `import-lineart.py --qa`.
 *
 *   node scripts/run-qa-files.mjs path/to/page.svg
 */
import { register } from "node:module";

process.env.REGION_QA_CLI = "1";
await register(new URL("./ts-loader.mjs", import.meta.url).href, import.meta.url);
await import("./regions.ts");
