/**
 * SG-006's handoff (docs/coordination/handoffs/SG-006.md, "실제 게임플레이로 focus/
 * aria-live/Command 라우팅을 구동한 종단 증거") flagged that its focus/announcement
 * evidence was shell-reaction-to-hand-authored-fixture only, because src/domain/**
 * did not exist yet. Now that SG-007/SG-010 are merged, this file drives the shell's
 * pure reducers (state.ts) with snapshots and events produced by the real
 * reset/enqueueDirection/step functions instead of hand-typed literals, closing that
 * gap for the focus-target and aria-live-announcement contracts. It does not
 * re-verify game rules themselves (score, collision geometry, RNG fairness) — that
 * coverage belongs to src/domain/**'s own tests (SG-010/SG-011).
 */
import { describe, expect, it } from 'vitest';

import { enqueueDirection, reset, step } from '../domain/index.ts';
import type { DomainEvent, GameState, RandomSource } from '../domain/index.ts';

import { announcementFor, focusTargetForTransition } from './state.ts';

/** Deterministic RandomSource: always returns the same in-range free-cell index. */
class FixedIndexRandomSource implements RandomSource {
  constructor(private readonly index: number) {}

  nextInt(upperExclusive: number): number {
    if (this.index >= upperExclusive) {
      throw new Error(
        `FixedIndexRandomSource misconfigured: index ${String(this.index)} >= upperExclusive ${String(upperExclusive)}`,
      );
    }

    return this.index;
  }
}

describe('shell reducers driven by real src/domain output (not hand-authored fixtures)', () => {
  it('reset(ready) -> enqueueDirection(right) matches the menu -> ready focus/announcement contract', () => {
    const rng = new FixedIndexRandomSource(0);
    const readyResult = reset({ difficulty: 'normal', phase: 'ready' }, rng);

    expect(readyResult.state.phase).toBe('ready');
    expect(focusTargetForTransition('menu', readyResult.state.phase)).toBe('board');
    expect(announcementFor('menu', readyResult.state, readyResult.events)).toBe(
      'Ready. Press a direction to start.',
    );

    const startResult = enqueueDirection(readyResult.state, 'right');

    expect(startResult.disposition).toBe('accepted');
    expect(startResult.state.phase).toBe('playing');
    // ready -> playing is a same-render-frame transition in the real scheduler
    // (CONTRACTS.md §7); the shell still owes it a focus/announcement decision.
    expect(focusTargetForTransition('ready', startResult.state.phase)).toBe('board');
    expect(announcementFor('ready', startResult.state, [])).toBe('Playing.');
  });

  it('a real step() that eats food announces the domain foodEaten event exactly once', () => {
    // Free-cell index 208 is board cell (11, 10) in the real spawnFood's row-major
    // enumeration (CONTRACTS.md §6) around the real reset() initial snake at
    // (10,10)/(9,10)/(8,10): 200 cells for rows y=0..9, then row y=10 contributes
    // x=0..7 (8 cells, indices 200..207) before the occupied x=8..10 gap, so index
    // 208 is x=11 — exactly one step right of the head. This is arithmetic on the
    // real domain's documented food-spawn contract, not a guess.
    const rng = new FixedIndexRandomSource(208);
    const readyResult = reset({ difficulty: 'normal', phase: 'ready' }, rng);

    expect(readyResult.state.food).toEqual({ x: 11, y: 10 });

    const startResult = enqueueDirection(readyResult.state, 'right');
    const tickResult = step(startResult.state, rng);

    const foodEaten = tickResult.events.find(
      (event): event is Extract<DomainEvent, { type: 'foodEaten' }> => event.type === 'foodEaten',
    );

    expect(foodEaten).toEqual({ type: 'foodEaten', cell: { x: 11, y: 10 }, score: 10 });
    expect(tickResult.state.score).toBe(10);
    expect(focusTargetForTransition('playing', tickResult.state.phase)).toBeNull();
    expect(announcementFor('playing', tickResult.state, tickResult.events)).toBe(
      'Food eaten. Score 10.',
    );
  });

  it('a movement-only real step() with no events announces nothing (AC-U07 low frequency)', () => {
    const rng = new FixedIndexRandomSource(0);
    const readyResult = reset({ difficulty: 'normal', phase: 'ready' }, rng);
    const startResult = enqueueDirection(readyResult.state, 'right');
    const tickResult = step(startResult.state, rng);

    expect(tickResult.events).toEqual([]);
    expect(tickResult.state.phase).toBe('playing');
    expect(focusTargetForTransition('playing', tickResult.state.phase)).toBeNull();
    expect(announcementFor('playing', tickResult.state, tickResult.events)).toBeNull();
  });

  it('real repeated step() into the wall announces the domain gameEnded(wall) event once', () => {
    const rng = new FixedIndexRandomSource(0);
    const readyResult = reset({ difficulty: 'normal', phase: 'ready' }, rng);
    // 'up' is an approved READY start direction (Right is not the only one); the
    // head then walks the real board from (10,10) to the top wall.
    const startResult = enqueueDirection(readyResult.state, 'up');

    let state: GameState = startResult.state;
    let lastEvents: readonly DomainEvent[] = [];

    // 10 in-bounds steps reach row y=0; the 11th attempts y=-1 and collides.
    for (let i = 0; i < 11; i += 1) {
      const result = step(state, rng);

      state = result.state;
      lastEvents = result.events;
    }

    const gameEnded = lastEvents.find(
      (event): event is Extract<DomainEvent, { type: 'gameEnded' }> => event.type === 'gameEnded',
    );

    expect(state.phase).toBe('gameOver');
    expect(gameEnded).toEqual({
      type: 'gameEnded',
      reason: 'wall',
      headCell: { x: 10, y: 0 },
      attemptedCell: { x: 10, y: -1 },
    });
    expect(focusTargetForTransition('playing', state.phase)).toBe('restart');
    expect(announcementFor('playing', state, lastEvents)).toBe(
      `Game over: wall collision. Score ${String(state.score)}.`,
    );

    // gameOver is terminal: a further real step() must not re-fire the event
    // (CONTRACTS.md §2), so the shell must not re-announce it either.
    const terminalResult = step(state, rng);

    expect(terminalResult.events).toEqual([]);
    expect(announcementFor('gameOver', terminalResult.state, terminalResult.events)).toBeNull();
  });
});
