# 10년차 전문가 관점 교차 검토와 개선 결과

이 문서는 초기 계획을 다음 네 역할의 10년차 전문가 관점으로 독립 검토한 결과다. 실제 구현 전의 설계 감사이며, 각 관점은 정상 경로보다 실패 모드와 운영 위험을 우선했다.

- 웹 게임·프런트엔드 아키텍트
- 캐주얼 게임 디자이너·모바일 UX·접근성 전문가
- QA 자동화·GitHub Pages·DevOps 전문가
- 멀티 AI 테크리드·릴리스 관리자

## 1. 총평

초기 아이디어인 “Phaser로 Snake를 만들고 세 AI가 나눠 개발한다”만으로는 다음 네 위험이 컸다.

1. Phaser Scene에 규칙·입력·렌더링이 뒤섞여 테스트가 어려워진다.
2. 빠른 연속 입력, 꼬리 셀, 탭 복귀 같은 Snake 특유 경계가 명세에서 빠진다.
3. 캔버스만으로 UI를 만들면 모바일·키보드·보조기기 접근성이 떨어진다.
4. 세 AI가 채팅과 같은 파일로 상태를 공유하면 계약 드리프트와 merge conflict가 생긴다.

개선된 계획은 “순수 상태 전이 + 얇은 Phaser Scene + DOM UI”, “명시적 AC와 독립 QA”, “Issue/PR + 저장소 계약”, “단일 integrator와 파일 소유권”으로 이 위험을 줄인다.

## 2. 분야별 피드백과 반영

### 2.1 웹 게임 아키텍처

| 피드백 | 위험 | 반영한 개선 |
|---|---|---|
| Phaser가 게임 규칙까지 소유하면 headless 단위 테스트가 어렵다 | 높음 | `src/domain`을 Phaser/DOM에서 완전히 분리하고 snapshot/event만 외부로 전달 |
| 렌더 프레임이나 `setInterval`에 이동을 묶으면 30/60/120Hz 결과가 달라진다 | 높음 | delta accumulator 기반 fixed step, 250ms clamp, frame당 최대 3 step |
| 상태마다 Scene을 만들면 재시작 때 listener와 상태 인계가 복잡해진다 | 중간 | `GameScene` 하나와 명시적 `Phase` 상태 머신 사용 |
| 물리 엔진은 정수 grid 게임에 불필요하다 | 중간 | Arcade/Matter Physics 제외, 논리 셀만 판정 |
| 음식 retry loop는 보드가 찰수록 느리고 만석에서 멈춘다 | 높음 | free-cell 목록에서 균등 추첨, 빈 목록이면 `WON` |
| 비성장 tick의 현재 꼬리 셀을 몸으로 오판하기 쉽다 | 높음 | tick 처리 순서와 AC-G06을 명시하고 위험 분기 100% 테스트 |
| resize가 논리 좌표를 바꾸면 진행 상태가 손상된다 | 중간 | 480×480 논리 보드 유지, FIT로 표시 크기만 변경 |

검토 결과 게임 코어는 “상태 + 명령 + 주입 RNG → 새 상태 + event”라는 작은 계약으로 축소됐다. React, ECS, 범용 이벤트 버스 같은 구조는 제거했다.

### 2.2 게임 디자인·UX·접근성

| 피드백 | 위험 | 반영한 개선 |
|---|---|---|
| 기능 수보다 입력 예측 가능성과 죽은 이유가 중요하다 | 높음 | 최대 2칸 입력 큐, 마지막 승인 방향 기준 역회전 거부, 충돌 위치/원인 표시 |
| 시작 즉시 움직이면 초보자가 준비할 시간이 없다 | 중간 | `READY`에서 Right/Up/Down 입력 전까지 정지 |
| 스와이프만으로는 오입력과 운동 접근성 문제가 있다 | 높음 | 44px 이상 실제 HTML 방향 버튼을 필수로 하고 스와이프는 후순위 |
| 단일 고속 모드는 접근 장벽이다 | 중간 | 느림 220→130ms, 기본 160→90ms 두 난이도와 기록 분리 |
| 캔버스 HUD는 focus/스크린리더/자동 테스트에 불리하다 | 높음 | 메뉴·HUD·버튼·상태를 DOM으로 분리 |
| 매 이동을 live region으로 읽으면 과도한 알림이 된다 | 중간 | 먹이, pause, game over 같은 의미 있는 이벤트만 polite 알림 |
| 애니메이션·효과음이 유일한 피드백이면 정보가 사라진다 | 중간 | 형태·윤곽·텍스트를 기본으로 하고 reduced motion/no audio에서도 동등 정보 제공 |
| 자동 탭 복귀는 즉사 경험을 만든다 | 높음 | blur/hidden/회전 시 자동 pause, 사용자만 재개 가능 |

