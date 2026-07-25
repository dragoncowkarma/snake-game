# 프로젝트 상태

- 마지막 동기화: 2026-07-26T00:51:43Z
- 단계: Wave 0 완료 / H0b 승인 완료 / Wave 1 기반 구축 완료 / Wave 2 수직 슬라이스 완료 / H1 승인 완료 / Wave 3 진행 중 (종료 관문 H2 대기)
- 목표 릴리스: MVP 1.0
- 예상 공개 URL: `https://dragoncowkarma.github.io/snake-game/`
- 조정 책임자: Codex
- 현재 활성 작업: 없음 — SG-024(8f828bb)와 SG-025(36b7379)가 local main에 통합됐다.
  SG-028(RC 재검토)은 Wave 4 관문 미충족으로 BLOCK 상태다. H3a 공개 승인과 workflow dispatch는 여전히 금지된다.
- 현재 검증 대기: H2 사람 플레이테스트. 사람은 `SG-019-AC04`의 display-backed
  Pages-base 16/16 ×3 증거 편차를 SG-019에 한해 수용했다. 역사적 실패와
  `DF-SG019-01`은 비차단 harness 품질 기록으로 유지한다.
- 현재 결정 필요: H2 사람 판정. 사람이 "Wave 4 종료"를 지시했으나 Wave 4는
  착수 관문(Wave 3 H2)도 종료 조건(blocker/high 0·RC SHA 고정)도 충족하지
  않아 AskUserQuestion으로 명확화한 결과 "막힌 작업부터 재개"로 좁혀졌다 —
  Wave 4 자체의 종료 판정은 아직 내려지지 않았다.
- 다음 작업 후보: (1) Firefox rapid-keypress 테스트 결함 수정(SG-020 handoff
  참조, 제품 결함 아님) (2) macOS 13+/CI에서 WebKit 5-viewport 재실행 (3) H2
  사람 플레이테스트 (4) GAP-06-PERF-DEVICE 기기 승인

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
- SG-015: independent vertical QA head `qa-review-sg-015`는 320px 레이아웃, 키보드 내비게이션, 포커스 전이, 입력 큐잉(다중 입력), 20회 재시작 동작을 `tests/e2e/qa-audit.spec.ts` E2E 테스트로 검증하였다. 레이아웃 320px scroll audit, 20회 재시작 루프, 다중 입력 큐잉은 성공적으로 PASS하였다. 다만 키보드 단축키 'm'을 통한 음소거 토글 시 UI 버튼 및 쉘의 muted 상태가 업데이트되지 않는 결함 `DF-SG015-01` (Medium)이 감지되어 오프라인 태스크 및 Handoff에 기록하고 local `main` 병합 커밋 `d0388e90472e56c0eb807b6cb14761f25626824e`로 통합되어 status는 `merged` 상태다.
- SG-018: production dist 대상 Playwright E2E 확장 테스트 스위트 구현 (Antigravity).
  WASD/Arrow 8개 방향 키, semantic Command 1:1, touch D-pad 1:1,
  document.hidden/window blur/orientation pause, resize 보존, 저장소와 AudioContext
  실패 fallback, 320px scroll을 검증한다. 구현 SHA `f735944da2cb0922f656406b4710a68d454aedf9`는
  Antigravity 3회 연속 16/16 PASS 뒤 `main`에 fast-forward됐고, Codex가
  2026-07-23T08:03:41Z 독립 리뷰 APPROVE와 Node 24/npm 11.18.0 원문 unit 128/128,
  production Chromium 16/16 재검증으로 packet/handoff 상태를 `merged`로 정합화했다.
- SG-019: base `74fe266`에서 persisted lastDifficulty의 router/DOM 복원, UI의
  중복 초기 GameState와 미사용 dispatch stub 제거, `gameEnded` self-cell/wall-edge
  300ms overlay를 구현한 head `583c734`. clean root `npm run verify`는 14 files/132
  unit, coverage, build, Chromium 16/16으로 PASS했다. clean Pages-base 전체 E2E는
  첫 keyboard/Space scroll assertion이 scrollY 40→40으로 1회 실패했고 동일 focused
  rerun은 1/1 PASS해 flaky observation 경계로 판정했다. Claude Opus 4.8 지정
  독립 리뷰는 코드 관점 APPROVE했으며, 별도로 base와 implementation 모두에서
  line 661이 `CVDisplayLinkCreateWithCGDisplay` `-6670`과 함께 멈춘 것을 재현해
  그 Phaser freeze를 detached-macOS 환경 결함으로 격리했다. 추가 코드 검사는 line
  266이 Start 전 body 네이티브 스크롤이며 off-board Space에 제품
  `preventDefault()`가 없음을 확인해 두 증상이 기계적으로 별개이고 SG-019 입력
  경로가 스크롤을 막지 않음을 입증했다. line 266의 base 재현과 필수 Pages-base
  전체 통과 증거는 없지만, 사람은 2026-07-23T16:45:43Z에 `SG-019-AC04`의 16/16 ×3
  증거 편차를 명시적으로 수용했다. 실패는 PASS로 바꾸지 않고
  `DF-SG019-01`(medium)을 비차단 후속 기록으로 유지한다. clean local `main`은
  base `74fe266`에서 verified completion `8097c94`로 충돌 없이 fast-forward됐고
  SG-019는 `merged`다. 원격 push·배포·H2 판정은 수행하지 않았다.
