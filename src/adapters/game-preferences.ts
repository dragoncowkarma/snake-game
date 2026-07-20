import type { Difficulty } from '../domain/index.ts';

export const STORAGE_NAMESPACE = 'snake-game:v1';

export const STORAGE_KEYS = {
  highScore: (difficulty: Difficulty): string => `${STORAGE_NAMESPACE}:high-score:${difficulty}`,
  muted: `${STORAGE_NAMESPACE}:muted`,
  lastDifficulty: `${STORAGE_NAMESPACE}:last-difficulty`,
} as const;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface GamePreferencesSnapshot {
  readonly bestScores: Readonly<Record<Difficulty, number>>;
  readonly muted: boolean;
  readonly lastDifficulty: Difficulty;
}

const DEFAULT_SNAPSHOT: GamePreferencesSnapshot = {
  bestScores: { slow: 0, normal: 0 },
  muted: false,
  lastDifficulty: 'normal',
};

function isDifficulty(value: unknown): value is Difficulty {
  return value === 'slow' || value === 'normal';
}

function isScore(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function readJson(storage: StorageLike | null, key: string): unknown {
  if (storage === null) {
    return undefined;
  }

  try {
    const rawValue = storage.getItem(key);

    return rawValue === null ? undefined : JSON.parse(rawValue);
  } catch {
    return undefined;
  }
}

/**
 * A browser-storage adapter with an always-available in-memory state. Storage is
 * intentionally treated as an optimization: security, quota, parse, and write
 * failures never escape into game progression.
 */
export class GamePreferences {
  private readonly bestScores: Record<Difficulty, number> = { ...DEFAULT_SNAPSHOT.bestScores };
  private muted = DEFAULT_SNAPSHOT.muted;
  private lastDifficulty = DEFAULT_SNAPSHOT.lastDifficulty;

  constructor(private readonly storage: StorageLike | null) {
    for (const difficulty of ['slow', 'normal'] as const) {
      const score = readJson(storage, STORAGE_KEYS.highScore(difficulty));

      if (isScore(score)) {
        this.bestScores[difficulty] = score;
      }
    }

    const muted = readJson(storage, STORAGE_KEYS.muted);

    if (typeof muted === 'boolean') {
      this.muted = muted;
    }

    const lastDifficulty = readJson(storage, STORAGE_KEYS.lastDifficulty);

    if (isDifficulty(lastDifficulty)) {
      this.lastDifficulty = lastDifficulty;
    }
  }

  get snapshot(): GamePreferencesSnapshot {
    return {
      bestScores: { ...this.bestScores },
      muted: this.muted,
      lastDifficulty: this.lastDifficulty,
    };
  }

  bestScore(difficulty: Difficulty): number {
    return this.bestScores[difficulty];
  }

  recordScore(difficulty: Difficulty, score: number): boolean {
    if (!isScore(score) || score <= this.bestScores[difficulty]) {
      return false;
    }

    this.bestScores[difficulty] = score;
    this.write(STORAGE_KEYS.highScore(difficulty), score);

    return true;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.write(STORAGE_KEYS.muted, muted);
  }

  setLastDifficulty(difficulty: Difficulty): void {
    this.lastDifficulty = difficulty;
    this.write(STORAGE_KEYS.lastDifficulty, difficulty);
  }

  private write(key: string, value: boolean | Difficulty | number): void {
    try {
      this.storage?.setItem(key, JSON.stringify(value));
    } catch {
      // The in-memory assignment already succeeded; persistence is best effort.
    }
  }
}