플레이테스트의 성공 기준도 “재미있다” 같은 주관적 표현 대신 10초 이내 시작, 사망 원인 설명, 2초 이내 재시작 발견으로 바꿨다.

### 2.3 QA·DevOps·GitHub Pages

| 피드백 | 위험 | 반영한 개선 |
|---|---|---|
| 기능 완성 후 Pages를 처음 확인하면 base path 결함이 늦게 발견된다 | 높음 | Wave 1에 `/snake-game/` production preview와 artifact dry run을 배치하고 base path 후행 슬래시 정규화 |
| dev server 테스트만으로 production 번들 결함을 놓친다 | 높음 | Playwright는 `dist` production preview를 대상으로 실행 |
| CI 성공만으로 실제 배포를 보장하지 못한다 | 높음 | Actions 출력 `page_url`의 HTTP/브라우저 bounded-retry smoke 추가 |
| gh-pages branch에 dist를 커밋하면 산출물 충돌이 늘어난다 | 중간 | 공식 Pages artifact 배포만 사용 |
| build/deploy를 한 권한으로 실행하면 토큰 권한이 넓어진다 | 높음 | build와 deploy 분리, deploy에만 Pages/OIDC 권한 |
| Action major tag만 사용하면 공급망 변경이 즉시 반영된다 | 중간 | 구현 시 최신 공식 starter 확인 후 전체 commit SHA pin + Dependabot |
| 테스트가 같은 구현 오류를 답습할 수 있다 | 높음 | Antigravity 독립 작성, Codex 리뷰, throwaway negative control |
| 임의 sleep 기반 E2E는 flaky하다 | 중간 | DOM 상태/event/network 조건 대기, 실패 seed 기록 |

GitHub 공식 흐름인 `configure-pages → base 정규화 → Vite build → upload-pages-artifact → deploy-pages`와 Vite의 Pages base 지침을 릴리스 계약에 포함했다.

### 2.4 멀티 AI 운영·릴리스

| 피드백 | 위험 | 반영한 개선 |
|---|---|---|
| 세 AI가 동시에 자유롭게 코딩하면 계약 충돌이 난다 | 높음 | 계약 선행 동결, 파일 소유권, 작업별 branch/worktree, DAG 순서 |
| 채팅은 재시작·컨텍스트 소실에 취약하다 | 높음 | GitHub Issue/PR을 실시간 원본, 기본 브랜치 문서를 지속 원본으로 사용 |
| 단일 상태 파일을 모두 고치면 merge conflict가 난다 | 중간 | `STATUS.md`는 Codex integrator만 수정하고 다른 AI는 Issue/handoff로 보고 |
| 작성자가 자기 코드와 테스트를 최종 승인하면 오류 상관관계가 높다 | 높음 | Claude → Codex → Antigravity → Claude 교차 리뷰 순환 |
| 최고 모델을 모든 일에 쓰면 비용만 늘고 검토 독립성이 줄어든다 | 중간 | 위험 등급 라우팅과 두 번 실패 후 1단계 상승 규칙 |
| Sol/Terra/Luna/Fable 별칭의 강점을 추정할 수 없다 | 높음 | 고정 fixture·hidden oracle·독립 채점자가 있을 때만 선택적 SG-000을 실행 |
| “완료했다”는 말만으로 상태가 넘어갈 수 있다 | 높음 | branch/head SHA, AC 증거, 명령/exit code가 없는 완료는 무효 |
| 제품 의미 충돌을 AI끼리 타협할 수 있다 | 높음 | `decision-needed`와 사람 승인 gate |

세 플랫폼의 역할은 균등 분량보다 오류 상관관계를 낮추는 방향으로 정했다. Claude는 제품/UI, Codex는 코어/통합, Antigravity는 독립 QA를 주로 맡는다.

## 3. 전문가 의견이 갈린 부분과 최종 판단

### 3.1 Phaser 4.2.1 대 Phaser 3.90

