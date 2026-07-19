import type { RandomSource } from './domain/index.ts';

import './styles.css';

export const APP_TITLE = 'Snake Game';
export const APP_BOOT_STATUS = 'Project scaffold ready';

/** Defers WebGL-only Phaser imports until the actual browser entry point runs. */
export async function mountApp(root: HTMLElement, randomSource?: RandomSource): Promise<void> {
  const { mountPhaserGame } = await import('./game/bootstrap.ts');

  mountPhaserGame(root, randomSource);
}

export function findAppRoot(document: Document): HTMLElement {
  const root = document.querySelector<HTMLElement>('#app');

  if (root === null) {
    throw new Error('Missing #app root element');
  }

  return root;
}

if (typeof document !== 'undefined') {
  void mountApp(findAppRoot(document));
}
