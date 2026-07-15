# Snake Game

Phaser.js와 TypeScript로 만드는 반응형 Snake 게임입니다. GitHub Pages에서 정적 사이트로 배포하는 것을 목표로 합니다.

현재 단계는 **개발 계획 수립 완료, 구현 미착수**입니다. H0a에서 계획·기술 스파이크 실행을 승인하고, Wave 0 결과와 D-001~D-006을 H0b에서 승인한 뒤 기능 구현을 시작합니다.

## 문서 안내

- [사람용 개발 기획서](docs/DEVELOPMENT_PLAN.md)
- [세부 작업 및 AI 모델 배정](docs/TASKS.md)
- [AI 실행 프롬프트](docs/AI_PROMPTS.md)
- [10년차 전문가 검토와 반영 결과](docs/EXPERT_REVIEW.md)
- [모든 AI가 따라야 할 협업 규칙](AGENTS.md)
- [현재 프로젝트 상태](docs/coordination/STATUS.md)
- [결정 기록](docs/coordination/DECISIONS.md)
- [작업 인계 템플릿](docs/coordination/HANDOFF_TEMPLATE.md)

## 계획 기준선

- Phaser `4.2.1` 우선 후보(Phaser 귀책 실패 시 검증된 `3.90.0`), TypeScript, Vite `8.1.x`, Node.js `24.x` LTS, npm
- 20×20 논리 그리드, 고정 시뮬레이션 틱, 결정론적 게임 코어
- 키보드와 모바일 HTML 방향 버튼 지원
- Vitest 단위 테스트, Playwright 브라우저 테스트
- GitHub Actions 품질 검사와 H3a 승인 후 GitHub Pages 수동 artifact 배포
- Claude, Codex, Antigravity의 역할 분리와 교차 검토

Phaser 4.2.1은 2026년 7월 현재 최신 안정판이지만 출시 직후의 새 메이저 계열입니다. 따라서 Scene, Graphics, 입력, 스케일, TypeScript, Pages 하위 경로를 검증하는 90분 기술 스파이크를 먼저 통과해야 확정합니다. Phaser 4 자체의 재현 가능한 실패일 때만 3.90.0을 같은 핵심 매트릭스로 다시 검증하며, 환경·권한 문제는 버전 후퇴가 아니라 `BLOCKED`로 처리합니다. 자세한 판정 기준은 기획서와 결정 기록에 있습니다.
