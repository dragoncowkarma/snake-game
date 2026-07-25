# Snake Game

20×20 그리드 클래식 Snake를 데스크톱과 모바일에서 즉시 플레이할 수 있는 정적 웹 게임입니다.
GitHub Pages에서 서버 없이 동작하며 계정, 네트워크, 설치가 필요 없습니다.

예상 공개 URL: `https://dragoncowkarma.github.io/snake-game/`

## 게임 방법

### 조작

| 동작 | 키보드 | 화면 버튼 |
|---|---|---|
| 이동 | 방향키 또는 W A S D | 화면 방향 버튼 (▲ ▼ ◄ ►) |
| 일시정지 / 재개 | P 또는 Escape | Pause / Resume 버튼 |
| 재시작 | Enter 또는 Space (게임오버 / 클리어 화면) | Restart 버튼 |
| 메인 메뉴 | — | Menu 버튼 |
| 음소거 토글 | M (보드에 포커스가 있을 때) | Mute 버튼 |

READY 상태에서 왼쪽 방향은 역방향이라 거부됩니다. 오른쪽 / 위 / 아래 입력 중 하나로 게임이 시작됩니다.

### 난이도

메인 메뉴에서 Slow 또는 Normal을 선택합니다.

| 난이도 | 시작 속도 | 가속 | 최고 속도 |
|---|---:|---|---:|
| Slow | 220ms/칸 | 먹이 5개마다 10ms 감소 | 130ms/칸 |
| Normal | 160ms/칸 | 먹이 5개마다 10ms 감소 | 90ms/칸 |

### 로컬 최고 점수

먹이 1개당 10점이며 최고 점수는 난이도별로 브라우저 `localStorage`에 저장됩니다.
저장소 접근이 차단되거나 값이 손상되어도 게임은 정상 동작하며, 세션 내 메모리 값으로 계속 진행합니다.

### 음소거

첫 사용자 제스처 이후 Web Audio로 짧은 효과음을 재생합니다.
Mute 버튼 또는 M 키로 음소거를 켜고 끌 수 있으며, 설정은 `localStorage`에 유지됩니다.
오디오 초기화가 실패해도 게임 진행에는 영향이 없습니다.

## 접근성

### 제공하는 범위

- 키보드만으로 메뉴 선택 → 게임 시작 → 일시정지 → 재시작 전 과정을 수행할 수 있습니다.
- 각 화면 전환 시 포커스가 알맞은 버튼(Start / Resume / Restart)으로 자동 이동합니다.
- 점수, 최고 점수, 게임 상태, 종료 원인이 DOM 텍스트로 제공됩니다.
- 의미 있는 상태 변화(게임 시작·종료·일시정지 등)는 `aria-live="polite"` 영역으로 한 번 알립니다.
- 모든 화면 버튼은 접근 가능한 이름과 보이는 포커스 스타일, 44×44 CSS px 이상 터치 영역을 갖습니다.
- `prefers-reduced-motion: reduce`에서 확대·이동 Tween 없이 윤곽과 텍스트로만 동작합니다.
- 뱀 머리·몸·먹이·충돌 셀은 색상뿐 아니라 형태와 테두리로 구분됩니다.
- 텍스트 명암비 4.5:1, UI 경계와 필수 게임 그래픽 명암비 3:1 이상을 목표로 합니다.

### 제공하지 않는 범위

- **완전한 비시각적 동등 플레이를 보장하지 않습니다.** 게임 보드는 Canvas로 렌더링되며 격자 좌표를 매 틱마다 스크린리더로 읽지 않습니다.
- 온라인 리더보드, 서버 저장, 로그인이 없습니다.
- PWA / Service Worker / 완전 오프라인 캐시가 없습니다.
- 스와이프 제스처, 배경음악, 진동, 멀티플레이가 없습니다.

## 개발 환경

Node.js **24.x** LTS가 필요합니다. 버전 관리 도구를 사용하는 경우:

```bash
nvm use
```

## 설치

```bash
npm ci
```

