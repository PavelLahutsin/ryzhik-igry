import { defineConfig } from "vite";

// Production is the GitHub Pages project site /ryzhik-igry/. The dev server
// stays at the root; preview serves the built files, so it needs the same
// base. A future Capacitor build (`--mode android`) uses relative paths.
export default defineConfig(({ command, isPreview, mode }) => ({
  base: mode === "android" ? "./" : command === "build" || isPreview ? "/ryzhik-igry/" : "/",
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
  },
}));
