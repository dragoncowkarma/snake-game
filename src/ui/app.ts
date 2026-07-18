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

export interface GameShellHandle {
  /** Feeds a new domain snapshot + the events that produced it into the shell. */
  applySnapshot(state: GameState, events: readonly DomainEvent[]): void;
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
): GameShellHandle {
  const document = root.ownerDocument;
  const elements = createShell(root);
  let previousPhase: Phase | null = null;
  let muted = false;
  let best = 0;

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
      on(action.element, 'click', () => {
        muted = !muted;
        elements.muteButton.setAttribute('aria-pressed', String(muted));
        elements.muteButton.textContent = muted ? 'Unmute' : 'Mute';
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

  function applySnapshot(state: GameState, events: readonly DomainEvent[]): void {
    renderSnapshot(elements, state, { best, muted });

    if (state.phase === 'gameOver' || state.phase === 'won') {
      best = Math.max(best, state.score);
    }

    const announcement = announcementFor(previousPhase, state, events);

    if (announcement !== null) {
      elements.status.textContent = announcement;
    }

    const focusTarget = focusTargetForTransition(previousPhase, state.phase);

    focusElementFor(elements, focusTarget);
    previousPhase = state.phase;
  }

  applySnapshot(INITIAL_MENU_SNAPSHOT, []);

  return {
    applySnapshot,
    destroy(): void {
      for (const cleanup of cleanups.splice(0)) {
        cleanup();
      }
    },
  };
}