## 로컬 개발 서버

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`을 엽니다.

## 전체 검증

```bash
npm run verify
```

포맷, 린트, 타입 검사, 단위 테스트, 커버리지, 빌드, Chromium E2E가 순서대로 실행됩니다.
모든 명령이 exit 0을 반환해야 합니다.

## Pages 경로 사전 검증

저장소 프로젝트 Pages 하위 경로(`/snake-game/`)로 배포 전에 로컬에서 확인합니다.

```bash
npm run build -- --base /snake-game/
```

```bash
PLAYWRIGHT_BASE_PATH=/snake-game/ PLAYWRIGHT_USE_EXISTING_BUILD=1 npm run test:e2e
```

## GitHub Pages 설정

저장소 Settings → Pages → Build and deployment → Source를 **GitHub Actions**로 설정합니다.
이 설정은 최초 1회만 필요하며 관리자 권한이 필요합니다.

## Pages 수동 배포

`.github/workflows/pages-release.yml`은 H3a 사람 승인 이후에만 dispatch합니다.

1. H3a 승인자가 GitHub 저장소 Settings → Secrets and variables → Actions → Variables에서
   `H3A_APPROVED_RELEASE_SHA` variable을 정확한 40자리 release candidate SHA로 설정합니다.
2. Actions 탭에서 **Pages Release** workflow를 선택하고 **Run workflow**를 클릭합니다.
3. `release_sha` 입력란에 같은 40자리 SHA를 입력하고 실행합니다.
4. workflow는 입력 형식, H3a variable과의 정확한 일치, checkout 후 `git rev-parse HEAD`를 차례로 검증합니다.
5. 빌드 성공 후 배포가 완료되면 실제 Pages URL에서 아래 배포 확인 절차를 수행합니다.

## 배포 확인

배포 완료 후 다음을 확인합니다.

- `https://dragoncowkarma.github.io/snake-game/` HTTP 200 응답
- `https://dragoncowkarma.github.io/snake-game/release.json` 파일의 `source_sha`가 H3a 승인 SHA와 일치
- 브라우저 콘솔 오류 0건, JS·CSS·favicon 404 0건
- 시작 → 이동 → 일시정지 → 재시작 스모크 통과

## 제한된 롤백

배포 실패 또는 배포 후 스모크 실패 시 다음 절차를 사용합니다.

1. 실패한 run을 중지하고, 이전 H3b 수락 릴리스의 `release.json` source SHA와 run URL을 기록합니다.
   임의 branch나 최신 `main`을 롤백 대상으로 쓰지 않습니다.
2. 사람이 해당 known-good SHA의 재배포를 명시적으로 승인하고 `H3A_APPROVED_RELEASE_SHA`를 그 SHA로 변경합니다.
   소스를 수정해야 한다면 먼저 새 candidate를 만들고 전체 검증과 새 H3a 승인을 받습니다.
3. workflow를 정확히 한 번 재dispatch하여 같은 SHA를 `release_sha`로 입력하고,
   완료 후 배포 확인 절차를 다시 수행합니다.
4. 재배포도 실패하면 추가 retry나 권한 확대 없이 중단하고 run URL·SHA·오류를 기록하여 사람의 결정을 기다립니다.

## 라이선스

[MIT License](LICENSE) — Copyright (c) 2026 dragoncowkarma

### 런타임 의존성

| 패키지 | 버전 | 라이선스 |
|---|---|---|
| [Phaser](https://phaser.io/) | 4.2.1 | MIT |

### 개발 의존성

TypeScript 6.0.3, Vite 8.1.5, Vitest 4.1.10, Playwright 1.61.1, ESLint 10.7.0, Prettier 3.9.5

## 개발 문서

- [개발 기획서](docs/DEVELOPMENT_PLAN.md)
- [세부 작업 및 AI 모델 배정](docs/TASKS.md)
- [AI 실행 프롬프트](docs/AI_PROMPTS.md)
- [전문가 검토 결과](docs/EXPERT_REVIEW.md)
- [AI 협업 규칙](AGENTS.md)
- [프로젝트 상태](docs/coordination/STATUS.md)
- [결정 기록](docs/coordination/DECISIONS.md)
