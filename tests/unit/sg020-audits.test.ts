import { describe, expect, it, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

import { STORAGE_KEYS } from '../../src/adapters/game-preferences.ts';

// SG-020 Wave 4 adversarial/release audits that are fully automatable (source-audit
// and static-token form). Real-device rows (MAN-*, ENV-REAL-*, NFR-P01/P02 mobile
// performance) are explicitly out of scope here: QA_PLAN.md requires actual iOS/
// Android hardware, VoiceOver/TalkBack, and calibrated audio/perf equipment and
// rejects synthetic evidence for those rows.

const commitSha = (() => {
  try {
    return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'unknown';
  }
})();
const headSha12 = commitSha.slice(0, 12);

const getUtcDateString = () => {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
};
const utcDate = getUtcDateString();

const artifactDir = path.resolve(process.cwd(), './test-results/unit');
const evidenceData: Record<string, { subject: string; content: unknown }> = {};

const recordEvidence = (id: string, subject: string, content: unknown) => {
  evidenceData[id] = { subject, content };
};

afterAll(() => {
  fs.mkdirSync(artifactDir, { recursive: true });
  Object.entries(evidenceData).forEach(([id, { subject, content }]) => {
    const filename = `SG-020_${id}_NFR_${headSha12}_${subject}_${utcDate}.json`;
    fs.writeFileSync(path.join(artifactDir, filename), JSON.stringify(content, null, 2), 'utf-8');
  });
});

function getAllFilesRecursive(dir: string): string[] {
  let results: string[] = [];
  for (const entry of fs.readdirSync(dir)) {
    const entryPath = path.join(dir, entry);
    const stat = fs.statSync(entryPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllFilesRecursive(entryPath));
    } else {
      results.push(entryPath);
    }
  }
  return results;
}

function scanSourceFor(regex: RegExp): string[] {
  const srcDir = path.resolve(process.cwd(), './src');
  const hits: string[] = [];

  for (const file of getAllFilesRecursive(srcDir)) {
    if (!file.endsWith('.ts') || file.endsWith('.test.ts')) {
      continue;
    }
    const content = fs.readFileSync(file, 'utf-8');
    content.split('\n').forEach((line, idx) => {
      if (regex.test(line)) {
        hits.push(`${path.relative(process.cwd(), file)}:${idx + 1}: ${line.trim()}`);
      }
    });
  }
  return hits;
}

