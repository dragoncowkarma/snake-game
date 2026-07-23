import type Phaser from 'phaser';
import { describe, expect, it, vi } from 'vitest';

import type { DomainEvent, GameState } from '../domain/index.ts';

import { BoardRenderer, COLLISION_HIGHLIGHT_MS } from './board-renderer.ts';

function graphicsSpy() {
  return {
    clear: vi.fn(),
    fillStyle: vi.fn(),
    fillRect: vi.fn(),
    lineStyle: vi.fn(),
    lineBetween: vi.fn(),
    strokeRect: vi.fn(),
    destroy: vi.fn(),
  };
}

const WALL_STATE: GameState = {
  phase: 'gameOver',
  snake: [
    { x: 19, y: 10 },
    { x: 18, y: 10 },
    { x: 17, y: 10 },
  ],
  direction: 'right',
  queuedDirections: [],
  food: { x: 0, y: 0 },
  score: 0,
  foodsEaten: 0,
  tickMs: 160,
  difficulty: 'normal',
  endReason: 'wall',
};

const WALL_EVENT: DomainEvent = {
  type: 'gameEnded',
  reason: 'wall',
  headCell: { x: 19, y: 10 },
  attemptedCell: { x: 20, y: 10 },
};

describe('BoardRenderer collision feedback', () => {
  it('draws the event-mapped wall edge and clears only the overlay after 300ms', () => {
    const boardGraphics = graphicsSpy();
    const collisionGraphics = graphicsSpy();
    const timer = { remove: vi.fn() };
    const scheduledCallbacks: Array<() => void> = [];
    const delayedCall = vi.fn((_delay: number, callback: () => void) => {
      scheduledCallbacks.push(callback);

      return timer;
    });
    const scene = {
      add: {
        graphics: vi.fn().mockReturnValueOnce(boardGraphics).mockReturnValueOnce(collisionGraphics),
      },
      time: {
        delayedCall,
      },
    } as unknown as Phaser.Scene;
    const renderer = new BoardRenderer(scene);

    renderer.render(WALL_STATE, [WALL_EVENT]);

    expect(collisionGraphics.lineBetween).toHaveBeenCalledWith(478, 242, 478, 262);
    expect(delayedCall).toHaveBeenCalledWith(COLLISION_HIGHLIGHT_MS, expect.any(Function));
    expect(COLLISION_HIGHLIGHT_MS).toBe(300);

    const clearCallback = scheduledCallbacks[0];

    expect(clearCallback).toBeTypeOf('function');
    clearCallback?.();
    expect(collisionGraphics.clear).toHaveBeenCalledTimes(2);
    expect(boardGraphics.clear).toHaveBeenCalledTimes(1);

    renderer.destroy();
    expect(collisionGraphics.destroy).toHaveBeenCalledOnce();
    expect(boardGraphics.destroy).toHaveBeenCalledOnce();
  });
});
