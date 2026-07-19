export { PHASE_COMMAND_POLICY } from './command-policy.ts';
export { reset } from './reset.ts';
export { enqueueDirection, step } from './snake-simulation.ts';
export type {
  Cell,
  Command,
  CommandPolicy,
  CommandType,
  Difficulty,
  Direction,
  DirectionDisposition,
  DirectionQueue,
  DomainEvent,
  EndReason,
  EnqueueDirectionResult,
  GameState,
  Phase,
  PhaseCommandPolicy,
  RandomSource,
  ResetPhase,
  ResetRequest,
  TransitionResult,
} from './types.ts';
