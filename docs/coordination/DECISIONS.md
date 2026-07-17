# 결정 기록

상태 값은 `proposed`, `accepted`, `superseded` 중 하나다. H0a는 검증 실행만 승인한다. D-001~D-006은 2026-07-17T17:18:21Z 현재 사람의 `Wave 0 종료` 지시로 H0b에서 모두 승인됐다.

## H0b 승인 기록

- 승인자: human-user
- 승인 시각: 2026-07-17T17:18:21Z (2026-07-18 Asia/Seoul)
- 승인 지시: `Wave 0 종료`
- 승인 범위: SG-001 명세, SG-002 `PASS_4_2_1` 증거와 공개된 실행 모델 편차, SG-003 revision 2 공용 계약, SG-004 revision 2 QA 계획, D-001~D-006.
- 테스트 매핑: `AC-G01~G10`, `AC-L01~L03`, `AC-U01~U09`, `AC-R01~R06` 28개가 QA 계획에 정확히 한 번씩 연결됐고 누락·중복은 0개다.
- SG-000: 고정 calibration packet, hidden oracle, 독립 채점자가 준비되지 않아 계획대로 미실행 `verified`로 닫고 기존 모델 라우팅 기준선을 유지한다.
- SG-004-DN01 해소: 음식은 snake와 겹치지 않고 성장은 `attemptedCell == food`일 때만 일어나므로, 유효한 `GameState`에서 “성장하면서 현재 tail로 진입”하는 상태는 도달 불가능하다. 계약과 제품 규칙은 바꾸지 않는다. AC-G06은 유효한 비성장 tail 진입 실행 검증과 성장-동일-tail 상태의 불가능성 증명을 함께 근거로 삼으며 invalid fixture를 만들지 않는다. 일반 비-tail 자기 충돌은 기존 QA 계획대로 AC-G07에서 별도로 검증한다.
- Frozen QA 이력: `docs/coordination/QA_PLAN.md`는 SG-004 승인 대상 SHA를 보존하기 위해 byte-for-byte 유지한다. 그 문서의 H0b·SG-004-DN01 대기 및 D-001/D-002 `proposed` 표현은 제출 당시 상태이며, 현재 상태는 이 accepted 결정 기록과 `STATUS.md`가 우선한다.
- 효과: Wave 0는 완료됐고 Wave 1의 선행 gate가 열렸다. 다만 SG-005는 별도의 승인된 task packet/Issue와 claim 뒤에만 시작하며, 이 승인은 공개 배포 권한을 포함하지 않는다.

## D-001: Phaser 4.2.1 기준선

- 상태: accepted
- 날짜: 2026-07-15
- 승인: human-user / 2026-07-17T17:18:21Z / H0b `Wave 0 종료`
- 선택 증거: SG-002의 strict TypeScript, production build, `/snake-game/` base, Chromium/WebKit production-preview 매트릭스가 `PASS_4_2_1`을 반환했고 Claude 및 Antigravity 독립 리뷰가 승인 권고했다. MVP 기준 버전은 정확히 Phaser 4.2.1이다.
- 결정: MVP 기준 버전을 정확히 Phaser 4.2.1로 고정한다. 버전 전환은 별도 결정과 clean scaffold 재생성으로만 수행한다.
- Wave 0 후보 정책(완료): Phaser 4.2.1을 우선 후보로 두고 기능 작업 전 90분 기술 스파이크를 요구했다. Phaser 4 자체의 재현 가능한 실패일 때만 정확한 Phaser 3.90.0으로 clean 전환해 같은 핵심 매트릭스를 검증하기로 했다.
- 근거: 신규 프로젝트에서 최신 안정판을 택하는 편이 장기 유지에 유리하고, Snake는 Scene/Input/Graphics/Scale 같은 표준 API만 사용한다. 반면 4.x는 출시 직후의 새 메이저이므로 문서·타입·CI WebGL 호환성과 AI의 v3/v4 API 혼용을 실제 코드로 검증해야 한다.
- 스파이크 범위: `Scene 생성 → Graphics 보드 → 키보드 입력 → Scale.FIT → resize/blur → Vite production build → /snake-game/ base preview → Playwright console/404 검사`.
- 통과 조건: `typecheck`와 `build`가 성공하고, 지원 브라우저 스모크에서 콘솔 오류·자산 404 없이 입력과 리사이즈가 동작하며, v3 호환 API나 비공식 우회가 없다.
- 판정: `PASS_4_2_1`, `FALLBACK_CANDIDATE`, `PASS_3_90_0`, `INCONCLUSIVE`, `BLOCKED`만 사용한다.
- 후퇴 조건: 지원 환경에서 재현되고 Phaser 4 API/타입/런타임에 귀속되는 문제로 공식 문서만으로 해결할 수 없을 때 `FALLBACK_CANDIDATE`다. 네트워크, 패키지 레지스트리, Pages 권한, CI GPU/WebGL 환경 문제는 `INCONCLUSIVE` 또는 `BLOCKED`이며 버전 후퇴 근거가 아니다.
- H0b 승인 충족: Phaser 4.2.1이 동일 핵심 매트릭스를 통과해 선택 버전과 증거가 기록됐다. fallback 조건은 발생하지 않았다.
- 재검토: 버전 결정 뒤에는 MVP 동안 변경하지 않는다. 버전 전환은 별도 결정과 clean scaffold 재생성으로만 수행한다.

