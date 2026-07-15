# 세부 작업 및 AI 모델 배정

이 문서는 구현 순서, 파일 소유권, 모델 설정, 검토 관계를 정의한다. 현재 모든 작업은 H0a 승인 전이므로 `backlog`다. H0a는 Wave 0 검증만 열고, H0b가 D-001~D-006과 공용 계약을 승인한 뒤에만 기능 작업을 `ready`로 바꾼다. 구현 시작 시 조정 책임자가 각 행을 versioned GitHub Issue로 옮기며, GitHub를 못 쓰면 `docs/coordination/tasks/<task-id>.yaml` offline packet을 대신 만든다. 두 방식 모두 base SHA와 정확한 허용 경로가 필요하다.

## 1. 상태와 우선순위

상태는 다음 값만 사용한다.

```text
backlog → ready → in_progress → review → verified → merged
                         └──────→ blocked
```

- `P0`: 없으면 다음 Wave 또는 출시가 불가능
- `P1`: MVP 출시 필수
- `P2`: 품질 향상이며 H0b 또는 H3b에서 사유를 남기고 제외 가능

작업은 퍼센트가 아니라 수용 기준 증거와 필수 명령의 실제 exit code로 완료한다.

## 2. 모델 라우팅 기준선

아래 배정은 전문가 판단에 따른 잠정 기준선이다. SG-000 캘리브레이션은 참고 평가이며 기능 gate가 아니다. 모델 별칭의 능력을 이름만으로 추정하지 않고, 재현 가능한 평가가 더 나은 모델을 보여줄 때만 같은 위험 등급 안에서 교체한다.

### Claude

| 용도 | 모델 / 작업량 | 사용 규칙 |
|---|---|---|
| 제품 명세·DOM UI·접근성 | Sonnet 5 / 중간~높음 | 기본 작성 모델 |
| 사용자 문서·명확한 단일 변경 | Sonnet 4.6 / 중간 | 계약이 이미 고정된 경우 |
| 형식·상태 요약 | Haiku 4.5 / 낮음 | 의미 변경 금지 |
| 아키텍처·릴리스 적대 검토 | Opus 4.8 / 높음~최대 | 구현보다 리뷰에 우선 사용 |
| 어려운 회귀/명세 충돌 | Opus 4.8 / 엑스트라~ultracode | 두 번 실패한 증거 패킷이 있을 때만 |
| Fable 5 | 선택적 SG-000에서 평가 | 강점을 가정하지 않고 기준선보다 나을 때만 배정 |

Opus 4.7/4.6은 4.8의 가용성·비용 문제가 있을 때 같은 프롬프트로 대체 평가한다.

### Codex

| 용도 | 모델 / 추론강도 | 사용 규칙 |
|---|---|---|
| 상태 머신·공개 계약·최종 통합 | 5.6 Sol / 매우 높음 | 파급 범위가 큰 코드 |
| Phaser/Vite/CI·다중 모듈 구현 | 5.6 Terra / 높음~매우 높음 | 기본 구현 모델 |
| 제한된 모듈·회귀 수정 | 5.5 / 중간~높음 | 계약 변경 없음 |
| 기계적 scaffold·설정 보조 | 5.4 mini / light | 생성 후 상위 모델 검토 |
| Luna·5.4 | 선택적 SG-000에서 평가 | 낮은 위험 반복 작업 후보 |
| 울트라 | 5.6 Sol / 울트라 | 두 번 재현된 출시 차단 통합에만 |

### Antigravity

| 용도 | 모델 / 설정 | 사용 규칙 |
|---|---|---|
| 빠른 브라우저 반복·E2E 구현 | Gemini 3.5 Flash high | 기본 실행 모델 |
| 단순 재검증·증거 정리 | Gemini 3.5 Flash medium | 계약 변경 금지 |
| 테스트 전략·적대적 릴리스 감사 | Gemini 3.1 Pro high | 작성자의 설명보다 명세/diff 우선 |
| 빠른 분류 | Gemini 3.5 Flash low | 결함 수정 권한 없음 |
| 독립 경계 사례 발굴 | GPT-OSS 120B medium | Gemini 결과와 상관관계 낮추는 2차 검토 |
| 난해한 UI/브라우저 분석 | Claude Sonnet 4.6 thinking | Gemini가 두 번 같은 원인으로 실패할 때 |
| 출시 차단 교차 영역 | Claude Opus 4.6 thinking | 증거 패킷과 사람 승인 후만 |

