/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

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
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/domain/**'],
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 90,
      },
    },
  },
});
