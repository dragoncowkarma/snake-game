import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  phaserGame: vi.fn(),
}));

vi.mock('phaser', () => ({
  default: {
    AUTO: 'auto-renderer',
    WEBGL: 'webgl-renderer',
    Game: class {
      constructor(configuration: unknown) {
        mocks.phaserGame(configuration);
      }

      destroy(): void {}
    },
    Scale: {
      CENTER_BOTH: 'center-both',
      FIT: 'fit',
    },
  },
}));

vi.mock('../adapters/audio-feedback.ts', () => ({
  AudioFeedback: class {
    readonly isMuted = false;

    activateFromUserGesture(): Promise<void> {
      return Promise.resolve();
    }

    handleEvents(): void {}

    toggleMuted(): boolean {
      return false;
    }
  },
}));

vi.mock('../adapters/game-preferences.ts', () => ({
  GamePreferences: class {
    readonly snapshot = { muted: false, lastDifficulty: 'normal' as const };

    bestScore(): number {
      return 0;
    }

    recordScore(): boolean {
      return false;
    }

    setLastDifficulty(): void {}

    setMuted(): void {}
  },
}));

vi.mock('../ui/app.ts', () => ({
  createGameShell: () => ({
    applySnapshot(): void {},
    destroy(): void {},
    updateMeta(): void {},
  }),
}));

vi.mock('./application-router.ts', () => ({
  ApplicationRouter: class {
    readonly snapshot = { difficulty: 'normal' as const, phase: 'ready' as const };

    dispatch(): boolean {
      return true;
    }

    subscribe(listener: (state: { phase: string }, events: unknown[]) => void): () => void {
      listener(this.snapshot, []);
      return () => {};
    }
  },
}));

vi.mock('./board-renderer.ts', () => ({
  BOARD_LOGICAL_SIZE: 400,
}));

vi.mock('./game-scene.ts', () => ({
  GameScene: class {
    constructor() {}
  },
}));

vi.mock('./input-controller.ts', () => ({
  InputController: class {
    destroy(): void {}
  },
}));

vi.mock('./lifecycle-controller.ts', () => ({
  LifecycleController: class {
    destroy(): void {}
  },
}));

import { mountPhaserGame } from './bootstrap.ts';

describe('mountPhaserGame', () => {
  it('allows Phaser to select Canvas when WebGL is unavailable', () => {
    let scheduledMount: (() => void) | undefined;
    const ownerWindow = {
      clearTimeout: vi.fn(),
      setTimeout: vi.fn((callback: () => void) => {
        scheduledMount = callback;
        return 1;
      }),
    } as unknown as Window;
    const board = {} as HTMLElement;
    const root = {
      ownerDocument: { defaultView: ownerWindow },
      querySelector: vi.fn(() => board),
    } as unknown as HTMLElement;

    mountPhaserGame(root);
    scheduledMount?.();

    expect(mocks.phaserGame).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'auto-renderer' }),
    );
  });
});
