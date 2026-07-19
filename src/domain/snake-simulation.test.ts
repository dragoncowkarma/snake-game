import { describe, expect, it } from 'vitest';

import { GAME_CONFIG } from '../config/game-config.ts';

import { enqueueDirection, step } from './snake-simulation.ts';
import { reset } from './reset.ts';
import type {
  Cell,
  Direction,
  DirectionDisposition,
  DomainEvent,
  GameState,
  RandomSource,
} from './types.ts';

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

class FailingRandomSource implements RandomSource {
  nextInt(): number {
    throw new Error('RNG must not be called');
  }
}

function makeState(overrides: Partial<GameState> = {}): GameState {
  const state: GameState = {
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
    tickMs: 160,
    difficulty: 'normal',
    endReason: null,
  };

  return { ...state, ...overrides };
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

function freezeState(state: GameState): GameState {
  for (const cell of state.snake) {
    Object.freeze(cell);
  }

  Object.freeze(state.snake);
  Object.freeze(state.queuedDirections);

  if (state.food !== null) {
    Object.freeze(state.food);
  }

  return Object.freeze(state);
}

describe('enqueueDirection validation order', () => {
  it.each([
    ['right', 'right'],
    ['up', 'up'],
    ['down', 'down'],
  ] as const)(
    'READY accepts %s without moving and reserves %s for the first tick',
    (input, queued) => {
      const state = makeState({ phase: 'ready' });

      const result = enqueueDirection(state, input);

      expect(result).toEqual({
        state: { ...state, phase: 'playing', queuedDirections: [queued] },
        disposition: 'accepted',
      });
      expect(result.state.snake).toBe(state.snake);
    },
  );

  it('READY rejects Left as the reverse of its initial Right direction', () => {
    const state = makeState({ phase: 'ready' });

    expect(enqueueDirection(state, 'left')).toEqual({ state, disposition: 'rejected' });
  });

  it('PLAYING accepts right-up-left against the last reservation over two ticks', () => {
    const state = makeState();

    const up = enqueueDirection(state, 'up');
    const left = enqueueDirection(up.state, 'left');

    expect(up.disposition).toBe('accepted');
    expect(up.state.queuedDirections).toEqual(['up']);
    expect(left.disposition).toBe('accepted');
    expect(left.state.queuedDirections).toEqual(['up', 'left']);
  });

  it('rejects a reversal against the last reservation before checking queue capacity', () => {
    const state = makeState({ queuedDirections: ['up', 'left'] });

    expect(enqueueDirection(state, 'right')).toEqual({ state, disposition: 'rejected' });
  });

  it('rejects up-down reservation reversal and ignores same-direction repeats', () => {
    const state = makeState({ queuedDirections: ['up'] });

    expect(enqueueDirection(state, 'down')).toEqual({ state, disposition: 'rejected' });
    expect(enqueueDirection(state, 'up')).toEqual({ state, disposition: 'ignored' });
  });

  it('ignores a third otherwise-valid reservation when the queue already has two', () => {
    const state = makeState({ queuedDirections: ['up', 'left'] });

    expect(enqueueDirection(state, 'down')).toEqual({ state, disposition: 'ignored' });
  });

  it.each(['menu', 'paused', 'gameOver', 'won'] as const)(
    'ignores direction input in %s',
    (phase) => {
      const state = makeState({
        phase,
        queuedDirections: [],
        food: phase === 'menu' || phase === 'won' ? null : { x: 0, y: 0 },
        endReason: phase === 'gameOver' ? 'wall' : null,
      });

      expect(enqueueDirection(state, 'up')).toEqual({ state, disposition: 'ignored' });
    },
  );
});

describe('step order: direction, attempted head, wall, growth, self, move, score, food', () => {
  it('1 consumes at most one direction and 2 moves exactly one cell', () => {
    const state = makeState({ queuedDirections: ['up', 'left'] });
    const randomSource = new RecordingRandomSource(0);

    const result = step(state, randomSource);

    expect(result.state).toMatchObject({
      snake: [
        { x: 10, y: 9 },
        { x: 10, y: 10 },
        { x: 9, y: 10 },
      ],
      direction: 'up',
      queuedDirections: ['left'],
    });
    expect(result.events).toEqual([]);
    expect(randomSource.upperBounds).toEqual([]);
  });

  it('3 ends on a wall before mutation and reports last head plus outside attempt once', () => {
    const state = makeState({
      snake: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
      direction: 'up',
      queuedDirections: ['left', 'down'],
      food: { x: 10, y: 10 },
    });
    const randomSource = new RecordingRandomSource(0);

    const ended = step(state, randomSource);

    expect(ended.state).toEqual({
      ...state,
      phase: 'gameOver',
      direction: 'left',
      queuedDirections: [],
      endReason: 'wall',
    });
    expect(ended.events).toEqual([
      {
        type: 'gameEnded',
        reason: 'wall',
        headCell: { x: 0, y: 0 },
        attemptedCell: { x: -1, y: 0 },
      },
    ]);

    const repeated = step(ended.state, randomSource);
    expect(repeated).toEqual({ state: ended.state, events: [] });
    expect(randomSource.upperBounds).toEqual([]);
  });

  it('4-5 allows a non-growing move into the one tail cell removed this tick', () => {
    const state = makeState({
      snake: [
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 0, y: 2 },
        { x: 0, y: 1 },
      ],
      direction: 'up',
      queuedDirections: ['left'],
      food: { x: 5, y: 5 },
    });

    const result = step(state, new FailingRandomSource());

    expect(result.state).toMatchObject({
      phase: 'playing',
      snake: [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 0, y: 2 },
      ],
      direction: 'left',
      queuedDirections: [],
      endReason: null,
    });
    expect(result.events).toEqual([]);
  });

  it('5 rejects a non-tail body collision without applying the attempted move', () => {
    const state = makeState({
      snake: [
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 0, y: 2 },
        { x: 0, y: 1 },
      ],
      direction: 'left',
      queuedDirections: ['down', 'right'],
      food: { x: 5, y: 5 },
    });

    const result = step(state, new FailingRandomSource());

    expect(result.state).toEqual({
      ...state,
      phase: 'gameOver',
      direction: 'down',
      queuedDirections: [],
      endReason: 'self',
    });
    expect(result.events).toEqual([
      {
        type: 'gameEnded',
        reason: 'self',
        headCell: { x: 1, y: 1 },
        attemptedCell: { x: 1, y: 2 },
      },
    ]);
  });

  it('6-9 grows once, scores once, accelerates on the fifth food, then spawns once', () => {
    const state = makeState({
      snake: [
        { x: 1, y: 1 },
        { x: 0, y: 1 },
        { x: 0, y: 2 },
      ],
      food: { x: 2, y: 1 },
      score: 40,
      foodsEaten: 4,
      tickMs: 160,
    });
    const randomSource = new RecordingRandomSource(0);

    const result = step(state, randomSource);

    expect(result.state).toMatchObject({
      phase: 'playing',
      snake: [
        { x: 2, y: 1 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
        { x: 0, y: 2 },
      ],
      food: { x: 0, y: 0 },
      score: 50,
      foodsEaten: 5,
      tickMs: 150,
    });
    expect(result.events).toEqual([{ type: 'foodEaten', cell: { x: 2, y: 1 }, score: 50 }]);
    expect(randomSource.upperBounds).toEqual([396]);
    expect(result.state.snake).not.toContainEqual(result.state.food);
  });

  it.each([
    ['slow', 44, 440, 140, 130],
    ['slow', 49, 490, 130, 130],
    ['normal', 34, 340, 100, 90],
    ['normal', 39, 390, 90, 90],
  ] as const)(
    '8 caps %s speed after food count %i',
    (difficulty, foodsEaten, score, tickMs, expectedTickMs) => {
      const state = makeState({
        snake: [
          { x: 1, y: 1 },
          { x: 0, y: 1 },
          { x: 0, y: 2 },
        ],
        food: { x: 2, y: 1 },
        score,
        foodsEaten,
        tickMs,
        difficulty,
      });

      const result = step(state, new RecordingRandomSource(0));

      expect(result.state.tickMs).toBe(expectedTickMs);
    },
  );

  it('9 wins a full board without RNG and orders foodEaten before gameWon', () => {
    const winningCell = { x: 19, y: 19 };
    const headCell = { x: 18, y: 19 };
    const remainingSnake = everyBoardCell().filter(
      (cell) =>
        !(cell.x === winningCell.x && cell.y === winningCell.y) &&
        !(cell.x === headCell.x && cell.y === headCell.y),
    );
    const snake: readonly [Cell, ...Cell[]] = [headCell, ...remainingSnake];
    const state = makeState({
      snake,
      direction: 'right',
      food: winningCell,
      score: 3_960,
      foodsEaten: 396,
      tickMs: 90,
    });

    const result = step(state, new FailingRandomSource());

    expect(result.state).toMatchObject({
      phase: 'won',
      queuedDirections: [],
      food: null,
      score: 3_970,
      foodsEaten: 397,
      tickMs: 90,
      endReason: null,
    });
    expect(result.state.snake).toHaveLength(400);
    expect(result.state.snake).toContainEqual(winningCell);
    expect(result.events).toEqual([
      { type: 'foodEaten', cell: winningCell, score: 3_970 },
      { type: 'gameWon', score: 3_970 },
    ]);

    expect(step(result.state, new FailingRandomSource())).toEqual({
      state: result.state,
      events: [],
    });
  });
});

