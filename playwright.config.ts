import { defineConfig, devices } from '@playwright/test';

import { normalizeBasePath, previewHost, previewOrigin, previewPort } from './tooling.config.ts';

const basePath = normalizeBasePath(process.env['PLAYWRIGHT_BASE_PATH']);
const useExistingBuild = process.env['PLAYWRIGHT_USE_EXISTING_BUILD'] === '1';
const previewArguments = `--host ${previewHost} --port ${previewPort} --strictPort`;
const previewCommand = useExistingBuild
  ? `npm run preview -- ${previewArguments}`
  : `npm run build && npm run preview -- ${previewArguments}`;

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
