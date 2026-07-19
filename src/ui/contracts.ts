/**
 * Re-exports the real src/domain public contract (SG-003 §1, implemented by SG-007/
 * SG-010) for src/ui/** and tests/** consumers that import from this path. This used
 * to be a hand-maintained type-only mirror of docs/coordination/CONTRACTS.md written
 * before src/domain/** existed; SG-013 replaces the duplicated declarations with a
 * single re-export so the two definitions cannot drift. Kept as a module (rather than
 * updating every import site to '../domain/index.ts') because tests/fixtures.ts,
 * tests/fixtures.test.ts, and tests/helpers/ev-fail-01.ts (Antigravity-owned, outside
 * this task's allowed paths) import this exact path.
 */
export type {
  Cell,
  Command,
  CommandType,
  Difficulty,
  Direction,
  DomainEvent,
  EndReason,
  GameState,
  Phase,
} from '../domain/index.ts';
