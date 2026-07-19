import type { Page } from '@playwright/test';

/**
 * Attaches page-level listeners to capture console errors, page errors,
 * request failures, and HTTP error responses.
 */
export function setupPageListeners(page: Page, browserFailures: string[]): void {
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
    if (response.status() >= 400) {
      browserFailures.push(`http-${response.status()}: ${response.url()}`);
    }
  });
}
