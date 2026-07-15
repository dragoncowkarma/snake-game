# AI 협업 운영 규칙

이 문서는 Claude, Codex, Antigravity가 공통으로 따라야 하는 실행 계약이다. 특정 도구가 이 파일을 자동으로 읽는다고 가정하지 않는다. 모든 시작 프롬프트가 이 파일을 명시적으로 읽게 해야 한다.

## 1. 문서 우선순위

충돌할 때 다음 순서를 따른다.

1. 사람이 현재 작업에서 직접 내린 지시
2. `docs/coordination/DECISIONS.md`의 `accepted` 결정
3. 승인된 `docs/DEVELOPMENT_PLAN.md`
4. 위 계약 안에서 작성된 versioned GitHub Issue 또는 offline task packet의 범위와 수용 기준
5. `docs/TASKS.md`
6. 이 문서

`proposed` 결정은 권위가 없으며 승인 전 기준안일 뿐이다. 명세가 모순되거나 수용 기준을 바꿔야 하면 임의로 구현하지 말고 Issue에 `decision-needed`를 남긴다. 계약 변경은 결정 기록이 `accepted`가 된 뒤 진행한다.

## 2. 단일 진실 공급원

- **실시간 상태:** 기본은 GitHub Issue와 PR이다. 작업 상태, 담당 AI, 진행 메모, 차단 사유, 검증 증거를 기록한다.
- **GitHub 미사용 fallback:** `docs/coordination/tasks/<task-id>.yaml`이 Issue를 대체하고 `docs/coordination/handoffs/<task-id>.md`가 PR 본문을 대체한다. 같은 작업에서 GitHub와 offline 원본을 동시에 쓰지 않는다.
- **지속 가능한 상태:** 기본 브랜치의 `docs/coordination/STATUS.md`, `DECISIONS.md`와 병합된 PR의 handoff 본문이다. `STATUS.md`는 관련 Issue/PR을 링크한다.
- **조정 책임자:** 기본값은 Codex 통합 담당이다. 조정 책임자만 `STATUS.md`의 상태 표를 수정한다.
- GitHub Issue를 사용할 수 없는 환경에서는 조정 책임자가 승인된 offline task packet을 먼저 만들고, 각 AI의 구조화된 handoff를 `docs/coordination/handoffs/<task-id>.md`와 `STATUS.md`에 동기화한다.

채팅 기록만을 상태 저장소로 사용하지 않는다. 다른 AI가 재시작 후 저장소와 Issue만 읽고도 작업을 이어갈 수 있어야 한다.

## 3. 작업 시작 절차

1. 기본 브랜치 최신 상태와 열린 PR을 확인한다.
2. `AGENTS.md`, 기획서, 작업표, 상태표, 결정 기록을 읽는다.
3. GitHub Issue 또는 offline task packet에 `revision`, `approved_by`, `approved_at`이 있고 상태가 `ready`이며 선행 작업이 완료되었는지 확인한다. H0b 계약 안의 구현 세부는 조정 책임자가 승인할 수 있지만 제품 의미·공개 계약 변경은 사람이 승인한다.
4. 선택한 task 원본에 다음 한 줄 또는 동등 필드로 작업을 선점한다: `CLAIM: <agent> / <model-setting> / <branch> / <UTC time>`.
5. 상태를 `in-progress`로 바꾼 뒤 전용 브랜치에서만 작업한다.
6. 허용 파일, 금지 파일, 수용 기준, 검증 명령을 다시 적고 시작한다.

한 AI는 동시에 하나의 구현 작업만 선점한다. 60분 이상 진행 기록이 없고 명시적 handoff도 없으면 조정 책임자가 선점을 회수할 수 있다.

## 4. 브랜치, 커밋, PR

