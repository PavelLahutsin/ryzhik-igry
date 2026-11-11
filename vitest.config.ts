import { defineConfig } from "vitest/config";

// Only the app's unit tests. scripts/regions.test.ts runs inside `npm run regions`.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
