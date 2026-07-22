/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call */
import { expect, test } from '@playwright/test';

interface SetupOptions {
  enableSeedHook?: boolean;
}

async function setupEnhancedPageListeners(
  page: any,
  failures: string[],
  baseURL: string | undefined,
  options: SetupOptions = {},
) {
  let routeInjectedAssetCount = 0;

  // Strip caching headers (If-None-Match, If-Modified-Since) to force 200 OK responses.
  // When options.enableSeedHook is true, inject seed hook into BrowserRandomSource class inside bootstrap chunk.
  await page.route('**/*', async (route: any) => {
    const request = route.request();
    const url = request.url();

    if (options.enableSeedHook && url.includes('bootstrap') && url.endsWith('.js')) {
      const response = await route.fetch();
      let text = await response.text();

      // Minification-resilient regex matching: <var> = class { nextInt(<param>) { return Math.floor(Math.random() * <param>); } }
      const randomSourceRegex =
        /([a-zA-Z0-9_$]+)\s*=\s*class\s*\{\s*nextInt\s*\(\s*([a-zA-Z0-9_$]+)\s*\)\s*\{\s*return\s+Math\.floor\s*\(\s*Math\.random\s*\(\s*\)\s*\*\s*\2\s*\)\s*;?\s*\}\s*\}/;

      if (randomSourceRegex.test(text)) {
        text = text.replace(
          randomSourceRegex,
          (_match: string, className: string, paramName: string) => {
            routeInjectedAssetCount++;
            return `${className}=class{nextInt(${paramName}){if(typeof window!=="undefined"){window.__seedHookInjected=true;}return window.injectSeed ? window.injectSeed(${paramName}) : Math.floor(Math.random()*${paramName})}}`;
          },
        );

        await route.fulfill({
          status: response.status(),
          contentType: 'application/javascript',
          body: text,
        });
        return;
      }
    }

    const headers = { ...request.headers() };
    delete headers['if-none-match'];
    delete headers['if-modified-since'];
    await route.continue({ headers });
  });

  // 1. Console errors
  page.on('console', (msg: any) => {
    if (msg.type() === 'error') {
      failures.push(`Console Error: ${msg.text()}`);
    }
  });

  // 2. Uncaught exceptions (pageerror)
  page.on('pageerror', (err: Error) => {
    failures.push(`Page Error: ${err.message}`);
  });

  // 3. Request failures
  page.on('requestfailed', (req: any) => {
    failures.push(`Request Failed: ${req.url()} - ${req.failure()?.errorText}`);
  });

  // 4. Strict HTTP response check: only 200-299 allowed (AC-R05)
  page.on('response', (res: any) => {
    const status = res.status();
    const url = res.url();
    if (status !== 0 && (status < 200 || status > 299)) {
      failures.push(`Non-OK Response: ${url} returned status ${status}`);
    }
  });

  // 5. Precise Cross-origin origin verification (AC-R05)
  page.on('request', (req: any) => {
    const url = req.url();
    if (url.startsWith('http')) {
      try {
        const parsed = new URL(url);
        const baseParsed = new URL(baseURL || 'http://localhost:4173');
        if (parsed.origin !== baseParsed.origin) {
          failures.push(`Forbidden Cross-Origin Request: ${url}`);
        }
      } catch {
        failures.push(`Invalid URL Request: ${url}`);
      }
    }
  });

  // 6. Early unhandled rejection listener installed before document loading (AC-R05)
  await page.addInitScript(() => {
    window.addEventListener('unhandledrejection', (event) => {
      (window as any).browserFailures = (window as any).browserFailures || [];
      (window as any).browserFailures.push(`Unhandled Rejection: ${event.reason}`);
    });
  });

  return {
    async verifySeedHook() {
      if (options.enableSeedHook) {
        if (routeInjectedAssetCount === 0) {
          failures.push(
            'SeedHook Injection Error: Route interception failed to match BrowserRandomSource JS asset regex in bootstrap chunk.',
          );
        } else {
          // Validate checking window.__seedHookInjected on current active DOM window
          const isExecuted = await page.evaluate(() => (window as any).__seedHookInjected === true);
          if (!isExecuted) {
            failures.push(
              'SeedHook Execution Error: Injected seed hook was not executed on current page instance.',
            );
          }
        }
      }
    },
  };
}

