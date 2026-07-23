import type Phaser from 'phaser';

import type { DomainEvent, GameState } from '../domain/index.ts';

import { collisionMarkerFor } from './collision-marker.ts';

export const BOARD_LOGICAL_SIZE = 480;
export const BOARD_CELL_COUNT = 20;
export const BOARD_CELL_SIZE = BOARD_LOGICAL_SIZE / BOARD_CELL_COUNT;
export const COLLISION_HIGHLIGHT_MS = 300;

const COLORS = {
  board: 0x16213a,
  grid: 0x64707e,
  body: 0x6fd67a,
  head: 0xffd166,
  food: 0xff8f8f,
  collision: 0xffffff,
} as const;

/** Phaser drawing adapter. It consumes domain snapshots and events but never infers rules. */
export class BoardRenderer {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly collisionGraphics: Phaser.GameObjects.Graphics;
  private readonly clock: Phaser.Time.Clock;
  private collisionClearTimer: Phaser.Time.TimerEvent | null = null;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
    this.collisionGraphics = scene.add.graphics();
    this.clock = scene.time;
  }

  render(state: GameState, events: readonly DomainEvent[]): void {
    this.clearCollisionFeedback();
    this.graphics.clear();
    this.graphics.fillStyle(COLORS.board, 1);
    this.graphics.fillRect(0, 0, BOARD_LOGICAL_SIZE, BOARD_LOGICAL_SIZE);
    this.graphics.lineStyle(1, COLORS.grid, 0.7);

    for (let index = 0; index <= BOARD_CELL_COUNT; index += 1) {
      const offset = index * BOARD_CELL_SIZE;

      this.graphics.lineBetween(offset, 0, offset, BOARD_LOGICAL_SIZE);
      this.graphics.lineBetween(0, offset, BOARD_LOGICAL_SIZE, offset);
    }

    state.snake.forEach((cell, index) => {
      this.drawCell(cell, index === 0 ? COLORS.head : COLORS.body, index === 0 ? 4 : 6);
    });

    if (state.food !== null) {
      this.drawCell(state.food, COLORS.food, 7);
    }

    const gameEnded = events.find((event) => event.type === 'gameEnded');

    if (gameEnded?.type === 'gameEnded') {
      const marker = collisionMarkerFor(gameEnded, {
        cellCount: BOARD_CELL_COUNT,
        cellSize: BOARD_CELL_SIZE,
        logicalSize: BOARD_LOGICAL_SIZE,
      });

      if (marker !== null) {
        this.collisionGraphics.lineStyle(3, COLORS.collision, 1);

        if (marker.kind === 'cell') {
          this.collisionGraphics.strokeRect(marker.x, marker.y, marker.size, marker.size);
        } else {
          this.collisionGraphics.lineBetween(marker.x1, marker.y1, marker.x2, marker.y2);
        }

        this.collisionClearTimer = this.clock.delayedCall(COLLISION_HIGHLIGHT_MS, () => {
          this.collisionGraphics.clear();
          this.collisionClearTimer = null;
        });
      }
    }
  }

  destroy(): void {
    this.collisionClearTimer?.remove(false);
    this.collisionClearTimer = null;
    this.collisionGraphics.destroy();
    this.graphics.destroy();
  }

  private drawCell(
    cell: { readonly x: number; readonly y: number },
    color: number,
    inset: number,
  ): void {
    this.graphics.fillStyle(color, 1);
    this.graphics.fillRect(
      cell.x * BOARD_CELL_SIZE + inset,
      cell.y * BOARD_CELL_SIZE + inset,
      BOARD_CELL_SIZE - inset * 2,
      BOARD_CELL_SIZE - inset * 2,
    );
  }

  private clearCollisionFeedback(): void {
    this.collisionClearTimer?.remove(false);
    this.collisionClearTimer = null;
    this.collisionGraphics.clear();
  }
}
