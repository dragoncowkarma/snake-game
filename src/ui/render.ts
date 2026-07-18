/**
 * Builds the static DOM shell once and updates it from GameState snapshots. All
 * game-rule interpretation (what a phase means, when events fire) belongs to the
 * domain; this module only reads the public GameState/DomainEvent shape and writes
 * textContent/attributes. No Phaser or Canvas code lives here — the board element is
 * a plain, accessible placeholder that SG-012 will mount the Phaser canvas into.
 */
import type { Command, Direction, GameState, Phase } from './contracts.ts';

const DIRECTION_LABEL: Record<Direction, string> = {
  up: 'Move up',
  down: 'Move down',
  left: 'Move left',
  right: 'Move right',
};

const DIRECTION_GLYPH: Record<Direction, string> = {
  up: '▲',
  down: '▼',
  left: '◀',
  right: '▶',
};

export interface ShellElements {
  readonly root: HTMLElement;
  readonly status: HTMLElement;
  readonly score: HTMLElement;
  readonly best: HTMLElement;
  readonly phaseLabel: HTMLElement;
  readonly result: HTMLElement;
  readonly board: HTMLElement;
  readonly difficultyInputs: readonly HTMLInputElement[];
  readonly startButton: HTMLButtonElement;
  readonly dpadButtons: Readonly<Record<Direction, HTMLButtonElement>>;
  readonly pauseButton: HTMLButtonElement;
  readonly resumeButton: HTMLButtonElement;
  readonly restartButton: HTMLButtonElement;
  readonly menuButton: HTMLButtonElement;
  readonly muteButton: HTMLButtonElement;
}

function el<K extends keyof HTMLElementTagNameMap>(
  document: Document,
  tag: K,
  init?: { readonly className?: string; readonly text?: string },
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);

  if (init?.className !== undefined) {
    node.className = init.className;
  }

  if (init?.text !== undefined) {
    node.textContent = init.text;
  }

  return node;
}

function button(
  document: Document,
  init: { readonly className: string; readonly text: string; readonly ariaLabel?: string },
): HTMLButtonElement {
  const node = el(document, 'button', { className: init.className, text: init.text });

  node.type = 'button';

  if (init.ariaLabel !== undefined) {
    node.setAttribute('aria-label', init.ariaLabel);
  }

  return node;
}

const DIRECTIONS: readonly Direction[] = ['up', 'down', 'left', 'right'];

/**
 * Creates the shell DOM once inside `root` and returns references for
 * render/attach-listener use. Every actionable control is a native <button> or a
 * native radio input (difficulty) so accessible name, focus, and 44px sizing come
 * from real semantics, not ARIA role overrides.
 */
export function createShell(root: HTMLElement): ShellElements {
  const document = root.ownerDocument;

  root.replaceChildren();
  root.classList.add('shell');

  const status = el(document, 'p', { className: 'visually-hidden' });

  status.id = 'status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  const heading = el(document, 'h1', { className: 'app-title', text: 'Snake Game' });

  const hud = el(document, 'header', { className: 'hud' });
  const scoreLine = el(document, 'p', { className: 'hud__line' });
  const scoreLabel = el(document, 'span', { text: 'Score ' });
  const score = el(document, 'span', { text: '0' });

  scoreLine.append(scoreLabel, score);

  const bestLine = el(document, 'p', { className: 'hud__line' });
  const bestLabel = el(document, 'span', { text: 'Best ' });
  const best = el(document, 'span', { text: '0' });

  bestLine.append(bestLabel, best);

  const phaseLabel = el(document, 'p', { className: 'hud__phase', text: 'Menu' });
  const result = el(document, 'p', { className: 'hud__result' });

  result.hidden = true;
  hud.append(scoreLine, bestLine, phaseLabel, result);

  const boardWrap = el(document, 'section', { className: 'board-wrap' });
  const board = el(document, 'div', { className: 'board' });

  board.id = 'board';
  board.tabIndex = 0;
  board.setAttribute('aria-describedby', 'board-description');

  const boardDescription = el(document, 'p', {
    className: 'visually-hidden',
    text: 'Snake board. Use Arrow keys or W A S D to move, P or Escape to pause, M to mute.',
  });

  boardDescription.id = 'board-description';
  boardWrap.append(board, boardDescription);

  const menuPanel = el(document, 'section', { className: 'panel panel--menu' });
  const fieldset = el(document, 'fieldset', { className: 'difficulty' });
  const legend = el(document, 'legend', { text: 'Difficulty' });

  fieldset.append(legend);

  const difficultyInputs: HTMLInputElement[] = [];

  for (const value of ['slow', 'normal'] as const) {
    const label = el(document, 'label', { className: 'difficulty__option' });
    const input = el(document, 'input');

    input.type = 'radio';
    input.name = 'difficulty';
    input.value = value;
    input.checked = value === 'normal';
    label.append(input, document.createTextNode(value === 'slow' ? 'Slow' : 'Normal'));
    fieldset.append(label);
    difficultyInputs.push(input);
  }

  const startButton = button(document, { className: 'action action--primary', text: 'Start' });

  menuPanel.append(fieldset, startButton);

  const dpadPanel = el(document, 'section', { className: 'panel panel--dpad' });
  const dpad = el(document, 'div', { className: 'dpad' });
  const dpadButtons = {} as Record<Direction, HTMLButtonElement>;

  for (const direction of DIRECTIONS) {
    const directionButton = button(document, {
      className: `dpad__button dpad__button--${direction}`,
      text: DIRECTION_GLYPH[direction],
      ariaLabel: DIRECTION_LABEL[direction],
    });

    dpad.append(directionButton);
    dpadButtons[direction] = directionButton;
  }

  const pauseButton = button(document, { className: 'action', text: 'Pause' });

  dpadPanel.append(dpad, pauseButton);

  const pausedPanel = el(document, 'section', { className: 'panel panel--paused' });
  const resumeButton = button(document, { className: 'action action--primary', text: 'Resume' });

  pausedPanel.append(resumeButton);

  const terminalPanel = el(document, 'section', { className: 'panel panel--terminal' });
  const restartButton = button(document, { className: 'action action--primary', text: 'Restart' });
  const menuButton = button(document, { className: 'action', text: 'Menu' });

  terminalPanel.append(restartButton, menuButton);

  const muteButton = button(document, { className: 'mute', text: 'Mute' });

  muteButton.setAttribute('aria-pressed', 'false');

  root.append(
    status,
    heading,
    hud,
    boardWrap,
    menuPanel,
    dpadPanel,
    pausedPanel,
    terminalPanel,
    muteButton,
  );

  return {
    root,
    status,
    score,
    best,
    phaseLabel,
    result,
    board,
    difficultyInputs,
    startButton,
    dpadButtons,
    pauseButton,
    resumeButton,
    restartButton,
    menuButton,
    muteButton,
  };
}

