import { describe, expect, it } from 'vitest';

import type { GameState } from '../domain/index.ts';

import {
  FixedStepScheduler,
  MAX_FRAME_DELTA_MS,
  MAX_STEPS_PER_FRAME,
  type StepResult,
} from './fixed-step-scheduler.ts';

function playingState(tickMs: number): GameState {
  return {
    phase: 'playing',
    snake: [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ],
    direction: 'right',
    queuedDirections: [],
    food: { x: 0, y: 0 },
    score: 0,
    foodsEaten: 0,
    tickMs,
    difficulty: 'normal',
    endReason: null,
  };
}

describe('FixedStepScheduler', () => {
  it('clamps delta and advances at most three fixed steps in one render frame', () => {
    const scheduler = new FixedStepScheduler();
    const state = playingState(50);
    let calls = 0;

    const steps = scheduler.advance(MAX_FRAME_DELTA_MS * 4, {
      readState: () => state,
      runStep: () => {
        calls += 1;
        return { state, events: [] };
      },
      publish: () => undefined,
    });

    expect(steps).toBe(MAX_STEPS_PER_FRAME);
    expect(calls).toBe(MAX_STEPS_PER_FRAME);
    expect(scheduler.accumulator).toBe(100);
  });

  it('subtracts the duration captured before a speed-changing step', () => {
    const scheduler = new FixedStepScheduler();
    let state = playingState(160);
    let calls = 0;

    const driver = {
      readState: () => state,
      runStep: (): StepResult => {
        calls += 1;
        state = playingState(calls === 1 ? 140 : 140);
        return { state, events: [] };
      },
      publish: () => undefined,
    };

    expect(scheduler.advance(60, driver)).toBe(0);
    expect(scheduler.advance(250, driver)).toBe(2);
    // 310 - first captured 160 - second captured 140. Subtracting a new 140ms
    // speed from the first step would leave 30ms instead of the contract's 10ms.
    expect(scheduler.accumulator).toBe(10);
  });

  it('does not accumulate while the simulation is not playing', () => {
    const scheduler = new FixedStepScheduler();
    const state = { ...playingState(160), phase: 'paused' as const };

    expect(
      scheduler.advance(200, {
        readState: () => state,
        runStep: () => ({ state, events: [] }),
        publish: () => undefined,
      }),
    ).toBe(0);
    expect(scheduler.accumulator).toBe(0);
  });
});