## D-002: 프레임워크 없는 TypeScript + Vite

- 상태: accepted
- 날짜: 2026-07-15
- 승인: human-user / 2026-07-17T17:18:21Z / H0b `Wave 0 종료`
- 결정: React/Vue 같은 UI 프레임워크 없이 TypeScript, Vite 8.1.x, 표준 DOM을 사용한다. Node.js 24.x LTS와 npm lockfile을 기준으로 한다.
- 근거: UI가 작고 상태 계약이 단순해 별도 프레임워크가 복잡도와 번들만 늘린다.

## D-003: 순수 도메인 코어

- 상태: accepted
- 날짜: 2026-07-15
- 승인: human-user / 2026-07-17T17:18:21Z / H0b `Wave 0 종료`
- 결정: 이동, 성장, 충돌, 먹이 배치, 점수, 속도, 승패는 Phaser/DOM과 독립된 순수 TypeScript 상태 전이로 구현한다.
- 근거: 결정론적 단위 테스트, 30/60/120Hz 일관성, AI 간 파일 소유권 분리가 쉬워진다.

## D-004: 하이브리드 UI

- 상태: accepted
- 날짜: 2026-07-15
- 승인: human-user / 2026-07-17T17:18:21Z / H0b `Wave 0 종료`
- 결정: Phaser는 정사각형 게임 보드만 렌더링하고 메뉴, HUD, 상태 알림, 일시정지/음소거/재시작, 모바일 방향 버튼은 HTML로 구현한다.
- 근거: 키보드 포커스, 스크린리더 이름, 44px 이상 터치 영역, 반응형 배치를 검증하기 쉽다.

## D-005: 이중 협업 기록

- 상태: accepted
- 날짜: 2026-07-15
- 승인: human-user / 2026-07-17T17:18:21Z / H0b `Wave 0 종료`
- 결정: GitHub Issue/PR을 실시간 상태와 증거의 원본으로, 기본 브랜치의 문서를 승인된 계약과 장기 기록의 원본으로 사용한다. 인증된 GitHub를 사용할 수 없을 때는 같은 작업에서 GitHub 원본과 중복되지 않는 offline task YAML과 handoff Markdown을 함께 사용한다.
- 근거: 여러 AI가 같은 상태 파일을 동시에 고칠 때 생기는 충돌과 채팅 컨텍스트 소실을 함께 방지한다.

## D-006: 외부 런타임 자산 없음

- 상태: accepted
- 날짜: 2026-07-15
- 승인: human-user / 2026-07-17T17:18:21Z / H0b `Wave 0 종료`
- 결정: MVP 그래픽은 Phaser Graphics/도형과 CSS로 만들고, 효과음은 선택적으로 Web Audio로 합성한다. 외부 이미지, 폰트, 분석, 서버 API는 사용하지 않는다.
- 근거: GitHub Pages 경로, 라이선스, 네트워크 실패, 개인정보 위험을 최소화한다.
