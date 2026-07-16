import { defineConfig, devices } from "@playwright/test";

const viewport = { width: 1000, height: 800 };

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "line",
  outputDir: "test-results",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: "http://127.0.0.1:4173/snake-game/",
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node ./node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173/snake-game/",
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport,
      },
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        viewport,
      },
    },
  ],
});
