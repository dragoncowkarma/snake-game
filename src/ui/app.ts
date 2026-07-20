/**
 * Wires the shell DOM (render.ts) to input translation and focus management
 * (state.ts). Owns no game rules: it only turns native browser input into public
 * Command values via a single `dispatch` callback supplied by the caller, and turns
 * GameState snapshots into DOM updates + focus moves. The real Command consumer
 * (application command router backed by the domain) is wired in later by SG-014;
 * until then `dispatch` may be a no-op/logging stub.
 */
import type { Command, DomainEvent, GameState, Phase } from './contracts.ts';
import { type ShellElements, actionElements, createShell, renderSnapshot } from './render.ts';
import {
  INITIAL_MENU_SNAPSHOT,
  announcementFor,
  focusTargetForTransition,
  translateKeydown,
} from './state.ts';

/**
 * Presentation-only fields the shell renders alongside a GameState snapshot but that
 * the domain does not own: audio mute preference (CONTRACTS.md section 3 fixes
 * `toggleMute` as shell-handled, not a GameState field) and the persisted per-
 * difficulty high score (SG-016 GamePreferences). `isNewBest` highlights a just-ended
 * run's score on the terminal screen only (DEVELOPMENT_PLAN section 3.5); the caller
 * is responsible for only setting it true on a gameOver/won snapshot.
 */
export interface ShellMeta {
  readonly muted: boolean;
  readonly best: number;
  readonly isNewBest: boolean;
}

const DEFAULT_SHELL_META: ShellMeta = { muted: false, best: 0, isNewBest: false };

export interface GameShellHandle {
  /**
   * Feeds a new domain snapshot + the events that produced it into the shell.
   * `metaPatch` merges into the shell's current ShellMeta before rendering; omit it
   * when only the domain snapshot changed.
   */
  applySnapshot(
    state: GameState,
    events: readonly DomainEvent[],
    metaPatch?: Partial<ShellMeta>,
  ): void;
  /**
   * Re-renders the last known snapshot with a merged ShellMeta patch, without moving
   * focus or announcing anything. Callers use this for state that changes outside a
   * domain snapshot/event pair — e.g. the audio adapter's authoritative mute value
   * after a `toggleMute` command, which CONTRACTS.md section 3 keeps out of GameState.
   */
  updateMeta(metaPatch: Partial<ShellMeta>): void;
  /** Removes every listener this shell attached. Safe to call once. */
  destroy(): void;
}

function isFormControlTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLSelectElement || target instanceof HTMLInputElement;
}

function focusElementFor(
  elements: ShellElements,
  target: ReturnType<typeof focusTargetForTransition>,
): void {
  switch (target) {
    case 'board':
      elements.board.focus();

      return;
    case 'start':
      elements.startButton.focus();

      return;
    case 'resume':
      elements.resumeButton.focus();

      return;
    case 'restart':
      elements.restartButton.focus();

      return;
    case null:
      return;
  }
}

/**
 * Mounts the accessible DOM shell into `root` and returns a handle for feeding it
 * snapshots. `dispatch` is called at most once per native activation (one `click`
 * listener per button, one `keydown` listener for the document) with a semantic
 * Command — never a raw DOM event.
 */
export function createGameShell(
  root: HTMLElement,
  dispatch: (command: Command) => void,
  initialMeta: ShellMeta = DEFAULT_SHELL_META,
): GameShellHandle {
  const document = root.ownerDocument;
  const elements = createShell(root);
  let previousPhase: Phase | null = null;
  let meta: ShellMeta = initialMeta;
  let lastState: GameState = INITIAL_MENU_SNAPSHOT;

  const cleanups: Array<() => void> = [];

  function on<K extends keyof HTMLElementEventMap>(
    target: EventTarget,
    type: K,
    listener: (event: HTMLElementEventMap[K]) => void,
  ): void {
    target.addEventListener(type, listener as EventListener);
    cleanups.push(() => target.removeEventListener(type, listener as EventListener));
  }

  for (const action of actionElements(elements)) {
    if (action.kind === 'mute') {
      // The click here and the board's keyboard 'm' shortcut both call the same
      // dispatch function; neither path flips a locally-owned boolean. The visible
      // mute state comes only from updateMeta({ muted }), fed by the caller with the
      // audio adapter's authoritative value after dispatch handles `toggleMute`. This
      // keeps both activation paths in sync (closes DF-SG015-01).
      on(action.element, 'click', () => {
        dispatch({ type: 'toggleMute' });
      });

      continue;
    }

    on(action.element, 'click', () => {
      dispatch(action.command);
    });
  }

  for (const input of elements.difficultyInputs) {
    on(input, 'change', () => {
      if (input.checked) {
        dispatch({ type: 'selectDifficulty', difficulty: input.value as 'slow' | 'normal' });
      }
    });
  }

  const keydownListener = (event: KeyboardEvent): void => {
    const command = translateKeydown({
      key: event.key,
      phase: previousPhase ?? 'menu',
      targetIsFormControl: isFormControlTarget(event.target),
    });

    if (command !== null) {
      event.preventDefault();
      dispatch(command);
    }
  };

  on(document, 'keydown', keydownListener);

  function applySnapshot(
    state: GameState,
    events: readonly DomainEvent[],
    metaPatch?: Partial<ShellMeta>,
  ): void {
    meta = { ...meta, ...metaPatch };
    lastState = state;
    renderSnapshot(elements, state, meta);

    const announcement = announcementFor(previousPhase, state, events);

    if (announcement !== null) {
      elements.status.textContent = announcement;
    }

    const focusTarget = focusTargetForTransition(previousPhase, state.phase);

    focusElementFor(elements, focusTarget);
    previousPhase = state.phase;
  }

  function updateMeta(metaPatch: Partial<ShellMeta>): void {
    meta = { ...meta, ...metaPatch };
    renderSnapshot(elements, lastState, meta);
  }

  applySnapshot(INITIAL_MENU_SNAPSHOT, []);

  return {
    applySnapshot,
    updateMeta,
    destroy(): void {
      for (const cleanup of cleanups.splice(0)) {
        cleanup();
      }
    },
  };
}
