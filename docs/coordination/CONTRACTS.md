# SG-003 공용 게임 계약

- 명세: `1.0-plan`
- task: `SG-003` revision 2
- 기준 SHA: `fd81ba9943e8b5786a0910e7172fb57c477c0d5e`
- 상태: H0b 승인을 위한 Wave 0 계약안

## 개정 이력

- revision 1: 최초 계약안.
- revision 2: 지정 Claude 리뷰의 명확화 발견을 문서로 보강했다. (1) `pause`/`resume` 도메인 진입점을 §4에 명시했고, (2) §4에서 `start`/`restart`/`returnToMenu`의 `difficulty` 출처가 `state.difficulty`임을 고정했으며, (3) §3에서 `accept`의 의미(대부분 상태 전이, `toggleMute`만 셸 처리·`GameState` 불변)를 정의했다. 세 공개 함수와 상태 불변 조건, phase×command 정책 상수, event payload, RNG·scheduler 규칙은 그대로이며 새 제품 의미가 없어 §10대로 새 ADR을 만들지 않는다.

이 문서는 SG-007이 구현할 공개 TypeScript 모양과 SG-010, SG-012, SG-013, SG-004가 공유할 동작 경계를 고정한다. 이 revision은 문서 계약만 만들며 소스 파일이나 실행 구현을 만들지 않는다. H0b 전에는 아래 계약이 `accepted` 기술 결정이나 Wave 1 구현 승인을 뜻하지 않는다.

## 1. 정확한 TypeScript 모양

아래 선언의 이름, 판별자, 필드, 배열 순서와 null 의미가 공개 계약이다. SG-007은 scaffold가 준비된 뒤 이 모양을 실제 모듈로 옮긴다. 구현 편의를 위한 공개 필드를 추가하려면 계약 revision과 리뷰가 먼저 필요하다.

```ts
export type Phase =
  | 'menu'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'gameOver'
  | 'won';

export type Direction = 'up' | 'down' | 'left' | 'right';
export type Difficulty = 'slow' | 'normal';
export type EndReason = 'wall' | 'self';

export interface Cell {
  readonly x: number;
  readonly y: number;
}

export type DirectionQueue =
  | readonly []
  | readonly [Direction]
  | readonly [Direction, Direction];

export interface GameState {
  readonly phase: Phase;
  readonly snake: readonly [Cell, ...Cell[]]; // head first
  readonly direction: Direction;
  readonly queuedDirections: DirectionQueue;
  readonly food: Cell | null;
  readonly score: number;
  readonly foodsEaten: number;
  readonly tickMs: number;
  readonly difficulty: Difficulty;
  readonly endReason: EndReason | null;
}

export type Command =
  | { readonly type: 'selectDifficulty'; readonly difficulty: Difficulty }
  | { readonly type: 'start' }
  | { readonly type: 'direction'; readonly direction: Direction }
  | { readonly type: 'pause' }
  | { readonly type: 'resume' }
  | { readonly type: 'restart' }
  | { readonly type: 'returnToMenu' }
  | { readonly type: 'toggleMute' };

export type CommandType = Command['type'];
export type CommandPolicy = 'accept' | 'validateDirection' | 'ignore';
export type PhaseCommandPolicy = Readonly<
  Record<Phase, Readonly<Record<CommandType, CommandPolicy>>>
>;

export type DomainEvent =
  | {
      readonly type: 'foodEaten';
      readonly cell: Cell;
      readonly score: number;
    }
  | {
      readonly type: 'gameEnded';
      readonly reason: EndReason;
      readonly headCell: Cell;
      readonly attemptedCell: Cell;
    }
  | {
      readonly type: 'gameWon';
      readonly score: number;
    };

export interface RandomSource {
  nextInt(upperExclusive: number): number;
}

export interface TransitionResult {
  readonly state: GameState;
  readonly events: readonly DomainEvent[];
}

export type DirectionDisposition = 'accepted' | 'rejected' | 'ignored';

export interface EnqueueDirectionResult {
  readonly state: GameState;
  readonly disposition: DirectionDisposition;
}

export type ResetPhase = 'menu' | 'ready';

export interface ResetRequest {
  readonly difficulty: Difficulty;
  readonly phase: ResetPhase;
}

export declare function reset(
  request: ResetRequest,
  randomSource: RandomSource,
): TransitionResult;

export declare function enqueueDirection(
  state: GameState,
  direction: Direction,
): EnqueueDirectionResult;

export declare function step(
  state: GameState,
  randomSource: RandomSource,
): TransitionResult;
```

