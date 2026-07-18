/**
 * DOM-independent pure logic for the accessible shell: the initial boot snapshot,
 * keyboard-to-Command translation, focus-target selection on phase transitions, and
 * aria-live announcement text. Kept free of `document`/`HTMLElement` so it is
 * unit-testable without a browser or a DOM testing library.
 */
import type { Command, DomainEvent, GameState, Phase } from './contracts.ts';

const NORMAL_START_TICK_MS = 160;

/**
 * Boot-time snapshot matching CONTRACTS.md section 4 `reset({ phase: 'menu' }, rng)`
 * common shape (length-3 head-first snake, direction 'right', empty queue, zero
 * score/foodsEaten, endReason null, food null for menu). This is a literal constant,
 * not a call into domain logic: no reset()/RNG is invoked, and the domain owns the
 * authoritative implementation once SG-007 lands. Default difficulty 'normal' is an
 * SG-006 UI-only assumption for the pre-selection radio/select state; it carries no
 * product meaning beyond which control is checked before the player chooses.
 */
export const INITIAL_MENU_SNAPSHOT: GameState = {
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
  tickMs: NORMAL_START_TICK_MS,
  difficulty: 'normal',
  endReason: null,
};

export type FocusTarget = 'board' | 'start' | 'resume' | 'restart' | null;

/**
 * Maps a phase transition to the focus target required by CONTRACTS.md/QA_PLAN.md
 * DP-B11: board after Start/Resume-shaped entry into ready/playing, Resume after
 * entering paused, Restart after entering gameOver/won, Start after entering menu.
 * Returns null when the phase did not change (including the initial boot call with
 * `previousPhase: null`), since no transition-driven focus move applies.
 */
export function focusTargetForTransition(
  previousPhase: Phase | null,
  nextPhase: Phase,
): FocusTarget {
  if (previousPhase === null || previousPhase === nextPhase) {
    return null;
  }

  switch (nextPhase) {
    case 'ready':
    case 'playing':
      return 'board';
    case 'paused':
      return 'resume';
    case 'gameOver':
    case 'won':
      return 'restart';
    case 'menu':
      return 'start';
    default:
      return null;
  }
}

export type KeydownInput = {
  readonly key: string;
  readonly phase: Phase;
  readonly targetIsFormControl: boolean;
};

const DIRECTION_BY_KEY: Readonly<Record<string, Command & { type: 'direction' }>> = {
  ArrowUp: { type: 'direction', direction: 'up' },
  w: { type: 'direction', direction: 'up' },
  W: { type: 'direction', direction: 'up' },
  ArrowDown: { type: 'direction', direction: 'down' },
  s: { type: 'direction', direction: 'down' },
  S: { type: 'direction', direction: 'down' },
  ArrowLeft: { type: 'direction', direction: 'left' },
  a: { type: 'direction', direction: 'left' },
  A: { type: 'direction', direction: 'left' },
  ArrowRight: { type: 'direction', direction: 'right' },
  d: { type: 'direction', direction: 'right' },
  D: { type: 'direction', direction: 'right' },
};

/**
 * Translates a raw keyboard key into the semantic Command it should produce, or null
 * if this key is not one the shell handles. Callers must call preventDefault only
 * when this returns non-null (AC-U06: handled-key scroll delta zero, unhandled keys
 * keep default scroll). Enter/Space are never translated: CONTRACTS.md section 3
 * fixes native button activation, not Enter/Space, as the only path to `start`/
 * `restart`. `targetIsFormControl` guards the difficulty control's own native key
 * handling (e.g. a <select>'s arrow-key/typeahead behavior).
 */
export function translateKeydown(input: KeydownInput): Command | null {
  if (input.targetIsFormControl) {
    return null;
  }

  const direction = DIRECTION_BY_KEY[input.key];

  if (direction !== undefined) {
    return input.phase === 'ready' || input.phase === 'playing' ? direction : null;
  }

  if (input.key === 'p' || input.key === 'P' || input.key === 'Escape') {
    if (input.phase === 'playing') {
      return { type: 'pause' };
    }

    if (input.phase === 'paused') {
      return { type: 'resume' };
    }

    return null;
  }

  if (input.key === 'm' || input.key === 'M') {
    return { type: 'toggleMute' };
  }

  return null;
}

/**
 * Builds the next aria-live announcement text, or null when nothing should be
 * announced. At most one announcement per meaningful change (phase transition or a
 * foodEaten/gameEnded/gameWon event); movement-only ticks with an unchanged phase and
 * no events announce nothing (AC-U07 low-frequency intent applied at the UI layer).
 */
export function announcementFor(
  previousPhase: Phase | null,
  next: GameState,
  events: readonly DomainEvent[],
): string | null {
  const gameEnded = events.find((event) => event.type === 'gameEnded');

  if (gameEnded !== undefined && gameEnded.type === 'gameEnded') {
    const reasonText = gameEnded.reason === 'wall' ? 'wall collision' : 'self collision';

    return `Game over: ${reasonText}. Score ${next.score}.`;
  }

  const gameWon = events.find((event) => event.type === 'gameWon');

  if (gameWon !== undefined && gameWon.type === 'gameWon') {
    return `You won! Score ${gameWon.score}.`;
  }

  const foodEaten = events.find((event) => event.type === 'foodEaten');

  if (foodEaten !== undefined && foodEaten.type === 'foodEaten') {
    return `Food eaten. Score ${foodEaten.score}.`;
  }

  if (previousPhase !== null && previousPhase !== next.phase) {
    return phaseAnnouncement(next.phase);
  }

  return null;
}

function phaseAnnouncement(phase: Phase): string {
  switch (phase) {
    case 'menu':
      return 'Menu.';
    case 'ready':
      return 'Ready. Press a direction to start.';
    case 'playing':
      return 'Playing.';
    case 'paused':
      return 'Paused.';
    case 'gameOver':
      return 'Game over.';
    case 'won':
      return 'You won!';
  }
}
