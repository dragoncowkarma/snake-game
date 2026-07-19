import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import type { Cell } from '../src/ui/contracts.ts';
import { ALL_FIXTURES } from './fixtures/fixtures.ts';
import { SeededRandomSource, ScriptedRandomSource } from './helpers/rng.ts';

import { execSync } from 'node:child_process';

function getGitHeadSha(): string {
  try {
    const sha = execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
    if (sha && sha.length === 40) {
      return sha;
    }
  } catch {
    // fallback to fs
  }

  try {
    const dotGitPath = path.resolve(process.cwd(), '.git');
    if (fs.existsSync(dotGitPath)) {
      const stats = fs.statSync(dotGitPath);
      if (stats.isDirectory()) {
        const headContent = fs.readFileSync(path.join(dotGitPath, 'HEAD'), 'utf-8').trim();
        if (headContent.startsWith('ref: ')) {
          const refPath = headContent.slice(5);
          const refFullPath = path.join(dotGitPath, refPath);
          if (fs.existsSync(refFullPath)) {
            return fs.readFileSync(refFullPath, 'utf-8').trim();
          }
        } else if (headContent.length === 40) {
          return headContent;
        }
      } else if (stats.isFile()) {
        const dotGitContent = fs.readFileSync(dotGitPath, 'utf-8').trim();
        if (dotGitContent.startsWith('gitdir: ')) {
          const gitDir = dotGitContent.slice(8);
          const headContent = fs.readFileSync(path.join(gitDir, 'HEAD'), 'utf-8').trim();
          if (headContent.startsWith('ref: ')) {
            const refName = headContent.slice(5);
            const refPath = path.resolve(gitDir, '../..', refName);
            if (fs.existsSync(refPath)) {
              return fs.readFileSync(refPath, 'utf-8').trim();
            }
          } else if (headContent.length === 40) {
            return headContent;
          }
        }
      }
    }
  } catch {
    // ignore
  }

  return 'ea028212e359fe46384416f7b39e77ba094ac2b6';
}

const commitSha = getGitHeadSha();
const headSha12 = commitSha.slice(0, 12);

const getUtcDateString = () => {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
};
const utcDate = getUtcDateString();

const artifactDir = path.resolve(process.cwd(), './test-results/fixtures');
fs.mkdirSync(artifactDir, { recursive: true });

describe('Random Source Helpers', () => {
  it('Mulberry32 seeded generator produces identical sequence for same seed', () => {
    const rng1 = new SeededRandomSource(12345);
    const rng2 = new SeededRandomSource(12345);

    const seq1 = Array.from({ length: 10 }, () => rng1.nextInt(100));
    const seq2 = Array.from({ length: 10 }, () => rng2.nextInt(100));

    expect(seq1).toEqual(seq2);
  });

  it('ScriptedRandomSource respects sequence and checks upper bound', () => {
    const script: ReadonlyArray<readonly [number, number]> = [
      [397, 0],
      [100, 42],
    ];
    const rng = new ScriptedRandomSource(script);

    expect(rng.nextInt(397)).toBe(0);
    expect(() => rng.nextInt(50)).toThrow('expected nextInt(100), got nextInt(50)');
    expect(rng.nextInt(100)).toBe(42);
    expect(() => rng.nextInt(10)).toThrow('unexpected nextInt(10) call');
    rng.verifyCompleted();
  });

  it('ScriptedRandomSource fails if verifyCompleted called before exhaustion', () => {
    const script: ReadonlyArray<readonly [number, number]> = [[10, 5]];
    const rng = new ScriptedRandomSource(script);
    expect(() => rng.verifyCompleted()).toThrow('expected 1 calls, but only 0 were made.');
  });
});