`Command`는 키 이름이나 pointer event가 아니라 어댑터가 만든 의미 명령이다. `toggleMute`는 모든 phase에서 허용되지만 오디오 선호는 `GameState`가 아니므로 셸/어댑터가 처리하고 게임 snapshot은 바꾸지 않는다. scheduler의 `accumulator`도 렌더 시간 상태이므로 `GameState`에 넣지 않는다.

## 2. 상태 불변 조건

- 보드 좌표는 `0 <= x < 20`, `0 <= y < 20`인 정수다. 벽 충돌의 `attemptedCell`만 이 범위를 벗어날 수 있다.
- `snake[0]`은 항상 마지막 정상 head이며 모든 snake 셀은 서로 다르다.
- `queuedDirections`는 타입과 런타임 모두 최대 2개다. 한 tick은 첫 항목을 최대 하나만 소비한다.
- `score === foodsEaten * 10`이다.
- 느림은 시작 `220ms`, 하한 `130ms`; 기본은 시작 `160ms`, 하한 `90ms`다. 두 난이도 모두 먹이 5개마다 `10ms` 감소한다.
- 속도 공식은 `max(minTickMs, startTickMs - floor(foodsEaten / 5) * 10)`이다.
- `endReason`은 `gameOver`에서만 `wall | self`이고 다른 phase에서는 `null`이다.
- `food`는 `menu`와 `won`에서 `null`이다. `ready`, `playing`, `paused`, `gameOver`에서는 snake와 겹치지 않는 하나의 셀이다.
- `menu`, `ready`, `paused`, `gameOver`, `won`의 방향 큐는 비어 있다. 예외적으로 READY 방향 명령이 승인되는 한 번의 전이에서 결과 phase가 즉시 `playing`이 되고 승인 방향이 첫 queue 항목이 된다.
- terminal phase인 `gameOver`와 `won`에서 `step`은 같은 상태와 빈 event 목록을 반환한다. 따라서 종료 event는 한 번만 발생한다.

## 3. phase × command 정책

아래 상수가 표의 기계 판독 가능한 기준 모양이다. `validateDirection`은 phase가 방향 명령을 라우팅하되 최종 결과가 `enqueueDirection` 규칙에 따라 `accepted`, `rejected`, `ignored` 중 하나라는 뜻이다. `accept`는 라우터가 명령을 처리한다는 뜻으로 대부분 상태 전이(`reset` 또는 §4의 pause/resume 전이)를 만들지만, `toggleMute`의 `accept`만은 예외로 셸이 오디오 선호만 바꾸고 `GameState`는 그대로 둔다. `ignore`는 상태를 바꾸지 않고 event도 만들지 않는다.

```ts
export const PHASE_COMMAND_POLICY = {
  menu: {
    selectDifficulty: 'accept',
    start: 'accept',
    direction: 'ignore',
    pause: 'ignore',
    resume: 'ignore',
    restart: 'ignore',
    returnToMenu: 'ignore',
    toggleMute: 'accept',
  },
  ready: {
    selectDifficulty: 'ignore',
    start: 'ignore',
    direction: 'validateDirection',
    pause: 'ignore',
    resume: 'ignore',
    restart: 'ignore',
    returnToMenu: 'ignore',
    toggleMute: 'accept',
  },
  playing: {
    selectDifficulty: 'ignore',
    start: 'ignore',
    direction: 'validateDirection',
    pause: 'accept',
    resume: 'ignore',
    restart: 'ignore',
    returnToMenu: 'ignore',
    toggleMute: 'accept',
  },
  paused: {
    selectDifficulty: 'ignore',
    start: 'ignore',
    direction: 'ignore',
    pause: 'ignore',
    resume: 'accept',
    restart: 'ignore',
    returnToMenu: 'ignore',
    toggleMute: 'accept',
  },
  gameOver: {
    selectDifficulty: 'ignore',
    start: 'ignore',
    direction: 'ignore',
    pause: 'ignore',
    resume: 'ignore',
    restart: 'accept',
    returnToMenu: 'accept',
    toggleMute: 'accept',
  },
  won: {
    selectDifficulty: 'ignore',
    start: 'ignore',
    direction: 'ignore',
    pause: 'ignore',
    resume: 'ignore',
    restart: 'accept',
    returnToMenu: 'accept',
    toggleMute: 'accept',
  },
} as const satisfies PhaseCommandPolicy;
```

