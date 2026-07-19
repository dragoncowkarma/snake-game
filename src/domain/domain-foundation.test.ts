import { describe, expect, it } from 'vitest';

import { GAME_CONFIG } from '../config/game-config.ts';

import { PHASE_COMMAND_POLICY } from './command-policy.ts';
import { spawnFood } from './food-spawner.ts';
import { reset } from './reset.ts';
import type { Cell, RandomSource } from './types.ts';

class RecordingRandomSource implements RandomSource {
  readonly upperBounds: number[] = [];

  constructor(private readonly selectedIndex: number) {}

  nextInt(upperExclusive: number): number {
    this.upperBounds.push(upperExclusive);

    return this.selectedIndex;
  }
}

class SeededRandomSource implements RandomSource {
  readonly upperBounds: number[] = [];
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  nextInt(upperExclusive: number): number {
    this.upperBounds.push(upperExclusive);
    this.state = (Math.imul(this.state, 1_664_525) + 1_013_904_223) >>> 0;

    return Math.floor((this.state / 0x1_0000_0000) * upperExclusive);
  }
}

function everyBoardCell(): Cell[] {
  const cells: Cell[] = [];

  for (let y = 0; y < GAME_CONFIG.board.height; y += 1) {
    for (let x = 0; x < GAME_CONFIG.board.width; x += 1) {
      cells.push({ x, y });
    }
  }

  return cells;
}

describe('accepted domain skeleton', () => {
  it('publishes the exact phase-by-command policy', () => {
    expect(PHASE_COMMAND_POLICY).toEqual({
      menu: {
        selectDifficulty: 'accept',
        start: 'accept',
        direction: 'ignore',
        pause: 'ignore',
        resume: 'ignore',
        restart: 'ignore',
        returnToMenu: 'ignore',
        toggleMute: 'accept',
      },
      ready: {
        selectDifficulty: 'ignore',
        start: 'ignore',
        direction: 'validateDirection',
        pause: 'ignore',
        resume: 'ignore',
        restart: 'ignore',
        returnToMenu: 'ignore',
        toggleMute: 'accept',
      },
      playing: {
        selectDifficulty: 'ignore',
        start: 'ignore',
        direction: 'validateDirection',
        pause: 'accept',
        resume: 'ignore',
        restart: 'ignore',
        returnToMenu: 'ignore',
        toggleMute: 'accept',
      },
      paused: {
        selectDifficulty: 'ignore',
        start: 'ignore',
        direction: 'ignore',
        pause: 'ignore',
        resume: 'accept',
        restart: 'ignore',
        returnToMenu: 'ignore',
        toggleMute: 'accept',
      },
      gameOver: {
        selectDifficulty: 'ignore',
        start: 'ignore',
        direction: 'ignore',
        pause: 'ignore',
        resume: 'ignore',
        restart: 'accept',
        returnToMenu: 'accept',
        toggleMute: 'accept',
      },
      won: {
        selectDifficulty: 'ignore',
        start: 'ignore',
        direction: 'ignore',
        pause: 'ignore',
        resume: 'ignore',
        restart: 'accept',
        returnToMenu: 'accept',
        toggleMute: 'accept',
      },
    });
  });

  it('keeps all approved game numbers in one configuration object', () => {
    expect(GAME_CONFIG).toEqual({
      board: { width: 20, height: 20 },
      initialSnake: [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
      ],
      scorePerFood: 10,
      acceleration: { foodsPerStep: 5, stepMs: 10 },
      difficulty: {
        slow: { startTickMs: 220, minimumTickMs: 130 },
        normal: { startTickMs: 160, minimumTickMs: 90 },
      },
    });
  });
});

describe('reset', () => {
  it.each([
    ['slow', 220],
    ['normal', 160],
  ] as const)('creates a complete %s menu snapshot without consuming RNG', (difficulty, tickMs) => {
    const randomSource = new RecordingRandomSource(0);

    const result = reset({ difficulty, phase: 'menu' }, randomSource);

    expect(result).toEqual({
      state: {
        phase: 'menu',
        snake: [
          { x: 10, y: 10 },
          { x: 9, y: 10 },
          { x: 8, y: 10 },
        ],
        direction: 'right',
        queuedDirections: [],
        food: null,
        score: 0,
        foodsEaten: 0,
        tickMs,
        difficulty,
        endReason: null,
      },
      events: [],
    });
    expect(randomSource.upperBounds).toEqual([]);
  });

  it('creates ready food from 397 free cells with exactly one RNG call', () => {
    const randomSource = new RecordingRandomSource(0);

    const result = reset({ difficulty: 'normal', phase: 'ready' }, randomSource);

    expect(result.state).toMatchObject({
      phase: 'ready',
      food: { x: 0, y: 0 },
      tickMs: 160,
      difficulty: 'normal',
    });
    expect(result.state.snake).not.toContainEqual(result.state.food);
    expect(result.events).toEqual([]);
    expect(randomSource.upperBounds).toEqual([397]);
  });

  it('returns fresh value-equal snapshots for the same seed and request', () => {
    const randomA = new SeededRandomSource(12_345);
    const randomB = new SeededRandomSource(12_345);

    const resultA = reset({ difficulty: 'slow', phase: 'ready' }, randomA);
    const resultB = reset({ difficulty: 'slow', phase: 'ready' }, randomB);

    expect(resultA).toEqual(resultB);
    expect(resultA.state).not.toBe(resultB.state);
    expect(resultA.state.snake).not.toBe(resultB.state.snake);
    expect(randomA.upperBounds).toEqual(randomB.upperBounds);
    expect(randomA.upperBounds).toEqual([397]);
  });
});

describe('row-major free-cell food selection', () => {
  it.each([
    [207, { x: 7, y: 10 }],
    [208, { x: 11, y: 10 }],
    [396, { x: 19, y: 19 }],
  ] as const)('maps free-cell index %i to %j without retrying', (selectedIndex, expected) => {
    const randomSource = new RecordingRandomSource(selectedIndex);

    const food = spawnFood(GAME_CONFIG.initialSnake, randomSource);

    expect(food).toEqual(expected);
    expect(randomSource.upperBounds).toEqual([397]);
  });

  it('returns null for a full board without consuming RNG', () => {
    const randomSource = new RecordingRandomSource(0);

    expect(spawnFood(everyBoardCell(), randomSource)).toBeNull();
    expect(randomSource.upperBounds).toEqual([]);
  });

  it('rejects an out-of-range RandomSource value without modulo coercion', () => {
    const randomSource = new RecordingRandomSource(397);

    expect(() => spawnFood(GAME_CONFIG.initialSnake, randomSource)).toThrow(
      'RandomSource.nextInt(397) returned out-of-range index 397',
    );
    expect(randomSource.upperBounds).toEqual([397]);
  });
});
