# 프로젝트 상태

- 마지막 동기화: 2026-07-19T09:14:46Z
- 단계: Wave 0 완료 / H0b 승인 완료 / Wave 1 기반 구축·Wave 2 도메인 코어 진행 중
- 목표 릴리스: MVP 1.0
- 예상 공개 URL: `https://dragoncowkarma.github.io/snake-game/`
- 조정 책임자: Codex
- 현재 활성 작업: 없음
- 현재 검증 대기: SG-013(축소 범위) 지정 비-Claude 리뷰(Antigravity) 또는 사람 검증
- 현재 결정 필요: 없음 — SG-013 packet 작성 전 필요했던 SG-006 범위 정합화는 사람 직접 승인으로 해소했다(§SG-013 기록, `docs/TASKS.md` SG-013 행).
- 다음 작업 후보: SG-009, SG-011, SG-012. 각각 최신 `main` 기준의 versioned GitHub Issue 또는 승인된 offline packet과 claim이 필요하다.

## H0b 종료 기록

2026-07-17T17:18:21Z(2026-07-18 Asia/Seoul) 현재 사람의 `Wave 0 종료` 지시는 SG-001~SG-004 증거, SG-003 공용 계약 revision 2, SG-004 QA 계획 revision 2, D-001~D-006을 승인하는 H0b 판정이다. D-001~D-006은 모두 `accepted`이며 Phaser 기준 버전은 4.2.1로 동결됐다. 이 승인은 Wave 1 선행 gate만 열며 SG-005 자동 착수, 원격 push, GitHub Pages 공개 배포를 승인하지 않는다.