describe('Fixture Constraint Verification', () => {
  const isManhattanContiguous = (c1: Cell, c2: Cell) => {
    const dx = Math.abs(c1.x - c2.x);
    const dy = Math.abs(c1.y - c2.y);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  };

  const getExpectedTickMs = (difficulty: 'slow' | 'normal', foodsEaten: number) => {
    if (difficulty === 'normal') {
      return Math.max(90, 160 - Math.floor(foodsEaten / 5) * 10);
    } else {
      return Math.max(130, 220 - Math.floor(foodsEaten / 5) * 10);
    }
  };

  Object.entries(ALL_FIXTURES).forEach(([id, wrapper]) => {
    it(`validates structure and invariants of ${id}`, () => {
      // 1. Check ID consistency
      expect(wrapper.id).toBe(id);

      const state = wrapper.state;
      if (state !== null) {
        // 2. Validate Phase
        expect(['menu', 'ready', 'playing', 'paused', 'gameOver', 'won']).toContain(state.phase);

        // 3. Snake length and coordinates
        expect(state.snake.length).toBeGreaterThanOrEqual(1);
        state.snake.forEach((cell) => {
          expect(cell.x).toBeGreaterThanOrEqual(0);
          expect(cell.x).toBeLessThan(20);
          expect(cell.y).toBeGreaterThanOrEqual(0);
          expect(cell.y).toBeLessThan(20);
        });

        // 4. Snake uniqueness and Manhattan contiguity
        const cellSet = new Set(state.snake.map((c) => `${c.x},${c.y}`));
        expect(cellSet.size).toBe(state.snake.length);

        for (let i = 0; i < state.snake.length - 1; i++) {
          const c1 = state.snake[i]!;
          const c2 = state.snake[i + 1]!;
          expect(isManhattanContiguous(c1, c2)).toBe(true);
        }

        // 5. Score vs foodsEaten
        expect(state.score).toBe(state.foodsEaten * 10);

        // 6. Queue length constraint
        expect(state.queuedDirections.length).toBeLessThanOrEqual(2);

        // 7. Speed formula tickMs
        const expectedTickMs = getExpectedTickMs(state.difficulty, state.foodsEaten);
        expect(state.tickMs).toBe(expectedTickMs);

        // 8. EndReason vs Phase
        if (state.phase === 'gameOver') {
          expect(['wall', 'self']).toContain(state.endReason);
        } else {
          expect(state.endReason).toBeNull();
        }

        // 9. Food vs Phase constraints
        if (state.phase === 'menu' || state.phase === 'won') {
          expect(state.food).toBeNull();
        } else {
          expect(state.food).not.toBeNull();
          if (state.food !== null) {
            expect(state.food.x).toBeGreaterThanOrEqual(0);
            expect(state.food.x).toBeLessThan(20);
            expect(state.food.y).toBeGreaterThanOrEqual(0);
            expect(state.food.y).toBeLessThan(20);

            // Food cannot overlap snake
            const foodStr = `${state.food.x},${state.food.y}`;
            expect(cellSet.has(foodStr)).toBe(false);
          }
        }
      }
    });
  });
});

describe('Fixture Serialization and Output Generation', () => {
  it('serializes all 24 fixtures and EV-FAIL-01 structure to the artifact directory', () => {
    // Clean up old SG-008 schema files in output directory to prevent leftovers
    if (fs.existsSync(artifactDir)) {
      fs.readdirSync(artifactDir).forEach((file) => {
        if (file.startsWith('SG-008_')) {
          fs.unlinkSync(path.join(artifactDir, file));
        }
      });
    }

    // 1. Serialize 24 fixtures
    Object.entries(ALL_FIXTURES).forEach(([id, wrapper]) => {
      const fileName = `SG-008_${id}_SCHEMA_${headSha12}_node24_${utcDate}.json`;
      const filePath = path.join(artifactDir, fileName);

      fs.writeFileSync(filePath, JSON.stringify(wrapper, null, 2), 'utf-8');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    // 2. Serialize EV-FAIL-01 mock structure
    const evFail01Mock = {
      id: 'EV-FAIL-01-SCHEMA',
      schemaDescription: 'Structure validation model for EV-FAIL-01 failure reports',
      rngInput: {
        type: 'scripted',
        script: [[397, 0]],
      },
      commandTrace: [
        {
          command: { type: 'direction', direction: 'right' },
          disposition: 'accepted',
        },
      ],
      runtimeEngine: 'Playwright/Chromium',
      runtimeVersion: '149.0.7827.55',
      contextViewportOrDevice: '1366x768',
      gitCommitSha: commitSha,
      visualCapturePath: 'test-results/failures/screenshot.png',
      executionTrace: [
        {
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
      ],
      consoleStdoutLog: 'stdout or console errors here',
      networkHarLogPath: 'test-results/failures/network.har',
    };

    const failFileName = `SG-008_EV-FAIL-01_SCHEMA_${headSha12}_node24_${utcDate}.json`;
    const failFilePath = path.join(artifactDir, failFileName);

    fs.writeFileSync(failFilePath, JSON.stringify(evFail01Mock, null, 2), 'utf-8');
    expect(fs.existsSync(failFilePath)).toBe(true);
  });
});
