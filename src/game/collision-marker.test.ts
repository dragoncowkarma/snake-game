import { describe, expect, it } from 'vitest';

import { collisionMarkerFor, type BoardGeometry, type GameEndedEvent } from './collision-marker.ts';

const GEOMETRY: BoardGeometry = {
  cellCount: 20,
  cellSize: 24,
  logicalSize: 480,
};

function ended(
  reason: GameEndedEvent['reason'],
  headCell: GameEndedEvent['headCell'],
  attemptedCell: GameEndedEvent['attemptedCell'],
): GameEndedEvent {
  return { type: 'gameEnded', reason, headCell, attemptedCell };
}

describe('collisionMarkerFor', () => {
  it('maps a self-collision to the authoritative attempted cell outline', () => {
    expect(collisionMarkerFor(ended('self', { x: 2, y: 2 }, { x: 2, y: 3 }), GEOMETRY)).toEqual({
      kind: 'cell',
      x: 50,
      y: 74,
      size: 20,
    });
  });

  it('maps each wall attempt to the adjacent visible board edge', () => {
    expect(collisionMarkerFor(ended('wall', { x: 19, y: 10 }, { x: 20, y: 10 }), GEOMETRY)).toEqual(
      {
        kind: 'edge',
        x1: 478,
        y1: 242,
        x2: 478,
        y2: 262,
      },
    );
    expect(collisionMarkerFor(ended('wall', { x: 0, y: 10 }, { x: -1, y: 10 }), GEOMETRY)).toEqual({
      kind: 'edge',
      x1: 2,
      y1: 242,
      x2: 2,
      y2: 262,
    });
    expect(collisionMarkerFor(ended('wall', { x: 10, y: 0 }, { x: 10, y: -1 }), GEOMETRY)).toEqual({
      kind: 'edge',
      x1: 242,
      y1: 2,
      x2: 262,
      y2: 2,
    });
    expect(collisionMarkerFor(ended('wall', { x: 10, y: 19 }, { x: 10, y: 20 }), GEOMETRY)).toEqual(
      {
        kind: 'edge',
        x1: 242,
        y1: 478,
        x2: 262,
        y2: 478,
      },
    );
  });

  it('returns no marker for an invalid reason-coordinate combination', () => {
    expect(collisionMarkerFor(ended('self', { x: 0, y: 0 }, { x: -1, y: 0 }), GEOMETRY)).toBeNull();
    expect(collisionMarkerFor(ended('wall', { x: 2, y: 2 }, { x: 3, y: 2 }), GEOMETRY)).toBeNull();
  });
});