| phase | 승인 명령 | 고정 결과 |
|---|---|---|
| `menu` | `selectDifficulty`, `start`, `toggleMute` | 난이도 선택은 `menu` reset, Start는 선택 난이도의 `ready` reset, Mute는 snapshot 밖 선호 변경 |
| `ready` | `direction` 검증, `toggleMute` | Right/Up/Down만 `playing`으로 전이하며 첫 방향을 queue에 예약; Left는 역방향으로 `rejected` |
| `playing` | `direction` 검증, `pause`, `toggleMute` | 방향 enqueue, 또는 `paused` 전이 |
| `paused` | `resume`, `toggleMute` | queue가 빈 `playing`으로 전이하고 새 tick 전체를 기다림 |
| `gameOver`, `won` | `restart`, `returnToMenu`, `toggleMute` | Restart는 `ready` reset, Menu는 `menu` reset |

표에 없는 조합은 상태를 바꾸지 않고 event를 만들지 않는 `ignore`다. 키보드 Enter/Space는 `Command`가 아니다. 어댑터가 `menu`의 Start 버튼이나 terminal의 Restart 버튼을 네이티브 활성화한 경우에만 해당 의미 명령이 생긴다. 따라서 Enter/Space가 `ready`를 시작시키지 않으며, 잘못 전달된 `start`도 `ready`에서 무시된다.

window blur, `document.hidden`, 실제 세로↔가로 orientation 전환은 어댑터가 같은 `{ type: 'pause' }`를 한 번 만든다. 일반 resize는 command를 만들지 않고 relayout만 한다.

## 4. 공개 함수 경계

### `reset`

`reset`은 과거 상태를 받거나 보존하지 않는 완전 초기화다.

- 공통: 길이 3, head-first `[{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}]`, 방향 `right`, 빈 queue, 점수/섭취 수 0, 난이도 시작 `tickMs`, `endReason: null`, 빈 event 목록을 반환한다.
- `phase: 'menu'`: `food: null`이며 RNG를 호출하지 않는다.
- `phase: 'ready'`: 초기 snake를 제외한 free-cell 목록에서 음식 하나를 만들고 RNG를 정확히 한 번 호출한다.
- Start와 Restart는 `reset({ phase: 'ready', difficulty }, rng)`, Menu 진입과 menu 난이도 선택은 `reset({ phase: 'menu', difficulty }, rng)`에 대응한다. 여기서 `difficulty`는 `selectDifficulty` 명령이면 명령 payload의 값이고, payload가 없는 `start`/`restart`/`returnToMenu`는 라우터가 현재 `state.difficulty`(모든 phase가 보유)를 그대로 전달한다. 따라서 Restart는 진행 중이던 난이도를 유지한다.
- scheduler를 소유한 호출자는 reset과 함께 `accumulator = 0`으로 만든다. accumulator는 반환 상태에 추가하지 않는다.

### `enqueueDirection`

검사는 다음 순서로 고정한다.

1. phase가 `ready | playing`이 아니면 `ignored`다.
2. 비교 기준은 queue의 마지막 승인 방향이며, queue가 비었으면 `state.direction`이다.
3. 입력이 비교 기준의 정반대면 queue 용량과 무관하게 `rejected`다.
4. `playing`에서 입력이 비교 기준과 같으면 중복으로 `ignored`다.
5. queue가 이미 2개면 나머지 유효 입력도 `ignored`다.
6. 그 외에는 queue 끝에 추가하고 `accepted`다.

`ready`만 4번의 동일 방향 규칙에 예외가 있다. 초기 방향과 같은 Right는 시작 의도를 나타내므로 `accepted`이고 결과는 `phase: 'playing'`, `queuedDirections: ['right']`다. Up/Down도 같은 방식으로 승인되고 Left는 3번에서 거부된다. 방향 명령은 즉시 이동하지 않으며 첫 fixed tick이 예약 방향을 소비한다.

따라서 오른쪽 진행 중 `up -> left`는 `[up, left]`로 승인되어 두 tick에 걸쳐 적용된다. `up -> down`은 마지막 승인 예약 방향 `up`의 반대이므로 두 번째 입력이 거부된다.

### `step`

`step`은 `playing`에서만 논리 tick 하나를 계산한다. 다른 phase에서는 상태와 RNG를 건드리지 않고 `{ state, events: [] }`를 반환한다. renderer FPS, delta, accumulator는 인자로 받지 않는다.

### `pause`와 `resume`

`pause`와 `resume` 명령의 `accept`는 세 공개 도메인 함수가 아니라 application command router가 §7 규칙대로 수행하는 순수 phase·큐·accumulator 전이를 뜻한다. 이 두 전이는 RNG나 tick 계산 없이 `phase`, `queuedDirections`, scheduler `accumulator`만 바꾸고 §9의 domain 소유 game-rule 판정(충돌·food·점수·속도·승패)을 포함하지 않으므로 core 함수 밖에 두어도 경계가 유지된다.

