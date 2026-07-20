import { describe, expect, it } from 'vitest';

import type { RandomSource } from '../domain/index.ts';
import { ApplicationRouter } from '../game/application-router.ts';

import {
  GamePreferences,
  STORAGE_KEYS,
  STORAGE_NAMESPACE,
  type StorageLike,
} from './game-preferences.ts';

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

const randomSource: RandomSource = { nextInt: () => 0 };

describe('GamePreferences', () => {
  it('uses versioned, difficulty-qualified high-score keys and keeps scores separate', () => {
    const storage = new MemoryStorage();
    const preferences = new GamePreferences(storage);

    expect(STORAGE_KEYS.highScore('slow')).toBe(`${STORAGE_NAMESPACE}:high-score:slow`);
    expect(STORAGE_KEYS.highScore('normal')).toBe(`${STORAGE_NAMESPACE}:high-score:normal`);
    expect(preferences.recordScore('slow', 30)).toBe(true);
    expect(preferences.recordScore('normal', 80)).toBe(true);
    expect(preferences.recordScore('slow', 30)).toBe(false);
    expect(preferences.snapshot.bestScores).toEqual({ slow: 30, normal: 80 });
    expect(storage.values).toEqual(
      new Map([
        [STORAGE_KEYS.highScore('slow'), '30'],
        [STORAGE_KEYS.highScore('normal'), '80'],
      ]),
    );
  });

  it('accepts only valid persisted values and defaults malformed storage to safe memory values', () => {
    const storage = new MemoryStorage();

    storage.values.set(STORAGE_KEYS.highScore('slow'), '{not-json');
    storage.values.set(STORAGE_KEYS.highScore('normal'), '1e309');
    storage.values.set(STORAGE_KEYS.muted, '[]');
    storage.values.set(STORAGE_KEYS.lastDifficulty, '"turbo"');

    const preferences = new GamePreferences(storage);

    expect(preferences.snapshot).toEqual({
      bestScores: { slow: 0, normal: 0 },
      muted: false,
      lastDifficulty: 'normal',
    });
  });

  it('contains blocked storage reads and writes while game progression continues', () => {
    const failingStorage: StorageLike = {
      getItem: () => {
        throw new DOMException('blocked', 'SecurityError');
      },
      setItem: () => {
        throw new DOMException('full', 'QuotaExceededError');
      },
    };
    const preferences = new GamePreferences(failingStorage);
    const application = new ApplicationRouter(randomSource);

    preferences.setMuted(true);
    preferences.setLastDifficulty('slow');
    expect(preferences.recordScore('slow', 40)).toBe(true);

    expect(application.dispatch({ type: 'start' })).toBe(true);
    expect(application.dispatch({ type: 'direction', direction: 'right' })).toBe(true);
    expect(application.advance(160)).toBe(1);
    expect(application.snapshot.phase).toBe('playing');
    expect(preferences.snapshot).toEqual({
      bestScores: { slow: 40, normal: 0 },
      muted: true,
      lastDifficulty: 'slow',
    });
  });
});
