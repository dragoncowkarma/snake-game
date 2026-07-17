# Snake Game

Phaser.js와 TypeScript로 만드는 반응형 Snake 게임입니다. GitHub Pages에서 정적 사이트로 배포하는 것을 목표로 합니다.

현재 단계는 **Wave 0·H0b 완료, Wave 1 구현 미착수**입니다. D-001~D-006과 공용 계약은 승인됐으며, 다음 후보 SG-005는 별도의 승인된 task packet/Issue와 claim을 기록한 뒤 시작합니다.

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

- Phaser `4.2.1` 확정 기준선, TypeScript, Vite `8.1.x`, Node.js `24.x` LTS, npm
- 20×20 논리 그리드, 고정 시뮬레이션 틱, 결정론적 게임 코어
- 키보드와 모바일 HTML 방향 버튼 지원
- Vitest 단위 테스트, Playwright 브라우저 테스트
- GitHub Actions 품질 검사와 H3a 승인 후 GitHub Pages 수동 artifact 배포
- Claude, Codex, Antigravity의 역할 분리와 교차 검토

Phaser 4.2.1은 Scene, Graphics, 입력, 스케일, strict TypeScript, Pages 하위 경로, Chromium/WebKit production-preview 기술 스파이크를 통과해 H0b에서 MVP 기준선으로 확정됐습니다. 출시 전에는 지원 OS와 최신 브라우저 도구로 다시 검증하며, 버전 변경은 별도 결정으로만 진행합니다. 자세한 증거와 판정 기준은 기획서와 결정 기록에 있습니다.
