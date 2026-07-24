import { expect, test } from '@playwright/test';

import { setupPageListeners } from '../helpers/e2e-helpers.ts';

const INITIAL_FREE_CELL_COUNT = 397;

test.describe('SG-020 Wave 4 automated release audit', () => {
  test('prefers-reduced-motion CSS escape hatch actually toggles with the media query (AC-U05)', async ({
    page,
  }) => {
    // The app currently has zero CSS transitions/animations and zero Phaser
    // Tweens (see tests/unit/sg020-audits.test.ts), so a behavioral replay under
    // reducedMotion emulation alone cannot prove the src/styles.css `@media
    // (prefers-reduced-motion: reduce)` rule (lines 265-271) actually does
    // anything — there would be nothing to observe either way. This test
    // exercises the CSS rule itself directly, independent of whether any
    // element currently has a transition, so it holds as new transitions/
    // animations get added in the future.
    // getComputedStyle serializes CSS <time> values differently per engine
    // (Chromium keeps "0.01ms", Firefox normalizes to "0.00001s") even though
    // they're the same duration, so compare the parsed numeric seconds value
    // rather than the raw string.
    const parseCssSeconds = (value: string): number =>
      value.endsWith('ms') ? parseFloat(value) / 1000 : parseFloat(value);

    await page.goto('./', { waitUntil: 'networkidle' });
    const defaultDuration = await page.evaluate(
      () => getComputedStyle(document.body).transitionDuration,
    );

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload({ waitUntil: 'networkidle' });
    const reducedDuration = await page.evaluate(
      () => getComputedStyle(document.body).transitionDuration,
    );

    expect(parseCssSeconds(reducedDuration)).toBeCloseTo(0.00001, 6);
    expect(parseCssSeconds(reducedDuration)).not.toBe(parseCssSeconds(defaultDuration));
  });

  test('Reduced motion preserves outline/text/score collision feedback (AC-U05)', async ({
    page,
  }) => {
    const browserFailures: string[] = [];
    setupPageListeners(page, browserFailures);

    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.addInitScript(
      ({ freeCellCount, selectedIndex }) => {
        Math.random = () => (selectedIndex + 0.5) / freeCellCount;
      },
      { freeCellCount: INITIAL_FREE_CELL_COUNT, selectedIndex: 189 },
    );

    await page.goto('./', { waitUntil: 'networkidle' });

    const startButton = page.getByRole('button', { name: 'Start', exact: true });
    const board = page.locator('#board');
    const phase = page.locator('.hud__phase');
    const liveStatus = page.locator('#status');
    const score = page.locator('.hud__line').first().locator('span').nth(1);

    await startButton.click();
    await expect(phase).toHaveText('Ready');

    await board.press('ArrowUp');
    await board.press('ArrowLeft');

    // Text/score feedback (AC-U05's non-Tween information channel) still updates
    // under prefers-reduced-motion.
    await expect(liveStatus).toHaveText('Food eaten. Score 10.', { timeout: 10000 });
    await expect(score).toHaveText('10');

    await expect(phase).toHaveText('Game over', { timeout: 30000 });
    await expect(liveStatus).toHaveText('Game over: wall collision. Score 10.');

    // The canvas collision outline (src/game/board-renderer.ts) is drawn via
    // scene.time.delayedCall, not a Tween, so its geometry/timing logic is
    // covered by unit tests independent of prefers-reduced-motion; the text/
    // score channel asserted above is the DOM-observable feedback this row
    // additionally requires to keep working when motion is disabled.
    await expect(page.locator('#board canvas')).toBeVisible();

    expect(browserFailures).toEqual([]);
  });
});
