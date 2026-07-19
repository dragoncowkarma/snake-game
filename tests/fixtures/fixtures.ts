import type { Cell, GameState } from '../../src/ui/contracts.ts';

// Serpentine path P (400 cells)
export const P: Cell[] = [];
for (let y = 0; y < 20; y++) {
  if (y % 2 === 0) {
    for (let x = 0; x < 20; x++) {
      P.push({ x, y });
    }
  } else {
    for (let x = 19; x >= 0; x--) {
      P.push({ x, y });
    }
  }
}

export interface FixtureWrapper<T = GameState | null> {
  readonly id: string;
  readonly state: T;
  readonly rngScript?: ReadonlyArray<readonly [number, number]>;
  readonly scheduler?: Record<string, unknown>;
  readonly storage?: Record<string, unknown>;
  readonly cases?: Record<string, unknown>;
  readonly [key: string]: unknown;
}

export const FX_READY_N: FixtureWrapper<GameState> = {
  id: 'FX-READY-N',
  state: {
    phase: 'ready',
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
  },
  rngScript: [[397, 0]],
};

export const FX_READY_S: FixtureWrapper<GameState> = {
  id: 'FX-READY-S',
  state: {
    phase: 'ready',
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
    tickMs: 220,
    difficulty: 'slow',
    endReason: null,
  },
  rngScript: [[397, 0]],
};

export const FX_PLAY_R: FixtureWrapper<GameState> = {
  id: 'FX-PLAY-R',
  state: {
    phase: 'playing',
    snake: [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ],
    direction: 'right',
    queuedDirections: ['right'],
    food: { x: 0, y: 0 },
    score: 0,
    foodsEaten: 0,
    tickMs: 160,
    difficulty: 'normal',
    endReason: null,
  },
  rngScript: [],
};

export const FX_INPUT_Q: FixtureWrapper<GameState> = {
  id: 'FX-INPUT-Q',
  state: {
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
  },
  rngScript: [],
};

export const FX_FPS_1000: FixtureWrapper<GameState> = {
  id: 'FX-FPS-1000',
  state: {
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
  },
  rngScript: [],
};

export const FX_PERF_400: FixtureWrapper<GameState> = {
  id: 'FX-PERF-400',
  state: {
    phase: 'won',
    snake: [...P].reverse() as [Cell, ...Cell[]],
    direction: 'left',
    queuedDirections: [],
    food: null,
    score: 3970,
    foodsEaten: 397,
    tickMs: 90,
    difficulty: 'normal',
    endReason: null,
  },
  rngScript: [],
};

export const FX_SCHED_CAP: FixtureWrapper<GameState> = {
  id: 'FX-SCHED-CAP',
  state: {
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
  },
  rngScript: [],
};

export const FX_EAT1: FixtureWrapper<GameState> = {
  id: 'FX-EAT1',
  state: {
    phase: 'playing',
    snake: [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ],
    direction: 'right',
    queuedDirections: [],
    food: { x: 11, y: 10 },
    score: 0,
    foodsEaten: 0,
    tickMs: 160,
    difficulty: 'normal',
    endReason: null,
  },
  rngScript: [[396, 0]],
};

export const FX_SPEED5_N: FixtureWrapper<GameState> = {
  id: 'FX-SPEED5-N',
  state: {
    phase: 'playing',
    snake: [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
      { x: 7, y: 10 },
      { x: 6, y: 10 },
      { x: 5, y: 10 },
      { x: 4, y: 10 },
    ],
    direction: 'right',
    queuedDirections: [],
    food: { x: 11, y: 10 },
    score: 40,
    foodsEaten: 4,
    tickMs: 160,
    difficulty: 'normal',
    endReason: null,
  },
  rngScript: [[392, 0]],
};

export const FX_SPEED5_S: FixtureWrapper<GameState> = {
  id: 'FX-SPEED5-S',
  state: {
    phase: 'playing',
    snake: [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
      { x: 7, y: 10 },
      { x: 6, y: 10 },
      { x: 5, y: 10 },
      { x: 4, y: 10 },
    ],
    direction: 'right',
    queuedDirections: [],
    food: { x: 11, y: 10 },
    score: 40,
    foodsEaten: 4,
    tickMs: 220,
    difficulty: 'slow',
    endReason: null,
  },
  rngScript: [[392, 0]],
};