## 5. 한 tick의 고정 순서

1. queue 앞에서 방향을 최대 하나 꺼내 이번 이동 방향으로 승인한다.
2. 마지막 정상 `headCell`과 이번 방향으로 `attemptedCell`을 계산한다.
3. `attemptedCell`의 벽 충돌을 판정한다. 충돌이면 snake/food/score를 바꾸지 않고, 이번 이동 방향을 `direction`에 보존하고 queue를 비운 뒤 `gameOver`, `endReason: 'wall'`, `gameEnded(reason: 'wall')`로 종료한다.
4. `attemptedCell`과 food가 같은지 계산해 이번 tick의 성장 여부를 고정한다.
5. 자기 충돌을 판정한다. 성장 tick은 현재 snake 전체가 충돌 대상이고, 비성장 tick은 이번에 빠질 마지막 tail 셀 하나를 제외한 snake가 충돌 대상이다. 충돌이면 이동 결과를 적용하지 않고, 이번 이동 방향을 `direction`에 보존하고 queue를 비운 뒤 `gameOver`, `endReason: 'self'`, `gameEnded(reason: 'self')`로 종료한다.
6. `attemptedCell`을 새 head로 추가한다.
7. 먹지 않았다면 기존 tail 하나를 제거한다. 먹었다면 제거하지 않아 길이가 1 증가한다.
8. 먹었다면 `foodsEaten`, `score`, 속도 공식의 `tickMs`를 정확히 한 번 갱신하고 `foodEaten` event를 만든다.
9. 먹었다면 갱신된 snake 기준 free cells를 만든다. 비어 있으면 RNG 호출 없이 `food: null`, `phase: 'won'`, 빈 queue로 바꾸고 `gameWon`을 `foodEaten` 뒤에 한 번 추가한다. 남아 있으면 새 food를 생성한다.
10. 새 불변 snapshot과 순서가 고정된 event 목록을 반환한다.

충돌 결과에서 `headCell`은 `state.snake[0]`인 마지막 정상 머리이고 `attemptedCell`은 실제 시도 좌표다. 벽이면 보드 밖일 수 있고, 자기 충돌이면 snake 셀과 같다. renderer와 UI는 이 event를 그대로 사용하며 충돌 좌표나 원인을 다시 계산하지 않는다.

```ts
declare const state: GameState;
declare const randomSource: RandomSource;

const result = step(state, randomSource);

for (const event of result.events) {
  if (event.type === 'gameEnded') {
    // event.reason: 'wall' | 'self'
    // event.headCell: 마지막 정상 머리
    // event.attemptedCell: 충돌을 일으킨 시도 좌표
  }
}
```

## 6. free-cell 음식과 RNG 계약

음식 생성은 임의 좌표 재시도 방식이 아니다.

1. 보드를 `y = 0..19`, 각 행에서 `x = 0..19`의 row-major 순서로 정확히 한 번 순회한다.
2. snake가 차지하지 않은 셀만 `freeCells`에 넣는다.
3. `freeCells.length === 0`이면 RNG를 호출하지 않고 승리한다.
4. 그 외에는 `randomSource.nextInt(freeCells.length)`를 정확히 한 번 호출해 해당 index의 셀을 선택한다.

`nextInt(n)`은 양의 정수 `n`을 받아 `0 <= result < n`인 정수를 반환해야 한다. 범위 밖 값은 RandomSource 계약 위반이며 domain이 보정하거나 modulo 처리하지 않는다. RNG가 각 index를 균등하게 반환하면 row-major free-cell 선택도 빈 셀 사이에서 균등하다.

## 7. pause와 scheduler 계약

Pause 원인이 수동 입력, blur, hidden, orientation 중 무엇이든 같은 전이를 사용한다.

- `playing -> paused`에서 `direction`과 모든 논리 셀/점수/food/tickMs는 보존한다.
- `queuedDirections`는 즉시 `[]`가 된다.
- scheduler는 같은 진입 동작에서 `accumulator = 0`으로 만든다.
- paused 중 방향 명령과 frame delta는 상태와 accumulator를 바꾸지 않는다.
- Resume은 queue가 빈 `playing`으로 바뀌며 accumulator 0에서 현재 `tickMs` 전체가 쌓일 때까지 이동하지 않는다.

fixed-step scheduler는 domain 밖에서 아래 순서를 지킨다.