- SG-000: 고정 calibration packet, hidden oracle, 독립 채점자가 없어 계획대로 미실행 `verified`로 닫았다. 잠정 모델 라우팅 기준선은 유지한다.
- SG-001: `agent/claude/SG-001-spec-review`의 명세 변경 SHA `a516758f5517847ae6915b504cadfc501d090fc4`가 `main`에 fast-forward 병합돼 있다. 사전 offline packet, claim, 지정 Antigravity 리뷰 증거는 존재하지 않고 실제 실행 플랫폼/모델도 저장소에서 확정할 수 없다. 현재 사람은 H0b 종료 지시로 산출물과 이 공개된 거버넌스 예외를 Wave 0 범위에서 수락했으며, 사후 기록은 `docs/coordination/tasks/SG-001.yaml`과 `docs/coordination/handoffs/SG-001.md`에 둔다.
- SG-002: 구현 증거 SHA `6c2f8c59164380a47804f1771497fe1c58e99a2d`가 strict TypeScript, production build, Chromium/WebKit production-preview 매트릭스에서 `PASS_4_2_1`을 반환했다. Claude와 Antigravity 독립 리뷰 뒤 `fd81ba9943e8b5786a0910e7172fb57c477c0d5e`로 병합됐다. 현재 사람은 H0b에서 공개된 실행 모델 편차를 수락하고 packet을 `merged`로 정합화했다.
- SG-003: revision 2 계약 SHA `b4c5130bc0a0980d95ff575ff12efd154bf001ab`가 `c41bb45c81aa5f39ee9465b0db5ea08dcd99ea18`로 병합됐고 독립 리뷰와 scoped 검증을 통과했다. H0b에서 공용 구현 계약으로 승인됐다.
- SG-004: frozen QA content SHA `81e6f68e49fd93a6e9f8ca8f43a5ab9fc57a4b52`가 사람의 완료 승인 뒤 `13fd82307941160750f8c25045cf81f8c00c2885`로 병합됐다. 28개 AC trace row와 28개 권위 AC가 정확히 일치하며 누락·중복은 0개다.
- SG-005: scaffold implementation SHA `7435242d997e226951f8cc2828bb649e64ed3b9f`와 revision 2 review remediation은 typecheck, lint, 8/8 unit, root 및 `/snake-game/` Chromium production smoke, clean `npm ci`, `verify`를 통과했다. 사람 제공 독립 재검증이 승인했으며 completion merge `673319e71bea4dba17a09124aeae5c1dab91378a`를 거쳐 local `main`에 통합됐다. 원격 push·공개 배포는 수행하지 않았다.
- SG-006: accessible DOM shell implementation SHA `e146c47`과 verification record `56521b760b5aebac0d850a0b32922fc0d71b5c8b`는 지정 Antigravity 리뷰와 Codex 통합 재검증(format, lint, typecheck, 29/29 unit, build, Chromium E2E 1/1)을 통과했다. local integration merge `42d91eeb4221b38ea2c49c06320da57a838cb060`으로 `main`에 통합됐고 원격 push·공개 배포는 수행하지 않았다. SG-013의 focus/aria-live/Command-routing 일부를 사람 승인으로 선행 구현했으므로 SG-013 packet 작성 전 작업 경계를 정합화해야 한다.
- SG-007: deterministic domain foundation implementation SHA `1d8d936b0316fe15f3785e73ba605f049cca3660`은 승인된 타입/정책, 단일 설정, injected RNG, menu/ready reset, row-major free-cell 선택을 구현했다. 독립 APPROVE 리뷰가 397개 index 전수 property 검증과 계약 대조를 통과시켰고, Codex 통합 재검증(Node 24 format, lint, typecheck, 40/40 unit, build, Chromium E2E 1/1) 뒤 local merge `a66716c4e7f12f45dba4cb5ed4b836d4cf783af5`로 `main`에 통합됐다. 원격 push·배포는 수행하지 않았다. 당시 남긴 `food-spawner.ts` invariant와 enqueue/step 후속은 SG-010이 완료했으며, UI/통합 packet은 `src/ui/contracts.ts` mirror를 실제 domain import로 교체해야 한다.
- SG-008: fixture/evidence foundation implementation SHA `c857f2bc08bf84ab4e12e7222664e46cb8686d4f`는 24개 fixture, EV-FAIL-01 schema, Mulberry32 seeded RNG, scripted RNG, E2E listener helper를 추가했다. Codex 리뷰에서 이전 EPERM artifact path, FX_PLAY_R 상태, stale SHA metadata, Playwright outputDir 재현 절차 문제가 모두 해소됐음을 확인했다. SG-008 구현 head는 57/57 unit tests와 필수 검증을 통과했고, 최신 `main`(SG-007 포함) 위 local integration merge `522fcb7ebb3460b5dce858cc23bae825866e9681`도 format, lint, typecheck, 68/68 unit, build, 25 schema generation, Chromium E2E 1/1, diff check를 통과했다. 원격 push·공개 배포는 수행하지 않았다.
- SG-010: deterministic simulation implementation SHA `03f99aa0d7e9d8864fcba513608292f262f3c7e8`은 READY Right 예외와 2칸 queue, 마지막 예약 방향 검증, 한 tick 1~10 순서, 비성장 tail 예외, 충돌 event, 성장·점수·속도, free-cell 음식과 만석 승리를 순수 TypeScript로 구현했다. 사람을 거쳐 전달된 지정 Claude Opus 4.8 독립 리뷰는 계약 대조와 greedy 60판/1,780 food 및 random 300판 probe에서 정확성 결함 0건으로 APPROVE했다. SG-008 포함 최신 local `main` 위 integration merge `d114bf81a706c5c7af932144d22cdaa2436bf24f`는 Node 24 format, lint, typecheck, 97/97 unit, build, Chromium E2E 1/1, domain import/scope/diff 검사를 통과했다. 제출 100틱 replay가 성장 후 RNG를 실행하지 않는 비차단 보강점은 SG-011에 이관하며 원격 push·배포는 수행하지 않았다.
- SG-013: 사람이 세션 내 직접 채팅 지시로 "축소 범위 직접 승인"을 선택해 packet화 전 정합화를 해소했다. SG-006이 이미 사람 승인으로 DOM shell/focus 전이/aria-live/Command 라우팅(TASKS.md 원안의 SG-013 몫)을 선구현했으므로, 이번 SG-013은 (1) `src/ui/contracts.ts`의 수동 유지 타입 미러를 삭제하지 않고 실제 `src/domain/**`(SG-007/SG-010, merged) type-only re-export로 교체해 정의 드리프트를 제거하고, (2) hand-authored fixture 대신 실제 `reset`/`enqueueDirection`/`step` 산출물로 focus-전이·aria-live 종단 증거를 보강하는 것으로 범위를 확정했다. `src/ui/contracts.ts`는 `tests/fixtures.ts`, `tests/fixtures.test.ts`, `tests/helpers/ev-fail-01.ts`(Antigravity 소유, 이번 packet 허용 경로 밖)가 그 경로로 import하므로 삭제하지 않고 re-export shim으로 유지했다. base_sha `cf811f293918a4b7eed38b5cb44c3673950959cb` 위 구현은 format/lint/typecheck/101 unit(신규 4)/build/Chromium E2E 1/1을 통과했고, 실제 개발 서버에서 real-domain-driven browser 재현(§handoff)으로 SG-006 handoff가 남긴 "실제 게임플레이 종단 증거" 공백을 닫았다. 상세는 `docs/coordination/tasks/SG-013.yaml`과 `docs/coordination/handoffs/SG-013.md`. 지정 비-Claude 리뷰(Antigravity) 또는 사람 검증 전이므로 아직 `merged`가 아니다.
- SG-004-DN01: `resolved`. 음식 비중첩과 성장 조건 때문에 유효한 성장-동일-tail 상태는 도달 불가능하다. 계약은 유지하며 AC-G06은 비성장 tail 진입 실행 검증과 도달 불가능성 증명을 결합하고 invalid fixture를 만들지 않는다. 일반 비-tail 자기 충돌은 AC-G07에서 별도로 검증한다.
- Frozen QA 이력: `docs/coordination/QA_PLAN.md`의 H0b·DN01 대기 및 D-001/D-002 `proposed` 문장은 frozen SG-004 제출 당시 상태다. QA 본문 SHA를 보존하며 현재 판정은 `DECISIONS.md`의 H0b accepted 기록과 이 상태표가 우선한다.