아키텍처 관점은 신규 프로젝트이므로 2026-07-09 공개된 최신 안정판 4.2.1을 정확히 고정하자는 의견이었다. 안정성 관점은 4.x가 2026년 4월 시작된 새 메이저이고, Phaser 3.90은 예제·API·Canvas 대체 경로가 축적되어 있다는 점을 들었다.

최종 판단은 **4.2.1 조건부 우선 + 90분 spike + Phaser 귀책일 때만 3.90.0 재검증**이다.

- Scene, Graphics, Input, Scale, resize/blur, TypeScript, Vite production build, Pages base를 실제로 확인한다.
- 공식 4.x API만으로 Chromium/WebKit smoke까지 통과하면 4.2.1을 동결한다.
- 지원 환경에서 Phaser 4에 귀속되는 타입/API/렌더 문제가 남으면 기능 코드가 쌓이기 전에 3.90.0을 clean 구성해 동일 매트릭스를 검증한다.
- 네트워크·Pages 권한·CI WebGL 같은 환경 문제는 `INCONCLUSIVE/BLOCKED`이며 후퇴 사유가 아니다.
- 4.2.1 또는 3.90.0 중 하나가 통과해야만 선택 버전을 `accepted`로 기록한다.
- MVP 중간에 두 버전을 혼합하거나 재검토하지 않는다.

이 결정은 “최신이므로 채택” 또는 “익숙하므로 구버전 유지”라는 추측 대신 작은 실증 비용으로 불확실성을 제거한다.

### 3.2 이동 속도

아키텍처 초안은 기본 140ms, 최저 70ms를 제안했고 UX 검토는 기본 160→90ms와 느림 220→130ms를 제안했다. 최종 계획은 접근성과 모바일 오입력을 우선해 UX 수치를 채택했다. 플레이테스트로 숫자는 바꿀 수 있지만 두 모드와 가속 공식은 고정한다.

### 3.3 상태 공유 파일

한 전문가는 AI별 status 파일을 권장했고, 다른 전문가는 작업 패킷과 중앙 index의 단일 작성자를 권장했다. 최종 구조는 다음과 같다.

- 실시간 진행: 기본은 GitHub Issue/PR이라 동시 편집 충돌이 없다. 사용할 수 없으면 상호 배타적인 offline task/handoff 원본을 쓴다.
- 병합된 요약: integrator 한 명만 `STATUS.md`를 갱신한다.
- 작업별 상세: PR handoff에 남겨 코드와 함께 이력화한다.
- GitHub 접근이 없을 때만 AI별 메시지를 integrator가 중앙 상태에 반영한다.

이 구조는 상태 파일을 여러 개 읽어야 하는 부담과 단일 파일 동시 수정 충돌을 함께 피한다.

### 3.4 AI 역할 배분

초기에는 Antigravity가 UI 구현과 QA를 함께 할 수 있었으나, 독립성 검토 뒤 다음으로 조정했다.

- Claude: 제품 명세와 DOM UI 작성, Codex 코어 검토
- Codex: 게임 코어와 Phaser/CI 구현, Antigravity 테스트 검토
- Antigravity: 제품 코드와 분리된 테스트/브라우저 QA, Claude UI와 Codex 통합 검토

이로써 주요 산출물이 작성자와 다른 플랫폼에서 최소 한 번 검토된다.

## 4. 초기안 대비 개선된 계획

| 초기 수준 | 개선 후 |
|---|---|
| “Snake를 구현한다” | 게임/생명주기/UI/배포 AC 20여 개로 관찰 가능하게 정의 |
| “Phaser 사용” | 버전 spike, 순수 domain, 단일 Scene, fixed step, no physics |
| “모바일 지원” | 320px, HTML D-pad, safe area, scoped touch action, 실기기 matrix |
| “접근성 고려” | 키보드 전체 흐름, focus, live region, 명암, reduced motion, 범위 한계 |
| “테스트 작성” | AC trace, deterministic seed, 위험 분기, prod E2E, negative control |
| “GitHub Pages 배포” | Wave 1 비공개 artifact 수직 슬라이스, H3a 수동 공개, 최소 권한 workflow, 실제 URL smoke |
| “AI가 상태 공유” | Issue/PR live truth, repo durable truth, handoff SHA, 단일 integrator |
| “적합 모델 사용” | task별 모델/설정, blind calibration, 증거 기반 에스컬레이션 |
| “전문가 검토” | 아키텍처·UX·QA/DevOps·멀티 AI 네 관점과 반영 추적 |

