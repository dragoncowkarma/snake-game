import { describe, expect, it } from 'vitest';

import { normalizeBasePath, repositoryBasePath } from '../tooling.config.ts';

import { APP_BOOT_STATUS, APP_TITLE } from './main';

describe('application entry', () => {
  it('exports the boot contract rendered by the real entry module', () => {
    expect({ title: APP_TITLE, status: APP_BOOT_STATUS }).toEqual({
      title: 'Snake Game',
      status: 'Project scaffold ready',
    });
  });
});

describe('shared build tooling', () => {
  it.each([
    [undefined, '/'],
    ['', '/'],
    ['/', '/'],
    ['//', '/'],
    ['snake-game', '/snake-game/'],
    ['//snake-game//', '/snake-game/'],
  ])('normalizes %j to %s', (input, expected) => {
    expect(normalizeBasePath(input)).toBe(expected);
  });

  it('derives the GitHub Pages repository path through the shared normalizer', () => {
    expect(repositoryBasePath('dragoncowkarma/snake-game')).toBe('/snake-game/');
  });
});
