import {
  PHASE_COMMAND_POLICY,
  enqueueDirection,
  reset,
  step,
  type Command,
  type DomainEvent,
  type GameState,
  type RandomSource,
} from '../domain/index.ts';

import { FixedStepScheduler, type StepResult } from './fixed-step-scheduler.ts';

export type SnapshotListener = (state: GameState, events: readonly DomainEvent[]) => void;

/**
 * Thin application adapter for the accepted phase x Command contract. It deliberately
 * delegates every game-rule transition to the pure domain functions.
 */
export class ApplicationRouter {
  private state: GameState;
  private readonly scheduler = new FixedStepScheduler();
  private readonly listeners = new Set<SnapshotListener>();

  constructor(
    private readonly randomSource: RandomSource,
    initialDifficulty: GameState['difficulty'] = 'normal',
  ) {
    this.state = reset({ difficulty: initialDifficulty, phase: 'menu' }, randomSource).state;
  }

  get snapshot(): GameState {
    return this.state;
  }

  get accumulator(): number {
    return this.scheduler.accumulator;
  }

  get listenerCount(): number {
    return this.listeners.size;
  }

  subscribe(listener: SnapshotListener): () => void {
    this.listeners.add(listener);
    listener(this.state, []);

    return () => this.listeners.delete(listener);
  }

  dispatch(command: Command): boolean {
    const policy = PHASE_COMMAND_POLICY[this.state.phase][command.type];

    if (policy === 'ignore') {
      return false;
    }

    switch (command.type) {
      case 'selectDifficulty':
        this.replace(reset({ difficulty: command.difficulty, phase: 'menu' }, this.randomSource));
        this.scheduler.clear();
        return true;
      case 'start':
        this.replace(
          reset({ difficulty: this.state.difficulty, phase: 'ready' }, this.randomSource),
        );
        this.scheduler.clear();
        return true;
      case 'direction': {
        const result = enqueueDirection(this.state, command.direction);

        if (result.disposition === 'accepted') {
          this.state = result.state;
          this.publish([]);
        }

        // A routed direction is handled even when the domain rejects a reversal.
        return true;
      }
      case 'pause':
        this.pause();
        return true;
      case 'resume':
        this.resume();
        return true;
      case 'restart':
        this.replace(
          reset({ difficulty: this.state.difficulty, phase: 'ready' }, this.randomSource),
        );
        this.scheduler.clear();
        return true;
      case 'returnToMenu':
        this.replace(
          reset({ difficulty: this.state.difficulty, phase: 'menu' }, this.randomSource),
        );
        this.scheduler.clear();
        return true;
      case 'toggleMute':
        // Audio preference belongs to the DOM shell, not GameState.
        return true;
    }
  }

  advance(deltaMs: number): number {
    return this.scheduler.advance(deltaMs, {
      readState: () => this.state,
      runStep: () => {
        const result = step(this.state, this.randomSource);

        this.state = result.state;

        return result;
      },
      publish: (result) => this.publish(result.events),
    });
  }

  private pause(): void {
    this.state = { ...this.state, phase: 'paused', queuedDirections: [] };
    this.scheduler.clear();
    this.publish([]);
  }

  private resume(): void {
    this.state = { ...this.state, phase: 'playing', queuedDirections: [] };
    this.scheduler.clear();
    this.publish([]);
  }

  private replace(result: StepResult): void {
    this.state = result.state;
    this.publish(result.events);
  }

  private publish(events: readonly DomainEvent[]): void {
    for (const listener of this.listeners) {
      listener(this.state, events);
    }
  }
}
