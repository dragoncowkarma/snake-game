import Phaser from 'phaser';

import { BoardRenderer } from './board-renderer.ts';
import type { ApplicationRouter } from './application-router.ts';

/** The project has exactly one Scene; it renders snapshots and advances the scheduler. */
export class GameScene extends Phaser.Scene {
  private boardRenderer: BoardRenderer | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor(private readonly application: ApplicationRouter) {
    super('GameScene');
  }

  create(): void {
    this.boardRenderer = new BoardRenderer(this);
    this.unsubscribe = this.application.subscribe((state, events) => {
      this.boardRenderer?.render(state, events);
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.teardown());
  }

  override update(_time: number, delta: number): void {
    this.application.advance(delta);
  }

  private teardown(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.boardRenderer?.destroy();
    this.boardRenderer = null;
  }
}
