import { GAME_CONFIG } from '../config/game-config.ts';

import { spawnFood } from './food-spawner.ts';
import type { Cell, GameState, ResetRequest, TransitionResult } from './types.ts';
import type { RandomSource } from './types.ts';

function createInitialSnake(): [Cell, Cell, Cell] {
  const [head, middle, tail] = GAME_CONFIG.initialSnake;

  return [{ ...head }, { ...middle }, { ...tail }];
}

export function reset(request: ResetRequest, randomSource: RandomSource): TransitionResult {
  const snake = createInitialSnake();
  const food = request.phase === 'menu' ? null : spawnFood(snake, randomSource);

  if (request.phase === 'ready' && food === null) {
    throw new Error('The configured initial snake must leave at least one free board cell');
  }

  const state: GameState = {
    phase: request.phase,
    snake,
    direction: 'right',
    queuedDirections: [],
    food,
    score: 0,
    foodsEaten: 0,
    tickMs: GAME_CONFIG.difficulty[request.difficulty].startTickMs,
    difficulty: request.difficulty,
    endReason: null,
  };

  return { state, events: [] };
}
