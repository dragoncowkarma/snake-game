import { appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const previewHost = '127.0.0.1';
export const previewPort = 4173;
export const previewOrigin = `http://${previewHost}:${previewPort}`;

export function normalizeBasePath(value: string | undefined): string {
  const path = value?.trim().replace(/^\/+|\/+$/g, '') ?? '';

  return path === '' ? '/' : `/${path}/`;
}

export function repositoryBasePath(repository: string | undefined): string {
  const repositoryName = repository?.trim().split('/').at(-1) ?? '';

  if (!/^[A-Za-z0-9._-]+$/.test(repositoryName)) {
    throw new Error('GITHUB_REPOSITORY must end with a valid repository name');
  }

  return normalizeBasePath(repositoryName);
}

function writeGitHubOutput(): void {
  const outputPath = process.env['GITHUB_OUTPUT'];

  if (outputPath === undefined) {
    throw new Error('GITHUB_OUTPUT is required for the github-output command');
  }

  appendFileSync(outputPath, `base_path=${repositoryBasePath(process.env['GITHUB_REPOSITORY'])}\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url) && process.argv[2] === 'github-output') {
  writeGitHubOutput();
}
