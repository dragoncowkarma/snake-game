import '../styles.css';

import { createGameShell } from './app.ts';
import type { Command } from './contracts.ts';

export function findAppRoot(document: Document): HTMLElement {
  const root = document.querySelector<HTMLElement>('#app');

  if (root === null) {
    throw new Error('Missing #app root element');
  }

  return root;
}

/**
 * No application command router exists yet: src/domain/** (SG-007), the Phaser
 * scene (SG-012), and the integration wiring (SG-014) have not landed. The shell is
 * contract-ready — it only ever produces or consumes the public Command/GameState/
 * DomainEvent shapes from docs/coordination/CONTRACTS.md — but there is nothing to
 * route dispatched commands to in production yet.
 */
function dispatchStub(command: Command): void {
  console.info('[snake-game] command not yet wired to a domain router:', command.type);
}

if (typeof document !== 'undefined') {
  createGameShell(findAppRoot(document), dispatchStub);
}