export const FX_BEST_SPLIT: FixtureWrapper<null> = {
  id: 'FX-BEST-SPLIT',
  state: null,
  storage: {
    slowBest: 30,
    normalBest: 80,
    mute: false,
    lastDifficulty: 'normal',
  },
};

export const FX_TAIL_A: FixtureWrapper<GameState> = {
  id: 'FX-TAIL-A',
  state: {
    phase: 'playing',
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 2 },
    ],
    direction: 'up',
    queuedDirections: ['left'],
    food: { x: 0, y: 0 },
    score: 10,
    foodsEaten: 1,
    tickMs: 160,
    difficulty: 'normal',
    endReason: null,
  },
  rngScript: [],
};

export const FX_WALL: FixtureWrapper<GameState> = {
  id: 'FX-WALL',
  state: {
    phase: 'playing',
    snake: [
      { x: 19, y: 10 },
      { x: 18, y: 10 },
      { x: 17, y: 10 },
    ],
    direction: 'right',
    queuedDirections: [],
    food: { x: 0, y: 0 },
    score: 0,
    foodsEaten: 0,
    tickMs: 160,
    difficulty: 'normal',
    endReason: null,
  },
  rngScript: [],
};

export const FX_SELF: FixtureWrapper<GameState> = {
  id: 'FX-SELF',
  state: {
    phase: 'playing',
    snake: [
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 2 },
    ],
    direction: 'left',
    queuedDirections: ['down'],
    food: { x: 0, y: 0 },
    score: 30,
    foodsEaten: 3,
    tickMs: 160,
    difficulty: 'normal',
    endReason: null,
  },
  rngScript: [],
};

export const FX_ONE_FREE: FixtureWrapper<GameState> = {
  id: 'FX-ONE-FREE',
  state: {
    phase: 'playing',
    snake: [...P.slice(0, 398)].reverse() as [Cell, ...Cell[]],
    direction: 'left',
    queuedDirections: [],
    food: { x: 1, y: 19 },
    score: 3950,
    foodsEaten: 395,
    tickMs: 90,
    difficulty: 'normal',
    endReason: null,
  },
  rngScript: [[1, 0]],
};

export const FX_FULL: FixtureWrapper<GameState> = {
  id: 'FX-FULL',
  state: {
    phase: 'playing',
    snake: [...P.slice(0, 399)].reverse() as [Cell, ...Cell[]],
    direction: 'left',
    queuedDirections: [],
    food: { x: 0, y: 19 },
    score: 3960,
    foodsEaten: 396,
    tickMs: 90,
    difficulty: 'normal',
    endReason: null,
  },
  rngScript: [],
};

export const FX_UI_BEST_WALL: FixtureWrapper<GameState> = {
  id: 'FX-UI-BEST-WALL',
  storage: {
    slowBest: 30,
    normalBest: 80,
  },
  state: {
    phase: 'playing',
    snake: [
      { x: 19, y: 10 },
      { x: 18, y: 10 },
      { x: 17, y: 10 },
      { x: 16, y: 10 },
      { x: 15, y: 10 },
      { x: 14, y: 10 },
      { x: 13, y: 10 },
      { x: 12, y: 10 },
      { x: 11, y: 10 },
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ],
    direction: 'right',
    queuedDirections: [],
    food: { x: 0, y: 0 },
    score: 90,
    foodsEaten: 9,
    tickMs: 150,
    difficulty: 'normal',
    endReason: null,
  },
};

export const FX_PAUSE: FixtureWrapper<GameState> = {
  id: 'FX-PAUSE',
  state: {
    phase: 'playing',
    snake: [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ],
    direction: 'right',
    queuedDirections: ['up', 'left'],
    food: { x: 0, y: 0 },
    score: 0,
    foodsEaten: 0,
    tickMs: 160,
    difficulty: 'normal',
    endReason: null,
  },
  scheduler: {
    accumulator: 73,
    pauseCommandCount: 0,
  },
};

export const FX_RESIZE: FixtureWrapper<GameState> = {
  id: 'FX-RESIZE',
  state: {
    phase: 'playing',
    snake: [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ],
    direction: 'right',
    queuedDirections: ['up', 'left'],
    food: { x: 0, y: 0 },
    score: 0,
    foodsEaten: 0,
    tickMs: 160,
    difficulty: 'normal',
    endReason: null,
  },
  scheduler: {
    accumulator: 73,
    pauseCommandCount: 0,
    relayoutCount: 7,
  },
};