test.describe('SG-018 Production Build E2E Suite', () => {
  test('Keyboard Controls, WASD, Space, and preventDefault scroll prevention (AC-U02, AC-U06)', async ({
    page,
    baseURL,
  }) => {
    const browserFailures: string[] = [];
    await setupEnhancedPageListeners(page, browserFailures, baseURL);

    await page.goto('./', { waitUntil: 'networkidle' });

    const startButton = page.getByRole('button', { name: 'Start', exact: true });
    const board = page.locator('#board');
    const phase = page.locator('.hud__phase');

    /* eslint-disable @typescript-eslint/unbound-method */
    await page.evaluate(() => {
      (window as any).lastEventPrevented = false;
      const originalPreventDefault = Event.prototype.preventDefault;
      Event.prototype.preventDefault = function (...args: any[]) {
        (window as any).lastEventPrevented = true;
        originalPreventDefault.apply(this, args as unknown as []);
      };
    });
    /* eslint-enable @typescript-eslint/unbound-method */

    // Make the page scrollable (5000px height) to physically verify scroll blocks
    await page.evaluate(() => {
      document.body.style.height = '5000px';
      window.scrollTo(0, 0);
      (window as any).scrollEventCount = 0;
      window.addEventListener(
        'scroll',
        () => {
          (window as any).scrollEventCount++;
        },
        { passive: true },
      );
    });

    // Wait until initial scroll to 0 settles
    await expect
      .poll(async () => {
        return await page.evaluate(() => window.scrollY);
      })
      .toBe(0);

    // 1. Click background to focus document scroll viewport -> Press ArrowDown -> scrolls (AC-U06)
    let startCount = await page.evaluate(() => (window as any).scrollEventCount);
    await page.mouse.click(10, 10);
    await page.keyboard.press('ArrowDown');

    // Event-driven scroll verification (replaces waitForTimeout)
    await expect
      .poll(async () => {
        return await page.evaluate(() => (window as any).scrollEventCount);
      })
      .toBeGreaterThan(startCount);

    let scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);

    let lastPrevented = await page.evaluate(() => {
      const val = (window as any).lastEventPrevented;
      (window as any).lastEventPrevented = false;
      return val;
    });
    expect(lastPrevented).toBe(false);

    // 2. Focus document -> Press Space -> default not prevented -> page scrolls (AC-U06)
    startCount = await page.evaluate(() => (window as any).scrollEventCount);
    await page.mouse.click(10, 10);
    await page.keyboard.press('Space');

    await expect
      .poll(async () => {
        return await page.evaluate(() => (window as any).scrollEventCount);
      })
      .toBeGreaterThan(startCount);

    scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);

    // 3. Start button focused -> Press Space -> triggers click -> Ready
    await startButton.focus();
    await page.keyboard.press('Space');
    await expect(phase).toHaveText('Ready');
    await expect(board).toBeFocused();

    // 4. Board focused -> Press invalid game key 'x' -> default not prevented
    await page.keyboard.press('x');
    lastPrevented = await page.evaluate(() => {
      const val = (window as any).lastEventPrevented;
      (window as any).lastEventPrevented = false;
      return val;
    });
    expect(lastPrevented).toBe(false);

    // 5. Board focused -> Press WASD key 'd' (right) -> starts playing, default prevented
    await page.keyboard.press('d');
    await expect(phase).toHaveText('Playing');
    await expect(board).toBeFocused();

    // Press ArrowDown (game key, perpendicular to Right) -> should NOT scroll (default prevented)
    startCount = await page.evaluate(() => (window as any).scrollEventCount);
    await page.keyboard.press('ArrowDown');

    // Assert scroll count remains unchanged after ArrowDown (zero timeout)
    const endCount = await page.evaluate(() => (window as any).scrollEventCount);
    expect(endCount).toBe(startCount); // scroll blocked!

    lastPrevented = await page.evaluate(() => {
      const val = (window as any).lastEventPrevented;
      (window as any).lastEventPrevented = false;
      return val;
    });
    expect(lastPrevented).toBe(true); // ArrowDown was prevented!

    // Press Space (inside board, not a game key) -> default not prevented (AC-U06)
    await page.keyboard.press('Space');
    lastPrevented = await page.evaluate(() => {
      const val = (window as any).lastEventPrevented;
      (window as any).lastEventPrevented = false;
      return val;
    });
    expect(lastPrevented).toBe(false); // Space was NOT prevented!

    // 6. Board focused -> Press WASD key 'w' (up) -> changes direction, default prevented
    await page.keyboard.press('w');
    lastPrevented = await page.evaluate(() => {
      const val = (window as any).lastEventPrevented;
      (window as any).lastEventPrevented = false;
      return val;
    });
    expect(lastPrevented).toBe(true);

    // 7. Pause via 'p' -> focus moves to Resume button
    await board.press('p');
    await expect(phase).toHaveText('Paused');
    const resumeButton = page.getByRole('button', { name: 'Resume', exact: true });
    await expect(resumeButton).toBeFocused();

    // 8. Try pressing 'p' while Resume button is focused -> should NOT resume (ignored outside board)
    await page.keyboard.press('p');
    await expect(phase).toHaveText('Paused');
    await expect(resumeButton).toBeFocused();

    // 9. Resume via Space on Resume button -> focus moves to board
    await page.keyboard.press('Space');
    await expect(phase).toHaveText('Playing');
    await expect(board).toBeFocused();

    // 10. Let it crash -> focus goes to Restart button
    await expect(phase).toHaveText('Game over', { timeout: 15000 });
    const restartButton = page.getByRole('button', { name: 'Restart', exact: true });
    await expect(restartButton).toBeFocused();

    // 11. Return to Menu -> focus goes to Start button
    const menuButton = page.getByRole('button', { name: 'Menu', exact: true });
    await menuButton.click();
    await expect(phase).toHaveText('Menu');
    await expect(startButton).toBeFocused();

    const pageFailures = await page.evaluate(() => (window as any).browserFailures || []);
    browserFailures.push(...pageFailures);
    expect(browserFailures).toEqual([]);
  });

  test('Mute sync and keyboard toggle (AC-U02, AC-U05, DF-SG015-01)', async ({ page, baseURL }) => {
    const browserFailures: string[] = [];
    await setupEnhancedPageListeners(page, browserFailures, baseURL);

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

    const pageFailures = await page.evaluate(() => (window as any).browserFailures || []);
    browserFailures.push(...pageFailures);
    expect(browserFailures).toEqual([]);
  });

  test('Touch D-pad controls with real touch emulation (AC-U03, AC-U06, AC-U09)', async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      hasTouch: true,
      ...(baseURL ? { baseURL } : {}),
    });
    const page = await context.newPage();
    const browserFailures: string[] = [];
    const auditor = await setupEnhancedPageListeners(page, browserFailures, baseURL, {
      enableSeedHook: true,
    });

    // Initial random seed to place food at (10,9) then (10,8) (straight Up path) to avoid tick timing races
    await page.addInitScript(() => {
      (window as any).injectSeed = (upperExclusive: number) => {
        if (upperExclusive === 397) {
          return 190; // (10, 9)
        }
        if (upperExclusive === 396) {
          return 170; // (10, 8)
        }
        if (upperExclusive === 395) {
          return 0; // (0, 0) - keeps subsequent food far away
        }
        return Math.floor(Math.random() * upperExclusive);
      };
    });

    await page.goto('./', { waitUntil: 'networkidle' });

    const startButton = page.getByRole('button', { name: 'Start', exact: true });
    const board = page.locator('#board');
    await startButton.tap(); // touch tap

    const phase = page.locator('.hud__phase');
    await expect(phase).toHaveText('Ready');
    await expect(board).toBeFocused();

    const dpadUp = page.locator('.dpad__button--up');
    const dpadLeft = page.locator('.dpad__button--left');

    // Tap Up to start the game moving Up
    await dpadUp.tap();
    await expect(phase).toHaveText('Playing');
    await expect(board).toBeFocused(); // focus preservation

    // Verify seed hook execution once food has been spawned
    await auditor.verifySeedHook();

    // Wait for the snake to eat both foods along the Up path (reaches score 20)
    const liveStatus = page.locator('#status');
    await expect(liveStatus).toHaveText('Food eaten. Score 20.', { timeout: 15000 });

    // Now tap Left to change direction
    await dpadLeft.tap();
    await expect(dpadLeft).toBeFocused(); // focus shifts cleanly to the tapped button

    // Wait for the game over crash (left wall collision)
    await expect(phase).toHaveText('Game over', { timeout: 15000 });
    await expect(liveStatus).toHaveText('Game over: wall collision. Score 20.');

    const pageFailures = await page.evaluate(() => (window as any).browserFailures || []);
    await context.close();
    browserFailures.push(...pageFailures);
    expect(browserFailures).toEqual([]);
  });

  test('Lifecycle Pause & Viewport Resize State Preservation (AC-L01, AC-L02, AC-L03)', async ({
    page,
    baseURL,
  }) => {
    const browserFailures: string[] = [];
    const auditor = await setupEnhancedPageListeners(page, browserFailures, baseURL, {
      enableSeedHook: true,
    });

    // Start with a narrow mobile viewport 320x568
    await page.setViewportSize({ width: 320, height: 568 });

    // Seed first food at (11, 10) (immediately right of head) and second food at (11, 5) (on the Up turn path)
    await page.addInitScript(() => {
      (window as any).injectSeed = (upperExclusive: number) => {
        if (upperExclusive === 397) {
          return 208; // (11, 10)
        }
        if (upperExclusive === 396) {
          return 111; // (11, 5)
        }
        return Math.floor(Math.random() * upperExclusive);
      };
    });

    await page.goto('./', { waitUntil: 'networkidle' });

    // 1. Verify that viewport resize during Playing phase does NOT pause the game (AGENTS.md rule: "일반 resize는 pause를 일으키지 않는다.")
    const startButton = page.getByRole('button', { name: 'Start', exact: true });
    await startButton.click();
    const board = page.locator('#board');
    const phase = page.locator('.hud__phase');

    await board.press('ArrowRight');
    await expect(phase).toHaveText('Playing');
    await auditor.verifySeedHook();

    // Resize viewport while Playing
    await page.setViewportSize({ width: 600, height: 600 });
    await expect(phase).toHaveText('Playing');
    await page.setViewportSize({ width: 320, height: 568 });
    await expect(phase).toHaveText('Playing');

    // 2. Reload to run coordinate preservation and other lifecycle pause tests cleanly
    await page.reload({ waitUntil: 'networkidle' });

    // Select Slow difficulty to ensure ticks are 220ms
    const slowRadio = page.getByRole('radio', { name: 'Slow', exact: true });
    await slowRadio.click();
    await startButton.click();

    await board.press('ArrowRight');
    await auditor.verifySeedHook(); // verify seed hook on reloaded page instance

    // Wait for the score to reach 10, meaning the snake took exactly 1 step and consumed the food at (11, 10)
    await expect(page.locator('.hud').getByText('Score 10')).toBeVisible({ timeout: 15000 });

    // 3. Pause immediately via keypress (snake is now stationary at (11, 10))
    await board.press('p');
    await expect(phase).toHaveText('Paused');

    // Viewport resize cycle while Paused -> verify phase remains Paused and coordinates are preserved
    const canvas = board.locator('canvas');
    const originalWidth = await canvas.evaluate((el) => el.clientWidth);

    await page.setViewportSize({ width: 600, height: 600 });
    await expect(canvas).not.toHaveJSProperty('clientWidth', originalWidth);
    await expect(phase).toHaveText('Paused');

    await page.setViewportSize({ width: 320, height: 568 });
    await expect(canvas).toHaveJSProperty('clientWidth', originalWidth);
    await expect(phase).toHaveText('Paused');

    // 4. Resume natively and turn Up using native Playwright keyboard inputs (verifying focus and input flow)
    await board.focus();
    await expect(board).toBeFocused();
    await page.keyboard.press('p');
    await page.keyboard.press('ArrowUp');
    await expect(phase).toHaveText('Playing');

    await expect(page.locator('.hud').getByText('Score 20')).toBeVisible({ timeout: 15000 });

    // 5. Document hidden -> Paused (AC-L01)
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(phase).toHaveText('Paused');

    // Resume
    const resumeButton = page.getByRole('button', { name: 'Resume', exact: true });
    await resumeButton.click();

    // 6. Window blur -> Paused (AC-L01)
    await page.evaluate(() => {
      window.dispatchEvent(new Event('blur'));
    });
    await expect(phase).toHaveText('Paused');

    // Resume
    await resumeButton.click();

    // 7. Screen orientation change -> Paused (AC-L01)
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

    // Resume and let it crash
    await resumeButton.click();
    await expect(phase).toHaveText('Game over', { timeout: 15000 });
    const liveStatus = page.locator('#status');
    await expect(liveStatus).toHaveText('Game over: wall collision. Score 20.');

    const pageFailures = await page.evaluate(() => (window as any).browserFailures || []);
    browserFailures.push(...pageFailures);
    expect(browserFailures).toEqual([]);
  });

  test('LocalStorage persistence of slow and normal difficulties (AC-R01, AC-R04)', async ({
    page,
    baseURL,
  }) => {
    const browserFailures: string[] = [];
    const auditor = await setupEnhancedPageListeners(page, browserFailures, baseURL, {
      enableSeedHook: true,
    });

    // Seed first food immediately right of the head to crash deterministically
    await page.addInitScript(() => {
      (window as any).injectSeed = (upperExclusive: number) => {
        if (upperExclusive === 397) {
          return 208; // (11, 10) - food 1
        }
        if (upperExclusive === 396) {
          return 0; // (0, 0) - food 2 far away in corner so score stays 10
        }
        return Math.floor(Math.random() * upperExclusive);
      };
    });

    // Load page once to run the init script
    await page.goto('./', { waitUntil: 'networkidle' });

    // Clear localStorage to ensure clean state
    await page.evaluate(() => window.localStorage.clear());
    // Reload so page starts with clean localStorage
    await page.reload({ waitUntil: 'networkidle' });

    // 1. Select Slow difficulty
    const slowRadio = page.getByRole('radio', { name: 'Slow', exact: true });
    await slowRadio.click();
    await expect(slowRadio).toBeChecked();

    // Verify last-difficulty is saved in localStorage
    let lastDifficulty = await page.evaluate(() =>
      window.localStorage.getItem('snake-game:v1:last-difficulty'),
    );
    expect(lastDifficulty).toBe('"slow"');

    // Start slow game, eat food (score = 10), and crash
    const startButton = page.getByRole('button', { name: 'Start', exact: true });
    await startButton.click();
    const board = page.locator('#board');
    await board.press('ArrowRight');
    await auditor.verifySeedHook();

    const phase = page.locator('.hud__phase');
    await expect(phase).toHaveText('Game over', { timeout: 15000 });

    // Verify slow high score is saved
    const highSlow = await page.evaluate(() =>
      window.localStorage.getItem('snake-game:v1:high-score:slow'),
    );
    expect(highSlow).toBe('10');

    // Return to menu
    const menuButton = page.getByRole('button', { name: 'Menu', exact: true });
    await menuButton.click();

    // 2. Select Normal difficulty
    const normalRadio = page.getByRole('radio', { name: 'Normal', exact: true });
    await normalRadio.click();
    await expect(normalRadio).toBeChecked();

    // Verify last-difficulty is updated in localStorage
    lastDifficulty = await page.evaluate(() =>
      window.localStorage.getItem('snake-game:v1:last-difficulty'),
    );
    expect(lastDifficulty).toBe('"normal"');

    // Start normal game, eat food (score = 10), and crash
    await startButton.click();
    await board.press('ArrowRight');
    await expect(phase).toHaveText('Game over', { timeout: 15000 });

    // Verify normal high score is saved
    const highNormal = await page.evaluate(() =>
      window.localStorage.getItem('snake-game:v1:high-score:normal'),
    );
    expect(highNormal).toBe('10');

    // Verify slow high score is preserved (independent scores)
    const highSlowPreserved = await page.evaluate(() =>
      window.localStorage.getItem('snake-game:v1:high-score:slow'),
    );
    expect(highSlowPreserved).toBe('10');

    // Toggle mute
    const muteButton = page.locator('.mute');
    await muteButton.click();
    await expect(muteButton).toHaveAttribute('aria-pressed', 'true');
    const isMuted = await page.evaluate(() => window.localStorage.getItem('snake-game:v1:muted'));
    expect(isMuted).toBe('true');

    // Reload page to verify persistence of mute preference and scores in storage
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.locator('.mute')).toHaveAttribute('aria-pressed', 'true');

    // Verify scores are still present in localStorage after reload
    const highNormalReloaded = await page.evaluate(() =>
      window.localStorage.getItem('snake-game:v1:high-score:normal'),
    );
    expect(highNormalReloaded).toBe('10');

    const pageFailures = await page.evaluate(() => (window as any).browserFailures || []);
    browserFailures.push(...pageFailures);
    expect(browserFailures).toEqual([]);
  });

  test('LocalStorage malformed, wrong-type, and QuotaExceededError fallbacks (AC-R01, AC-R04)', async ({
    page,
    baseURL,
  }) => {
    const browserFailures: string[] = [];
    await setupEnhancedPageListeners(page, browserFailures, baseURL);

    await page.addInitScript(() => {
      // Set corrupt/malformed values in localStorage
      window.localStorage.setItem('snake-game:v1:high-score:normal', '{"corrupted": true}'); // wrong type (object)
      window.localStorage.setItem('snake-game:v1:high-score:slow', 'invalid-json'); // malformed JSON
      window.localStorage.setItem('snake-game:v1:muted', '12345'); // wrong type (number instead of boolean)
      window.localStorage.setItem('snake-game:v1:last-difficulty', '"super-hard"'); // invalid difficulty value

      // Mock setItem to throw QuotaExceededError
      Object.defineProperty(window.Storage.prototype, 'setItem', {
        value: () => {
          throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
        },
        configurable: true,
      });
    });

    await page.goto('./', { waitUntil: 'networkidle' });

    // Verify game boots successfully and works using fallback defaults
    const startButton = page.getByRole('button', { name: 'Start', exact: true });
    await expect(startButton).toBeVisible();
    await startButton.click();

    const phase = page.locator('.hud__phase');
    await expect(phase).toHaveText('Ready');

    const board = page.locator('#board');
    await board.press('ArrowRight');
    await expect(phase).toHaveText('Playing');
    await expect(phase).toHaveText('Game over', { timeout: 15000 });

    const pageFailures = await page.evaluate(() => (window as any).browserFailures || []);
    browserFailures.push(...pageFailures);
    expect(browserFailures).toEqual([]);
  });

  test('LocalStorage SecurityError fallback (AC-R01, AC-R04)', async ({ page, baseURL }) => {
    const browserFailures: string[] = [];
    await setupEnhancedPageListeners(page, browserFailures, baseURL);

    await page.addInitScript(() => {
      // Mock window.localStorage to throw SecurityError when accessed or called
      const mockStorage = {
        getItem: () => {
          throw new DOMException('SecurityError', 'SecurityError');
        },
        setItem: () => {
          throw new DOMException('SecurityError', 'SecurityError');
        },
        removeItem: () => {
          throw new DOMException('SecurityError', 'SecurityError');
        },
        clear: () => {
          throw new DOMException('SecurityError', 'SecurityError');
        },
        key: () => {
          throw new DOMException('SecurityError', 'SecurityError');
        },
        length: 0,
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockStorage,
        configurable: true,
      });
    });

    await page.goto('./', { waitUntil: 'networkidle' });

    // Verify game boots and works using defaults
    const startButton = page.getByRole('button', { name: 'Start', exact: true });
    await expect(startButton).toBeVisible();
    await startButton.click();

    const phase = page.locator('.hud__phase');
    await expect(phase).toHaveText('Ready');

    const board = page.locator('#board');
    await board.press('ArrowRight');
    await expect(phase).toHaveText('Playing');
    await expect(phase).toHaveText('Game over', { timeout: 15000 });

    const pageFailures = await page.evaluate(() => (window as any).browserFailures || []);
    browserFailures.push(...pageFailures);
    expect(browserFailures).toEqual([]);
  });

  test('Audio fallback when AudioContext constructor throws (AC-R02)', async ({
    page,
    baseURL,
  }) => {
    const browserFailures: string[] = [];
    await setupEnhancedPageListeners(page, browserFailures, baseURL);

    await page.addInitScript(() => {
      let constructorCount = 0;
      class ConditionalFailingAudioContext {
        destination: any;
        currentTime: number;

        constructor() {
          constructorCount++;
          // Only throw for AudioFeedback's instantiation (the very first call on page load)
          if (constructorCount === 1) {
            throw new Error('Failed to construct AudioContext');
          }
          // Phaser's instance: minimal mock context to boot cleanly
          this.destination = {};
          this.currentTime = 0;
        }
        get state() {
          return 'suspended';
        }
        resume() {
          return Promise.resolve();
        }
        createGain() {
          return {
            gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
            connect: () => {},
          };
        }
        createOscillator() {
          return {
            frequency: { setValueAtTime: () => {} },
            connect: () => {},
            start: () => {},
            stop: () => {},
          };
        }
      }
      Object.defineProperty(window, 'AudioContext', {
        value: ConditionalFailingAudioContext,
        configurable: true,
      });
      Object.defineProperty(window, 'webkitAudioContext', {
        value: undefined,
        configurable: true,
      });
    });

    await page.goto('./', { waitUntil: 'networkidle' });

    // Verify game boots successfully
    const startButton = page.getByRole('button', { name: 'Start', exact: true });
    await expect(startButton).toBeVisible();
    await startButton.click();

    const phase = page.locator('.hud__phase');
    await expect(phase).toHaveText('Ready');

    const board = page.locator('#board');
    await board.press('ArrowRight');
    await expect(phase).toHaveText('Playing');
    await expect(phase).toHaveText('Game over', { timeout: 15000 });

    const pageFailures = await page.evaluate(() => (window as any).browserFailures || []);
    browserFailures.push(...pageFailures);
    expect(browserFailures).toEqual([]);
  });

  test('Audio fallback when AudioContext resume rejects (AC-R02)', async ({ page, baseURL }) => {
    const browserFailures: string[] = [];
    await setupEnhancedPageListeners(page, browserFailures, baseURL);

    await page.addInitScript(() => {
      let constructorCount = 0;
      class ResumeRejectingAudioContext {
        isFeedbackContext: boolean;
        destination: any;
        currentTime: number;

        constructor() {
          constructorCount++;
          // First instance is owned by AudioFeedback, second by Phaser
          this.isFeedbackContext = constructorCount === 1;
          this.destination = {};
          this.currentTime = 0;
        }
        get state() {
          return 'suspended';
        }
        resume() {
          if (this.isFeedbackContext) {
            const p = Promise.reject(new Error('AudioContext resume rejected'));
            p.catch(() => {}); // prevent unhandled promise rejection warnings/failures
            return p;
          }
          return Promise.resolve();
        }
        createGain() {
          return {
            gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
            connect: () => {},
          };
        }
        createOscillator() {
          return {
            frequency: {
              setValueAtTime: () => {},
              connect: () => {},
              start: () => {},
              stop: () => {},
            },
          };
        }
      }
      Object.defineProperty(window, 'AudioContext', {
        value: ResumeRejectingAudioContext,
        configurable: true,
      });
      Object.defineProperty(window, 'webkitAudioContext', {
        value: undefined,
        configurable: true,
      });
    });

    await page.goto('./', { waitUntil: 'networkidle' });

    // Verify game boots successfully
    const startButton = page.getByRole('button', { name: 'Start', exact: true });
    await expect(startButton).toBeVisible();
    await startButton.click();

    const phase = page.locator('.hud__phase');
    await expect(phase).toHaveText('Ready');

    const board = page.locator('#board');
    await board.press('ArrowRight');
    await expect(phase).toHaveText('Playing');
    await expect(phase).toHaveText('Game over', { timeout: 15000 });

    const pageFailures = await page.evaluate(() => (window as any).browserFailures || []);
    browserFailures.push(...pageFailures);
    expect(browserFailures).toEqual([]);
  });
});
