import Phaser from 'phaser';

import type { RandomSource } from '../domain/index.ts';
import { createGameShell } from '../ui/app.ts';

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
  const application = new ApplicationRouter(randomSource);
  const shell = createGameShell(root, (command) => application.dispatch(command));
  const unsubscribeShell = application.subscribe((state, events) => {
    shell.applySnapshot(state, events);
  });
  const board = root.querySelector<HTMLElement>('#board');

  if (board === null) {
    unsubscribeShell();
    shell.destroy();
    throw new Error('The game shell did not create its #board focus target');
  }

  const game = new Phaser.Game({
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
  const input = new InputController({
    board,
    document,
    readPhase: () => application.snapshot.phase,
    dispatch: (command) => application.dispatch(command),
  });
  const lifecycle = new LifecycleController({
    window: document.defaultView ?? window,
    document,
    pause: () => application.dispatch({ type: 'pause' }),
    relayout: () => game.scale.refresh(),
  });

  return {
    application,
    destroy(): void {
      lifecycle.destroy();
      input.destroy();
      unsubscribeShell();
      shell.destroy();
      game.destroy(true);
    },
  };
}