Claude가 만든 명세를 Antigravity에서 검토할 때는 가능한 한 Gemini 계열을 사용해 같은 모델 계열의 오류 상관관계를 줄인다.

## 3. SG-000 모델 캘리브레이션(선택·비차단)

총 30~45분으로 제한하고 제품 코드는 병합하지 않는다. 실행하려면 조정 책임자가 먼저 다음 고정 calibration packet을 준비해야 한다.

1. 같은 기준 SHA의 작은 TypeScript fixture: 결함 있는 방향 큐, 공개 테스트, `npm test` 명령
2. 잘못된 Vite Pages base 설정과 재현 가능한 `npm run build`/preview 명령
3. 후보에게 보이지 않는 추가 테스트와 정답 rubric: 사람이 결과 제출 뒤에만 실행
4. 후보별 별도 clean copy와 동일 시간/토큰 제한
5. 자동 결과 외 항목을 채점할 사람 또는 후보가 아닌 플랫폼의 리뷰어

후보는 Claude Sonnet 5 중간/Fable 5 중간, Codex 5.6 Sol·Terra·Luna 중간, Antigravity Gemini 3.5 Flash high/Gemini 3.1 Pro high로 제한한다. Opus·울트라 계층은 calibration 대상이 아니라 실패 증거가 있는 에스컬레이션용이다.

| 평가 항목 | 비중 |
|---|---:|
| 자동 테스트 통과와 결함 정확성 | 50% |
| 허용 범위·지시 준수 | 20% |
| 근거 없는 가정/환각 없음 | 15% |
| diff 단순성·유지보수성 | 10% |
| 시간·비용 | 5% |

80점 이상이고 잠정 기준선보다 높은 모델만 라우팅 변경 후보가 된다. packet이나 독립 채점자가 준비되지 않으면 SG-000을 실행 생략 사유와 함께 `verified`로 닫고 잠정 배정을 유지한다. 점수가 비슷하면 더 작은 모델을 기본값으로 선택한다.

## 4. 작업 분해

### Wave 0 — 계약, 캘리브레이션, 기술 위험 제거

| ID | 우선 | 작업과 산출물 | 담당 모델·설정 | 선행 | 허용 영역 | 완료 증거 | 독립 리뷰 | 프롬프트 |
|---|---|---|---|---|---|---|---|---|
| SG-000 | P2 | 고정 packet이 준비된 경우 모델 미니 벤치와 참고 점수표 | 각 플랫폼 지정 후보; 집계 Codex 5.4 mini light | H0a, calibration packet | 임시 clean copy, 결과 문서만 | hidden test·rubric·점수·실패 유형·선정 근거, 제품 diff 0 | 사람 또는 비후보 플랫폼 | P-CAL |
| SG-001 | P0 | MVP·비목표·상태×command·focus·난이도·AC 문구 동결 | Claude Sonnet 5 / 중간 | H0a | `docs/DEVELOPMENT_PLAN.md`, 결정 제안 | 모순 목록 0, 모든 규칙에 AC 연결 | Antigravity Gemini 3.1 Pro high | P-CLAUDE-SPEC |
| SG-002 | P0 | Phaser 4.2.1 90분 스파이크와 D-001 판정. Phaser 귀책 실패일 때만 3.90.0 clean 재검증 | Codex 5.6 Terra / 높음 | H0a | 별도 spike 소스, 설정, D-001 제안 | `PASS_4_2_1/PASS_3_90_0/INCONCLUSIVE/BLOCKED`, 선택 버전 동일 matrix 통과 | Claude Opus 4.8 / 높음 + Antigravity Flash high | P-CODEX-SPIKE |
| SG-003 | P0 | `GameState`, phase×command, collision event, RNG, scheduler `stepDuration`, import 경계 계약 확정 | Codex 5.6 Sol / 매우 높음 | SG-001, SG-002 | `docs/coordination/CONTRACTS.md`, 결정 제안만 | 타입 모양과 예제, pause/충돌/가속 불변 조건, v3/v4 혼용 0 | Claude Opus 4.8 / 높음 | P-CODEX-CONTRACT |
| SG-004 | P0 | AC별 테스트 맵, 경계값, viewport/browser/접근성 QA 계획 | Antigravity Gemini 3.1 Pro high | SG-001 | `docs` QA 산출물 | 모든 AC에 자동/수동 검증과 책임자 연결 | Codex 5.5 / 높음 | P-AG-QA-PLAN |

