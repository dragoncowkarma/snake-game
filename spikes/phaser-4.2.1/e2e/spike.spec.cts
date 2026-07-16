import { expect, test, type Page } from "@playwright/test";

interface SpikeProbe {
  phaserVersion: string;
  renderer: string;
  sceneCreated: boolean;
  graphicsDrawn: boolean;
  renderedCells: number;
  keyCount: number;
  lastKey: string;
  resizeCount: number;
  blurCount: number;
  hiddenCount: number;
  visibleCount: number;
  logicalWidth: number;
  logicalHeight: number;
  displayWidth: number;
  displayHeight: number;
  scaleMode: number;
  autoCenter: number;
}

async function readProbe(page: Page): Promise<SpikeProbe> {
  const content = await page.locator("#probe").textContent();

  if (content === null || content.length === 0) {
    throw new Error("Spike probe did not publish state");
  }

  return JSON.parse(content) as SpikeProbe;
}

async function expectCanvasCentered(page: Page): Promise<void> {
  const parentBox = await page.locator("#game-container").boundingBox();
  const canvasBox = await page.locator("#game-container canvas").boundingBox();

  if (parentBox === null || canvasBox === null) {
    throw new Error("Game parent or canvas has no layout box");
  }

  const parentCenterX = parentBox.x + parentBox.width / 2;
  const parentCenterY = parentBox.y + parentBox.height / 2;
  const canvasCenterX = canvasBox.x + canvasBox.width / 2;
  const canvasCenterY = canvasBox.y + canvasBox.height / 2;

  expect(Math.abs(parentCenterX - canvasCenterX)).toBeLessThanOrEqual(1);
  expect(Math.abs(parentCenterY - canvasCenterY)).toBeLessThanOrEqual(1);
}

test("official Phaser 4 APIs pass the production-preview matrix", async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: string[] = [];
  const notFoundResponses: string[] = [];
  const localRequestPaths: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("request", (request) => {
    const url = new URL(request.url());

    if (url.origin === "http://127.0.0.1:4173") {
      localRequestPaths.push(url.pathname);
    }
  });
  page.on("requestfailed", (request) => {
    failedRequests.push(`${request.url()} :: ${request.failure()?.errorText ?? "unknown"}`);
  });
  page.on("response", (response) => {
    if (response.status() === 404) {
      notFoundResponses.push(response.url());
    }
  });

  const response = await page.goto("./", { waitUntil: "networkidle" });

  expect(response?.status()).toBe(200);
  await expect(page.locator("body")).toHaveAttribute("data-ready", "true");
  await expect(page.locator("#game-container canvas")).toBeVisible();

  let probe = await readProbe(page);
  expect(probe).toMatchObject({
    phaserVersion: "4.2.1",
    renderer: "WEBGL",
    sceneCreated: true,
    graphicsDrawn: true,
    renderedCells: 400,
    logicalWidth: 480,
    logicalHeight: 480,
    scaleMode: 3,
    autoCenter: 1,
  });
  expect(probe.displayWidth).toBeGreaterThan(0);
  expect(probe.displayHeight).toBeGreaterThan(0);
  await expectCanvasCentered(page);

  const keyCountBefore = probe.keyCount;
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(async () => (await readProbe(page)).keyCount)
    .toBe(keyCountBefore + 1);
  probe = await readProbe(page);
  expect(probe.lastKey).toBe("ArrowRight");

  const resizeCountBefore = probe.resizeCount;
  const displayWidthBefore = probe.displayWidth;
  await page.setViewportSize({ width: 600, height: 800 });
  await expect
    .poll(async () => (await readProbe(page)).resizeCount)
    .toBeGreaterThan(resizeCountBefore);
  probe = await readProbe(page);
  expect(probe.displayWidth).not.toBe(displayWidthBefore);
  await expectCanvasCentered(page);

  const blurCountBefore = probe.blurCount;
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect
    .poll(async () => (await readProbe(page)).blurCount)
    .toBe(blurCountBefore + 1);

  probe = await readProbe(page);
  const hiddenCountBefore = probe.hiddenCount;
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect
    .poll(async () => (await readProbe(page)).hiddenCount)
    .toBe(hiddenCountBefore + 1);

  probe = await readProbe(page);
  const visibleCountBefore = probe.visibleCount;
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect
    .poll(async () => (await readProbe(page)).visibleCount)
    .toBe(visibleCountBefore + 1);

  expect(localRequestPaths.length).toBeGreaterThan(1);
  expect(localRequestPaths.every((path) => path.startsWith("/snake-game/"))).toBe(true);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(notFoundResponses).toEqual([]);
});
