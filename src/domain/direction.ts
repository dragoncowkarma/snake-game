import type { Cell, Direction } from './types.ts';

const DIRECTION_DELTAS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
} as const satisfies Readonly<Record<Direction, Cell>>;

const OPPOSITE_DIRECTIONS = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
} as const satisfies Readonly<Record<Direction, Direction>>;

export function isOppositeDirection(candidate: Direction, reference: Direction): boolean {
  return candidate === OPPOSITE_DIRECTIONS[reference];
}

export function moveCell(cell: Cell, direction: Direction): Cell {
  const delta = DIRECTION_DELTAS[direction];

  return {
    x: cell.x + delta.x,
    y: cell.y + delta.y,
  };
}