## 5. 문서 완성 후 2차 감사에서 추가 반영한 사항

초안 작성 뒤 세 관점이 실제 문서 전체를 다시 읽고 기능 착수 blocker/high를 재검토했다. 발견 사항을 문구 수정이 아니라 계약과 DAG에 반영했다.

| 2차 발견 | 최종 보강 |
|---|---|
| READY에서 같은 방향을 무시하면 오른쪽 시작이 불가능 | READY의 Right만 시작으로 특별 허용, Up/Down 회전 시작, Left/Enter/Space 무시 |
| pause 상태별 command·queue 처리 불명확 | phase×command 표, 모든 pause의 queue/accumulator clear, 일반 resize와 orientation 분리 |
| focus·scroll·pointer/click 중복 기준 없음 | 상태별 focus target, board key만 preventDefault, HTML button click 1회=command 1회 |
| 충돌 위치를 snapshot으로 전달할 수 없음 | `gameEnded { reason, headCell, attemptedCell }` event 계약 추가 |
| 가속 step에서 새 tickMs를 차감할 위험 | step 전 `stepDuration` 캡처, 새 속도는 다음 step부터 적용 |
| live region·대비·Canvas 설명·safe area가 AC 밖 | AC-U06~U09와 자동/수동 trace 추가 |
| Phaser 실패와 CI/권한 실패가 섞여 무조건 fallback 가능 | `INCONCLUSIVE/BLOCKED` 판정, Phaser 귀책일 때만 정확한 3.90.0 동일 matrix 검증 |
| H0가 시작/종료 gate를 동시에 의미 | H0a 검증 실행 승인과 H0b D-001~D-006·계약 승인으로 분리 |
| Wave 1 실제 배포가 H3 공개 승인과 충돌 | SG-009는 비공개 artifact, H3a 뒤 수동 deploy, H3b에서 결과 수락 |
| 선택 모델 benchmark 입력과 oracle이 없음 | SG-000을 비차단 P2로 낮추고 고정 fixture·hidden test·독립 채점 조건 명시 |
| DAG와 리뷰 순환 일부 불일치 | SG-010→011, SG-017→018, quality workflow 조기화, reviewer≠implementer 규칙, 최종 SG-028 Claude PASS 추가 |
| GitHub 미사용 fallback에 Issue 필수 규칙이 남음 | offline versioned task YAML과 handoff Markdown을 Issue/PR의 상호 배타적 대체 원본으로 정의 |
| H3a 승인 뒤 `main`이 움직이면 미검토 SHA를 배포 가능 | 필수 40자리 `release_sha` checkout·HEAD 대조와 공개 `release.json` SHA 검증 추가 |

## 6. 아직 사람에게 남은 판단

H0a에서 1~4와 Wave 0 실행을 승인하고, H0b에서 실제 SG-001~004 결과와 D-001~D-006을 승인한다.

1. 느림/기본 두 난이도를 MVP에 포함할지
2. Phaser 4.2.1 조건부 스파이크와 Phaser 귀책일 때의 3.90.0 재검증 방식에 동의하는지
3. GitHub Pages Settings와 branch/environment protection을 설정할 권한이 있는지
4. 5명 플레이테스트가 어려울 경우 소유자+2명 이상으로 축소할지

시각 테마의 세부 색·폰트는 H1에서 320px 모바일 화면과 함께 승인한다. 외부 이미지와 원격 폰트는 쓰지 않으므로 이 결정이 아키텍처나 배포를 막지는 않는다.

## 7. 최종 전문가 판정

현재 계획은 **Wave 0 실행 가능, 기능 구현은 H0b 조건부** 수준이다. 사람이 H0a에서 SG-001~004 실행을 승인하고, 그 결과와 D-001~D-006을 H0b에서 승인하기 전에는 Wave 1 기능 구현을 시작하지 않는 것이 핵심이다.

공식 근거는 [Phaser 릴리스 아카이브](https://phaser.io/download/archive), [Vite Pages 배포](https://vite.dev/guide/static-deploy.html), [GitHub Pages custom workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [Node 릴리스 현황](https://nodejs.org/en/about/previous-releases)을 기준으로 했다.
