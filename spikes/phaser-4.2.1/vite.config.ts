import { defineConfig } from "vite";

export default defineConfig({
  base: "/snake-game/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
  },
});