Wave 0 종료 조건: SG-001~004 증거를 사람이 검토하고 H0b에서 D-001~D-006을 모두 `accepted`로 바꾸며, 공용 계약 리뷰 승인과 테스트 누락 AC 0을 확인한다. SG-000은 비차단이다.

### Wave 1 — 재현 가능한 기반과 첫 배포 경로

| ID | 우선 | 작업과 산출물 | 담당 모델·설정 | 선행 | 허용 영역 | 완료 증거 | 독립 리뷰 | 프롬프트 |
|---|---|---|---|---|---|---|---|---|
| SG-005 | P0 | Node 24, npm, TS strict, Vite 8.1, ESLint, Prettier, Vitest, Playwright scaffold와 최소 PR `quality.yml` | Codex 5.6 Terra / 높음 | H0b, SG-003, SG-004 | 루트 설정, `package*`, 최소 `src/main.ts`, `.github/workflows/quality.yml` | clean `npm ci`, format/lint/typecheck/test/build, PR base build | Claude Sonnet 5 / 중간 | P-CODEX-SCAFFOLD |
| SG-006 | P1 | 접근 가능한 DOM shell: menu/HUD/status/buttons, 320px layout, design tokens | Claude Sonnet 5 / 높음 | SG-003, SG-005 | `index.html`, `src/ui/**`, `src/styles.css` | 키보드 tab order, 44px 버튼, 320×568 screenshot | Antigravity Gemini 3.1 Pro high | P-CLAUDE-UI |
| SG-007 | P0 | 도메인 skeleton, 설정, injected RNG, reset 가능한 초기 상태 | Codex 5.6 Sol / 매우 높음 | SG-003, SG-005 | `src/domain/**`, `src/config/**` | Phaser/DOM import 0, 동일 seed 초기 상태 일치 | Claude Opus 4.8 / 높음 | P-CODEX-DOMAIN |
| SG-008 | P0 | AC 기반 test fixture, deterministic seed helper, Playwright production server 구성 | Antigravity Gemini 3.5 Flash high | SG-004, SG-005 | `tests/**`, Playwright 설정 | 빈 smoke와 fixture가 CI형 명령에서 재현 | Codex 5.5 / 높음 | P-AG-TESTS |
| SG-009 | P0 | 정적 한 화면을 Pages base로 build하고 업로드 가능한 artifact를 만드는 비공개 수직 슬라이스 | Codex 5.6 Terra / 높음 | SG-005 | Vite/Actions 설정 | `/snake-game/` production preview, artifact 내용, asset 404 0; 별도 사람 승인 없이는 deploy 0회 | Antigravity Flash high | P-CODEX-PAGES |

Wave 1 종료 조건: clean checkout의 모든 기본 명령이 통과하고 Pages 하위 경로 production preview와 artifact에서 한 화면이 열린다. 실제 공개 URL은 요구하지 않는다.

### Wave 2 — 플레이 가능한 수직 슬라이스

