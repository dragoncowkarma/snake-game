# 프로젝트 상태

- 마지막 동기화: 2026-07-16 (Asia/Seoul)
- 단계: Wave 0 계약·검증 진행 / 기능 구현 미착수
- 목표 릴리스: MVP 1.0
- 예상 공개 URL: `https://dragoncowkarma.github.io/snake-game/`
- 조정 책임자: Codex
- 현재 활성 작업: 없음 (SG-004 revision 1 packet `ready`, 미선점)
- 현재 차단: 없음

## 다음 관문

`H0a 계획·스파이크 실행 승인`은 2026-07-16(Asia/Seoul) 현재 작업의 사람 지시로 통과했다. 이 승인은 Wave 0 검증 실행만 열며 기술 선택, D-001~D-006 확정, Wave 1 기능 구현 또는 공개 배포를 승인하지 않는다. GitHub Pages Settings는 필요 시 사람이 수행한다는 운영 전제를 포함하며 실제 공개 권한은 H3a에서 다시 확인한다.

다음 관문은 `H0b 계약·결정 승인`이다. SG-001~SG-004 증거와 D-001~D-006 제안을 사람이 검토해 모두 승인하기 전에는 Wave 1을 시작하지 않는다.

현재 환경에는 인증된 GitHub CLI/API 도구가 없어 SG-002는 GitHub Issue/PR과 중복되지 않는 offline packet/handoff를 원본으로 사용한다. 2026-07-16 확인 시 열린 Issue와 PR은 각각 0건이었다.

SG-002는 Phaser 4.2.1의 strict TypeScript 소비, production build, Chromium/WebKit production-preview 매트릭스를 통과해 `PASS_4_2_1`을 반환했고 Claude와 Antigravity의 독립 리뷰가 기록됐다. 2026-07-16 사람 지시로 SG-001과 SG-002를 SG-003의 완료된 선행 작업으로 인정했다. 이 인정은 D-001의 `accepted` 변경이나 H0b 통과가 아니다. 상세 재현 증거와 제약은 `docs/coordination/handoffs/SG-002.md`에 있다.

SG-003 revision 1 offline packet은 기준 SHA `fd81ba9943e8b5786a0910e7172fb57c477c0d5e`로 사람 승인을 받았다. 소스 파일 없이 `docs/coordination/CONTRACTS.md`에 공개 타입과 상태 전이 계약을 고정했고 구현 증거 SHA `993c70309c6eeeb0a537e0d0f4d1733d84c651f6`의 scoped 검증을 통과했다. 지정 리뷰어(Claude / Opus 4.8 / high)의 독립 리뷰가 차단 결함 없이 승인 권고를 냈고, 비차단 명확화 발견 3건(pause/resume 도메인 진입점, `start`/`restart` 난이도 출처, `accept` 의미)은 revision 2 SHA `b4c5130bc0a0980d95ff575ff12efd154bf001ab`에서 해소됐다. 비-Claude Codex 재검토와 scoped 검증도 통과했으며 revision 2는 로컬 `main`의 `c41bb45c81aa5f39ee9465b0db5ea08dcd99ea18`에 병합돼 있다. 2026-07-16 사람의 `SG-003 완료` 지시는 revision 2와 공개된 모델 라우팅 편차를 이 작업에 한해 수락하므로 packet을 `merged`로 닫았다. 이는 원격 동기화, H0b 승인 또는 D-001~D-006의 `accepted` 전환을 뜻하지 않는다.

SG-004 revision 1 offline packet은 로컬 `main` SHA `5b5ab4740f57f776978b602dea02ef90fdc44047`을 기준으로 `docs/coordination/tasks/SG-004.yaml`에 준비했다. 2026-07-16 공개 GitHub API에서 열린 Issue/PR이 없음을 재확인했고, H0a 승인과 현재 사람의 "SG-004 시작 전 준비 작업" 지시에 따라 조정 책임자가 넓은 `docs` 범위를 `docs/coordination/QA_PLAN.md` 한 파일과 packet/handoff로 한정했다. 상태는 `ready`지만 claim, Antigravity 작업 브랜치, QA 맵, handoff는 아직 없으므로 SG-004는 시작되지 않았다. 지정 작성자는 Antigravity Gemini 3.1 Pro high, 리뷰어는 Codex 5.5 high이며 라우팅 편차는 claim 전 승인된 packet revision이 필요하다. SG-004는 28개 AC와 15개 필수 경계 시나리오의 자동/수동/배포 단계, 책임자, 독립 oracle, 증거 형식을 계획하며 제품 코드·테스트·계약·결정은 변경하지 않는다.

## 작업 스냅샷

| Wave | 상태 | 비고 |
|---|---|---|
| 0. 계약·캘리브레이션 | in_progress | H0a 승인 완료; SG-003 완료, SG-004 packet ready·미선점, H0b 대기 |
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
