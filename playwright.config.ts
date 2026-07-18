import { defineConfig, devices } from '@playwright/test';

const previewOrigin = 'http://127.0.0.1:4173';

function normalizeBasePath(value: string | undefined): string {
  const path = value?.trim() ?? '';

  if (path === '' || path === '/') {
    return '/';
  }

  return `/${path.replace(/^\/+|\/+$/g, '')}/`;
}

const basePath = normalizeBasePath(process.env['PLAYWRIGHT_BASE_PATH']);
const useExistingBuild = process.env['PLAYWRIGHT_USE_EXISTING_BUILD'] === '1';
const previewCommand = useExistingBuild
  ? 'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort'
  : 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['line'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  outputDir: 'test-results',
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: `${previewOrigin}${basePath}`,
    headless: true,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: previewCommand,
    url: `${previewOrigin}${basePath}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 },
      },
    },
  ],
});
