export interface RandomSource {
  nextInt(upperExclusive: number): number;
}

/**
 * A mulberry32 generator for deterministic pseudo-random number generation.
 * It is a simple and reliable 32-bit generator that is fast and easy to seed.
 */
export function createMulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A RandomSource implementation that yields deterministic random values
 * starting from a specific numeric seed.
 */
export class SeededRandomSource implements RandomSource {
  private readonly rand: () => number;

  constructor(seed: number) {
    this.rand = createMulberry32(seed);
  }

  nextInt(upperExclusive: number): number {
    if (upperExclusive <= 0) {
      throw new Error(`upperExclusive must be greater than 0, got ${upperExclusive}`);
    }
    return Math.floor(this.rand() * upperExclusive);
  }
}

/**
 * A RandomSource implementation for expected-value checks, returning a pre-defined
 * sequence of numbers. Fails immediately on out-of-bounds or unexpected calls.
 */
export class ScriptedRandomSource implements RandomSource {
  private currentIndex = 0;
  private readonly script: ReadonlyArray<readonly [number, number]>;

  constructor(script: ReadonlyArray<readonly [number, number]>) {
    this.script = script;
  }

  nextInt(upperExclusive: number): number {
    if (this.currentIndex >= this.script.length) {
      throw new Error(
        `ScriptedRandomSource: unexpected nextInt(${upperExclusive}) call. Script completed (length ${this.script.length}).`,
      );
    }

    const nextTuple = this.script[this.currentIndex];
    if (nextTuple === undefined) {
      throw new Error(
        `ScriptedRandomSource: encountered undefined script tuple at index ${this.currentIndex}`,
      );
    }

    const [expectedUpper, returnValue] = nextTuple;
    if (upperExclusive !== expectedUpper) {
      throw new Error(
        `ScriptedRandomSource: expected nextInt(${expectedUpper}), got nextInt(${upperExclusive}) at call index ${this.currentIndex}`,
      );
    }

    if (returnValue < 0 || returnValue >= upperExclusive) {
      throw new Error(
        `ScriptedRandomSource: scripted return value ${returnValue} is out of bounds for nextInt(${upperExclusive}) at call index ${this.currentIndex}`,
      );
    }

    this.currentIndex++;
    return returnValue;
  }

  verifyCompleted(): void {
    if (this.currentIndex < this.script.length) {
      throw new Error(
        `ScriptedRandomSource: expected ${this.script.length} calls, but only ${this.currentIndex} were made.`,
      );
    }
  }
}
