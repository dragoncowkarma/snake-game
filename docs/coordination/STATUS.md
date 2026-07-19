# 프로젝트 상태

- 마지막 동기화: 2026-07-20T03:06:40Z
- 단계: Wave 0 완료 / H0b 승인 완료 / Wave 1 기반 구축 완료 / Wave 2 독립 QA 완료 (결함 발견)
- 목표 릴리스: MVP 1.0
- 예상 공개 URL: `https://dragoncowkarma.github.io/snake-game/`
- 조정 책임자: Codex
- 현재 활성 작업: 없음
- 현재 검증 대기: SG-015 독립 QA 결과 검토 및 결함 DF-SG015-01 대응 결정
- 현재 결정 필요: 없음
- 다음 작업 후보: H1 모바일 승인 대기 후 Wave 3 (SG-016) 착수

## H0b 종료 기록

2026-07-17T17:18:21Z(2026-07-18 Asia/Seoul) 현재 사람의 `Wave 0 종료` 지시는 SG-001~SG-004 증거, SG-003 공용 계약 revision 2, SG-004 QA 계획 revision 2, D-001~D-006을 승인하는 H0b 판정이다. D-001~D-006은 모두 `accepted`이며 Phaser 기준 버전은 4.2.1로 동결됐다. 이 승인은 Wave 1 선행 gate만 열며 SG-005 자동 착수, 원격 push, GitHub Pages 공개 배포를 승인하지 않는다.

