import { GAME_CONFIG } from '../config/game-config.ts';

import { isOppositeDirection, moveCell } from './direction.ts';
import { spawnFood } from './food-spawner.ts';
import type {
  Cell,
  Direction,
  DirectionQueue,
  DomainEvent,
  EnqueueDirectionResult,
  GameState,
  RandomSource,
  TransitionResult,
} from './types.ts';

function sameCell(left: Cell, right: Cell): boolean {
  return left.x === right.x && left.y === right.y;
}

function isOutsideBoard(cell: Cell): boolean {
  return (
    cell.x < 0 ||
    cell.x >= GAME_CONFIG.board.width ||
    cell.y < 0 ||
    cell.y >= GAME_CONFIG.board.height
  );
}

function appendDirection(queue: DirectionQueue, direction: Direction): DirectionQueue {
  if (queue.length === 0) {
    return [direction];
  }

  return [queue[0], direction];
}

function consumeQueuedDirection(state: GameState): {
  readonly direction: Direction;
  readonly remainingQueue: DirectionQueue;
} {
  if (state.queuedDirections.length === 0) {
    return { direction: state.direction, remainingQueue: [] };
  }

  if (state.queuedDirections.length === 1) {
    return { direction: state.queuedDirections[0], remainingQueue: [] };
  }

  return {
    direction: state.queuedDirections[0],
    remainingQueue: [state.queuedDirections[1]],
  };
}

function createGameEndedResult(
  state: GameState,
  direction: Direction,
  reason: 'wall' | 'self',
  attemptedCell: Cell,
): TransitionResult {
  const headCell = state.snake[0];
  const terminalState: GameState = {
    ...state,
    phase: 'gameOver',
    direction,
    queuedDirections: [],
    endReason: reason,
  };

  return {
    state: terminalState,
    events: [
      {
        type: 'gameEnded',
        reason,
        headCell: { ...headCell },
        attemptedCell: { ...attemptedCell },
      },
    ],
  };
}

function calculateTickMs(difficulty: GameState['difficulty'], foodsEaten: number): number {
  const difficultyConfig = GAME_CONFIG.difficulty[difficulty];
  const accelerationSteps = Math.floor(foodsEaten / GAME_CONFIG.acceleration.foodsPerStep);

  return Math.max(
    difficultyConfig.minimumTickMs,
    difficultyConfig.startTickMs - accelerationSteps * GAME_CONFIG.acceleration.stepMs,
  );
}

export function enqueueDirection(state: GameState, direction: Direction): EnqueueDirectionResult {
  if (state.phase !== 'ready' && state.phase !== 'playing') {
    return { state, disposition: 'ignored' };
  }

  const comparisonDirection =
    state.queuedDirections[state.queuedDirections.length - 1] ?? state.direction;

  if (isOppositeDirection(direction, comparisonDirection)) {
    return { state, disposition: 'rejected' };
  }

  if (state.phase === 'playing' && direction === comparisonDirection) {
    return { state, disposition: 'ignored' };
  }

  if (state.queuedDirections.length === 2) {
    return { state, disposition: 'ignored' };
  }

  return {
    state: {
      ...state,
      phase: 'playing',
      queuedDirections: appendDirection(state.queuedDirections, direction),
    },
    disposition: 'accepted',
  };
}

export function step(state: GameState, randomSource: RandomSource): TransitionResult {
  if (state.phase !== 'playing') {
    return { state, events: [] };
  }

  // 1. Consume at most one queued direction for this movement.
  const { direction, remainingQueue } = consumeQueuedDirection(state);

  // 2. Calculate the attempted head from the last normal head.
  const attemptedCell = moveCell(state.snake[0], direction);

  // 3. Wall collision ends the tick before growth or self-collision checks.
  if (isOutsideBoard(attemptedCell)) {
    return createGameEndedResult(state, direction, 'wall', attemptedCell);
  }

  // 4. Fix whether this tick grows before choosing the self-collision body.
  const grows = state.food !== null && sameCell(attemptedCell, state.food);

  // 5. A non-growing move may enter only the tail cell removed by this tick.
  const selfCollisionBody = grows ? state.snake : state.snake.slice(0, -1);

  if (selfCollisionBody.some((cell) => sameCell(cell, attemptedCell))) {
    return createGameEndedResult(state, direction, 'self', attemptedCell);
  }

  // 6-7. Add the new head, retaining the old tail only for a growth tick.
  const retainedSnake = grows ? state.snake : state.snake.slice(0, -1);
  const nextSnake: readonly [Cell, ...Cell[]] = [attemptedCell, ...retainedSnake];

  if (!grows) {
    return {
      state: {
        ...state,
        snake: nextSnake,
        direction,
        queuedDirections: remainingQueue,
      },
      events: [],
    };
  }

  // 8. Apply food, score, and speed exactly once.
  const foodsEaten = state.foodsEaten + 1;
  const score = foodsEaten * GAME_CONFIG.scorePerFood;
  const tickMs = calculateTickMs(state.difficulty, foodsEaten);
  const events: DomainEvent[] = [{ type: 'foodEaten', cell: attemptedCell, score }];

  // 9. Spawn from the new snake, or finish without touching RNG when it is full.
  const food = spawnFood(nextSnake, randomSource);

  if (food === null) {
    events.push({ type: 'gameWon', score });

    return {
      state: {
        ...state,
        phase: 'won',
        snake: nextSnake,
        direction,
        queuedDirections: [],
        food: null,
        score,
        foodsEaten,
        tickMs,
        endReason: null,
      },
      events,
    };
  }

  // 10. Return the new playing snapshot and the ordered event list.
  return {
    state: {
      ...state,
      snake: nextSnake,
      direction,
      queuedDirections: remainingQueue,
      food,
      score,
      foodsEaten,
      tickMs,
      endReason: null,
    },
    events,
  };
}
