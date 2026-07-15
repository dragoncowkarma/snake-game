# 프로젝트 상태

- 마지막 동기화: 2026-07-15 (Asia/Seoul)
- 단계: 계획 수립 완료 / 구현 미착수
- 목표 릴리스: MVP 1.0
- 예상 공개 URL: `https://dragoncowkarma.github.io/snake-game/`
- 조정 책임자: Codex (구현 시작 시 확정)
- 현재 활성 작업: 없음
- 현재 차단: 없음

## 다음 관문

`H0a 계획·스파이크 실행 승인` 후 Wave 0을 시작한다. H0a에서 사람이 확인할 항목은 다음과 같다.

- Phaser 4.2.1 우선 스파이크, Phaser 귀책 실패 판정, Phaser 3.90.0 재검증 조건
- 느림/기본 2개 난이도를 포함한 MVP 범위
- DOM UI + Phaser 캔버스의 하이브리드 구성
- GitHub Issue/PR을 이용한 AI 간 실시간 공유 방식
- GitHub Pages 저장소 설정을 사람이 수행할 수 있는지 여부

## 작업 스냅샷

| Wave | 상태 | 비고 |
|---|---|---|
| 0. 계약·캘리브레이션 | pending | H0a 승인 필요 |
| 1. 기반 구축 | pending | Wave 0 결과와 D-001~D-006의 H0b 승인 후 시작 |
| 2. 수직 슬라이스 | pending | 핵심 플레이 가능 상태 |
| 3. 통합·기능 완성 | pending | H1/H2 사람 검토 포함 |
| 4. 품질 강화 | pending | 교차 브라우저·접근성 |
| 5. 배포·릴리스 | pending | H3a 공개 배포 승인, H3b 결과 수락 |

## 최근 기준안 (`proposed`, H0b 승인 전)

- Phaser 4.2.1을 우선 검증한다. Phaser 귀책 실패일 때만 3.90.0을 동일 매트릭스로 검증하며, 하나가 통과하기 전에는 기능 개발을 시작하지 않는다.
- 게임 코어는 순수 TypeScript 결정론적 상태 전이로 구성한다.
- 게임 보드는 Phaser, 접근 가능한 인터페이스는 DOM으로 구성한다.
- 실시간 협업 상태는 GitHub Issue/PR, 장기 기록은 저장소 문서에 둔다.

상세 근거는 `docs/coordination/DECISIONS.md`를 참조한다.
