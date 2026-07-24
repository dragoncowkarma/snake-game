import { defineConfig, devices, type Project } from '@playwright/test';

import { normalizeBasePath, previewHost, previewOrigin, previewPort } from './tooling.config.ts';

const basePath = normalizeBasePath(process.env['PLAYWRIGHT_BASE_PATH']);
const useExistingBuild = process.env['PLAYWRIGHT_USE_EXISTING_BUILD'] === '1';
const previewArguments = `--host ${previewHost} --port ${previewPort} --strictPort`;
const previewCommand = useExistingBuild
  ? `npm run preview -- ${previewArguments}`
  : `npm run build && npm run preview -- ${previewArguments}`;

// SG-020/SG-023 ENV-R/ENV-VIS matrix support. Defaults preserve the pre-existing
// single chromium/1366x768 project so `npm run verify`/CI are unaffected; set
// PLAYWRIGHT_ENGINES and/or PLAYWRIGHT_VIEWPORTS to run the wider matrix, e.g.
// PLAYWRIGHT_ENGINES=chromium,firefox,webkit PLAYWRIGHT_VIEWPORTS=320x568,390x844,768x1024,1366x768,1920x1080
const ENGINE_DEVICE: Record<string, string> = {
  chromium: 'Desktop Chrome',
  firefox: 'Desktop Firefox',
  webkit: 'Desktop Safari',
};

function parseViewport(spec: string): { width: number; height: number } {
  const match = /^(\d+)x(\d+)$/.exec(spec.trim());
  if (!match) {
    throw new Error(`Invalid PLAYWRIGHT_VIEWPORTS entry: "${spec}" (expected WIDTHxHEIGHT)`);
  }
  return { width: Number(match[1]), height: Number(match[2]) };
}

function buildProjects(): Project[] {
  const engines = (process.env['PLAYWRIGHT_ENGINES'] ?? 'chromium')
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
  const viewports = (process.env['PLAYWRIGHT_VIEWPORTS'] ?? '1366x768')
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  const projects: Project[] = [];
  for (const engine of engines) {
    const deviceName = ENGINE_DEVICE[engine];
    if (deviceName === undefined) {
      throw new Error(
        `Unknown PLAYWRIGHT_ENGINES entry: "${engine}" (expected chromium|firefox|webkit)`,
      );
    }
    for (const viewportSpec of viewports) {
      const viewport = parseViewport(viewportSpec);
      const suffix = engines.length > 1 || viewports.length > 1 ? `-${viewportSpec}` : '';
      projects.push({
        name: `${engine}${suffix}`,
        use: { ...devices[deviceName], viewport },
      });
    }
  }
  return projects;
}

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
  projects: buildProjects(),
});
