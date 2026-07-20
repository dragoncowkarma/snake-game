import Phaser from 'phaser';

import { AudioFeedback, type AudioContextFactory } from '../adapters/audio-feedback.ts';
import { GamePreferences, type StorageLike } from '../adapters/game-preferences.ts';
import type { RandomSource } from '../domain/index.ts';
import { createGameShell, type GameShellHandle } from '../ui/app.ts';

import { ApplicationRouter } from './application-router.ts';
import { BOARD_LOGICAL_SIZE } from './board-renderer.ts';
import { GameScene } from './game-scene.ts';
import { InputController } from './input-controller.ts';
import { LifecycleController } from './lifecycle-controller.ts';

class BrowserRandomSource implements RandomSource {
  nextInt(upperExclusive: number): number {
    return Math.floor(Math.random() * upperExclusive);
  }
}

function browserStorage(ownerWindow: Window): StorageLike | null {
  try {
    return ownerWindow.localStorage;
  } catch {
    return null;
  }
}

function browserAudioContext(ownerWindow: Window): AudioContextFactory | null {
  const AudioContextConstructor = (
    ownerWindow as Window & { readonly AudioContext?: typeof AudioContext }
  ).AudioContext;

  return AudioContextConstructor === undefined ? null : () => new AudioContextConstructor();
}

export interface MountedGame {
  readonly application: ApplicationRouter;
  destroy(): void;
}

/** Mounts one DOM shell, one Phaser GameScene, and one shared command route. */
export function mountPhaserGame(
  root: HTMLElement,
  randomSource: RandomSource = new BrowserRandomSource(),
): MountedGame {
  const document = root.ownerDocument;
  const ownerWindow = document.defaultView ?? window;
  const preferences = new GamePreferences(browserStorage(ownerWindow));
  const audio = new AudioFeedback({
    contextFactory: browserAudioContext(ownerWindow),
    initiallyMuted: preferences.snapshot.muted,
  });
  const application = new ApplicationRouter(randomSource);
  // `dispatch` needs to call back into the shell to feed the audio adapter's
  // authoritative mute state after a `toggleMute` command (CONTRACTS.md section 3
  // keeps mute preference out of GameState, so no snapshot/event reports it), but the
  // shell's own constructor requires `dispatch`. `shellRef.current` is populated
  // synchronously right after `createGameShell` returns, before any listener it
  // attached can invoke `dispatch`.
  const shellRef: { current: GameShellHandle | null } = { current: null };
  const dispatch = (command: Parameters<ApplicationRouter['dispatch']>[0]): boolean => {
    // This synchronous call creates/resumes an AudioContext only while handling a
    // genuine browser command. Rejection is contained by AudioFeedback.
    void audio.activateFromUserGesture();

    const handled = application.dispatch(command);

    if (!handled) {
      return false;
    }

    if (command.type === 'selectDifficulty') {
      preferences.setLastDifficulty(command.difficulty);
    }

    if (command.type === 'toggleMute') {
      preferences.setMuted(audio.toggleMuted());
      shellRef.current?.updateMeta({ muted: audio.isMuted });
    }

    return true;
  };
  const shell = createGameShell(root, dispatch, {
    muted: preferences.snapshot.muted,
    best: preferences.bestScore(application.snapshot.difficulty),
    isNewBest: false,
  });

  shellRef.current = shell;
  const board = root.querySelector<HTMLElement>('#board');

  if (board === null) {
    shell.destroy();
    throw new Error('The game shell did not create its #board focus target');
  }

  let game: Phaser.Game | null = null;
  let pendingGameMount: number | null = null;
  const createPhaserGame = (): void => {
    game = new Phaser.Game({
      type: Phaser.WEBGL,
      backgroundColor: '#16213a',
      pixelArt: true,
      scale: {
        parent: board,
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: BOARD_LOGICAL_SIZE,
        height: BOARD_LOGICAL_SIZE,
        expandParent: false,
      },
      scene: new GameScene(application),
    });
  };
  const unsubscribeShell = application.subscribe((state, events) => {
    // Recording (and detecting a new record) only at the terminal phase matches
    // DEVELOPMENT_PLAN section 3.5 ("최고 점수 갱신은 게임 종료 화면에서만 강조한다"):
    // the final score of a run is always >= any mid-play score, so gating recordScore
    // here changes nothing about the persisted value, only when "new best" is true.
    const isTerminal = state.phase === 'gameOver' || state.phase === 'won';
    const isNewBest = isTerminal && preferences.recordScore(state.difficulty, state.score);

    audio.handleEvents(events);
    shell.applySnapshot(state, events, {
      best: preferences.bestScore(state.difficulty),
      isNewBest,
    });

    if (game === null && pendingGameMount === null && state.phase !== 'menu') {
      // Phaser must be constructed after the shell has committed the visible board
      // layout; constructing it under MENU's display:none parent freezes FIT at 0×0.
      pendingGameMount = ownerWindow.setTimeout(() => {
        pendingGameMount = null;
        createPhaserGame();
      }, 0);
    }
  });

  const input = new InputController({
    board,
    document,
    readPhase: () => application.snapshot.phase,
    dispatch,
  });
  const lifecycle = new LifecycleController({
    window: ownerWindow,
    document,
    // blur, hidden, and orientation changes are never user gestures. They must not
    // attempt AudioContext activation, because an autoplay rejection would disable
    // optional feedback before a real board key or button click can activate it.
    pause: () => {
      application.dispatch({ type: 'pause' });
    },
    relayout: () => game?.scale.refresh(),
  });

  return {
    application,
    destroy(): void {
      lifecycle.destroy();
      input.destroy();
      unsubscribeShell();
      if (pendingGameMount !== null) {
        ownerWindow.clearTimeout(pendingGameMount);
      }
      shell.destroy();
      game?.destroy(true);
    },
  };
}