- SG-000: 고정 calibration packet, hidden oracle, 독립 채점자가 없어 계획대로 미실행 `verified`로 닫았다. 잠정 모델 라우팅 기준선은 유지한다.
- SG-001: `agent/claude/SG-001-spec-review`의 명세 변경 SHA `a516758f5517847ae6915b504cadfc501d090fc4`가 `main`에 fast-forward 병합돼 있다. 사전 offline packet, claim, 지정 Antigravity 리뷰 증거는 존재하지 않고 실제 실행 플랫폼/모델도 저장소에서 확정할 수 없다. 현재 사람은 H0b 종료 지시로 산출물과 이 공개된 거버넌스 예외를 Wave 0 범위에서 수락했으며, 사후 기록은 `docs/coordination/tasks/SG-001.yaml`과 `docs/coordination/handoffs/SG-001.md`에 둔다.
- SG-002: 구현 증거 SHA `6c2f8c59164380a47804f1771497fe1c58e99a2d`가 strict TypeScript, production build, Chromium/WebKit production-preview 매트릭스에서 `PASS_4_2_1`을 반환했다. Claude와 Antigravity 독립 리뷰 뒤 `fd81ba9943e8b5786a0910e7172fb57c477c0d5e`로 병합됐다. 현재 사람은 H0b에서 공개된 실행 모델 편차를 수락하고 packet을 `merged`로 정합화했다.
- SG-003: revision 2 계약 SHA `b4c5130bc0a0980d95ff575ff12efd154bf001ab`가 `c41bb45c81aa5f39ee9465b0db5ea08dcd99ea18`로 병합됐고 독립 리뷰와 scoped 검증을 통과했다. H0b에서 공용 구현 계약으로 승인됐다.
- SG-004: frozen QA content SHA `81e6f68e49fd93a6e9f8ca8f43a5ab9fc57a4b52`가 사람의 완료 승인 뒤 `13fd82307941160750f8c25045cf81f8c00c2885`로 병합됐다. 28개 AC trace row와 28개 권위 AC가 정확히 일치하며 누락·중복은 0개다.
- SG-005: scaffold implementation SHA `7435242d997e226951f8cc2828bb649e64ed3b9f`와 revision 2 review remediation은 typecheck, lint, 8/8 unit, root 및 `/snake-game/` Chromium production smoke, clean `npm ci`, `verify`를 통과했다. 사람 제공 독립 재검증이 승인했으며 completion merge `673319e71bea4dba17a09124aeae5c1dab91378a`를 거쳐 local `main`에 통합됐다. 원격 push·공개 배포는 수행하지 않았다.
- SG-006: accessible DOM shell implementation SHA `e146c47`과 verification record `56521b760b5aebac0d850a0b32922fc0d71b5c8b`는 지정 Antigravity 리뷰와 Codex 통합 재검증(format, lint, typecheck, 29/29 unit, build, Chromium E2E 1/1)을 통과했다. local integration merge `42d91eeb4221b38ea2c49c06320da57a838cb060`으로 `main`에 통합됐고 원격 push·공개 배포는 수행하지 않았다. 당시 선행 구현한 SG-013의 focus/aria-live/Command-routing 경계는 SG-013 축소 범위 packet과 `docs/TASKS.md` 행에서 정합화를 완료했다.
- SG-007: deterministic domain foundation implementation SHA `1d8d936b0316fe15f3785e73ba605f049cca3660`은 승인된 타입/정책, 단일 설정, injected RNG, menu/ready reset, row-major free-cell 선택을 구현했다. 독립 APPROVE 리뷰가 397개 index 전수 property 검증과 계약 대조를 통과시켰고, Codex 통합 재검증(Node 24 format, lint, typecheck, 40/40 unit, build, Chromium E2E 1/1) 뒤 local merge `a66716c4e7f12f45dba4cb5ed4b836d4cf783af5`로 `main`에 통합됐다. 원격 push·배포는 수행하지 않았다. 당시 남긴 `food-spawner.ts` invariant와 enqueue/step 후속은 SG-010이 완료했으며, UI/통합 packet은 `src/ui/contracts.ts` mirror를 실제 domain import로 교체해야 한다.
- SG-008: fixture/evidence foundation implementation SHA `c857f2bc08bf84ab4e12e7222664e46cb8686d4f`는 24개 fixture, EV-FAIL-01 schema, Mulberry32 seeded RNG, scripted RNG, E2E listener helper를 추가했다. Codex 리뷰에서 이전 EPERM artifact path, FX_PLAY_R 상태, stale SHA metadata, Playwright outputDir 재현 절차 문제가 모두 해소됐음을 확인했다. SG-008 구현 head는 57/57 unit tests와 필수 검증을 통과했고, 최신 `main`(SG-007 포함) 위 local integration merge `522fcb7ebb3460b5dce858cc23bae825866e9681`도 format, lint, typecheck, 68/68 unit, build, 25 schema generation, Chromium E2E 1/1, diff check를 통과했다. 원격 push·공개 배포는 수행하지 않았다.
- SG-009: private Pages-preview artifact implementation SHA `331a9545a1634ca5b80594a2fba6e6290b7df25e`는 PR quality의 top-level `contents: read`를 유지하며 repository-derived Vite base build·preview 뒤 `dist`만 `actions/upload-artifact@v4.6.2` full-SHA pin으로 업로드한다. 지정 Antigravity 독립 리뷰 commit `b9fe277aeeefe0593fb70dc0c4d5e7408da51399`은 Node 24 clean install, 97/97 unit, Chromium base-path preview, action pin과 generated artifact 비추적을 PASS로 검증했다. Codex는 local integration merge `7f65009018ee1fbb478ed478c64ce33f55e6c72a`를 완료했고 원격 push·Pages API·공개 배포는 수행하지 않았다.
- SG-010: deterministic simulation implementation SHA `03f99aa0d7e9d8864fcba513608292f262f3c7e8`은 READY Right 예외와 2칸 queue, 마지막 예약 방향 검증, 한 tick 1~10 순서, 비성장 tail 예외, 충돌 event, 성장·점수·속도, free-cell 음식과 만석 승리를 순수 TypeScript로 구현했다. 사람을 거쳐 전달된 지정 Claude Opus 4.8 독립 리뷰는 계약 대조와 greedy 60판/1,780 food 및 random 300판 probe에서 정확성 결함 0건으로 APPROVE했다. SG-008 포함 최신 local `main` 위 integration merge `d114bf81a706c5c7af932144d22cdaa2436bf24f`는 Node 24 format, lint, typecheck, 97/97 unit, build, Chromium E2E 1/1, domain import/scope/diff 검사를 통과했다. 제출 100틱 replay가 성장 후 RNG를 실행하지 않는 비차단 보강점은 SG-011에 이관하며 원격 push·배포는 수행하지 않았다.
- SG-011: independent domain unit/contract/dependency test implementation SHA `fd7719bdea3638577809621f482d054816a18694`와 remediated review branch tip `9f32735d67dbcf168176704dbca96ef822f7e3a8`은 READY, fixed tick, reverse/queue, food, tail, collision, acceleration, full-board win, reset, command policy, tick order, domain dependency boundary, and seeded replay checks를 `tests/unit/**`에 추가했다. `@vitest/coverage-v8` dev dependency와 domain-scoped Vitest coverage thresholds를 `package.json`, `package-lock.json`, `vite.config.ts`에 추가했다. Codex review는 반복 수정 뒤 remaining findings 0으로 APPROVE했고, `git diff --check`, format, domain coverage 97.59% statements / 96.61% branches, approved-local-server Chromium E2E 1/1을 확인했다. 최신 local `main` `8674cb1bc1d38784923d4cf9ccbc346f149f0ea1` 위 integration merge `45c7ac9453ee3e665ad7ee9ec010e65c6eb0b92d`로 충돌 없이 통합했으며 원격 push·배포는 수행하지 않았다.
- SG-012: Phaser adapter 최종 구현 SHA `3393cb765deaafdc6bdbdf0f6d2d99b0a667e1b3`은 hidden board 아래 0×0 canvas로 생성되던 독립 리뷰 결함을 board가 보인 뒤 Phaser를 mount하는 방식으로 해소했다. 지정 Claude Sonnet 5의 3차 독립 리뷰가 fresh no-resize Chromium에서 canvas·grid·snake·food를 확인하고 `APPROVE`했다. Codex integrator는 `ef76675a2ea6f0aaad16e3c5d0814ab4645c68d7` 위에 merge commit `05cddcd3dbfea9eab6d8319911900580474630b4`로 통합했고, SG-014 preflight에서 구현·리뷰·merge SHA의 `main` ancestry와 `origin/main` 일치를 확인했다. PR·공개 배포는 수행하지 않았다.
- SG-013: 사람이 직접 승인한 축소 범위에서 `src/ui/contracts.ts`의 수동 타입 미러를 실제 `src/domain/index.ts` type-only re-export로 교체하고, 실제 `reset`/`enqueueDirection`/`step` 산출물로 focus 전이와 aria-live 증거를 보강했다. 구현 SHA `3a443185e8f4775fc27032f6ae6638abf8fb3fc7`과 검증 기록 `664cd480739a671d7cc371f964691fe3391f3972`는 지정 Antigravity 독립 리뷰를 통과했다. Codex는 local `main` `cf811f293918a4b7eed38b5cb44c3673950959cb` 위 integration merge `8391960c9fd01315db55053bf7c1d12459f6c702`에서 Node 24 format, lint, typecheck, 101/101 unit, build, Chromium E2E 1/1, scope와 whitespace 검사를 통과시켰다. E2E는 별도 SG-012 preview가 4173을 점유해 uncommitted 4174 치환으로 실행한 뒤 설정을 원복했고 최종 diff는 0이다. 원격 push·공개 배포는 수행하지 않았다. `src/ui/contracts.ts`의 최종 삭제는 3개 `tests/**`와 5개 `src/ui/**` consumer를 함께 바꾸는 후속 cross-owner 정리다.
- SG-014: production vertical flow implementation SHA `0b00f65d5258f0b21f69d9e6925289a06ae9ee34`는 Start→READY→Right→food/Score 10→wall GAME_OVER→Restart/Score 0을 실제 DOM command와 canvas/DOM snapshot으로 검증한다. Claude review `f520264ac45249b229f6337d7803e27195e46865`와 Antigravity review/remediation `e3dee624b5c1630d89b3f237a338d68e6fd9f606`은 모두 APPROVE했고, Codex가 합성 SHA `995e6469171508e7d99a68102f8d76404625a473`에서 한 줄 assertion-timeout 변경을 리뷰한 뒤 Node 24 current/clean 전체 verify와 root/Pages-base Chromium 2/2를 통과시켰다. verified branch tip `8e2eac0004d5e6b949619faddbf3a0fe962546f5`는 clean local main 위 merge commit `7422812f737bb62ddd458a025a1bfd203f5c5120`으로 통합됐고, completion SHA `62ca854b09b5c3b63852790587bbe102d1918fe5`도 `bcd9d08d5f8818c9d8a3199d9168031b83d7c341`로 병합됐다. 최종 local main의 별도 clean checkout은 Node 24 `npm ci`, 전체 verify 121/121, coverage, build, root/Pages-base Chromium 2/2, scope/whitespace/YAML/ancestry/generated-artifact 감사를 모두 통과했다. 제품 source/config/package/accepted 계약 diff, 추적 생성물, 원격 push·배포는 0건이다.
- SG-015: independent vertical QA head `qa-review-sg-015`는 320px 레이아웃, 키보드 내비게이션, 포커스 전이, 입력 큐잉(다중 입력), 20회 재시작 동작을 `tests/e2e/qa-audit.spec.ts` E2E 테스트로 검증하였다. 레이아웃 320px scroll audit, 20회 재시작 루프, 다중 입력 큐잉은 성공적으로 PASS하였다. 다만 키보드 단축키 'm'을 통한 음소거 토글 시 UI 버튼 및 쉘의 muted 상태가 업데이트되지 않는 결함 `DF-SG015-01` (Medium)이 감지되어 오프라인 태스크 및 Handoff에 기록하고 status는 `review-ready` 상태다.
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

SG-005~SG-014는 local main에 merged 상태이며, SG-015 독립 QA를 통해 수직 슬라이스의 기본 레이아웃, 포커스 전이, 다중 입력, 20회 재시작 동작의 정상 작동을 확인하고 Mute 단축키 관련 결함(DF-SG015-01)을 발견하여 인계하였습니다. 다음 관문은 발견된 결함에 대한 사람(User)의 대응 방향 결정 및 H1 모바일 시각/조작 승인 단계입니다. 공개 배포 권한은 H3a까지 닫혀 있습니다.

## 작업 스냅샷

| Wave | 상태 | 비고 |
|---|---|---|
| 0. 계약·캘리브레이션 | complete | H0b 승인; D-001~D-006·공용 계약 accepted; AC 누락 0 |
| 1. 기반 구축 | complete | SG-005·SG-006·SG-007·SG-008·SG-009 merged; private artifact 경로는 준비됐고 공개 배포는 H3a까지 금지 |
| 2. 수직 슬라이스 | complete | SG-010~SG-014 merged, SG-015 독립 QA 완료 (결함 보고 및 H1 승인 대기) |
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