describe('purity and deterministic replay', () => {
  it('does not mutate frozen enqueue or step inputs', () => {
    const enqueueInput = freezeState(makeState({ phase: 'ready' }));
    const enqueueBefore = structuredClone(enqueueInput);

    expect(enqueueDirection(enqueueInput, 'up').disposition).toBe('accepted');
    expect(enqueueInput).toEqual(enqueueBefore);

    const stepInput = freezeState(
      makeState({
        snake: [
          { x: 1, y: 1 },
          { x: 0, y: 1 },
          { x: 0, y: 2 },
        ],
        food: { x: 2, y: 1 },
      }),
    );
    const stepBefore = structuredClone(stepInput);

    const result = step(stepInput, new RecordingRandomSource(0));

    expect(stepInput).toEqual(stepBefore);
    expect(result.state).not.toBe(stepInput);
    expect(result.state.snake).not.toBe(stepInput.snake);
  });

  it.each(['menu', 'ready', 'paused', 'gameOver', 'won'] as const)(
    'does not touch state or RNG when step receives %s',
    (phase) => {
      const state = makeState({
        phase,
        queuedDirections: [],
        food: phase === 'menu' || phase === 'won' ? null : { x: 0, y: 0 },
        endReason: phase === 'gameOver' ? 'self' : null,
      });

      expect(step(state, new FailingRandomSource())).toEqual({ state, events: [] });
    },
  );

  it('produces identical dispositions, snapshots, events, and RNG calls for 100 ticks', () => {
    const run = (
      seed: number,
    ): {
      readonly dispositions: readonly DirectionDisposition[];
      readonly snapshots: readonly GameState[];
      readonly events: readonly (readonly DomainEvent[])[];
      readonly upperBounds: readonly number[];
    } => {
      const randomSource = new SeededRandomSource(seed);
      const ready = reset({ difficulty: 'normal', phase: 'ready' }, randomSource);
      const start = enqueueDirection(ready.state, 'right');
      const turnByTick = new Map<number, Direction>([
        [8, 'down'],
        [16, 'left'],
        [33, 'up'],
        [50, 'right'],
        [67, 'down'],
        [84, 'left'],
      ]);
      const dispositions: DirectionDisposition[] = [start.disposition];
      const snapshots: GameState[] = [start.state];
      const events: (readonly DomainEvent[])[] = [];
      let state = start.state;

      for (let tick = 0; tick < 100; tick += 1) {
        const turn = turnByTick.get(tick);

        if (turn !== undefined) {
          const enqueued = enqueueDirection(state, turn);
          dispositions.push(enqueued.disposition);
          state = enqueued.state;
        }

        const result = step(state, randomSource);
        state = result.state;
        snapshots.push(state);
        events.push(result.events);
      }

      return { dispositions, snapshots, events, upperBounds: randomSource.upperBounds };
    };

    const replayA = run(12_345);
    const replayB = run(12_345);

    expect(replayA).toEqual(replayB);
    expect(replayA.snapshots).toHaveLength(101);
    expect(replayA.snapshots.at(-1)?.phase).toBe('playing');
  });
});