| ID | 우선 | 작업과 산출물 | 담당 모델·설정 | 선행 | 허용 영역 | 완료 증거 | 독립 리뷰 | 프롬프트 |
|---|---|---|---|---|---|---|---|---|
| SG-010 | P0 | 이동, 2칸 입력 큐, 성장, 벽/몸 충돌, 꼬리 예외, 음식, 점수, 속도, 승리의 순수 상태 전이 | Codex 5.6 Sol / 매우 높음 | SG-007 | `src/domain/**` | AC-G01~G10 단위 증거, 결정론 100틱 | Claude Opus 4.8 / 높음 | P-CODEX-DOMAIN |
| SG-011 | P0 | 명세에서 독립 도출한 도메인 단위/계약 테스트와 위험 분기 coverage | Antigravity Gemini 3.1 Pro high | SG-004, SG-010 | `tests/unit/**` | domain 90%+, 위험 분기 100%, 구현 복제형 assertion 없음 | Codex 5.5 / 높음 | P-AG-TESTS |
| SG-012 | P0 | 단일 GameScene, fixed-step scheduler, BoardRenderer, keyboard/DOM input adapter | Codex 5.6 Terra / 높음 | SG-005, SG-010 | `src/game/**`, `src/main.ts` | FPS 독립 이동, delta clamp, frame step cap, listener cleanup | Claude Sonnet 5 / 높음 | P-CODEX-PHASER |
| SG-013 | P1 | menu/ready/playing/gameOver/won DOM UI, focus 전이, 난이도/점수/재시작, `aria-live` 연결 | Claude Sonnet 5 / 높음 | SG-006, SG-010 | `src/ui/**`, `src/styles.css` | AC-U01~U09 수동/자동 증거 | Antigravity Gemini 3.1 Pro high | P-CLAUDE-UI |
| SG-014 | P0 | 코어+Scene+UI 통합, 시작→이동→먹기→죽기→재시작 전체 흐름 | Codex 5.6 Sol / 매우 높음 | SG-010~SG-013 | 통합에 필요한 범위, 계약 변경은 별도 | vertical E2E와 전체 quality 통과 | Antigravity Flash high + Claude Sonnet 5 높음 | P-CODEX-INTEGRATE |
| SG-015 | P0 | 수직 슬라이스 독립 QA: 320px, 키보드, 다중 입력, console/network, 20회 restart | Antigravity Gemini 3.5 Flash high | SG-014 | QA 증거, 결함 Issue; 제품 수정 금지 | 재현 가능한 결함 목록과 PASS/BLOCK | Codex 5.5 / 높음 | P-AG-AUDIT |

Wave 2 종료 조건: 핵심 게임 루프가 플레이 가능하고 SG-015 blocker가 0이며 H1 모바일 시각/조작 승인을 받는다.

### Wave 3 — MVP 기능 완성

| ID | 우선 | 작업과 산출물 | 담당 모델·설정 | 선행 | 허용 영역 | 완료 증거 | 독립 리뷰 | 프롬프트 |
|---|---|---|---|---|---|---|---|---|
| SG-016 | P1 | phase별 pause/blur/visibility/orientation/resize, 난이도별 저장, Web Audio/no-op fallback | Codex 5.6 Terra / 높음 | SG-014 | domain/game/adapters/config | AC-L01~L03, R01/R02, queue/accumulator clear와 실패 주입 테스트 | Claude Sonnet 5 / 높음 | P-CODEX-FEATURES |
| SG-017 | P1 | pause/종료 원인/최고 기록/음소거 UI, focus 복원, reduced-motion, safe area, 최종 문구 | Claude Sonnet 5 / 높음 | SG-013, SG-016 | `src/ui/**`, styles, 문구 문서 | AC-U06~U09, 대비, live 알림 빈도 | Antigravity Gemini 3.1 Pro high | P-CLAUDE-UI |
| SG-018 | P0 | production dist 대상 Playwright: keyboard/focus/touch 1:1/pause/resize/storage/restart/console/404 | Antigravity Gemini 3.5 Flash high | SG-014, SG-016, SG-017 | `tests/e2e/**` | waitForTimeout 의존 없는 안정적 E2E, 3회 반복 통과 | Codex 5.6 Luna 또는 5.5 / 높음 | P-AG-TESTS |
| SG-019 | P0 | 기능 브랜치 통합, 이벤트/포커스/타이밍 경계 수정, 전체 clean verify | Codex 5.6 Sol / 매우 높음 | SG-016~SG-018 | 통합 범위 | 모든 자동 검사와 H2 플레이테스트 빌드 | Claude Opus 4.8 / 높음 | P-CODEX-INTEGRATE |

