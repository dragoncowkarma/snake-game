import { GAME_CONFIG } from '../config/game-config.ts';

import type { Cell, RandomSource } from './types.ts';

function cellKey(cell: Cell): string {
  return `${cell.x},${cell.y}`;
}

/**
 * Selects one unoccupied board cell in the contract's y-major/x-minor order.
 * A null result tells the step owner that the board is full; SG-010 maps that
 * condition to the won phase after growth.
 */
export function spawnFood(snake: readonly Cell[], randomSource: RandomSource): Cell | null {
  const occupied = new Set(snake.map(cellKey));
  const freeCells: Cell[] = [];

  for (let y = 0; y < GAME_CONFIG.board.height; y += 1) {
    for (let x = 0; x < GAME_CONFIG.board.width; x += 1) {
      const cell = { x, y };

      if (!occupied.has(cellKey(cell))) {
        freeCells.push(cell);
      }
    }
  }

  if (freeCells.length === 0) {
    return null;
  }

  const selectedIndex = randomSource.nextInt(freeCells.length);

  if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= freeCells.length) {
    throw new RangeError(
      `RandomSource.nextInt(${freeCells.length}) returned out-of-range index ${selectedIndex}`,
    );
  }

  const selectedCell = freeCells[selectedIndex];

  if (selectedCell === undefined) {
    throw new Error(`Invariant violation: free cell ${selectedIndex} disappeared after selection`);
  }

  return selectedCell;
}
