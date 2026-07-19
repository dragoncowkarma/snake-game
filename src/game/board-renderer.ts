import Phaser from 'phaser';

import type { DomainEvent, GameState } from '../domain/index.ts';

export const BOARD_LOGICAL_SIZE = 480;
export const BOARD_CELL_COUNT = 20;
export const BOARD_CELL_SIZE = BOARD_LOGICAL_SIZE / BOARD_CELL_COUNT;

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

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
  }

  render(state: GameState, events: readonly DomainEvent[]): void {
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

    for (const event of events) {
      if (event.type === 'gameEnded' && this.isBoardCell(event.attemptedCell)) {
        const x = event.attemptedCell.x * BOARD_CELL_SIZE + 2;
        const y = event.attemptedCell.y * BOARD_CELL_SIZE + 2;

        this.graphics.lineStyle(3, COLORS.collision, 1);
        this.graphics.strokeRect(x, y, BOARD_CELL_SIZE - 4, BOARD_CELL_SIZE - 4);
      }
    }
  }

  destroy(): void {
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

  private isBoardCell(cell: { readonly x: number; readonly y: number }): boolean {
    return cell.x >= 0 && cell.x < BOARD_CELL_COUNT && cell.y >= 0 && cell.y < BOARD_CELL_COUNT;
  }
}
