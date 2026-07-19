import type { GameState } from '../domain/index.ts';

export const MAX_FRAME_DELTA_MS = 250;
export const MAX_STEPS_PER_FRAME = 3;

export interface StepResult {
  readonly state: GameState;
  readonly events: readonly import('../domain/index.ts').DomainEvent[];
}

export interface SchedulerDriver {
  readState(): GameState;
  runStep(): StepResult;
  publish(result: StepResult): void;
}

/**
 * Owns elapsed render time only. The domain remains the sole owner of movement,
 * collision, scoring, growth, speed, food, and terminal-state rules.
 */
export class FixedStepScheduler {
  private accumulatorMs = 0;

  get accumulator(): number {
    return this.accumulatorMs;
  }

  clear(): void {
    this.accumulatorMs = 0;
  }

  advance(deltaMs: number, driver: SchedulerDriver): number {
    if (driver.readState().phase !== 'playing') {
      return 0;
    }

    this.accumulatorMs += Math.min(Math.max(deltaMs, 0), MAX_FRAME_DELTA_MS);
    let stepsThisFrame = 0;

    while (driver.readState().phase === 'playing' && stepsThisFrame < MAX_STEPS_PER_FRAME) {
      // Capture before the domain transition: a newly accelerated speed is for the
      // following step, never the eligibility or time subtraction of this one.
      const stepDuration = driver.readState().tickMs;

      if (this.accumulatorMs < stepDuration) {
        break;
      }

      const result = driver.runStep();

      this.accumulatorMs -= stepDuration;
      stepsThisFrame += 1;
      driver.publish(result);
    }

    return stepsThisFrame;
  }
}