Wave 3 종료 조건: 모든 P1 기능이 동작하고 H2 플레이테스트에서 시작/사망/재시작 기준을 충족한다.

### Wave 4 — 적대적 검증과 릴리스 후보

| ID | 우선 | 작업과 산출물 | 담당 모델·설정 | 선행 | 허용 영역 | 완료 증거 | 독립 리뷰 | 프롬프트 |
|---|---|---|---|---|---|---|---|---|
| SG-020 | P0 | Chromium/Firefox/WebKit, 핵심 viewport, focus/scroll/touch 1:1, 시각 회귀, a11y, 저동작, 실패 저장소, negative control | Antigravity Gemini 3.1 Pro high; 경계 2차 검토 GPT-OSS 120B medium | SG-019 | tests/QA 증거, 결함 Issue | AC-G/L/U/R 전체 trace matrix, 제품 branch와 분리된 테스트 파괴 증거 | Codex 5.6 Terra / 높음 | P-AG-AUDIT |
| SG-021 | P0 | 10년차 아키텍처·UX 관점 최종 diff 감사, 계약 누수·과잉 범위·API 혼용 검출 | Claude Opus 4.8 / 최대 | SG-019 | review report만, 제품 수정 금지 | blocker/high와 최소 수정안, 근거 AC | Antigravity Gemini 3.1 Pro high | P-CLAUDE-REVIEW |
| SG-022 | P0/P1 | SG-020/021 결함의 최소 수정. 파일 소유권별로 별도 Issue/PR 분리; 결함 0이면 no-op 증거로 verified | 원 소유자; 기본 Claude Sonnet 5 높음 / Codex 5.6 Terra 높음; 난해 시 한 단계 상승 | SG-020, SG-021 | 결함별 최소 허용 경로 | 수정 전 실패+수정 후 성공, 범위 밖 refactor 0 | 발견자와 수정자가 다르면 발견자, 같으면 제3 플랫폼 | P-DEFECT |
| SG-023 | P0 | release candidate 전체 회귀와 PASS/BLOCK 판정 | Antigravity Gemini 3.1 Pro high | SG-022 | test/QA 증거만 | blocker/high 0, medium 목록과 수용 여부 | Codex 5.6 Sol / 높음 | P-AG-AUDIT |

Wave 4 종료 조건: blocker/high 결함 0, release candidate SHA 고정, 모든 medium을 사람이 확인한다.

### Wave 5 — 배포와 인계

| ID | 우선 | 작업과 산출물 | 담당 모델·설정 | 선행 | 허용 영역 | 완료 증거 | 독립 리뷰 | 프롬프트 |
|---|---|---|---|---|---|---|---|---|
| SG-024 | P0 | 최소 quality workflow를 보안 강화하고, 필수 `release_sha` 수동 Pages artifact 배포·SHA pin·Dependabot·concurrency 완성 | Codex 5.6 Terra / 매우 높음 | SG-009, SG-023 | `.github/**`, build 설정 | PR quality, 승인 SHA checkout 검증, configure→base→build/release.json→upload→deploy, job별 최소 권한, H3a gate | Antigravity Gemini 3.1 Pro high | P-CODEX-PAGES |
| SG-025 | P1 | 사용자 README, 로컬 실행/테스트/배포/롤백, 접근성 범위, 라이선스 | Claude Sonnet 4.6 / 중간; 형식만 Haiku 4.5 / 낮음 | SG-023, SG-024 | README/docs | 다른 AI가 문서만으로 clean 재현 | Codex 5.5 / 중간 | P-CLAUDE-DOCS |
| SG-028 | P0 | 최초 공개 전 최종 release SHA의 UX·접근성·문서·계약 재검증과 Claude PASS/BLOCK | Claude Opus 4.7 / 높음 | SG-023, SG-024, SG-025 | review report만 | 최종 SHA 기준 AC-U01~U09, 문서/production preview 일치, 독립 PASS | Antigravity Gemini 3.1 Pro high | P-CLAUDE-REVIEW |
| SG-026 | P0 | H3a 승인 SHA로 수동 배포, 실제 Pages URL/release.json bounded-retry smoke와 모바일 증거 | Antigravity Gemini 3.5 Flash medium | H3a, SG-024, SG-025, SG-028 | QA 증거/Issue 또는 offline handoff | page URL 200, 승인 SHA=release.json, asset/console error 0, 핵심 흐름 PASS | Codex 5.5 / 중간 | P-AG-DEPLOY |
| SG-027 | P0 | release SHA/태그 후보, 상태·결정·handoff 동기화, rollback rehearsal | Codex 5.6 Sol / 매우 높음 | SG-026, SG-028 | release/coordination 문서 | 승인 SHA=checkout=release.json, Codex clean PASS + Antigravity SG-026 PASS + Claude SG-028 PASS, H3b 패킷 | 사람 | P-CODEX-RELEASE |

