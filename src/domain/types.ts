export type Phase = 'menu' | 'ready' | 'playing' | 'paused' | 'gameOver' | 'won';

export type Direction = 'up' | 'down' | 'left' | 'right';
export type Difficulty = 'slow' | 'normal';
export type EndReason = 'wall' | 'self';

export interface Cell {
  readonly x: number;
  readonly y: number;
}

export type DirectionQueue = readonly [] | readonly [Direction] | readonly [Direction, Direction];

export interface GameState {
  readonly phase: Phase;
  readonly snake: readonly [Cell, ...Cell[]];
  readonly direction: Direction;
  readonly queuedDirections: DirectionQueue;
  readonly food: Cell | null;
  readonly score: number;
  readonly foodsEaten: number;
  readonly tickMs: number;
  readonly difficulty: Difficulty;
  readonly endReason: EndReason | null;
}

export type Command =
  | { readonly type: 'selectDifficulty'; readonly difficulty: Difficulty }
  | { readonly type: 'start' }
  | { readonly type: 'direction'; readonly direction: Direction }
  | { readonly type: 'pause' }
  | { readonly type: 'resume' }
  | { readonly type: 'restart' }
  | { readonly type: 'returnToMenu' }
  | { readonly type: 'toggleMute' };

export type CommandType = Command['type'];
export type CommandPolicy = 'accept' | 'validateDirection' | 'ignore';
export type PhaseCommandPolicy = Readonly<
  Record<Phase, Readonly<Record<CommandType, CommandPolicy>>>
>;

export type DomainEvent =
  | {
      readonly type: 'foodEaten';
      readonly cell: Cell;
      readonly score: number;
    }
  | {
      readonly type: 'gameEnded';
      readonly reason: EndReason;
      readonly headCell: Cell;
      readonly attemptedCell: Cell;
    }
  | {
      readonly type: 'gameWon';
      readonly score: number;
    };

export interface RandomSource {
  nextInt(upperExclusive: number): number;
}

export interface TransitionResult {
  readonly state: GameState;
  readonly events: readonly DomainEvent[];
}

export type DirectionDisposition = 'accepted' | 'rejected' | 'ignored';

export interface EnqueueDirectionResult {
  readonly state: GameState;
  readonly disposition: DirectionDisposition;
}

export type ResetPhase = 'menu' | 'ready';

export interface ResetRequest {
  readonly difficulty: Difficulty;
  readonly phase: ResetPhase;
}
