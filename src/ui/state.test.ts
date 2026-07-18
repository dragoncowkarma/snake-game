import { describe, expect, it } from 'vitest';

import type { DomainEvent, GameState } from './contracts.ts';
import {
  INITIAL_MENU_SNAPSHOT,
  announcementFor,
  focusTargetForTransition,
  translateKeydown,
} from './state.ts';

describe('INITIAL_MENU_SNAPSHOT', () => {
  it('matches the CONTRACTS.md common reset shape for phase menu', () => {
    expect(INITIAL_MENU_SNAPSHOT).toEqual({
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
      tickMs: 160,
      difficulty: 'normal',
      endReason: null,
    });
  });
});

describe('focusTargetForTransition', () => {
  it('returns null on initial boot (no previous phase)', () => {
    expect(focusTargetForTransition(null, 'menu')).toBeNull();
  });

  it('returns null when the phase does not change', () => {
    expect(focusTargetForTransition('playing', 'playing')).toBeNull();
  });

  it('focuses board after Start (menu -> ready)', () => {
    expect(focusTargetForTransition('menu', 'ready')).toBe('board');
  });

  it('focuses board after the first tick (ready -> playing)', () => {
    expect(focusTargetForTransition('ready', 'playing')).toBe('board');
  });

  it('focuses board after Resume (paused -> playing)', () => {
    expect(focusTargetForTransition('paused', 'playing')).toBe('board');
  });

  it('focuses board after Restart (gameOver -> ready, won -> ready)', () => {
    expect(focusTargetForTransition('gameOver', 'ready')).toBe('board');
    expect(focusTargetForTransition('won', 'ready')).toBe('board');
  });

  it('focuses Resume after Pause (playing -> paused)', () => {
    expect(focusTargetForTransition('playing', 'paused')).toBe('resume');
  });

  it('focuses Restart after entering a terminal phase', () => {
    expect(focusTargetForTransition('playing', 'gameOver')).toBe('restart');
    expect(focusTargetForTransition('playing', 'won')).toBe('restart');
  });

  it('focuses Start after returnToMenu', () => {
    expect(focusTargetForTransition('gameOver', 'menu')).toBe('start');
    expect(focusTargetForTransition('won', 'menu')).toBe('start');
    expect(focusTargetForTransition('paused', 'menu')).toBe('start');
  });
});

describe('translateKeydown', () => {
  it('translates Arrow/WASD to direction only in ready or playing', () => {
    expect(
      translateKeydown({ key: 'ArrowUp', phase: 'playing', targetIsFormControl: false }),
    ).toEqual({
      type: 'direction',
      direction: 'up',
    });
    expect(translateKeydown({ key: 'd', phase: 'ready', targetIsFormControl: false })).toEqual({
      type: 'direction',
      direction: 'right',
    });
    expect(
      translateKeydown({ key: 'ArrowLeft', phase: 'menu', targetIsFormControl: false }),
    ).toBeNull();
    expect(
      translateKeydown({ key: 'ArrowLeft', phase: 'paused', targetIsFormControl: false }),
    ).toBeNull();
  });

  it('maps P and Escape to pause while playing and resume while paused', () => {
    expect(translateKeydown({ key: 'p', phase: 'playing', targetIsFormControl: false })).toEqual({
      type: 'pause',
    });
    expect(
      translateKeydown({ key: 'Escape', phase: 'playing', targetIsFormControl: false }),
    ).toEqual({
      type: 'pause',
    });
    expect(translateKeydown({ key: 'P', phase: 'paused', targetIsFormControl: false })).toEqual({
      type: 'resume',
    });
    expect(translateKeydown({ key: 'p', phase: 'menu', targetIsFormControl: false })).toBeNull();
  });

  it('maps M to toggleMute in every phase', () => {
    for (const phase of ['menu', 'ready', 'playing', 'paused', 'gameOver', 'won'] as const) {
      expect(translateKeydown({ key: 'm', phase, targetIsFormControl: false })).toEqual({
        type: 'toggleMute',
      });
    }
  });

  it('never translates Enter or Space', () => {
    expect(
      translateKeydown({ key: 'Enter', phase: 'ready', targetIsFormControl: false }),
    ).toBeNull();
    expect(translateKeydown({ key: ' ', phase: 'playing', targetIsFormControl: false })).toBeNull();
  });

  it('ignores every key while a form control (e.g. difficulty select) is the target', () => {
    expect(
      translateKeydown({ key: 'ArrowUp', phase: 'ready', targetIsFormControl: true }),
    ).toBeNull();
    expect(translateKeydown({ key: 'm', phase: 'menu', targetIsFormControl: true })).toBeNull();
  });
});

describe('announcementFor', () => {
  const playingState: GameState = {
    phase: 'playing',
    snake: [
      { x: 11, y: 10 },
      { x: 10, y: 10 },
      { x: 9, y: 10 },
    ],
    direction: 'right',
    queuedDirections: [],
    food: { x: 5, y: 5 },
    score: 10,
    foodsEaten: 1,
    tickMs: 160,
    difficulty: 'normal',
    endReason: null,
  };

  it('announces nothing for a movement-only tick with no events and unchanged phase', () => {
    expect(announcementFor('playing', playingState, [])).toBeNull();
  });

  it('announces nothing on the very first render (no previous phase) with no events', () => {
    expect(announcementFor(null, playingState, [])).toBeNull();
  });

  it('announces a phase change with no accompanying event', () => {
    expect(announcementFor('menu', { ...playingState, phase: 'ready' }, [])).toBe(
      'Ready. Press a direction to start.',
    );
  });

  it('announces foodEaten exactly once, preferring it over a incidental phase label', () => {
    const events: DomainEvent[] = [{ type: 'foodEaten', cell: { x: 5, y: 5 }, score: 20 }];

    expect(announcementFor('playing', playingState, events)).toBe('Food eaten. Score 20.');
  });

  it('announces gameEnded with the collision reason', () => {
    const events: DomainEvent[] = [
      {
        type: 'gameEnded',
        reason: 'wall',
        headCell: { x: 19, y: 10 },
        attemptedCell: { x: 20, y: 10 },
      },
    ];
    const gameOverState: GameState = { ...playingState, phase: 'gameOver', endReason: 'wall' };

    expect(announcementFor('playing', gameOverState, events)).toBe(
      'Game over: wall collision. Score 10.',
    );
  });

  it('announces gameWon', () => {
    const events: DomainEvent[] = [{ type: 'gameWon', score: 400 }];
    const wonState: GameState = { ...playingState, phase: 'won', food: null };

    expect(announcementFor('playing', wonState, events)).toBe('You won! Score 400.');
  });
});
