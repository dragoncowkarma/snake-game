# Snake Game

Phaser.js와 TypeScript로 만드는 반응형 Snake 게임입니다. GitHub Pages에서 정적 사이트로 배포하는 것을 목표로 합니다.

현재 단계는 **Wave 0·H0b 완료, Wave 1 구현 미착수**입니다. D-001~D-006과 공용 계약은 승인됐으며, 다음 후보 SG-005는 별도의 승인된 task packet/Issue와 claim을 기록한 뒤 시작합니다.

## 문서 안내

- [사람용 개발 기획서](docs/DEVELOPMENT_PLAN.md)
- [세부 작업 및 AI 모델 배정](docs/TASKS.md)
- [AI 실행 프롬프트](docs/AI_PROMPTS.md)
- [10년차 전문가 검토와 반영 결과](docs/EXPERT_REVIEW.md)
- [모든 AI가 따라야 할 협업 규칙](AGENTS.md)
- [현재 프로젝트 상태](docs/coordination/STATUS.md)
- [결정 기록](docs/coordination/DECISIONS.md)
- [작업 인계 템플릿](docs/coordination/HANDOFF_TEMPLATE.md)

## 계획 기준선

- Phaser `4.2.1` 확정 기준선, TypeScript, Vite `8.1.x`, Node.js `24.x` LTS, npm
- 20×20 논리 그리드, 고정 시뮬레이션 틱, 결정론적 게임 코어
- 키보드와 모바일 HTML 방향 버튼 지원
- Vitest 단위 테스트, Playwright 브라우저 테스트
- GitHub Actions 품질 검사와 H3a 승인 후 GitHub Pages 수동 artifact 배포
- Claude, Codex, Antigravity의 역할 분리와 교차 검토

Phaser 4.2.1은 Scene, Graphics, 입력, 스케일, strict TypeScript, Pages 하위 경로, Chromium/WebKit production-preview 기술 스파이크를 통과해 H0b에서 MVP 기준선으로 확정됐습니다. 출시 전에는 지원 OS와 최신 브라우저 도구로 다시 검증하며, 버전 변경은 별도 결정으로만 진행합니다. 자세한 증거와 판정 기준은 기획서와 결정 기록에 있습니다.

## 로컬 검증

Node.js 24에서 다음 명령으로 clean 검증을 실행합니다.

```sh
npm ci
npm run verify
```

저장소 프로젝트 Pages 경로도 별도로 확인합니다.

```sh
npm run build -- --base /snake-game/
PLAYWRIGHT_BASE_PATH=/snake-game/ PLAYWRIGHT_USE_EXISTING_BUILD=1 npm run test:e2e
```

## Pages 수동 릴리스와 제한된 롤백

`.github/workflows/pages-release.yml`은 push 이벤트가 아닌 수동 dispatch만 받습니다. H3a 전에는 실행하지 않습니다. H3a가 정확한 release candidate SHA를 승인한 뒤에만, 사람이 GitHub Actions variable `H3A_APPROVED_RELEASE_SHA`에 그 40자리 SHA를 설정하고 Actions 화면에서 같은 값을 `release_sha`로 입력합니다. workflow는 입력 형식, H3a variable과의 정확한 일치, checkout한 `git rev-parse HEAD`를 차례로 검증합니다.

build job은 clean `npm ci`와 `npm run verify`를 통과한 뒤 Pages가 제공한 base path로 Vite artifact를 다시 빌드합니다. artifact에는 `dist/release.json`으로 검증한 source SHA를 기록하며, deploy job만 Pages/OIDC 쓰기 권한을 갖습니다. `gh-pages` branch와 `dist` commit은 사용하지 않습니다.

배포가 실패하거나 URL smoke가 실패하면 다음의 bounded 절차를 사용합니다.

1. 실패한 run을 중지하고, 이전 H3b 수락 릴리스의 `release.json` source SHA와 run URL을 기록합니다. 임의 branch나 최신 `main`을 rollback 대상으로 쓰지 않습니다.
2. 사람이 그 known-good SHA의 재배포를 명시적으로 승인하고 `H3A_APPROVED_RELEASE_SHA`를 그 SHA로 바꿉니다. source를 고쳐야 하면 먼저 새 candidate를 만들고 전체 검증과 새 H3a 승인을 받습니다.
3. workflow를 정확히 한 번 다시 dispatch하여 같은 SHA를 `release_sha`로 입력하고, 완료 뒤 실제 Pages URL smoke와 `release.json`을 확인합니다.
4. 그 재배포도 실패하면 추가 retry나 권한 확대 없이 중단하고 run URL·SHA·오류를 release 기록에 남겨 사람의 결정을 기다립니다.