2026-07-17T17:44:05Z 확인에서 fetch 후 로컬 `main`, `origin/main`, 원격 `main`은 `983cb1387d31c7113e8e7f63f8f49e4b555b6e3f`로 일치했고 공개 GitHub API의 열린 Issue와 PR은 각각 0건이었다. 따라서 현재 작업은 기존 GitHub 원본과 중복되지 않는 offline coordination 기록을 사용한다.

### 종료 검증

| 검증 / 환경 | 결과 | 실제 증거 |
|---|---|---|
| H0b 문서 exact validator / Ruby UTF-8 | PASS | D-001~D-006 accepted 6/6, SG-001~004 packet `merged`, DN01 resolved, YAML 4/4 parse |
| DEVELOPMENT_PLAN ↔ QA trace | PASS | 권위 AC 28개와 trace row 28개 정확히 일치, 누락·중복 0 |
| frozen QA content | PASS | SHA-256 `ce9c8cc68fde88633ec4417de9228221cb9d300c85e43b479e40888d1a75b9f8`, 본문 변경 0 |
| Wave 0 증거 ancestry | PASS | SG-001~004의 기록된 구현·병합 SHA가 모두 `main` 조상 |
| SG-004 역사적 completion 검증 | PASS | clean `983cb1387d31c7113e8e7f63f8f49e4b555b6e3f` 기준 packet 명령 15/15 exit 0 |
| Phaser 4.2.1 spike typecheck/build | PASS | Node 24 bundled runtime에서 exit 0; build의 기존 500 kB chunk 경고만 존재 |
| Phaser production-preview E2E | PASS | sandbox 첫 시도는 localhost bind `EPERM`; 허용된 재실행에서 Chromium/WebKit `2 passed (22.3s)` |
| `git diff --check` | PASS | closeout 문서 diff whitespace 오류 0 |

Wave 0 closeout의 루트 명령 부재는 SG-005가 해소했다. 현재 local `main`에는 Node 24/npm 기반 scaffold와 `format:check`, `lint`, `typecheck`, `test`, `build`, `test:e2e`, `verify`가 있다.

## 다음 관문

SG-005~SG-008과 SG-010은 merged다. SG-009, SG-011, SG-012는 새 packet에 최신 base SHA와 허용/금지 경로, 수용 기준, 실제 검증 명령을 담고 claim한 뒤에만 `ready`가 된다. SG-011은 SG-010 독립 리뷰가 남긴 음식 섭취 포함 replay(`foodEaten >= 1`, RNG upper-bound calls `> 1`) 보강을 포함한다. SG-013은 SG-006과의 범위 정합화를 사람 직접 승인(축소 범위)으로 마치고 구현·자동 검증까지 완료했으며 지정 리뷰 대기 중이다(review). 공개 배포 권한은 H3a까지 닫혀 있다.

## 작업 스냅샷

| Wave | 상태 | 비고 |
|---|---|---|
| 0. 계약·캘리브레이션 | complete | H0b 승인; D-001~D-006·공용 계약 accepted; AC 누락 0 |
| 1. 기반 구축 | in_progress | SG-005·SG-006·SG-007·SG-008 merged; SG-009 packet 준비 대기 |
| 2. 수직 슬라이스 | in_progress | SG-010 순수 simulation merged; SG-013(축소 범위) review 대기; SG-011/012 packet 준비 대기 |
| 3. 통합·기능 완성 | pending | H1/H2 사람 검토 포함 |
| 4. 품질 강화 | pending | 교차 브라우저·접근성 |
| 5. 배포·릴리스 | pending | H3a 공개 배포 승인, H3b 결과 수락 |

## 승인된 기준선

- Phaser 4.2.1, framework 없는 TypeScript + Vite 8.1.x, Node.js 24.x LTS, npm lockfile.
- 게임 코어는 Phaser/DOM과 독립된 순수 TypeScript 결정론적 상태 전이다.
- 게임 보드는 Phaser, 메뉴·HUD·상태·모바일 버튼은 DOM이다.
- 외부 런타임 이미지·폰트·분석·서버 API를 MVP에 추가하지 않는다.
- 실시간 협업 상태는 GitHub Issue/PR, 장기 기록은 저장소 문서에 둔다.

상세 근거는 `docs/coordination/DECISIONS.md`와 `docs/coordination/CONTRACTS.md`를 참조한다.