const PHASE_LABEL: Record<Phase, string> = {
  menu: 'Menu',
  ready: 'Ready',
  playing: 'Playing',
  paused: 'Paused',
  gameOver: 'Game over',
  won: 'You won',
};

function setHidden(element: HTMLElement, hidden: boolean): void {
  element.hidden = hidden;
}

/**
 * Updates the shell from a GameState snapshot. Pure with respect to game rules: it
 * only decides which existing controls are visible/enabled and what their text says,
 * using nothing but the phase and the fields already on GameState.
 */
export function renderSnapshot(
  elements: ShellElements,
  state: GameState,
  meta: { readonly best: number; readonly muted: boolean },
): void {
  elements.score.textContent = String(state.score);
  elements.best.textContent = String(Math.max(meta.best, state.score));
  elements.phaseLabel.textContent = PHASE_LABEL[state.phase];

  const isMenu = state.phase === 'menu';
  const isReadyOrPlaying = state.phase === 'ready' || state.phase === 'playing';
  const isPlaying = state.phase === 'playing';
  const isPaused = state.phase === 'paused';
  const isTerminal = state.phase === 'gameOver' || state.phase === 'won';

  setHidden(elements.board, isMenu);
  setHidden(elements.root.querySelector('.panel--menu') as HTMLElement, !isMenu);
  setHidden(elements.root.querySelector('.panel--dpad') as HTMLElement, !isReadyOrPlaying);
  elements.pauseButton.hidden = !isPlaying;
  setHidden(elements.root.querySelector('.panel--paused') as HTMLElement, !isPaused);
  setHidden(elements.root.querySelector('.panel--terminal') as HTMLElement, !isTerminal);

  if (isTerminal) {
    const reasonText =
      state.phase === 'won'
        ? `You won with a score of ${state.score}.`
        : `Game over (${state.endReason ?? 'unknown'} collision). Score ${state.score}.`;

    elements.result.textContent = reasonText;
    elements.result.hidden = false;
  } else {
    elements.result.hidden = true;
  }

  elements.muteButton.setAttribute('aria-pressed', String(meta.muted));
  elements.muteButton.textContent = meta.muted ? 'Unmute' : 'Mute';
}

export type ActionElement =
  | { readonly kind: 'command'; readonly element: HTMLButtonElement; readonly command: Command }
  | { readonly kind: 'mute'; readonly element: HTMLButtonElement };

/** Enumerates every button that should carry exactly one `click` listener. */
export function actionElements(elements: ShellElements): readonly ActionElement[] {
  const directionActions: ActionElement[] = DIRECTIONS.map((direction) => ({
    kind: 'command',
    element: elements.dpadButtons[direction],
    command: { type: 'direction', direction },
  }));

  return [
    { kind: 'command', element: elements.startButton, command: { type: 'start' } },
    ...directionActions,
    { kind: 'command', element: elements.pauseButton, command: { type: 'pause' } },
    { kind: 'command', element: elements.resumeButton, command: { type: 'resume' } },
    { kind: 'command', element: elements.restartButton, command: { type: 'restart' } },
    { kind: 'command', element: elements.menuButton, command: { type: 'returnToMenu' } },
    { kind: 'mute', element: elements.muteButton },
  ];
}
