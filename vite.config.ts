import { defineConfig } from 'vite';

function normalizeBasePath(value: string | undefined): string {
  const path = value?.trim() ?? '';

  if (path === '' || path === '/') {
    return '/';
  }

  return `/${path.replace(/^\/+|\/+$/g, '')}/`;
}

export default defineConfig({
  base: normalizeBasePath(process.env['PLAYWRIGHT_BASE_PATH']),
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
  },
});