describe('SG-020 Wave 4 automated release audits', () => {
  it('NFR-SEC01: zero analytics/PII/cookie/tracking source paths', () => {
    const regex =
      /analytics|gtag|mixpanel|segment\.io|amplitude|sentry|document\.cookie|sendBeacon|XMLHttpRequest|\bfetch\(/i;
    const hits = scanSourceFor(regex);

    expect(hits).toEqual([]);

    recordEvidence('NFR-SEC01', 'source-audit', {
      id: 'NFR-SEC01',
      passed: true,
      gitCommitSha: commitSha,
      violations: hits,
      note: 'A regex regression guard over the current source, not an adversarial-proof audit: bracket-notation property access, string-concatenated identifiers, or a WebSocket/EventSource exfil path would not be caught. HAR-based zero-external-request evidence (NFR-P04) is recorded separately and corroborates an empty outbound data/cookie surface for the current build.',
    });
  });

  it('NFR-SEC02: stored semantic data is limited to slow best, normal best, mute, last difficulty', () => {
    const keys = [
      STORAGE_KEYS.highScore('slow'),
      STORAGE_KEYS.highScore('normal'),
      STORAGE_KEYS.muted,
      STORAGE_KEYS.lastDifficulty,
    ];
    const uniqueKeys = new Set(keys);

    expect(uniqueKeys.size).toBe(4);
    expect([...uniqueKeys].every((key) => key.startsWith('snake-game:v1:'))).toBe(true);

    recordEvidence('NFR-SEC02', 'storage', {
      id: 'NFR-SEC02',
      passed: true,
      gitCommitSha: commitSha,
      keys: [...uniqueKeys],
    });
  });

  it('NFR-SEC03: zero user-controlled HTML insertion sinks', () => {
    const regex = /innerHTML|insertAdjacentHTML|outerHTML|document\.write/;
    const hits = scanSourceFor(regex);

    expect(hits).toEqual([]);

    recordEvidence('NFR-SEC03', 'source-audit', {
      id: 'NFR-SEC03',
      passed: true,
      gitCommitSha: commitSha,
      violations: hits,
      note: 'A regex regression guard over the current source, not an adversarial-proof audit; a deliberately obfuscated sink (bracket-notation property access, string-concatenated method names) would not be caught.',
    });
  });

  it('NFR-M03: zero committed dist, Playwright binaries, or generated reports', () => {
    const tracked = execSync('git ls-files', { cwd: process.cwd() }).toString().split('\n');
    const forbidden = tracked.filter((file) =>
      /^(dist\/|coverage\/|playwright-report\/|test-results\/|blob-report\/|\.playwright\/)/.test(
        file,
      ),
    );

    expect(forbidden).toEqual([]);

    recordEvidence('NFR-M03', 'git-files', {
      id: 'NFR-M03',
      passed: true,
      gitCommitSha: commitSha,
      violations: forbidden,
    });
  });

  it('AC-U05: zero Phaser scale/movement Tween API usage in source (reduced-motion has nothing to disable)', () => {
    const regex = /\.tweens\.(add|create|chain|addCounter)|new\s+Phaser\.Tweens/;
    const hits = scanSourceFor(regex);

    expect(hits).toEqual([]);

    recordEvidence('AC-U05', 'tween-source-audit', {
      id: 'AC-U05',
      passed: true,
      gitCommitSha: commitSha,
      violations: hits,
      note: 'BoardRenderer (src/game/board-renderer.ts) uses a static 300ms stroke outline via scene.time.delayedCall, not a Tween; this holds identically whether prefers-reduced-motion is set or not. DOM outline/text/score feedback is exercised under reducedMotion emulation in tests/e2e/sg020-audit.spec.ts.',
    });
  });

  it('CHK-U08: WCAG contrast ratios for text (>=4.5:1) and UI boundaries/game graphics (>=3:1)', () => {
    const cssPath = path.resolve(process.cwd(), './src/styles.css');
    const css = fs.readFileSync(cssPath, 'utf-8');

    function extractVars(block: string): Record<string, string> {
      const vars: Record<string, string> = {};
      const varRegex = /--sg-([a-z-]+):\s*(#[0-9a-fA-F]{6});/g;
      let match: RegExpExecArray | null;
      while ((match = varRegex.exec(block)) !== null) {
        vars[match[1]!] = match[2]!.toLowerCase();
      }
      return vars;
    }

    const rootMatch = /:root\s*{([^}]*)}/.exec(css);
    expect(rootMatch).not.toBeNull();
    const dark = extractVars(rootMatch![1]!);

    const lightBlockMatch = /@media \(prefers-color-scheme: light\)\s*{\s*:root\s*{([^}]*)}/.exec(
      css,
    );
    expect(lightBlockMatch).not.toBeNull();
    const light = extractVars(lightBlockMatch![1]!);

    function hexToRgb(hex: string): [number, number, number] {
      const n = hex.replace('#', '');
      return [
        parseInt(n.slice(0, 2), 16),
        parseInt(n.slice(2, 4), 16),
        parseInt(n.slice(4, 6), 16),
      ];
    }

    function relLuminance([r, g, b]: [number, number, number]): number {
      const channel = (c: number) => {
        const cs = c / 255;
        return cs <= 0.03928 ? cs / 12.92 : ((cs + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    }

    function contrastRatio(hexA: string, hexB: string): number {
      const lumA = relLuminance(hexToRgb(hexA));
      const lumB = relLuminance(hexToRgb(hexB));
      const lighter = Math.max(lumA, lumB);
      const darker = Math.min(lumA, lumB);
      return (lighter + 0.05) / (darker + 0.05);
    }

    const textPairs: Array<[string, string, string]> = [
      ['text/bg', 'text', 'bg'],
      ['text/surface', 'text', 'surface'],
      ['text-muted/bg', 'text-muted', 'bg'],
      ['text-muted/surface', 'text-muted', 'surface'],
      ['accent-text/accent', 'accent-text', 'accent'],
      ['danger-text/danger', 'danger-text', 'danger'],
    ];
    const uiPairs: Array<[string, string, string]> = [
      ['surface-border/bg', 'surface-border', 'bg'],
      ['focus-ring/bg', 'focus-ring', 'bg'],
    ];

    const results: Record<string, unknown> = {};
    const failures: string[] = [];

    for (const [schemeName, scheme] of [
      ['dark', dark],
      ['light', light],
    ] as const) {
      for (const [label, fgKey, bgKey] of textPairs) {
        const ratio = contrastRatio(scheme[fgKey]!, scheme[bgKey]!);
        results[`${schemeName}:${label}`] = ratio;
        if (ratio < 4.5) failures.push(`${schemeName}:${label}=${ratio.toFixed(2)}`);
      }
      for (const [label, fgKey, bgKey] of uiPairs) {
        const ratio = contrastRatio(scheme[fgKey]!, scheme[bgKey]!);
        results[`${schemeName}:${label}`] = ratio;
        if (ratio < 3.0) failures.push(`${schemeName}:${label}=${ratio.toFixed(2)}`);
      }
    }

    // board-renderer.ts hardcodes its canvas palette independent of the CSS
    // color-scheme; verify its own game-graphics-vs-board contrast directly.
    const canvas = {
      board: '#16213a',
      grid: '#64707e',
      body: '#6fd67a',
      head: '#ffd166',
      food: '#ff8f8f',
      collision: '#ffffff',
    };
    for (const label of ['grid', 'body', 'head', 'food', 'collision'] as const) {
      const ratio = contrastRatio(canvas[label], canvas.board);
      results[`canvas:${label}/board`] = ratio;
      if (ratio < 3.0) failures.push(`canvas:${label}/board=${ratio.toFixed(2)}`);
    }

    expect(failures).toEqual([]);

    // Flag pairs passing by a thin margin (<10% above their required minimum) so a
    // future one-line color tweak that silently regresses contrast is easy to spot
    // in the evidence record even though the test itself only asserts the boundary.
    const tightMargins = Object.entries(results)
      .map(([label, ratio]) => {
        const minRequired = label.includes('text') ? 4.5 : 3.0;
        return { label, ratio: ratio as number, minRequired };
      })
      .filter(({ ratio, minRequired }) => ratio < minRequired * 1.1)
      .map(({ label, ratio }) => `${label}=${ratio.toFixed(3)}`);

    recordEvidence('CHK-U08', 'contrast', {
      id: 'CHK-U08',
      passed: true,
      gitCommitSha: commitSha,
      ratios: results,
      tightMargins,
      method:
        'WCAG 2.x relative-luminance formula over CSS custom-property token values (browser-independent; the ratio is identical regardless of rendering engine).',
    });
  });
});
