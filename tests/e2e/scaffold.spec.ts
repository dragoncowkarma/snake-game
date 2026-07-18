import { expect, test } from '@playwright/test';

test('boots the production entry without browser or asset failures', async ({ page }) => {
  const browserFailures: string[] = [];
  const localResponsePaths: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      browserFailures.push(`console: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => {
    browserFailures.push(`pageerror: ${error.message}`);
  });
  page.on('requestfailed', (request) => {
    browserFailures.push(
      `requestfailed: ${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`,
    );
  });
  page.on('response', (response) => {
    const responseUrl = new URL(response.url());

    if (responseUrl.origin === 'http://127.0.0.1:4173') {
      localResponsePaths.push(responseUrl.pathname);
    }

    if (response.status() >= 400) {
      browserFailures.push(`http-${response.status()}: ${response.url()}`);
    }
  });

  const documentResponse = await page.goto('./', { waitUntil: 'networkidle' });

  expect(documentResponse?.ok()).toBe(true);
  await expect(page).toHaveTitle('Snake Game');
  await expect(page.getByRole('heading', { name: 'Snake Game' })).toBeVisible();
  await expect(page.locator('#app')).toHaveAttribute('data-app-state', 'ready');
  await expect(page.getByText('Project scaffold ready')).toBeVisible();
  const servedBasePath = new URL(page.url()).pathname;
  expect(localResponsePaths.length).toBeGreaterThan(0);
  expect(localResponsePaths.every((path) => path.startsWith(servedBasePath))).toBe(true);
  expect(browserFailures).toEqual([]);
});