- 브랜치: `agent/<agent>/<task-id>-<slug>`
- 커밋: `<type>(<task-id>): <summary>`
- 하나의 PR은 하나의 작업 ID만 해결한다.
- `main` 직접 푸시, 강제 푸시, 생성물 `dist/` 커밋, lockfile 임의 재생성은 금지한다.
- GitHub 사용 시 PR 본문에 `docs/coordination/HANDOFF_TEMPLATE.md`의 항목을 모두 포함한다. Offline이면 같은 내용을 `docs/coordination/handoffs/<task-id>.md`에 둔다.
- 구현자와 리뷰어는 서로 다른 플랫폼이어야 하며 작업표의 리뷰어가 우선한다. 결함 발견자와 수정자가 같은 플랫폼이면 제3 플랫폼을 리뷰어로 지정한다.
- 조정 책임자는 필수 검사와 리뷰 승인을 확인한 뒤 병합한다.

## 5. 파일 소유권과 병렬 작업

| 영역 | 기본 작성자 | 기본 리뷰어 |
|---|---|---|
| 제품 명세, 문구, `src/ui/**`, 스타일, 접근성, 사용자 문서 | Claude | Antigravity |
| `src/domain/**`, `src/game/**`, 어댑터, 빌드/CI, 통합 | Codex | Claude |
| `tests/**`, 시각 회귀, 접근성·브라우저 QA 증거 | Antigravity | Codex |
| 계약 파일과 공용 타입 | Codex 통합 담당 | Claude + Antigravity |

공용 계약 파일을 바꾸는 PR이 열려 있는 동안 그 계약에 의존하는 구현을 병렬로 수정하지 않는다. 필요한 경우 조정 책임자가 짧은 계약 PR을 먼저 병합한다.

## 6. 구현 불변 조건

- 게임 규칙은 Phaser 객체와 DOM 없이 실행 가능한 순수 TypeScript에 둔다.
- 이동은 렌더 FPS와 분리된 고정 틱이다.
- 난수는 주입 가능해야 하며 테스트에서는 고정 시드를 사용한다.
- 입력 큐는 최대 2개이며 한 틱에 하나만 소비한다.
- 현재 방향 또는 마지막 승인 예약 방향의 정반대 입력을 거부한다.
- `READY`의 오른쪽 입력만 같은 방향이어도 시작으로 허용하며 Enter/Space는 READY를 시작시키지 않는다.
- 모든 pause 진입은 현재 방향만 보존하고 방향 큐와 accumulator를 비우며, 일반 resize는 pause를 일으키지 않는다.
- 가속으로 바뀐 tick 시간은 다음 step부터 사용하고 현재 step은 시작 전에 캡처한 시간으로 차감한다.
- Phaser 캔버스는 보드 렌더링을 담당하고, 메뉴·HUD·상태·모바일 버튼은 DOM을 사용한다.
- 외부 아트, 원격 폰트, 분석 SDK, 네트워크 API는 MVP에 추가하지 않는다.
- 경로를 `/`로 가정하지 않는다. GitHub Pages의 저장소 하위 경로에서 동작해야 한다.
- 저장소, 오디오, 화면 효과 실패는 게임 진행을 중단시키지 않는다.

## 7. 필수 검증과 완료 조건

작업 범위에 해당하는 검증을 수행하고 실제 결과를 handoff에 남긴다.

```text
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

명령이 아직 존재하지 않는 초기 작업이면 그 사실과 대체 검증을 기록한다. "통과할 것"이라고 추정해서는 안 된다.

완료는 다음을 모두 뜻한다.

- Issue 수용 기준과 연결된 테스트 또는 수동 증거가 있다.
- 범위 밖 변경과 알려진 실패가 없다.
- 새 의존성, 계약 변경, 위험한 가정을 설명했다.
- 문서와 실제 명령이 일치한다.
- 다른 AI가 handoff만 읽고 재현할 수 있다.

## 8. 차단 및 에스컬레이션

- 같은 원인으로 두 번 실패하면 더 큰 모델로 무작정 재시도하지 말고 실패 증거와 가설을 정리한다.
- 명세 충돌, 보안/배포 권한, 데이터 손실 가능성, 범위 증가가 필요한 경우 사람에게 올린다.
- 모델 에스컬레이션은 `docs/TASKS.md`의 규칙을 따른다.
- 출시 차단 결함은 `blocker`, 그 외는 사용자 영향과 재현성을 기준으로 `high`, `medium`, `low`를 사용한다.
