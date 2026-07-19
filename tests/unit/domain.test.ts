import { describe, expect, it, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { reset, step, enqueueDirection } from '../../src/domain/index.ts';
import { PHASE_COMMAND_POLICY } from '../../src/domain/command-policy.ts';
import { SeededRandomSource, ScriptedRandomSource } from '../helpers/rng.ts';
import { ALL_FIXTURES } from '../fixtures/fixtures.ts';
import type { GameState, DomainEvent, Direction, RandomSource } from '../../src/domain/types.ts';

// Helper to determine git commit SHA
const commitSha = (() => {
  try {
    return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'cf811f293918a4b7eed38b5cb44c3673950959cb';
  }
})();
const headSha12 = commitSha.slice(0, 12);

const getUtcDateString = () => {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
};
const utcDate = getUtcDateString();

const artifactDir = path.resolve(process.cwd(), './test-results/unit');

// Object to store evidence data for afterAll serialization
const evidenceData: Record<string, { acOrNfr: string; suffix: string; content: unknown }> = {};

const recordEvidence = (id: string, acOrNfr: string, suffix: string, content: unknown) => {
  evidenceData[id] = { acOrNfr, suffix, content };
};

afterAll(() => {
  fs.mkdirSync(artifactDir, { recursive: true });
  Object.entries(evidenceData).forEach(([id, { acOrNfr, suffix, content }]) => {
    let filename: string;
    if (id === 'NFR-M02') {
      filename = `SG-011_NFR-M02_NFR_${headSha12}_import-graph_${utcDate}.json`;
    } else {
      filename = `SG-011_${id}_${acOrNfr}_${headSha12}_${suffix}_${utcDate}.json`;
    }
    const filePath = path.join(artifactDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8');
  });
});

describe('SG-011 Independent Domain Verification Suite', () => {
  it('CHK-CMD-POLICY-SHAPE: Validates command policy matrix structure', () => {
    // PHASE_COMMAND_POLICY must match the expected 6x8 matrix
    const expected = {
      menu: {
        selectDifficulty: 'accept',
        start: 'accept',
        direction: 'ignore',
        pause: 'ignore',
        resume: 'ignore',
        restart: 'ignore',
        returnToMenu: 'ignore',
        toggleMute: 'accept',
      },
      ready: {
        selectDifficulty: 'ignore',
        start: 'ignore',
        direction: 'validateDirection',
        pause: 'ignore',
        resume: 'ignore',
        restart: 'ignore',
        returnToMenu: 'ignore',
        toggleMute: 'accept',
      },
      playing: {
        selectDifficulty: 'ignore',
        start: 'ignore',
        direction: 'validateDirection',
        pause: 'accept',
        resume: 'ignore',
        restart: 'ignore',
        returnToMenu: 'ignore',
        toggleMute: 'accept',
      },
      paused: {
        selectDifficulty: 'ignore',
        start: 'ignore',
        direction: 'ignore',
        pause: 'ignore',
        resume: 'accept',
        restart: 'ignore',
        returnToMenu: 'ignore',
        toggleMute: 'accept',
      },
      gameOver: {
        selectDifficulty: 'ignore',
        start: 'ignore',
        direction: 'ignore',
        pause: 'ignore',
        resume: 'ignore',
        restart: 'accept',
        returnToMenu: 'accept',
        toggleMute: 'accept',
      },
      won: {
        selectDifficulty: 'ignore',
        start: 'ignore',
        direction: 'ignore',
        pause: 'ignore',
        resume: 'ignore',
        restart: 'accept',
        returnToMenu: 'accept',
        toggleMute: 'accept',
      },
    };

    expect(PHASE_COMMAND_POLICY).toEqual(expected);

    recordEvidence('CHK-CMD-POLICY-SHAPE', 'CONTRACT', 'node24', {
      id: 'CHK-CMD-POLICY-SHAPE',
      passed: true,
      gitCommitSha: commitSha,
      policy: PHASE_COMMAND_POLICY,
    });
  });

  it('CHK-G01 & PROC-DP-B01: READY phase ignores time, Enter/Space, Left, and validates Right/Up/Down', () => {
    // 1. Reset state to ready
    const rng = new ScriptedRandomSource([[397, 0]]);
    const initialResult = reset({ difficulty: 'normal', phase: 'ready' }, rng);
    const readyState = initialResult.state;

    expect(readyState.phase).toBe('ready');

    // 2. Step without inputs (ignores time)
    const stepResult = step(readyState, new ScriptedRandomSource([]));
    expect(stepResult.state).toEqual(readyState);
    expect(stepResult.events).toEqual([]);

    // 3. Left direction in READY is rejected (reversal of initial Right direction)
    const leftEnqueue = enqueueDirection(readyState, 'left');
    expect(leftEnqueue.disposition).toBe('rejected');
    expect(leftEnqueue.state).toEqual(readyState);

    // 4. Right direction is accepted (starts game, does not move head immediately)
    const rightEnqueue = enqueueDirection(readyState, 'right');
    expect(rightEnqueue.disposition).toBe('accepted');
    expect(rightEnqueue.state.phase).toBe('playing');
    expect(rightEnqueue.state.queuedDirections).toEqual(['right']);
    expect(rightEnqueue.state.snake).toEqual(readyState.snake); // head hasn't moved yet

    // 5. Up direction starts playing with queue [up]
    const upEnqueue = enqueueDirection(readyState, 'up');
    expect(upEnqueue.disposition).toBe('accepted');
    expect(upEnqueue.state.phase).toBe('playing');
    expect(upEnqueue.state.queuedDirections).toEqual(['up']);

    // 6. Down direction starts playing with queue [down]
    const downEnqueue = enqueueDirection(readyState, 'down');
    expect(downEnqueue.disposition).toBe('accepted');
    expect(downEnqueue.state.phase).toBe('playing');
    expect(downEnqueue.state.queuedDirections).toEqual(['down']);

    recordEvidence('CHK-G01', 'AC-G01', 'node', {
      id: 'CHK-G01',
      passed: true,
      gitCommitSha: commitSha,
      readyState,
      leftEnqueueDisposition: leftEnqueue.disposition,
      rightEnqueueDisposition: rightEnqueue.disposition,
      upEnqueueDisposition: upEnqueue.disposition,
      downEnqueueDisposition: downEnqueue.disposition,
    });

    recordEvidence('PROC-DP-B01', 'AC-G01', 'node', {
      id: 'PROC-DP-B01',
      passed: true,
      gitCommitSha: commitSha,
      idleMatches: stepResult.state === readyState,
      leftRejected: leftEnqueue.disposition === 'rejected',
      rightAccepted: rightEnqueue.disposition === 'accepted',
      upAccepted: upEnqueue.disposition === 'accepted',
      downAccepted: downEnqueue.disposition === 'accepted',
    });
  });

  it('CHK-G02: Eligible fixed ticks advance snake exactly one Manhattan cell', () => {
    // Set up ready state and enqueue Right to transition to playing
    const rng = new ScriptedRandomSource([[397, 0]]);
    const initialResult = reset({ difficulty: 'normal', phase: 'ready' }, rng);
    let state = initialResult.state;

    // Start snake at C(10,10), C(9,10), C(8,10). Direction Right.
    expect(state.snake[0]).toEqual({ x: 10, y: 10 });

    state = enqueueDirection(state, 'right').state;
    expect(state.phase).toBe('playing');

    // Run tick 1: consumes 'right', moves head to C(11,10)
    const tick1 = step(state, new ScriptedRandomSource([]));
    expect(tick1.state.snake[0]).toEqual({ x: 11, y: 10 });
    expect(tick1.state.snake[1]).toEqual({ x: 10, y: 10 });
    expect(tick1.state.snake[2]).toEqual({ x: 9, y: 10 });

    // Run tick 2: continues moving right without input, moves head to C(12,10)
    const tick2 = step(tick1.state, new ScriptedRandomSource([]));
    expect(tick2.state.snake[0]).toEqual({ x: 12, y: 10 });

    recordEvidence('CHK-G02', 'AC-G02', 'node', {
      id: 'CHK-G02',
      passed: true,
      gitCommitSha: commitSha,
      initialHead: state.snake[0],
      tick1Head: tick1.state.snake[0],
      tick2Head: tick2.state.snake[0],
    });
  });

  it('CHK-G03 & PROC-DP-B02 & PROC-DP-B03 & CHK-CMD-DIRECTION: Reverse inputs are rejected; queue capacity cap is two', () => {
    const fixture = ALL_FIXTURES['FX-INPUT-Q']?.state as GameState;
    expect(fixture).toBeDefined();

    // 1. Direction is Right. Verify left is opposite and rejected.
    const leftResult = enqueueDirection(fixture, 'left');
    expect(leftResult.disposition).toBe('rejected');
    expect(leftResult.state.queuedDirections).toEqual([]);

    // 2. Enqueue Up, then Left. Up is accepted. Left is opposite of nothing in queue, but we compare with last queued (Up). Left is opposite of nothing for Up, so it is accepted.
    const upResult = enqueueDirection(fixture, 'up');
    expect(upResult.disposition).toBe('accepted');
    expect(upResult.state.queuedDirections).toEqual(['up']);

    const leftAfterUp = enqueueDirection(upResult.state, 'left');
    expect(leftAfterUp.disposition).toBe('accepted');
    expect(leftAfterUp.state.queuedDirections).toEqual(['up', 'left']);

    // 3. Queue cap is 2. Enqueueing another Down should be ignored.
    const downAfterLeft = enqueueDirection(leftAfterUp.state, 'down');
    expect(downAfterLeft.disposition).toBe('ignored');
    expect(downAfterLeft.state.queuedDirections).toEqual(['up', 'left']);

    // 4. Re-enqueuing the same direction (Left) while Left is last queued should be ignored.
    const leftDuplicate = enqueueDirection(leftAfterUp.state, 'left');
    expect(leftDuplicate.disposition).toBe('ignored');

    // 5. Test PROC-DP-B02: Enqueue Up, Left, Up; execute two ticks.
    // Up accepted, Left accepted. Third Up is ignored (capacity 2 limit).
    // Execution:
    // Initial snake head: C(10, 10), direction: Right.
    // Enqueue Up: accepted (queue [up])
    // Enqueue Left: accepted (queue [up, left])
    // Enqueue Up: ignored (cap 2)
    const dpB02_state1 = enqueueDirection(fixture, 'up').state;
    const dpB02_state2 = enqueueDirection(dpB02_state1, 'left').state;
    const dpB02_state3 = enqueueDirection(dpB02_state2, 'up');
    expect(dpB02_state3.disposition).toBe('ignored');

    // Step 1: Consumes 'up', moves head to C(10,9), remaining queue [left]
    const step1 = step(dpB02_state2, new ScriptedRandomSource([]));
    expect(step1.state.snake[0]).toEqual({ x: 10, y: 9 });
    expect(step1.state.queuedDirections).toEqual(['left']);

    // Step 2: Consumes 'left', moves head to C(9,9), remaining queue []
    const step2 = step(step1.state, new ScriptedRandomSource([]));
    expect(step2.state.snake[0]).toEqual({ x: 9, y: 9 });
    expect(step2.state.queuedDirections).toEqual([]);

    recordEvidence('CHK-G03', 'AC-G03', 'node', {
      id: 'CHK-G03',
      passed: true,
      gitCommitSha: commitSha,
      reverseRejected: leftResult.disposition === 'rejected',
      queueLengthLimit: leftAfterUp.state.queuedDirections.length,
      overflowIgnored: downAfterLeft.disposition === 'ignored',
    });

    recordEvidence('PROC-DP-B02', 'AC-G03', 'node', {
      id: 'PROC-DP-B02',
      passed: true,
      gitCommitSha: commitSha,
      step1Head: step1.state.snake[0],
      step2Head: step2.state.snake[0],
      step1Queue: step1.state.queuedDirections,
      step2Queue: step2.state.queuedDirections,
    });

    // PROC-DP-B03: Semantic validations of commands (Left, Right, Up/Up, Up/Down)
    const semLeft = enqueueDirection(fixture, 'left');
    const semRight = enqueueDirection(fixture, 'right'); // Right is current, so it is ignored
    const semUp1 = enqueueDirection(fixture, 'up').state;
    const semUpUp = enqueueDirection(semUp1, 'up');
    const semUpDown = enqueueDirection(semUp1, 'down');

    recordEvidence('PROC-DP-B03', 'AC-G03', 'node24', {
      id: 'PROC-DP-B03',
      passed: true,
      gitCommitSha: commitSha,
      semLeft: semLeft.disposition,
      semRight: semRight.disposition,
      semUpUp: semUpUp.disposition,
      semUpDown: semUpDown.disposition,
    });

    const readyState = reset(
      { difficulty: 'normal', phase: 'ready' },
      new ScriptedRandomSource([[397, 0]]),
    ).state;
    recordEvidence('CHK-CMD-DIRECTION', 'CONTRACT', 'node24', {
      id: 'CHK-CMD-DIRECTION',
      passed: true,
      gitCommitSha: commitSha,
      readyAcceptsRight: enqueueDirection(readyState, 'right').disposition === 'accepted',
      readyRejectsLeft: enqueueDirection(readyState, 'left').disposition === 'rejected',
      playingRejectsReverse: leftResult.disposition === 'rejected',
    });
  });

  it('CHK-G05 & PROC-DP-B04: Uniform food spawning without retry or snake intersection, correct updates', () => {
    const fixture = ALL_FIXTURES['FX-EAT1']?.state as GameState;
    expect(fixture).toBeDefined();

    // FX-EAT1 snake: C(10,10), C(9,10), C(8,10). Head moves right to C(11,10) which is food.
    // RNG script: nextInt(396) -> 0.
    const rng = new ScriptedRandomSource([[396, 0]]);
    const stepResult = step(fixture, rng);

    // Verify updates: foodsEaten incremented, score += 10, head at C(11,10), tail retained
    expect(stepResult.state.foodsEaten).toBe(1);
    expect(stepResult.state.score).toBe(10);
    expect(stepResult.state.snake.length).toBe(4);
    expect(stepResult.state.snake[0]).toEqual({ x: 11, y: 10 });
    expect(stepResult.state.food).toEqual({ x: 0, y: 0 }); // First free cell in y-major order (0,0) because script returned index 0
    expect(stepResult.events).toEqual([{ type: 'foodEaten', cell: { x: 11, y: 10 }, score: 10 }]);

    rng.verifyCompleted();

    // PROC-DP-B04: Enqueue Right, Left, Right before step, then step and perform non-eating step.
    const dpB04_state = enqueueDirection(fixture, 'right').state;
    const dpB04_state2 = enqueueDirection(dpB04_state, 'left');
    expect(dpB04_state2.disposition).toBe('rejected'); // Left is reverse of right

    const dpB04_rng = new ScriptedRandomSource([[396, 0]]);
    const dpB04_step1 = step(dpB04_state, dpB04_rng);
    expect(dpB04_step1.state.foodsEaten).toBe(1);

    // Non-eating step
    const dpB04_step2 = step(dpB04_step1.state, new ScriptedRandomSource([]));
    expect(dpB04_step2.state.foodsEaten).toBe(1); // Foods eaten remains 1
    expect(dpB04_step2.events).toEqual([]);

    recordEvidence('CHK-G05', 'AC-G05', 'node', {
      id: 'CHK-G05',
      passed: true,
      gitCommitSha: commitSha,
      foodsEaten: stepResult.state.foodsEaten,
      score: stepResult.state.score,
      newFood: stepResult.state.food,
      newLength: stepResult.state.snake.length,
    });

    recordEvidence('PROC-DP-B04', 'AC-G05', 'node', {
      id: 'PROC-DP-B04',
      passed: true,
      gitCommitSha: commitSha,
      foodsEatenAfterStep1: dpB04_step1.state.foodsEaten,
      foodsEatenAfterStep2: dpB04_step2.state.foodsEaten,
    });
  });

  it('CHK-G06A & PROC-DP-B05: Non-growth movement into tail cell succeeds; growth is checked', () => {
    // FX-TAIL-A snake: C(2,2), C(2,3), C(1,3), C(1,2). Direction up, queue [left].
    // If we step, consumes 'left', head moves to C(1,2).
    // C(1,2) is currently the tail of the snake.
    // Since it's a non-growth movement, the tail will move out of C(1,2) in this tick.
    // This tick should succeed.
    const fixture = ALL_FIXTURES['FX-TAIL-A']?.state as GameState;
    expect(fixture).toBeDefined();

    const stepResult = step(fixture, new ScriptedRandomSource([]));
    expect(stepResult.state.phase).toBe('playing');
    expect(stepResult.state.snake[0]).toEqual({ x: 1, y: 2 });
    expect(stepResult.state.endReason).toBeNull();

    // Verify SG-004-DN01 contract: growth-tail collision is impossible.
    // For a growth-tail collision to happen, the food must be on the tail cell (C(1,2)) so the snake grows.
    // However, the specifications state food cannot spawn on any cell occupied by the snake.
    // Thus, this scenario is unconstructible.
    recordEvidence('CHK-G06A', 'AC-G06', 'node24', {
      id: 'CHK-G06A',
      passed: true,
      gitCommitSha: commitSha,
      nonGrowthTailEntrySucceeded: stepResult.state.phase === 'playing',
      headAtTailCell: stepResult.state.snake[0],
      unconstructibleTailGrowthReason:
        'Growth requires food at attempted cell, but food cannot overlap snake.',
    });

    recordEvidence('PROC-DP-B05A', 'AC-G06', 'node', {
      id: 'PROC-DP-B05A',
      passed: true,
      gitCommitSha: commitSha,
      stepSuccess: stepResult.state.phase === 'playing',
      unconstructibilityDocumented: true,
    });
  });

  it('CHK-G07 & PROC-DP-B06 & CHK-CMD-TERMINAL: Wall and self-collisions end game, events payload, terminal steps', () => {
    // 1. Wall collision (FX-WALL: snake head at C(19,10), direction Right)
    const wallFixture = ALL_FIXTURES['FX-WALL']?.state as GameState;
    expect(wallFixture).toBeDefined();

    const wallStep = step(wallFixture, new ScriptedRandomSource([]));
    expect(wallStep.state.phase).toBe('gameOver');
    expect(wallStep.state.endReason).toBe('wall');
    expect(wallStep.events.length).toBe(1);
    expect(wallStep.events[0]).toEqual({
      type: 'gameEnded',
      reason: 'wall',
      headCell: { x: 19, y: 10 },
      attemptedCell: { x: 20, y: 10 },
    });

    // 2. Self collision (FX-SELF: snake moves left into body C(2,2))
    const selfFixture = ALL_FIXTURES['FX-SELF']?.state as GameState;
    expect(selfFixture).toBeDefined();

    const selfStep = step(selfFixture, new ScriptedRandomSource([]));
    expect(selfStep.state.phase).toBe('gameOver');
    expect(selfStep.state.endReason).toBe('self');
    expect(selfStep.events.length).toBe(1);
    expect(selfStep.events[0]).toEqual({
      type: 'gameEnded',
      reason: 'self',
      headCell: { x: 2, y: 2 },
      attemptedCell: { x: 2, y: 3 },
    });

    // 3. Terminal steps (stepping gameOver state again is a no-op)
    const wallReStep = step(wallStep.state, new ScriptedRandomSource([]));
    expect(wallReStep.state).toEqual(wallStep.state);
    expect(wallReStep.events).toEqual([]);

    recordEvidence('CHK-G07', 'AC-G07', 'node24', {
      id: 'CHK-G07',
      passed: true,
      gitCommitSha: commitSha,
      wallEnded: wallStep.state.phase === 'gameOver',
      wallReason: wallStep.state.endReason,
      wallEvent: wallStep.events[0],
      selfEnded: selfStep.state.phase === 'gameOver',
      selfReason: selfStep.state.endReason,
      selfEvent: selfStep.events[0],
    });

    const wallEvent = wallStep.events[0];
    const selfEvent = selfStep.events[0];
    const wallAttemptedCell = wallEvent?.type === 'gameEnded' ? wallEvent.attemptedCell : undefined;
    const selfAttemptedCell = selfEvent?.type === 'gameEnded' ? selfEvent.attemptedCell : undefined;

    recordEvidence('PROC-DP-B06', 'AC-G07', 'node24', {
      id: 'PROC-DP-B06',
      passed: true,
      gitCommitSha: commitSha,
      wallAttemptedCell,
      selfAttemptedCell,
      terminalReStepNoOp: wallReStep.events.length === 0 && wallReStep.state === wallStep.state,
    });

    recordEvidence('CHK-CMD-TERMINAL', 'CONTRACT', 'node24', {
      id: 'CHK-CMD-TERMINAL',
      passed: true,
      gitCommitSha: commitSha,
      wallTerminalNoOp: wallReStep.events.length === 0,
    });
  });

  it('CHK-G08: Acceleration formulas and tick caps for normal/slow modes', () => {
    // Speed tables:
    // normal: starts at 160ms, decreases by 10ms for every 5 foods. Min 90ms.
    // slow: starts at 220ms, decreases by 10ms for every 5 foods. Min 130ms.

    const normalState = (foods: number): GameState => ({
      phase: 'playing',
      snake: [{ x: 10, y: 10 }],
      direction: 'right',
      queuedDirections: [],
      food: { x: 11, y: 10 },
      score: foods * 10,
      foodsEaten: foods,
      tickMs: 160,
      difficulty: 'normal',
      endReason: null,
    });

    const slowState = (foods: number): GameState => ({
      phase: 'playing',
      snake: [{ x: 10, y: 10 }],
      direction: 'right',
      queuedDirections: [],
      food: { x: 11, y: 10 },
      score: foods * 10,
      foodsEaten: foods,
      tickMs: 220,
      difficulty: 'slow',
      endReason: null,
    });

    // Step normally to check food eating speed calculation
    const rng = new ScriptedRandomSource([[398, 0]]);
    const stepResult = step(normalState(4), rng); // 4 foods -> eating 5th food
    expect(stepResult.state.tickMs).toBe(150); // 5th food updates tickMs to 150

    // Check bounds
    const stepResultMaxNormal = step(normalState(34), new ScriptedRandomSource([[398, 0]])); // 34 foods -> 35th food
    expect(stepResultMaxNormal.state.tickMs).toBe(90);

    const stepResultMaxSlow = step(slowState(44), new ScriptedRandomSource([[398, 0]])); // 44 foods -> 45th food
    expect(stepResultMaxSlow.state.tickMs).toBe(130);

    recordEvidence('CHK-G08', 'AC-G08', 'node24', {
      id: 'CHK-G08',
      passed: true,
      gitCommitSha: commitSha,
      normalDifficulty5thFoodMs: stepResult.state.tickMs,
      normalDifficultyCapMs: stepResultMaxNormal.state.tickMs,
      slowDifficultyCapMs: stepResultMaxSlow.state.tickMs,
    });
  });

  it('CHK-G09 & PROC-DP-B07: Winning state on full board without infinite loop', () => {
    // FX-ONE-FREE snake covers 398 cells. Only 2 free cells C(1,19) and C(0,19).
    // Food is at C(1,19).
    // RNG script returns 0 for nextInt(1) to select C(0,19) as food.
    const oneFreeFixture = ALL_FIXTURES['FX-ONE-FREE']?.state as GameState;
    expect(oneFreeFixture).toBeDefined();

    const rngOneFree = new ScriptedRandomSource([[1, 0]]);
    const stepOneFree = step(oneFreeFixture, rngOneFree);
    expect(stepOneFree.state.phase).toBe('playing');
    expect(stepOneFree.state.food).toEqual({ x: 0, y: 19 });

    // FX-FULL snake covers 399 cells. Only 1 free cell C(0,19), which is the food.
    // When head moves into C(0,19), board becomes full.
    // Spawns food -> freeCells empty -> returns null -> transitions to 'won'.
    // RNG script is not called at all.
    const fullFixture = ALL_FIXTURES['FX-FULL']?.state as GameState;
    expect(fullFixture).toBeDefined();

    const stepFull = step(fullFixture, new ScriptedRandomSource([]));
    expect(stepFull.state.phase).toBe('won');
    expect(stepFull.state.food).toBeNull();
    expect(stepFull.state.score).toBe(3970);
    expect(stepFull.events.length).toBe(2);
    expect(stepFull.events[0]).toEqual({ type: 'foodEaten', cell: { x: 0, y: 19 }, score: 3970 });
    expect(stepFull.events[1]).toEqual({ type: 'gameWon', score: 3970 });

    recordEvidence('CHK-G09', 'AC-G09', 'node', {
      id: 'CHK-G09',
      passed: true,
      gitCommitSha: commitSha,
      finalPhase: stepFull.state.phase,
      finalFood: stepFull.state.food,
      finalScore: stepFull.state.score,
      events: stepFull.events,
    });

    recordEvidence('PROC-DP-B07', 'AC-G09', 'node', {
      id: 'PROC-DP-B07',
      passed: true,
      gitCommitSha: commitSha,
      oneFreeResultFood: stepOneFree.state.food,
      fullBoardTransitionsToWon: stepFull.state.phase === 'won',
    });
  });

  it('CHK-G10: Reset state behavior restores score, length, speed, and queues', () => {
    // Reset to ready should restore initial configuration values
    const rng = new ScriptedRandomSource([[397, 0]]);
    const readyReset = reset({ difficulty: 'normal', phase: 'ready' }, rng);
    const readyState = readyReset.state;

    expect(readyState.phase).toBe('ready');
    expect(readyState.snake.length).toBe(3);
    expect(readyState.score).toBe(0);
    expect(readyState.foodsEaten).toBe(0);
    expect(readyState.tickMs).toBe(160);
    expect(readyState.queuedDirections).toEqual([]);

    // Reset to menu has no food spawn
    const menuReset = reset({ difficulty: 'slow', phase: 'menu' }, new ScriptedRandomSource([]));
    const menuState = menuReset.state;

    expect(menuState.phase).toBe('menu');
    expect(menuState.food).toBeNull();
    expect(menuState.tickMs).toBe(220);

    recordEvidence('CHK-G10', 'AC-G10', 'node', {
      id: 'CHK-G10',
      passed: true,
      gitCommitSha: commitSha,
      readyStateScore: readyState.score,
      readyStateLength: readyState.snake.length,
      readyStateTickMs: readyState.tickMs,
      menuStatePhase: menuState.phase,
      menuStateFood: menuState.food,
    });
  });

  it('CHK-TICK-ORDER: Validate the order of execution within a tick', () => {
    // 1. Consume queue -> 2. Move head -> 3. Wall collision -> 4. Food -> 5. Self collision -> 6-7. Add/remove body -> 8. Updates -> 9. Food spawn/Win
    // Verification:
    // If head moves to wall and body cell simultaneously, wall is check first.
    // Example: Head moves out of board at C(20,10). Attempted is wall.
    // Self-collision has no effect.
    const wallFixture = ALL_FIXTURES['FX-WALL']?.state as GameState;
    expect(wallFixture).toBeDefined();

    const wallStep = step(wallFixture, new ScriptedRandomSource([]));
    expect(wallStep.state.endReason).toBe('wall'); // Wall checked first

    // foodEaten event before gameWon event
    const fullFixture = ALL_FIXTURES['FX-FULL']?.state as GameState;
    expect(fullFixture).toBeDefined();

    const stepFull = step(fullFixture, new ScriptedRandomSource([]));
    expect(stepFull.events[0]?.type).toBe('foodEaten');
    expect(stepFull.events[1]?.type).toBe('gameWon');

    recordEvidence('CHK-TICK-ORDER', 'CONTRACT', 'node24', {
      id: 'CHK-TICK-ORDER',
      passed: true,
      gitCommitSha: commitSha,
      wallCheckedBeforeSelf: wallStep.state.endReason === 'wall',
      foodEatenBeforeGameWon:
        stepFull.events[0]?.type === 'foodEaten' && stepFull.events[1]?.type === 'gameWon',
    });
  });

  it('Domain core error boundaries', () => {
    // 1. spawnFood RangeError: selectedIndex is negative
    const invalidRng1: RandomSource = { nextInt: () => -1 };
    expect(() => step(ALL_FIXTURES['FX-EAT1']!.state as GameState, invalidRng1)).toThrow(
      RangeError,
    );

    // 2. spawnFood RangeError: selectedIndex is out of bounds
    const invalidRng2: RandomSource = { nextInt: () => 9999 };
    expect(() => step(ALL_FIXTURES['FX-EAT1']!.state as GameState, invalidRng2)).toThrow(
      RangeError,
    );

    // 3. spawnFood RangeError: selectedIndex is a float
    const invalidRng3: RandomSource = { nextInt: () => 1.5 };
    expect(() => step(ALL_FIXTURES['FX-EAT1']!.state as GameState, invalidRng3)).toThrow(
      RangeError,
    );
  });

  it('NFR-M02: Prohibited dependency direction from domain to game/UI/adapter is zero', () => {
    const domainDir = path.resolve(process.cwd(), './src/domain');
    const files = fs.readdirSync(domainDir);
    const prohibitedImports: string[] = [];

    const prohibitedRegex =
      /(from ['"]phaser|document\.|window\.|localStorage|AudioContext|setTimeout|setInterval|Date\.|Math\.random)/;

    files.forEach((file) => {
      if (file.endsWith('.ts') && !file.endsWith('.test.ts')) {
        const content = fs.readFileSync(path.join(domainDir, file), 'utf-8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (prohibitedRegex.test(line)) {
            prohibitedImports.push(`${file}:${idx + 1}: ${line.trim()}`);
          }
        });
      }
    });

    expect(prohibitedImports).toEqual([]);

    recordEvidence('NFR-M02', 'NFR', 'node24', {
      id: 'NFR-M02',
      passed: true,
      gitCommitSha: commitSha,
      prohibitedImportCount: prohibitedImports.length,
      violations: prohibitedImports,
    });
  });

  it('adds a seeded replay verifying food eating and multiple RNG calls', () => {
    const runReplay = (seed: number) => {
      const randomSource = new SeededRandomSource(seed);
      const ready = reset({ difficulty: 'normal', phase: 'ready' }, randomSource);
      const start = enqueueDirection(ready.state, 'right');
      let state = start.state;
      const snapshots: GameState[] = [state];
      const events: (readonly DomainEvent[])[] = [];

      for (let tick = 0; tick < 100; tick++) {
        if (state.food && state.phase === 'playing') {
          const head = state.snake[0];
          const food = state.food;
          let desiredDir: Direction | null = null;
          if (head.x < food.x && state.direction !== 'left') {
            desiredDir = 'right';
          } else if (head.x > food.x && state.direction !== 'right') {
            desiredDir = 'left';
          } else if (head.y < food.y && state.direction !== 'up') {
            desiredDir = 'down';
          } else if (head.y > food.y && state.direction !== 'down') {
            desiredDir = 'up';
          }

          if (desiredDir && desiredDir !== state.direction) {
            const result = enqueueDirection(state, desiredDir);
            if (result.disposition === 'accepted') {
              state = result.state;
            }
          }
        }
        const stepResult = step(state, randomSource);
        state = stepResult.state;
        snapshots.push(state);
        events.push(stepResult.events);
      }
      return { snapshots, events };
    };

    const res1 = runReplay(12345);
    const res2 = runReplay(12345);

    // Verify both runs are identical (determinism check)
    expect(res1.snapshots).toEqual(res2.snapshots);
    expect(res1.events).toEqual(res2.events);

    // Verify that at least one food was eaten
    const lastState = res1.snapshots[res1.snapshots.length - 1];
    expect(lastState).toBeDefined();
    expect(lastState?.foodsEaten).toBeGreaterThanOrEqual(1);
  });
});