## 5. 병렬 실행 지도

공용 계약을 먼저 병합한 뒤 다음 세 트랙을 병렬화한다.

```text
Wave 0: H0a → Claude SG-001 → AG SG-004 ─┐
             Codex  SG-002 ─────────────┼→ H0b
             SG-001 + SG-002 → SG-003 ──┘
             SG-000은 준비된 packet이 있을 때만 비차단 병렬 실행

Wave 1~2:
  Claude: SG-006 → SG-013
  Codex : SG-007 → SG-010 → SG-012 → SG-014
  AG    : SG-008; SG-010 뒤 SG-011 → SG-015

Wave 3~5:
  Claude: SG-017 → SG-021 → SG-025 → SG-028
  Codex : SG-016 → SG-019 → SG-024 → SG-027
  AG    : SG-017 뒤 SG-018 → SG-020 → SG-023 → (SG-028 PASS·H3a) → SG-026
```

같은 Wave라도 선행 ID와 공용 계약 PR이 병합되기 전에는 시작하지 않는다. 세 AI가 동일 worktree나 동일 공용 파일을 동시에 수정하지 않는다.

## 6. 에스컬레이션 규칙

1. 첫 실패: 현재 모델이 재현 절차와 한 가지 가설로 최소 수정한다.
2. 같은 원인의 두 번째 실패: 추가 수정 없이 로그, 환경, diff, 시도 결과를 incident handoff로 묶는다.
3. 한 단계 높은 모델이 incident를 독립 분석한다.
4. 세 번째에도 해결되지 않거나 제품 의미가 바뀌면 `blocked`와 `decision-needed`로 사람에게 올린다.

Claude `ultracode`, Codex `울트라`, Antigravity `Claude Opus 4.6 thinking`은 3단계에서만 사용할 수 있다. 단순 문서나 scaffold에 최고 설정을 사용하지 않는다.

## 7. 작업 패킷 필수 필드

구현 시작 시 GitHub Issue 또는 offline YAML packet 하나에 아래 항목을 채운다.

```yaml
id: SG-000
spec_version: 1.0
task_revision: 1
status: ready
approved_by: <human-or-integrator>
approved_at: <ISO-8601>
owner: codex
model: codex-5.6-terra
reasoning_or_workload: high
reviewer: antigravity
depends_on: []
base_sha: <sha>
allowed_paths: []
forbidden_paths: []
acceptance_ids: []
required_commands: []
branch: agent/codex/SG-000-slug
head_sha:
handoff:
```

조정 책임자는 H0b의 accepted 계약 안에 있는 구현 세부만 승인할 수 있다. 제품 의미, 공개 계약, 권한 확대는 사람이 새 revision을 승인해야 한다. 프롬프트에는 Issue 전문을 다시 넣지 말고 이 패킷을 읽게 하되, 권위 문서·허용 경로·수용 기준·검증 명령은 반드시 명시한다.
