import { expect, test } from '@playwright/test';
import { setupPageListeners } from '../helpers/e2e-helpers.ts';

test.describe('SG-018 Production Build E2E Suite', () => {
  test('Keyboard Controls and Focus Transitions (AC-U02, AC-U06)', async ({ page }) => {
    const browserFailures: string[] = [];
    setupPageListeners(page, browserFailures);

    await page.goto('./', { waitUntil: 'networkidle' });

    const startButton = page.getByRole('button', { name: 'Start', exact: true });
    const board = page.locator('#board');
    const phase = page.locator('.hud__phase');

    // 1. Establish baseline focus on Start button
    await startButton.focus();
    await expect(startButton).toBeFocused();

    // 2. Start game -> focus moves to board
    await startButton.press('Enter');
    await expect(phase).toHaveText('Ready');
    await expect(board).toBeFocused();

    // 3. Move -> focus stays on board
    await board.press('ArrowRight');
    await expect(phase).toHaveText('Playing');
    await expect(board).toBeFocused();

    // 4. Pause via 'p' -> focus moves to Resume button
    await board.press('p');
    await expect(phase).toHaveText('Paused');
    const resumeButton = page.getByRole('button', { name: 'Resume', exact: true });
    await expect(resumeButton).toBeFocused();

    // 5. Resume via Enter on Resume button -> focus moves to board
    await resumeButton.press('Enter');
    await expect(phase).toHaveText('Playing');
    await expect(board).toBeFocused();

    // 6. Pause via 'Escape' -> focus moves to Resume button
    await board.press('Escape');
    await expect(phase).toHaveText('Paused');
    await expect(resumeButton).toBeFocused();

    // 7. Try pressing 'p' while Resume button is focused -> should NOT resume (only works when board is focused)
    await page.keyboard.press('p');
    await expect(phase).toHaveText('Paused');
    await expect(resumeButton).toBeFocused();

    // Resume via Enter on Resume button
    await resumeButton.press('Enter');
    await expect(phase).toHaveText('Playing');
    await expect(board).toBeFocused();

    // 8. Let it crash -> focus goes to Restart button
    await expect(phase).toHaveText('Game over', { timeout: 15000 });
    const restartButton = page.getByRole('button', { name: 'Restart', exact: true });
    await expect(restartButton).toBeFocused();

    // 9. Return to Menu -> focus goes to Start button
    const menuButton = page.getByRole('button', { name: 'Menu', exact: true });
    await menuButton.click();
    await expect(phase).toHaveText('Menu');
    await expect(startButton).toBeFocused();

    expect(browserFailures).toEqual([]);
  });

  test('Mute sync and keyboard toggle (AC-U02, AC-U05, DF-SG015-01)', async ({ page }) => {
    const browserFailures: string[] = [];
    setupPageListeners(page, browserFailures);

    await page.goto('./', { waitUntil: 'networkidle' });

    const muteButton = page.locator('.mute');
    await expect(muteButton).toHaveAttribute('aria-pressed', 'false');
    await expect(muteButton).toHaveText('Mute');

    // Click mute button -> updates to Unmute
    await muteButton.click();
    await expect(muteButton).toHaveAttribute('aria-pressed', 'true');
    await expect(muteButton).toHaveText('Unmute');

    // Click again -> Mute
    await muteButton.click();
    await expect(muteButton).toHaveAttribute('aria-pressed', 'false');
    await expect(muteButton).toHaveText('Mute');

    // Start game, focus board, press 'm'
    const startButton = page.getByRole('button', { name: 'Start', exact: true });
    await startButton.click();
    const board = page.locator('#board');
    await board.focus();

    await board.press('m');
    await expect(muteButton).toHaveAttribute('aria-pressed', 'true');
    await expect(muteButton).toHaveText('Unmute');

    await board.press('m');
    await expect(muteButton).toHaveAttribute('aria-pressed', 'false');
    await expect(muteButton).toHaveText('Mute');

    expect(browserFailures).toEqual([]);
  });

  test('Touch D-pad controls (AC-U03, AC-U06, AC-U09)', async ({ page }) => {
    const browserFailures: string[] = [];
    setupPageListeners(page, browserFailures);

    await page.goto('./', { waitUntil: 'networkidle' });

    const startButton = page.getByRole('button', { name: 'Start', exact: true });
    await startButton.click();

    const phase = page.locator('.hud__phase');
    await expect(phase).toHaveText('Ready');

    const dpadUp = page.locator('.dpad__button--up');
    const dpadLeft = page.locator('.dpad__button--left');

    // Click Up to start the game
    await dpadUp.click();
    await expect(phase).toHaveText('Playing');

    // Click Left (valid change of direction while moving Up)
    await dpadLeft.click();

    // Verify no browser errors occurred during touch simulation
    expect(browserFailures).toEqual([]);
  });

  test('Lifecycle Pause & Resize (AC-L01, AC-L02, AC-L03)', async ({ page }) => {
    const browserFailures: string[] = [];
    setupPageListeners(page, browserFailures);

    await page.goto('./', { waitUntil: 'networkidle' });

    const startButton = page.getByRole('button', { name: 'Start', exact: true });
    await startButton.click();

    const board = page.locator('#board');
    const phase = page.locator('.hud__phase');

    // Start movement
    await board.press('ArrowRight');

    // 1. Document hidden -> Paused (Triggered immediately to avoid crash race condition)
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(phase).toHaveText('Paused');

    // Resume
    const resumeButton = page.getByRole('button', { name: 'Resume', exact: true });
    await resumeButton.click();

    // 2. Window blur -> Paused (Triggered immediately)
    await page.evaluate(() => {
      window.dispatchEvent(new Event('blur'));
    });
    await expect(phase).toHaveText('Paused');

    // Resume
    await resumeButton.click();

    // 3. Orientation change -> Paused (Triggered immediately after mocking a landscape-to-portrait change)
    await page.evaluate(() => {
      const mockOrientation = {
        type: 'portrait-primary',
        addEventListener: () => {},
        removeEventListener: () => {},
      };
      Object.defineProperty(window.screen, 'orientation', {
        value: mockOrientation,
        configurable: true,
      });
      window.dispatchEvent(new Event('orientationchange'));
    });
    await expect(phase).toHaveText('Paused');

    // Resume
    await resumeButton.click();

    // 4. Ordinary resize -> does not pause
    await page.setViewportSize({ width: 600, height: 600 });
    await expect(phase).toHaveText('Playing');

    expect(browserFailures).toEqual([]);
  });

  test('LocalStorage persistence (AC-R01, AC-R04)', async ({ page }) => {
    const browserFailures: string[] = [];
    setupPageListeners(page, browserFailures);

    // Initial random seed to place food to the right of the head
    const INITIAL_FREE_CELL_COUNT = 397;
    const FOOD_IMMEDIATELY_RIGHT_OF_HEAD_INDEX = 208;
    await page.addInitScript(
      ({ freeCellCount, selectedIndex }) => {
        Math.random = () => (selectedIndex + 0.5) / freeCellCount;
      },
      {
        freeCellCount: INITIAL_FREE_CELL_COUNT,
        selectedIndex: FOOD_IMMEDIATELY_RIGHT_OF_HEAD_INDEX,
      },
    );

    // Load page once to run the init script
    await page.goto('./', { waitUntil: 'networkidle' });
    // Clear localStorage to ensure clean state
    await page.evaluate(() => window.localStorage.clear());
    // Reload so page starts with clean localStorage
    await page.reload({ waitUntil: 'networkidle' });

    const startButton = page.getByRole('button', { name: 'Start', exact: true });
    await startButton.click();

    const board = page.locator('#board');
    await board.press('ArrowRight');

    const phase = page.locator('.hud__phase');
    await expect(phase).toHaveText('Playing');
    await expect(page.locator('.hud').getByText('Score 10')).toBeVisible();

    // Wait for crash
    await expect(phase).toHaveText('Game over', { timeout: 15000 });

    // Verify score is saved in localStorage
    const highNormal = await page.evaluate(() =>
      window.localStorage.getItem('snake-game:v1:high-score:normal'),
    );
    expect(highNormal).toBe('10');

    // Toggle mute
    const muteButton = page.locator('.mute');
    await muteButton.click();
    await expect(muteButton).toHaveAttribute('aria-pressed', 'true');
    const isMuted = await page.evaluate(() => window.localStorage.getItem('snake-game:v1:muted'));
    expect(isMuted).toBe('true');

    // Reload and check persistence
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.locator('.hud').getByText('Best 10')).toBeVisible();
    await expect(page.locator('.mute')).toHaveAttribute('aria-pressed', 'true');

    expect(browserFailures).toEqual([]);
  });

  test('LocalStorage failure fallback (AC-R01, AC-R04)', async ({ page }) => {
    const browserFailures: string[] = [];
    setupPageListeners(page, browserFailures);

    await page.addInitScript(() => {
      // Mock window.localStorage to throw SecurityError when accessed
      const mockStorage = {
        getItem: () => {
          throw new DOMException('SecurityError', 'SecurityError');
        },
        setItem: () => {
          throw new DOMException('SecurityError', 'SecurityError');
        },
        clear: () => {
          throw new DOMException('SecurityError', 'SecurityError');
        },
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockStorage,
        configurable: true,
      });
    });

    await page.goto('./', { waitUntil: 'networkidle' });

    // Verify game boots and start works
    const startButton = page.getByRole('button', { name: 'Start', exact: true });
    await expect(startButton).toBeVisible();
    await startButton.click();

    const phase = page.locator('.hud__phase');
    await expect(phase).toHaveText('Ready');

    const board = page.locator('#board');
    await board.press('ArrowRight');
    await expect(phase).toHaveText('Playing');

    // Let the snake crash to verify crash flow
    await expect(phase).toHaveText('Game over', { timeout: 15000 });

    expect(browserFailures).toEqual([]);
  });

  test('Audio fallback when AudioContext fails (AC-R02)', async ({ page }) => {
    const browserFailures: string[] = [];
    setupPageListeners(page, browserFailures);

    await page.addInitScript(() => {
      // Delete AudioContext to simulate absence of Web Audio API
      Object.defineProperty(window, 'AudioContext', {
        value: undefined,
        configurable: true,
      });
      Object.defineProperty(window, 'webkitAudioContext', {
        value: undefined,
        configurable: true,
      });
    });

    await page.goto('./', { waitUntil: 'networkidle' });

    // Verify game boots and start works
    const startButton = page.getByRole('button', { name: 'Start', exact: true });
    await expect(startButton).toBeVisible();
    await startButton.click();

    const phase = page.locator('.hud__phase');
    await expect(phase).toHaveText('Ready');

    const board = page.locator('#board');
    await board.press('ArrowRight');
    await expect(phase).toHaveText('Playing');

    // Let the snake crash
    await expect(phase).toHaveText('Game over', { timeout: 15000 });

    expect(browserFailures).toEqual([]);
  });
});
