# 프로젝트 상태

- 마지막 동기화: 2026-07-16 (Asia/Seoul)
- 단계: Wave 0 계약·검증 진행 / 기능 구현 미착수
- 목표 릴리스: MVP 1.0
- 예상 공개 URL: `https://dragoncowkarma.github.io/snake-game/`
- 조정 책임자: Codex
- 현재 활성 작업: SG-003 공용 도메인 계약 작성 (`in_progress`)
- 현재 차단: 없음

## 다음 관문

`H0a 계획·스파이크 실행 승인`은 2026-07-16(Asia/Seoul) 현재 작업의 사람 지시로 통과했다. 이 승인은 Wave 0 검증 실행만 열며 기술 선택, D-001~D-006 확정, Wave 1 기능 구현 또는 공개 배포를 승인하지 않는다. GitHub Pages Settings는 필요 시 사람이 수행한다는 운영 전제를 포함하며 실제 공개 권한은 H3a에서 다시 확인한다.

다음 관문은 `H0b 계약·결정 승인`이다. SG-001~SG-004 증거와 D-001~D-006 제안을 사람이 검토해 모두 승인하기 전에는 Wave 1을 시작하지 않는다.

현재 환경에는 인증된 GitHub CLI/API 도구가 없어 SG-002는 GitHub Issue/PR과 중복되지 않는 offline packet/handoff를 원본으로 사용한다. 2026-07-16 확인 시 열린 Issue와 PR은 각각 0건이었다.

SG-002는 Phaser 4.2.1의 strict TypeScript 소비, production build, Chromium/WebKit production-preview 매트릭스를 통과해 `PASS_4_2_1`을 반환했고 Claude와 Antigravity의 독립 리뷰가 기록됐다. 2026-07-16 사람 지시로 SG-001과 SG-002를 SG-003의 완료된 선행 작업으로 인정했다. 이 인정은 D-001의 `accepted` 변경이나 H0b 통과가 아니다. 상세 재현 증거와 제약은 `docs/coordination/handoffs/SG-002.md`에 있다.

SG-003 revision 1 offline packet은 기준 SHA `fd81ba9943e8b5786a0910e7172fb57c477c0d5e`로 사람 승인을 받아 `agent/codex/SG-003-domain-contract`에서 진행 중이다. Wave 0 범위에 따라 소스 파일 없이 `docs/coordination/CONTRACTS.md`에 공개 타입과 상태 전이 계약만 고정한다.

## 작업 스냅샷

| Wave | 상태 | 비고 |
|---|---|---|
| 0. 계약·캘리브레이션 | in_progress | H0a 승인 완료; SG-001·SG-002는 SG-003 선행 완료로 사람 인정, SG-003 진행 중 |
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
