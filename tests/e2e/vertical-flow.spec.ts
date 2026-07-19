import { expect, test } from '@playwright/test';

import { normalizeBasePath } from '../../tooling.config.ts';
import { setupPageListeners } from '../helpers/e2e-helpers.ts';

const INITIAL_FREE_CELL_COUNT = 397;
const FOOD_IMMEDIATELY_RIGHT_OF_HEAD_INDEX = 208;

test('plays start, move, eat, wall death, and restart through production wiring', async ({
  page,
}) => {
  const browserFailures: string[] = [];

  setupPageListeners(page, browserFailures);

  // Index 208 in the accepted row-major free-cell order is (11,10), immediately
  // right of the initial head. Overriding the injected browser entropy before the
  // app loads keeps this production-path test deterministic without a product hook.
  await page.addInitScript(
    ({ freeCellCount, selectedIndex }) => {
      Math.random = () => (selectedIndex + 0.5) / freeCellCount;
    },
    {
      freeCellCount: INITIAL_FREE_CELL_COUNT,
      selectedIndex: FOOD_IMMEDIATELY_RIGHT_OF_HEAD_INDEX,
    },
  );

  const documentResponse = await page.goto('./', { waitUntil: 'networkidle' });
  const expectedBasePath = normalizeBasePath(process.env['PLAYWRIGHT_BASE_PATH']);
  const phase = page.locator('.hud__phase');
  const board = page.locator('#board');
  const canvas = board.locator('canvas');
  const liveStatus = page.locator('#status');

  expect(documentResponse?.ok()).toBe(true);
  expect(new URL(page.url()).pathname).toBe(expectedBasePath);
  await expect(phase).toHaveText('Menu');

  await page.getByRole('button', { name: 'Start', exact: true }).click();

  await expect(phase).toHaveText('Ready');
  await expect(board).toBeVisible();
  await expect(board).toBeFocused();
  await expect(canvas).toHaveCount(1);
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute('width', '480');
  await expect(canvas).toHaveAttribute('height', '480');

  await board.press('ArrowRight');

  await expect(phase).toHaveText('Playing');
  await expect(page.getByText('Score 10', { exact: true })).toBeVisible();
  await expect(liveStatus).toHaveText('Food eaten. Score 10.');

  await expect(phase).toHaveText('Game over');
  await expect(liveStatus).toHaveText('Game over: wall collision. Score 10.');
  await expect(
    page.getByText('Game over (wall collision). Score 10.', { exact: true }),
  ).toBeVisible();

  const restart = page.getByRole('button', { name: 'Restart', exact: true });

  await expect(restart).toBeFocused();
  await restart.click();

  await expect(phase).toHaveText('Ready');
  await expect(page.getByText('Score 0', { exact: true })).toBeVisible();
  await expect(liveStatus).toHaveText('Ready. Press a direction to start.');
  await expect(board).toBeFocused();
  await expect(canvas).toHaveCount(1);
  await expect(canvas).toBeVisible();
  expect(browserFailures).toEqual([]);
});
