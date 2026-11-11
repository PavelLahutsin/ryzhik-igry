// Dev server for the QA scripts: no hot reload, so edits don't restart a run.
import base from "../vite.config.ts";
const cfg = typeof base === "function" ? base({ command: "serve", mode: "development" }) : base;
export default { ...cfg, server: { ...(cfg.server ?? {}), hmr: false, watch: null, port: 5174, strictPort: true } };
