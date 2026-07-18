import type { Command, GameState } from '../../src/ui/contracts.ts';

export interface EvFail01 {
  // 1. Seed or scripted RNG tuple list
  readonly rngInput: {
    readonly type: 'seeded' | 'scripted';
    readonly seed?: number;
    readonly script?: ReadonlyArray<readonly [number, number]>;
  };

  // 2. Semantic command trace with dispositions
  readonly commandTrace: ReadonlyArray<{
    readonly command: Command;
    readonly disposition: 'accepted' | 'rejected' | 'ignored';
  }>;

  // 3. Runtime/engine (e.g. "Node.js" or "Playwright/Chromium")
  readonly runtimeEngine: string;

  // 4. Exact runtime version (e.g. "24.14.0" or "149.0.7827.55")
  readonly runtimeVersion: string;

  // 5. Viewport or device/OS (e.g. "1366x768" or "iPhone 15/iOS 17.4")
  readonly contextViewportOrDevice: string;

  // 6. Full 40-character SHA
  readonly gitCommitSha: string;

  // 7. Visual capture (e.g. image/video path or 'N/A')
  readonly visualCapturePath: string;

  // 8. Execution trace/state JSON (the states visited)
  readonly executionTrace: ReadonlyArray<GameState>;

  // 9. Console/stdout log
  readonly consoleStdoutLog: string;

  // 10. Network/HAR log path or 'N/A'
  readonly networkHarLogPath: string;
}