- SG-020: 이전에 한 번도 offline packet이 만들어진 적 없던 Wave 4 적대적/수동
  QA를 처음 착수했다(Claude, 지정 모델 부재로 독립 리뷰 대신 별도 세션 review
  agent가 사전 맥락 없이 검토). `playwright.config.ts`를 `PLAYWRIGHT_ENGINES`/
  `PLAYWRIGHT_VIEWPORTS` 환경변수 매트릭스로 처음 확장했다(기본값은 기존
  단일 chromium/1366x768과 동일해 `verify`/CI 비영향). NC-01~07 negative
  control 7건, NFR-SEC01~03·M03·P03·P04 자동 감사, CHK-U08 WCAG contrast
  계산, AC-U05 Tween 소스 감사가 모두 PASS다. Chromium 5-viewport 매트릭스는
  85/85 PASS(콜드 스타트 우연 2건은 warm 재실행 7/7로 무죄 입증). Firefox는
  `production.spec.ts`의 rapid-keypress 테스트 2건을 3/3·2/2 결정적으로
  실패시키는데, 근본 원인은 Firefox Juggler IPC 지연이 테스트의 sub-tick
  타이밍 가정을 깨는 기존 테스트 결함이며 제품 결함이 아니다 — 별도 결함으로
  이관한다. WebKit은 이 macOS 12.7.6 호스트에서 Playwright 툴체인이 지원하지
  않아(요구 사양 macOS 13+) 전혀 실행할 수 없다. 실기기(iOS/Android),
  VoiceOver/TalkBack, 보정 오디오 미터, GAP-06-PERF-DEVICE 승인 기기, 시각
  회귀 baseline 도구는 모두 이 세션 범위 밖으로 `blocked`다. 독립 리뷰가
  `playwright.config.ts`의 `format:check` 실패와 원래 1건짜리 reduced-motion
  테스트가 사실상 공허하다는 점을 지적해 둘 다 즉시 수정했고, 그 과정에서
  추가한 CSS 검증 테스트가 Firefox 전용 문자열 포맷 버그를 드러내 함께
  고쳤다. 사람의 "local main으로 머지해줘" 지시로 clean local `main`(`8037051`,
  드리프트 없음 확인)을 `git -C <primary worktree> merge --ff-only
  claude/wave-4-completion-f6e9fc`로 `27c0bec`까지 fast-forward 통합했다(worktree
  병합 함정 회피 — linked worktree에서 `git checkout main`을 시도하지 않고 primary
  worktree 경로를 직접 지정). 병합 뒤 primary에서 재검증: format:check/lint/
  typecheck/build/`git diff --check` 전부 exit 0. `npm run test`는 primary
  worktree 루트 아래 중첩된 다른 세션 worktree(`sg-007-review-1773f0`,
  `sg-013-ui-implementation-bd0257`, `sg-014-review-b643af` 등, 이 merge와 무관)의
  `spikes/**` 스펙 파일 파싱 실패로 21개 파일이 실패 처리됐지만 로드된
  675/675 개별 테스트는 전부 통과했다 — SG-022-2가 이미 기록한 것과 동일한
  기존 환경 아티팩트다. `npm run test:e2e`는 18개 중 1개(`Keyboard Controls...
  preventDefault`)가 콜드 스타트에서 실패했으나 warm 재실행 2/2 PASS로 이
  packet이 이미 기록한 산발적 타이밍 취약성임을 재확인했다. 원격 push·배포·
  H2 판정은 수행하지 않았다.
