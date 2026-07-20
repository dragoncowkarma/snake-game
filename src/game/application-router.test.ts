import { describe, expect, it } from 'vitest';

import type { RandomSource } from '../domain/index.ts';

import { ApplicationRouter } from './application-router.ts';

const randomSource: RandomSource = {
  nextInt: () => 0,
};

describe('ApplicationRouter', () => {
  it('starts READY only from a direction and preserves the domain READY Right exception', () => {
    const application = new ApplicationRouter(randomSource);

    expect(application.dispatch({ type: 'start' })).toBe(true);
    expect(application.snapshot.phase).toBe('ready');
    expect(application.dispatch({ type: 'direction', direction: 'right' })).toBe(true);
    expect(application.snapshot.phase).toBe('playing');
    expect(application.snapshot.queuedDirections).toEqual(['right']);
  });

  it('clears queue and accumulator for pause/resume without recreating listeners or game rules', () => {
    const application = new ApplicationRouter(randomSource);

    application.dispatch({ type: 'start' });
    application.dispatch({ type: 'direction', direction: 'right' });
    application.advance(100);
    application.dispatch({ type: 'direction', direction: 'up' });
    application.dispatch({ type: 'pause' });

    expect(application.snapshot.phase).toBe('paused');
    expect(application.snapshot.direction).toBe('right');
    expect(application.snapshot.queuedDirections).toEqual([]);
    expect(application.accumulator).toBe(0);
    expect(application.dispatch({ type: 'direction', direction: 'up' })).toBe(false);
    expect(application.advance(250)).toBe(0);

    application.dispatch({ type: 'resume' });
    expect(application.snapshot.phase).toBe('playing');
    expect(application.snapshot.queuedDirections).toEqual([]);
    expect(application.accumulator).toBe(0);
    expect(application.advance(application.snapshot.tickMs - 1)).toBe(0);
  });

  it('keeps a single subscriber across twenty restart cycles', () => {
    const application = new ApplicationRouter(randomSource);
    let publications = 0;

    application.subscribe(() => {
      publications += 1;
    });

    for (let cycle = 0; cycle < 20; cycle += 1) {
      application.dispatch({ type: 'start' });
      application.dispatch({ type: 'direction', direction: 'right' });

      while (application.snapshot.phase === 'playing') {
        application.advance(250);
      }

      expect(application.snapshot.phase).toBe('gameOver');
      application.dispatch({ type: 'restart' });
      expect(application.snapshot.phase).toBe('ready');
      expect(application.listenerCount).toBe(1);
    }

    // One initial subscription publication plus exactly the command/tick publications;
    // repeated resets reuse the same listener set rather than attaching new callbacks.
    expect(publications).toBeGreaterThan(20);
  });
});
