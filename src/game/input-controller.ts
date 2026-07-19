import type { Command, Direction, Phase } from '../domain/index.ts';

const DIRECTION_BY_KEY: Readonly<Record<string, Direction>> = {
  ArrowUp: 'up',
  w: 'up',
  W: 'up',
  ArrowDown: 'down',
  s: 'down',
  S: 'down',
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right',
};

export interface InputControllerOptions {
  readonly board: HTMLElement;
  readonly document: Document;
  readonly readPhase: () => Phase;
  readonly dispatch: (command: Command) => boolean;
}

function commandForKey(key: string, phase: Phase): Command | null {
  const direction = DIRECTION_BY_KEY[key];

  if (direction !== undefined) {
    return phase === 'ready' || phase === 'playing' ? { type: 'direction', direction } : null;
  }

  if (key === 'p' || key === 'P' || key === 'Escape') {
    if (phase === 'playing') {
      return { type: 'pause' };
    }

    if (phase === 'paused') {
      return { type: 'resume' };
    }
  }

  if (key === 'm' || key === 'M') {
    return { type: 'toggleMute' };
  }

  return null;
}

function isShellShortcut(key: string): boolean {
  return (
    DIRECTION_BY_KEY[key] !== undefined ||
    key === 'p' ||
    key === 'P' ||
    key === 'Escape' ||
    key === 'm' ||
    key === 'M'
  );
}

/**
 * The DOM shell owns button click listeners. This controller adds only the focused
 * board keyboard path, and blocks the shell's legacy document listener elsewhere so
 * keyboard and buttons reach the exact same application command function once.
 */
export class InputController {
  private readonly onBoardKeydown: (event: KeyboardEvent) => void;
  private readonly onDocumentCapture: (event: KeyboardEvent) => void;

  constructor(private readonly options: InputControllerOptions) {
    this.onBoardKeydown = (event) => {
      if (event.repeat) {
        return;
      }

      const command = commandForKey(event.key, this.options.readPhase());

      if (command === null) {
        return;
      }

      const handled = this.options.dispatch(command);

      // Prevent the shell's document listener from converting the same native key.
      event.stopPropagation();

      if (handled) {
        event.preventDefault();
      }
    };

    this.onDocumentCapture = (event) => {
      if (event.target === this.options.board || !isShellShortcut(event.key)) {
        return;
      }

      // Do not change browser defaults outside the board. This only keeps the
      // pre-existing shell listener from dispatching a global keyboard command.
      event.stopImmediatePropagation();
    };

    options.board.addEventListener('keydown', this.onBoardKeydown);
    options.document.addEventListener('keydown', this.onDocumentCapture, true);
  }

  destroy(): void {
    this.options.board.removeEventListener('keydown', this.onBoardKeydown);
    this.options.document.removeEventListener('keydown', this.onDocumentCapture, true);
  }
}
