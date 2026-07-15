# 결정 기록

상태 값은 `proposed`, `accepted`, `superseded` 중 하나다. H0a는 검증 실행만 승인한다. Wave 0 증거를 검토하는 H0b에서 D-001~D-006을 각각 승인해 `accepted`로 바꾸며, 하나라도 미승인이면 Wave 1을 시작하지 않는다.

## D-001: Phaser 4.2.1 조건부 기준선

- 상태: proposed
- 날짜: 2026-07-15
- 결정: 2026-07-09 공개된 Phaser 4.2.1을 우선 후보로 정확히 고정한다. 기능 작업 전 90분 기술 스파이크를 통과해야 `accepted`로 전환한다. Phaser 4 자체의 재현 가능한 실패일 때만 정확한 Phaser 3.90.0으로 clean 전환하고 최대 60분 동안 같은 핵심 매트릭스를 다시 검증한다.
- 근거: 신규 프로젝트에서 최신 안정판을 택하는 편이 장기 유지에 유리하고, Snake는 Scene/Input/Graphics/Scale 같은 표준 API만 사용한다. 반면 4.x는 출시 직후의 새 메이저이므로 문서·타입·CI WebGL 호환성과 AI의 v3/v4 API 혼용을 실제 코드로 검증해야 한다.
- 스파이크 범위: `Scene 생성 → Graphics 보드 → 키보드 입력 → Scale.FIT → resize/blur → Vite production build → /snake-game/ base preview → Playwright console/404 검사`.
- 통과 조건: `typecheck`와 `build`가 성공하고, 지원 브라우저 스모크에서 콘솔 오류·자산 404 없이 입력과 리사이즈가 동작하며, v3 호환 API나 비공식 우회가 없다.
- 판정: `PASS_4_2_1`, `FALLBACK_CANDIDATE`, `PASS_3_90_0`, `INCONCLUSIVE`, `BLOCKED`만 사용한다.
- 후퇴 조건: 지원 환경에서 재현되고 Phaser 4 API/타입/런타임에 귀속되는 문제로 공식 문서만으로 해결할 수 없을 때 `FALLBACK_CANDIDATE`다. 네트워크, 패키지 레지스트리, Pages 권한, CI GPU/WebGL 환경 문제는 `INCONCLUSIVE` 또는 `BLOCKED`이며 버전 후퇴 근거가 아니다.
- 승인 조건: 4.2.1 또는 3.90.0 중 하나가 동일 핵심 매트릭스를 통과해야만 선택 버전과 증거를 기록하고 D-001을 `accepted`로 바꾼다. 둘 다 실패하거나 원인이 불명확하면 기능 개발을 중단한다.
- 재검토: 버전 결정 뒤에는 MVP 동안 변경하지 않는다. 버전 전환은 별도 결정과 clean scaffold 재생성으로만 수행한다.

## D-002: 프레임워크 없는 TypeScript + Vite

- 상태: proposed
- 날짜: 2026-07-15
- 결정: React/Vue 같은 UI 프레임워크 없이 TypeScript, Vite 8.1.x, 표준 DOM을 사용한다. Node.js 24.x LTS와 npm lockfile을 기준으로 한다.
- 근거: UI가 작고 상태 계약이 단순해 별도 프레임워크가 복잡도와 번들만 늘린다.

## D-003: 순수 도메인 코어

- 상태: proposed
- 날짜: 2026-07-15
- 결정: 이동, 성장, 충돌, 먹이 배치, 점수, 속도, 승패는 Phaser/DOM과 독립된 순수 TypeScript 상태 전이로 구현한다.
- 근거: 결정론적 단위 테스트, 30/60/120Hz 일관성, AI 간 파일 소유권 분리가 쉬워진다.

## D-004: 하이브리드 UI

- 상태: proposed
- 날짜: 2026-07-15
- 결정: Phaser는 정사각형 게임 보드만 렌더링하고 메뉴, HUD, 상태 알림, 일시정지/음소거/재시작, 모바일 방향 버튼은 HTML로 구현한다.
- 근거: 키보드 포커스, 스크린리더 이름, 44px 이상 터치 영역, 반응형 배치를 검증하기 쉽다.

## D-005: 이중 협업 기록

- 상태: proposed
- 날짜: 2026-07-15
- 결정: GitHub Issue/PR을 실시간 상태와 증거의 원본으로, 기본 브랜치의 문서를 승인된 계약과 장기 기록의 원본으로 사용한다.
- 근거: 여러 AI가 같은 상태 파일을 동시에 고칠 때 생기는 충돌과 채팅 컨텍스트 소실을 함께 방지한다.

## D-006: 외부 런타임 자산 없음

- 상태: proposed
- 날짜: 2026-07-15
- 결정: MVP 그래픽은 Phaser Graphics/도형과 CSS로 만들고, 효과음은 선택적으로 Web Audio로 합성한다. 외부 이미지, 폰트, 분석, 서버 API는 사용하지 않는다.
- 근거: GitHub Pages 경로, 라이선스, 네트워크 실패, 개인정보 위험을 최소화한다.