- SG-021: 10년차 아키텍처·UX 관점 최종 diff 감사(Claude Opus 4.8). base `d490ea3`(제품 코드는 `583c734`와 동일). 제품 수정 없이 `docs/coordination/handoffs/SG-021.md`에 리뷰 리포트를 작성. 출시 차단 결함 0건. 발견된 medium 1건(M1: 강제 `Phaser.WEBGL` → `AUTO` 폴백) 및 low 5건은 SG-022로 이관 권고. 승인된 offline packet 부재를 조정 책임자가 생성하여 정합화하고, 리뷰 head `67d68a5`와 packet·STATUS 동기화를 base `d490ea3`에서 local `main`으로 fast-forward 통합하여 SG-021을 `merged`로 닫았다. 이 task 통합은 Wave 3 종료 관문(H2)과 무관하며 wave 상태를 전진시키지 않는다.
- SG-022: SG-021 M1만을 사람 승인 offline packet으로 분리했다. `Phaser.WEBGL` 강제를 `Phaser.AUTO`로 바꾸고 config-level 회귀 테스트를 추가한 구현 `49865f6`은 수정 전 `WEBGL` failure와 수정 후 PASS를 기록했다. 지정 Claude 발견자 리뷰는 canonical Node 24에서 targeted 1/1 및 전체 unit 133/133 PASS, 임시 `WEBGL` revert failure를 독립 재현해 APPROVE했다. Codex는 clean local `main`을 `de98836`으로 fast-forward 통합했고, 구현자 검증의 Chromium E2E 16/16 PASS도 handoff에 기록했다. 원격 push·배포·H2 판정은 수행하지 않았다. SG-021 L1~L5와 SG-020 결함은 이 M1-only packet 범위 밖이다.
- SG-023: revision 1은 release candidate 전체 회귀 테스트를 수행했으나 선행 작업(SG-020 결함, H2 대기) 차단, 다중 브라우저/viewport 매트릭스 실행 누락, 필수 NFR 재검증 누락으로 인해 `blocked` 판정되었다. 사람 승인은 이 BLOCK 판정 기록에 대한 것이며 릴리스 통과가 아니다. 기록 유지를 위해 패킷과 handoff 문서를 local `main`에 병합했으며 제품 코드 수정은 없다. revision 2(`SG-023-2`, Claude)는 SG-020이 새로 만든 증거로 정확히 그 gap을 재실행했다: NFR-P03/P04/SEC01-03/M03 6개가 미실행→PASS로, ENV-R 매트릭스가 1/15(신뢰 불가)→5/15(Chromium, 격리·warm 재확인)로 개선됐다. 여전히 Firefox 5개(테스트 결함, 제품 결함 아님)와 WebKit 5개(로컬 macOS 12 툴체인 제약)가 막혀 있고 H2와 NFR-P01/P02(GAP-06-PERF-DEVICE)도 미충족이라 `blocked`를 유지한다 — revision 2도 release 통과 승인이 아니라 개선된 BLOCK 판정 기록이다. SG-020과 함께 local `main` `27c0bec`로 병합 완료(위 SG-020 항목의 병합·재검증 기록 참조).
- SG-024: GitHub Pages 배포 파이프라인(dispatch-only, H3a gate variable), rollback 절차, action SHA pin, 최소 권한 분리를 구현했다. `docs/coordination/tasks/SG-024.yaml`을 포함한 병합 커밋 `8f828bb`로 local main에 통합되었다.
- SG-025: 사용자 README 전면 재작성, 로컬 실행/테스트/배포/롤백, 접근성 범위, 라이선스를 기술했다. DF-SG015-01 오기재 상태 등은 Codex 정합화 과정에서 `merged` 상태로 수정되어 `36b7379`로 local main에 통합되었다.
- SG-028: SG-028 Release Candidate 재검토를 수행했으나, B1(SG-023 blocked 미해결), B2(SG-028 승인 packet 부재), B3/B4(SG-025 상태 불일치)로 인해 `blocked` 판정되었다. B2/B3/B4는 본 상태 갱신을 통해 정합화되었으나 제품 릴리스는 여전히 막혀있다.
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

## H1 종료 기록

2026-07-19T19:12:19Z(2026-07-20 Asia/Seoul) 현재 사람의 `Wave 2 종료` 지시는 SG-010~SG-015 증거와 DF-SG015-01(medium)의 Wave 3 이관을 승인하는 H1 판정이다. 핵심 게임 루프는 production build에서 시작→이동→먹기→죽기→재시작 전 과정이 플레이 가능하고, SG-015 독립 QA의 blocker/high 결함은 0건이다. H1이 요구하는 실기기 모바일 플레이 증거는 저장소에 없으며 Playwright 320×568 뷰포트·터치 에뮬레이션 증거로 대체된 편차를 사람이 공개된 상태로 수락했다(상세는 `DECISIONS.md`의 H1 승인 기록). 이 승인은 Wave 3의 선행 gate만 열며 SG-016 자동 착수, 원격 push 정책 변경, GitHub Pages 공개 배포(H3a까지 금지), H2 판정을 포함하지 않는다.

