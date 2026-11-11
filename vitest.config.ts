import { defineConfig } from "vitest/config";
import { audioFiles } from "./audio-files.plugin";

// Only the app's unit tests. scripts/regions.test.ts runs inside `npm run regions`.
export default defineConfig({
  plugins: [audioFiles()],
  test: {
    include: ["src/**/*.test.ts"],
  },
});
