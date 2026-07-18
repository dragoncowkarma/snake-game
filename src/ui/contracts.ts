/**
 * Type-only mirror of docs/coordination/CONTRACTS.md section 1 (SG-003 revision 2,
 * accepted H0b). src/domain/** does not exist yet (SG-007 is not implemented), so
 * this UI layer cannot import the real module. No field, name, or shape here departs
 * from the accepted contract; no runtime logic (reset/enqueueDirection/step) is
 * duplicated. Delete this file and import from the real domain module once SG-007
 * lands.
 */

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

export type DomainEvent =
  | { readonly type: 'foodEaten'; readonly cell: Cell; readonly score: number }
  | {
      readonly type: 'gameEnded';
      readonly reason: EndReason;
      readonly headCell: Cell;
      readonly attemptedCell: Cell;
    }
  | { readonly type: 'gameWon'; readonly score: number };