closeout에서 정합화한 장부: SG-009 packet을 기록된 병합 `7f65009018ee1fbb478ed478c64ce33f55e6c72a` 기준 `merged`로 정합화했고, SG-011/SG-012 packet에 누락된 `handoff` 포인터를 추가했다. SG-011의 지정 모델 편차 기재 모순과 status_history timezone 표기 오류는 역사 기록으로 보존하며 H1 승인 기록에 공개했다.

### Wave 2 종료 검증

| 검증 / 환경 | 결과 | 실제 증거 |
|---|---|---|
| clean `npm ci` + `npm run verify` / Node 24.18.0, npm 11.16.0 | PASS | format, lint, typecheck, unit 121/121(9 files), domain coverage 97.59% stmts·96.61% branches·100% funcs, build 13.9s, E2E 7/7 — 전체 exit 0 |
| Wave 2 증거 ancestry | PASS | SG-010~SG-015의 기록된 구현·리뷰·병합 SHA 33개(항목 36건)가 모두 실존 commit이며 local `main` `19a5cb2` 조상 |
| offline task packet 파싱 | PASS | SG-001~SG-015 YAML 15/15 parse; SG-009 상태 미정합과 SG-011/SG-012 handoff 포인터 누락을 발견해 이 closeout에서 정합화 |
| Wave 2 종료 조건·문서 일관성 | PASS | 핵심 루프 플레이 가능(SG-014/SG-015 증거), SG-015 blocker 0, 구현·리뷰 플랫폼 분리 6/6 준수 |
| DF-SG015-01 기록 정확성 | PASS | packet findings·handoff·STATUS 3곳 medium 일관 기록, `tests/e2e/qa-audit.spec.ts`의 expected-fail 마커, `src/game/application-router.ts`·`src/ui/app.ts` 코드 실증 |
| 원격 일치 | PASS | fetch 후 local `main` = `origin/main` = 원격 `main` = `19a5cb229ffacda78cbda8d38b6374c2b5fb9aca`, 공개 GitHub의 열린 Issue/PR 0건 |
| `git diff --check` | PASS | closeout 문서 diff whitespace 오류 0 |

## 다음 관문

Wave 2는 H1 승인으로 완료됐다. 다음 관문은 Wave 3 (SG-016~SG-019) 착수와 H2 사람 플레이테스트다. SG-016은 조정 책임자가 승인한 offline task packet과 claim 뒤에만 시작하며, DF-SG015-01은 SG-016/SG-017의 오디오 상태 바인딩 설계에서 해결한다. 공개 배포 권한은 H3a까지 닫혀 있다.

## 작업 스냅샷

| Wave | 상태 | 비고 |
|---|---|---|
| 0. 계약·캘리브레이션 | complete | H0b 승인; D-001~D-006·공용 계약 accepted; AC 누락 0 |
| 1. 기반 구축 | complete | SG-005~SG-009 merged; private artifact 경로는 준비됐고 공개 배포는 H3a까지 금지 |
| 2. 수직 슬라이스 | complete | SG-010~SG-015 merged; H1 승인(2026-07-20 Asia/Seoul); DF-SG015-01(medium)은 SG-016/SG-017 이관 |
| 3. 통합·기능 완성 | in-progress | SG-016~019 local main 통합 완료; H2 사람 검토 대기 |
| 4. 품질 강화 | pending | 착수 관문(Wave 3 H2)이 아직 안 열렸음에도 사람 승인으로 선행 진행; SG-020 첫 실행(Chromium 5-viewport PASS, Firefox 테스트 결함으로 blocked, WebKit 로컬 OS 제약으로 blocked, 실기기 행 전부 blocked)·SG-021(완료)·SG-022 M1 merged·SG-023 revision 2(NFR 6개 신규 PASS, ENV-R 5/15, 여전히 blocked). Wave 4 종료 조건(blocker/high 0, RC SHA 고정, 사람의 medium 확인) 미충족 |
| 5. 배포·릴리스 | pending | H3a 공개 배포 승인, H3b 결과 수락 |

## 승인된 기준선

- Phaser 4.2.1, framework 없는 TypeScript + Vite 8.1.x, Node.js 24.x LTS, npm lockfile.
- 게임 코어는 Phaser/DOM과 독립된 순수 TypeScript 결정론적 상태 전이다.
- 게임 보드는 Phaser, 메뉴·HUD·상태·모바일 버튼은 DOM이다.
- 외부 런타임 이미지·폰트·분석·서버 API를 MVP에 추가하지 않는다.
- 실시간 협업 상태는 GitHub Issue/PR, 장기 기록은 저장소 문서에 둔다.

상세 근거는 `docs/coordination/DECISIONS.md`와 `docs/coordination/CONTRACTS.md`를 참조한다.
