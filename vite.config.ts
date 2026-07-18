import { defineConfig } from 'vite';

import { normalizeBasePath, previewHost, previewPort } from './tooling.config.ts';

export default defineConfig({
  base: normalizeBasePath(process.env['PLAYWRIGHT_BASE_PATH']),
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  preview: {
    host: previewHost,
    port: previewPort,
    strictPort: true,
  },
});