export const FX_RESTART_S: FixtureWrapper<GameState> = {
  id: 'FX-RESTART-S',
  state: {
    phase: 'gameOver',
    snake: [
      { x: 19, y: 10 },
      { x: 18, y: 10 },
      { x: 17, y: 10 },
      { x: 16, y: 10 },
      { x: 15, y: 10 },
      { x: 14, y: 10 },
      { x: 13, y: 10 },
      { x: 12, y: 10 },
      { x: 11, y: 10 },
      { x: 10, y: 10 },
    ],
    direction: 'right',
    queuedDirections: [],
    food: { x: 0, y: 0 },
    score: 70,
    foodsEaten: 7,
    tickMs: 210,
    difficulty: 'slow',
    endReason: 'wall',
  },
  scheduler: {
    accumulator: 91,
  },
};

export const FX_STORAGE_FAULTS: FixtureWrapper<null> = {
  id: 'FX-STORAGE-FAULTS',
  state: null,
  cases: {
    S1: { throwOnGet: 'SecurityError' },
    S2: { returnNullOnGet: true, throwOnSet: 'QuotaExceededError' },
    S3: { rawStringValue: '{not-json' },
    S4: { rawStringValue: 'null' },
    S5: { rawStringValue: '"not-a-number"' },
    S6: { rawStringValue: '-1' },
    S7: { rawStringValue: '1e309' },
    S8: { rawStringValue: '[]' },
    S9: { rawStringValue: '{}' },
    S10: { rawStringValue: '{"slow":-1,"normal":"bad","muted":[],"lastDifficulty":"turbo"}' },
  },
};

export const FX_AUDIO_FAULTS: FixtureWrapper<null> = {
  id: 'FX-AUDIO-FAULTS',
  state: null,
  cases: {
    A1: { constructorThrow: 'NotSupportedError' },
    A2: { factoryReject: 'audio-init-rejected' },
    A3: { stateSuspendedAndResumeReject: 'NotAllowedError' },
  },
};

export const FX_CMD_ROUTER: FixtureWrapper<GameState> = {
  id: 'FX-CMD-ROUTER',
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
    tickMs: 220,
    difficulty: 'slow',
    endReason: null,
  },
  scheduler: {
    accumulator: 0,
  },
};

export const FX_CMD_SHELL: FixtureWrapper<null> = {
  id: 'FX-CMD-SHELL',
  state: null,
  initialMutePreference: false,
  actions: ['toggleMute', 'toggleMute'],
};

// Index of all fixtures for easy dynamic access
export const ALL_FIXTURES: Record<string, FixtureWrapper<GameState | null>> = {
  'FX-READY-N': FX_READY_N,
  'FX-READY-S': FX_READY_S,
  'FX-PLAY-R': FX_PLAY_R,
  'FX-INPUT-Q': FX_INPUT_Q,
  'FX-FPS-1000': FX_FPS_1000,
  'FX-PERF-400': FX_PERF_400,
  'FX-SCHED-CAP': FX_SCHED_CAP,
  'FX-EAT1': FX_EAT1,
  'FX-SPEED5-N': FX_SPEED5_N,
  'FX-SPEED5-S': FX_SPEED5_S,
  'FX-BEST-SPLIT': FX_BEST_SPLIT,
  'FX-TAIL-A': FX_TAIL_A,
  'FX-WALL': FX_WALL,
  'FX-SELF': FX_SELF,
  'FX-ONE-FREE': FX_ONE_FREE,
  'FX-FULL': FX_FULL,
  'FX-UI-BEST-WALL': FX_UI_BEST_WALL,
  'FX-PAUSE': FX_PAUSE,
  'FX-RESIZE': FX_RESIZE,
  'FX-RESTART-S': FX_RESTART_S,
  'FX-STORAGE-FAULTS': FX_STORAGE_FAULTS,
  'FX-AUDIO-FAULTS': FX_AUDIO_FAULTS,
  'FX-CMD-ROUTER': FX_CMD_ROUTER,
  'FX-CMD-SHELL': FX_CMD_SHELL,
};
