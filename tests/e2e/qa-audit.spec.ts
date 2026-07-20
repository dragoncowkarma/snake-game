import { expect, test } from '@playwright/test';

import { setupPageListeners } from '../helpers/e2e-helpers.ts';

const INITIAL_FREE_CELL_COUNT = 397;

test.describe('SG-015 Independent QA Audit Suite', () => {
  test('Audit 320px layout and scroll behavior (AC-U01, AC-U09)', async ({ page }) => {
    const browserFailures: string[] = [];
    setupPageListeners(page, browserFailures);

    // Set viewport to 320x568 (Narrow viewport)
    await page.setViewportSize({ width: 320, height: 568 });

    const response = await page.goto('./', { waitUntil: 'networkidle' });
    expect(response?.ok()).toBe(true);

    // 1. Verify there is no horizontal scroll on initial load
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

    const scrollX = await page.evaluate(() => window.scrollX);
    expect(scrollX).toBe(0);

    // Check menu elements visibility
    const heading = page.getByRole('heading', { name: 'Snake Game' });
    const startButton = page.getByRole('button', { name: 'Start', exact: true });
    const muteButton = page.getByRole('button', { name: 'Mute', exact: true });
    const difficultyGroup = page.getByRole('group', { name: 'Difficulty' });

    await expect(heading).toBeVisible();
    await expect(startButton).toBeVisible();
    await expect(muteButton).toBeVisible();
    await expect(difficultyGroup).toBeVisible();

    // 2. Click Start and check layout in Ready phase
    await startButton.click();
    const phase = page.locator('.hud__phase');
    await expect(phase).toHaveText('Ready');

    const board = page.locator('#board');
    await expect(board).toBeVisible();
    const dpad = page.locator('.dpad');
    await expect(dpad).toBeVisible();

    // Check that there is still no horizontal scroll in Ready
    const readyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const readyClientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(readyScrollWidth).toBeLessThanOrEqual(readyClientWidth);

    // 3. Move, Pause and check layout in Paused phase
    await board.press('ArrowRight');
    await expect(phase).toHaveText('Playing');

    const pauseButton = page.getByRole('button', { name: 'Pause', exact: true });
    await expect(pauseButton).toBeVisible();
    await pauseButton.click();
    await expect(phase).toHaveText('Paused');

    const resumeButton = page.getByRole('button', { name: 'Resume', exact: true });
    await expect(resumeButton).toBeVisible();

    // Check scroll on Paused phase
    const pausedScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const pausedClientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(pausedScrollWidth).toBeLessThanOrEqual(pausedClientWidth);

    // 4. Resume, trigger Game Over and check layout in gameOver phase
    await resumeButton.click();
    await expect(phase).toHaveText('Playing');
    await expect(phase).toHaveText('Game over', { timeout: 30000 });

    const restartButton = page.getByRole('button', { name: 'Restart', exact: true });
    await expect(restartButton).toBeVisible();

    const terminalScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const terminalClientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(terminalScrollWidth).toBeLessThanOrEqual(terminalClientWidth);

    expect(browserFailures).toEqual([]);
  });

  test('Audit keyboard input, focus transitions, and scroll prevention (AC-U02, AC-U06)', async ({
    page,
  }) => {
    const browserFailures: string[] = [];
    setupPageListeners(page, browserFailures);

    await page.goto('./', { waitUntil: 'networkidle' });

    const startButton = page.getByRole('button', { name: 'Start', exact: true });
    const board = page.locator('#board');
    const phase = page.locator('.hud__phase');

    // Focus starts on Start button
    await startButton.focus();
    await expect(startButton).toBeFocused();

    // Start game -> focus moves to board
    await startButton.click();
    await expect(phase).toHaveText('Ready');
    await expect(board).toBeFocused();

    // Press ArrowRight to play
    await board.press('ArrowRight');
    await expect(phase).toHaveText('Playing');
    await expect(board).toBeFocused();

    // Pause using P key
    await board.press('p');
    await expect(phase).toHaveText('Paused');
    const resumeButton = page.getByRole('button', { name: 'Resume', exact: true });
    await expect(resumeButton).toBeFocused();

    // Resume using Space/Enter on Resume button
    await resumeButton.press('Enter');
    await expect(phase).toHaveText('Playing');
    await expect(board).toBeFocused();

    // Let it crash into wall -> focus goes to Restart
    await expect(phase).toHaveText('Game over', { timeout: 30000 });
    const restartButton = page.getByRole('button', { name: 'Restart', exact: true });
    await expect(restartButton).toBeFocused();

    // Press Enter to restart -> goes back to Ready and focus is on board
    await restartButton.press('Enter');
    await expect(phase).toHaveText('Ready');
    await expect(board).toBeFocused();

    expect(browserFailures).toEqual([]);
  });

  test('Audit keyboard mute shortcut toggle (AC-U02, AC-U05)', async ({ page }) => {
    // DF-SG015-01 (keyboard 'm' did not update the visible mute state) was fixed by
    // SG-017: both the Mute button click and the board's 'm' shortcut now dispatch the
    // same toggleMute command, and the shell's mute display is driven exclusively by
    // the audio adapter's authoritative isMuted value via GameShellHandle.updateMeta.
    const browserFailures: string[] = [];
    setupPageListeners(page, browserFailures);

    await page.goto('./', { waitUntil: 'networkidle' });

    const startButton = page.getByRole('button', { name: 'Start', exact: true });
    // A role+name locator is re-queried live on every assertion; once the toggle
    // changes the button's accessible name from "Mute" to "Unmute" that query would
    // stop matching this same button. `.mute` is the button's stable class (render.ts
    // createShell), so it keeps resolving to the one mute control across the toggle.
    const muteButton = page.locator('.mute');
    const board = page.locator('#board');

    await startButton.click();
    await board.focus();

    // Test mute toggle via M key while board is focused
    await board.press('m');
    await expect(muteButton).toHaveAttribute('aria-pressed', 'true');
    await expect(muteButton).toHaveText('Unmute');

    expect(browserFailures).toEqual([]);
  });

  test('Audit multi-input queueing and direction validation (AC-G03)', async ({ page }) => {
    const browserFailures: string[] = [];
    setupPageListeners(page, browserFailures);

    // Initial food at (9,9) (index 189 in the 397 free cells)
    await page.addInitScript(
      ({ freeCellCount, selectedIndex }) => {
        Math.random = () => (selectedIndex + 0.5) / freeCellCount;
      },
      {
        freeCellCount: INITIAL_FREE_CELL_COUNT,
        selectedIndex: 189,
      },
    );

    await page.goto('./', { waitUntil: 'networkidle' });

    const startButton = page.getByRole('button', { name: 'Start', exact: true });
    const board = page.locator('#board');
    const phase = page.locator('.hud__phase');
    const liveStatus = page.locator('#status');

    await startButton.click();
    await expect(phase).toHaveText('Ready');

    // Queue Up and then Left.
    // The snake is moving right initially. Pressing Up transitions it to playing and queues up.
    // Pressing Left immediately after queues left.
    await board.press('ArrowUp');
    await board.press('ArrowLeft');

    // Wait for the snake to move and eat the food at (9,9) (Tick 2)
    // We expect the score to become 10 and the live status to show "Food eaten"
    await expect(liveStatus).toHaveText('Food eaten. Score 10.', { timeout: 10000 });

    // Wait for the snake to hit the left wall and trigger Game Over
    await expect(phase).toHaveText('Game over', { timeout: 30000 });
    await expect(liveStatus).toHaveText('Game over: wall collision. Score 10.');

    expect(browserFailures).toEqual([]);
  });

  test('Audit 20-time restart reliability (AC-G10, AC-R06)', async ({ page }) => {
    // Increase test timeout specifically for this heavy restart test
    test.setTimeout(120000);

    const browserFailures: string[] = [];
    setupPageListeners(page, browserFailures);

    await page.goto('./', { waitUntil: 'networkidle' });

    const startButton = page.getByRole('button', { name: 'Start', exact: true });
    const board = page.locator('#board');
    const phase = page.locator('.hud__phase');

    await startButton.click();
    await expect(phase).toHaveText('Ready');

    for (let i = 0; i < 20; i++) {
      // Start moving
      await board.press('ArrowRight');
      await expect(phase).toHaveText('Playing');

      // Let it crash
      await expect(phase).toHaveText('Game over', { timeout: 30000 });

      const restartButton = page.getByRole('button', { name: 'Restart', exact: true });
      await expect(restartButton).toBeVisible();
      await restartButton.click();

      await expect(phase).toHaveText('Ready');
      await expect(board).toBeFocused();
    }

    expect(browserFailures).toEqual([]);
  });
});