```ts
if (state.phase === 'playing') {
  accumulator += Math.min(delta, 250);
}

let stepsThisFrame = 0;
while (state.phase === 'playing' && stepsThisFrame < 3) {
  const stepDuration = state.tickMs;

  if (accumulator < stepDuration) {
    break;
  }

  const result = step(state, randomSource);
  state = result.state;
  accumulator -= stepDuration;
  stepsThisFrame += 1;

  publish(result.state, result.events);
}
```

`stepDuration`은 반드시 `step` 호출 전에 캡처하고 eligibility 조건과 차감에 같은 값을 쓴다. 5번째 먹이로 `step` 결과의 `tickMs`가 줄어도 현재 차감에는 캡처한 이전 값이 쓰인다. 같은 render frame에 다음 step을 수행할 수 있다면 loop 다음 반복이 갱신된 `state.tickMs`를 새 `stepDuration`으로 캡처한다.

## 8. 결정론 증명과 작은 예제

동일한 RandomSource 구현과 seed, 동일한 초기 difficulty/phase, 동일한 들어온 command 순서를 두 실행에 제공하면 모든 command disposition, snapshot, event가 같다.

- 기저: `reset` 상수와 초기 snake가 같다. `menu` reset은 두 실행 모두 RNG를 호출하지 않고, `ready` reset은 같은 row-major free-cell 길이를 상한으로 각각 정확히 한 번 호출하므로 첫 상태가 같다.
- 귀납적 command 단계: phase, direction, queue가 같으므로 같은 명령은 같은 정책과 enqueue 검사를 거쳐 같은 상태가 된다. 무시/거부도 RNG를 소비하지 않는다.
- 귀납적 tick 단계: 같은 상태는 같은 attempted cell, 성장, 충돌, 점수와 속도를 만든다. 음식이 필요할 때만 두 실행이 같은 길이로 RNG를 정확히 한 번 호출하므로 같은 free cell을 선택한다.
- 따라서 임의 길이의 동일 command/tick 열 뒤 snapshot과 event 열이 같다. 렌더 FPS와 Canvas 상태는 이 귀납 과정에 입력되지 않는다.

```ts
declare function createSeededRandom(seed: number): RandomSource; // test fixture

const randomA = createSeededRandom(12345);
const randomB = createSeededRandom(12345);

const readyA = reset({ difficulty: 'normal', phase: 'ready' }, randomA);
const readyB = reset({ difficulty: 'normal', phase: 'ready' }, randomB);

const startA = enqueueDirection(readyA.state, 'right');
const startB = enqueueDirection(readyB.state, 'right');

// startA.state === startB.state by value:
// phase 'playing', unchanged head, queuedDirections ['right'].
// Applying the same later commands and step calls preserves equality by induction.
```

## 9. import와 소유권 경계

```text
Keyboard / DOM buttons ──semantic Command──> application command router
                                             │
                                             ├── reset / enqueueDirection
FixedStepScheduler ─────────────step────────>│   / step + injected RandomSource
                                             │
                                             └── GameState + DomainEvent
                                                  ├── Phaser BoardRenderer
                                                  └── DOM UI
```

- 미래의 `src/domain/**`는 다른 domain 모듈과 브라우저 독립적인 순수 `src/config/**` 값만 import할 수 있다.
- Phaser, DOM, Web Audio, storage, Scene, renderer, scheduler 구현은 domain을 import할 수 있지만 역방향 import는 금지한다.
- `GameState`와 `DomainEvent`에는 Phaser 객체, DOM node/event, Canvas 좌표·pixel, wall-clock timestamp, accumulator를 넣지 않는다.
- 충돌, food, 점수, 속도, 승패는 integer Cell과 순수 상태로만 판정한다. Canvas pixel 읽기나 Scene 수명 주기는 판정 근거가 아니다.
- 이 계약은 Phaser API를 하나도 사용하지 않으므로 Phaser 3/4 혼용 표면도 0이다. SG-012는 SG-002가 검증한 선택 버전 API로 얇은 adapter를 별도 구현한다.

## 10. 결정 제안 경계

이 revision은 승인된 기획과 현재 사람 지시를 타입/동작으로 구체화하며 새 제품 의미를 제안하지 않는다. 따라서 `DECISIONS.md`에 새 proposed ADR을 추가하지 않았다. 리뷰에서 board 크기, 초기 셀, command surface, event payload, RNG 호출 순서 또는 scheduler 차감 규칙을 바꿔야 한다면 임의 호환 필드를 추가하지 말고 별도 proposed ADR과 SG-003 새 revision으로 올린다.
