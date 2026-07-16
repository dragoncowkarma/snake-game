# 프로젝트 상태

- 마지막 동기화: 2026-07-16 (Asia/Seoul)
- 단계: Wave 0 계약·검증 진행 / 기능 구현 미착수
- 목표 릴리스: MVP 1.0
- 예상 공개 URL: `https://dragoncowkarma.github.io/snake-game/`
- 조정 책임자: Codex
- 현재 활성 작업: SG-004 (`in_progress`, 외부 승인 리뷰와 frozen 문서가 상충해 integrator changes requested)
- 현재 차단: SG-004-DN01 (AC-G06 성장 tick/tail fixture 의미에 대한 사람 결정 필요)

## 다음 관문

`H0a 계획·스파이크 실행 승인`은 2026-07-16(Asia/Seoul) 현재 작업의 사람 지시로 통과했다. 이 승인은 Wave 0 검증 실행만 열며 기술 선택, D-001~D-006 확정, Wave 1 기능 구현 또는 공개 배포를 승인하지 않는다. GitHub Pages Settings는 필요 시 사람이 수행한다는 운영 전제를 포함하며 실제 공개 권한은 H3a에서 다시 확인한다.

다음 관문은 `H0b 계약·결정 승인`이다. SG-001~SG-004 증거와 D-001~D-006 제안을 사람이 검토해 모두 승인하기 전에는 Wave 1을 시작하지 않는다.

현재 환경에는 인증된 GitHub CLI/API 도구가 없어 SG-002는 GitHub Issue/PR과 중복되지 않는 offline packet/handoff를 원본으로 사용한다. 2026-07-16 확인 시 열린 Issue와 PR은 각각 0건이었다.

SG-002는 Phaser 4.2.1의 strict TypeScript 소비, production build, Chromium/WebKit production-preview 매트릭스를 통과해 `PASS_4_2_1`을 반환했고 Claude와 Antigravity의 독립 리뷰가 기록됐다. 2026-07-16 사람 지시로 SG-001과 SG-002를 SG-003의 완료된 선행 작업으로 인정했다. 이 인정은 D-001의 `accepted` 변경이나 H0b 통과가 아니다. 상세 재현 증거와 제약은 `docs/coordination/handoffs/SG-002.md`에 있다.

SG-003 revision 1 offline packet은 기준 SHA `fd81ba9943e8b5786a0910e7172fb57c477c0d5e`로 사람 승인을 받았다. 소스 파일 없이 `docs/coordination/CONTRACTS.md`에 공개 타입과 상태 전이 계약을 고정했고 구현 증거 SHA `993c70309c6eeeb0a537e0d0f4d1733d84c651f6`의 scoped 검증을 통과했다. 지정 리뷰어(Claude / Opus 4.8 / high)의 독립 리뷰가 차단 결함 없이 승인 권고를 냈고, 비차단 명확화 발견 3건(pause/resume 도메인 진입점, `start`/`restart` 난이도 출처, `accept` 의미)은 revision 2 SHA `b4c5130bc0a0980d95ff575ff12efd154bf001ab`에서 해소됐다. 비-Claude Codex 재검토와 scoped 검증도 통과했으며 revision 2는 로컬 `main`의 `c41bb45c81aa5f39ee9465b0db5ea08dcd99ea18`에 병합돼 있다. 2026-07-16 사람의 `SG-003 완료` 지시는 revision 2와 공개된 모델 라우팅 편차를 이 작업에 한해 수락하므로 packet을 `merged`로 닫았다. 이는 원격 동기화, H0b 승인 또는 D-001~D-006의 `accepted` 전환을 뜻하지 않는다.

SG-004 revision 1은 Antigravity가 `agent/antigravity/SG-004-qa-plan`에서 작성해 frozen substantive SHA `b0fb73b5aa520986a810177e81e120df20e52dbd`로 재제출했다. 형식 리뷰 `019f6a18-79e7-7f12-a40a-e67e448a1a00`의 `Approved` 결과와 기계 검증 통과는 그대로 기록한다. 그러나 Codex integrator의 독립 수용 기준 재검증에서 bare N/A와 비재현 fixture, 필수 DP 절차·명시적 6×8 matrix, manual-only 절차, concrete negative control, check별 earliest owner, gap/NFR 분류가 여전히 SG-004-AC02~AC08을 충족하지 못함을 확인했다. 제공된 승인 결과가 frozen 문서와 상충하므로 task를 `review → in_progress` changes requested로 반환했고 local `main`에는 병합하지 않았다. `SG-004-DN01`은 QA plan 결함이 아니라 H0b에서 사람이 결정할 항목으로 올바르게 유지한다. SG-004 완료 뒤에도 H0b는 사람이 SG-001~SG-004와 D-001~D-006을 승인해야 통과하며 Wave 1은 그 전까지 대기한다.

## 작업 스냅샷

| Wave | 상태 | 비고 |
|---|---|---|
| 0. 계약·캘리브레이션 | in_progress | H0a 승인 완료; SG-003 완료, SG-004 changes requested·미병합, 사람 H0b 대기 |
| 1. 기반 구축 | pending | Wave 0 결과와 D-001~D-006의 H0b 승인 후 시작 |
| 2. 수직 슬라이스 | pending | 핵심 플레이 가능 상태 |
| 3. 통합·기능 완성 | pending | H1/H2 사람 검토 포함 |
| 4. 품질 강화 | pending | 교차 브라우저·접근성 |
| 5. 배포·릴리스 | pending | H3a 공개 배포 승인, H3b 결과 수락 |

## 최근 기준안 (`proposed`, H0b 승인 전)

- Phaser 4.2.1은 SG-002 매트릭스를 통과했다. 독립 리뷰와 H0b 승인 전까지 D-001은 여전히 `proposed`이며 기능 개발을 시작하지 않는다.
- 게임 코어는 순수 TypeScript 결정론적 상태 전이로 구성한다.
- 게임 보드는 Phaser, 접근 가능한 인터페이스는 DOM으로 구성한다.
- 실시간 협업 상태는 GitHub Issue/PR, 장기 기록은 저장소 문서에 둔다.

상세 근거는 `docs/coordination/DECISIONS.md`를 참조한다.
