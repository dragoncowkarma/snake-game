import type { DomainEvent } from '../domain/index.ts';

export type GameEndedEvent = Extract<DomainEvent, { readonly type: 'gameEnded' }>;

export interface BoardGeometry {
  readonly cellCount: number;
  readonly cellSize: number;
  readonly logicalSize: number;
}

export type CollisionMarker =
  | {
      readonly kind: 'cell';
      readonly x: number;
      readonly y: number;
      readonly size: number;
    }
  | {
      readonly kind: 'edge';
      readonly x1: number;
      readonly y1: number;
      readonly x2: number;
      readonly y2: number;
    };

const MARKER_INSET = 2;

function isBoardCell(cell: { readonly x: number; readonly y: number }, cellCount: number): boolean {
  return cell.x >= 0 && cell.x < cellCount && cell.y >= 0 && cell.y < cellCount;
}

/**
 * Maps the domain-provided collision coordinates to presentation geometry. It uses
 * the event's authoritative reason and never infers whether a collision occurred.
 */
export function collisionMarkerFor(
  event: GameEndedEvent,
  geometry: BoardGeometry,
): CollisionMarker | null {
  if (event.reason === 'self') {
    if (!isBoardCell(event.attemptedCell, geometry.cellCount)) {
      return null;
    }

    return {
      kind: 'cell',
      x: event.attemptedCell.x * geometry.cellSize + MARKER_INSET,
      y: event.attemptedCell.y * geometry.cellSize + MARKER_INSET,
      size: geometry.cellSize - MARKER_INSET * 2,
    };
  }

  const cellStartX = event.headCell.x * geometry.cellSize + MARKER_INSET;
  const cellEndX = (event.headCell.x + 1) * geometry.cellSize - MARKER_INSET;
  const cellStartY = event.headCell.y * geometry.cellSize + MARKER_INSET;
  const cellEndY = (event.headCell.y + 1) * geometry.cellSize - MARKER_INSET;
  const farEdge = geometry.logicalSize - MARKER_INSET;

  if (event.attemptedCell.x < 0) {
    return { kind: 'edge', x1: MARKER_INSET, y1: cellStartY, x2: MARKER_INSET, y2: cellEndY };
  }

  if (event.attemptedCell.x >= geometry.cellCount) {
    return { kind: 'edge', x1: farEdge, y1: cellStartY, x2: farEdge, y2: cellEndY };
  }

  if (event.attemptedCell.y < 0) {
    return { kind: 'edge', x1: cellStartX, y1: MARKER_INSET, x2: cellEndX, y2: MARKER_INSET };
  }

  if (event.attemptedCell.y >= geometry.cellCount) {
    return { kind: 'edge', x1: cellStartX, y1: farEdge, x2: cellEndX, y2: farEdge };
  }

  return null;
}
