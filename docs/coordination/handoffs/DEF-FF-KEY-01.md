# 작업 인계: `DEF-FF-KEY-01`

## 식별 정보

- 담당 AI / 모델 / 설정: Antigravity / Gemini 3.5 Flash high
- 명세 버전 / task packet revision: 1.0-plan / revision 1
- 기준 SHA(`base_sha`): `23770958c710b4a8b4941fc11153c14be9d4eca1`
- 브랜치 / 결과 SHA(`head_sha`): `agent/antigravity/DEF-FF-KEY-01-firefox-keypress` / `a436bf63c0cb9dddfa50b64f5f9570583e823e24`
- 연결 Issue / PR: `docs/coordination/tasks/DEF-FF-KEY-01.yaml`
- 승인자 / 승인 시각: human-user / `2026-07-26T01:30:00Z`
- 상태: `review-ready`

## 수행 내용

- 변경 목적: Firefox Juggler IPC 키 입력 지연으로 인해 발생하던 rapid-keypress 테스트 타이밍 실패(`production.spec.ts` 스크롤/방향 검증, `sg020-audit.spec.ts` reduced motion 검증)를 제품 코드 수정 없이 결정론적(deterministic) 대기 로직으로 해결.
- 변경 파일:
  - `tests/e2e/production.spec.ts`
  - `tests/e2e/sg020-audit.spec.ts`
  - `docs/coordination/tasks/DEF-FF-KEY-01.yaml`
  - `docs/coordination/handoffs/DEF-FF-KEY-01.md`
- 의도적으로 변경하지 않은 범위:
  - 제품 코드 (`src/**`), 설정 파일 (`playwright.config.ts`, `package.json`, `package-lock.json`, `vite.config.ts`), CI 워크플로우 (`.github/**`), 기존 조정 파일 (`STATUS.md`, `SG-028.*` 등).

## 수용 기준 증거

| AC | 증거(테스트 이름, 스크린샷, 로그 또는 수동 절차) | 결과 |
|---|---|---|
| DEF-FF-KEY-01-AC01 | `production.spec.ts` "Keyboard Controls, WASD, Space, and preventDefault scroll prevention" Firefox 1366x768 3/3 연속 통과 (`31.6s`, `31.6s`, `31.7s`) | PASS |
| DEF-FF-KEY-01-AC02 | `sg020-audit.spec.ts` "Reduced motion preserves outline/text/score collision feedback" Firefox 1366x768 3/3 연속 통과 (`31.6s`, `31.6s`, `31.7s`) | PASS |
| DEF-FF-KEY-01-AC03 | 두 테스트 Chromium 1366x768 3/3 연속 통과 (`7.6s`, `7.6s`, `7.6s`) | PASS |
| DEF-FF-KEY-01-AC04 | 하드 슬립 (`waitForTimeout`) 0건, `expect.poll` 및 DOM 상태 기반 결정론적 대기 사용. 제품 코드·설정·CI 변경 0건 | PASS |

## 실행한 검증

| 명령/환경 | exit code | 실제 결과 |
|---|---:|---|
| `PLAYWRIGHT_ENGINES=firefox PLAYWRIGHT_VIEWPORTS=1366x768 npx playwright test tests/e2e/production.spec.ts tests/e2e/sg020-audit.spec.ts -g "Keyboard Controls\|Reduced motion preserves"` | 0 | 3/3회 연속 2 passed (`31.6s`, `31.6s`, `31.7s`) |
| `PLAYWRIGHT_ENGINES=chromium PLAYWRIGHT_VIEWPORTS=1366x768 npx playwright test tests/e2e/production.spec.ts tests/e2e/sg020-audit.spec.ts -g "Keyboard Controls\|Reduced motion preserves"` | 0 | 3/3회 연속 2 passed (`7.6s`, `7.6s`, `7.6s`) |
| `npm run format:check` | 0 | All matched files use Prettier code style! |
| `npm run lint` | 0 | 0 errors, 0 warnings |
| `npm run typecheck` | 0 | tsc --noEmit exit 0 |
| `git diff --check` | 0 | 0 whitespace errors |

실행하지 못한 검증과 이유: 없음.

## 결정과 위험

- 새 의존성: 없음
- 새 결정 또는 기존 결정과의 차이: 없음
- 알려진 위험/제약: Firefox Juggler IPC 키 입력 지연으로 인해 테스트 실행 시간이 Chromium 대비 약 4배 소요됨.
- 남은 작업과 권장 담당자: Codex의 리뷰 및 local main 통합 (`git -C <primary worktree> merge --ff-only agent/antigravity/DEF-FF-KEY-01-firefox-keypress`).

## 리뷰어 재현 절차

1. 브랜치 체크아웃: `git checkout agent/antigravity/DEF-FF-KEY-01-firefox-keypress`
2. 변경 경로 검증: `git diff --name-only 23770958c710b4a8b4941fc11153c14be9d4eca1..HEAD` (허용된 4개 파일만 표시됨 확인)
3. 공백 및 코드 품질 검증: `npm run format:check && npm run lint && npm run typecheck && git diff --check`
4. Firefox 3회 연속 실행: `PLAYWRIGHT_ENGINES=firefox PLAYWRIGHT_VIEWPORTS=1366x768 npx playwright test tests/e2e/production.spec.ts tests/e2e/sg020-audit.spec.ts -g "Keyboard Controls|Reduced motion preserves"`
5. Chromium 3회 연속 실행: `PLAYWRIGHT_ENGINES=chromium PLAYWRIGHT_VIEWPORTS=1366x768 npx playwright test tests/e2e/production.spec.ts tests/e2e/sg020-audit.spec.ts -g "Keyboard Controls|Reduced motion preserves"`
